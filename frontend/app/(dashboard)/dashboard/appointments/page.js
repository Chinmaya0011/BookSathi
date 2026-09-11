'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Search,
  Phone,
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

export default function AppointmentsPage() {
  const { user } = useAuth();
  const isProfessional = (user?.role || '').toUpperCase() === 'PROFESSIONAL';

  // If not a professional, render dedicated customer appointments view
  if (!isProfessional) {
    return <UserAppointmentsView user={user} />;
  }

  const searchParams = useSearchParams();
  const urlTab = searchParams ? searchParams.get('tab') : null;
  const [tab, setTab] = useState(urlTab || 'upcoming');

  useEffect(() => {
    if (urlTab) {
      setTab(urlTab);
    }
  }, [urlTab]);

  const [search, setSearch] = useState('');
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
      toast.success(`Appointment status updated to ${newStatus.toLowerCase()}!`);
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

  const exportToCSV = () => {
    if (!appointments.length) {
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

    const rows = appointments.map((a) => [
      `"${a.appointmentCode}"`,
      `"${a.customerName}"`,
      `"${a.customerPhone}"`,
      `"${a.customerEmail || ''}"`,
      `"${a.dateString}"`,
      `"${a.startTime}"`,
      `"${a.endTime}"`,
      `"${a.bookingSource || 'ONLINE'}"`,
      `"${a.appointmentTypeName || 'Consultation'}"`,
      a.fee || 0,
      `"${a.status}"`,
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Appointment Ledger & Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Unified calendar across Online, Walk-in, and Phone bookings with real-time sync.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={() => setManualModalOpen(true)}>
            Add Walk-In
          </Button>

          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>

          <button
            onClick={fetchAppointments}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'today', label: "Today's" },
            { id: 'queue', label: 'Waiting Queue' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'past', label: 'Past' },
            { id: 'cancelled', label: 'Cancelled & No-Show' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                tab === t.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <Input
            placeholder="Search by name, phone, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            className="py-2 text-xs"
          />
        </form>
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-xs font-semibold">Loading appointments...</p>
          </div>
        ) : appointments.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Client / Customer</th>
                    <th className="py-3.5 px-6">Date & Time</th>
                    <th className="py-3.5 px-6">Source</th>
                    <th className="py-3.5 px-6">Service & Fee</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {appointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-sm">{appt.customerName}</div>
                        <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{appt.customerPhone}</span>
                        </div>
                        <div className="text-[10px] font-mono text-indigo-600 mt-1">
                          Code: {appt.appointmentCode}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">
                          {formatDisplayDate(appt.dateString)}
                        </div>
                        <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {format12Hour(appt.startTime)} - {format12Hour(appt.endTime)}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {appt.bookingSource || 'ONLINE'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800">
                          {appt.appointmentTypeName || 'Consultation'}
                        </div>
                        <div className="text-slate-500 mt-0.5">{formatINR(appt.fee)}</div>
                        {appt.reason && (
                          <div className="text-[11px] text-slate-500 bg-slate-100 p-1.5 rounded-md mt-1.5 max-w-xs truncate">
                            {appt.reason}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <Badge status={appt.status} />
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">

                          <button
                            onClick={() => openNotesModal(appt)}
                            title="Add private notes"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Accept / Confirm for Pending */}
                          {appt.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusChange(appt._id, 'CONFIRMED')}
                              title="Accept Appointment"
                              className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
                            >
                              Accept
                            </button>
                          )}

                          {/* Reschedule Button */}
                          {['CONFIRMED', 'PENDING', 'ARRIVED', 'WAITING', 'RESCHEDULE_REQUESTED'].includes(appt.status) && (
                            <button
                              onClick={() => openRescheduleModal(appt)}
                              title="Reschedule Appointment"
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Reschedule
                            </button>
                          )}

                          {/* Mark Arrived / Waiting */}
                          {appt.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusChange(appt._id, 'WAITING')}
                              title="Mark Arrived / Waiting"
                              className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Arrived
                            </button>
                          )}

                          {/* Start */}
                          {['CONFIRMED', 'WAITING', 'ARRIVED'].includes(appt.status) && (
                            <button
                              onClick={() => handleStatusChange(appt._id, 'IN_PROGRESS')}
                              title="Start Consultation"
                              className="px-2.5 py-1 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Start
                            </button>
                          )}

                          {/* Complete */}
                          {appt.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleStatusChange(appt._id, 'COMPLETED')}
                              title="Complete Consultation"
                              className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Done
                            </button>
                          )}

                          {/* Cancel */}
                          {['CONFIRMED', 'PENDING', 'WAITING', 'ARRIVED', 'RESCHEDULE_REQUESTED'].includes(appt.status) && (
                            <button
                              onClick={() => openCancelModal(appt)}
                              title="Cancel"
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {appointments.map((appt) => (
                <div key={appt._id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{format12Hour(appt.startTime)}</span>
                      <span className="text-[10px] text-indigo-400 font-normal">
                        • {formatDisplayDate(appt.dateString)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {appt.appointmentCode}
                      </span>
                      <Badge status={appt.status} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{appt.customerName}</h4>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <span className="font-medium text-slate-700 truncate">
                        {appt.appointmentTypeName || 'Consultation'}
                      </span>
                      <span className="font-bold text-slate-900 shrink-0">{formatINR(appt.fee)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
                    {appt.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(appt._id, 'CONFIRMED')}
                        className="flex-1 inline-flex items-center justify-center py-2 px-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs"
                      >
                        Accept
                      </button>
                    )}

                    {appt.status === 'IN_PROGRESS' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(appt._id, 'COMPLETED')}
                        className="flex-1 inline-flex items-center justify-center py-2 px-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-12 sm:p-16 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No appointments found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no appointments matching your selected tab ({tab}) or search filter.
            </p>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title={`Reschedule: ${selectedAppt?.customerName} (${selectedAppt?.appointmentCode})`}
      >
        <form onSubmit={confirmReschedule} className="space-y-4">
          <p className="text-xs text-slate-500">
            Select a new appointment date and time. The system will verify conflict protection automatically before updating.
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

      {/* Private Notes Modal */}
      <Modal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        title={`Private Notes: ${selectedAppt?.customerName} (${selectedAppt?.appointmentCode})`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            These notes are strictly private to you. They will never be shown to the client.
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

      {/* Cancel Appointment Modal */}
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

      {/* Walk-In Booking Modal */}
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
