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
  Search,
  Check,
  User,
  Phone,
  Zap,
} from 'lucide-react';
import { animate } from 'animejs';

export default function HeroSection() {
  const [selectedSlot, setSelectedSlot] = useState('11:30 AM');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const floatBadgeRef1 = useRef(null);
  const floatBadgeRef2 = useRef(null);
  const confirmCardRef = useRef(null);
  const heroCardRef = useRef(null);

  const slots = ['11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM'];

  // AnimeJS Floating Badges & Initial Entrance
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Continuous smooth floating animation for badge 1
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

    // Continuous smooth floating animation for badge 2
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

    // Gentle entrance for the main hero product mockup
    if (heroCardRef.current) {
      animate(heroCardRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.98, 1],
        duration: 800,
        ease: 'outCubic',
      });
    }
  }, []);

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setBookingConfirmed(true);

    // AnimeJS feedback pulse on slot change
    if (confirmCardRef.current) {
      animate(confirmCardRef.current, {
        scale: [0.96, 1],
        duration: 350,
        ease: 'outBack(2)',
      });
    }
  };

  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
      {/* Subtle SaaS Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none overflow-hidden">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-indigo-400/5 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content (7 cols on desktop) */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6 sm:space-y-7">
            {/* Small Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Practice & Booking OS for Local Professionals</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.08]">
              Your Practice.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-500">
                One Booking Link.
              </span>{' '}
              Zero WhatsApp Chaos.
            </h1>

            {/* Supporting Subtext */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Create your branded booking page in 2 minutes. Share it with your local clients on WhatsApp, Google Maps, or your chamber reception. Clients pick a slot in 10 seconds — without downloading any app.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-indigo-600/25 active:scale-95 transition-all"
              >
                <span>Create Free Booking Link</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <a
                href="#dashboard-preview"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm sm:text-base border border-slate-200/90 shadow-2xs active:scale-95 transition-all"
              >
                <span>See Today Queue</span>
              </a>
            </div>

            {/* Value Trust Subline */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-xs font-medium text-slate-500 pt-1">
              <span className="text-slate-700 font-semibold">0% platform commission</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700 font-semibold">Free forever tier</span>
              <span className="text-slate-300">•</span>
              <span>No client app required</span>
              <span className="text-slate-300">•</span>
              <span>2 min setup</span>
            </div>
          </div>

          {/* Right Hero Product Preview (5 cols on desktop) */}
          <div className="lg:col-span-5 relative">
            
            {/* AnimeJS Floating UI Badges */}
            <div
              ref={floatBadgeRef1}
              className="hidden sm:flex absolute -top-5 -left-6 z-20 items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl text-xs font-bold text-slate-800"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Token #08 allocated</span>
            </div>

            <div
              ref={floatBadgeRef2}
              className="hidden sm:flex absolute -bottom-5 -right-4 z-20 items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/90 shadow-xl text-xs font-bold text-emerald-800"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp slip confirmed</span>
            </div>

            {/* Interactive SaaS Product Card Mockup with AnimeJS Ref */}
            <div
              ref={heroCardRef}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-indigo-950/10 overflow-hidden relative transition-all duration-300"
            >
              {/* Card Browser Bar */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-mono text-[10px]">
                  booksaathi.in/book/dr-rajesh
                </div>
                <div className="w-6" />
              </div>

              {/* Profile Header Inside Mockup */}
              <div className="p-5 sm:p-6 bg-gradient-to-b from-indigo-50/50 to-white border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                    DR
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-slate-900 text-base">Dr. Rajesh Sharma</h3>
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 fill-indigo-50" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">General Physician • MBBS, MD</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Bhubaneswar, Odisha</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Booking Slots */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Available Today</span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    4 Slots Open
                  </span>
                </div>

                {/* 4 Interactive Time Slots */}
                <div className="grid grid-cols-2 gap-2.5">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleSlotClick(slot)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-600/30'
                            : 'bg-slate-50 hover:bg-indigo-50/60 text-slate-700 border border-slate-200/80'
                        }`}
                      >
                        <span>{slot}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Booking Confirmation Preview with AnimeJS Ref */}
                <div className="pt-2">
                  <div
                    ref={confirmCardRef}
                    className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100/90 text-left space-y-2 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Selected Consultation</span>
                      <span className="font-extrabold text-indigo-900">₹500</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Today at {selectedSlot}</span>
                      </span>
                      <span className="text-[11px] font-bold text-indigo-700">30 min slot</span>
                    </div>
                  </div>

                  <Link
                    href="/register"
                    className="w-full mt-3 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <span>Instant Confirm without Login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
