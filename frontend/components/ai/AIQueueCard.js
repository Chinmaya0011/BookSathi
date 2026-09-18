'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, PlayCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIQueueCard({ data, title = "Today's Live Queue Status", onActionClick }) {
  if (!data) return null;

  const currentToken = data.currentServingToken || '0';
  const totalIssued = data.totalTokensIssued || 0;
  const waitingCount = data.waitingCount || 0;
  const nextToken = data.nextToken || 'None';
  const waitingPatients = Array.isArray(data.waitingPatients) ? data.waitingPatients : [];

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-bold text-slate-900 tracking-tight">{title}</h4>
        </div>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Queue
        </span>
      </div>

      {/* Grid of 3 Queue Metrics */}
      <div className="grid grid-cols-3 gap-2 my-3">
        <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-2 text-center">
          <span className="text-[10px] text-slate-500 font-medium block">Serving Now</span>
          <span className="text-base sm:text-lg font-black text-amber-600 block mt-0.5">
            {currentToken === '0' || currentToken === 'Not Started' ? '—' : `#${currentToken}`}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-2 text-center">
          <span className="text-[10px] text-slate-500 font-medium block">Waiting</span>
          <span className="text-base sm:text-lg font-black text-sky-700 block mt-0.5">
            {waitingCount}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-2 text-center">
          <span className="text-[10px] text-slate-500 font-medium block">Next Up</span>
          <span className="text-base sm:text-lg font-black text-emerald-700 block mt-0.5">
            {nextToken && nextToken !== 'None' ? `#${nextToken}` : '—'}
          </span>
        </div>
      </div>

      {/* Next Patients in Queue */}
      {waitingPatients.length > 0 && (
        <div className="space-y-1.5 my-2.5 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Next in line:
          </span>
          {waitingPatients.slice(0, 3).map((patient, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold text-indigo-700">#{patient.token}</span>
                <span className="text-slate-800 font-medium truncate">{patient.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium shrink-0 ml-2">
                {patient.service || 'Consultation'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span className="text-slate-500 font-medium">Total Tokens: <strong className="text-slate-900">{totalIssued}</strong></span>
        <Link
          href="/dashboard/appointments"
          onClick={onActionClick}
          className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>Open Queue Console</span>
        </Link>
      </div>
    </div>
  );
}
