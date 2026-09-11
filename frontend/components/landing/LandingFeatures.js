'use client';

import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  Search,
  MessageCircle,
  Zap,
  Repeat,
  Clock,
} from 'lucide-react';

export default function LandingFeatures() {
  const coreSteps = [
    {
      step: '01',
      title: 'Pick an Available Slot',
      desc: 'Patients view real-time 30-min slots on your personalized link (e.g. booksaathi.in/book/dr-rajesh) and pick their preferred time with zero app installation.',
      icon: Clock,
      badge: 'Zero Friction',
    },
    {
      step: '02',
      title: 'Instant Confirmation & WhatsApp',
      desc: 'Slots are locked instantly with concurrency guards to prevent double-booking. Both client and professional receive direct confirmation with token code.',
      icon: MessageCircle,
      badge: 'WhatsApp Sync',
    },
    {
      step: '03',
      title: 'Show Up & Mark Done',
      desc: 'Track today’s schedule on a single live queue. Mark appointments as Done or Cancel in one tap, with automatic read-time completion for past slots.',
      icon: CheckCircle2,
      badge: 'Today Queue',
    },
  ];

  const highlights = [
    {
      icon: Search,
      title: 'Zero-Login Phone Lookup',
      desc: 'Clients can find all their bookings anytime simply by entering their 10-digit phone number on /lookup. No passwords or accounts required.',
    },
    {
      icon: CreditCard,
      title: '0% Platform Commission',
      desc: 'Collect 100% of consultation fees directly at your clinic or via UPI. BookSaathi charges zero transaction commission on your bookings.',
    },
    {
      icon: Repeat,
      title: '1-Tap Book Again',
      desc: 'Returning patients can schedule follow-up appointments in a single tap with their contact details automatically pre-filled.',
    },
    {
      icon: Zap,
      title: '2-Minute Onboarding',
      desc: 'Set up your practice identity and working hours in 60 seconds. Sane defaults (30m slots, 10m buffer) are pre-configured automatically.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50/60 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section 1: The 3-Step Core Loop */}
        <div className="space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>The Radical Booking Loop</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              How BookSaathi Works in 3 Simple Steps
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every feature is built around one simple loop: Pick a slot → Confirm → Show up → Mark Done.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreSteps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black border border-indigo-100">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-xs font-black text-slate-400">
                        STEP {item.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{item.badge}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Core Platform Advantages Grid */}
        <div className="space-y-8 pt-6 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Built for Indian Practitioners & Clients
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Reliable, ultra-fast appointment scheduling without clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900">{h.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{h.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
