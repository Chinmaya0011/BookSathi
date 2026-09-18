'use client';

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';

export function AIProfessionalCard({ item, onActionClick }) {
  if (!item) return null;

  const profileUrl = item.bookingSlug ? `/profile/${item.bookingSlug}` : '/lookup';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            {item.name?.charAt(0) || 'P'}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" title="Verified Professional" />
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
              {item.profession ? `${item.profession} • ` : ''}
              {item.specialization || 'Specialist'}
            </p>

            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md border border-amber-200/80 dark:border-amber-800/80">
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                <span>{item.rating || '4.8'}</span>
              </span>

              {item.city && (
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <MapPin className="w-2.5 h-2.5 text-slate-400" />
                  <span>{item.city}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {item.fee && (
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 font-medium block">Fee</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{item.fee}</span>
          </div>
        )}
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
        <span className="text-slate-400">Instant Online Booking</span>
        <Link
          href={profileUrl}
          onClick={onActionClick}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View Profile</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
