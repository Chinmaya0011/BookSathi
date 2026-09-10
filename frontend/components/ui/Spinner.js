'use client';

import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Spinner({ size = 'md', className, label }) {
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <RefreshCw className={cn('animate-spin text-indigo-600', sizeMap[size] || sizeMap.md)} />
      {label && <p className="text-xs text-slate-500 font-medium">{label}</p>}
    </div>
  );
}
