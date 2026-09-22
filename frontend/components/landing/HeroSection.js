'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  Copy,
  Zap,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

const DEMO_PROFILES = [
  {
    id: 'doctor',
    role: 'Doctor OPD',
    name: 'Dr. Rajesh Sharma',
    degree: 'MBBS, MD (Medicine)',
    location: 'Apollo Clinic, Bhubaneswar',
    fee: '₹500',
    feeNum: 500,
    icon: Stethoscope,
    color: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    slots: ['09:30 AM', '11:00 AM', '04:30 PM', '06:00 PM'],
    token: '#08',
    queueWait: '12 mins wait',
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
    queueWait: 'Scheduled slot',
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
    queueWait: 'Chamber briefing',
  },
  {
    id: 'coach',
    role: 'Mentor & Tutor',
    name: 'Prof. Ananya Mishra',
    degree: 'IIT-JEE Physics Specialist',
    location: 'Google Meet (Online 1:1)',
    fee: '₹750',
    feeNum: 750,
    icon: GraduationCap,
    color: 'from-purple-500 to-violet-600',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    slots: ['04:00 PM', '05:30 PM', '07:00 PM', '08:30 PM'],
    token: '#05',
    queueWait: '1-on-1 Session',
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

  return (
    <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-200/40 via-violet-200/30 to-emerald-100/40 blur-3xl -z-10 rounded-full pointer-events-none" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-sky-200/30 blur-3xl -z-10 rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-200/20 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Value Proposition & Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Live Pulsing Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-100 shadow-xs text-indigo-700 text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent font-extrabold">
                India&apos;s #1 Smart Booking & Live Token Desk
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Appointments made effortless.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600">
                Tailored for India.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Share your branded booking link on WhatsApp, collect consultation fees upfront directly with <strong className="text-slate-900 font-semibold">0% UPI commission</strong>, and manage real-time patient/client token queues. Zero app downloads needed for your clients.
            </p>

            {/* Key Value Points Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-left max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold text-slate-800">0% UPI Fee</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold text-slate-800">Live OPD Tokens</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
                <div className="w-6 h-6 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <QrCode className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold text-slate-800">QR Standees</span>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 transition-all active:scale-95 group"
              >
                <span>Create Free Practice Page</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <a
                href="#interactive-demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold text-sm shadow-2xs transition-all active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Explore Live Product Suite</span>
              </a>
            </div>

            {/* Micro Social Proof / Trust Footnote */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-500 pt-2 font-medium">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Free forever starter tier
              </span>
              <span>•</span>
              <span>No credit card required</span>
              <span>•</span>
              <span>Ready in 2 minutes</span>
            </div>
          </div>

          {/* Right Column: Interactive Live Booking & Queue Simulation Card */}
          <div className="lg:col-span-5 relative">
            
            {/* Floating Live Activity Pill Top */}
            <div className="hidden sm:flex items-center gap-2 absolute -top-5 -left-6 z-20 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md shadow-slate-900/5 animate-float-slow">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                #08
              </div>
              <div className="text-left">
                <div className="text-[11px] font-extrabold text-slate-900">Dr. Rajesh Clinic</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Token #08 In Chamber</div>
              </div>
            </div>

            {/* Floating Live UPI Badge Bottom */}
            <div className="hidden sm:flex items-center gap-2 absolute -bottom-5 -right-5 z-20 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md shadow-slate-900/5 animate-float-reverse">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                ₹
              </div>
              <div className="text-left">
                <div className="text-[11px] font-extrabold text-slate-900">Direct UPI Settlement</div>
                <div className="text-[10px] text-slate-500 font-semibold">₹500 credited • 0% fee</div>
              </div>
            </div>

            {/* Main Interactive Demo Container */}
            <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/10 overflow-hidden relative">
              
              {/* Card Header with Practice Type Switcher */}
              <div className="p-4 bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Live Preview
                    </span>
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                      Interactive
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
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
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all truncate text-center ${
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
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${profile.color} text-white flex items-center justify-center shadow-sm shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{profile.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{profile.degree}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-slate-900">{profile.fee}</div>
                    <div className="text-[10px] text-slate-400 font-medium">Per Consultation</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{profile.location}</span>
                </div>
              </div>

              {/* Interactive Booking State vs Confirmed Pass State */}
              {!booked ? (
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Slot Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        Select Available Slot (Today)
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {profile.queueWait}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {profile.slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                            selectedSlot === slot
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-2xs'
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
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-hidden focus:border-indigo-600"
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
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-hidden focus:border-indigo-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Reassurance & Instant Book Button */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleBook}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Confirm Appointment • Pay {profile.fee} via UPI</span>
                    </button>
                    <div className="text-[10px] text-center text-slate-400 font-medium">
                      Direct UPI Intent (GPay / PhonePe / Paytm) • Zero Middleman Fee
                    </div>
                  </div>
                </div>
              ) : (
                /* Confirmed Digital Pass Preview */
                <div className="p-4 sm:p-5 space-y-4 bg-emerald-50/30">
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs space-y-3">
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

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 flex items-center justify-between">
                      <span className="truncate">📲 WhatsApp Pass sent to +91 {clientPhone}</span>
                      <span className="text-[10px] font-bold text-indigo-600 shrink-0">Delivered</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBooked(false)}
                      className="flex-1 py-2 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 text-center transition-colors"
                    >
                      ← Try Another Booking
                    </button>
                    <Link
                      href="/lookup"
                      className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 text-white text-xs font-bold text-center hover:bg-indigo-700 transition-colors"
                    >
                      Lookup Live Pass →
                    </Link>
                  </div>
                </div>
              )}

              {/* Bottom Card Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Instant Pass Lookup Sync
                </span>
                <span className="font-mono text-indigo-600 font-semibold">booksaathi.in/book/{profile.id}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
