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
} from 'lucide-react';

const DEMO_PROFILES = [
  {
    id: 'doctor',
    role: 'Doctor',
    name: 'Dr. Rajesh Sharma',
    title: 'General Physician • MBBS, MD',
    location: 'Bhubaneswar, Odisha',
    fee: '₹500',
    icon: Stethoscope,
    slots: ['09:30 AM', '11:00 AM', '04:30 PM', '06:00 PM'],
    token: '#08',
  },
  {
    id: 'ca',
    role: 'CA / Tax',
    name: 'CA Priya Agarwal',
    title: 'Chartered Accountant • FCA, DISA',
    location: 'Cuttack & Online',
    fee: '₹1,500',
    icon: Briefcase,
    slots: ['11:00 AM', '02:30 PM', '04:00 PM', '05:30 PM'],
    token: '#04',
  },
  {
    id: 'lawyer',
    role: 'Advocate',
    name: 'Adv. Rohit Senapati',
    title: 'High Court Advocate • Civil & Corporate',
    location: 'Bhubaneswar Chamber',
    fee: '₹1,000',
    icon: Scale,
    slots: ['10:00 AM', '03:00 PM', '05:00 PM', '06:30 PM'],
    token: '#03',
  },
];

export default function HeroSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(DEMO_PROFILES[0].slots[1]);
  const [booked, setBooked] = useState(false);

  const profile = DEMO_PROFILES[activeIdx];

  const handleProfileChange = (idx) => {
    setActiveIdx(idx);
    setSelectedSlot(DEMO_PROFILES[idx].slots[1]);
    setBooked(false);
  };

  const handleBook = () => {
    setBooked(true);
  };

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-indigo-100/40 via-sky-100/30 to-violet-100/40 blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Smart Scheduling & Live Queue for Indian Professionals</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Appointments made effortless.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                Built for India.
              </span>
            </h1>

            {/* Short Supporting Subhead */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Share your custom booking link on WhatsApp, accept direct UPI payments, and manage a real-time live token queue. Zero app downloads needed for your clients.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/25 transition-all active:scale-95"
              >
                <span>Create Your Booking Page — Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/book/dr-rajesh"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-sm font-semibold shadow-2xs transition-all active:scale-95"
              >
                <span>View Live Demo</span>
              </Link>
            </div>

            {/* Trust Reassurance Points */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Free tier forever</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Direct UPI payments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Zero app install for clients</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Interactive Booking Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-5 sm:p-6 relative">
              
              {/* Profile Category Switcher Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-5">
                {DEMO_PROFILES.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => handleProfileChange(idx)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      activeIdx === idx
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p.role}
                  </button>
                ))}
              </div>

              {/* Profile Card Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <profile.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900">{profile.name}</h3>
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 fill-indigo-100" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{profile.title}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{profile.location}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium">Consultation</span>
                  <div className="text-sm font-extrabold text-slate-900">{profile.fee}</div>
                </div>
              </div>

              {/* Live Queue Status Badge */}
              <div className="my-4 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-emerald-800">Clinic Live Queue</span>
                </div>
                <span className="text-xs font-bold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  Next Token: {profile.token}
                </span>
              </div>

              {/* Slot Picker Widget */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Select Today's Slot
                  </span>
                  <span className="text-slate-400 font-medium">30 min slot</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {profile.slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setBooked(false);
                      }}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-between ${
                        selectedSlot === slot
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-600/30'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <span>{slot}</span>
                      <Clock className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {booked ? (
                <div className="p-3 rounded-xl bg-emerald-600 text-white text-center space-y-1 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Slot Reserved for {selectedSlot}!</span>
                  </div>
                  <p className="text-[11px] text-emerald-100">
                    Token {profile.token} sent via WhatsApp & SMS
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleBook}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <span>Book Appointment for {selectedSlot}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Bottom Micro Footer */}
              <div className="mt-3 text-center">
                <span className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-slate-400" />
                  Instant confirmation • No client registration needed
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
