'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  MessageSquare,
  PlusCircle,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  Play,
  UserCheck,
  CalendarCheck,
  RefreshCw,
  Sparkles,
  Layers,
  LayoutGrid,
  CalendarDays,
  CalendarRange as CalendarRangeIcon,
  Tag,
  DollarSign,
  Info,
  TrendingUp,
  MapPin,
  ExternalLink,
  Coffee,
  Sun,
  Moon,
  Palmtree,
  Settings,
  Sliders,
} from 'lucide-react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { format12Hour, formatDisplayDate, formatINR } from '@/lib/utils';
import CalendarAppointmentModal from './CalendarAppointmentModal';

// Helper: Format date to YYYY-MM-DD
function toDateStr(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Parse HH:mm to minutes from midnight
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Status styling configuration
const STATUS_CONFIG = {
  CONFIRMED: {
    bg: 'bg-indigo-50/95 hover:bg-indigo-100/90 text-indigo-950',
    border: 'border-indigo-200/90 shadow-indigo-100/50',
    accent: 'bg-indigo-600',
    accentBorder: 'border-l-4 border-l-indigo-600',
    chip: 'bg-indigo-600 text-white',
    label: 'Confirmed',
    badgeVariant: 'confirmed',
  },
  BOOKED: {
    bg: 'bg-indigo-50/95 hover:bg-indigo-100/90 text-indigo-950',
    border: 'border-indigo-200/90 shadow-indigo-100/50',
    accent: 'bg-indigo-600',
    accentBorder: 'border-l-4 border-l-indigo-600',
    chip: 'bg-indigo-600 text-white',
    label: 'Booked',
    badgeVariant: 'confirmed',
  },
  WAITING: {
    bg: 'bg-amber-50/95 hover:bg-amber-100/90 text-amber-950',
    border: 'border-amber-300 ring-1 ring-amber-400/30 shadow-amber-100/50',
    accent: 'bg-amber-500',
    accentBorder: 'border-l-4 border-l-amber-500',
    chip: 'bg-amber-500 text-white',
    label: 'Waiting',
    badgeVariant: 'waiting',
  },
  ARRIVED: {
    bg: 'bg-amber-50/95 hover:bg-amber-100/90 text-amber-950',
    border: 'border-amber-300 ring-1 ring-amber-400/30 shadow-amber-100/50',
    accent: 'bg-amber-500',
    accentBorder: 'border-l-4 border-l-amber-500',
    chip: 'bg-amber-500 text-white',
    label: 'Arrived',
    badgeVariant: 'arrived',
  },
  IN_PROGRESS: {
    bg: 'bg-gradient-to-r from-amber-100/95 to-amber-50/95 hover:from-amber-100 hover:to-amber-100 text-amber-950',
    border: 'border-amber-400 ring-2 ring-amber-400/40 shadow-amber-200/50',
    accent: 'bg-amber-600 animate-pulse',
    accentBorder: 'border-l-4 border-l-amber-600',
    chip: 'bg-amber-600 text-white animate-pulse',
    label: 'In Session',
    badgeVariant: 'in_progress',
  },
  DONE: {
    bg: 'bg-emerald-50/95 hover:bg-emerald-100/90 text-emerald-950',
    border: 'border-emerald-200/90 shadow-emerald-100/50',
    accent: 'bg-emerald-600',
    accentBorder: 'border-l-4 border-l-emerald-600',
    chip: 'bg-emerald-600 text-white',
    label: 'Completed',
    badgeVariant: 'completed',
  },
  COMPLETED: {
    bg: 'bg-emerald-50/95 hover:bg-emerald-100/90 text-emerald-950',
    border: 'border-emerald-200/90 shadow-emerald-100/50',
    accent: 'bg-emerald-600',
    accentBorder: 'border-l-4 border-l-emerald-600',
    chip: 'bg-emerald-600 text-white',
    label: 'Completed',
    badgeVariant: 'completed',
  },
  CANCELLED: {
    bg: 'bg-rose-50/75 hover:bg-rose-100/70 text-rose-900',
    border: 'border-rose-200/70 opacity-75',
    accent: 'bg-rose-500',
    accentBorder: 'border-l-4 border-l-rose-500',
    chip: 'bg-rose-500 text-white',
    label: 'Cancelled',
    badgeVariant: 'cancelled',
  },
  REJECTED: {
    bg: 'bg-rose-50/75 hover:bg-rose-100/70 text-rose-900',
    border: 'border-rose-200/70 opacity-75',
    accent: 'bg-rose-500',
    accentBorder: 'border-l-4 border-l-rose-500',
    chip: 'bg-rose-500 text-white',
    label: 'Rejected',
    badgeVariant: 'rejected',
  },
  NO_SHOW: {
    bg: 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-800',
    border: 'border-slate-300/70 opacity-75',
    accent: 'bg-slate-500',
    accentBorder: 'border-l-4 border-l-slate-500',
    chip: 'bg-slate-500 text-white',
    label: 'No-Show',
    badgeVariant: 'no_show',
  },
  PENDING: {
    bg: 'bg-yellow-50/95 hover:bg-yellow-100/90 text-yellow-950',
    border: 'border-yellow-300 ring-1 ring-yellow-400/30 shadow-yellow-100/50',
    accent: 'bg-yellow-500',
    accentBorder: 'border-l-4 border-l-yellow-500',
    chip: 'bg-yellow-500 text-white',
    label: 'Pending',
    badgeVariant: 'pending',
  },
};

export default function AppointmentCalendarView({
  appointments = [],
  loading = false,
  services = [],
  availability = [], // Weekly Availability data [{ dayOfWeek, enabled, timeRanges: [{ startTime, endTime }] }]
  blockedDates = [], // Blocked Dates data [{ date, allDay, startTime, endTime, reason }]
  onDateRangeChange,
  onStatusChange,
  onOpenReschedule,
  onOpenNotes,
  onOpenCancel,
  onOpenManualModal,
  onOpenClientDrawer,
}) {
  // Navigation & View state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('week'); // 'month' | 'week' | 'day'
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('ALL');

  // Selected appointment modal state
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Month day popover for days with > 3 appointments
  const [expandedDayData, setExpandedDayData] = useState(null);

  const timeGridRef = useRef(null);
  const todayStr = useMemo(() => toDateStr(new Date()), []);

  // Fast lookup maps for weekly availability and blocked dates
  const availabilityMap = useMemo(() => {
    const map = {};
    if (Array.isArray(availability)) {
      availability.forEach((day) => {
        map[day.dayOfWeek] = day;
      });
    }
    return map;
  }, [availability]);

  const blockedDatesMap = useMemo(() => {
    const map = {};
    if (Array.isArray(blockedDates)) {
      blockedDates.forEach((b) => {
        const d = b.date ? b.date.split('T')[0] : '';
        if (d) {
          map[d] = b;
        }
      });
    }
    return map;
  }, [blockedDates]);

  // Compute dynamic minHour and maxHour based on weekly schedule
  const { minHour, maxHour } = useMemo(() => {
    let minH = 8;
    let maxH = 20;

    if (Array.isArray(availability) && availability.length > 0) {
      let foundEarly = 24;
      let foundLate = 0;
      let hasRanges = false;

      availability.forEach((day) => {
        if (day.enabled && Array.isArray(day.timeRanges)) {
          day.timeRanges.forEach((range) => {
            if (range.startTime && range.endTime) {
              const startH = Number(range.startTime.split(':')[0]);
              const endH = Math.ceil(timeToMinutes(range.endTime) / 60);
              if (!isNaN(startH) && !isNaN(endH)) {
                hasRanges = true;
                foundEarly = Math.min(foundEarly, startH);
                foundLate = Math.max(foundLate, endH);
              }
            }
          });
        }
      });

      if (hasRanges) {
        minH = Math.max(6, Math.min(8, foundEarly)); // Start at earliest shift or 8 AM
        maxH = Math.min(23, Math.max(18, foundLate)); // End at latest shift or 6 PM
      }
    }

    return { minHour: minH, maxHour: maxH };
  }, [availability]);

  const timeSlots = useMemo(() => {
    const hours = [];
    for (let h = minHour; h <= maxHour; h++) {
      hours.push(h);
    }
    return hours;
  }, [minHour, maxHour]);

  const totalMinutesInGrid = (maxHour - minHour + 1) * 60;

  // Helper: Check if a given time slot (HH:mm) is within professional's working hours on a specific date
  const isSlotInAvailability = (dateObj, hour) => {
    const dateStr = toDateStr(dateObj);
    // If date is completely blocked
    if (blockedDatesMap[dateStr]?.allDay) {
      return { isWorking: false, reason: `Blocked: ${blockedDatesMap[dateStr]?.reason || 'Leave'}` };
    }

    const dayOfWeek = dateObj.getDay();
    const dayConfig = availabilityMap[dayOfWeek];

    // If day is disabled in weekly schedule
    if (!dayConfig || !dayConfig.enabled) {
      return { isWorking: false, reason: 'Off-Duty (Weekly Off)' };
    }

    // Check if slot falls in any configured timeRange
    const slotMinStart = hour * 60;
    const slotMinEnd = (hour + 1) * 60;

    const matchedRange = (dayConfig.timeRanges || []).find((range) => {
      const rStart = timeToMinutes(range.startTime);
      const rEnd = timeToMinutes(range.endTime);
      // Overlaps if slot start < range end and slot end > range start
      return slotMinStart < rEnd && slotMinEnd > rStart;
    });

    if (matchedRange) {
      return { isWorking: true, range: matchedRange };
    }

    return { isWorking: false, reason: 'Outside Shift / Break' };
  };

  // Compute visible date ranges based on view & currentDate
  const dateRange = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (calendarView === 'month') {
      const firstDayOfMonth = new Date(year, month, 1);
      const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
      const startDate = new Date(firstDayOfMonth);
      startDate.setDate(startDate.getDate() - startDayOfWeek);

      const lastDayOfMonth = new Date(year, month + 1, 0);
      const endDayOfWeek = lastDayOfMonth.getDay();
      const endDate = new Date(lastDayOfMonth);
      endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));

      return {
        startDate: toDateStr(startDate),
        endDate: toDateStr(endDate),
        title: currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      };
    } else if (calendarView === 'week') {
      const curr = new Date(currentDate);
      const dayOfWeek = curr.getDay(); // 0 = Sun
      const start = new Date(curr);
      start.setDate(curr.getDate() - dayOfWeek);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      const startFormatted = start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const endFormatted = end.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      return {
        startDate: toDateStr(start),
        endDate: toDateStr(end),
        title: `${startFormatted} – ${endFormatted}`,
      };
    } else {
      // Day view
      const dateStr = toDateStr(currentDate);
      const title = currentDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      return {
        startDate: dateStr,
        endDate: dateStr,
        title,
      };
    }
  }, [currentDate, calendarView]);

  // Safe ref callback for parent synchronization without re-render loop
  const onDateRangeChangeRef = useRef(onDateRangeChange);
  useEffect(() => {
    onDateRangeChangeRef.current = onDateRangeChange;
  }, [onDateRangeChange]);

  useEffect(() => {
    if (onDateRangeChangeRef.current && dateRange.startDate && dateRange.endDate) {
      onDateRangeChangeRef.current(dateRange.startDate, dateRange.endDate);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (calendarView === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else if (calendarView === 'week') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (calendarView === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else if (calendarView === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter appointments locally by service & status
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // Service filter
      if (selectedServiceFilter !== 'ALL') {
        const typeId = appt.appointmentTypeId?._id || appt.appointmentTypeId;
        if (typeId !== selectedServiceFilter && appt.appointmentTypeName !== selectedServiceFilter) {
          return false;
        }
      }
      // Status filter
      if (selectedStatusFilter !== 'ALL') {
        const s = (appt.status || '').toUpperCase();
        if (selectedStatusFilter === 'LIVE' && !['WAITING', 'ARRIVED', 'IN_PROGRESS'].includes(s)) {
          return false;
        }
        if (selectedStatusFilter === 'CONFIRMED' && !['CONFIRMED', 'BOOKED'].includes(s)) {
          return false;
        }
        if (selectedStatusFilter === 'DONE' && !['DONE', 'COMPLETED'].includes(s)) {
          return false;
        }
        if (selectedStatusFilter === 'CANCELLED' && !['CANCELLED', 'REJECTED', 'NO_SHOW'].includes(s)) {
          return false;
        }
        if (selectedStatusFilter === 'PENDING' && s !== 'PENDING') {
          return false;
        }
      }
      return true;
    });
  }, [appointments, selectedServiceFilter, selectedStatusFilter]);

  // Map appointments by dateString
  const appointmentsByDate = useMemo(() => {
    const map = {};
    filteredAppointments.forEach((appt) => {
      const d = appt.dateString ? appt.dateString.split('T')[0] : 'undated';
      if (!map[d]) map[d] = [];
      map[d].push(appt);
    });
    // Sort appointments on each date by startTime
    Object.keys(map).forEach((dateKey) => {
      map[dateKey].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    });
    return map;
  }, [filteredAppointments]);

  // Handle opening appointment details
  const handleApptClick = (appt) => {
    setSelectedAppointment(appt);
    setDetailsModalOpen(true);
    setExpandedDayData(null);
  };

  // Handle quick creation trigger on empty slot click
  const handleSlotClick = (dateStr, timeStr) => {
    if (onOpenManualModal) {
      onOpenManualModal(dateStr, timeStr);
    }
  };

  // Algorithm to compute overlapping positions for a single day's appointments
  const getPositionedAppointmentsForDay = (dateStr) => {
    const dayAppts = appointmentsByDate[dateStr] || [];
    if (!dayAppts.length) return [];

    const items = dayAppts.map((appt) => {
      const startMin = timeToMinutes(appt.startTime);
      const duration = Number(appt.duration) || 30;
      const endMin = appt.endTime ? timeToMinutes(appt.endTime) : startMin + duration;
      return {
        ...appt,
        startMin,
        endMin: Math.max(endMin, startMin + 20), // Minimum 20 min display height
      };
    });

    // Group overlapping items into collision clusters
    const clusters = [];
    let currentCluster = [];
    let clusterEnd = -1;

    items.forEach((item) => {
      if (currentCluster.length === 0) {
        currentCluster.push(item);
        clusterEnd = item.endMin;
      } else {
        if (item.startMin < clusterEnd) {
          currentCluster.push(item);
          clusterEnd = Math.max(clusterEnd, item.endMin);
        } else {
          clusters.push(currentCluster);
          currentCluster = [item];
          clusterEnd = item.endMin;
        }
      }
    });
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    const positioned = [];
    clusters.forEach((cluster) => {
      const columns = [];

      cluster.forEach((item) => {
        let placed = false;
        for (let i = 0; i < columns.length; i++) {
          if (columns[i] <= item.startMin) {
            columns[i] = item.endMin;
            item.colIndex = i;
            placed = true;
            break;
          }
        }
        if (!placed) {
          item.colIndex = columns.length;
          columns.push(item.endMin);
        }
      });

      const totalCols = columns.length;
      cluster.forEach((item) => {
        item.totalCols = totalCols;
        positioned.push(item);
      });
    });

    return positioned;
  };

  // Scroll time grid near 8:30 AM or current hour on mount / view switch
  useEffect(() => {
    if (timeGridRef.current && (calendarView === 'week' || calendarView === 'day')) {
      const nowTime = new Date();
      const currentHour = nowTime.getHours();
      const targetHour = Math.max(minHour, Math.min(currentHour - 1, maxHour - 2));
      const scrollOffset = (targetHour - minHour) * 72;
      timeGridRef.current.scrollTop = scrollOffset;
    }
  }, [calendarView, minHour, maxHour]);

  // Current time line indicator
  const now = new Date();
  const currentMinutesNow = now.getHours() * 60 + now.getMinutes();
  const showCurrentTimeLine = currentMinutesNow >= minHour * 60 && currentMinutesNow <= (maxHour + 1) * 60;
  const currentTimeTopPercent = ((currentMinutesNow - minHour * 60) / totalMinutesInGrid) * 100;

  // Compute week dates array
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay(); // 0 = Sun
    const start = new Date(curr);
    start.setDate(curr.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Compute month days grid (weeks x 7 days)
  const monthWeeks = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();
    const gridStart = new Date(firstDay);
    gridStart.setDate(gridStart.getDate() - startDayOfWeek);

    const lastDay = new Date(year, month + 1, 0);
    const endDayOfWeek = lastDay.getDay();
    const gridEnd = new Date(lastDay);
    gridEnd.setDate(gridEnd.getDate() + (6 - endDayOfWeek));

    const weeks = [];
    let currentWeek = [];
    let d = new Date(gridStart);

    while (d <= gridEnd) {
      currentWeek.push(new Date(d));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      d.setDate(d.getDate() + 1);
    }
    return weeks;
  }, [currentDate]);

  // Quick metrics in visible range
  const rangeStats = useMemo(() => {
    const total = filteredAppointments.length;
    const revenue = filteredAppointments.reduce((sum, a) => sum + (Number(a.fee) || 0), 0);
    const live = filteredAppointments.filter((a) => ['WAITING', 'ARRIVED', 'IN_PROGRESS'].includes(a.status)).length;
    const confirmed = filteredAppointments.filter((a) => ['CONFIRMED', 'BOOKED'].includes(a.status)).length;
    const completed = filteredAppointments.filter((a) => ['DONE', 'COMPLETED'].includes(a.status)).length;
    return { total, revenue, live, confirmed, completed };
  }, [filteredAppointments]);

  // Current day availability summary for Day View banner
  const currentDayAvailability = useMemo(() => {
    const dateStr = toDateStr(currentDate);
    const blocked = blockedDatesMap[dateStr];
    if (blocked) {
      return {
        type: 'BLOCKED',
        label: `🌴 On Leave / Blocked: ${blocked.reason || 'Not Available'}`,
        color: 'bg-rose-50 text-rose-800 border-rose-200',
      };
    }
    const dayConfig = availabilityMap[currentDate.getDay()];
    if (!dayConfig || !dayConfig.enabled) {
      return {
        type: 'OFF',
        label: '⚪ Scheduled Rest Day (Off-Duty)',
        color: 'bg-slate-100 text-slate-700 border-slate-200',
      };
    }
    const shiftsFormatted = (dayConfig.timeRanges || [])
      .map((r) => `${format12Hour(r.startTime)} – ${format12Hour(r.endTime)}`)
      .join(', ');
    return {
      type: 'WORKING',
      label: `🕒 Scheduled Shift: ${shiftsFormatted || 'Full Day'}`,
      color: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    };
  }, [currentDate, availabilityMap, blockedDatesMap]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col transition-all">
      {/* 🧭 Top Calendar Navigation & Control Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-white space-y-4">
        {/* Row 1: Date Title, Navigation Controls, View Switcher & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Navigation Controls & Title */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-white border border-slate-200/90 rounded-2xl p-1 shadow-xs">
              <button
                onClick={handlePrev}
                title="Previous period"
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3.5 py-1.5 hover:bg-indigo-50 rounded-xl text-xs font-bold text-indigo-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Today</span>
              </button>
              <button
                onClick={handleNext}
                title="Next period"
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {dateRange.title}
              </h2>
              {loading ? (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-bold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing...</span>
                </div>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold">
                  {rangeStats.total} {rangeStats.total === 1 ? 'Booking' : 'Bookings'}
                </span>
              )}
            </div>
          </div>

          {/* Right: View Selector (Day / Week / Month) & Actions */}
          <div className="flex items-center gap-3 flex-wrap self-start lg:self-auto">
            {/* View Selector Tabs */}
            <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 shadow-2xs">
              {[
                { id: 'day', label: 'Day', icon: CalendarDays },
                { id: 'week', label: 'Week', icon: CalendarRangeIcon },
                { id: 'month', label: 'Month', icon: LayoutGrid },
              ].map((v) => {
                const IconComponent = v.icon;
                const isActive = calendarView === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setCalendarView(v.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-black/5'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{v.label}</span>
                  </button>
                );
              })}
            </div>

            <Link
              href="/dashboard/availability"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/90 shadow-2xs transition-colors"
              title="Configure working hours & shifts"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Set Shifts</span>
            </Link>

            {onOpenManualModal && (
              <button
                onClick={() => onOpenManualModal(toDateStr(currentDate), '10:00')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Walk-In Booking</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Filters Strip (Status Pills, Service Selector, Quick Metric Capsules & Availability Legend) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-200/70">
          {/* Status Filter Legend Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Status:</span>
            </span>
            {[
              { id: 'ALL', label: 'All', count: appointments.length, dot: 'bg-slate-400' },
              { id: 'LIVE', label: 'Waiting & Live', count: rangeStats.live, dot: 'bg-amber-500 animate-pulse' },
              { id: 'CONFIRMED', label: 'Confirmed', count: rangeStats.confirmed, dot: 'bg-indigo-600' },
              { id: 'DONE', label: 'Completed', count: rangeStats.completed, dot: 'bg-emerald-600' },
              { id: 'PENDING', label: 'Pending', count: appointments.filter(a => a.status === 'PENDING').length, dot: 'bg-yellow-500' },
              { id: 'CANCELLED', label: 'Cancelled', count: appointments.filter(a => ['CANCELLED', 'REJECTED', 'NO_SHOW'].includes(a.status)).length, dot: 'bg-rose-500' },
            ].map((st) => {
              const isSelected = selectedStatusFilter === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatusFilter(st.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${st.dot} ${
                      isSelected ? 'ring-2 ring-white/50' : ''
                    }`}
                  />
                  <span>{st.label}</span>
                  {st.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                        isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {st.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Service Selector & Financial Metric Capsule */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {services.length > 0 && (
              <div className="relative">
                <select
                  value={selectedServiceFilter}
                  onChange={(e) => setSelectedServiceFilter(e.target.value)}
                  className="pl-3 pr-8 py-1.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 shadow-2xs cursor-pointer appearance-none"
                >
                  <option value="ALL">All Services ({services.length})</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({formatINR(s.fee)})
                    </option>
                  ))}
                </select>
                <Tag className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs font-bold text-emerald-950 shadow-2xs">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Est. Revenue:</span>
              <span className="font-mono font-black text-emerald-700">
                {formatINR(rangeStats.revenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Availability Guide Strip */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded bg-white border border-slate-300 inline-block shadow-2xs" />
              <span>Active Working Hours</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded bg-slate-100/90 border border-slate-200 inline-block" />
              <span>Break / Off-Duty Hours</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded bg-amber-50/80 border border-amber-200 inline-block" />
              <span>🌴 Blocked Leaves</span>
            </span>
          </div>

          <span className="text-slate-400 font-medium">
            Time Grid: {format12Hour(`${String(minHour).padStart(2, '0')}:00`)} – {format12Hour(`${String(maxHour).padStart(2, '0')}:00`)}
          </span>
        </div>
      </div>

      {/* 📅 CALENDAR VIEWS BODY */}
      <div className="flex-1 min-h-[600px] relative bg-slate-50/20">
        {/* ========================================================================= */}
        {/* 1. MONTH VIEW                                                             */}
        {/* ========================================================================= */}
        {calendarView === 'month' && (
          <div className="flex flex-col h-full select-none">
            {/* Weekday Header Row */}
            <div className="grid grid-cols-7 border-b border-slate-200/90 bg-slate-50/90 text-center text-xs font-bold text-slate-600 uppercase tracking-wider py-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                const dayAvail = availabilityMap[idx];
                const isOffDay = dayAvail && !dayAvail.enabled;
                return (
                  <div
                    key={day}
                    className={`flex items-center justify-center gap-1 ${
                      isOffDay ? 'text-slate-400 font-semibold' : 'text-slate-800 font-black'
                    }`}
                  >
                    <span>{day}</span>
                    {isOffDay && <span className="text-[9px] text-slate-400 font-normal lowercase">(off)</span>}
                  </div>
                );
              })}
            </div>

            {/* Month Weeks Grid */}
            <div className="grid grid-rows-5 sm:grid-rows-6 flex-1 divide-y divide-slate-200/90 bg-slate-200/60">
              {monthWeeks.map((week, wIdx) => (
                <div
                  key={wIdx}
                  className="grid grid-cols-7 divide-x divide-slate-200/90 min-h-[115px] sm:min-h-[135px] bg-white"
                >
                  {week.map((dateObj) => {
                    const dateStr = toDateStr(dateObj);
                    const isCurrentMonth = dateObj.getMonth() === currentDate.getMonth();
                    const isToday = dateStr === todayStr;
                    const dayAppts = appointmentsByDate[dateStr] || [];
                    const hasAppts = dayAppts.length > 0;
                    const dayOfWeek = dateObj.getDay();
                    const dayAvail = availabilityMap[dayOfWeek];
                    const isDayOff = dayAvail && !dayAvail.enabled;
                    const blocked = blockedDatesMap[dateStr];

                    return (
                      <div
                        key={dateStr}
                        onClick={(e) => {
                          if (e.target === e.currentTarget) {
                            setCurrentDate(new Date(dateObj));
                            setCalendarView('day');
                          }
                        }}
                        className={`p-1.5 sm:p-2 transition-all flex flex-col justify-between group relative ${
                          blocked
                            ? 'bg-amber-50/40'
                            : isDayOff
                            ? 'bg-slate-50/70 text-slate-400'
                            : !isCurrentMonth
                            ? 'bg-slate-50/50 text-slate-400'
                            : 'bg-white hover:bg-indigo-50/20'
                        } ${isToday ? 'bg-indigo-50/40 ring-2 ring-inset ring-indigo-500/30' : ''}`}
                      >
                        {/* Day Cell Header */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setCurrentDate(new Date(dateObj));
                                setCalendarView('day');
                              }}
                              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                                isToday
                                  ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                                  : 'text-slate-700 group-hover:bg-slate-100 group-hover:text-slate-950'
                              }`}
                            >
                              {dateObj.getDate()}
                            </button>

                            {blocked && (
                              <span
                                className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 hidden sm:inline-block truncate max-w-[80px]"
                                title={`Blocked: ${blocked.reason || 'Leave'}`}
                              >
                                🌴 {blocked.reason || 'Leave'}
                              </span>
                            )}
                          </div>

                          {hasAppts ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60 hidden sm:inline-block font-mono">
                              {dayAppts.length}
                            </span>
                          ) : isDayOff ? (
                            <span className="text-[9px] font-bold text-slate-400 hidden sm:inline">
                              Off
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSlotClick(dateStr, '10:00')}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-indigo-600 hover:text-indigo-800 rounded hover:bg-indigo-50 text-[10px] font-bold"
                              title="Add appointment for this day"
                            >
                              +
                            </button>
                          )}
                        </div>

                        {/* Appointment Pills */}
                        <div className="space-y-1 flex-1 overflow-hidden">
                          {dayAppts.slice(0, 3).map((appt) => {
                            const conf = STATUS_CONFIG[appt.status] || STATUS_CONFIG.CONFIRMED;
                            return (
                              <div
                                key={appt._id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApptClick(appt);
                                }}
                                className={`px-2 py-1 rounded-xl border text-[11px] font-semibold flex items-center justify-between gap-1.5 truncate shadow-2xs transition-all hover:scale-[1.02] hover:shadow-xs cursor-pointer ${conf.bg} ${conf.border}`}
                                title={`${appt.startTime} - ${appt.customerName} (${appt.appointmentTypeName || 'Service'})`}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${conf.accent}`} />
                                  <span className="font-bold text-[10px] text-slate-900 shrink-0 font-mono">
                                    {format12Hour(appt.startTime)}
                                  </span>
                                  <span className="truncate font-bold text-slate-900">
                                    {appt.customerName}
                                  </span>
                                </div>
                                <span className="text-[9px] font-bold text-emerald-800 shrink-0 hidden sm:inline">
                                  {formatINR(appt.fee)}
                                </span>
                              </div>
                            );
                          })}

                          {dayAppts.length > 3 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedDayData({
                                  dateStr,
                                  dateObj,
                                  appointments: dayAppts,
                                });
                              }}
                              className="w-full text-center px-2 py-0.5 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-100 text-[10px] font-black text-indigo-700 transition-colors cursor-pointer"
                            >
                              +{dayAppts.length - 3} more...
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. WEEK VIEW (Availability Shaded Grid with Overlap Resolution)           */}
        {/* ========================================================================= */}
        {calendarView === 'week' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Weekdays Header Strip */}
            <div className="grid grid-cols-[64px_repeat(7,1fr)] sm:grid-cols-[74px_repeat(7,1fr)] border-b border-slate-200/90 bg-white sticky top-0 z-20 shadow-2xs">
              <div className="p-3 text-center border-r border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 mr-1" /> Time
              </div>
              {weekDays.map((d) => {
                const dStr = toDateStr(d);
                const isToday = dStr === todayStr;
                const apptCount = (appointmentsByDate[dStr] || []).length;
                const dayAvail = availabilityMap[d.getDay()];
                const isOffDay = dayAvail && !dayAvail.enabled;
                const blocked = blockedDatesMap[dStr];

                return (
                  <div
                    key={dStr}
                    onClick={() => {
                      setCurrentDate(new Date(d));
                      setCalendarView('day');
                    }}
                    className={`p-2.5 sm:p-3 text-center border-r border-slate-200/80 last:border-r-0 cursor-pointer transition-colors hover:bg-slate-50 group ${
                      isToday ? 'bg-indigo-50/70 border-b-2 border-b-indigo-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider ${
                          isOffDay ? 'text-slate-400' : 'text-slate-700'
                        }`}
                      >
                        {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                      </span>
                      {blocked && <span title={`Blocked: ${blocked.reason}`}>🌴</span>}
                    </div>

                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <span
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-black flex items-center justify-center transition-all ${
                          isToday
                            ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                            : 'text-slate-900 group-hover:bg-slate-200'
                        }`}
                      >
                        {d.getDate()}
                      </span>
                    </div>

                    {blocked ? (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full inline-block mt-1 truncate max-w-full">
                        Leave
                      </span>
                    ) : isOffDay ? (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full inline-block mt-1">
                        Off-Duty
                      </span>
                    ) : apptCount > 0 ? (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-1.5 py-0.2 rounded-full inline-block mt-1">
                        {apptCount} {apptCount === 1 ? 'slot' : 'slots'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-emerald-600 block mt-1">
                        Available
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Scrollable Time Grid */}
            <div
              ref={timeGridRef}
              className="flex-1 overflow-y-auto max-h-[700px] grid grid-cols-[64px_repeat(7,1fr)] sm:grid-cols-[74px_repeat(7,1fr)] relative bg-slate-50/40"
            >
              {/* Left Hour Gutters */}
              <div className="border-r border-slate-200/90 bg-slate-50/90 select-none">
                {timeSlots.map((hour) => (
                  <div
                    key={hour}
                    className="h-[72px] border-b border-slate-200/80 text-[11px] font-bold text-slate-400 text-right pr-2.5 pt-1.5 font-mono"
                  >
                    {format12Hour(`${String(hour).padStart(2, '0')}:00`)}
                  </div>
                ))}
              </div>

              {/* 7 Day Columns with Availability Shading & Overlapping Appointment Cards */}
              {weekDays.map((d) => {
                const dStr = toDateStr(d);
                const isToday = dStr === todayStr;
                const positionedAppts = getPositionedAppointmentsForDay(dStr);
                const blocked = blockedDatesMap[dStr];
                const dayAvail = availabilityMap[d.getDay()];
                const isDayOff = dayAvail && !dayAvail.enabled;

                return (
                  <div
                    key={dStr}
                    className={`relative border-r border-slate-200/80 last:border-r-0 ${
                      blocked
                        ? 'bg-amber-50/30'
                        : isDayOff
                        ? 'bg-slate-100/60'
                        : isToday
                        ? 'bg-indigo-50/15'
                        : 'bg-white'
                    }`}
                  >
                    {/* Hour grid lines with In-Shift / Off-Hour Shading */}
                    {timeSlots.map((hour) => {
                      const hourStr = `${String(hour).padStart(2, '0')}:00`;
                      const slotStatus = isSlotInAvailability(d, hour);
                      const isWorkingSlot = slotStatus.isWorking;

                      return (
                        <div
                          key={hour}
                          onClick={() => handleSlotClick(dStr, hourStr)}
                          className={`h-[72px] border-b border-slate-200/60 relative group transition-colors cursor-pointer ${
                            !isWorkingSlot
                              ? 'bg-slate-100/40 hover:bg-amber-50/50'
                              : 'hover:bg-indigo-50/30'
                          }`}
                          title={
                            isWorkingSlot
                              ? `Working Slot (${format12Hour(hourStr)}). Click to book walk-in.`
                              : `${slotStatus.reason || 'Outside business hours'}. Click to book exception.`
                          }
                        >
                          {/* 30-min subtle divider guide */}
                          <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-slate-200/40 pointer-events-none" />

                          {isWorkingSlot ? (
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-indigo-600 pl-1.5 pt-1 block pointer-events-none">
                              + Book {format12Hour(hourStr)}
                            </span>
                          ) : (
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-semibold text-slate-400 pl-1.5 pt-1 block pointer-events-none">
                              + Off-Duty {format12Hour(hourStr)}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Today's Red Current Time Line */}
                    {isToday && showCurrentTimeLine && (
                      <div
                        className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                        style={{ top: `${currentTimeTopPercent}%` }}
                      >
                        <div className="w-3 h-3 rounded-full bg-rose-500 -ml-1.5 shadow-md ring-2 ring-white" />
                        <div className="h-[2px] bg-rose-500 flex-1 shadow-xs" />
                      </div>
                    )}

                    {/* Positioned Appointment Cards */}
                    {positionedAppts.map((appt) => {
                      const conf = STATUS_CONFIG[appt.status] || STATUS_CONFIG.CONFIRMED;
                      const startOffsetMin = Math.max(0, appt.startMin - minHour * 60);
                      const topPercent = (startOffsetMin / totalMinutesInGrid) * 100;
                      const heightPercent = ((appt.endMin - appt.startMin) / totalMinutesInGrid) * 100;

                      const widthPercent = 100 / (appt.totalCols || 1);
                      const leftPercent = (appt.colIndex || 0) * widthPercent;

                      return (
                        <div
                          key={appt._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApptClick(appt);
                          }}
                          style={{
                            top: `${topPercent}%`,
                            height: `${Math.max(heightPercent, 2.8)}%`,
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                          className={`absolute p-1.5 sm:p-2 rounded-xl border ${conf.accentBorder} transition-all duration-200 shadow-2xs hover:shadow-lg hover:z-30 hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between ${conf.bg} ${conf.border}`}
                          title={`${appt.startTime} - ${appt.endTime}: ${appt.customerName} (${appt.appointmentTypeName})`}
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1 min-w-0">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${conf.accent}`} />
                                <span className="text-[10px] sm:text-[11px] font-black text-slate-900 truncate font-mono">
                                  {format12Hour(appt.startTime)}
                                </span>
                              </div>
                              <span className="text-[9px] font-bold text-emerald-800 bg-white/90 px-1 rounded shadow-2xs shrink-0">
                                {formatINR(appt.fee)}
                              </span>
                            </div>

                            <div className="text-[11px] font-black text-slate-900 truncate">
                              {appt.customerName}
                            </div>

                            <div className="text-[10px] font-medium text-slate-600 truncate hidden sm:block">
                              {appt.appointmentTypeName || 'Consultation'}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-1 pt-1 border-t border-black/5 mt-0.5">
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-white/90 border border-slate-200 text-slate-700">
                              {appt.duration || 30}m
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${conf.chip}`}>
                              {conf.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. DAY VIEW (Detailed Single Day Agenda & Working Shift Timeline)         */}
        {/* ========================================================================= */}
        {calendarView === 'day' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Day Header Banner with Availability Insight */}
            <div className="p-4 sm:p-5 bg-white border-b border-slate-200/90 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-20 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black shadow-xs ${
                    toDateStr(currentDate) === todayStr
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider leading-none">
                    {currentDate.toLocaleDateString('en-IN', { month: 'short' })}
                  </span>
                  <span className="text-base font-black leading-none mt-0.5">
                    {currentDate.getDate()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      {currentDate.toLocaleDateString('en-IN', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </h3>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${currentDayAvailability.color}`}
                    >
                      {currentDayAvailability.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-0.5">
                    <span>{(appointmentsByDate[toDateStr(currentDate)] || []).length} Bookings Scheduled</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">
                      {formatINR(
                        (appointmentsByDate[toDateStr(currentDate)] || []).reduce(
                          (sum, a) => sum + (Number(a.fee) || 0),
                          0
                        )
                      )}{' '}
                      Revenue
                    </span>
                  </div>
                </div>
              </div>

              {/* Day Quick Actions */}
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/availability"
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors inline-flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Edit Day Shifts</span>
                </Link>

                {onOpenManualModal && (
                  <button
                    onClick={() => onOpenManualModal(toDateStr(currentDate), '10:00')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Walk-In
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Day Time Grid */}
            <div
              ref={timeGridRef}
              className="flex-1 overflow-y-auto max-h-[720px] grid grid-cols-[74px_1fr] relative bg-slate-50/40"
            >
              {/* Left Hour Gutters */}
              <div className="border-r border-slate-200/90 bg-slate-50/90 select-none">
                {timeSlots.map((hour) => (
                  <div
                    key={hour}
                    className="h-[84px] border-b border-slate-200/80 text-xs font-bold text-slate-400 text-right pr-3 pt-2 font-mono"
                  >
                    {format12Hour(`${String(hour).padStart(2, '0')}:00`)}
                  </div>
                ))}
              </div>

              {/* Day Column with Wide Detailed Cards & Working Hours Guides */}
              <div className="relative bg-white min-h-[1050px]">
                {/* Hour grid lines with 30-min dashed line & In-Shift styling */}
                {timeSlots.map((hour) => {
                  const hourStr = `${String(hour).padStart(2, '0')}:00`;
                  const slotStatus = isSlotInAvailability(currentDate, hour);
                  const isWorkingSlot = slotStatus.isWorking;

                  return (
                    <div
                      key={hour}
                      onClick={() => handleSlotClick(toDateStr(currentDate), hourStr)}
                      className={`h-[84px] border-b border-slate-100 transition-colors cursor-pointer relative group ${
                        !isWorkingSlot
                          ? 'bg-slate-50/50 hover:bg-amber-50/40'
                          : 'hover:bg-indigo-50/20'
                      }`}
                      title={
                        isWorkingSlot
                          ? `Working Hour (${format12Hour(hourStr)}). Click to schedule walk-in.`
                          : `${slotStatus.reason || 'Off-Duty Hour'}. Click to schedule exception.`
                      }
                    >
                      <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-slate-100 pointer-events-none" />

                      {isWorkingSlot ? (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-indigo-600 pl-3 pt-2 block pointer-events-none">
                          + Schedule Walk-In at {format12Hour(hourStr)} (Working Shift)
                        </span>
                      ) : (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-slate-400 pl-3 pt-2 block pointer-events-none">
                          + Schedule Walk-In at {format12Hour(hourStr)} (Outside Shift)
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Today's Current Time Line */}
                {toDateStr(currentDate) === todayStr && showCurrentTimeLine && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                    style={{ top: `${currentTimeTopPercent}%` }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-rose-500 -ml-1.5 shadow-md ring-2 ring-white" />
                    <div className="h-[2px] bg-rose-500 flex-1 shadow-xs" />
                  </div>
                )}

                {/* Day Appointment Cards with Overlap Handling */}
                {getPositionedAppointmentsForDay(toDateStr(currentDate)).map((appt) => {
                  const conf = STATUS_CONFIG[appt.status] || STATUS_CONFIG.CONFIRMED;
                  const startOffsetMin = Math.max(0, appt.startMin - minHour * 60);
                  const topPercent = (startOffsetMin / totalMinutesInGrid) * 100;
                  const heightPercent = ((appt.endMin - appt.startMin) / totalMinutesInGrid) * 100;

                  const widthPercent = 100 / (appt.totalCols || 1);
                  const leftPercent = (appt.colIndex || 0) * widthPercent;

                  return (
                    <div
                      key={appt._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApptClick(appt);
                      }}
                      style={{
                        top: `${topPercent}%`,
                        height: `${Math.max(heightPercent, 4.0)}%`,
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                      className={`absolute p-3.5 rounded-2xl border ${conf.accentBorder} transition-all duration-150 shadow-xs hover:shadow-xl hover:z-30 hover:scale-[1.005] cursor-pointer flex flex-col justify-between ${conf.bg} ${conf.border}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`w-2 h-2 rounded-full ${conf.accent}`} />
                            <span className="text-sm font-black text-slate-900 font-mono">
                              {format12Hour(appt.startTime)} – {format12Hour(appt.endTime)}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/90 border border-slate-200 text-slate-700 shadow-2xs">
                              {appt.appointmentCode}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${conf.chip}`}>
                              {conf.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200/80 text-slate-800 flex items-center justify-center font-black text-xs shrink-0">
                              {appt.customerName ? appt.customerName.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <h4 className="text-sm font-black text-slate-950 truncate">
                              {appt.customerName}
                            </h4>
                          </div>

                          <p className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                            <span>{appt.appointmentTypeName || 'General Consultation'}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold">{formatINR(appt.fee)}</span>
                            <span>•</span>
                            <span>{appt.duration || 30} mins</span>
                          </p>

                          {appt.reason && (
                            <p className="text-xs text-slate-500 italic line-clamp-1">
                              &ldquo;{appt.reason}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Direct Contact & Drawer triggers */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {appt.customerPhone && (
                            <a
                              href={`tel:${appt.customerPhone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
                              title="Call client"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApptClick(appt);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 text-indigo-700 text-xs font-bold shadow-2xs transition-colors"
                          >
                            Details & Actions →
                          </button>
                        </div>
                      </div>

                      {/* Bottom Quick Status Advance Toolbar */}
                      <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-black/5 mt-2 flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{appt.customerPhone || 'No phone'}</span>
                        </span>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {['CONFIRMED', 'BOOKED'].includes(appt.status) && onStatusChange && (
                            <button
                              onClick={() => onStatusChange(appt._id, 'WAITING')}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-2xs transition-colors"
                            >
                              Mark Arrived
                            </button>
                          )}
                          {['CONFIRMED', 'WAITING', 'ARRIVED'].includes(appt.status) && onStatusChange && (
                            <button
                              onClick={() => onStatusChange(appt._id, 'IN_PROGRESS')}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-2xs transition-colors"
                            >
                              Start Session
                            </button>
                          )}
                          {['IN_PROGRESS'].includes(appt.status) && onStatusChange && (
                            <button
                              onClick={() => onStatusChange(appt._id, 'DONE')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-colors"
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 📋 Popover Modal for Expanded Day in Month View */}
      {expandedDayData && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {formatDisplayDate(expandedDayData.dateStr, true)}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  {expandedDayData.appointments.length} Total Appointments on this day
                </p>
              </div>
              <button
                onClick={() => setExpandedDayData(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {expandedDayData.appointments.map((appt) => {
                const conf = STATUS_CONFIG[appt.status] || STATUS_CONFIG.CONFIRMED;
                return (
                  <div
                    key={appt._id}
                    onClick={() => handleApptClick(appt)}
                    className={`p-3 rounded-2xl border transition-all hover:shadow-md cursor-pointer flex items-center justify-between gap-3 ${conf.bg} ${conf.border}`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${conf.accent}`} />
                        <span className="text-xs font-black text-slate-900 font-mono">
                          {format12Hour(appt.startTime)} – {format12Hour(appt.endTime)}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate">{appt.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">
                        {appt.appointmentTypeName || 'Consultation'} • {formatINR(appt.fee)}
                      </div>
                    </div>

                    <Badge status={appt.status} />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  handleSlotClick(expandedDayData.dateStr, '10:00');
                  setExpandedDayData(null);
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                + Add Booking
              </button>
              <button
                onClick={() => {
                  setCurrentDate(expandedDayData.dateObj);
                  setCalendarView('day');
                  setExpandedDayData(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Open in Full Day View →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 Calendar Appointment Details Modal */}
      <CalendarAppointmentModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        appointment={selectedAppointment}
        onStatusChange={onStatusChange}
        onOpenReschedule={onOpenReschedule}
        onOpenNotes={onOpenNotes}
        onOpenCancel={onOpenCancel}
        onOpenClientDrawer={onOpenClientDrawer}
      />
    </div>
  );
}
