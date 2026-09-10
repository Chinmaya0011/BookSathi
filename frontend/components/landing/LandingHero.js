'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Stethoscope,
  Scale,
  Calculator,
  GraduationCap,
  Briefcase,
  Dumbbell,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  Star,
  Zap,
  CreditCard,
  Video,
  MapPin,
  QrCode,
  Check,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { getProfessionalPublicUrl } from '@/lib/urlHelpers';

const PROFESSIONS = [
  {
    id: 'doctor',
    label: 'Doctor & Clinic',
    icon: Stethoscope,
    name: 'Dr. Rajesh Sharma',
    avatarText: 'RS',
    avatarGradient: 'from-blue-600 to-indigo-600',
    badge: 'MBBS, MD • Cardiologist',
    city: 'Bhubaneswar, Odisha',
    exp: '14+ Yrs Exp',
    rating: '4.95',
    reviewsCount: '420+',
    fee: 500,
    unit: 'consult',
    slug: 'dr-rajesh',
    service: 'Clinical Consultation',
    mode: 'In-Clinic & Video',
    dates: ['Today', 'Tomorrow', 'Sun, 7 Sep'],
    slots: {
      Morning: ['09:30 AM', '10:30 AM', '11:45 AM'],
      Evening: ['05:00 PM', '06:30 PM', '07:15 PM'],
    },
    liveAlert: {
      title: 'UPI Payment Credited',
      amount: '₹500',
      from: 'PhonePe UPI • 0% Fee',
    },
  },
  {
    id: 'ca',
    label: 'CA & Tax Advisor',
    icon: Calculator,
    name: 'Priya Agarwal, FCA',
    avatarText: 'PA',
    avatarGradient: 'from-emerald-600 to-teal-600',
    badge: 'FCA, DISA • GST & Tax Auditor',
    city: 'Mumbai, Maharashtra',
    exp: '9+ Yrs Exp',
    rating: '4.98',
    reviewsCount: '310+',
    fee: 1500,
    unit: 'session',
    slug: 'dr-rajesh',
    service: 'ITR & Corporate Tax Audit',
    mode: 'Google Meet Call',
    dates: ['Today', 'Tomorrow', 'Mon, 8 Sep'],
    slots: {
      Morning: ['10:00 AM', '11:30 AM'],
      Evening: ['02:30 PM', '04:00 PM', '05:30 PM'],
    },
    liveAlert: {
      title: 'UPI Payment Credited',
      amount: '₹1,500',
      from: 'GPay UPI • Direct Bank',
    },
  },
  {
    id: 'lawyer',
    label: 'Legal Counsel',
    icon: Scale,
    name: 'Adv. Vikramaditya Singh',
    avatarText: 'VS',
    avatarGradient: 'from-slate-700 to-indigo-900',
    badge: 'High Court Counsel • Corporate Law',
    city: 'New Delhi',
    exp: '16+ Yrs Exp',
    rating: '4.92',
    reviewsCount: '280+',
    fee: 2000,
    unit: 'consult',
    slug: 'dr-rajesh',
    service: 'Legal Contract Review',
    mode: 'Chamber & Video Call',
    dates: ['Today', 'Tomorrow', 'Mon, 8 Sep'],
    slots: {
      Morning: ['11:00 AM'],
      Evening: ['03:00 PM', '04:30 PM', '06:00 PM'],
    },
    liveAlert: {
      title: 'UPI Payment Credited',
      amount: '₹2,000',
      from: 'Paytm UPI • Settled',
    },
  },
  {
    id: 'tutor',
    label: 'IIT-JEE Tutor',
    icon: GraduationCap,
    name: 'Prof. Arvind Kumar',
    avatarText: 'AK',
    avatarGradient: 'from-amber-600 to-orange-600',
    badge: 'Ex-IITian • Physics Specialist',
    city: 'Kota & Pune',
    exp: '11+ Yrs Exp',
    rating: '4.97',
    reviewsCount: '540+',
    fee: 800,
    unit: 'hour',
    slug: 'dr-rajesh',
    service: '1-on-1 Physics Doubt Session',
    mode: 'Zoom Interactive Class',
    dates: ['Today', 'Tomorrow', 'Sun, 7 Sep'],
    slots: {
      Morning: ['08:00 AM', '10:00 AM'],
      Evening: ['04:00 PM', '05:30 PM', '07:00 PM'],
    },
    liveAlert: {
      title: 'UPI Payment Credited',
      amount: '₹800',
      from: 'BHIM UPI • Direct',
    },
  },
  {
    id: 'consultant',
    label: 'Business Consultant',
    icon: Briefcase,
    name: 'Ananya Deshmukh',
    avatarText: 'AD',
    avatarGradient: 'from-purple-600 to-pink-600',
    badge: 'Growth Strategist • Ex-McKinsey',
    city: 'Bengaluru, Karnataka',
    exp: '8+ Yrs Exp',
    rating: '4.96',
    reviewsCount: '190+',
    fee: 2500,
    unit: 'session',
    slug: 'dr-rajesh',
    service: 'GTM Strategy & Scaling',
    mode: 'Video Call + Action Plan',
    dates: ['Today', 'Tomorrow', 'Tue, 9 Sep'],
    slots: {
      Morning: ['10:00 AM', '11:30 AM'],
      Evening: ['02:00 PM', '04:00 PM', '06:00 PM'],
    },
    liveAlert: {
      title: 'UPI Payment Credited',
      amount: '₹2,500',
      from: 'HDFC UPI • Instant',
    },
  },
  {
    id: 'fitness',
    label: 'Fitness Coach',
    icon: Dumbbell,
    name: 'Coach Rohan Verma',
    avatarText: 'RV',
    avatarGradient: 'from-rose-600 to-red-600',
    badge: 'Certified Nutritionist & CSCS',
    city: 'Hyderabad, Telangana',
    exp: '7+ Yrs Exp',
    rating: '4.94',
    reviewsCount: '340+',
    fee: 750,
    unit: 'slot',
    slug: 'dr-rajesh',
    service: 'Personal Diet & Workout Plan',
    mode: '1-on-1 Consultation',
    dates: ['Today', 'Tomorrow', 'Sun, 7 Sep'],
    slots: {
      Morning: ['06:30 AM', '07:45 AM', '09:00 AM'],
      Evening: ['05:30 PM', '07:00 PM'],
    },
    liveAlert: {
      title: 'UPI Payment Credited',
      amount: '₹750',
      from: 'Cred UPI • Instant',
    },
  },
];

export default function LandingHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const prof = PROFESSIONS[activeIndex];

  const morningSlots = prof.slots.Morning || [];
  const eveningSlots = prof.slots.Evening || [];

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-800">
      {/* Background Decorative Ambient Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl" />
        <div 
          className="absolute inset-0 opacity-[0.04]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Trust Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs text-slate-300 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white">0% Platform Fee</span>
            <span className="text-slate-500">•</span>
            <span className="text-indigo-300 font-medium">Direct UPI Settlements for Indian Professionals</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Value Proposition & CTAs */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="space-y-3.5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-white">
                Turn Your Calendar Into Cashflow.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">
                  Zero Commission. Instant UPI.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                The professional self-serve booking link for Indian doctors, chartered accountants, advocates, tutors, and consultants. Eliminate double-booking chaos and WhatsApp back-and-forth.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all"
              >
                <span>Claim Your Free Booking Page</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <a
                href={getProfessionalPublicUrl('dr-rajesh')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs sm:text-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Test Live Patient Demo</span>
              </a>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Payouts</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>WhatsApp Alerts</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>GPay / PhonePe UPI</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Branded Invoices</span>
              </div>
            </div>

            {/* Profession Category Selector Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Select Profession to Preview Live:</span>
                <span className="text-indigo-300 text-[11px] font-medium">Interactive Demo</span>
              </div>

              <div className="flex flex-wrap gap-1.5 justify-center lg:justify-start">
                {PROFESSIONS.map((p, i) => {
                  const Icon = p.icon;
                  const active = activeIndex === i;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveIndex(i);
                        setSelectedDateIndex(0);
                        const firstSlot = (p.slots.Morning && p.slots.Morning[0]) || (p.slots.Evening && p.slots.Evening[0]) || '10:00 AM';
                        setSelectedSlot(firstSlot);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700/80 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive Live SaaS Preview Card */}
          <div className="lg:col-span-6 xl:col-span-5 relative">
            
            {/* Live Settlement Toast */}
            <div className="absolute -top-4 -right-2 sm:-right-4 z-20 hidden sm:flex items-center gap-2 bg-slate-900 border border-emerald-500/40 rounded-xl p-2.5 shadow-xl">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{prof.liveAlert.title}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                    {prof.liveAlert.amount}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">{prof.liveAlert.from}</p>
              </div>
            </div>

            {/* Main Interactive Booking Card */}
            <div className="relative z-10 bg-slate-900 rounded-2xl border border-slate-700/90 shadow-2xl overflow-hidden">
              
              {/* Card Header */}
              <div className="p-4 sm:p-5 bg-slate-800/80 border-b border-slate-700/80">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${prof.avatarGradient} flex items-center justify-center text-white text-base font-bold shadow-md shrink-0`}>
                      {prof.avatarText}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-white">{prof.name}</h3>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </div>
                      <p className="text-xs text-indigo-300 mt-0.5">{prof.badge}</p>
                      
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {prof.city}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-300 font-semibold">
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                          {prof.rating} ({prof.reviewsCount})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fee Box */}
                  <div className="text-right shrink-0 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-medium">Fee</span>
                    <span className="text-sm font-extrabold text-white">₹{prof.fee}</span>
                    <span className="text-[10px] text-slate-400 block">/{prof.unit}</span>
                  </div>
                </div>

                {/* Service Tag & Mode */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-700/60 text-xs">
                  <span className="text-slate-300 font-medium truncate">
                    {prof.service}
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] shrink-0 font-medium">
                    <Video className="w-3 h-3" />
                    {prof.mode}
                  </span>
                </div>
              </div>

              {/* Card Body: Interactive Date & Slot Selector */}
              <div className="p-4 sm:p-5 space-y-3.5 bg-slate-900">
                
                {/* 1. Date Selector Tabs */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Select Appointment Date:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {prof.dates.map((dateStr, idx) => (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDateIndex(idx)}
                        className={`py-1.5 px-2 text-center rounded-lg text-xs font-semibold border transition-all ${
                          selectedDateIndex === idx
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {dateStr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Slot Selector Tabs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      Available Slots:
                    </span>
                    <span className="text-[10px] text-emerald-400 font-normal">🟢 Live Synchronized</span>
                  </div>

                  <div className="space-y-2">
                    {morningSlots.length > 0 && (
                      <div className="grid grid-cols-3 gap-1.5">
                        {morningSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              selectedSlot === slot
                                ? 'bg-emerald-600 border-emerald-500 text-white font-bold shadow-xs'
                                : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}

                    {eveningSlots.length > 0 && (
                      <div className="grid grid-cols-3 gap-1.5">
                        {eveningSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              selectedSlot === slot
                                ? 'bg-emerald-600 border-emerald-500 text-white font-bold shadow-xs'
                                : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Instant Payment Breakdown Pill */}
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-semibold text-white block">UPI Instant Direct Payment</span>
                      <span className="text-[10px] text-slate-400">GPay • PhonePe • Paytm • UPI</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">Total: ₹{prof.fee}</div>
                    <div className="text-[10px] text-slate-400">Platform fee: ₹0</div>
                  </div>
                </div>

                {/* CTA */}
                <a
                  href={getProfessionalPublicUrl(prof.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all"
                >
                  <span>Book Appointment for {selectedSlot}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM METRICS STRIP */}
        <div className="mt-12 pt-6 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-white">10,000+</div>
            <div className="text-[11px] font-medium text-slate-400">Practitioners Across India</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">₹18+ Crore</div>
            <div className="text-[11px] font-medium text-slate-400">Direct UPI Payouts Processed</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-indigo-400">0% Cut</div>
            <div className="text-[11px] font-medium text-slate-400">Zero Commission Retained</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-amber-400">4.9 / 5.0 ⭐</div>
            <div className="text-[11px] font-medium text-slate-400">From 2,500+ Verified Reviews</div>
          </div>
        </div>

      </div>
    </section>
  );
}