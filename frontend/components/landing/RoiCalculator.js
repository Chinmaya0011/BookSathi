'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Clock,
  PhoneOff,
  TrendingUp,
  Percent,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function RoiCalculator() {
  const [appointmentsPerDay, setAppointmentsPerDay] = useState(15);
  const [consultationFee, setConsultationFee] = useState(500);

  // Constants based on practice averages in India
  const workingDaysPerMonth = 26;
  const minutesSavedPerBooking = 8; // Calls, coordination, address directions, token inquiries
  const callsSavedPerBooking = 2.5; // Average phone calls before + during visit
  const typicalAggregatorCommission = 0.15; // 15% standard third-party platform fee

  // Calculations
  const monthlyAppointments = appointmentsPerDay * workingDaysPerMonth;
  const hoursSavedPerMonth = Math.round((monthlyAppointments * minutesSavedPerBooking) / 60);
  const phoneCallsEliminated = Math.round(monthlyAppointments * callsSavedPerBooking);
  const monthlyGrossRevenue = monthlyAppointments * consultationFee;
  const commissionSaved = Math.round(monthlyGrossRevenue * typicalAggregatorCommission);

  return (
    <section id="roi-calculator" className="py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50 to-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-2xs">
            <Calculator className="w-3.5 h-3.5 text-indigo-600" />
            <span>Interactive ROI & Time-Saved Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How much time & money will your practice save?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Slide the controls to calculate your monthly hours saved and direct commission savings.
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5 p-6 sm:p-8 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Inputs / Sliders */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Slider 1: Appointments per day */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-slate-800">
                    Appointments / Patients Per Day
                  </label>
                  <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-black text-sm border border-indigo-100">
                    {appointmentsPerDay} / day
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="60"
                  step="1"
                  value={appointmentsPerDay}
                  onChange={(e) => setAppointmentsPerDay(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>3 (Solo Consultant)</span>
                  <span>25 (Average Clinic)</span>
                  <span>60+ (Busy OPD)</span>
                </div>
              </div>

              {/* Slider 2: Average Consultation Fee */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-slate-800">
                    Average Consultation / Session Fee
                  </label>
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-black text-sm border border-emerald-200">
                    ₹{consultationFee}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>₹0 (Free Queue)</span>
                  <span>₹500 (OPD / Clinic)</span>
                  <span>₹3,000 (Legal / CA)</span>
                </div>
              </div>

              {/* Trust Callout */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>BookSaathi takes 0% commission on your fees</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Unlike traditional discovery aggregators that charge 15% to 20% cut on every booking, 100% of client UPI payments settle directly to your bank account with zero deductions.
                </p>
              </div>

            </div>

            {/* Right Calculated Results Showcase */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-lg space-y-6 relative overflow-hidden">
                
                {/* Subtle Background Glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Your Monthly Practice Impact
                  </span>
                  <span className="text-[11px] bg-emerald-400/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-400/30">
                    26 Work Days
                  </span>
                </div>

                {/* 3 Big Metric Highlights */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Hours Saved */}
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Time Saved</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      ~{hoursSavedPerMonth} hrs
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Less phone & desk interruptions
                    </div>
                  </div>

                  {/* Calls Eliminated */}
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-sky-300 font-semibold">
                      <PhoneOff className="w-3.5 h-3.5" />
                      <span>Calls Avoided</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {phoneCallsEliminated}+
                    </div>
                    <div className="text-[10px] text-slate-400">
                      WhatsApp passes handle inquiries
                    </div>
                  </div>

                  {/* Direct UPI Commission Retained */}
                  <div className="col-span-2 p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Commission Saved (vs 15% Portals)</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                        100% Retained
                      </span>
                    </div>

                    <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
                      +₹{commissionSaved.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-sans text-slate-300 font-normal">/ month retained</span>
                    </div>

                    <div className="text-[11px] text-slate-400 pt-0.5">
                      Based on ₹{monthlyGrossRevenue.toLocaleString('en-IN')} gross monthly consultation bookings.
                    </div>
                  </div>

                </div>

                {/* Call To Action */}
                <div className="pt-2">
                  <Link
                    href="/register"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs text-center shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Claim Your Free Practice Page Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
