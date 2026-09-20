'use client';

import { Link as LinkIcon, Smartphone, CheckCircle2 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Set Your Availability',
      desc: 'Define your working hours, slot durations, consultation fees, and buffer times in 2 minutes.',
      icon: LinkIcon,
      visual: (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Practice Hours</span>
            <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md">Mon — Sat</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-700 font-semibold bg-white p-2 rounded-lg border border-slate-200 truncate">
            <span>🔗</span>
            <span>booksaathi.in/book/dr-rajesh</span>
          </div>
        </div>
      ),
    },
    {
      num: '02',
      title: 'Share Link or QR Standee',
      desc: 'Put your link in your WhatsApp bio, share on chat, or place a tabletop QR code in your clinic.',
      icon: Smartphone,
      visual: (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Client Booking</span>
            <span className="text-indigo-600 font-bold">11:30 AM Slot</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-600">
            ✓ Rahul Sharma • ₹500 via UPI
          </div>
        </div>
      ),
    },
    {
      num: '03',
      title: 'Automate & Run Live Queue',
      desc: 'Clients receive instant WhatsApp slips with digital tokens. Track your real-time waiting list smoothly.',
      icon: CheckCircle2,
      visual: (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Token #08 • Active Queue</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Confirmed
            </span>
          </div>
          <div className="bg-indigo-600 text-white text-center py-1.5 rounded-lg text-xs font-semibold">
            ✓ Live Status Updates
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/80">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Streamlined in 3 simple steps
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Designed specifically for how Indian independent professionals and clinics operate every day.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-slate-300">
                      {step.num}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>

                <div>
                  {step.visual}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
