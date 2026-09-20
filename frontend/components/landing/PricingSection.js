'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const freeFeatures = [
    'Unlimited client bookings',
    'Custom booking link (booksaathi.in/book/your-slug)',
    'Today live queue & calling token desk',
    'Direct UPI fee collection with 0% commission',
    'Instant client pass lookup flow',
    'Email & calendar invites (.ics)',
  ];

  const proFeatures = [
    'Everything in Starter Free',
    'Automated WhatsApp reminders & digital slips',
    'Custom Tabletop QR Standee PDF Studio',
    'Confidential patient / client consultation notes',
    'Verified Practice Badge on booking page',
    'Priority email & WhatsApp practice support',
  ];

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/80">
            Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Simple, honest, transparent pricing
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Start completely free. Upgrade only when you want WhatsApp automation and reception standees.
          </p>

          {/* Billing Switch Toggle */}
          <div className="pt-3 flex items-center justify-center">
            <div className="p-1 rounded-xl bg-slate-100 border border-slate-200/80 inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  !isAnnual
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isAnnual
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isAnnual ? 'bg-indigo-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                  Save 25%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 2 Pricing Cards Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Free Tier Card */}
          <div className="p-7 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-6 hover:border-slate-300 transition-colors">
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Starter Free
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Solo Practice</h3>
                <p className="text-xs text-slate-500 mt-1">Everything you need to accept appointments online.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">₹0</span>
                <span className="text-xs font-semibold text-slate-500">/ forever</span>
              </div>

              <div className="space-y-2.5 pt-2">
                {freeFeatures.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/register"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs text-center transition-colors block"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Tier Card */}
          <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-b from-indigo-50/40 via-white to-white border-2 border-indigo-600 shadow-md shadow-indigo-600/5 flex flex-col justify-between space-y-6 relative">
            
            {/* Top Recommended Tag */}
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                <Sparkles className="w-3 h-3" /> Popular
              </span>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Pro Practice
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Professional Practice</h3>
                <p className="text-xs text-slate-500 mt-1">For busy clinics, chambers, and growing practices.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">
                  {isAnnual ? '₹149' : '₹199'}
                </span>
                <span className="text-xs font-semibold text-slate-500">/ month</span>
              </div>

              <div className="space-y-2.5 pt-2">
                {proFeatures.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 font-medium">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/register"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center shadow-sm shadow-indigo-600/20 transition-colors block"
            >
              Start Free 14-Day Pro Trial
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
