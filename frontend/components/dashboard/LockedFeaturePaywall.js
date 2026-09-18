'use client';

import { Lock, Sparkles, Zap, ArrowRight } from 'lucide-react';

export default function LockedFeaturePaywall({
  title = 'Pro Feature Locked',
  description = 'Upgrade to BookSaathi Pro to unlock full access, unlimited data, and advanced analytics.',
  onOpenUpgradeModal,
  badge = '⭐ PRO ONLY',
  compact = false,
}) {
  return (
    <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/75 flex flex-col items-center justify-center p-4 sm:p-6 text-center rounded-2xl border border-indigo-100/80 transition-all font-sans">
      <div className="relative mb-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <Lock className="w-5 h-5" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 shadow-xs">
          <Sparkles className="w-3 h-3 fill-slate-950" />
        </div>
      </div>

      <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/10 to-indigo-500/10 text-indigo-900 border border-indigo-200 text-[10px] font-black uppercase tracking-wider mb-1.5">
        {badge}
      </span>

      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight max-w-sm">
        {title}
      </h3>

      {!compact && (
        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
          {description}
        </p>
      )}

      <button
        type="button"
        onClick={onOpenUpgradeModal}
        className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
      >
        <Zap className="w-3.5 h-3.5 fill-white" />
        <span>Unlock with Pro (₹199)</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
