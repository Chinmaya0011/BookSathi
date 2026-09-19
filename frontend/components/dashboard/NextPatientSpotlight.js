'use client';

import {
  Megaphone,
  Clock,
  MessageCircle,
  Phone,
  CheckCircle2,
  CalendarCheck,
  Zap,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';
import { format12Hour } from '@/lib/utils';

export default function NextPatientSpotlight({
  nextCustomer,
  activeQueueCount,
  onCallNext,
  callingNext,
  onQuickStatusUpdate,
  updatingStatusId,
  profile,
}) {
  const isServing =
    nextCustomer?.status === 'IN_PROGRESS' || nextCustomer?.status === 'CALLED';

  const cleanPhone = nextCustomer?.customerPhone
    ? nextCustomer.customerPhone.replace(/[^0-9]/g, '')
    : '';

  const whatsappUrl = cleanPhone
    ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
        `Hello ${nextCustomer?.customerName}, Dr./Pro ${profile?.name || ''} here. Your turn (Token #${nextCustomer?.queueNumber || '1'}) is ready. Please step into the consultation room.`
      )}`
    : null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-3.5 sm:p-5 text-white shadow-md relative overflow-hidden font-sans border border-indigo-900/60">
      {/* Glow accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4">
        {/* Left: Next Patient Information */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {isServing ? 'Serving Now' : 'Next in Line'}
            </span>
            <span className="text-[11px] sm:text-xs text-indigo-200/80 font-semibold">
              · {activeQueueCount} waiting
            </span>
          </div>

          {nextCustomer ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                {nextCustomer.queueNumber && (
                  <span className="px-2 py-0.5 rounded-lg bg-white/15 border border-white/20 text-white font-black text-xs sm:text-sm font-mono shrink-0">
                    Token #{nextCustomer.queueNumber}
                  </span>
                )}
                <h2 className="text-base sm:text-2xl font-black text-white tracking-tight truncate max-w-full">
                  {nextCustomer.customerName}
                </h2>
              </div>

              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-indigo-200 flex-wrap">
                <span className="inline-flex items-center gap-1 font-semibold text-white bg-white/10 px-1.5 py-0.5 rounded-md shrink-0">
                  <Clock className="w-3 h-3 text-indigo-300" />
                  {format12Hour(nextCustomer.startTime)}
                </span>
                <span className="text-indigo-400">•</span>
                <span className="text-indigo-200 font-medium truncate max-w-[150px] sm:max-w-none">
                  {nextCustomer.appointmentTypeName || 'Consultation'}
                </span>
                {nextCustomer.fee ? (
                  <>
                    <span className="text-indigo-400">•</span>
                    <span className="text-emerald-300 font-bold shrink-0">
                      ₹{nextCustomer.fee}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="py-1 space-y-0.5">
              <h2 className="text-sm sm:text-base font-bold text-white">Queue is clear right now</h2>
              <p className="text-[11px] sm:text-xs text-indigo-300/80">
                All patients have been served or no one is currently waiting.
              </p>
            </div>
          )}
        </div>

        {/* Right: Primary "Call Next" & Quick Connect Actions (Mobile Aligned) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
          {nextCustomer && (
            <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1 px-2 sm:px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors"
                  title="Ping on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Chat</span>
                </a>
              )}

              {nextCustomer.customerPhone && (
                <a
                  href={`tel:${nextCustomer.customerPhone}`}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors flex items-center justify-center"
                  title="Call patient"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                </a>
              )}

              {/* Mark in progress / Mark done button */}
              {isServing ? (
                <button
                  type="button"
                  onClick={() => onQuickStatusUpdate(nextCustomer._id, 'DONE')}
                  disabled={updatingStatusId === nextCustomer._id}
                  className="inline-flex items-center justify-center gap-1 px-2 sm:px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Done</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onQuickStatusUpdate(nextCustomer._id, 'IN_PROGRESS')}
                  disabled={updatingStatusId === nextCustomer._id}
                  className="inline-flex items-center justify-center gap-1 px-2 sm:px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Start</span>
                </button>
              )}
            </div>
          )}

          {/* Primary High-Contrast "CALL NEXT" Action Button */}
          <button
            type="button"
            onClick={onCallNext}
            disabled={callingNext || !activeQueueCount}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-lg transition-all cursor-pointer active:scale-95 shrink-0 ${
              activeQueueCount > 0
                ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Megaphone className={`w-4 h-4 shrink-0 ${callingNext ? 'animate-bounce' : ''}`} />
            <span>{callingNext ? 'Calling...' : '⚡ CALL NEXT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
