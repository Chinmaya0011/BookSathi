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
      headline: 'OPD Live Queue Calling & Patient Tokens',
      desc: 'Run an organized clinic without crowded waiting rooms. Assign sequential digital tokens, manage walk-ins, and share clinic Google Maps pins automatically.',
      perks: [
        'Live patient token numbers (#01, #02, #03) with wait times',
        'Quick 5-second walk-in addition by reception staff',
        'Confidential medical consultation notes for each visit',
      ],
      demo: {
        name: 'Dr. Rajesh Sharma',
        specialty: 'General Physician • MBBS, MD',
        location: 'Kalinga Nagar Clinic, Bhubaneswar',
        activeToken: 'Token #04 — In Chamber',
        nextTokens: ['#05 Priya Das (Waiting)', '#06 Sanjay Mohanty (11:40 AM)'],
      },
    },
    {
      id: 'ca',
      title: 'CAs & Tax Advisors',
      icon: Calculator,
      badge: 'Advisory & ITR Schedule',
      headline: 'Scheduled Client Consultations & GST Reviews',
      desc: 'Eliminate chaotic client calls during tax season. Offer fixed 30 or 60-minute advisory slots with pre-consultation document checklists.',
      perks: [
        'Automated document submission checklist on confirmation',
        'Custom slot buffer times to prevent client meeting overlap',
        'Direct consultation fee payment collection upfront via UPI',
      ],
      demo: {
        name: 'CA Priya Agarwal',
        specialty: 'Chartered Accountant • FCA, DISA',
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
      headline: 'Structured Chamber Briefings & Case Consultations',
      desc: 'Ensure client confidentiality and predictable chamber hours. Control availability across High Court, District Court, and evening chamber slots.',
      perks: [
        'Court schedule buffer to avoid client appointment conflicts',
        'Private case note storage encrypted and isolated for your eyes only',
        'Client SMS and WhatsApp reminders to reduce no-shows',
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
      title: 'Tutors & Coaches',
      icon: GraduationCap,
      badge: '1:1 Session Scheduler',
      headline: 'Personal Mentorship & Online Consultations',
      desc: 'Share your booking link for paid 1-on-1 mentorship, career advice, and subject tutoring with automated payment verification.',
      perks: [
        'Automatic calendar invite (.ics) synced to Google Calendar / Apple Calendar',
        'Zero commission on paid consultation bookings',
        'Instant reschedule requests handled smoothly without phone calls',
      ],
      demo: {
        name: 'Prof. Ananya Mishra',
        specialty: 'Academic Mentor & UPSC Coach',
        location: 'Online via Google Meet',
        activeToken: '04:00 PM — 1:1 Mentorship',
        nextTokens: ['05:00 PM — Essay Review', '06:00 PM — Strategy Session'],
      },
    },
  ];

  const current = categories[activeTab];

  return (
    <section id="for-practice" className="py-16 sm:py-24 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/80">
            For Your Practice
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tailored for Indian independent professionals
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Whether you run a medical clinic, tax consultancy, or legal chamber, BookSaathi adapts to your daily workflow.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === idx
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Category Card Showcase */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 md:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Info */}
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                {current.badge}
              </span>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {current.headline}
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed">
                {current.desc}
              </p>

              <div className="space-y-2.5 pt-1">
                {current.perks.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <span>Start with {current.title} Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Interactive Mock Preview */}
            <div className="lg:col-span-5">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{current.demo.name}</h4>
                    <p className="text-xs text-slate-500">{current.demo.specialty}</p>
                  </div>
                  <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {current.demo.name.split(' ')[1]?.charAt(0) || 'P'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{current.demo.location}</span>
                </div>

                {/* Live Queue Card */}
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900">{current.demo.activeToken}</span>
                    <span className="text-[10px] bg-emerald-200/70 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      Live
                    </span>
                  </div>
                </div>

                {/* Upcoming tokens list */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Upcoming Appointments Today
                  </span>
                  {current.demo.nextTokens.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 flex items-center justify-between"
                    >
                      <span>{t}</span>
                      <Clock className="w-3 h-3 text-slate-400" />
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
