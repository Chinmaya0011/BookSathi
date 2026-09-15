'use client';

import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  IndianRupee,
  Users,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function DashboardMetrics({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full font-sans">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs animate-pulse space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-100 rounded" />
              <div className="w-7 h-7 rounded-xl bg-slate-100" />
            </div>
            <div className="h-6 w-20 bg-slate-200 rounded" />
            <div className="h-2.5 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Calculate today completed and pending count accurately
  const todaySchedule = stats?.todaySchedule || [];
  const completedToday = todaySchedule.filter(
    (a) => a.status === 'COMPLETED' || a.status === 'DONE'
  ).length;

  const pendingToday = todaySchedule.filter(
    (a) =>
      a.status !== 'CANCELLED' &&
      a.status !== 'REJECTED' &&
      a.status !== 'NO_SHOW' &&
      a.status !== 'COMPLETED' &&
      a.status !== 'DONE'
  ).length;

  const totalTodayActive = todaySchedule.filter(
    (a) => a.status !== 'CANCELLED' && a.status !== 'REJECTED'
  ).length;

  const metrics = [
    {
      title: "Today's Total",
      value: totalTodayActive || stats?.todayCount || 0,
      subValue: `${pendingToday} waiting in queue`,
      icon: CalendarCheck,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badge: 'Live',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      title: 'Completed',
      value: completedToday,
      subValue:
        totalTodayActive > 0
          ? `${Math.round((completedToday / totalTodayActive) * 100)}% done today`
          : 'Consultations done',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: 'Visits',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Upcoming',
      value: stats?.upcomingCount || 0,
      subValue: 'Confirmed future slots',
      icon: Clock,
      iconBg: 'bg-sky-50 text-sky-600 border-sky-100',
      badge: 'Pipeline',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      title: "Today's Revenue",
      value: formatINR(
        todaySchedule
          .filter((a) => a.status !== 'CANCELLED' && a.status !== 'REJECTED')
          .reduce((sum, a) => sum + (Number(a.fee) || 0), 0) || 0
      ),
      subValue: `${stats?.monthRevenue ? formatINR(stats.monthRevenue) : formatINR(stats?.totalRevenue || 0)} this month`,
      icon: IndianRupee,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: 'Est.',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 w-full font-sans">
      {metrics.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-xs font-bold text-slate-500 truncate">
                {item.title}
              </span>
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${item.iconBg} shadow-2xs`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
                  {item.value}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate font-medium">
                {item.subValue}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
