'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Search,
  Phone,
  MessageSquare,
  RefreshCw,
  FileText,
  Download,
  PlusCircle,
  User,
  CalendarCheck,
  UserCheck,
  UserX,
  Play,
  CheckCircle2,
  CalendarRange,
  LayoutGrid,
  List,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  X,
  AlertCircle,
  Sparkles,
  CreditCard,
  Building,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { appointmentService } from '@/services/appointment.service';
import { appointmentTypeService } from '@/services/appointmentType.service';
import { format12Hour, formatDisplayDate, formatINR } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import ManualBookingModal from '@/components/dashboard/ManualBookingModal';
import UserAppointmentsView from '@/components/dashboard/UserAppointmentsView';
import { connectSocket } from '@/lib/socket';
import { invalidateQuery } from '@/lib/queryCache';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const isProfessional = (user?.role || '').toUpperCase() === 'PROFESSIONAL';

  // If not a professional, render dedicated customer appointments view
  if (!isProfessional) {
    return <UserAppointmentsView user={user} />;
  }

  const searchParams = useSearchParams();
  const urlTab = searchParams ? searchParams.get('tab') : null;
  const [tab, setTab] = useState(urlTab || 'today');

  useEffect(() => {
    if (urlTab) {
      setTab(urlTab);
    }
  }, [urlTab]);

  const [search, setSearch] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' | 'table'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Private notes modal
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Reschedule modal
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: '',
    newTime: '',
    appointmentTypeId: '',
  });
  const [rescheduling, setRescheduling] = useState(false);

  // Walk-In Modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [manualForm, setManualForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    appointmentTypeId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    reason: '',
    fee: 500,
    duration: 30,
    bookingSource: 'WALK_IN',
    markAsArrived: false,
  });
  const [creatingManual, setCreatingManual] = useState(false);

  useEffect(() => {
    fetchAppointments();
    loadServices();

    const socket = connectSocket();
    if (socket) {
      const handleSocketUpdate = () => {
        fetchAppointments();
      };

      socket.on('appointment:created', handleSocketUpdate);
      socket.on('appointment:confirmed', handleSocketUpdate);
      socket.on('appointment:rejected', handleSocketUpdate);
      socket.on('appointment:cancelled', handleSocketUpdate);
      socket.on('appointment:rescheduled', handleSocketUpdate);
      socket.on('appointment:completed', handleSocketUpdate);

      return () => {
        socket.off('appointment:created', handleSocketUpdate);
        socket.off('appointment:confirmed', handleSocketUpdate);
        socket.off('appointment:rejected', handleSocketUpdate);
        socket.off('appointment:cancelled', handleSocketUpdate);
        socket.off('appointment:rescheduled', handleSocketUpdate);
        socket.off('appointment:completed', handleSocketUpdate);
      };
    }
  }, [tab]);

  const loadServices = async () => {
    try {
      const res = await appointmentTypeService.getAppointmentTypes();
      setServices(res.data || []);
      if (res.data?.length > 0) {
        setManualForm((prev) => ({
          ...prev,
          appointmentTypeId: res.data[0]._id,
          fee: res.data[0].fee,
          duration: res.data[0].duration,
        }));
      }
    } catch (e) {}
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments({ tab, search });
      setAppointments(res.data?.appointments || []);
    } catch (e) {
      console.error('Error fetching appointments:', e);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  const handleStatusChange = async (id, newStatus, reason = '') => {
    try {
      await appointmentService.updateStatus(id, newStatus, reason);
      invalidateQuery('professional:stats');
      const actionName =
        newStatus === 'DONE' || newStatus === 'COMPLETED'
          ? 'marked as completed'
          : `updated to ${newStatus.toLowerCase().replace(/_/g, ' ')}`;
      toast.success(`Appointment ${actionName}!`);
      fetchAppointments();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error updating status');
    }
  };

  const openNotesModal = (appt) => {
    setSelectedAppt(appt);
    setNotesText(appt.notes || '');
    setNotesModalOpen(true);
  };

  const saveNotes = async () => {
    if (!selectedAppt) return;
    setSavingNotes(true);
    try {
      await appointmentService.updateNotes(selectedAppt._id, notesText);
      toast.success('Private notes saved successfully!');
      setNotesModalOpen(false);
      fetchAppointments();
    } catch (e) {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const openCancelModal = (appt) => {
    setSelectedAppt(appt);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedAppt) return;
    setCancelling(true);
    try {
      await appointmentService.cancelAppointment(selectedAppt._id, cancelReason);
      invalidateQuery('professional:stats');
      toast.success('Appointment cancelled successfully.');
      setCancelModalOpen(false);
      fetchAppointments();
    } catch (e) {
      toast.error('Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const openRescheduleModal = (appt) => {
    setSelectedAppt(appt);
    setRescheduleForm({
      newDate: appt.dateString,
      newTime: appt.startTime,
      appointmentTypeId: appt.appointmentTypeId || services[0]?._id || '',
    });
    setRescheduleModalOpen(true);
  };

  const confirmReschedule = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setRescheduling(true);
    try {
      await appointmentService.rescheduleAppointment(selectedAppt._id, rescheduleForm);
      invalidateQuery('professional:stats');
      toast.success('Appointment rescheduled successfully!');
      setRescheduleModalOpen(false);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setRescheduling(false);
    }
  };

  const handleCreateManualBooking = async (e) => {
    e.preventDefault();
    if (!manualForm.customerName || !manualForm.customerPhone) {
      toast.warning('Please enter customer name and mobile number');
      return;
    }

    setCreatingManual(true);
    try {
      await appointmentService.createManualBooking(manualForm);
      toast.success('Walk-in booking created successfully!');
      setManualModalOpen(false);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setCreatingManual(false);
    }
  };

  const onServiceChange = (typeId) => {
    const s = services.find((srv) => srv._id === typeId);
    if (s) {
      setManualForm((prev) => ({
        ...prev,
        appointmentTypeId: s._id,
        fee: s.fee,
        duration: s.duration,
      }));
    }
  };

  // Filter appointments locally by service & optional single date
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // Service filter
      if (selectedServiceFilter !== 'ALL') {
        const typeId = appt.appointmentTypeId?._id || appt.appointmentTypeId;
        if (typeId !== selectedServiceFilter && appt.appointmentTypeName !== selectedServiceFilter) {
          return false;
        }
      }
      // Date filter
      if (selectedDateFilter) {
        const apptDate = (appt.dateString || '').split('T')[0];
        if (apptDate !== selectedDateFilter) {
          return false;
        }
      }
      return true;
    });
  }, [appointments, selectedServiceFilter, selectedDateFilter]);

  // Group filtered appointments by dateString
  const groupedAppointments = useMemo(() => {
    const groups = {};
    filteredAppointments.forEach((appt) => {
      const dateKey = appt.dateString ? appt.dateString.split('T')[0] : 'Unscheduled';
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(appt);
    });

    // Sort dates
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'Unscheduled') return 1;
      if (b === 'Unscheduled') return -1;
      return tab === 'past' ? b.localeCompare(a) : a.localeCompare(b);
    });

    return sortedKeys.map((dateKey) => {
      // Sort within each day by startTime
      const sortedList = [...groups[dateKey]].sort((a, b) =>
        (a.startTime || '').localeCompare(b.startTime || '')
      );
      const totalRevenue = sortedList.reduce((sum, item) => sum + (Number(item.fee) || 0), 0);
      return {
        dateKey,
        items: sortedList,
        totalRevenue,
      };
    });
  }, [filteredAppointments, tab]);

  // Quick Metrics
  const metrics = useMemo(() => {
    const total = filteredAppointments.length;
    const waiting = filteredAppointments.filter((a) =>
      ['WAITING', 'ARRIVED', 'IN_PROGRESS'].includes(a.status)
    ).length;
    const confirmed = filteredAppointments.filter((a) =>
      ['CONFIRMED', 'BOOKED', 'PENDING'].includes(a.status)
    ).length;
    const completed = filteredAppointments.filter((a) =>
      ['DONE', 'COMPLETED'].includes(a.status)
    ).length;
    return { total, waiting, confirmed, completed };
  }, [filteredAppointments]);

  // Helper for Date headers (Today, Tomorrow, Yesterday, Day Name)
  const getDateHeaderInfo = (dateKey) => {
    if (dateKey === 'Unscheduled') {
      return {
        isSpecial: false,
        badgeText: 'Flexible / Undated',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        displayTitle: 'Unscheduled Bookings',
        subTitle: 'Dates not yet locked',
      };
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const tom = new Date(now);
    tom.setDate(tom.getDate() + 1);
    const tomorrowStr = tom.toISOString().split('T')[0];

    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const yesterdayStr = yest.toISOString().split('T')[0];

    const isToday = dateKey === todayStr;
    const isTomorrow = dateKey === tomorrowStr;
    const isYesterday = dateKey === yesterdayStr;

    let badgeText = null;
    let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';

    if (isToday) {
      badgeText = 'TODAY';
      badgeColor = 'bg-emerald-500 text-white font-black shadow-xs';
    } else if (isTomorrow) {
      badgeText = 'TOMORROW';
      badgeColor = 'bg-indigo-600 text-white font-black shadow-xs';
    } else if (isYesterday) {
      badgeText = 'YESTERDAY';
      badgeColor = 'bg-slate-600 text-white font-bold';
    }

    return {
      isToday,
      isTomorrow,
      isYesterday,
      badgeText,
      badgeColor,
      displayTitle: formatDisplayDate(dateKey, true),
      subTitle: new Date(dateKey + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long' }),
    };
  };

  const exportToCSV = () => {
    if (!filteredAppointments.length) {
      toast.info('No appointments available to export');
      return;
    }

    const headers = [
      'Appointment Code',
      'Client Name',
      'Phone',
      'Email',
      'Date (YYYY-MM-DD)',
      'Start Time',
      'End Time',
      'Source',
      'Service',
      'Fee (INR)',
      'Status',
      'Reason',
    ];

    const rows = filteredAppointments.map((a) => [
      `"${a.appointmentCode || ''}"`,
      `"${a.customerName || ''}"`,
      `"${a.customerPhone || ''}"`,
      `"${a.customerEmail || ''}"`,
      `"${a.dateString || ''}"`,
      `"${a.startTime || ''}"`,
      `"${a.endTime || ''}"`,
      `"${a.bookingSource || 'ONLINE'}"`,
      `"${a.appointmentTypeName || 'Consultation'}"`,
      a.fee || 0,
      `"${a.status || ''}"`,
      `"${(a.reason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `appointments-${tab}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* 🌟 Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-indigo-200 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Practice Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Appointment Operations
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 mt-1 max-w-xl">
            Clear, date-organized schedule across Online, Walk-in, and WhatsApp bookings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap relative z-10">
          <button
            onClick={() => setManualModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Add Walk-In
          </button>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>

          <button
            onClick={fetchAppointments}
            title="Refresh appointments"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 📊 Quick Insight Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Bookings</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">In selected view</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/70 bg-amber-50/20 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Waiting / Live</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{metrics.waiting}</div>
          <div className="text-[11px] text-amber-700/80 mt-0.5">At clinic / in-session</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-200/70 bg-indigo-50/20 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Upcoming / Confirmed</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{metrics.confirmed}</div>
          <div className="text-[11px] text-indigo-700/80 mt-0.5">Ready for consultation</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/20 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Completed</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.completed}</div>
          <div className="text-[11px] text-emerald-700/80 mt-0.5">Finished sessions</div>
        </div>
      </div>

      {/* 🎛️ Navigation Tabs & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
        {/* Row 1: Status Category Tabs + View Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
            {[
              { id: 'today', label: "Today's Schedule", countTag: tab === 'today' ? filteredAppointments.length : null },
              { id: 'queue', label: 'Waiting Queue', countTag: tab === 'queue' ? filteredAppointments.length : null },
              { id: 'upcoming', label: 'Upcoming Days' },
              { id: 'past', label: 'Past History' },
              { id: 'cancelled', label: 'Cancelled & No-Show' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setSelectedDateFilter('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                  tab === t.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{t.label}</span>
                {t.countTag !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      tab === t.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {t.countTag}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Timeline vs Table */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end lg:self-auto shrink-0">
            <button
              onClick={() => setViewMode('grouped')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grouped'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Date Timeline</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Compact Ledger</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search Bar + Service Filter + Specific Date Filter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by client name, mobile (+91), or appointment code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Service filter */}
            <select
              value={selectedServiceFilter}
              onChange={(e) => setSelectedServiceFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer min-w-[140px]"
            >
              <option value="ALL">All Services</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Specific Date Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="date"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
                title="Filter by exact date"
              />
              {selectedDateFilter && (
                <button
                  onClick={() => setSelectedDateFilter('')}
                  title="Clear date filter"
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 📅 Main Appointments Content Area */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-20 flex flex-col items-center justify-center gap-3 text-slate-400 shadow-xs">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-bold text-slate-700">Syncing appointment ledger...</p>
          <p className="text-xs text-slate-400">Loading slots, client statuses, and payment records</p>
        </div>
      ) : groupedAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <CalendarRange className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-900">No appointments found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {search || selectedDateFilter || selectedServiceFilter !== 'ALL'
              ? 'No bookings match your active search or date filters. Try clearing your filters.'
              : `There are currently no appointments under the "${tab}" tab.`}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            {(search || selectedDateFilter || selectedServiceFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedDateFilter('');
                  setSelectedServiceFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => setManualModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              + Add Walk-In Booking
            </button>
          </div>
        </div>
      ) : viewMode === 'grouped' ? (
        /* ============================================================ */
        /* 1. DATE-GROUPED TIMELINE VIEW (Super Clear & High-Usability)  */
        /* ============================================================ */
        <div className="space-y-8">
          {groupedAppointments.map((group) => {
            const dateInfo = getDateHeaderInfo(group.dateKey);

            return (
              <div key={group.dateKey} className="space-y-3.5">
                {/* 📌 Date Header Badge Banner */}
                <div
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3 rounded-2xl border ${
                    dateInfo.isToday
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : dateInfo.isTomorrow
                      ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                      : 'bg-slate-100/90 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        dateInfo.isToday
                          ? 'bg-emerald-500 text-white'
                          : dateInfo.isTomorrow
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-black tracking-tight text-slate-900">
                          {dateInfo.displayTitle}
                        </h2>
                        {dateInfo.badgeText && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${dateInfo.badgeColor}`}>
                            {dateInfo.badgeText}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500">{dateInfo.subTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs font-bold px-3 py-1 rounded-xl bg-white border border-slate-200/80 text-slate-700 shadow-2xs">
                      {group.items.length} {group.items.length === 1 ? 'Appointment' : 'Appointments'}
                    </span>
                    {group.totalRevenue > 0 && (
                      <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-100/80 border border-emerald-200 text-emerald-800">
                        {formatINR(group.totalRevenue)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 📋 Appointment Cards for this Date */}
                <div className="grid grid-cols-1 gap-3.5">
                  {group.items.map((appt) => {
                    const isCompleted = ['DONE', 'COMPLETED'].includes(appt.status);
                    const isCancelled = ['CANCELLED', 'REJECTED', 'NO_SHOW'].includes(appt.status);
                    const isLive = ['IN_PROGRESS', 'WAITING', 'ARRIVED'].includes(appt.status);

                    // Clean phone number for WhatsApp URL
                    const cleanPhone = (appt.customerPhone || '').replace(/\D/g, '');
                    const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
                      `Hello ${appt.customerName}, this is regarding your appointment (${appt.appointmentCode}) on ${formatDisplayDate(
                        appt.dateString
                      )} at ${format12Hour(appt.startTime)}.`
                    )}`;

                    return (
                      <div
                        key={appt._id}
                        className={`bg-white rounded-2xl border transition-all duration-150 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs hover:shadow-md ${
                          isLive
                            ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/10'
                            : isCompleted
                            ? 'border-slate-200/80 bg-slate-50/40 opacity-90'
                            : isCancelled
                            ? 'border-slate-200 bg-rose-50/10 opacity-70'
                            : 'border-slate-200/90 hover:border-indigo-200'
                        }`}
                      >
                        {/* Section 1: Time Block & Client Details */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                          {/* Time Badge Block */}
                          <div className="flex sm:flex-col items-center justify-between sm:justify-center p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-indigo-950 shrink-0 min-w-[130px] text-center">
                            <div className="text-sm sm:text-base font-black tracking-tight text-indigo-900 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>{format12Hour(appt.startTime)}</span>
                            </div>
                            <div className="text-[11px] font-semibold text-indigo-600/80 mt-0.5">
                              to {format12Hour(appt.endTime)}
                            </div>
                            <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-indigo-100 text-indigo-700 mt-1">
                              {appt.duration || 30} mins
                            </div>
                          </div>

                          {/* Client Info & Services */}
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-slate-900 text-base">
                                {appt.customerName}
                              </span>

                              {/* Appointment Code */}
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                {appt.appointmentCode}
                              </span>

                              {/* Source Badge */}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  appt.bookingSource === 'WALK_IN'
                                    ? 'bg-purple-100 text-purple-800'
                                    : appt.bookingSource === 'PHONE'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {appt.bookingSource === 'WALK_IN'
                                  ? 'Walk-In'
                                  : appt.bookingSource === 'PHONE'
                                  ? 'Phone'
                                  : 'Online'}
                              </span>
                            </div>

                            {/* Contact Links: Phone & WhatsApp */}
                            <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                              <a
                                href={`tel:${appt.customerPhone}`}
                                className="inline-flex items-center gap-1 hover:text-indigo-600 font-medium transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{appt.customerPhone}</span>
                              </a>

                              {cleanPhone && (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold transition-colors bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]"
                                  title="Send WhatsApp message"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}

                              {appt.customerEmail && (
                                <span className="text-slate-400 text-[11px] truncate max-w-[180px]">
                                  • {appt.customerEmail}
                                </span>
                              )}
                            </div>

                            {/* Service, Fee, and Note preview */}
                            <div className="flex items-center gap-2 flex-wrap pt-0.5">
                              <span className="text-xs font-bold text-slate-800">
                                {appt.appointmentTypeName || 'Consultation'}
                              </span>
                              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                {formatINR(appt.fee)}
                              </span>

                              {appt.reason && (
                                <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-xs" title={appt.reason}>
                                  Reason: {appt.reason}
                                </span>
                              )}

                              {appt.notes && (
                                <span
                                  onClick={() => openNotesModal(appt)}
                                  className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1 cursor-pointer hover:bg-indigo-100"
                                  title="View private clinical notes"
                                >
                                  <FileText className="w-3 h-3" /> Private Note
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Status & Quick Operations Actions */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                          {/* Status Badge */}
                          <div>
                            <Badge status={appt.status} />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Accept Pending */}
                            {appt.status === 'PENDING' && (
                              <button
                                onClick={() => handleStatusChange(appt._id, 'CONFIRMED')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                              >
                                Accept Booking
                              </button>
                            )}

                            {/* Mark Arrived / Waiting */}
                            {['CONFIRMED', 'BOOKED'].includes(appt.status) && (
                              <button
                                onClick={() => handleStatusChange(appt._id, 'WAITING')}
                                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <UserCheck className="w-3.5 h-3.5" /> Arrived
                              </button>
                            )}

                            {/* Start Consultation */}
                            {['CONFIRMED', 'WAITING', 'ARRIVED', 'BOOKED'].includes(appt.status) && (
                              <button
                                onClick={() => handleStatusChange(appt._id, 'IN_PROGRESS')}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <Play className="w-3.5 h-3.5" /> Start
                              </button>
                            )}

                            {/* Complete Consultation */}
                            {['IN_PROGRESS', 'CONFIRMED', 'WAITING', 'ARRIVED', 'BOOKED'].includes(appt.status) && (
                              <button
                                onClick={() => handleStatusChange(appt._id, 'DONE')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Done
                              </button>
                            )}

                            {/* Reschedule */}
                            {!isCompleted && !isCancelled && (
                              <button
                                onClick={() => openRescheduleModal(appt)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                                title="Reschedule Date & Time"
                              >
                                Reschedule
                              </button>
                            )}

                            {/* Private Notes button */}
                            <button
                              onClick={() => openNotesModal(appt)}
                              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                                appt.notes
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                              }`}
                              title={appt.notes ? 'Edit Private Notes' : 'Add Private Notes'}
                            >
                              <FileText className="w-4 h-4" />
                            </button>

                            {/* Cancel */}
                            {!isCompleted && !isCancelled && (
                              <button
                                onClick={() => openCancelModal(appt)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                                title="Cancel appointment"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ============================================================ */
        /* 2. COMPACT TABLE LEDGER VIEW (Clean & Date Grouped Partition) */
        /* ============================================================ */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Date & Time</th>
                  <th className="py-3.5 px-5">Client / Customer</th>
                  <th className="py-3.5 px-4">Service & Fee</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {groupedAppointments.map((group) => {
                  const dateInfo = getDateHeaderInfo(group.dateKey);

                  return (
                    <div key={group.dateKey} className="contents">
                      {/* Subheader Date Row in Table */}
                      <tr className="bg-slate-100/70 border-y border-slate-200/90 font-bold text-slate-800">
                        <td colSpan={6} className="py-2.5 px-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                              <span className="font-black text-slate-900">{dateInfo.displayTitle}</span>
                              <span className="text-[11px] font-medium text-slate-500">
                                ({dateInfo.subTitle})
                              </span>
                              {dateInfo.badgeText && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded ${dateInfo.badgeColor}`}>
                                  {dateInfo.badgeText}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-semibold">
                              {group.items.length} {group.items.length === 1 ? 'Booking' : 'Bookings'} •{' '}
                              {formatINR(group.totalRevenue)}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {group.items.map((appt) => (
                        <tr key={appt._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{format12Hour(appt.startTime)}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              to {format12Hour(appt.endTime)} ({appt.duration || 30}m)
                            </div>
                          </td>

                          <td className="py-3.5 px-5">
                            <div className="font-bold text-slate-900">{appt.customerName}</div>
                            <div className="text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="font-medium">{appt.customerPhone}</span>
                              <span className="text-[10px] font-mono text-indigo-600">
                                {appt.appointmentCode}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">
                              {appt.appointmentTypeName || 'Consultation'}
                            </div>
                            <div className="font-bold text-emerald-600 mt-0.5">
                              {formatINR(appt.fee)}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {appt.bookingSource || 'ONLINE'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <Badge status={appt.status} />
                          </td>

                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <button
                                onClick={() => openNotesModal(appt)}
                                title="Private Notes"
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  appt.notes
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                                }`}
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              {appt.status === 'PENDING' && (
                                <button
                                  onClick={() => handleStatusChange(appt._id, 'CONFIRMED')}
                                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                                >
                                  Accept
                                </button>
                              )}

                              {['CONFIRMED', 'BOOKED'].includes(appt.status) && (
                                <button
                                  onClick={() => handleStatusChange(appt._id, 'WAITING')}
                                  className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg font-bold text-[11px] cursor-pointer"
                                >
                                  Arrived
                                </button>
                              )}

                              {['CONFIRMED', 'WAITING', 'ARRIVED', 'BOOKED'].includes(appt.status) && (
                                <button
                                  onClick={() => handleStatusChange(appt._id, 'IN_PROGRESS')}
                                  className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                                >
                                  Start
                                </button>
                              )}

                              {['IN_PROGRESS', 'CONFIRMED', 'WAITING', 'ARRIVED', 'BOOKED'].includes(appt.status) && (
                                <button
                                  onClick={() => handleStatusChange(appt._id, 'DONE')}
                                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs"
                                >
                                  Done
                                </button>
                              )}

                              {!['DONE', 'COMPLETED', 'CANCELLED', 'REJECTED'].includes(appt.status) && (
                                <>
                                  <button
                                    onClick={() => openRescheduleModal(appt)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] cursor-pointer"
                                  >
                                    Reschedule
                                  </button>
                                  <button
                                    onClick={() => openCancelModal(appt)}
                                    className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-[11px] cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </div>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🔄 Reschedule Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title={`Reschedule: ${selectedAppt?.customerName} (${selectedAppt?.appointmentCode})`}
      >
        <form onSubmit={confirmReschedule} className="space-y-4">
          <p className="text-xs text-slate-500">
            Select a new appointment date and time. The system will verify slot availability automatically before updating.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Date"
              type="date"
              required
              value={rescheduleForm.newDate}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })}
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                New Time (HH:mm) <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={rescheduleForm.newTime}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, newTime: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Service Type
            </label>
            <select
              value={rescheduleForm.appointmentTypeId}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, appointmentTypeId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.duration} mins • ₹{s.fee})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setRescheduleModalOpen(false)}>
              Keep Existing
            </Button>
            <Button type="submit" size="sm" loading={rescheduling}>
              Confirm Reschedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* 📝 Private Clinical Notes Modal */}
      <Modal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        title={`Private Notes: ${selectedAppt?.customerName} (${selectedAppt?.appointmentCode})`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            These notes are strictly private to you. They will never be shared with or shown to the client.
          </p>

          <textarea
            rows={5}
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Write clinical observations, prescription history, case follow-up notes, or client discussion points..."
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setNotesModalOpen(false)}>
              Close
            </Button>
            <Button size="sm" loading={savingNotes} onClick={saveNotes}>
              Save Private Notes
            </Button>
          </div>
        </div>
      </Modal>

      {/* ❌ Cancel Appointment Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title={`Cancel Appointment: ${selectedAppt?.appointmentCode}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to cancel the booking for{' '}
            <strong>{selectedAppt?.customerName}</strong> on{' '}
            {selectedAppt && formatDisplayDate(selectedAppt.dateString)}?
          </p>

          <Input
            label="Cancellation Reason (Optional)"
            placeholder="e.g. Professional unavailable, Client requested cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep Appointment
            </Button>
            <Button variant="danger" size="sm" loading={cancelling} onClick={confirmCancel}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* 🚶 Walk-In Booking Modal */}
      <ManualBookingModal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        manualForm={manualForm}
        setManualForm={setManualForm}
        services={services}
        onServiceChange={onServiceChange}
        onSubmit={handleCreateManualBooking}
        creatingManual={creatingManual}
      />
    </div>
  );
}
