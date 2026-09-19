'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const freeFeatures = [
    'Unlimited client appointments',
    'Personal branded booking link',
    'Today live queue & calling desk',
    'Customer pass lookup flow',
    '0% platform commission',
    'Basic booking management',
  ];

  const proFeatures = [
    'Everything in Free plan',
    'Automated WhatsApp reminders & slips',
    'Printable Reception QR Standee PDF Studio',
    'Custom branded booking slug & theme',
    'Priority support & practice verification badge',
    'Client visit history & consultation notes',
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-slate-950 text-white overflow-hidden border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/20">
            Simple & Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Start free. Upgrade when your practice scales.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-normal">
            No hidden charges, zero transaction cut on your consultation fees, and no credit card required to start.
          </p>

          {/* Billing Interval Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isAnnual
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isAnnual
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${isAnnual ? 'bg-indigo-700 text-indigo-100' : 'bg-emerald-500/20 text-emerald-300'}`}>
                  Save 37%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 2 Pricing Cards Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Free Tier Card */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between space-y-8 hover:border-slate-700 transition-colors">
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Free Forever
                </span>
                <h3 className="text-2xl font-black text-white mt-1">Starter Desk</h3>
                <p className="text-xs text-slate-400 mt-1">Ideal for solo practitioners getting started.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">₹0</span>
                <span className="text-xs font-bold text-slate-400">/ forever</span>
              </div>

              <div className="space-y-3 pt-2">
                {freeFeatures.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-300 font-medium">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/register"
              className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center border border-slate-700 transition-colors block active:scale-98"
            >
              Start Free Today
            </Link>
          </div>

          {/* Pro Tier Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-950/80 via-slate-900 to-slate-900 border-2 border-indigo-500/60 shadow-2xl shadow-indigo-950/50 flex flex-col justify-between space-y-8 relative overflow-hidden">
            
            {/* Top Popular Ribbon */}
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-600 text-white shadow-xs">
                <Sparkles className="w-3 h-3" /> Recommended
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                  Professional Practice
                </span>
                <h3 className="text-2xl font-black text-white mt-1">Pro Practice OS</h3>
                <p className="text-xs text-slate-400 mt-1">For busy clinics, chambers, and advisory firms.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {isAnnual ? '₹125' : '₹199'}
                </span>
                <span className="text-xs font-bold text-slate-400">/ month</span>
              </div>

              <div className="space-y-3 pt-2">
                {proFeatures.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-200 font-medium">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/register"
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs text-center shadow-lg shadow-indigo-600/30 transition-all block active:scale-98"
            >
              Start 14-Day Free Pro Trial
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
