import { cn } from '@/lib/utils';

export default function Badge({ status, children, className = '' }) {
  const normalized = (status || children || '').toString().toUpperCase();

  const styles = {
    BOOKED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    CONFIRMED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    DONE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    DEFAULT: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const badgeStyle = styles[normalized] || styles.DEFAULT;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wide',
        badgeStyle,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children || normalized}
    </span>
  );
}
