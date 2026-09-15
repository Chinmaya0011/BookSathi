'use client';

import { useState } from 'react';
import {
  UserCheck,
  Users,
  MessageCircle,
  Percent,
  Repeat,
  PlusCircle,
  Sliders,
  Smartphone,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Clock,
  Phone,
  Check,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function FeatureBento() {
  const [activeQueueStatus, setActiveQueueStatus] = useState('In Chamber');
  const [demoPhoneInput, setDemoPhoneInput] = useState('98765 43210');

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white border-t border-slate-800/80">
      
      {/* Background Ambient Lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <div className="absolute top-1/4 left-1/4 w-[700px] h-[350px] bg-indigo-500 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[300px] bg-emerald-500 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/30 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Practice Superpowers</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
            Simple by design.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-300">
              Powerful where it matters.
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            Every feature is purposefully built around how Indian clinics, advisory chambers, and consultation desks actually operate every day.
          </p>
        </motion.div>

        {/* Asymmetrical Bento Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Bento Card 1 (Large 7 Cols): Zero-Login Guest Experience with Live Interactive Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-12 lg:col-span-7 p-7 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-indigo-500/40 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Zero Client Friction
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Zero-Login 10-Second Guest Booking
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2 font-normal max-w-xl">
                  Your clients book appointments without creating an account or downloading an app. They enter Name + WhatsApp number, verify with an email OTP, and immediately get their digital pass.
                </p>
              </div>
            </div>

            {/* Embedded Live Interactive UI Simulation inside Bento */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3 font-sans">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Client Booking Pass Simulator</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Token #08 Generated
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">1. Pick Slot</span>
                  <span className="font-black text-indigo-300 text-xs">Today • 11:30 AM</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">2. Verify Phone</span>
                  <span className="font-bold text-slate-300 text-xs">+91 98765 43210</span>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-800/60 space-y-1">
                  <span className="text-[10px] text-indigo-300 font-bold block">3. Pass Confirmed</span>
                  <span className="font-black text-emerald-400 text-xs">Token #08 • Dr. Rajesh</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 2 (5 Cols): 0% Platform Commission */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-12 lg:col-span-5 p-7 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-6 group hover:border-emerald-500/40 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Percent className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  100% Direct Revenue
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  0% Platform Commission
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2 font-normal">
                  Keep 100% of your consultation and service fees. We never deduct per-booking cuts or hold your revenue in escrow.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-900/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">Platform Cut</span>
                <span className="text-2xl font-black text-white">₹0 / booking</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Earnings</span>
                <span className="text-2xl font-black text-emerald-400">100% Yours</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 3 (4 Cols): Live Today Queue with Interactive Caller */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="md:col-span-6 lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-4 group hover:border-indigo-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Live Queue & Token Calling
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                See today's patients in real time with 1-click status transitions: Waiting → In Chamber → Completed.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-400">Current Token:</span>
                <span className="font-mono font-black text-indigo-400">Token #04</span>
              </div>
              <div className="flex gap-1.5">
                {['Waiting', 'In Chamber', 'Mark Done'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setActiveQueueStatus(status)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                      activeQueueStatus === status
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bento Card 4 (4 Cols): WhatsApp Direct Slips */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-6 lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-4 group hover:border-emerald-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                WhatsApp Confirmation Slips
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every booking generates an instant WhatsApp slip with appointment time, chamber map pin, and reference code.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-900/50 space-y-1.5 text-xs text-slate-200">
              <div className="flex items-center justify-between text-[10px] text-emerald-300 font-bold">
                <span>📱 WhatsApp Message</span>
                <span>Just Now</span>
              </div>
              <p className="text-[11px] leading-relaxed font-medium">
                "Namaste Amit! Your consultation with Dr. Rajesh Sharma is confirmed for 11:30 AM. Token #08."
              </p>
            </div>
          </motion.div>

          {/* Bento Card 5 (4 Cols): Walk-in Support & 1-Tap Rebooking */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="md:col-span-12 lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-4 group hover:border-amber-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Reception Walk-in Friendly
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Add walk-in patients who arrive without online booking directly into your active queue in 5 seconds.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Offline Patient:</span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                + Walk-in Assigned #09
              </span>
            </div>
          </motion.div>

          {/* Bento Card 6 (Full 12 Cols Ribbon): Smart Availability & Practice Slug */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-12 p-7 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800/90 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-indigo-500/50 transition-all"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Full Schedule Autonomy</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Custom Shifts, Emergency Blackouts & Branded Practice Links
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Set morning and evening shifts (e.g. 10 AM - 1 PM & 5 PM - 9 PM), slot lengths (15m, 30m, 60m), buffer gaps, and holidays in 1 click.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 font-bold flex items-center gap-2">
                <span>🔗 booksaathi.in/book/your-practice</span>
              </div>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-indigo-600/30 active:scale-95 transition-all text-center"
              >
                <span>Get Your Practice Link</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
