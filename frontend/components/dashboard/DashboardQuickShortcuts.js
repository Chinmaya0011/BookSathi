'use client';

import Link from 'next/link';
import {
  Clock,
  Ban,
  Briefcase,
  QrCode,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function DashboardQuickShortcuts({ isPro = false, onOpenUpgradeModal }) {
  const shortcuts = [
    {
      title: 'Weekly Shifts',
      subtitle: 'Hours & working days',
      href: '/dashboard/availability',
      icon: Clock,
      color: 'text-indigo-600',
      iconBg: 'bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white',
      hoverBorder: 'hover:border-indigo-300',
      hoverBg: 'hover:bg-indigo-50/20',
      isPro: false,
    },
    {
      title: 'Services & Fees',
      subtitle: isPro ? 'Unlimited services' : '1 Free (Multi-tier Pro)',
      href: '/dashboard/services',
      icon: Briefcase,
      color: 'text-emerald-600',
      iconBg: 'bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white',
      hoverBorder: 'hover:border-emerald-300',
      hoverBg: 'hover:bg-emerald-50/20',
      isPro: !isPro,
      badge: !isPro ? 'PRO' : null,
    },
    {
      title: 'QR & Booking Link',
      subtitle: 'Personal booking portal',
      href: '/dashboard/booking-link',
      icon: QrCode,
      color: 'text-purple-600',
      iconBg: 'bg-purple-50 group-hover:bg-purple-600 group-hover:text-white',
      hoverBorder: 'hover:border-purple-300',
      hoverBg: 'hover:bg-purple-50/20',
      isPro: false,
    },
    {
      title: 'Blocked Dates',
      subtitle: 'Holidays & leaves',
      href: '/dashboard/blocked-dates',
      icon: Ban,
      color: 'text-rose-600',
      iconBg: 'bg-rose-50 group-hover:bg-rose-600 group-hover:text-white',
      hoverBorder: 'hover:border-rose-300',
      hoverBg: 'hover:bg-rose-50/20',
      isPro: false,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 sm:p-4 space-y-2.5 font-sans">
      <div className="flex items-center justify-between px-0.5">
        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-indigo-600" />
          Practice Shortcuts
        </h4>
        {!isPro ? (
          <button
            type="button"
            onClick={onOpenUpgradeModal}
            className="text-[11px] font-extrabold text-amber-600 hover:text-amber-700 cursor-pointer"
          >
            ⭐ Pro Perks
          </button>
        ) : (
          <span className="text-[11px] font-semibold text-indigo-600">Quick Access</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {shortcuts.map((sc) => {
          const Icon = sc.icon;
          return (
            <Link
              key={sc.href}
              href={sc.href}
              className={`p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/70 transition-all duration-200 group text-left active:scale-95 shadow-2xs relative overflow-hidden ${sc.hoverBorder} ${sc.hoverBg}`}
            >
              {sc.badge && (
                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black">
                  {sc.badge}
                </span>
              )}
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold mb-1.5 transition-all duration-200 ${sc.iconBg} ${sc.color} shadow-2xs`}
              >
                <Icon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">{sc.title}</p>
              <p className="text-[10px] text-slate-400 truncate">{sc.subtitle}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
