'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function LandingPricing() {
  const [annualBilling, setAnnualBilling] = useState(false);

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Simple, Flat Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Transparent Pricing. No Per-Booking Fees.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your practice. Core appointment booking remains free forever.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="pt-2 flex items-center justify-center gap-3 text-xs font-bold">
            <span className={!annualBilling ? 'text-slate-900' : 'text-slate-500'}>Monthly</span>
            <button
              type="button"
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-12 h-6 rounded-full bg-slate-200 p-0.5 transition-colors relative cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-full bg-indigo-600 transition-transform ${
                  annualBilling ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={annualBilling ? 'text-slate-900' : 'text-slate-500'}>
              Annual <span className="text-emerald-600 font-extrabold">(Save 37%)</span>
            </span>
          </div>
        </div>

        {/* 2 Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* FREE PLAN */}
          <div className="bg-slate-50/80 rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Solo Starter
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                  Free Forever
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">Free</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-black text-slate-950">₹0</span>
                  <span className="text-xs font-semibold text-slate-500">/month</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Everything an individual doctor or practitioner needs to accept appointments online.
                </p>
              </div>

              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited client appointments</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Shareable booking link (booksaathi.in/book/handle)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live Today queue dashboard with count badge</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Customer booking lookup (zero login)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>0% platform commission on fees</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="w-full py-3 text-center bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl shadow-2xs transition-colors block"
            >
              Get Started Free
            </Link>
          </div>

          {/* PRO PLAN */}
          <div className="bg-gradient-to-b from-slate-950 to-indigo-950 text-white rounded-3xl border border-indigo-500/30 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Practice Growth
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black">
                  ⭐ PRO TIER
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Pro</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-black text-white">
                    {annualBilling ? '₹1,499' : '₹199'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {annualBilling ? '/year (₹125/mo)' : '/month'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2">
                  Complete practice automation with reminders & retention tools.
                </p>
              </div>

              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2 font-semibold text-white">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Everything in Free, plus:</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated WhatsApp reminder before appointment</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1-Tap "Book Again" for returning customers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom vanity booking slug handle</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Priority account triage tag</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="w-full py-3 text-center bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all block relative z-10"
            >
              Start Free & Upgrade in 1 Click
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
