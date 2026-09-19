'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  MessageCircle,
  ShieldCheck,
  Zap,
  Stethoscope,
  Briefcase,
  Scale,
  Check,
  ChevronRight,
  Phone,
  QrCode,
} from 'lucide-react';
import { animate } from 'animejs';

const DEMO_PROFILES = [
  {
    id: 'doctor',
    role: 'Doctor',
    name: 'Dr. Rajesh Sharma',
    title: 'General Physician • MBBS, MD',
    location: 'Bhubaneswar, Odisha',
    avatar: 'DR',
    avatarBg: 'from-indigo-600 to-violet-600',
    slug: 'dr-rajesh',
    fee: '₹500',
    icon: Stethoscope,
    slots: ['11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM'],
    token: '#08',
  },
  {
    id: 'ca',
    role: 'CA / Tax',
    name: 'CA Priya Agarwal',
    title: 'Chartered Accountant • FCA, DISA',
    location: 'Cuttack & Online',
    avatar: 'PA',
    avatarBg: 'from-emerald-600 to-teal-600',
    slug: 'ca-priya',
    fee: '₹1,500',
    icon: Briefcase,
    slots: ['02:00 PM', '02:45 PM', '03:30 PM', '04:15 PM'],
    token: '#04',
  },
  {
    id: 'lawyer',
    role: 'Lawyer',
    name: 'Adv. Rohit Senapati',
    title: 'High Court Advocate • Corporate & Civil',
    location: 'Bhubaneswar Chamber',
    avatar: 'RS',
    avatarBg: 'from-amber-600 to-orange-600',
    slug: 'adv-rohit',
    fee: '₹1,000',
    icon: Scale,
    slots: ['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM'],
    token: '#03',
  },
];

export default function HeroSection() {
  const [activeProfileIdx, setActiveProfileIdx] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(DEMO_PROFILES[0].slots[1]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const floatBadgeRef1 = useRef(null);
  const floatBadgeRef2 = useRef(null);
  const heroCardRef = useRef(null);
  const confirmCardRef = useRef(null);

  const currentProfile = DEMO_PROFILES[activeProfileIdx];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Smooth floating physics for badge 1
    if (floatBadgeRef1.current) {
      animate(floatBadgeRef1.current, {
        translateY: [-6, 6],
        rotate: [-1, 1.5],
        duration: 3200,
        alternate: true,
        loop: true,
        ease: 'inOutQuad',
      });
    }

    // Smooth floating physics for badge 2
    if (floatBadgeRef2.current) {
      animate(floatBadgeRef2.current, {
        translateY: [5, -5],
        rotate: [1, -1.5],
        duration: 2800,
        alternate: true,
        loop: true,
        ease: 'inOutQuad',
      });
    }

    // Main mockup entrance
    if (heroCardRef.current) {
      animate(heroCardRef.current, {
        opacity: [0, 1],
        translateY: [24, 0],
        scale: [0.97, 1],
        duration: 900,
        ease: 'outCubic',
      });
    }
  }, []);

  const handleProfileChange = (idx) => {
    setActiveProfileIdx(idx);
    setSelectedSlot(DEMO_PROFILES[idx].slots[1]);
    setBookingConfirmed(false);
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setBookingConfirmed(true);

    if (confirmCardRef.current) {
      animate(confirmCardRef.current, {
        scale: [0.94, 1],
        duration: 300,
        ease: 'outBack(2)',
      });
    }
  };

  return (
    <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white border-b border-slate-800/60">
      {/* Dynamic Background Glowing Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none overflow-hidden opacity-35">
        <div className="absolute -top-10 left-1/4 w-[600px] h-[400px] bg-indigo-600 rounded-full blur-[140px]" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[350px] bg-violet-600 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-emerald-500 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Pitch (7 cols) */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6 sm:space-y-7">
            {/* Live Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-bold shadow-2xs backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Smart Practice OS & Live Queue for Local Experts</span>
            </div>

            {/* Main Punchy Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              Your Practice.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-300">
                One Booking Link.
              </span>{' '}
              Zero WhatsApp Chaos.
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Create your branded booking page in 2 minutes. Share it on WhatsApp, Google Maps, or your front desk QR standee. Clients book verified slots in 10 seconds — <strong>zero app downloads or passwords required</strong>.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-95 transition-all group cursor-pointer"
              >
                <span>Create Free Practice Link</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform stroke-[2.5]" />
              </Link>

              <a
                href="#live-simulator"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 hover:text-white font-bold text-sm sm:text-base border border-slate-700/80 shadow-sm active:scale-95 transition-all"
              >
                <span>See Today Queue</span>
              </a>
            </div>

            {/* Micro Trust Strip */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 text-xs font-semibold text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> 0% platform commission
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[3]" /> Free forever tier
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[3]" /> No client app required
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">2 min setup</span>
            </div>
          </div>

          {/* Right Column: Live Interactive Booking Simulation (5 cols) */}
          <div className="lg:col-span-5 relative" id="live-simulator">
            
            {/* AnimeJS Floating Physics Badges */}
            <div
              ref={floatBadgeRef1}
              className="hidden sm:flex absolute -top-5 -left-6 z-20 items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl text-xs font-bold text-slate-100"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Token {currentProfile.token} allocated</span>
            </div>

            <div
              ref={floatBadgeRef2}
              className="hidden sm:flex absolute -bottom-5 -right-4 z-20 items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-950/90 backdrop-blur-md border border-emerald-700/80 shadow-2xl text-xs font-bold text-emerald-200"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp slip confirmed</span>
            </div>

            {/* Main Interactive SaaS Card */}
            <div
              ref={heroCardRef}
              className="bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/80 shadow-2xl shadow-indigo-950/50 overflow-hidden relative"
            >
              {/* Browser Bar */}
              <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                  booksaathi.in/book/{currentProfile.slug}
                </div>
                <span className="w-6" />
              </div>

              {/* Archetype Quick Switcher inside Card */}
              <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-1.5">
                {DEMO_PROFILES.map((p, idx) => {
                  const isSelected = activeProfileIdx === idx;
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProfileChange(idx)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="truncate text-[11px]">{p.role}</span>
                    </button>
                  );
                })}
              </div>

              {/* Profile Card Header */}
              <div className="p-5 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 border-b border-slate-800">
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${currentProfile.avatarBg} text-white flex items-center justify-center font-black text-lg shadow-md shrink-0`}>
                    {currentProfile.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-white text-base truncate">{currentProfile.name}</h3>
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-400 font-medium truncate">{currentProfile.title}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{currentProfile.location}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Booking Controls */}
              <div className="p-5 space-y-4">
                
                {/* Slot Selector */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      <span>Today's Available Slots</span>
                    </span>
                    <span className="text-indigo-300 text-[11px] font-bold">Fee: {currentProfile.fee}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {currentProfile.slots.map((slot) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleSlotClick(slot)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/40 font-black'
                              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Instant Reactive Digital Pass Preview */}
                <div
                  ref={confirmCardRef}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-white text-xs">Digital Queue Token</span>
                    </div>
                    <span className="font-mono font-black text-sm text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800/60">
                      {currentProfile.token}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>Selected Slot: <strong className="text-slate-200">{selectedSlot}</strong></span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Zero-login pass
                    </span>
                  </div>
                </div>

                {/* CTA inside Preview */}
                <Link
                  href="/register"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
                >
                  <span>Start Accepting Bookings Like This</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
