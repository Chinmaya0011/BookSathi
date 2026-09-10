'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  Briefcase,
  Clock,
  User,
  Camera,
  ChevronRight,
} from 'lucide-react';
import { useSetupStatusStore } from '@/stores/useSetupStatusStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function ProfileCompletionCard() {
  const { setupStatus, loading } = useSetupStatusStore();
  const { profile } = useAuth();

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
        title: 'Services & Tariffs',
        desc: 'Add consultation types, fee & duration',
        path: '/dashboard/services',
        icon: Briefcase,
        isCompleted: hasServices,
        actionLabel: 'Add Services',
      },
      {
        id: 'availability',
        title: 'Weekly Shifts',
        desc: 'Configure consultation working hours',
        path: '/dashboard/availability',
        icon: Clock,
        isCompleted: hasAvailability,
        actionLabel: 'Set Hours',
      },
      {
        id: 'profile',
        title: 'Practice Bio & City',
        desc: 'Add specialization, firm & address',
        path: '/dashboard/profile',
        icon: User,
        isCompleted: hasProfileDetails,
        actionLabel: 'Edit Details',
      },
      {
        id: 'photo',
        title: 'Profile Picture',
        desc: 'Upload photo for booking slips & QR',
        path: '/dashboard/profile',
        icon: Camera,
        isCompleted: hasPhoto,
        actionLabel: 'Upload Photo',
      },
    ];

    const completedCount = steps.filter((s) => s.isCompleted).length;
    const totalCount = steps.length;
    const percentage = Math.round((completedCount / totalCount) * 100);
    const isComplete = completedCount === totalCount;

    return { steps, completedCount, totalCount, percentage, isComplete };
  }, [setupStatus, profile]);

  if (loading || !completionData || completionData.isComplete) {
    return null;
  }

  const { steps, completedCount, totalCount, percentage } = completionData;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-50/70 to-indigo-50/60 border-2 border-amber-300/90 p-4 sm:p-6 shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Decorative Glow */}
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-200/70 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                Complete Your Practice Setup
              </h3>
              <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs">
                {percentage}% Done ({completedCount}/{totalCount} Steps)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Complete these steps so clients can book appointments online on your public page (<span className="font-mono text-indigo-700 font-semibold break-all">/book/{profile?.bookingSlug || 'your-slug'}</span>).
            </p>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full lg:w-48 shrink-0 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-600">Profile Readiness</span>
            <span className="text-amber-900 font-mono">{percentage}%</span>
          </div>
          <div className="w-full bg-slate-200/90 h-2.5 rounded-full overflow-hidden p-0.5 border border-amber-300/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 transition-all duration-700 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Step Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={cn(
                'p-3.5 rounded-2xl border transition-all flex flex-col justify-between active:scale-98',
                step.isCompleted
                  ? 'bg-white/90 border-emerald-200/90 shadow-2xs'
                  : 'bg-white border-amber-300/90 shadow-xs hover:border-indigo-400 hover:shadow-md'
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs',
                      step.isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-800'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {step.isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Done
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Circle className="w-2.5 h-2.5 text-amber-600 fill-amber-600" /> Pending
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-100">
                {step.isCompleted ? (
                  <Link
                    href={step.path}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    <span>Edit details</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <Link
                    href={step.path}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 active:scale-95 text-white text-xs font-bold transition-all shadow-2xs group cursor-pointer"
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-amber-300" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
