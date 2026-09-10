'use client';

import { cn } from '@/lib/utils';

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
