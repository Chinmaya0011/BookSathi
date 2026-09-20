'use client';

import Link from 'next/link';
import { ArrowRight, Search, Sparkles, Check } from 'lucide-react';

export default function FinalCta() {
  return (
    <section className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
        
        {/* Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ready in under 2 minutes</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
          Stop managing appointments through chaotic WhatsApp messages.
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Create your branded booking page today and let clients book confirmed slots with zero phone call interruptions.
        </p>

        {/* CTA Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <span>Create Your Free Booking Page</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/lookup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-sm transition-all active:scale-95"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Find Booking Pass</span>
          </Link>
        </div>

        {/* Reassurance */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pt-2">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <Check className="w-3.5 h-3.5" /> 0% commission
          </span>
          <span>•</span>
          <span>Free tier forever</span>
          <span>•</span>
          <span>No credit card needed</span>
        </div>

      </div>
    </section>
  );
}
