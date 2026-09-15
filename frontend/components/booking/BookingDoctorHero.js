'use client';

import Link from 'next/link';
import { ShieldCheck, MapPin, Briefcase, Globe, Navigation, Sparkles, Clock, CheckCircle2, Star, ChevronRight } from 'lucide-react';

export default function BookingDoctorHero({ profile }) {
  if (!profile) return null;

  const hasServices = Boolean(profile.appointmentTypes && profile.appointmentTypes.length > 0);

  return (
    <div className="bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950 p-5 sm:p-7 text-white relative overflow-hidden border-b border-slate-800/80">
      {/* Dynamic ambient mesh glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10">
        {/* Top Trust & Status Bar */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10 text-xs">
          {hasServices ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-[11px] shadow-sm shadow-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Available for Consultations</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Schedule Initializing</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 text-[11px] text-indigo-300 font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Verified Practitioner</span>
          </div>
        </div>

        {/* Practitioner Main Info Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
          {/* Avatar with Tech Gradient Ring */}
          <div className="relative shrink-0 group">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-indigo-400/40 shadow-xl bg-slate-800 flex items-center justify-center font-black text-2xl text-indigo-200 ring-4 ring-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="bg-gradient-to-br from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'P'}
                </span>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-xs" title="Verified & Online" />
          </div>

          {/* Name, Profession & Credentials */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">{profile.name}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30">
                <Sparkles className="w-3 h-3 text-indigo-300" />
                {profile.profession || 'Professional'}
              </span>
            </div>

            {profile.specialization && (
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {profile.specialization}
              </p>
            )}

            {/* Badges strip: Experience, City, Directions, Languages */}
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-300">
              {(profile.businessName || profile.address || profile.city) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-200 backdrop-blur-md">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate max-w-[200px]">{[profile.businessName, profile.city].filter(Boolean).join(', ')}</span>
                </span>
              )}

              {profile.experienceYears && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-200 backdrop-blur-md">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{profile.experienceYears}+ Yrs Exp</span>
                </span>
              )}

              {profile.languages && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-200 backdrop-blur-md">
                  <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{profile.languages}</span>
                </span>
              )}

              {profile.googleMapUrl && (
                <a
                  href={profile.googleMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </a>
              )}

              <Link
                href={`/profile/${profile.bookingSlug || profile._id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all cursor-pointer shadow-xs"
              >
                <span>View Full Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
