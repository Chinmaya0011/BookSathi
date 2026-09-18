'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, Stethoscope, User, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIAppointmentCard({ item, onActionClick }) {
  if (!item) return null;

  const isConfirmed = item.status === 'CONFIRMED' || item.status === 'BOOKED';
  const isPending = item.status === 'PENDING' || item.status === 'WAITING';
  const isCancelled = item.status === 'CANCELLED' || item.status === 'REJECTED';
  const isCompleted = item.status === 'COMPLETED' || item.status === 'DONE';

  const statusBadge = isConfirmed
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80'
    : isPending
    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80'
    : isCancelled
    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80'
    : isCompleted
    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/80'
    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-200 group">
      {/* Top Meta: Time & Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
          <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>{item.time || 'Scheduled Time'}</span>
          {item.token && (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-[10px] border border-slate-200 dark:border-slate-700">
              Token #{item.token}
            </span>
          )}
        </div>

        <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-semibold border shrink-0', statusBadge)}>
          {item.status || 'Confirmed'}
        </span>
      </div>

      {/* Doctor / Client Info */}
      <div className="space-y-1 my-2">
        <div className="flex items-start gap-2">
          {item.professional ? (
            <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          ) : (
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {item.professional || item.client || 'Specialist Consultation'}
            </h4>
            {item.specialization && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {item.profession ? `${item.profession} • ` : ''}
                {item.specialization}
              </p>
            )}
          </div>
        </div>

        {/* Service & Fee row */}
        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
          <span className="truncate font-medium">{item.service || 'Consultation'}</span>
          {item.fee && (
            <span className="font-bold text-slate-900 dark:text-white shrink-0 ml-auto">{item.fee}</span>
          )}
        </div>
      </div>

      {/* Footer: Date & Action */}
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{item.date || 'Upcoming'}</span>
          {item.appointmentCode && (
            <span className="font-mono text-slate-400 dark:text-slate-500 ml-1">({item.appointmentCode})</span>
          )}
        </div>

        <Link
          href="/dashboard/appointments"
          onClick={onActionClick}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View Details</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
