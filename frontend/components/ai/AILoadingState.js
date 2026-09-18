'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AILoadingState({ className = '' }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs max-w-fit animate-in fade-in duration-200',
        className
      )}
    >
      <div className="w-5 h-5 rounded-md bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shrink-0">
        <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" />
      </div>

      <div className="flex items-center gap-1.5 py-0.5">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          BookSaathi AI is thinking
        </span>
        <div className="flex items-center gap-1 ml-1">
          <span className="w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" />
          <span className="w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
          <span className="w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}
