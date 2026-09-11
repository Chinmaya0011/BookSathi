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
      hoverBg: 'hover:bg-indigo-50/40',
    },
    {
      title: 'Blocked Dates',
      subtitle: 'Holidays & off-days',
      href: '/dashboard/blocked-dates',
      icon: Ban,
      color: 'text-rose-600',
      iconBg: 'bg-rose-50 group-hover:bg-rose-600 group-hover:text-white',
      hoverBorder: 'hover:border-rose-300',
      hoverBg: 'hover:bg-rose-50/40',
    },
    {
      title: 'Services & Fees',
      subtitle: 'Tariffs & durations',
      href: '/dashboard/services',
      icon: Briefcase,
      color: 'text-emerald-600',
      iconBg: 'bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white',
      hoverBorder: 'hover:border-emerald-300',
      hoverBg: 'hover:bg-emerald-50/40',
    },
    {
      title: 'QR & Booking Link',
      subtitle: 'Share with clients',
      href: '/dashboard/booking-link',
      icon: QrCode,
      color: 'text-purple-600',
      iconBg: 'bg-purple-50 group-hover:bg-purple-600 group-hover:text-white',
      hoverBorder: 'hover:border-purple-300',
      hoverBg: 'hover:bg-purple-50/40',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 space-y-3">
      <div className="flex items-center justify-between px-0.5">
        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Practice Shortcuts
        </h4>
        <span className="text-[11px] font-semibold text-indigo-600">Quick Tools</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {shortcuts.map((sc) => {
          const Icon = sc.icon;
          return (
            <Link
              key={sc.href}
              href={sc.href}
              className={`p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 transition-all duration-150 group text-left active:scale-95 ${sc.hoverBorder} ${sc.hoverBg}`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold mb-2 transition-colors ${sc.iconBg} ${sc.color}`}
              >
                <Icon className="w-3.5 h-3.5 transition-transform group-hover:scale-105" />
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
