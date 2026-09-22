'use client';

import {
  Link as LinkIcon,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowRight,
  QrCode,
  Sparkles,
  Percent,
} from 'lucide-react';
import Link from 'next/link';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      stepBadge: 'Step 1 • 2 Mins',
      title: 'Configure Your Practice',
      desc: 'Set your consultation hours, slot durations (15/30/45 mins), buffer intervals, and upfront UPI consultation fees.',
      icon: Clock,
      visual: (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Clinic OPD Hours</span>
            <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100/70 px-2 py-0.5 rounded">
              Mon — Sat (Active)
            </span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] font-mono text-indigo-600 font-bold truncate flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>booksaathi.in/book/dr-rajesh</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            <span>Buffer: 10 mins</span>
            <span>Fee: ₹500 via UPI</span>
          </div>
        </div>
      ),
    },
    {
      num: '02',
      stepBadge: 'Step 2 • Zero App',
      title: 'Share Link or QR Standee',
      desc: 'Add your custom link to your WhatsApp bio, share on client chats, or place an acrylic QR standee on your reception desk.',
      icon: QrCode,
      visual: (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Client Booking Flow</span>
            <span className="text-indigo-600 font-bold text-[11px]">11:00 AM Slot</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
            <span className="font-semibold">Rahul Varma</span>
            <span className="text-emerald-600 font-bold text-[11px]">✓ ₹500 UPI Paid</span>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-emerald-600" />
            <span>WhatsApp Pass generated with Google Maps pin</span>
          </div>
        </div>
      ),
    },
    {
      num: '03',
      stepBadge: 'Step 3 • Live System',
      title: 'Run Live Queue & Tokens',
      desc: 'Call tokens in sequential order (#01, #02, #03), inject walk-ins in 5 seconds, and eliminate crowded waiting rooms forever.',
      icon: CheckCircle2,
      visual: (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Active Live Calling Desk</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-black">
              Now Serving
            </span>
          </div>
          <div className="bg-slate-900 text-white p-2 rounded-lg text-center flex items-center justify-between px-3">
            <span className="font-mono text-emerald-400 font-black text-sm">Token #04</span>
            <span className="text-[10px] text-slate-300">In Chamber</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold text-center">
            ✓ 0% Platform Commission Deducted
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Simple 3-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How BookSaathi streamlines your daily practice
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Built from the ground up for how Indian doctors, CAs, advocates, and independent consultants work.
          </p>
        </div>

        {/* 3 Step Cards Grid with subtle connector accents */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative group"
              >
                {/* Step Top Bar */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-slate-200 group-hover:text-indigo-200 transition-colors">
                      {step.num}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {step.stepBadge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Visual Preview Box */}
                <div>
                  {step.visual}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Fast Track CTA Strip */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold">
              Ready to automate your practice appointments today?
            </h4>
            <p className="text-xs sm:text-sm text-indigo-200">
              Join hundreds of Indian professionals saving 10+ hours every week.
            </p>
          </div>

          <Link
            href="/register"
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-indigo-900 font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 shrink-0 flex items-center gap-2"
          >
            <span>Create Your Free Link</span>
            <ArrowRight className="w-4 h-4 text-indigo-600" />
          </Link>
        </div>

      </div>
    </section>
  );
}
