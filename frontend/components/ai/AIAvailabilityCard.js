'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarDays, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIAvailabilityCard({ items = [], title = 'Weekly Practice Schedule', onActionClick }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs font-sans">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold text-slate-900 tracking-tight">{title}</h4>
        </div>
        <span className="text-[10px] text-slate-500 font-medium">Asia/Kolkata (IST)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              'flex items-center justify-between p-2.5 rounded-lg border text-xs',
              item.enabled
                ? 'bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-slate-100/60 border-slate-200 text-slate-500'
            )}
          >
            <div className="flex items-center gap-2">
              {item.enabled ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <span className="font-bold text-slate-900">{item.day}</span>
            </div>
            <span className="text-xs font-semibold text-slate-700 truncate ml-2">
              {item.hours || (item.enabled ? 'Open' : 'Closed')}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 text-[11px]">Shift configurations</span>
        <Link
          href="/dashboard/availability"
          onClick={onActionClick}
          className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
        >
          <span>Configure Shifts</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
