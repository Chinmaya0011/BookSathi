import { cn } from '@/lib/utils';

export default function Badge({ status, children, className = '' }) {
  const normalized = (status || children || '').toString().toUpperCase();

  const styles = {
    BOOKED: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    CONFIRMED: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    DONE: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200/80',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/80',
    NO_SHOW: 'bg-slate-100 text-slate-600 border-slate-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200/80',
    WAITING: 'bg-sky-50 text-sky-700 border-sky-200/80',
    ARRIVED: 'bg-sky-50 text-sky-700 border-sky-200/80',
    CALLED: 'bg-emerald-500 text-white border-emerald-600 shadow-2xs',
    IN_PROGRESS: 'bg-amber-50 text-amber-800 border-amber-200/80',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    UNPAID: 'bg-slate-100 text-slate-700 border-slate-200/80',
    PRO: 'bg-gradient-to-r from-amber-500/15 to-purple-500/15 text-amber-900 border-amber-300/80',
    DEFAULT: 'bg-slate-100 text-slate-700 border-slate-200/80',
  };

  const badgeStyle = styles[normalized] || styles.DEFAULT;
  const isCalled = normalized === 'CALLED';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-tight transition-colors select-none',
        badgeStyle,
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          isCalled ? 'bg-white animate-ping' : 'bg-current opacity-75'
        )}
      />
      <span>{children || normalized}</span>
    </span>
  );
}
