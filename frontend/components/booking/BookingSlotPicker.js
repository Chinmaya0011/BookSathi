'use client';

import { Check, RefreshCw, Sun, Sunset, Moon, Clock, CalendarDays, Sparkles, Building2 } from 'lucide-react';
import { formatINR, formatDisplayDate, cn } from '@/lib/utils';

function SlotButton({ slot, onSelect }) {
  const isAvailable = slot.available !== false;
  const label = slot.statusLabel || (isAvailable ? 'Available' : 'Booked');

  if (!isAvailable) {
    return (
      <div
        className="py-2.5 px-2 rounded-xl border border-slate-200/80 bg-slate-100/80 text-slate-400 text-xs font-semibold text-center select-none cursor-not-allowed flex flex-col items-center justify-center min-h-[58px] transition-all opacity-75 shadow-2xs"
        title={`${slot.time12} is ${label}`}
        aria-disabled="true"
      >
        <span className="line-through text-slate-400 font-medium text-xs">{slot.time12}</span>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1 px-2 py-0.5 bg-slate-200/80 rounded-md">
          {label}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(slot.time)}
      className="py-2.5 px-2 rounded-xl border border-emerald-300/80 bg-emerald-50/80 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-emerald-950 text-xs font-bold transition-all text-center group active:scale-95 shadow-xs cursor-pointer flex flex-col items-center justify-center min-h-[58px]"
    >
      <span className="group-hover:text-white font-extrabold text-xs tracking-tight">{slot.time12}</span>
      <span className="text-[10px] font-semibold text-emerald-700 group-hover:text-emerald-100 mt-1 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:bg-emerald-200 inline-block animate-pulse"></span>
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
  const totalSlotsCount =
    (groupedSlots?.morning?.length || 0) +
    (groupedSlots?.afternoon?.length || 0) +
    (groupedSlots?.evening?.length || 0);

  const availableSlotsCount =
    (groupedSlots?.morning?.filter((s) => s.available)?.length || 0) +
    (groupedSlots?.afternoon?.filter((s) => s.available)?.length || 0) +
    (groupedSlots?.evening?.filter((s) => s.available)?.length || 0);

  return (
    <div className="p-5 sm:p-8 space-y-7 animate-in fade-in duration-200">
      {/* 1. Consultation Service Selection */}
      {appointmentTypes?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center text-[10px] font-black">1</span>
              <span>Select Consultation Service</span>
            </label>
            <span className="text-[11px] text-slate-500 font-medium">
              {appointmentTypes.length} service{appointmentTypes.length > 1 ? 's' : ''} offered
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {appointmentTypes.map((t) => {
              const isSelected = selectedType?._id === t._id;
              return (
                <button
                  key={t._id}
                  type="button"
                  onClick={() => onTypeSelect(t)}
                  className={cn(
                    'p-4 rounded-2xl border text-left transition-all flex items-start justify-between relative group cursor-pointer shadow-2xs',
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-600/25 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70'
                  )}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{t.name}</h4>
                      {t.isDefault && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 natural text-indigo-400 shrink-0" />
                      <span>{t.duration} mins • 1-on-1 Consultation</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black text-indigo-700 block">
                      {formatINR(t.fee)}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-100/80 px-1.5 py-0.5 rounded-full mt-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Selected</span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Date Strip Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center text-[10px] font-black">2</span>
            <span>Select Date</span>
          </label>
          <span className="text-xs text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100/80 flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
            <span>{formatDisplayDate(selectedDate)}</span>
          </span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {availableDays.map((d) => {
            const isSelected = selectedDate === d.dateStr;
            return (
              <button
                key={d.dateStr}
                type="button"
                onClick={() => onDateSelect(d.dateStr)}
                className={cn(
                  'flex flex-col items-center justify-center min-w-[66px] py-3 px-2 rounded-2xl border text-center transition-all shrink-0 cursor-pointer shadow-2xs',
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30 scale-[1.02]'
                    : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                )}
              >
                <span className={cn(
                  'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full mb-0.5',
                  isSelected ? 'bg-indigo-500 text-indigo-50' : d.isToday ? 'bg-emerald-100 text-emerald-800' : 'text-slate-400'
                )}>
                  {d.isToday ? 'Today' : d.isTomorrow ? 'Tmrw' : d.dayName}
                </span>
                <span className="text-base font-black leading-tight mt-0.5">{d.dayNum}</span>
                <span className="text-[10px] font-semibold opacity-85 mt-0.5">{d.monthName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Time Slots */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center text-[10px] font-black">3</span>
            <span>Select Consultation Slot (IST)</span>
          </label>

          {/* Color-Coded Legend */}
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-200"></span>
              <span className="text-emerald-950 font-bold">Available (Green)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block ring-2 ring-slate-200"></span>
              <span className="text-slate-500 font-medium">Booked / Past (Grey)</span>
            </div>
          </div>
        </div>

        {totalSlotsCount > 0 && availableSlotsCount === 0 && !loadingSlots && (
          <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>All consultation slots for this date have either concluded or been booked. Please pick an upcoming date from the calendar strip.</span>
          </div>
        )}

        {loadingSlots ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-xs font-medium">Checking live slot availability...</span>
          </div>
        ) : totalSlotsCount > 0 ? (
          <div className="space-y-4">
            {/* Morning */}
            {groupedSlots.morning?.length > 0 && (
              <div className="space-y-2 p-3.5 rounded-2xl bg-amber-50/40 border border-amber-100/80">
                <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                  <div className="flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-600" />
                    <span>Morning Shifts (Before 12:00 PM)</span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-700/80">
                    {groupedSlots.morning.filter(s => s.available).length} open
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {groupedSlots.morning.map((s) => (
                    <SlotButton key={s.time} slot={s} onSelect={onSlotSelect} />
                  ))}
                </div>
              </div>
            )}

            {/* Afternoon */}
            {groupedSlots.afternoon?.length > 0 && (
              <div className="space-y-2 p-3.5 rounded-2xl bg-orange-50/40 border border-orange-100/80">
                <div className="flex items-center justify-between text-xs font-bold text-orange-800">
                  <div className="flex items-center gap-1.5">
                    <Sunset className="w-4 h-4 text-orange-600" />
                    <span>Afternoon Shifts (12:00 PM - 05:00 PM)</span>
                  </div>
                  <span className="text-[10px] font-semibold text-orange-700/80">
                    {groupedSlots.afternoon.filter(s => s.available).length} open
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {groupedSlots.afternoon.map((s) => (
                    <SlotButton key={s.time} slot={s} onSelect={onSlotSelect} />
                  ))}
                </div>
              </div>
            )}

            {/* Evening */}
            {groupedSlots.evening?.length > 0 && (
              <div className="space-y-2 p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100/80">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-800">
                  <div className="flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span>Evening Shifts (05:00 PM Onwards)</span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-700/80">
                    {groupedSlots.evening.filter(s => s.available).length} open
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {groupedSlots.evening.map((s) => (
                    <SlotButton key={s.time} slot={s} onSelect={onSlotSelect} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/90 text-center">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No consultation shifts configured for this date</p>
            <p className="text-[11px] text-slate-400 mt-1">Please select another date from the calendar strip above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
