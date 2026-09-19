'use client';

import { useState } from 'react';
import {
  Flame,
  Zap,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function FreeTierLimitBanner({
  usedCount = 0,
  limit = 15,
  onOpenUpgradeModal,
}) {
  const remaining = Math.max(0, limit - usedCount);
  const percentUsed = Math.min(100, Math.round((usedCount / limit) * 100));
  const isNearLimit = percentUsed >= 70;
  const isExhausted = remaining === 0;

  // Calculate days remaining in the current month
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeftInMonth = Math.max(1, lastDayOfMonth - now.getDate());

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-300/80 p-3 sm:p-4 shadow-2xs font-sans">
      {/* Background glowing blur */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3.5">
        {/* Left Info & Meter */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wide shrink-0">
              <Flame className="w-3 h-3 text-amber-600 fill-amber-600" />
              Free Limit
            </span>
            <span className="text-xs font-bold text-slate-800 truncate">
              {isExhausted
                ? 'Limit Reached (15/15)'
                : isNearLimit
                ? `${usedCount}/${limit} Bookings Used`
                : `${remaining} bookings left this month`}
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 bg-white/70 px-1.5 py-0.2 rounded border border-slate-200 shrink-0">
              Resets in {daysLeftInMonth}d
            </span>
          </div>

          {/* Quota Progress Bar */}
          <div className="space-y-1 max-w-md">
            <div className="w-full bg-slate-200/80 rounded-full h-1.5 sm:h-2 overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isExhausted
                    ? 'bg-rose-500'
                    : isNearLimit
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse'
                    : 'bg-gradient-to-r from-indigo-600 to-amber-500'
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-600 font-semibold">
              <span>{usedCount} used</span>
              <span className={isNearLimit ? 'text-amber-700 font-bold' : ''}>
                {isExhausted ? '0 slots left' : `${remaining} free remaining`}
              </span>
            </div>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2 shrink-0 pt-1 md:pt-0">
          <button
            type="button"
            onClick={onOpenUpgradeModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white shrink-0" />
            <span>Upgrade to Pro</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[10px] shrink-0">
              ₹199
            </span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
