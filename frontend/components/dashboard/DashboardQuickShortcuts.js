'use client';

import Link from 'next/link';
import {
  Clock,
  Ban,
  Briefcase,
  QrCode,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

export default function DashboardQuickShortcuts() {
  const shortcuts = [
    {
      title: 'Weekly Availability',
      subtitle: 'Set shifts & hours',
      href: '/dashboard/availability',
      icon: Clock,
      color: 'text-indigo-600',
      iconBg: 'bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white',
      hoverBorder: 'hover:border-indigo-300',
      hoverBg: 'hover:bg-indigo-50/50',
    },
    {
      title: 'Blocked Dates',
      subtitle: 'Holidays & off-days',
      href: '/dashboard/blocked-dates',
      icon: Ban,
      color: 'text-rose-600',
      iconBg: 'bg-rose-50 group-hover:bg-rose-600 group-hover:text-white',
      hoverBorder: 'hover:border-rose-300',
      hoverBg: 'hover:bg-rose-50/50',
    },
    {
      title: 'Services & Fees',
      subtitle: 'Tariffs & durations',
      href: '/dashboard/services',
      icon: Briefcase,
      color: 'text-emerald-600',
      iconBg: 'bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white',
      hoverBorder: 'hover:border-emerald-300',
      hoverBg: 'hover:bg-emerald-50/50',
    },
    {
      title: 'QR & Booking Link',
      subtitle: 'Share with clients',
      href: '/dashboard/booking-link',
      icon: QrCode,
      color: 'text-purple-600',
      iconBg: 'bg-purple-50 group-hover:bg-purple-600 group-hover:text-white',
      hoverBorder: 'hover:border-purple-300',
      hoverBg: 'hover:bg-purple-50/50',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
          Practice Shortcuts
        </h4>
        <span className="text-[10px] font-bold text-indigo-600">Quick Tools</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {shortcuts.map((sc) => {
          const Icon = sc.icon;
          return (
            <Link
              key={sc.href}
              href={sc.href}
              className={`p-3 rounded-2xl bg-slate-50/90 border border-slate-100 transition-all duration-150 group text-left active:scale-95 ${sc.hoverBorder} ${sc.hoverBg}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold mb-2 transition-colors ${sc.iconBg} ${sc.color}`}
              >
                <Icon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">{sc.title}</p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{sc.subtitle}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
