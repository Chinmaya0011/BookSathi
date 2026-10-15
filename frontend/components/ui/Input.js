'use client';

import { cn } from '@/lib/utils';

export default function Input({
  label,
  error,
  helperText,
  prefix,
  suffix,
  className = '',
  containerClassName = '',
  required = false,
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 tracking-tight">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 text-xs sm:text-sm font-medium">
            {prefix}
          </div>
        )}

        <input
          id={inputId}
          className={cn(
            'w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200',
            prefix && 'pl-10 sm:pl-11',
            suffix && 'pr-10 sm:pr-11',
            error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200/90 hover:border-slate-300',
            className
          )}
          {...props}
        />

        {suffix && (
          <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400 text-xs sm:text-sm font-medium">
            {suffix}
          </div>
        )}
      </div>

      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
}
