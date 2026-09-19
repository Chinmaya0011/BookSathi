'use client';

import {
  Zap,
  Ban,
  Megaphone,
  Receipt,
  Sparkles,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

export default function QuickActionsStrip({
  onOpenWalkIn,
  onOpenEmergencyAlert,
  onOpenReceipt,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs font-sans">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
          Quick Actions
        </span>
        <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">1-tap desk operations</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        {/* 1. Walk-in */}
        <button
          type="button"
          onClick={onOpenWalkIn}
          className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-indigo-50/70 hover:border-indigo-200 active:scale-95 transition-all text-left cursor-pointer group min-h-[56px]"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 truncate">Walk-In</h4>
            <p className="text-[10px] text-slate-400 truncate">Instant client</p>
          </div>
        </button>

        {/* 2. Block Time / Leave */}
        <Link
          href="/dashboard/setup?tab=hours"
          className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-rose-50/70 hover:border-rose-200 active:scale-95 transition-all text-left group min-h-[56px]"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-900 truncate">Block Time</h4>
            <p className="text-[10px] text-slate-400 truncate">Leave / Off</p>
          </div>
        </Link>

        {/* 3. Broadcast Alert */}
        <button
          type="button"
          onClick={onOpenEmergencyAlert}
          className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-amber-50/70 hover:border-amber-200 active:scale-95 transition-all text-left cursor-pointer group min-h-[56px]"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-900 truncate">Alert Queue</h4>
            <p className="text-[10px] text-slate-400 truncate">Delay notice</p>
          </div>
        </button>

        {/* 4. Consultation Receipt */}
        <button
          type="button"
          onClick={onOpenReceipt}
          className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-emerald-50/70 hover:border-emerald-200 active:scale-95 transition-all text-left cursor-pointer group min-h-[56px]"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 truncate">Print Slip</h4>
            <p className="text-[10px] text-slate-400 truncate">Fee receipt</p>
          </div>
        </button>
      </div>
    </div>
  );
}
