'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Calendar, Layers, UserCheck, ArrowRight } from 'lucide-react';
import { useSetupStatusStore } from '@/stores/useSetupStatusStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';

export default function SetupReminderBanner() {
  const user = useAuthStore((state) => state.user);
  const { setupStatus, loading, fetchSetupStatus } = useSetupStatusStore();
  const pathname = usePathname();

  // Re-fetch setup status whenever pathname changes or window regains focus (Only for Professionals)
  useEffect(() => {
    if (user && user.role === 'PROFESSIONAL') {
      fetchSetupStatus();
    }
  }, [user, pathname, fetchSetupStatus]);

  useEffect(() => {
    const onFocus = () => {
      if (user && user.role === 'PROFESSIONAL') fetchSetupStatus();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user, fetchSetupStatus]);

  // If not a professional, loading, no user, or setup is complete, do not show banner
  if (!user || user.role !== 'PROFESSIONAL' || loading || !setupStatus || setupStatus.isSetupComplete) {
    return null;
  }

  const { pendingItems = [], message, primaryActionPath, primaryActionText } = setupStatus;

  return (
    <aside
      aria-label="Profile setup reminder"
      className="bg-gradient-to-r from-amber-500/10 via-amber-50/70 to-indigo-50/70 border-b border-amber-300/60 px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-2 transition-all animate-in slide-in-from-top duration-300 relative z-20"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left Side: Icon & Hinglish Message */}
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-600" />
          </div>

          <div className="min-w-0">
            <p className="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug">
              <span className="font-extrabold text-amber-900 mr-1.5">Action Required:</span>
              {message ||
                'Aapka profile abhi complete nahi hai. Consultation Services & Pricing aur Weekly Availability complete karein taaki aap consultations start kar sakein.'}
            </p>
          </div>
        </div>

        {/* Right Side: Direct Interactive Navigation Links */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 w-full md:w-auto pt-1 md:pt-0">
          {/* Specific Pending Item Badges */}
          {pendingItems.map((item) => {
            const isActivePage = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border',
                  isActivePage
                    ? 'bg-amber-600 text-white border-amber-700 shadow-2xs ring-2 ring-amber-400/30'
                    : 'bg-white/90 hover:bg-white text-amber-950 border-amber-300/80 hover:border-amber-400 shadow-2xs'
                )}
              >
                {item.id === 'availability' && <Calendar className="w-3 h-3 text-amber-700" />}
                {item.id === 'services' && <Layers className="w-3 h-3 text-amber-700" />}
                {item.id === 'profile' && <UserCheck className="w-3 h-3 text-amber-700" />}
                <span>{item.title}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              </Link>
            );
          })}

          {/* Primary Quick Action Button */}
          {primaryActionPath && (
            <Link
              href={primaryActionPath}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 group"
            >
              <span>{primaryActionText || 'Complete Setup'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-indigo-200" />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
