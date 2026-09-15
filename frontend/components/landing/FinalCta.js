'use client';

import Link from 'next/link';
import { ArrowRight, Search, Sparkles, ShieldCheck } from 'lucide-react';

export default function FinalCta() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-7">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ready in under 2 minutes</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] max-w-3xl mx-auto text-white">
          Stop managing appointments through endless WhatsApp messages.
        </h2>

        {/* Supporting text */}
        <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Create your booking link in under 2 minutes and let customers book when you're available.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-indigo-600/35 active:scale-95 transition-all text-center"
          >
            <span>Create My Free Booking Link</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/lookup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 hover:text-white border border-slate-700 font-bold text-sm sm:text-base active:scale-95 transition-all text-center"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Find My Booking</span>
          </Link>
        </div>

        {/* Value Subline */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 pt-3">
          <span className="text-slate-300 font-semibold">0% commission</span>
          <span>•</span>
          <span className="text-slate-300 font-semibold">Free forever plan</span>
          <span>•</span>
          <span>No credit card required</span>
        </div>

      </div>
    </section>
  );
}
