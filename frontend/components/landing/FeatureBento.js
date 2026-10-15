'use client';

import { motion } from 'framer-motion';
import {
  Clock,
  MessageCircle,
  QrCode,
  Percent,
  Sparkles,
  Lock,
  Smartphone,
  Calendar,
  Layers,
  ShieldCheck,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export default function FeatureBento() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="features" className="py-16 sm:py-24 bg-white border-t border-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Comprehensive Feature Suite</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Engineered for precision. Built for daily speed.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Eliminate phone interruptions, chaotic waiting rooms, and commission deductions with a purpose-built system.
          </p>
        </motion.div>

        {/* Bento Grid (Asymmetrical Layout) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch"
        >
          {/* Card 1: Wide (8 Cols) - Smart Concurrency & Buffer Engine */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="md:col-span-12 lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Core Scheduling Engine
                </span>
                <Clock className="w-5 h-5 text-indigo-400" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Concurrency Protection & Smart Buffer Engine
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Automatic slot generation with zero risk of double-booking. Set custom buffer times between appointments (5, 10, 15 mins), block lunch hours, and lock emergency leaves with 1 tap.
              </p>
            </div>

            {/* Visual Micro Mockup */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 relative z-10">
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Buffer Protection</div>
                <div className="text-xs font-bold text-white">10 Mins Between Slots</div>
                <div className="text-[10px] text-slate-400">Zero client overlap</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Concurrency Lock</div>
                <div className="text-xs font-bold text-white">Instant Slot Reserve</div>
                <div className="text-[10px] text-slate-400">Never double-booked</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Break & Leave</div>
                <div className="text-xs font-bold text-white">1-Click Holiday Lock</div>
                <div className="text-[10px] text-slate-400">Auto blocks slots</div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: 4 Cols - 0% UPI Direct Settlements */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="md:col-span-6 lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-5 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Direct Bank Payouts
                </span>
                <Percent className="w-5 h-5 text-emerald-600" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                0% Commission on UPI Fees
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Accept consultation payments directly to your personal or clinic UPI ID (GPay, PhonePe, Paytm). We deduct ₹0 from your earnings.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Direct UPI Settlement</span>
                <span className="text-emerald-600 font-extrabold">100% Retained</span>
              </div>
              <div className="text-[11px] text-slate-500">
                No 15-20% aggregator middleman cut.
              </div>
            </div>
          </motion.div>

          {/* Card 3: 4 Cols - Tabletop Acrylic QR Standees */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="md:col-span-6 lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-5 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                  Reception Standees
                </span>
                <QrCode className="w-5 h-5 text-violet-600" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                Printable QR Standee Studio
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Generate high-resolution printable acrylic standee PDFs with your practice branding for walk-in patients and front desk check-ins.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1 shadow-2xs">
              <div className="font-bold text-slate-800">1-Click PDF Studio</div>
              <div className="text-[11px] text-slate-500">Ready to print in A4 / Tabletop Acrylic size.</div>
            </div>
          </motion.div>

          {/* Card 4: 4 Cols - WhatsApp Cloud Slips & Reminders */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="md:col-span-6 lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-5 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Instant Delivery
                </span>
                <MessageCircle className="w-5 h-5 text-emerald-600" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                WhatsApp Digital Slips & Reminders
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Send instant appointment passes with token numbers, clinic Google Maps navigation, and automated reminder alerts before consultation.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1 shadow-2xs">
              <div className="font-bold text-slate-800">Reduces No-Shows by 90%</div>
              <div className="text-[11px] text-slate-500">Includes Google & Apple Calendar (.ics) sync.</div>
            </div>
          </motion.div>

          {/* Card 5: 4 Cols - Private & Encrypted Consultation Notes */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="md:col-span-6 lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-5 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Private & Secure
                </span>
                <Lock className="w-5 h-5 text-indigo-600" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                Confidential Case & Patient Notes
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Add confidential medical diagnoses, prescription notes, or legal case briefings visible only to you and your authorized staff.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1 shadow-2xs">
              <div className="font-bold text-slate-800">HIPAA & Privacy Compliant</div>
              <div className="text-[11px] text-slate-500">Encrypted client records with history search.</div>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
