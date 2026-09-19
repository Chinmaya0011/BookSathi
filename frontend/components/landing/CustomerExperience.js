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
  MessageCircle,
  MapPin,
  Sparkles,
} from 'lucide-react';

export default function CustomerExperience() {
  const guarantees = [
    'No account or password creation',
    'No app download required',
    'Direct WhatsApp booking slip & token',
    '1-tap Google Maps clinic directions',
  ];

  return (
    <section className="py-20 sm:py-28 bg-white text-slate-900 overflow-hidden border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column (6 cols) */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Zero-Login Client Experience
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Your clients don't need another app.
            </h2>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              Patients and advisory clients shouldn’t have to create passwords or download yet another 50MB app just to book a 15-minute consultation. They simply open your link, pick a time, and get their verified pass.
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

            {/* Find Booking Spotlight Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 text-left space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Search className="w-4 h-4 text-indigo-600" />
                <span>Instant Client Booking Lookup</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clients can enter their mobile number anytime on <strong>Find Booking</strong> to instantly pull up their digital pass, sequential token, and clinic details without logging in.
              </p>
              <Link
                href="/lookup"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>Try Client Lookup Flow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Mobile Phone Mockup (6 cols) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-sm rounded-[40px] bg-slate-950 p-3.5 shadow-2xl ring-1 ring-slate-800">
              
              {/* Top Notch Speaker */}
              <div className="h-5 flex items-center justify-center mb-1">
                <div className="w-20 h-1.5 rounded-full bg-slate-800" />
              </div>

              {/* Inner Mobile Screen */}
              <div className="rounded-[30px] bg-slate-900 p-5 sm:p-6 space-y-4 text-white border border-slate-800">
                
                {/* Header inside Phone */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                      B
                    </div>
                    <span>BookSaathi Pass</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                    ● Confirmed
                  </span>
                </div>

                {/* Token Pass Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white text-center space-y-1.5 shadow-lg border border-indigo-800/40">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                    Your Queue Token
                  </span>
                  <div className="text-3xl font-black text-white font-mono tracking-widest">
                    #08
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-white/10 text-emerald-300 text-[11px] font-bold">
                    Dr. Rajesh Sharma
                  </span>
                </div>

                {/* Details List */}
                <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Service:</span>
                    <span className="font-bold text-white">General Consultation</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Date & Time:</span>
                    <span className="font-bold text-white">Tomorrow • 11:30 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="font-bold text-white">Chamber 4, Bhubaneswar</span>
                  </div>
                </div>

                {/* Action Buttons inside Phone */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Save to WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-slate-400" />
                    <span>Add to Google Calendar</span>
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
