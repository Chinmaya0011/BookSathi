'use client';

import Link from 'next/link';
import { ArrowRight, Search, Sparkles, Check, ShieldCheck, Zap } from 'lucide-react';

export default function FinalCta() {
  return (
    <section className="py-20 sm:py-28 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Ambient Glowing Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-indigo-600/20 via-violet-600/20 to-emerald-600/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Set up in under 2 minutes • 0% Commission</span>
        </div>

        {/* Main Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-[1.15]">
          Stop losing billable hours to chaotic phone calls and WhatsApp messages.
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Create your branded booking page today. Give your patients and clients a frictionless 30-second booking pass and live token queue.
        </p>

        {/* CTA Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-indigo-500/25 transition-all active:scale-95 group"
          >
            <span>Create Your Free Practice Page</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/lookup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 text-slate-200 hover:text-white border border-slate-800 font-bold text-sm sm:text-base shadow-xs transition-all active:scale-95"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Find Booking Pass</span>
          </Link>
        </div>

        {/* Reassurance Feature Strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-4 font-medium">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Check className="w-4 h-4" /> 0% UPI commission
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> Free forever starter plan
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Zap className="w-4 h-4 text-amber-400" /> No credit card needed
          </span>
        </div>

      </div>
    </section>
  );
}
