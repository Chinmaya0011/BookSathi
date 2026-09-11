'use client';

import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  IndianRupee,
  Users,
  Activity,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function DashboardMetrics({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-20 bg-slate-100 rounded" />
              <div className="w-8 h-8 rounded-xl bg-slate-100" />
            </div>
            <div className="h-7 w-24 bg-slate-200 rounded" />
            <div className="h-3 w-28 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Calculate today completed count from today schedule if available
  const todaySchedule = stats?.todaySchedule || [];
  const completedToday = todaySchedule.filter(
    (a) => a.status === 'COMPLETED'
  ).length;
  const pendingToday = todaySchedule.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING' || a.status === 'IN_PROGRESS' || a.status === 'ARRIVED'
  ).length;

  const metrics = [
    {
      title: "Today's Total Schedule",
      value: stats?.todayCount || todaySchedule.length || 0,
      subValue: `${pendingToday} remaining / in queue`,
      icon: CalendarCheck,
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      badge: 'Today Priority',
      badgeColor: 'bg-indigo-50 text-indigo-700',
    },
    {
      title: 'Completed Consultations',
      value: completedToday,
      subValue: 'Finished visits today',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      badge: 'Done',
      badgeColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Upcoming Bookings',
      value: stats?.upcomingCount || 0,
      subValue: 'Future confirmed slots',
      icon: Clock,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-100',
      badge: 'Pipeline',
      badgeColor: 'bg-blue-50 text-blue-700',
    },
    {
      title: "Today's Estimated Revenue",
      value: formatINR(
        todaySchedule
          .filter((a) => a.status !== 'CANCELLED')
          .reduce((sum, a) => sum + (Number(a.fee) || 0), 0) || (stats?.totalRevenue ? Math.round(stats.totalRevenue / 10) : 0)
      ),
      subValue: `${stats?.monthRevenue ? formatINR(stats.monthRevenue) : formatINR(stats?.totalRevenue || 0)} this month`,
      icon: IndianRupee,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-100',
      badge: 'Earnings',
      badgeColor: 'bg-amber-50 text-amber-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full font-sans">
      {metrics.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-500 truncate">
                {item.title}
              </span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${item.iconColor}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight block">
                  {item.value}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate font-medium">
                {item.subValue}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
