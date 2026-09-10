import { cn } from '@/lib/utils';

export default function Badge({ status, children, className = '' }) {
  const normalized = (status || children || '').toString().toUpperCase();

  const styles = {
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    COMPLETED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    NO_SHOW: 'bg-slate-100 text-slate-700 border-slate-200',
    DEFAULT: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const badgeStyle = styles[normalized] || styles.DEFAULT;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        badgeStyle,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children || normalized}
    </span>
  );
}
