'use client';

import React from 'react';
import Link from 'next/link';
import { Tag, Clock, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIServiceCard({ items = [], title = 'Consultation Services & Tariffs', onActionClick }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs font-sans">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold text-slate-900 tracking-tight">{title}</h4>
        </div>
        <span className="text-[10px] text-slate-500 font-medium">Practice Tariffs</span>
      </div>

      <div className="space-y-2">
        {items.map((srv, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
          >
            <div className="min-w-0">
              <h5 className="font-bold text-slate-900 truncate">{srv.name}</h5>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{srv.duration}</span>
                </span>
                {srv.status && (
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded-md font-bold text-[10px]',
                      srv.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    )}
                  >
                    {srv.status}
                  </span>
                )}
              </div>
            </div>

            <span className="text-sm font-black text-slate-900 shrink-0 ml-3">{srv.fee}</span>
          </div>
        ))}
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 text-[11px]">Manage rates</span>
        <Link
          href="/dashboard/services"
          onClick={onActionClick}
          className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
        >
          <span>Edit Services</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
