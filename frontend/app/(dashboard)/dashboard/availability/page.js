'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Clock,
  Plus,
  Trash2,
  Copy,
  Save,
  Check,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Calendar,
  AlertCircle,
  Sun,
  Moon,
  Info,
  Timer,
  CalendarDays,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Layers,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { availabilityService } from '@/services/availability.service';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

const DAYS = [
  { index: 1, name: 'Monday', short: 'Mon' },
  { index: 2, name: 'Tuesday', short: 'Tue' },
  { index: 3, name: 'Wednesday', short: 'Wed' },
  { index: 4, name: 'Thursday', short: 'Thu' },
  { index: 5, name: 'Friday', short: 'Fri' },
  { index: 6, name: 'Saturday', short: 'Sat' },
  { index: 0, name: 'Sunday', short: 'Sun' },
];

const SHIFT_TEMPLATES = [
  {
    id: 'STANDARD_9_5',
    label: '9:00 AM – 5:00 PM',
    tag: 'Full Day (8 hrs)',
    icon: Sun,
    ranges: [{ startTime: '09:00', endTime: '17:00' }],
  },
  {
    id: 'SPLIT_MORNING_EVENING',
    label: '9:00 AM – 1:00 PM & 5:00 PM – 8:00 PM',
    tag: 'Morning + Evening Split (7 hrs)',
    icon: Sparkles,
    ranges: [
      { startTime: '09:00', endTime: '13:00' },
      { startTime: '17:00', endTime: '20:00' },
    ],
  },
  {
    id: 'SPLIT_9_12_1_5',
    label: '9:00 AM – 12:00 PM & 1:00 PM – 5:00 PM',
    tag: 'Lunch Break Shift (7 hrs)',
    icon: Sparkles,
    ranges: [
      { startTime: '09:00', endTime: '12:00' },
      { startTime: '13:00', endTime: '17:00' },
    ],
  },
  {
    id: 'EXTENDED_10_7',
    label: '10:00 AM – 7:00 PM',
    tag: 'Late Morning to Evening (9 hrs)',
    icon: Sun,
    ranges: [{ startTime: '10:00', endTime: '19:00' }],
  },
  {
    id: 'EVENING_5_9',
    label: '5:00 PM – 9:00 PM',
    tag: 'Evening Consultations (4 hrs)',
    icon: Moon,
    ranges: [{ startTime: '17:00', endTime: '21:00' }],
  },
];

function format12HourPreview(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function calculateShiftHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [h1, m1] = startTime.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);
  const diffMins = h2 * 60 + m2 - (h1 * 60 + m1);
  return diffMins > 0 ? (diffMins / 60).toFixed(1) : 0;
}

export default function AvailabilityPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // State
  const [availability, setAvailability] = useState([]);
  const [selectedShiftPreset, setSelectedShiftPreset] = useState('STANDARD_9_5');

  // Custom Time Popup Modal State
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customShifts, setCustomShifts] = useState([
    { startTime: '09:00', endTime: '12:00' },
    { startTime: '13:00', endTime: '17:00' },
  ]);
  const [targetDaysMode, setTargetDaysMode] = useState('ALL_OPEN'); // 'ALL_OPEN' | 'WEEKDAYS' | 'CUSTOM'
  const [targetSpecificDays, setTargetSpecificDays] = useState([1, 2, 3, 4, 5]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && user && user.role !== 'PROFESSIONAL') {
      router.replace('/dashboard');
      return;
    }
    if (user?.role === 'PROFESSIONAL') {
      loadInitialData();
    }
  }, [user, authLoading, router]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const availRes = await availabilityService.getWeeklyAvailability();
      const existing = availRes.data || [];
      const fullList = DAYS.map((d) => {
        const found = existing.find((item) => item.dayOfWeek === d.index);
        return (
          found || {
            dayOfWeek: d.index,
            enabled: d.index !== 0,
            timeRanges: d.index !== 0 ? [{ startTime: '09:00', endTime: '17:00' }] : [],
          }
        );
      });
      setAvailability(fullList);
    } catch (e) {
      console.error('Failed to load availability:', e);
      toast.error('Failed to load availability schedule');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Working Days Quick Presets
  const handleDaysPreset = (type) => {
    setAvailability((prev) =>
      prev.map((d) => {
        let isEnabled = false;
        if (type === 'WEEKDAYS') isEnabled = d.dayOfWeek >= 1 && d.dayOfWeek <= 5; // Mon-Fri
        else if (type === 'MON_SAT') isEnabled = d.dayOfWeek !== 0; // Mon-Sat
        else if (type === 'ALL') isEnabled = true; // Mon-Sun

        const currentRanges = d.timeRanges?.length
          ? d.timeRanges
          : [{ startTime: '09:00', endTime: '17:00' }];

        return {
          ...d,
          enabled: isEnabled,
          timeRanges: isEnabled ? currentRanges : [],
        };
      })
    );
    toast.success(
      `Updated active working days to ${
        type === 'WEEKDAYS' ? 'Mon – Fri' : type === 'MON_SAT' ? 'Mon – Sat' : 'All 7 Days'
      }`
    );
  };

  // Toggle individual day
  const handleToggleDay = (dayIndex) => {
    setAvailability((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek === dayIndex) {
          const nextEnabled = !day.enabled;
          return {
            ...day,
            enabled: nextEnabled,
            timeRanges:
              nextEnabled && (!day.timeRanges || day.timeRanges.length === 0)
                ? [{ startTime: '09:00', endTime: '17:00' }]
                : day.timeRanges,
          };
        }
        return day;
      })
    );
  };

  // Step 3: Shift / Hours Template Apply
  const handleApplyShiftPreset = (preset) => {
    setSelectedShiftPreset(preset.id);
    setAvailability((prev) =>
      prev.map((d) => {
        if (d.enabled) {
          return {
            ...d,
            timeRanges: JSON.parse(JSON.stringify(preset.ranges)),
          };
        }
        return d;
      })
    );
    toast.success(`Applied "${preset.label}" to all active days!`);
  };

  // Custom Modal Handlers
  const openCustomModal = () => {
    // Pre-populate with first enabled day's shifts or default
    const firstEnabledDay = availability.find((d) => d.enabled && d.timeRanges?.length > 0);
    if (firstEnabledDay && firstEnabledDay.timeRanges?.length > 0) {
      setCustomShifts(JSON.parse(JSON.stringify(firstEnabledDay.timeRanges)));
    } else {
      setCustomShifts([
        { startTime: '09:00', endTime: '13:00' },
        { startTime: '17:00', endTime: '20:00' },
      ]);
    }
    setCustomModalOpen(true);
  };

  const handleAddCustomModalShift = () => {
    const lastRange = customShifts[customShifts.length - 1];
    let start = '17:00';
    let end = '20:00';
    if (lastRange && lastRange.endTime) {
      const [h] = lastRange.endTime.split(':').map(Number);
      const nextH = Math.min(h + 1, 21);
      start = `${String(nextH).padStart(2, '0')}:00`;
      end = `${String(Math.min(nextH + 3, 23)).padStart(2, '0')}:00`;
    }
    setCustomShifts((prev) => [...prev, { startTime: start, endTime: end }]);
  };

  const handleRemoveCustomModalShift = (idx) => {
    if (customShifts.length <= 1) {
      toast.warning('You must keep at least 1 working shift');
      return;
    }
    setCustomShifts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCustomModalTimeChange = (idx, field, value) => {
    setCustomShifts((prev) =>
      prev.map((shift, i) => (i === idx ? { ...shift, [field]: value } : shift))
    );
  };

  const handleToggleTargetSpecificDay = (dayIndex) => {
    setTargetSpecificDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handleApplyCustomModalShifts = (e) => {
    if (e) e.preventDefault();

    // Validation
    for (const shift of customShifts) {
      if (!shift.startTime || !shift.endTime) {
        toast.warning('Please specify both start and end times for all shifts');
        return;
      }
      if (shift.startTime >= shift.endTime) {
        toast.warning(
          `Start time (${shift.startTime}) must be earlier than end time (${shift.endTime})`
        );
        return;
      }
    }

    setAvailability((prev) =>
      prev.map((d) => {
        let shouldApply = false;
        if (targetDaysMode === 'ALL_OPEN') shouldApply = d.enabled;
        else if (targetDaysMode === 'WEEKDAYS') shouldApply = d.dayOfWeek >= 1 && d.dayOfWeek <= 5;
        else if (targetDaysMode === 'CUSTOM') shouldApply = targetSpecificDays.includes(d.dayOfWeek);

        if (shouldApply) {
          return {
            ...d,
            enabled: true,
            timeRanges: JSON.parse(JSON.stringify(customShifts)),
          };
        }
        return d;
      })
    );

    setSelectedShiftPreset('CUSTOM_MODAL');
    setCustomModalOpen(false);
    toast.success('Custom working hours applied to selected days!');
  };

  // Day Schedule Customization Handlers
  const handleAddRange = (dayIndex) => {
    setAvailability((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek === dayIndex) {
          const lastRange = day.timeRanges?.[day.timeRanges.length - 1];
          let start = '17:00';
          let end = '20:00';
          if (lastRange && lastRange.endTime) {
            const [h] = lastRange.endTime.split(':').map(Number);
            const nextH = Math.min(h + 1, 21);
            start = `${String(nextH).padStart(2, '0')}:00`;
            end = `${String(Math.min(nextH + 3, 23)).padStart(2, '0')}:00`;
          }
          return {
            ...day,
            timeRanges: [...(day.timeRanges || []), { startTime: start, endTime: end }],
          };
        }
        return day;
      })
    );
  };

  const handleRemoveRange = (dayIndex, rangeIdx) => {
    setAvailability((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek === dayIndex) {
          const updated = [...day.timeRanges];
          updated.splice(rangeIdx, 1);
          return {
            ...day,
            timeRanges: updated,
            enabled: updated.length > 0,
          };
        }
        return day;
      })
    );
  };

  const handleTimeChange = (dayIndex, rangeIdx, field, value) => {
    setAvailability((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek === dayIndex) {
          const updated = [...day.timeRanges];
          updated[rangeIdx] = { ...updated[rangeIdx], [field]: value };
          return { ...day, timeRanges: updated };
        }
        return day;
      })
    );
  };

  const handleCopyMonday = () => {
    const monday = availability.find((d) => d.dayOfWeek === 1);
    if (!monday || !monday.enabled) {
      toast.warning('Please enable and set Monday working hours first');
      return;
    }

    setAvailability((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek >= 2 && d.dayOfWeek <= 5) {
          return {
            ...d,
            enabled: monday.enabled,
            timeRanges: JSON.parse(JSON.stringify(monday.timeRanges || [])),
          };
        }
        return d;
      })
    );
    toast.success('Monday working hours copied to Tue – Fri!');
  };

  // Save All
  const handleSave = async () => {
    // Validate
    for (const day of availability) {
      if (day.enabled && day.timeRanges && day.timeRanges.length > 0) {
        const dayObj = DAYS.find((d) => d.index === day.dayOfWeek);
        const dayName = dayObj ? dayObj.name : `Day ${day.dayOfWeek}`;
        for (const range of day.timeRanges) {
          if (!range.startTime || !range.endTime) {
            toast.warning(`Please provide both start and end times for ${dayName}`);
            return;
          }
          if (range.startTime >= range.endTime) {
            toast.warning(
              `On ${dayName}, start time (${range.startTime}) must be earlier than end time (${range.endTime})`
            );
            return;
          }
        }
      }
    }

    setSaving(true);
    try {
      const sanitizedPayload = availability.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        enabled: Boolean(d.enabled),
        timeRanges:
          d.enabled && Array.isArray(d.timeRanges)
            ? d.timeRanges.map((r) => ({
                startTime: r.startTime,
                endTime: r.endTime,
              }))
            : [],
      }));

      await availabilityService.updateWeeklyAvailability(sanitizedPayload);

      toast.success('Consultation working schedule and availability saved successfully!');
      await loadInitialData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save availability settings');
    } finally {
      setSaving(false);
    }
  };

  // Computed summary
  const totalWeeklyHours = useMemo(() => {
    let total = 0;
    for (const d of availability) {
      if (d.enabled && d.timeRanges) {
        for (const r of d.timeRanges) {
          total += Number(calculateShiftHours(r.startTime, r.endTime));
        }
      }
    }
    return total.toFixed(1);
  }, [availability]);

  const activeDaysCount = useMemo(() => {
    return availability.filter((d) => d.enabled && d.timeRanges?.length > 0).length;
  }, [availability]);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            <span>Consultation Working Hours & Availability</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure your active working days and daily consultation shift hours in 2 easy steps.
          </p>
        </div>

        <Button size="sm" loading={saving} onClick={handleSave}>
          <Save className="w-3.5 h-3.5 mr-1" /> Save Working Hours
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Working Days
          </span>
          <p className="text-2xl font-black text-slate-900">{activeDaysCount} Days</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Active per week</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Hours
          </span>
          <p className="text-2xl font-black text-slate-900">{totalWeeklyHours} hrs</p>
          <span className="text-[11px] text-indigo-600 font-semibold">Weekly working time</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Shift Preset
          </span>
          <p className="text-sm font-black text-slate-900 truncate">
            {selectedShiftPreset === 'STANDARD_9_5'
              ? '9:00 AM – 5:00 PM'
              : selectedShiftPreset === 'SPLIT_MORNING_EVENING'
              ? 'Split Shifts'
              : selectedShiftPreset === 'SPLIT_9_12_1_5'
              ? 'Lunch Break Shift'
              : selectedShiftPreset === 'EXTENDED_10_7'
              ? '10:00 AM – 7:00 PM'
              : selectedShiftPreset === 'EVENING_5_9'
              ? '5:00 PM – 9:00 PM'
              : 'Custom Shifts'}
          </p>
          <span className="text-[11px] text-indigo-600 font-semibold">Shift structure</span>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block mb-1">
            Service Timings
          </span>
          <p className="text-xs text-indigo-950 font-medium">
            Slot durations (15m, 20m, 30m, 60m) are configured directly on your Services page.
          </p>
        </div>
      </div>

      {/* STEP 1: Choose Working Days */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-sm shadow-indigo-600/30">
              1
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Which days are you open for bookings?
              </h3>
              <p className="text-xs text-slate-500">
                Click any day to turn it On or Off, or use 1-click presets.
              </p>
            </div>
          </div>

          {/* Quick Days Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleDaysPreset('WEEKDAYS')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              📅 Mon – Fri (Weekdays)
            </button>
            <button
              type="button"
              onClick={() => handleDaysPreset('MON_SAT')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              📅 Mon – Sat (6 Days)
            </button>
            <button
              type="button"
              onClick={() => handleDaysPreset('ALL')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              📅 All 7 Days
            </button>
          </div>
        </div>

        {/* Interactive Day Selector Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5">
          {DAYS.map((d) => {
            const dayConfig = availability.find((a) => a.dayOfWeek === d.index) || { enabled: false };
            const isEnabled = dayConfig.enabled;

            return (
              <button
                key={d.index}
                type="button"
                onClick={() => handleToggleDay(d.index)}
                className={cn(
                  'p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 shadow-2xs',
                  isEnabled
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25 scale-[1.02]'
                    : 'bg-slate-50/80 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                )}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black">{d.name}</span>
                  {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className={cn('text-[10px] font-semibold uppercase tracking-wider', isEnabled ? 'text-indigo-100' : 'text-slate-400')}>
                  {isEnabled ? 'Open' : 'Closed'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Working Hours / Shifts */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-sm shadow-indigo-600/30">
              2
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                What are your consultation working hours?
              </h3>
              <p className="text-xs text-slate-500">
                Pick a popular hours template or open the custom time popup to add shifts and breaks.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCustomModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>⚙️ Custom Time Popup...</span>
          </button>
        </div>

        {/* Popular Working Hours Cards & Custom Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SHIFT_TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            const isSelected = selectedShiftPreset === tmpl.id;

            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleApplyShiftPreset(tmpl)}
                className={cn(
                  'p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between group shadow-2xs',
                  isSelected
                    ? 'bg-indigo-50/90 border-indigo-600 text-indigo-950 ring-2 ring-indigo-600/25 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black text-slate-900">{tmpl.label}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block font-medium">{tmpl.tag}</span>
                </div>
                <div className="shrink-0 pt-0.5">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100/80 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    Apply
                  </span>
                </div>
              </button>
            );
          })}

          {/* Custom Time Card with Popup Trigger */}
          <button
            type="button"
            onClick={openCustomModal}
            className={cn(
              'p-4 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/40 hover:bg-indigo-100/60 hover:border-indigo-500 text-left transition-all cursor-pointer flex items-start justify-between group shadow-2xs',
              selectedShiftPreset === 'CUSTOM_MODAL' && 'ring-2 ring-indigo-600/25 bg-indigo-50/80 border-solid border-indigo-600'
            )}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-black text-indigo-950">⚙️ Custom Shift Times...</span>
              </div>
              <span className="text-[11px] text-indigo-700/80 block font-medium">
                Add custom start/end times & lunch breaks in popup
              </span>
            </div>
            <div className="shrink-0 pt-0.5">
              <span className="text-[10px] font-bold text-white bg-indigo-600 px-2.5 py-1 rounded-lg shadow-xs group-hover:scale-105 transition-transform">
                Open Popup
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* DETAILED SCHEDULE TIMELINE & INDIVIDUAL DAY CUSTOMIZER */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-black flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-400" />
              <span>Day-by-Day Schedule Customizer</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Fine-tune shift hours, add lunch breaks, or split shifts for specific days.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyMonday}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-300" />
            <span>Copy Mon to Weekdays (Tue–Fri)</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 p-2 sm:p-4">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="text-xs font-medium">Loading schedule...</p>
            </div>
          ) : (
            DAYS.map((d) => {
              const dayConfig = availability.find((a) => a.dayOfWeek === d.index) || {
                enabled: false,
                timeRanges: [],
              };

              const dayHours = dayConfig.enabled
                ? dayConfig.timeRanges
                    ?.reduce((acc, r) => acc + Number(calculateShiftHours(r.startTime, r.endTime)), 0)
                    .toFixed(1)
                : 0;

              return (
                <div
                  key={d.index}
                  className={cn(
                    'p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all rounded-2xl',
                    dayConfig.enabled ? 'bg-white hover:bg-slate-50/50' : 'bg-slate-50/40 opacity-60'
                  )}
                >
                  {/* Day Header & Switch */}
                  <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-48 shrink-0">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`day-detail-${d.index}`}
                        checked={dayConfig.enabled}
                        onChange={() => handleToggleDay(d.index)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <div>
                        <label
                          htmlFor={`day-detail-${d.index}`}
                          className={cn(
                            'text-sm font-bold cursor-pointer select-none block',
                            dayConfig.enabled ? 'text-slate-900' : 'text-slate-400'
                          )}
                        >
                          {d.name}
                        </label>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {dayConfig.enabled ? `${dayHours} hrs active` : 'Closed'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full border sm:hidden',
                        dayConfig.enabled
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      )}
                    >
                      {dayConfig.enabled ? 'OPEN' : 'CLOSED'}
                    </span>
                  </div>

                  {/* Time Ranges */}
                  <div className="flex-1 space-y-3 w-full">
                    {dayConfig.enabled ? (
                      <>
                        {dayConfig.timeRanges?.map((range, rangeIdx) => (
                          <div
                            key={rangeIdx}
                            className="flex items-center gap-2 flex-wrap bg-slate-50/90 p-2.5 rounded-2xl border border-slate-200/80"
                          >
                            <div className="flex items-center gap-1.5">
                              <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <input
                                type="time"
                                value={range.startTime}
                                onChange={(e) =>
                                  handleTimeChange(d.index, rangeIdx, 'startTime', e.target.value)
                                }
                                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                              />
                              <span className="text-[11px] text-slate-500 font-semibold px-1">
                                ({format12HourPreview(range.startTime)})
                              </span>
                            </div>

                            <span className="text-xs text-slate-400 font-bold">to</span>

                            <div className="flex items-center gap-1.5">
                              <Moon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <input
                                type="time"
                                value={range.endTime}
                                onChange={(e) =>
                                  handleTimeChange(d.index, rangeIdx, 'endTime', e.target.value)
                                }
                                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                              />
                              <span className="text-[11px] text-slate-500 font-semibold px-1">
                                ({format12HourPreview(range.endTime)})
                              </span>
                            </div>

                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg ml-auto">
                              {calculateShiftHours(range.startTime, range.endTime)} hrs
                            </span>

                            {dayConfig.timeRanges.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRange(d.index, rangeIdx)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Remove shift"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => handleAddRange(d.index)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add Another Shift / Break (e.g. Evening or After Lunch)</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 bg-slate-100/60 rounded-xl text-xs font-semibold text-slate-400 italic">
                        Closed on {d.name}s. Check the box on the left to open bookings.
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex justify-end pt-3">
        <Button loading={saving} onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-1.5" /> Save All Availability & Slot Settings
        </Button>
      </div>

      {/* CUSTOM TIME & SHIFTS MODAL POPUP */}
      <Modal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        title="Custom Consultation Working Hours & Shifts"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleApplyCustomModalShifts} className="space-y-5">
          {/* Instructions */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Define your custom working shifts and lunch breaks (e.g. Morning 09:00 AM – 01:00 PM, Evening 05:00 PM – 09:00 PM) and choose which days to apply them to.
            </p>
          </div>

          {/* Shifts Builder in Modal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>Working Shifts & Intervals</span>
              </label>
              <button
                type="button"
                onClick={handleAddCustomModalShift}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Shift</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {customShifts.map((shift, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between gap-2 flex-wrap"
                >
                  <div className="flex items-center gap-2 flex-wrap flex-1">
                    <span className="text-xs font-bold text-slate-600 w-14 shrink-0">Shift {idx + 1}:</span>

                    <div className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <input
                        type="time"
                        required
                        value={shift.startTime}
                        onChange={(e) => handleCustomModalTimeChange(idx, 'startTime', e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <span className="text-[11px] text-slate-500 font-semibold">
                        ({format12HourPreview(shift.startTime)})
                      </span>
                    </div>

                    <span className="text-xs text-slate-400 font-bold px-1">to</span>

                    <div className="flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <input
                        type="time"
                        required
                        value={shift.endTime}
                        onChange={(e) => handleCustomModalTimeChange(idx, 'endTime', e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <span className="text-[11px] text-slate-500 font-semibold">
                        ({format12HourPreview(shift.endTime)})
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg ml-auto">
                      {calculateShiftHours(shift.startTime, shift.endTime)} hrs
                    </span>
                  </div>

                  {customShifts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomModalShift(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove this shift"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Target Days Selector in Modal */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Apply This Custom Schedule To:
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetDaysMode('ALL_OPEN')}
                className={cn(
                  'p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer',
                  targetDaysMode === 'ALL_OPEN'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                )}
              >
                All Open Days
              </button>

              <button
                type="button"
                onClick={() => setTargetDaysMode('WEEKDAYS')}
                className={cn(
                  'p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer',
                  targetDaysMode === 'WEEKDAYS'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                )}
              >
                Mon – Fri Only
              </button>

              <button
                type="button"
                onClick={() => setTargetDaysMode('CUSTOM')}
                className={cn(
                  'p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer',
                  targetDaysMode === 'CUSTOM'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                )}
              >
                Choose Days...
              </button>
            </div>

            {/* Custom Day Chips */}
            {targetDaysMode === 'CUSTOM' && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {DAYS.map((d) => {
                  const isChecked = targetSpecificDays.includes(d.index);
                  return (
                    <button
                      key={d.index}
                      type="button"
                      onClick={() => handleToggleTargetSpecificDay(d.index)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1',
                        isChecked
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      <span>{d.short}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setCustomModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              <Check className="w-3.5 h-3.5 mr-1" /> Apply Custom Hours
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
