'use client';

import { useMemo } from 'react';
import {
  Users,
  User,
  Clock,
  Sparkles,
  Ticket,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  XCircle,
} from 'lucide-react';
import { formatINR, formatDisplayDate } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

export default function BookingQueueView({
  profile,
  appointmentTypes,
  selectedType,
  onTypeSelect,
  availableDays,
  selectedDate,
  onDateSelect,
  queueStatus,
  loadingQueue,
  user,
  patientName,
  setPatientName,
  patientPhone,
  setPatientPhone,
  patientEmail,
  setPatientEmail,
  reason,
  setReason,
  paymentMode,
  setPaymentMode,
  websiteHp,
  setWebsiteHp,
  submitting,
  onSubmit,
}) {
  const selectedDayObj = useMemo(() => {
    return availableDays.find((d) => d.dateStr === selectedDate) || availableDays[0];
  }, [availableDays, selectedDate]);

  const currentFee = selectedType?.fee || profile?.consultationFee || 500;
  const isOnlineAllowed = profile?.queueSettings?.allowOnlineQueue !== false;
  const isDailyLimitReached = queueStatus?.isLimitReached || queueStatus?.isQueueFull || false;
  const isCutoffReached = queueStatus?.isCutoffReached || false;
  const isDayClosed = selectedDayObj?.isClosed || queueStatus?.isClosed || false;
  const isDayBlocked = queueStatus?.isBlocked || false;
  const isBookingBlocked = isDailyLimitReached || isCutoffReached || isDayClosed || isDayBlocked;

  const nextTokenNumber = (queueStatus?.totalTokensIssued || queueStatus?.lastQueueNumber || 0) + 1;
  const currentCalling = queueStatus?.currentCallingNumber || queueStatus?.currentServingNumber || 0;
  const waitingCount = queueStatus?.waitingCount ?? Math.max(0, (queueStatus?.totalTokensIssued || queueStatus?.lastQueueNumber || 0) - currentCalling);
  const estimatedWait = queueStatus?.estimatedWaitMinutes ?? (waitingCount * (profile?.queueSettings?.estimatedServiceTimeMinutes || 15));

  return (
    <div className="p-4 sm:p-7 space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Date Strip Selector */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Select Date</span>
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            {selectedDayObj?.isToday ? 'Today' : selectedDayObj?.isTomorrow ? 'Tomorrow' : formatDisplayDate(selectedDate)}
            {selectedDayObj?.isClosed && ' • (Closed)'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {availableDays.map((day) => {
            const isSelected = day.dateStr === selectedDate;
            const isDayOff = day.isClosed;

            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => onDateSelect(day.dateStr)}
                className={`shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[78px] py-2.5 px-3 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                  isSelected
                    ? isDayOff
                      ? 'bg-rose-700 text-white border-rose-700 shadow-md shadow-rose-700/25 scale-[1.02]'
                      : 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25 scale-[1.02]'
                    : isDayOff
                    ? 'bg-rose-50/60 hover:bg-rose-50 text-rose-700 border-rose-200/80 opacity-75'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-white/80' : isDayOff ? 'text-rose-600' : 'text-slate-400'}`}>
                  {day.dayName}
                </span>
                <span className="text-base sm:text-lg font-black leading-tight mt-0.5 font-mono">
                  {day.dayNum}
                </span>
                <span className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-white/90' : isDayOff ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                  {isDayOff ? 'Closed' : day.isToday ? 'Today' : day.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Live Queue Status Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 border border-indigo-500/30 shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-violet-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE QUEUE STATUS</span>
            </div>

            {loadingQueue && (
              <div className="flex items-center gap-1.5 text-xs text-indigo-300">
                <Spinner size="xs" />
                <span className="text-[11px]">Updating...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* Now Serving */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-left backdrop-blur-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Now Serving
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  {currentCalling > 0 ? `#${currentCalling}` : '—'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {currentCalling > 0 ? 'Inside Cabin' : 'Not started'}
              </span>
            </div>

            {/* Next Available Token */}
            <div className="bg-indigo-600/20 border border-indigo-500/40 rounded-2xl p-3 text-left backdrop-blur-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 block">
                Your Token
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">
                  #{nextTokenNumber}
                </span>
              </div>
              <span className="text-[10px] text-indigo-200 block mt-0.5">
                Next in line
              </span>
            </div>

            {/* Waiting Ahead */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-left backdrop-blur-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                In Queue
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">
                  {waitingCount}
                </span>
                <span className="text-xs text-slate-400">waiting</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {waitingCount === 0 ? 'No queue' : 'Ahead of you'}
              </span>
            </div>

            {/* Estimated Wait Time */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-left backdrop-blur-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Est. Wait
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  {estimatedWait > 0 ? `~${estimatedWait}m` : '0m'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Approx. turnaround
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Closed Day / Blocked Date Warning */}
      {isDayClosed && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 text-xs flex items-start gap-2.5">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="font-bold">Clinic / Professional is Closed on this Day</strong>
            <p className="text-rose-700">
              {queueStatus?.closedReason || `Weekly off on ${selectedDayObj?.dayName || 'this day'}.`} Please select an open working day from the date selector above.
            </p>
          </div>
        </div>
      )}

      {/* Daily limit reached warning */}
      {!isDayClosed && isDailyLimitReached && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="font-bold">Daily Queue Limit Reached for this Date</strong>
            <p className="text-amber-700">
              The professional has capped today's queue at {profile?.queueSettings?.dailyLimit || 50} tokens. Please select another date to get your queue token.
            </p>
          </div>
        </div>
      )}

      {/* Cutoff time reached warning */}
      {!isDayClosed && isCutoffReached && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 text-xs flex items-start gap-2.5">
          <Clock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="font-bold">Queue Booking Closed for Today</strong>
            <p className="text-rose-700">
              Daily booking cutoff was {profile?.queueSettings?.lastBookingTime || '17:00'}. Please select tomorrow or an upcoming date to book your token in advance.
            </p>
          </div>
        </div>
      )}

      {/* Online queue disabled warning */}
      {!isOnlineAllowed && (
        <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/30 text-slate-800 text-xs flex items-start gap-2.5">
          <Lock className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="font-bold">Walk-In Only Mode</strong>
            <p className="text-slate-600">
              Online queue booking is currently disabled for this professional. Please visit the reception directly to receive a walk-in token.
            </p>
          </div>
        </div>
      )}

      {/* 3. Service Type Selector (if multiple exist) */}
      {appointmentTypes && appointmentTypes.length > 1 && (
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-700 px-1">
            Select Consultation Service
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {appointmentTypes.map((type) => {
              const isSelected = selectedType?._id === type._id;
              return (
                <button
                  key={type._id}
                  type="button"
                  onClick={() => onTypeSelect(type)}
                  className={`text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/20'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{type.name}</h4>
                      {type.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {type.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-black text-indigo-700 font-mono">
                      {formatINR(type.fee || profile.consultationFee || 0)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Customer Details Form */}
      <form onSubmit={onSubmit} className="space-y-4 pt-1 relative">
        {/* Invisible Honeypot field for bot trapping */}
        <input
          type="text"
          name="website_hp"
          value={websiteHp || ''}
          onChange={(e) => setWebsiteHp && setWebsiteHp(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{
            opacity: 0,
            position: 'absolute',
            top: 0,
            left: 0,
            height: 0,
            width: 0,
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
        <div className="border-t border-slate-100 pt-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1 mb-3">
            Customer Details
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-xs sm:text-sm font-medium outline-hidden transition-all bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-400 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-xs sm:text-sm font-medium outline-hidden transition-all bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-xs sm:text-sm font-medium outline-hidden transition-all bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Visit <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Regular Checkup, Consultation"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-xs sm:text-sm font-medium outline-hidden transition-all bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* 5. Payment Mode Selection */}
        <div className="border-t border-slate-100 pt-4 space-y-2.5">
          <label className="block text-xs font-bold text-slate-700 px-1">
            Payment Option
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setPaymentMode('OFFLINE')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                paymentMode === 'OFFLINE'
                  ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/20'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className={`w-4 h-4 ${paymentMode === 'OFFLINE' ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span className="text-xs font-bold text-slate-900">Pay on Arrival</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Pay cash / UPI directly at desk
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('ONLINE')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                paymentMode === 'ONLINE'
                  ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/20'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className={`w-4 h-4 ${paymentMode === 'ONLINE' ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span className="text-xs font-bold text-slate-900">Pay Online Now</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                UPI, Cards, Netbanking
              </p>
            </button>
          </div>
        </div>

        {/* 6. Summary and Submission */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={submitting || isBookingBlocked || !isOnlineAllowed}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-600/25 transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="text-white" />
                <span>Issuing Your Queue Token...</span>
              </>
            ) : !isOnlineAllowed ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Walk-In Only (Desk Allocation)</span>
              </>
            ) : isDayClosed ? (
              <>
                <XCircle className="w-4 h-4" />
                <span>Clinic Closed on this Date</span>
              </>
            ) : isCutoffReached ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Booking Closed for Today (Cutoff Reached)</span>
              </>
            ) : isDailyLimitReached ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Queue Full for this Date (Limit Reached)</span>
              </>
            ) : (
              <>
                <Ticket className="w-4 h-4" />
                <span>Get Token #{nextTokenNumber} • {formatINR(currentFee)}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-400 mt-2.5 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Instant token issued directly on {profile.name}'s live queue</span>
          </p>
        </div>
      </form>
    </div>
  );
}
