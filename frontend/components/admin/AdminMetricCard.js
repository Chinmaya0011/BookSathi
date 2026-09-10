'use client';

import { cn } from '@/lib/utils';

export default function AdminMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'indigo',
}) {
  const colorMap = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border shadow-2xs', colorMap[color])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{value}</div>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            {trend && <span className="font-bold text-emerald-600">{trend}</span>}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
