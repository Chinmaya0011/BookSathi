'use client';

import {
  CalendarCheck,
  Clock,
  TrendingUp,
  IndianRupee,
  Activity,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function DashboardMetrics({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-slate-200 rounded-md" />
              <div className="w-8 h-8 rounded-xl bg-slate-200" />
            </div>
            <div className="h-7 w-20 bg-slate-200 rounded-md" />
            <div className="h-3 w-28 bg-slate-100 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: "Today's Visits",
      value: stats?.todayCount || 0,
      subValue: 'Live slots',
      subIcon: Clock,
      subColor: 'text-indigo-600',
      icon: CalendarCheck,
      iconBg: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
      borderHover: 'hover:border-indigo-300',
      gradient: 'from-indigo-500/5 to-transparent',
    },
    {
      title: 'Upcoming',
      value: stats?.upcomingCount || 0,
      subValue: 'Confirmed',
      subIcon: CheckCircle2,
      subColor: 'text-emerald-600',
      icon: Clock,
      iconBg: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
      borderHover: 'hover:border-emerald-300',
      gradient: 'from-emerald-500/5 to-transparent',
    },
    {
      title: 'Monthly Total',
      value: stats?.monthCount || 0,
      subValue: `${stats?.totalCount || 0} All-time`,
      subIcon: Activity,
      subColor: 'text-blue-600',
      icon: TrendingUp,
      iconBg: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
      borderHover: 'hover:border-blue-300',
      gradient: 'from-blue-500/5 to-transparent',
    },
    {
      title: 'Est. Revenue',
      value: formatINR(stats?.totalRevenue || 0),
      subValue: `${stats?.monthRevenue ? formatINR(stats.monthRevenue) : '₹0'} this mo`,
      subIcon: Sparkles,
      subColor: 'text-amber-600 font-bold',
      icon: IndianRupee,
      iconBg: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
      borderHover: 'hover:border-amber-300',
      gradient: 'from-amber-500/5 to-transparent',
      isValueCurrency: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5 w-full">
      {metrics.map((item, idx) => {
        const Icon = item.icon;
        const SubIcon = item.subIcon;
        return (
          <div
            key={idx}
            className={`group bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md ${item.borderHover} transition-all duration-200 relative overflow-hidden flex flex-col justify-between min-w-0 active:scale-[0.99]`}
          >
            {/* Subtle Gradient wash on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />

            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                {item.title}
              </span>
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl ${item.iconBg} transition-all duration-200 flex items-center justify-center font-bold shadow-2xs shrink-0`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" />
              </div>
            </div>

            <div className="relative z-10 mt-2 sm:mt-3">
              <span
                className={`font-black text-slate-900 tracking-tight block truncate ${
                  item.isValueCurrency ? 'text-lg sm:text-2xl' : 'text-xl sm:text-3xl'
                }`}
              >
                {item.value}
              </span>

              <div className="mt-1 sm:mt-1.5 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
                <span className={`inline-flex items-center gap-1 font-bold truncate ${item.subColor}`}>
                  <SubIcon className="w-3 h-3 shrink-0" />
                  <span>{item.subValue}</span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
