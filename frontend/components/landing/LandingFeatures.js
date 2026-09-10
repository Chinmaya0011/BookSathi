'use client';

import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Smartphone,
  BarChart3,
  Lock,
  Sparkles,
  Zap,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function LandingFeatures() {
  const primaryFeatures = [
    {
      icon: ShieldCheck,
      badge: 'Concurrency Guard',
      title: 'Atomic Double-Booking Shield',
      desc: 'Database-level compound unique indexing locks each selected slot in milliseconds. Never worry about embarrassing schedule collisions or overlapping client appointments.',
      highlight: 'Zero double-bookings guaranteed',
    },
    {
      icon: CreditCard,
      badge: 'Zero Commission',
      title: 'Direct UPI & Hybrid Payments',
      desc: 'Collect upfront digital fees directly into your bank via GPay, PhonePe, Paytm, or BHIM. Also supports walk-in desk payments with automated digital invoices.',
      highlight: '100% of fees credited instantly',
    },
    {
      icon: QrCode,
      badge: 'Physical Hardware',
      title: 'Acrylic QR Standee & Banner Kit',
      desc: 'Get an acrylic tabletop standee and clinic wall banner delivered to your office. Patients and walk-ins simply scan the QR code to self-book tokens on the spot.',
      highlight: 'Express courier across India',
    },
    {
      icon: Smartphone,
      badge: 'Frictionless UX',
      title: 'Instant WhatsApp & Calendar Sync',
      desc: 'Zero app downloads required. Clients book in 30 seconds from any mobile browser, receiving instant WhatsApp confirmations, Google Calendar links, and PDF receipts.',
      highlight: 'Under 30s booking flow',
    },
  ];

  const secondaryFeatures = [
    {
      icon: BarChart3,
      title: 'Practice Revenue & Peak Hour Analytics',
      desc: 'Track daily patient footfall, peak consulting hours, service revenue breakdown, and payment modes from your private dashboard.',
    },
    {
      icon: Lock,
      title: 'Bank-Grade Security & Client Privacy',
      desc: 'Tokenized sessions, role-based access controls, and strict data privacy protection for your client records and consultation notes.',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Engineered for Independent Practices</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything you need to automate your consultations
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            A comprehensive, lightweight platform purpose-built for Indian doctors, legal counsels, chartered accountants, and independent professionals.
          </p>
        </div>

        {/* 4 Core Bento Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {primaryFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/70 flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2 Auxiliary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {secondaryFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
