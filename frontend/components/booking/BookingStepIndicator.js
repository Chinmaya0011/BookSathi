'use client';

import { Check, Calendar, User, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BookingStepIndicator({ currentStep }) {
  const steps = [
    { id: 1, label: 'Service & Time', shortLabel: 'Slot', icon: Calendar },
    { id: 2, label: 'Patient Info', shortLabel: 'Details', icon: User },
    { id: 3, label: 'Confirmation', shortLabel: 'Confirmed', icon: CheckCircle2 },
  ];

  return (
    <div className="pt-3.5 pb-1 flex items-center justify-between text-xs">
      {steps.map((step, idx) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300',
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/20'
                    : isCurrent
                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-600/20 scale-105'
                    : 'bg-white text-slate-400 border border-slate-200'
                )}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
              <span
                className={cn(
                  'font-bold text-[11px] sm:text-xs transition-colors hidden sm:inline',
                  isCompleted
                    ? 'text-emerald-700'
                    : isCurrent
                    ? 'text-indigo-600 font-extrabold'
                    : 'text-slate-400'
                )}
              >
                {step.label}
              </span>
              <span
                className={cn(
                  'font-bold text-[10px] transition-colors sm:hidden',
                  isCompleted
                    ? 'text-emerald-700'
                    : isCurrent
                    ? 'text-indigo-600 font-extrabold'
                    : 'text-slate-400'
                )}
              >
                {step.shortLabel}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div className="flex-1 mx-2 sm:mx-3 h-0.5 rounded-full overflow-hidden bg-slate-200">
                <div
                  className={cn(
                    'h-full transition-all duration-500',
                    currentStep > step.id ? 'w-full bg-gradient-to-r from-emerald-500 to-indigo-600' : 'w-0'
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
