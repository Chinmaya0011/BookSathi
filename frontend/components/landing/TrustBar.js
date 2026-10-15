'use client';

import { motion } from 'framer-motion';
import {
  Percent,
  Smartphone,
  QrCode,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function TrustBar() {
  const metrics = [
    {
      stat: '0%',
      label: 'Platform Commission',
      desc: '100% of your consultation fee goes directly to your bank account via UPI.',
      icon: Percent,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200/80',
    },
    {
      stat: 'Zero App',
      label: 'Client Experience',
      desc: 'Clients book in 30 seconds via WhatsApp or Web without any app downloads.',
      icon: Smartphone,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200/80',
    },
    {
      stat: 'Live Tokens',
      label: 'Real-Time Queue',
      desc: 'Instant digital OPD tokens with live status updates, wait times & walk-ins.',
      icon: QrCode,
      color: 'text-violet-600 bg-violet-50 border-violet-200/80',
    },
    {
      stat: '< 2 Mins',
      label: 'Practice Onboarding',
      desc: 'Get your branded booking link, UPI QR & practice hours running instantly.',
      icon: Zap,
      color: 'text-amber-600 bg-amber-50 border-amber-200/80',
    },
  ];

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
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="py-10 sm:py-14 bg-white border-y border-slate-200/70 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Metric Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                variants={cardVariants}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 hover:bg-white transition-all shadow-xs group flex flex-col justify-between space-y-3 cursor-default"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform ${item.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight">
                      {item.stat}
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {item.label}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Badges Strip with Supported Payment Apps & Safety */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="pt-2 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 text-xs text-slate-500"
        >
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md font-bold text-[11px] border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Direct UPI Settlement
            </span>
            <span>Compatible with all Indian UPI Banking Apps:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 font-bold text-[11px] text-slate-700">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">Google Pay</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">PhonePe</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">Paytm UPI</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">BHIM UPI</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">Any Banking App</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
