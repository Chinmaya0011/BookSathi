'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  MessageCircle,
  Calendar,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { getProfessionalPublicUrl } from '@/lib/urlHelpers';

export default function DashboardHero({
  profile,
  loading,
  refreshing,
  copied,
  onRefresh,
  onOpenManualModal,
  onCopyBookingLink,
  onOpenUpgradeModal,
}) {
  const bookingUrl = getProfessionalPublicUrl(profile);
  const isPro =
    profile?.plan === 'PRO' &&
    (!profile?.planExpiresAt || new Date(profile.planExpiresAt) > new Date());

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hello! You can easily book an appointment or consultation with me directly here:\n${bookingUrl}`
  )}`;

  const displayName = profile?.name || 'Practitioner';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs font-sans relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Greeting & Practice Date */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate max-w-full">
              {getGreeting()}, {displayName}
            </h1>
            {profile?.isVerified && (
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" title="Verified Practice" />
            )}
            {isPro && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-black uppercase shrink-0">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                PRO
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 flex-wrap">
            <span className="font-semibold text-indigo-600 flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              {todayFormatted}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium truncate">
              {profile?.specialization || profile?.profession || 'Practice Desk'}
            </span>
          </div>
        </div>

        {/* Right: Primary Action Buttons (Responsive on Mobile & Desktop) */}
        <div className="grid grid-cols-4 sm:flex sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
          {/* Main "+ Add Booking" Button (Spans 2 cols on mobile) */}
          <button
            type="button"
            onClick={onOpenManualModal}
            className="col-span-2 sm:col-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
            <span className="truncate">Add Booking</span>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={onCopyBookingLink}
            className="col-span-1 sm:col-auto inline-flex items-center justify-center gap-1 px-2 sm:px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 border border-slate-200/90 text-xs font-semibold transition-colors cursor-pointer"
            title="Copy public booking link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-emerald-700 font-bold text-[11px] sm:text-xs truncate">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[11px] sm:text-xs truncate">Share</span>
              </>
            )}
          </button>

          {/* Utility Action Icons (WhatsApp + Refresh) */}
          <div className="col-span-1 sm:col-auto flex items-center gap-1 sm:gap-1.5 justify-end">
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors flex items-center justify-center"
              title="Share on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
            </a>

            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="flex-1 sm:flex-initial p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/90 transition-colors cursor-pointer flex items-center justify-center"
              title="Refresh dashboard"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 shrink-0 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

