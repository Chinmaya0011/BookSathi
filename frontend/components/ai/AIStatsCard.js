'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIStatsCard({ data, title = 'Summary Metrics' }) {
  if (!data) return null;

  const stats = Array.isArray(data.stats) ? data.stats : [];
  if (stats.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2.5">
        <div className="flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">{title}</h4>
        </div>
      </div>

      <div className={cn('grid gap-2', stats.length === 2 ? 'grid-cols-2' : stats.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3')}>
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-lg p-2 flex flex-col justify-between"
          >
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{stat.label}</span>
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {stat.value !== undefined ? String(stat.value) : '0'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
