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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-300/80 p-3.5 sm:p-4 shadow-sm font-sans">
      {/* Background glowing blur */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        
        {/* Left Info & Meter */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] uppercase tracking-wide">
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              Free Tier Limit
            </span>
            <span className="text-xs font-bold text-slate-800">
              {isExhausted
                ? '⚠️ Monthly Booking Limit Reached (15/15)'
                : isNearLimit
                ? `⚡ ${percentUsed}% Free Limit Used (${usedCount}/${limit} Bookings)`
                : `Active Free Plan • ${remaining} bookings left this month`}
            </span>
            <span className="text-[11px] font-medium text-slate-500 bg-white/70 px-2 py-0.5 rounded-md border border-slate-200">
              Resets in {daysLeftInMonth} days
            </span>
          </div>

          {/* Quota Progress Bar */}
          <div className="space-y-1 max-w-md">
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden flex">
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
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
              <span>{usedCount} used</span>
              <span className={isNearLimit ? 'text-amber-700 font-bold' : ''}>
                {isExhausted ? '0 slots left' : `${remaining} free slots remaining`}
              </span>
            </div>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenUpgradeModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-extrabold text-xs shadow-md shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Upgrade to Pro Unlimited</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[10px]">
              ₹199
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
