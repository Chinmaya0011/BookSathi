'use client';

import { useState } from 'react';
import {
  Stethoscope,
  Calculator,
  Scale,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function ProfessionalCategories() {
  const [activeTab, setActiveTab] = useState(0);

  const categories = [
    {
      id: 'doctor',
      title: 'Doctors & Clinics',
      icon: Stethoscope,
      badge: 'OPD & Clinic Mode',
      color: 'from-emerald-500 to-teal-600',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      headline: 'OPD Live Queue Calling & Sequential Patient Tokens',
      desc: 'Run a calm, organized clinic without crowded waiting halls or telephone disputes. Assign sequential digital tokens, manage walk-in visitors with 1-click, and provide clinic Google Maps navigation automatically.',
      perks: [
        'Live patient token numbers (#01, #02, #03) with real-time wait times',
        'Quick 5-second walk-in addition by reception staff',
        'Confidential medical consultation notes for each patient visit',
        '0% commission on advance or clinic consultation UPI payments',
      ],
      demo: {
        name: 'Dr. Rajesh Sharma, MD',
        specialty: 'General Medicine & Family Practice',
        location: 'Apollo Clinic, Bhubaneswar',
        activeToken: 'Token #04 — In Chamber',
        nextTokens: ['#05 Priya Das (Waiting)', '#06 Sanjay Mohanty (11:30 AM)'],
      },
    },
    {
      id: 'ca',
      title: 'CAs & Tax Advisors',
      icon: Calculator,
      badge: 'Advisory & ITR Scheduling',
      color: 'from-indigo-500 to-blue-600',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      headline: 'Scheduled Client Consultations & GST / ITR Reviews',
      desc: 'Eliminate chaotic client calls during tax season. Offer structured 30 or 60-minute advisory slots with pre-consultation document submission checklists and upfront fee collection.',
      perks: [
        'Automated document submission checklist on confirmation',
        'Custom slot buffer times to prevent client meeting overlap',
        'Direct consultation fee payment collection upfront via UPI',
        'Separate corporate vs individual tax consultation booking tiers',
      ],
      demo: {
        name: 'CA Priya Agarwal, FCA',
        specialty: 'Chartered Accountant & Tax Counsel',
        location: 'Cuttack Chamber & Google Meet',
        activeToken: '11:00 AM — ITR Review',
        nextTokens: ['12:00 PM — Audit Prep', '02:30 PM — GST Filing Call'],
      },
    },
    {
      id: 'lawyer',
      title: 'Advocates & Legal',
      icon: Scale,
      badge: 'Chamber Consultations',
      color: 'from-amber-500 to-orange-600',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      headline: 'Structured Chamber Briefings & Case Consultations',
      desc: 'Ensure strict client confidentiality and predictable chamber hours. Control availability across High Court, District Court, and evening chamber slots with automated reminders.',
      perks: [
        'Court schedule buffer to avoid client appointment conflicts',
        'Private case note storage encrypted and isolated for your eyes only',
        'Client SMS and WhatsApp reminders to reduce no-shows',
        'Acrylic QR Standee for chamber reception walk-ins',
      ],
      demo: {
        name: 'Adv. Rohit Senapati',
        specialty: 'High Court Advocate • Civil & Corporate',
        location: 'High Court Chamber, Cuttack',
        activeToken: '05:00 PM — Case Briefing',
        nextTokens: ['05:45 PM — Contract Review', '06:30 PM — Client Meeting'],
      },
    },
    {
      id: 'consultant',
      title: 'Mentors & Coaches',
      icon: GraduationCap,
      badge: '1:1 Session Scheduler',
      color: 'from-purple-500 to-violet-600',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      headline: 'Personal Mentorship, Tutoring & Online 1:1 Sessions',
      desc: 'Share your booking link for paid 1-on-1 mentorship, career counseling, and subject tutoring with automated payment verification and Google Meet calendar integration.',
      perks: [
        'Automatic calendar invite (.ics) synced to Google Calendar / Apple Calendar',
        'Zero commission on paid 1-on-1 consultation bookings',
        'Instant reschedule requests handled smoothly without back-and-forth messages',
        'Custom intake questions to prepare for the session in advance',
      ],
      demo: {
        name: 'Prof. Ananya Mishra',
        specialty: 'IIT-JEE Physics Specialist & Mentor',
        location: 'Online via Google Meet',
        activeToken: '04:00 PM — 1:1 Mentorship',
        nextTokens: ['05:00 PM — Doubts Review', '06:00 PM — Strategy Session'],
      },
    },
  ];

  const current = categories[activeTab];

  return (
    <section id="for-practice" className="py-16 sm:py-24 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tailored Practice Workflows</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built specifically for how Indian practitioners work
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Whether you run a medical clinic, tax consultancy, legal chamber, or coaching studio, BookSaathi adapts to your daily routine.
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === idx
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Category Showcase Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 md:p-10 shadow-lg shadow-slate-900/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full border ${current.badgeClass}`}>
                {current.badge}
              </span>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {current.headline}
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed font-normal">
                {current.desc}
              </p>

              <div className="space-y-3 pt-1">
                {current.perks.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
                >
                  <span>Start Free Setup for {current.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Live Preview Card */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{current.demo.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{current.demo.specialty}</p>
                  </div>
                  <span className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shadow-2xs">
                    {current.demo.name.split(' ')[1]?.charAt(0) || 'P'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{current.demo.location}</span>
                </div>

                {/* Live Queue Box */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-950">{current.demo.activeToken}</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded">
                      Live
                    </span>
                  </div>
                </div>

                {/* Upcoming Schedule List */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Upcoming Appointments Today
                  </span>
                  {current.demo.nextTokens.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 flex items-center justify-between font-medium shadow-2xs"
                    >
                      <span>{t}</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
