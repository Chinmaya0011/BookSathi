'use client';

import Link from 'next/link';
import { ShieldCheck, MapPin, Briefcase, Globe, Navigation, Sparkles, Clock, CheckCircle2, Star, ChevronRight } from 'lucide-react';

export default function BookingDoctorHero({ profile }) {
  if (!profile) return null;

  const hasServices = Boolean(profile.appointmentTypes && profile.appointmentTypes.length > 0);

  return (
    <div className="bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 p-5 sm:p-7 text-slate-900 relative overflow-hidden">
      {/* Subtle ambient mesh glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

      <div className="relative z-10">
        {/* Top Trust & Status Bar */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 text-xs">
          {hasServices ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available for Consultations</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Schedule Initializing</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 text-[11px] text-indigo-700 font-bold px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Verified Practitioner</span>
          </div>
        </div>

        {/* Practitioner Main Info Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
          {/* Avatar with Tech Gradient Ring */}
          <div className="relative shrink-0 group">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-indigo-200 shadow-lg shadow-indigo-100 bg-slate-100 flex items-center justify-center font-black text-2xl text-indigo-600 ring-4 ring-indigo-50 group-hover:scale-105 transition-transform duration-300">
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
                <span className="bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'P'}
                </span>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="Verified & Available" />
          </div>

          {/* Name, Profession & Credentials */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">{profile.name}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                {profile.profession || 'Professional'}
              </span>
            </div>

            {profile.specialization && (
              <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                {profile.specialization}
              </p>
            )}

            {/* Badges strip: Experience, City, Directions, Languages */}
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-600">
              {(profile.businessName || profile.address || profile.city) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate max-w-[200px] font-medium">{[profile.businessName, profile.city].filter(Boolean).join(', ')}</span>
                </span>
              )}

              {profile.experienceYears && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  <Briefcase className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-medium">{profile.experienceYears}+ Yrs Exp</span>
                </span>
              )}

              {profile.languages && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  <Globe className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span className="font-medium">{profile.languages}</span>
                </span>
              )}

              {profile.googleMapUrl && (
                <a
                  href={profile.googleMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </a>
              )}

              <Link
                href={`/profile/${profile.bookingSlug || profile._id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold transition-all cursor-pointer shadow-2xs"
              >
                <span>Full Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
