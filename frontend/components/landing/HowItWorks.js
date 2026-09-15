'use client';

import { Share2, CalendarCheck, CheckCircle2, ArrowRight, Smartphone, Link as LinkIcon, Users } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Share Your Link',
      desc: 'Create your professional booking page and share it on WhatsApp, Instagram, Google, or anywhere else.',
      icon: LinkIcon,
      accent: 'from-indigo-600 to-violet-600',
      tag: 'Share',
      visual: (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-700 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 truncate">
            <span>🔗</span>
            <span>booksaathi.in/book/dr-rajesh</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>1-tap share on WhatsApp</span>
            <span className="text-emerald-700 font-bold">● Active</span>
          </div>
        </div>
      ),
    },
    {
      num: '02',
      title: 'Customer Books',
      desc: 'Customer selects an available time, enters their name and mobile number, and confirms.',
      icon: Smartphone,
      accent: 'from-indigo-600 to-indigo-700',
      tag: 'Book',
      visual: (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Choose Slot</span>
            <span className="text-indigo-600 font-bold">11:30 AM</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
            Amit Kumar • +91 98765 43210
          </div>
        </div>
      ),
    },
    {
      num: '03',
      title: 'Show Up & Mark Done',
      desc: 'The appointment automatically appears in your live queue. Mark it Done, Cancel, or manage walk-ins.',
      icon: CheckCircle2,
      accent: 'from-emerald-600 to-teal-600',
      tag: 'Manage',
      visual: (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">Token #08 • Live Queue</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
              Confirmed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-full py-1 rounded-md bg-emerald-600 text-white text-[11px] font-bold text-center">
              ✓ Mark Done
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
            Simple 3-Step Flow
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
            From booking to done — without the complexity
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            A simple workflow designed around how Indian practices actually work.
          </p>

          {/* Flow Indicator Pill */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-extrabold text-slate-700">
            <span className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">Share</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">Book</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700">Manage</span>
          </div>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  {/* Step Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-slate-300 group-hover:text-indigo-600 transition-colors">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-indigo-600 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5 font-normal">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Embedded Step Visual */}
                <div className="pt-2">
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
