'use client';

import { ShieldCheck, MapPin, Briefcase, Globe, Navigation, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export default function BookingDoctorHero({ profile }) {
  if (!profile) return null;

  const hasServices = Boolean(profile.appointmentTypes && profile.appointmentTypes.length > 0);

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white relative overflow-hidden border-b border-slate-800/80">
      {/* Subtle background ambient mesh glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top Trust & Status Bar */}
        <div className="flex items-center justify-between gap-2 mb-5 pb-3 border-b border-white/10 text-xs">
          {hasServices ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Accepting Appointments</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Setup In Progress</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Verified BookSaathi Practitioner</span>
          </div>
        </div>

        {/* Practitioner Main Info Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          {/* Avatar with Status Ring */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-indigo-400/40 shadow-2xl bg-slate-800 flex items-center justify-center font-black text-2xl text-indigo-200 ring-4 ring-indigo-500/20">
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
                <span>{profile.name ? profile.name.charAt(0).toUpperCase() : 'P'}</span>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-xs" title="Verified Practitioner" />
          </div>

          {/* Name & Credentials */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">{profile.name}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30">
                <Sparkles className="w-3 h-3 text-indigo-300" />
                {profile.profession || 'Professional'}
              </span>
            </div>

            {profile.specialization && (
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {profile.specialization}
              </p>
            )}

            {/* Badges strip: Experience, Languages, City, Directions */}
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-300">
              {(profile.businessName || profile.address || profile.city) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate max-w-[200px]">{[profile.businessName, profile.city].filter(Boolean).join(', ')}</span>
                </span>
              )}

              {profile.experienceYears && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{profile.experienceYears}+ Yrs Exp</span>
                </span>
              )}

              {profile.languages && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200">
                  <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{profile.languages}</span>
                </span>
              )}

              {profile.googleMapUrl && (
                <a
                  href={profile.googleMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Get Directions</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Value Highlights Pill Bar */}
        <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-center text-[10px] sm:text-[11px] text-slate-300">
          <div className="flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Instant Confirmation</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Zero Waiting Queue</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Pay In-Person / Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
