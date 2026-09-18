'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIErrorState({
  message = "I couldn't connect right now. Please try again.",
  onRetry,
  className = '',
}) {
  return (
    <div
      className={cn(
        'p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs shadow-2xs space-y-2',
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold leading-relaxed">{message}</p>
        </div>
      </div>

      {onRetry && (
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={onRetry}
            className="text-[11px] font-bold bg-white hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl border border-rose-300 transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry Query</span>
          </button>
        </div>
      )}
    </div>
  );
}
