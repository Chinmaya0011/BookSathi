'use client';

import { motion } from 'framer-motion';
import {
  Link as LinkIcon,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowRight,
  QrCode,
  Sparkles,
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
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-left shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Clinic OPD Hours</span>
            <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
              Mon — Sat (Active)
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] font-mono text-indigo-600 font-bold truncate flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>booksaathi.in/book/dr-rajesh</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 font-medium">
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
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-left shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Client Booking Flow</span>
            <span className="text-indigo-600 font-bold text-[11px]">11:00 AM Slot</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between font-medium">
            <span className="font-bold text-slate-900">Rahul Varma</span>
            <span className="text-emerald-600 font-bold text-[11px]">✓ ₹500 UPI Paid</span>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
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
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-left shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Active Live Calling Desk</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-black">
              Now Serving
            </span>
          </div>
          <div className="bg-slate-900 text-white p-2.5 rounded-xl text-center flex items-center justify-between px-3">
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50/50 border-t border-slate-100 font-sans">
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
            <span>Simple 3-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How BookSaathi transforms your practice
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            From setup to your first live patient token in under two minutes. Zero app downloads for your clients.
          </p>
        </motion.div>

        {/* 3 Step Cards Grid with Connecting Visual Flow */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-stretch"
        >
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.num}
                variants={stepVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-6 group"
              >
                {/* Step Top */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-slate-300 font-mono group-hover:text-indigo-600 transition-colors">
                      {s.num}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[11px] border border-indigo-100">
                      {s.stepBadge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {s.desc}
                    </p>
                  </div>
                </div>

                {/* Step Interactive Micro-Visual */}
                <div className="pt-2">
                  {s.visual}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA Banner Strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Ready to automate your patient & client bookings?
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Create your custom booking link in 2 minutes. 100% free starter plan forever.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
