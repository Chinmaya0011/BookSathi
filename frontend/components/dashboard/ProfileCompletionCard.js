'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Briefcase,
  Clock,
  User,
  Camera,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
} from 'lucide-react';
import { useSetupStatusStore } from '@/stores/useSetupStatusStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function ProfileCompletionCard() {
  const { setupStatus, loading } = useSetupStatusStore();
  const { profile } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const completionData = useMemo(() => {
    if (!setupStatus && !profile) return null;

    const hasServices = Boolean(setupStatus?.hasServices);
    const hasAvailability = Boolean(setupStatus?.hasAvailability);
    const hasProfileDetails = Boolean(
      profile?.specialization &&
      (profile?.address || profile?.businessName || profile?.city)
    );
    const hasPhoto = Boolean(profile?.profileImage);

    const steps = [
      {
        id: 'services',
        title: 'Services & Fees',
        desc: 'Pricing & duration',
        path: '/dashboard/services',
        icon: Briefcase,
        isCompleted: hasServices,
        actionLabel: 'Add',
      },
      {
        id: 'availability',
        title: 'Working Hours',
        desc: 'Weekly calendar shifts',
        path: '/dashboard/availability',
        icon: Clock,
        isCompleted: hasAvailability,
        actionLabel: 'Set',
      },
      {
        id: 'profile',
        title: 'Practice Details',
        desc: 'Specialty, address, city',
        path: '/dashboard/profile',
        icon: User,
        isCompleted: hasProfileDetails,
        actionLabel: 'Edit',
      },
      {
        id: 'photo',
        title: 'Profile Photo',
        desc: 'Public clinic avatar',
        path: '/dashboard/profile',
        icon: Camera,
        isCompleted: hasPhoto,
        actionLabel: 'Upload',
      },
    ];

    const completedCount = steps.filter((s) => s.isCompleted).length;
    const totalCount = steps.length;
    const percentage = Math.round((completedCount / totalCount) * 100);
    const isComplete = completedCount === totalCount;

    return { steps, completedCount, totalCount, percentage, isComplete };
  }, [setupStatus, profile]);

  if (dismissed || loading || !completionData || completionData.isComplete) {
    return null;
  }

  const { steps, completedCount, totalCount, percentage } = completionData;

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 p-3 sm:p-3.5 shadow-2xs font-sans transition-all duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Setup Checklist ({completedCount}/{totalCount} Done)
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {percentage}% Ready
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-2 py-0.5 rounded-lg hover:bg-indigo-50 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{collapsed ? 'View Steps' : 'Hide'}</span>
            {collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Dismiss checklist"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Step List */}
      {!collapsed && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-2 animate-in fade-in-50 duration-150">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={cn(
                    'p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-colors',
                    step.isCompleted
                      ? 'bg-emerald-50/40 border-emerald-100 text-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {step.isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-bold truncate text-[11px]">{step.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{step.desc}</p>
                    </div>
                  </div>

                  {!step.isCompleted && (
                    <Link
                      href={step.path}
                      className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px] hover:bg-indigo-700 shrink-0"
                    >
                      {step.actionLabel}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
