'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Share2,
  QrCode,
  Globe,
  Instagram,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function BookingLinkPreview() {
  const [selectedDay, setSelectedDay] = useState('Today');
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM');

  const days = ['Today', 'Tomorrow', 'Thursday'];
  const slots = ['11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM'];

  const channels = [
    { label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Instagram Bio', icon: Instagram, color: 'text-rose-600 bg-rose-50' },
    { label: 'Google Business Profile', icon: Globe, color: 'text-blue-600 bg-blue-50' },
    { label: 'Clinic QR Code Standee', icon: QrCode, color: 'text-indigo-600 bg-indigo-50' },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Branded Public Presence
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
            Your booking page. Your brand.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            A clean, mobile-optimized booking link that represents your professional practice with elegance.
          </p>
        </div>

        {/* Large Browser Mockup */}
        <div className="max-w-4xl mx-auto rounded-3xl sm:rounded-[32px] bg-white border border-slate-200/90 shadow-2xl overflow-hidden">
          
          {/* Top Address Bar */}
          <div className="px-5 py-3.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>

            <div className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-700 font-bold flex items-center gap-2 shadow-2xs">
              <span className="text-emerald-500 font-black">🔒</span>
              <span>https://booksaathi.in/book/dr-rajesh</span>
            </div>

            <div className="w-10" />
          </div>

          {/* Browser Inner Page Body */}
          <div className="p-6 sm:p-10 space-y-8 bg-slate-50/50">
            
            {/* Practitioner Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 pb-6 border-b border-slate-200/80">
              <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                DR
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">Dr. Rajesh Sharma</h3>
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-50" />
                </div>
                <p className="text-sm font-semibold text-slate-600">General Physician • MBBS, MD Internal Medicine</p>
                <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Bhubaneswar, Odisha</span>
                </p>
              </div>
            </div>

            {/* Step 1: Choose a Date */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Choose a Date</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {days.map((day) => {
                  const isSelected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-600/30'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Available Slots */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Available Slots</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {slots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-white hover:bg-indigo-50/50 text-slate-800 border border-slate-200/90'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <Link
                href="/register"
                className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all text-center"
              >
                <span>Book Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

        {/* Share Strip Section Underneath */}
        <div className="mt-14 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-sm font-black text-slate-900">
            <Share2 className="w-4 h-4 text-indigo-600" />
            <span>Share one link everywhere.</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {channels.map((chan) => {
              const Icon = chan.icon;
              return (
                <div
                  key={chan.label}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center gap-2 text-xs font-bold text-slate-800"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${chan.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{chan.label}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
