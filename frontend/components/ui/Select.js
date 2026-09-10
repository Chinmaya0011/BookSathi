'use client';

import { cn } from '@/lib/utils';

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  error,
  placeholder,
  className,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={cn(
          'w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all',
          error && 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <p className="text-[11px] text-rose-500 font-medium mt-1">{error}</p>}
    </div>
  );
}
