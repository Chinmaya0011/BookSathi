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
  Share2,
  Sparkles,
  MessageCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { getProfessionalPublicUrl, getProfessionalDisplayUrl } from '@/lib/urlHelpers';
import { subscriptionService } from '@/services/subscription.service';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardHero({
  profile,
  loading,
  refreshing,
  copied,
  onRefresh,
  onOpenManualModal,
  onCopyBookingLink,
}) {
  const { refreshProfile } = useAuth();
  const [upgrading, setUpgrading] = useState(false);

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
    <div className="bg-gradient-to-r from-white via-indigo-50/20 to-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm font-sans relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Professional Identity & Live Badge */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            {profile?.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile?.name || 'Doctor'}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-600/20">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'Dr'}
              </div>
            )}
            <span
              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white"
              title="Practice Online & Taking Bookings"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                {profile?.name || 'Practice Desk'}
              </h1>
              {profile?.isVerified && (
                <ShieldCheck
                  className="w-4 h-4 text-emerald-600 shrink-0"
                  title="Verified Practice"
                />
              )}
              {isPro ? (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-wide">
                  Pro Practice
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wide">
                  Standard Plan
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="font-semibold text-slate-700">
                {profile?.specialization || profile?.profession || 'General Consultation'}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                <Calendar className="w-3 h-3" />
                <span>Today: {todayFormatted}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Primary Command Center Actions */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Main 1-Click Walk-In Booking Action */}
          <button
            type="button"
            onClick={onOpenManualModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            <span>Add Walk-In Patient</span>
          </button>

          {/* Copy Public Link */}
          <button
            type="button"
            onClick={onCopyBookingLink}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Copy your shareable public booking link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
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
            className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shrink-0"
            title="Share booking link on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>

          {/* Refresh Data */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors shrink-0"
            title="Refresh live appointment queue"
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
