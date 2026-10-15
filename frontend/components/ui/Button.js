'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const isButtonLoading = Boolean(loading || isLoading);
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none cursor-pointer';

  const variants = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-2xs hover:shadow-xs focus-visible:ring-indigo-500/30 border border-indigo-600/20',
    secondary:
      'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white shadow-2xs focus-visible:ring-slate-700/30 border border-slate-900/20',
    success:
      'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-2xs focus-visible:ring-emerald-500/30 border border-emerald-600/20',
    whatsapp:
      'bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da850] text-white shadow-2xs focus-visible:ring-emerald-400/30 border border-transparent font-semibold',
    outline:
      'border border-slate-200/90 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-slate-900 shadow-2xs focus-visible:ring-indigo-500/20',
    ghost:
      'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-200/60 focus-visible:ring-slate-400/20 border border-transparent',
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-2xs focus-visible:ring-rose-500/30 border border-rose-600/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base gap-2.5 font-bold',
  };

  return (
    <button
      type={type}
      disabled={disabled || isButtonLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isButtonLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
