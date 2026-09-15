'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const freeFeatures = [
    'Unlimited client appointments',
    'Personal branded booking link',
    'Today live queue & calling',
    'Customer booking lookup flow',
    '0% platform commission',
    'Basic booking management',
  ];

  const proFeatures = [
    'Everything in Free plan',
    'Automated WhatsApp reminders & slips',
    '1-Tap Book Again for returning clients',
    'Custom branded booking slug',
    'Priority support & practice verification badge',
    'Advanced analytics & multi-service tariffs',
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
            Start free. Upgrade when your practice grows.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            No hidden charges, no surprise fees, and absolutely zero commission on your consultation revenue.
          </p>

          {/* Billing Interval Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200/80 inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isAnnual
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isAnnual
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${isAnnual ? 'bg-indigo-700 text-indigo-100' : 'bg-emerald-100 text-emerald-800'}`}>
                  Save 37%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 2 Pricing Cards Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Free Tier Card */}
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Free Forever
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">Free</h3>
                <p className="text-xs text-slate-600 mt-1">Ideal for solo practitioners getting started.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">₹0</span>
                <span className="text-xs font-bold text-slate-500">/ month</span>
              </div>

              <div className="space-y-3 pt-2">
                {freeFeatures.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Link
                href="/register"
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm border border-slate-300 shadow-2xs flex items-center justify-center gap-2 transition-all text-center"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Pro Tier Card (Prominent without new color theme) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-950 text-white border border-indigo-500/30 shadow-2xl relative flex flex-col justify-between space-y-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
                    For Growing Practices
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">Pro</h3>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-400/30">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Popular</span>
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {isAnnual ? '₹125' : '₹199'}
                </span>
                <span className="text-xs font-bold text-indigo-200">/ month</span>
                {isAnnual && (
                  <span className="text-[11px] text-indigo-300 font-normal ml-2">billed annually (₹1,499/yr)</span>
                )}
              </div>

              <div className="space-y-3 pt-2">
                {proFeatures.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs text-indigo-100 font-medium">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <Link
                href="/register"
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-indigo-600/40 flex items-center justify-center gap-2 active:scale-95 transition-all text-center"
              >
                <span>Start Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Clear Highlight Banner Underneath */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>No per-booking fees. Keep 100% of your consultation earnings.</span>
          </div>
        </div>

      </div>
    </section>
  );
}
