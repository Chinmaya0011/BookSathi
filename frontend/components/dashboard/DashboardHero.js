'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Calendar,
  RefreshCw,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hello! You can easily book an appointment or consultation with me directly here:\n${bookingUrl}`
  )}`;

  return (
    <div className="bg-slate-900 text-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-sm font-sans space-y-4">
      {/* Top Row: Doctor Profile Info + Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Doctor Identity */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            {profile?.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile?.name || 'Doctor'}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-700 shadow-xs"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600 border border-indigo-500 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-xs">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'Dr'}
              </div>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900"
              title="Practice Online"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {profile?.name || 'Doctor Practice'}
              </h1>
              {profile?.isVerified && (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" title="Verified Professional" />
              )}
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-300 font-medium">{profile?.profession || 'Doctor / Healthcare'}</span>
              {profile?.specialization && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="truncate max-w-[180px] sm:max-w-xs">{profile.specialization}</span>
                </>
              )}
              {profile?.city && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{profile.city}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Minimalist Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenManualModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Walk-In</span>
          </button>

          <Link
            href="/dashboard/appointments"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-medium border border-slate-700/80 transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Schedule</span>
          </Link>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing || loading}
            title="Refresh"
            aria-label="Refresh metrics"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all active:scale-90 cursor-pointer"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', (refreshing || loading) && 'animate-spin text-indigo-400')} />
          </button>
        </div>
      </div>

      {/* Bottom Minimalist Share Strip */}
      {profile?.bookingSlug && (
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-400 min-w-0">
            <span className="text-[11px] font-medium text-slate-500 shrink-0">Booking Link:</span>
            <span className="font-mono text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 truncate">
              {displayUrl || bookingUrl}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onCopyBookingLink}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-[11px] border border-slate-700/60 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium text-[11px] border border-emerald-500/20 transition-all"
            >
              <MessageCircle className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp</span>
            </a>

            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-[11px] border border-slate-700/60 transition-all"
            >
              <span>Visit</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
