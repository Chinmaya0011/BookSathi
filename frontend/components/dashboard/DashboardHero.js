'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Calendar,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Clock,
  QrCode,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { getProfessionalPublicUrl, getProfessionalDisplayUrl } from '@/lib/urlHelpers';

export default function DashboardHero({
  profile,
  loading,
  refreshing,
  copied,
  onRefresh,
  onOpenManualModal,
  onCopyBookingLink,
}) {
  const bookingUrl = getProfessionalPublicUrl(profile);
  const displayUrl = getProfessionalDisplayUrl(profile);

  const isPro =
    profile?.plan === 'PRO' &&
    (!profile?.planExpiresAt || new Date(profile.planExpiresAt) > new Date());

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hello! You can easily book an appointment or consultation with me directly here:\n${bookingUrl}`
  )}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs font-sans relative overflow-hidden">
      {/* Subtle Background Accent Mesh */}
      <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-50/60 via-slate-50/20 to-transparent pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Professional Identity & Live Practice Status */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            {profile?.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile?.name || 'Professional'}
                className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md shadow-indigo-600/20">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'P'}
              </div>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white"
              title="Practice Online & Taking Bookings"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">
                {profile?.name || 'Practice Desk'}
              </h1>
              {profile?.isVerified && (
                <ShieldCheck
                  className="w-4 h-4 text-emerald-600 shrink-0"
                  title="Verified Practice"
                />
              )}
              {isPro ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-wide">
                  PRO
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold uppercase tracking-wide">
                  Standard
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                {profile?.specialization || profile?.profession || 'General Consultation'}
              </span>
              <span className="text-slate-300">•</span>
              <Link
                href="/dashboard/availability"
                className={`inline-flex items-center gap-1 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border transition-all ${
                  profile?.bookingType === 'QUEUE'
                    ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                }`}
                title="Change Booking Mode"
              >
                <span>{profile?.bookingType === 'QUEUE' ? '🎟️ Live Queue' : '📅 Time Slots'}</span>
              </Link>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/70 text-[11px]">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>{todayFormatted}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls Toolbar */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          {/* Main Walk-In Button */}
          <button
            type="button"
            onClick={onOpenManualModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Walk-In</span>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={onCopyBookingLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90 text-xs font-semibold transition-colors cursor-pointer shrink-0"
            title="Copy public booking link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          {/* WhatsApp Share */}
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-colors shrink-0"
            title="Share booking link on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>

          {/* Refresh Data */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/90 transition-colors shrink-0 cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw
              className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin text-indigo-600' : ''}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
