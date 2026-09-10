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
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 text-sm font-medium">
            {prefix}
          </div>
        )}

        <input
          id={inputId}
          className={cn(
            'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-100 disabled:text-slate-500',
            prefix && 'pl-11',
            suffix && 'pr-11',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200',
            className
          )}
          {...props}
        />

        {suffix && (
          <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400 text-sm font-medium">
            {suffix}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}
