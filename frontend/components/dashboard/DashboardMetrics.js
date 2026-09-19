'use client';

import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Users,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardMetrics({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full font-sans">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs animate-pulse space-y-2.5"
          >
            <div className="h-4 w-28 bg-slate-100 rounded" />
            <div className="h-8 w-20 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

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

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full font-sans">
      {/* 1. Today's Bookings */}
      <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between gap-1.5 mb-2">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 sm:gap-1.5 truncate">
            <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
            <span className="truncate">Today's Bookings</span>
          </span>
          <Link
            href="/dashboard/appointments"
            className="p-1 sm:p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 border border-slate-200/80 transition-colors shrink-0"
            title="View all bookings"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalTodayActive || stats?.todayCount || 0}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500">
              slots
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
            {completedToday} done · {Math.max(0, totalTodayActive - completedToday)} left
          </p>
        </div>
      </div>

      {/* 2. Waiting in Queue */}
      <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between gap-1.5 mb-2">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1 sm:gap-1.5 truncate">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
            <span className="truncate">Waiting Queue</span>
          </span>
          <Link
            href="/dashboard/appointments?tab=today"
            className="p-1 sm:p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 transition-colors shrink-0"
            title="View live queue"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {pendingToday}
            </span>
            <span className="text-[9px] sm:text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
              In Line
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
            {pendingToday > 0 ? 'Ready for consult' : 'All clear right now'}
          </p>
        </div>
      </div>
    </div>
  );
}

