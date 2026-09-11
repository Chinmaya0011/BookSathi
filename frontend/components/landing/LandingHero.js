'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Search,
  Phone,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Stethoscope,
  Calculator,
  Scale,
  GraduationCap,
} from 'lucide-react';
import { getProfessionalPublicUrl, getProfessionalDisplayUrl } from '@/lib/urlHelpers';

export default function LandingHero() {
  const router = useRouter();
  const [lookupPhone, setLookupPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    const cleanPhone = lookupPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length >= 10) {
      router.push(`/lookup`);
    } else {
      router.push('/lookup');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const directoryEl = document.getElementById('directory');
    if (directoryEl) {
      directoryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-indigo-50/20">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
        <div className="absolute top-12 right-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Live Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-800 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>BookSaathi Simple Booking Network (India)</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
              The Simplest Booking Flow for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                Indian Professionals
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              No bloated steps. No forced patient app downloads. Just the core loop:{' '}
              <strong className="text-slate-900 font-bold">Pick a slot → Confirm → Show up → Mark Done</strong>.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-sm shadow-xl shadow-indigo-600/25 transition-all"
              >
                <span>Create Free Booking Link (2 Mins)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#directory"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm shadow-xs transition-all active:scale-95"
              >
                <Search className="w-4 h-4 text-indigo-600" />
                <span>Browse Verified Professionals</span>
              </a>
            </div>

            {/* Quick Zero-Login Appointment Lookup Box */}
            <div className="pt-3 max-w-lg mx-auto lg:mx-0">
              <form
                onSubmit={handleLookupSubmit}
                className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-2"
              >
                <div className="relative flex-1 w-full">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="Enter mobile number to find your booking..."
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shrink-0 transition-colors cursor-pointer"
                >
                  Find Booking
                </button>
              </form>
              <p className="text-[11px] text-slate-400 mt-1.5 text-center lg:text-left">
                Zero login needed for customers • Find past and upcoming appointment slips
              </p>
            </div>

            {/* Key Value Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>0% Platform Commission</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Confirmation</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>₹0 Free Forever Tier</span>
              </span>
            </div>
          </div>

          {/* Right Column: Live Booking Loop Preview */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4">
              {/* Top Banner */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    DR
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Dr. Rajesh Sharma</h3>
                    <p className="text-[11px] text-slate-500 font-medium">General Physician • Bhubaneswar</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Live Link
                </span>
              </div>

              {/* Subdomain Preview Strip */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] font-bold text-indigo-700 truncate">
                  dr-rajesh.booksaathi.in
                </span>
                <Link
                  href="/book/dr-rajesh"
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-0.5"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* Real 3-Step Preview Flow */}
              <div className="space-y-2.5 pt-1 text-xs">
                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900 font-bold block">Pick 30-min Slot</strong>
                    <span className="text-slate-500 text-[11px]">e.g. Tomorrow at 11:30 AM</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900 font-bold block">Instant WhatsApp Slip</strong>
                    <span className="text-slate-500 text-[11px]">Token locked with 0% convenience fee</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="text-emerald-950 font-bold block">Show Up & Mark Done</strong>
                    <span className="text-emerald-700 text-[11px]">Synced directly to doctor's Today queue</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href="/book/dr-rajesh"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl text-center block shadow-md transition-colors"
              >
                Try Live Booking Demo (/book/dr-rajesh)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}