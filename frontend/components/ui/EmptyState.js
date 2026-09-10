'use client';

import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items to display at this moment.',
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        'p-8 sm:p-12 rounded-3xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center justify-center gap-3',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center shadow-2xs">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-sm sm:text-base font-bold text-slate-800">{title}</h4>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2 text-xs py-2 px-4 font-bold">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
