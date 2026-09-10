'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function LandingInteractiveDemo() {
  const [dailyAppointments, setDailyAppointments] = useState(12);
  const [avgFee, setAvgFee] = useState(600);

  // Calculations
  const workingDays = 24;
  const monthlyRevenue = dailyAppointments * avgFee * workingDays;
  const annualRevenue = monthlyRevenue * 12;
  const hoursSavedPerMonth = Math.round((dailyAppointments * 8 * workingDays) / 60);
  const noShowSavingsPerMonth = Math.round(monthlyRevenue * 0.15); // Avg 15% recovered from upfront UPI / automated reminders

  return (
    <section id="calculator" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
            <Calculator className="w-3.5 h-3.5 text-indigo-600" />
            <span>Practice Growth & ROI Calculator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Calculate your time and revenue gains
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            See how much time you save and revenue you recover by replacing manual WhatsApp scheduling with an automated 0% commission booking link.
          </p>
        </div>

        {/* 2-Column Interactive Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Interactive Sliders & Live Projections */}
          <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Custom Practice Projections</h3>
                <p className="text-xs text-slate-500 mt-0.5">Adjust the sliders to match your current clinic or advisory volume:</p>
              </div>

              {/* Slider 1: Daily Clients */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Daily Appointments:</span>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    {dailyAppointments} appointments / day
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="40"
                  value={dailyAppointments}
                  onChange={(e) => setDailyAppointments(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>3 / day (Part-time)</span>
                  <span>20 / day (Busy clinic)</span>
                  <span>40 / day (Peak practice)</span>
                </div>
              </div>

              {/* Slider 2: Average Fee */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Average Consultation / Session Fee:</span>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    {formatINR(avgFee)} / client
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="3500"
                  step="50"
                  value={avgFee}
                  onChange={(e) => setAvgFee(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>₹200 (General)</span>
                  <span>₹1,500 (Specialist / CA)</span>
                  <span>₹3,500+ (Corporate Legal)</span>
                </div>
              </div>
            </div>

            {/* Projected Metric Callouts */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-center">
                <span className="text-[11px] font-semibold text-slate-600 block">Monthly Gross Billings</span>
                <span className="text-xl font-extrabold text-indigo-950 block mt-1">
                  {formatINR(monthlyRevenue)}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                  100% Direct to Your Bank
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-600 block">Staff Time Saved</span>
                <span className="text-xl font-extrabold text-slate-900 block mt-1">
                  ~{hoursSavedPerMonth} hrs
                </span>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  Every Month
                </span>
              </div>
            </div>
          </div>

          {/* Right: Side-by-Side Workflow Comparison */}
          <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Traditional WhatsApp vs. BookSaathi</h3>
              <p className="text-xs text-slate-500">Why thousands of Indian practitioners are making the switch:</p>

              <div className="mt-5 space-y-3">
                <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 space-y-2">
                  <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    Traditional Manual Scheduling
                  </span>
                  <ul className="text-xs text-rose-800 space-y-1 pl-5 list-disc">
                    <li>30+ minutes wasted daily texting back and forth for available slots</li>
                    <li>Frequent double-bookings and embarrassing client schedule clashes</li>
                    <li>Uncollected consultation fees and unannounced client no-shows</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    With BookSaathi Automated Link
                  </span>
                  <ul className="text-xs text-emerald-900 space-y-1 pl-5 list-disc">
                    <li>Clients self-book from your link or QR standee in 30 seconds</li>
                    <li>Instant database concurrency lock eliminates double-booking</li>
                    <li>Direct UPI collections with automated WhatsApp/SMS calendar invites</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-indigo-600/20 transition-all"
              >
                <span>Automate Your Practice for Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
