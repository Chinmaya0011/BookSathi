'use client';

import Link from 'next/link';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Search,
  ArrowRight,
  ShieldCheck,
  Download,
  CalendarPlus,
  Lock,
} from 'lucide-react';

export default function CustomerExperience() {
  const guarantees = [
    'No account creation',
    'No password to memorize',
    'No app download required',
    'No unnecessary complex forms',
  ];

  return (
    <section className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text / Value Proposition (6 cols) */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Zero-Login Experience
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Your customers don't need another app.
            </h2>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              Patients and clients shouldn't have to create passwords or download yet another 50MB app just to book a 15-minute consultation.
            </p>

            {/* 4 Guarantees Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
              {guarantees.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{item}</span>
                </div>
              ))}
            </div>

            {/* Find Booking Spotlight Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Search className="w-4 h-4 text-indigo-600" />
                <span>Instant Customer Booking Lookup</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Customers can simply enter their WhatsApp mobile number on <strong>Find Booking</strong> at any time to instantly look up their tokens, date, and doctor details.
              </p>
              <Link
                href="/lookup"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>Try Customer Lookup Flow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Mobile Phone Pass Mockup (6 cols) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-sm rounded-[36px] bg-slate-900 p-3.5 shadow-2xl ring-1 ring-slate-800">
              
              {/* Phone Top Speaker Notch */}
              <div className="h-4 flex items-center justify-center mb-1">
                <div className="w-16 h-1 rounded-full bg-slate-800" />
              </div>

              {/* Inner Mobile Screen */}
              <div className="rounded-[28px] bg-white p-5 sm:p-6 space-y-4 text-slate-900 border border-slate-100">
                
                {/* Header in Phone */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                      B
                    </div>
                    <span>BookSaathi</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    ● Confirmed
                  </span>
                </div>

                {/* Token Pass Card inside Phone */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white text-center space-y-2 shadow-lg">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                    Queue Token
                  </span>
                  <div className="text-3xl font-black text-white font-mono tracking-widest">
                    #08
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-white/10 text-emerald-300 text-[11px] font-bold">
                    Dr. Rajesh Sharma
                  </span>
                </div>

                {/* Details List */}
                <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Service:</span>
                    <span className="font-bold text-slate-900">General Physician</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Date & Time:</span>
                    <span className="font-bold text-slate-900">Tomorrow • 11:30 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Consultation Fee:</span>
                    <span className="font-bold text-indigo-700">₹500 (Pay at clinic)</span>
                  </div>
                </div>

                {/* Action Buttons in Phone */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Add to Calendar</span>
                  </button>

                  <button
                    type="button"
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Slip</span>
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
