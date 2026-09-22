'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const freeFeatures = [
    'Unlimited client appointments & bookings',
    'Custom branded booking link (booksaathi.in/book/your-name)',
    'Live Today queue & receptionist token caller',
    'Direct UPI fee collection with 0% platform commission',
    'Instant client pass lookup flow with phone number',
    'Email & calendar invites (.ics) for Google / Apple Calendar',
    'Concurrency protection against double-booking',
  ];

  const proFeatures = [
    'Everything in Starter Free plan',
    'Automated WhatsApp reminders & digital slips',
    'Custom Tabletop QR Standee PDF Studio',
    'Confidential patient / client consultation notes',
    'Verified Practice Badge on your booking page',
    'Custom clinic branding & Google Maps directions',
    'Priority WhatsApp & email practice support',
  ];

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Simple, honest pricing for every practice
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Start completely free forever. Upgrade only when you want WhatsApp automation and reception acrylic standees.
          </p>

          {/* Billing Switch Toggle */}
          <div className="pt-3 flex items-center justify-center">
            <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 inline-flex items-center gap-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  !isAnnual
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isAnnual
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${isAnnual ? 'bg-indigo-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                  Save 25%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 2 Pricing Cards Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Starter Free Tier Card */}
          <div className="p-8 sm:p-9 rounded-3xl bg-slate-50/60 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-8 hover:border-slate-300 transition-colors">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Starter Free
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">Solo Practice</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Everything you need to accept appointments online and run your daily token queue.
                </p>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black text-slate-900">₹0</span>
                <span className="text-xs font-bold text-slate-500">/ free forever</span>
              </div>

              <div className="space-y-3 pt-2">
                {freeFeatures.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/register"
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs text-center border border-slate-300 shadow-2xs transition-colors block"
            >
              Get Started Free Forever
            </Link>
          </div>

          {/* Pro Tier Card */}
          <div className="p-8 sm:p-9 rounded-3xl bg-gradient-to-b from-indigo-50/50 via-white to-white border-2 border-indigo-600 shadow-xl shadow-indigo-600/10 flex flex-col justify-between space-y-8 relative">
            
            {/* Top Recommended Tag */}
            <div className="absolute top-5 right-5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-600 text-white shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-300" /> Most Popular
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Pro Practice
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">Professional Practice</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  For clinics, chambers, and firms wanting automated WhatsApp slips & reception standees.
                </p>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black text-slate-900">
                  {isAnnual ? '₹149' : '₹199'}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  / month {isAnnual ? '(billed annually)' : ''}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {proFeatures.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 font-medium">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/register"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs text-center shadow-md shadow-indigo-600/25 transition-all active:scale-95 block"
            >
              Start Free 14-Day Pro Trial
            </Link>
          </div>

        </div>

        {/* Pricing Reassurance Strip */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero payment processing cut • Cancel anytime • No credit card needed for signup</span>
          </p>
        </div>

      </div>
    </section>
  );
}
