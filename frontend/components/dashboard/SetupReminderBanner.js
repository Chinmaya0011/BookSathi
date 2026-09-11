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
      className="bg-amber-50/80 border-b border-amber-200/80 px-3.5 sm:px-6 lg:px-8 py-2.5 transition-all animate-in slide-in-from-top duration-300 relative z-20"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left Side: Icon & Message */}
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </div>

          <div className="min-w-0">
            <p className="text-xs text-slate-800 leading-snug">
              <span className="font-bold text-amber-900 mr-1.5">Action Required:</span>
              {message ||
                'Aapka profile abhi complete nahi hai. Consultation Services & Pricing aur Weekly Availability complete karein.'}
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
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all border',
                  isActivePage
                    ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                    : 'bg-white hover:bg-amber-100/50 text-amber-900 border-amber-200 shadow-2xs'
                )}
              >
                {item.id === 'availability' && <Calendar className="w-3 h-3 text-amber-700" />}
                {item.id === 'services' && <Layers className="w-3 h-3 text-amber-700" />}
                {item.id === 'profile' && <UserCheck className="w-3 h-3 text-amber-700" />}
                <span>{item.title}</span>
              </Link>
            );
          })}

          {/* Primary Quick Action Button */}
          {primaryActionPath && (
            <Link
              href={primaryActionPath}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold transition-all shrink-0 group"
            >
              <span>{primaryActionText || 'Complete Setup'}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
