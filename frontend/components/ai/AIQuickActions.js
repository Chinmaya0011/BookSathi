'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Calendar, Users, Sparkles, Layers, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIQuickActions({ actions = [], onActionClick, className = '' }) {
  if (!actions || actions.length === 0) return null;

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'VIEW_APPOINTMENTS':
      case 'BOOK_APPOINTMENT':
        return <Calendar className="w-3.5 h-3.5" />;
      case 'VIEW_QUEUE':
        return <Clock className="w-3.5 h-3.5" />;
      case 'VIEW_SERVICES':
        return <Layers className="w-3.5 h-3.5" />;
      case 'UPGRADE_PRO':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'VIEW_PROFILE':
        return <Users className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800', className)}>
      {actions.map((act, idx) => {
        if (!act.href && !act.action) return null;

        const isUpgrade = act.action === 'UPGRADE_PRO' || act.label?.includes('Upgrade');

        return (
          <Link
            key={idx}
            href={act.href || '/dashboard'}
            onClick={onActionClick}
            className={cn(
              'text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer active:scale-95 group',
              isUpgrade
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
            )}
          >
            {getActionIcon(act.action)}
            <span>{act.label}</span>
            <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        );
      })}
    </div>
  );
}
