'use client';

import { useState } from 'react';
import {
  Check,
  RefreshCw,
  Sun,
  Sunset,
  Moon,
  Clock,
  CalendarDays,
  Sparkles,
  Building2,
  Video,
  PhoneCall,
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { formatINR, formatDisplayDate, cn } from '@/lib/utils';

function SlotButton({ slot, onSelect }) {
  const isAvailable = slot.available !== false;
  const label = slot.statusLabel || (isAvailable ? 'Available' : 'Booked');

  if (!isAvailable) {
    return (
      <div
        className="py-2.5 px-2 rounded-2xl border border-slate-200/60 bg-slate-100/60 text-slate-400 text-xs font-semibold text-center select-none cursor-not-allowed flex flex-col items-center justify-center min-h-[58px] opacity-60 shadow-2xs"
        title={`${slot.time12} is ${label}`}
        aria-disabled="true"
      >
        <span className="line-through text-slate-400 font-medium text-xs">{slot.time12}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 px-1.5 py-0.5 bg-slate-200/70 rounded">
          {label}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(slot.time)}
      className="py-2.5 px-2 rounded-2xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-md hover:shadow-emerald-600/20 text-emerald-950 text-xs font-bold transition-all text-center group active:scale-95 shadow-2xs cursor-pointer flex flex-col items-center justify-center min-h-[58px]"
    >
      <span className="group-hover:text-white font-extrabold text-xs tracking-tight">{slot.time12}</span>
      <span className="text-[10px] font-semibold text-emerald-700 group-hover:text-emerald-100 mt-1 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:bg-emerald-200 inline-block animate-pulse" />
        Available
      </span>
    </button>
  );
}

export default function BookingSlotPicker({
  appointmentTypes = [],
  selectedType,
  onTypeSelect,
  availableDays = [],
  selectedDate,
  onDateSelect,
  loadingSlots,
  groupedSlots,
  onSlotSelect,
}) {
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  const totalSlotsCount =
    (groupedSlots?.morning?.length || 0) +
    (groupedSlots?.afternoon?.length || 0) +
    (groupedSlots?.evening?.length || 0);

  const availableSlotsCount =
    (groupedSlots?.morning?.filter((s) => s.available)?.length || 0) +
    (groupedSlots?.afternoon?.filter((s) => s.available)?.length || 0) +
    (groupedSlots?.evening?.filter((s) => s.available)?.length || 0);

  // Generate 7 upcoming days for the quick horizontal pill strip
  const today = new Date();
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const isToday = i === 0;
    const isTomorrow = i === 1;

    return {
      dateStr,
      dayName,
      dayNum,
      monthName,
      label: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dayName,
    };
  });

  return (
    <div className="p-5 sm:p-7 space-y-7 animate-in fade-in duration-200">
      {/* 1. Consultation Service Selection */}
      {appointmentTypes?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white inline-flex items-center justify-center text-[10px] font-black shadow-xs shadow-indigo-600/30">
                1
              </span>
              <span>Select Consultation Service</span>
            </label>
            <span className="text-[11px] text-slate-500 font-medium">
              {appointmentTypes.length} option{appointmentTypes.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {appointmentTypes.map((t) => {
              const isSelected = selectedType?._id === t._id;
              const isVideo = t.type === 'VIDEO' || t.mode === 'ONLINE';
              const isPhone = t.type === 'PHONE' || t.mode === 'PHONE';

              return (
                <button
                  key={t._id}
                  type="button"
                  onClick={() => onTypeSelect(t)}
                  className={cn(
                    'p-4 rounded-2xl border text-left transition-all duration-200 flex items-start justify-between relative group cursor-pointer shadow-xs',
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/25 shadow-md shadow-indigo-500/10'
                      : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:bg-slate-50/80'
                  )}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{t.name}</h4>
                      {t.isDefault && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-indigo-600" />
                        <span>{t.duration || 30} mins</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium">
                        {isVideo ? (
                          <>
                            <Video className="w-3 h-3 text-indigo-600" />
                            <span>Video Consultation</span>
                          </>
                        ) : isPhone ? (
                          <>
                            <PhoneCall className="w-3 h-3 text-indigo-600" />
                            <span>Phone Call</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3 h-3 text-indigo-600" />
                            <span>In-Clinic Visit</span>
                          </>
                        )}
                      </span>
                    </div>

                    {t.description && (
                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-black text-slate-900">
                      {formatINR(t.fee || 500)}
                    </div>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center mt-2 ml-auto transition-all',
                        isSelected ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-transparent'
                      )}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Date Selection (Horizontal Quick Strip + Monthly Switcher) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white inline-flex items-center justify-center text-[10px] font-black shadow-xs shadow-indigo-600/30">
              2
            </span>
            <span>Choose Date</span>
          </label>

          <button
            type="button"
            onClick={() => setShowFullCalendar(!showFullCalendar)}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{showFullCalendar ? 'Quick 7 Days' : 'Pick Any Date'}</span>
          </button>
        </div>

        {/* Quick 7-Day Horizontal Strip */}
        {!showFullCalendar ? (
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 overflow-x-auto pb-1">
            {next7Days.map((day) => {
              const isSelected = selectedDate === day.dateStr;

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => onDateSelect(day.dateStr)}
                  className={cn(
                    'p-2.5 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center relative cursor-pointer active:scale-95 shadow-2xs',
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25 ring-2 ring-indigo-600/30 scale-[1.02]'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50'
                  )}
                >
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider',
                      isSelected ? 'text-indigo-100' : 'text-slate-400'
                    )}
                  >
                    {day.label}
                  </span>
                  <span
                    className={cn(
                      'text-base sm:text-lg font-black my-0.5 font-mono',
                      isSelected ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    {day.dayNum}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-semibold',
                      isSelected ? 'text-indigo-100' : 'text-slate-500'
                    )}
                  >
                    {day.monthName}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Full Native Date Picker Dropdown */
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-indigo-600 shrink-0" />
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Select Target Date</label>
              <input
                type="date"
                value={selectedDate || ''}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => onDateSelect(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Time Slots Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white inline-flex items-center justify-center text-[10px] font-black shadow-xs shadow-indigo-600/30">
              3
            </span>
            <span>Available Time Slots</span>
          </label>

          {selectedDate && (
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <span>{formatDisplayDate(selectedDate)}</span>
              {availableSlotsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  {availableSlotsCount} Open
                </span>
              )}
            </div>
          )}
        </div>

        {loadingSlots ? (
          <div className="p-10 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-xs font-semibold">Calculating real-time slot availability...</p>
          </div>
        ) : totalSlotsCount === 0 ? (
          <div className="p-8 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
            <Sun className="w-8 h-8 text-amber-600 mx-auto stroke-[1.5]" />
            <h4 className="text-xs sm:text-sm font-bold text-amber-950">No Consultation Slots on this Date</h4>
            <p className="text-[11px] text-amber-900/80 max-w-xs mx-auto">
              The practitioner has no active schedule or is on leave for {formatDisplayDate(selectedDate)}. Please choose another date above.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Morning Slots */}
            {groupedSlots?.morning?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Morning Slots</span>
                  <span className="text-[10px] text-slate-400 font-medium">({groupedSlots.morning.length})</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {groupedSlots.morning.map((slot) => (
                    <SlotButton key={slot.time} slot={slot} onSelect={onSlotSelect} />
                  ))}
                </div>
              </div>
            )}

            {/* Afternoon Slots */}
            {groupedSlots?.afternoon?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Sunset className="w-4 h-4 text-orange-500" />
                  <span>Afternoon Slots</span>
                  <span className="text-[10px] text-slate-400 font-medium">({groupedSlots.afternoon.length})</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {groupedSlots.afternoon.map((slot) => (
                    <SlotButton key={slot.time} slot={slot} onSelect={onSlotSelect} />
                  ))}
                </div>
              </div>
            )}

            {/* Evening Slots */}
            {groupedSlots?.evening?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span>Evening Slots</span>
                  <span className="text-[10px] text-slate-400 font-medium">({groupedSlots.evening.length})</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {groupedSlots.evening.map((slot) => (
                    <SlotButton key={slot.time} slot={slot} onSelect={onSlotSelect} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
