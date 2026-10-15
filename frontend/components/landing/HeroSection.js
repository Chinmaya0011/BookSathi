'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  ShieldCheck,
  Check,
  Stethoscope,
  Briefcase,
  Scale,
  GraduationCap,
  QrCode,
  Smartphone,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

const DEMO_PROFILES = [
  {
    id: 'doctor',
    role: 'Doctor OPD',
    name: 'Dr. Rajesh Sharma',
    degree: 'MBBS, MD (Internal Medicine)',
    location: 'Apollo Clinic, Bhubaneswar',
    fee: '₹500',
    feeNum: 500,
    icon: Stethoscope,
    color: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    slots: ['09:30 AM', '11:00 AM', '04:30 PM', '06:00 PM'],
    token: '#08',
    queueWait: '12 mins estimated wait',
  },
  {
    id: 'ca',
    role: 'CA / Tax',
    name: 'CA Priya Agarwal',
    degree: 'FCA, DISA (Tax Advisory)',
    location: 'Cuttack Chamber & Online',
    fee: '₹1,500',
    feeNum: 1500,
    icon: Briefcase,
    color: 'from-indigo-500 to-blue-600',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    slots: ['11:00 AM', '02:30 PM', '04:00 PM', '05:30 PM'],
    token: '#04',
    queueWait: 'Scheduled Consultation',
  },
  {
    id: 'lawyer',
    role: 'Advocate',
    name: 'Adv. Rohit Senapati',
    degree: 'High Court Chamber Counsel',
    location: 'High Court Rd, Cuttack',
    fee: '₹1,000',
    feeNum: 1000,
    icon: Scale,
    color: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    slots: ['10:00 AM', '03:00 PM', '05:00 PM', '06:30 PM'],
    token: '#03',
    queueWait: 'Chamber Briefing',
  },
  {
    id: 'coach',
    role: 'Mentor & Tutor',
    name: 'Prof. Ananya Mishra',
    degree: 'IIT-JEE Physics Specialist',
    location: 'Google Meet (1:1 Mentorship)',
    fee: '₹750',
    feeNum: 750,
    icon: GraduationCap,
    color: 'from-purple-500 to-violet-600',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    slots: ['04:00 PM', '05:30 PM', '07:00 PM', '08:30 PM'],
    token: '#05',
    queueWait: '1-on-1 Dedicated Session',
  },
];

export default function HeroSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(DEMO_PROFILES[0].slots[1]);
  const [booked, setBooked] = useState(false);
  const [clientName, setClientName] = useState('Rahul Verma');
  const [clientPhone, setClientPhone] = useState('9876543210');

  const profile = DEMO_PROFILES[activeIdx];
  const Icon = profile.icon;

  const handleProfileChange = (idx) => {
    setActiveIdx(idx);
    setSelectedSlot(DEMO_PROFILES[idx].slots[1]);
    setBooked(false);
  };

  const handleBook = (e) => {
    e.preventDefault();
    setBooked(true);
    toast.success(`Demo confirmed for ${profile.name}! Live Token ${profile.token} generated.`);
  };

  // Staggered Motion Container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/40">
      {/* Restrained Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-tr from-indigo-200/35 via-violet-200/25 to-emerald-100/35 blur-3xl -z-10 rounded-full pointer-events-none" />
      <div className="absolute top-36 right-0 w-80 h-80 bg-sky-100/40 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition & Conversion Actions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Live Pulsing Badge */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-100/80 shadow-xs text-xs font-bold text-slate-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-slate-600 font-semibold">Purpose-Built for Indian Practices</span>
                <span className="text-indigo-600 font-extrabold">• Direct UPI</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]"
            >
              Appointments Made Effortless.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600">
                Practice Runs Smarter.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Share your booking link, collect consultation fees directly through UPI with <strong className="text-slate-900 font-semibold">0% platform commission</strong>, and manage live appointment tokens — all without requiring your clients to download an app.
            </motion.p>

            {/* Key Value Points Badges */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-left max-w-xl mx-auto lg:mx-0"
            >
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">0% Commission</div>
                  <div className="text-[10px] text-slate-400">Direct to Bank UPI</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Live Tokens</div>
                  <div className="text-[10px] text-slate-400">Sequential OPD Queue</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
                <div className="w-6 h-6 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <QrCode className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">QR Standees</div>
                  <div className="text-[10px] text-slate-400">For Desk Walk-ins</div>
                </div>
              </div>
            </motion.div>

            {/* Call to Actions */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm shadow-md shadow-indigo-600/25 transition-all group"
                >
                  <span>Create Free Practice Page</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <a
                  href="#interactive-demo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold text-sm shadow-2xs transition-all"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Explore Live Product Suite</span>
                </a>
              </motion.div>
            </motion.div>

            {/* Trust Reassurance Footnote */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-slate-500 pt-1 font-medium"
            >
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Free forever starter plan
              </span>
              <span>•</span>
              <span>No credit card required</span>
              <span>•</span>
              <span>Setup in under 2 minutes</span>
            </motion.div>
          </motion.div>

          {/* Right Column: Realistic Product Dashboard Visual */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            {/* Floating Live Activity Pill Top */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="hidden sm:flex items-center gap-2.5 absolute -top-5 -left-6 z-20 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg shadow-slate-900/5"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                #08
              </div>
              <div className="text-left">
                <div className="text-[11px] font-extrabold text-slate-900">Dr. Rajesh OPD</div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Token #08 In Chamber
                </div>
              </div>
            </motion.div>

            {/* Floating Live UPI Badge Bottom */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="hidden sm:flex items-center gap-2.5 absolute -bottom-5 -right-5 z-20 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg shadow-slate-900/5"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
                ₹
              </div>
              <div className="text-left">
                <div className="text-[11px] font-extrabold text-slate-900">Direct UPI Settlement</div>
                <div className="text-[10px] text-slate-500 font-semibold">₹500 credited • 0% platform fee</div>
              </div>
            </motion.div>

            {/* Main Realistic Product Dashboard Container */}
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-900/10 overflow-hidden relative font-sans">
              
              {/* Dashboard Top Header with Practice Tabs */}
              <div className="p-4 bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Live Practice Preview
                    </span>
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                      Interactive
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live System
                  </span>
                </div>

                {/* Profession Tabs */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-800/80 rounded-xl">
                  {DEMO_PROFILES.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProfileChange(idx)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all truncate text-center cursor-pointer ${
                        activeIdx === idx
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {p.role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Details Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${profile.color} text-white flex items-center justify-center shadow-sm shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-extrabold text-slate-900">{profile.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{profile.degree}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-slate-900">{profile.fee}</div>
                    <div className="text-[10px] text-emerald-700 font-bold">0% UPI Fee</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{profile.location}</span>
                </div>
              </div>

              {/* Interactive Booking State vs Confirmed Pass State */}
              <AnimatePresence mode="wait">
                {!booked ? (
                  <motion.div
                    key="booking-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 sm:p-5 space-y-4"
                  >
                    {/* Slot Selector */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          Select Available Slot (Today)
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {profile.queueWait}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {profile.slots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-between cursor-pointer ${
                              selectedSlot === slot
                                ? 'bg-indigo-50/90 border-indigo-600 text-indigo-900 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span>{slot}</span>
                            {selectedSlot === slot && <Check className="w-3.5 h-3.5 text-indigo-600 stroke-[3]" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Client Details Preview */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Client Name
                          </label>
                          <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:border-indigo-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            WhatsApp Mobile
                          </label>
                          <input
                            type="text"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:border-indigo-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Instant Book Action */}
                    <div className="space-y-2 pt-1">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleBook}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Confirm Appointment • Pay {profile.fee} via UPI</span>
                      </motion.button>
                      <div className="text-[10px] text-center text-slate-400 font-medium">
                        Instant Direct UPI Settlement • Zero Middleman Fee
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Confirmed Digital Pass Preview */
                  <motion.div
                    key="confirmed-pass"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="p-4 sm:p-5 space-y-4 bg-emerald-50/25"
                  >
                    <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-900">Appointment Confirmed</span>
                        </div>
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                          Token {profile.token}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">PATIENT / CLIENT</span>
                          <span className="font-bold text-slate-800">{clientName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">CONFIRMED TIME</span>
                          <span className="font-bold text-slate-800">{selectedSlot} Today</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 flex items-center justify-between">
                        <span className="truncate flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp Pass sent to +91 {clientPhone}</span>
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 shrink-0">Delivered</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBooked(false)}
                        className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Try Another Booking</span>
                      </button>
                      <Link
                        href="/lookup"
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold text-center hover:bg-indigo-700 transition-colors"
                      >
                        Lookup Live Pass →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Card Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Instant Pass Lookup Sync
                </span>
                <span className="font-mono text-indigo-600 font-semibold">booksaathi.in/book/{profile.id}</span>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
