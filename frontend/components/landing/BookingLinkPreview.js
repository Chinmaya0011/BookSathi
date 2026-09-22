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
  MessageCircle,
  ArrowRight,
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  Lock,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function BookingLinkPreview() {
  const [selectedDay, setSelectedDay] = useState('Today');
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM');
  const [standeeTheme, setStandeeTheme] = useState('indigo');
  const [copied, setCopied] = useState(false);

  const days = ['Today', 'Tomorrow', 'Thursday'];
  const slots = ['11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM'];

  const channels = [
    { label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Instagram Bio', icon: InstagramIcon, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { label: 'Google Business', icon: Globe, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    { label: 'Clinic Standee', icon: QrCode, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://booksaathi.in/book/dr-rajesh');
    setCopied(true);
    toast.success('Practice booking link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 sm:py-28 bg-slate-900 text-white overflow-hidden border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/20">
            Multi-Channel Presence & Standee
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Your booking page. Your reception standee.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-normal">
            Share your link on WhatsApp or print a custom acrylic QR standee for your reception desk so walk-ins can scan and book in seconds.
          </p>
        </div>

        {/* 2-Column Showcase: Branded Booking Link (7 cols) + Physical Standee Mockup (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Branded Web Page Mockup (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
            {/* Browser Address Bar */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>

              <div className="px-4 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 font-bold flex items-center gap-2 shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>https://booksaathi.in/book/dr-rajesh</span>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                title="Copy Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Inner Booking Preview */}
            <div className="p-6 sm:p-8 space-y-6 bg-slate-900/60">
              {/* Profile Header */}
              <div className="flex items-start gap-4 pb-5 border-b border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0">
                  DR
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-black text-white truncate">Dr. Rajesh Sharma</h3>
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">General Physician • MBBS, MD</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>Bhubaneswar, Odisha • Fee: ₹500</span>
                  </p>
                </div>
              </div>

              {/* Day Selector */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  1. Select Consultation Date
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {days.map((day) => {
                    const isSelected = selectedDay === day;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot Selector */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  2. Pick Available Slot
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Channels Strip */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Share anywhere:
                </span>
                <div className="flex items-center gap-1.5">
                  {channels.map((ch, idx) => {
                    const Icon = ch.icon;
                    return (
                      <div
                        key={idx}
                        className={`p-1.5 rounded-lg border flex items-center gap-1 text-[11px] font-bold ${ch.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{ch.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Right: Printable QR Standee Acrylic Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-xs rounded-3xl bg-slate-950 p-6 border border-slate-800 shadow-2xl text-center space-y-4 relative overflow-hidden">
              
              {/* Standee Top Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 inline-flex mx-auto">
                <QrCode className="w-3.5 h-3.5" />
                <span>Front Reception Standee</span>
              </div>

              {/* QR Standee Board */}
              <div className="p-5 rounded-2xl bg-white text-slate-900 shadow-lg space-y-3">
                <div className="space-y-0.5">
                  <h4 className="font-black text-sm text-slate-950 leading-tight">Dr. Rajesh Sharma</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Scan QR to Book Slot or Token</p>
                </div>

                {/* QR Visual */}
                <div className="w-36 h-36 mx-auto bg-slate-100 rounded-xl p-2 border border-slate-200 flex items-center justify-center">
                  <QrCode className="w-28 h-28 text-slate-900" />
                </div>

                <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                  <span>booksaathi.in/dr-rajesh</span>
                  <span className="text-indigo-600 font-bold inline-flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5" /> Instant
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-normal">
                Every practice account gets a high-resolution printable QR Standee PDF ready for acrylic desk stands.
              </p>

              <Link
                href="/register"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <span>Generate Your Free Standee</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
