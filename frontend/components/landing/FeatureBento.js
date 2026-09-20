'use client';

import {
  Clock,
  MessageCircle,
  QrCode,
  Percent,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export default function FeatureBento() {
  const features = [
    {
      title: 'Smart Slot Scheduler',
      desc: 'Automatic slot generation with buffer times, holiday blocking, and concurrency protection against double-booking.',
      icon: Clock,
      badge: 'Core Engine',
    },
    {
      title: 'WhatsApp & SMS Digital Passes',
      desc: 'Clients receive instant appointment slips, token numbers, and one-tap calendar (.ics) sync directly on WhatsApp.',
      icon: MessageCircle,
      badge: 'Instant Delivery',
    },
    {
      title: 'Tabletop QR Standees',
      desc: 'Place custom QR codes at your reception desk for walk-in patients and clients to book and join the digital queue.',
      icon: QrCode,
      badge: 'Walk-in Support',
    },
    {
      title: '0% Platform Fee on UPI',
      desc: 'Accept consultation fees upfront directly to your UPI ID (GPay, PhonePe, Paytm) with zero platform middleman deduction.',
      icon: Percent,
      badge: 'Direct Bank Payouts',
    },
    {
      title: 'Private & Secure Client Notes',
      desc: 'Add confidential case briefings, medical notes, and consultation logs visible only to you.',
      icon: ShieldCheck,
      badge: 'Confidential',
    },
    {
      title: 'Practice Analytics & Insights',
      desc: 'Track completed appointments, new vs returning clients, and revenue growth with clear visual summaries.',
      icon: TrendingUp,
      badge: 'Analytics',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/80">
            Features
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything your practice needs. Nothing you don't.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Eliminate phone call interruptions, double-bookings, and crowded waiting rooms with a system built for Indian professionals.
          </p>
        </div>

        {/* 6 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 hover:bg-white transition-all space-y-3.5 group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
