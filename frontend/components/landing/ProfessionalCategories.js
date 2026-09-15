'use client';

import { useState } from 'react';
import {
  Stethoscope,
  Calculator,
  Scale,
  GraduationCap,
  Briefcase,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Clock,
  MapPin,
  Calendar,
  MessageCircle,
  PlusCircle,
  Check,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfessionalCategories() {
  const [activeTab, setActiveTab] = useState(0);

  const categories = [
    {
      id: 'doctor',
      title: 'Doctors & Clinics',
      tag: 'OPD & Chambers',
      icon: Stethoscope,
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-200/80',
      activeRing: 'border-indigo-600 ring-2 ring-indigo-600/20 bg-white shadow-xl',
      badge: 'Chamber OPD Mode',
      headline: 'OPD Queue Calling & Patient Tokens',
      desc: 'Token #01-style live calling, prescription reminder notes, follow-up slots, and 1-tap reception walk-in additions.',
      perks: [
        'Live patient token calling (#01, #02, #03)',
        'Walk-in patient insertion in 5 seconds',
        'Automatic WhatsApp chamber location pin',
      ],
      preview: {
        practitioner: 'Dr. Rajesh Sharma',
        role: 'General Physician • MBBS, MD',
        location: 'Kalinga Nagar, Bhubaneswar',
        tokenActive: '#04 In Consultation',
        queue: [
          { token: '#04', name: 'Amit Kumar', status: 'In Chamber', time: '11:00 AM', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { token: '#05', name: 'Priya Das (Walk-in)', status: 'Waiting', time: '11:20 AM', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
          { token: '#06', name: 'Sanjay Mohanty', status: 'Confirmed', time: '11:40 AM', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        ],
        actionLabel: '+ Add Chamber Walk-in',
        fee: '₹500 (Direct to Clinic)',
      },
    },
    {
      id: 'ca',
      title: 'CAs & Tax Advisors',
      tag: 'Tax & Audits',
      icon: Calculator,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-200/80',
      activeRing: 'border-emerald-600 ring-2 ring-emerald-600/20 bg-white shadow-xl',
      badge: 'Audit & ITR Schedule',
      headline: 'Scheduled Client Consultations & GST Reviews',
      desc: 'Fixed 30/60 min advisory slots, client document checklist notes, zero double-booking during tax filing deadlines.',
      perks: [
        'Document submission prep note to client',
        'Strict slot buffer to prevent client overlap',
        '100% direct consultation fee collection',
      ],
      preview: {
        practitioner: 'CA Manoj Singhania',
        role: 'Chartered Accountant • FCA, DISA',
        location: 'Janpath Road, Bhubaneswar',
        tokenActive: '#02 Audit Review',
        queue: [
          { token: '#01', name: 'Odisha Steels Pvt Ltd', status: 'Completed', time: '10:00 AM', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
          { token: '#02', name: 'Ramesh Patel (ITR Filing)', status: 'In Meeting', time: '11:00 AM', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { token: '#03', name: 'Kavita Mishra (GST Notice)', status: 'Confirmed', time: '12:00 PM', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        ],
        actionLabel: '+ Schedule Client Slot',
        fee: '₹1,500 / Hour',
      },
    },
    {
      id: 'lawyer',
      title: 'Lawyers & Advocates',
      tag: 'Legal Chambers',
      icon: Scale,
      accent: 'text-amber-600 bg-amber-50 border-amber-200/80',
      activeRing: 'border-amber-600 ring-2 ring-amber-600/20 bg-white shadow-xl',
      badge: 'Chamber Case Mode',
      headline: 'Private Client Case Discussions',
      desc: 'Block out court-free hours automatically. Share one link for evening chamber appointments and urgent client briefs.',
      perks: [
        'Automatic court schedule blackout windows',
        'Private confidential consultation passes',
        'Direct WhatsApp directions to your chamber',
      ],
      preview: {
        practitioner: 'Adv. Vikram Rathore',
        role: 'High Court Advocate • Civil & Corporate',
        location: 'Old Town, Bhubaneswar',
        tokenActive: '#01 Case Briefing',
        queue: [
          { token: '#01', name: 'Debashis Ray (Property Dispute)', status: 'In Chamber', time: '05:00 PM', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
          { token: '#02', name: 'Sumitra Sahoo (Contract Review)', status: 'Waiting', time: '05:45 PM', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          { token: '#03', name: 'Siddharth Jena (Urgent Bail)', status: 'Confirmed', time: '06:30 PM', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
        ],
        actionLabel: '+ Add Urgent Briefing',
        fee: '₹2,000 / Consultation',
      },
    },
    {
      id: 'tutor',
      title: 'Tutors & Coaches',
      tag: '1-on-1 Sessions',
      icon: GraduationCap,
      accent: 'text-violet-600 bg-violet-50 border-violet-200/80',
      activeRing: 'border-violet-600 ring-2 ring-violet-600/20 bg-white shadow-xl',
      badge: 'Batch & 1-on-1 Desk',
      headline: 'Student Doubt Slots & Personal Coaching',
      desc: 'Set recurring batch links, cap student registrations per session, and share one link in student WhatsApp groups.',
      perks: [
        'Student slot caps & doubt clearing passes',
        'Zero app download for students or parents',
        'Shareable batch link for WhatsApp groups',
      ],
      preview: {
        practitioner: 'Prof. Ananya Roy',
        role: 'Physics Faculty • IIT-JEE & NEET Mentor',
        location: 'Saheed Nagar, Bhubaneswar',
        tokenActive: 'Batch Slot #02',
        queue: [
          { token: '#01', name: 'Rohan Sen (JEE Doubt Session)', status: 'Completed', time: '03:00 PM', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
          { token: '#02', name: 'Ankita Swain (1-on-1 Numerical)', status: 'Live Session', time: '04:00 PM', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
          { token: '#03', name: 'Suryakant Biswal (Parent Meet)', status: 'Confirmed', time: '05:00 PM', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        ],
        actionLabel: '+ Add Student Slot',
        fee: '₹800 / Session',
      },
    },
    {
      id: 'consultant',
      title: 'Consultants & Agencies',
      tag: 'Advisory Desks',
      icon: Briefcase,
      accent: 'text-sky-600 bg-sky-50 border-sky-200/80',
      activeRing: 'border-sky-600 ring-2 ring-sky-600/20 bg-white shadow-xl',
      badge: 'Strategy Advisory Link',
      headline: 'High-Trust Discovery Calls & Paid Audits',
      desc: 'Get your custom professional link (booksaathi.in/book/your-brand). Collect client briefing details and fees upfront.',
      perks: [
        'Custom branded slug for Instagram & LinkedIn',
        'Client pre-consultation questionnaire support',
        'Instant Google Calendar & WhatsApp sync',
      ],
      preview: {
        practitioner: 'Ritu Verma',
        role: 'Brand & Growth Consultant • D2C Advisor',
        location: 'Chandrasekharpur, Bhubaneswar',
        tokenActive: 'Growth Audit Session',
        queue: [
          { token: '#01', name: 'TechOdisha Studio (Audit)', status: 'In Meeting', time: '02:00 PM', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
          { token: '#02', name: 'Dr. Dental Clinic (Branding)', status: 'Waiting', time: '03:00 PM', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          { token: '#03', name: 'E-Khata Systems (Strategy)', status: 'Confirmed', time: '04:30 PM', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
        ],
        actionLabel: '+ Book New Client',
        fee: '₹3,000 / Strategy Call',
      },
    },
  ];

  const current = categories[activeTab];
  const CurrentIcon = current.icon;

  return (
    <section
      id="for-professionals"
      className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/90 border-t border-slate-200/80"
    >
      {/* Background Radial Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-tr from-indigo-200/20 via-indigo-100/10 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50/90 px-3.5 py-1.5 rounded-full border border-indigo-100/90 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Chamber & Practice Operating System</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.12]">
            One booking system.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-500">
              Built for your practice.
            </span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Select your profession to see how BookSaathi adapts to your daily appointments, walk-in clients, and chamber queue calling.
          </p>
        </motion.div>

        {/* Interactive Split Layout: Left Selector (5 cols) + Right Live Chamber Console (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Interactive Profession Tabs */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block px-1">
              Select Your Practice Type
            </span>

            <div className="space-y-2.5">
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                const isSelected = activeTab === idx;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer ${
                      isSelected
                        ? cat.activeRing
                        : 'bg-white/80 hover:bg-white border-slate-200/90 text-slate-700 shadow-2xs hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${cat.accent} transition-transform ${isSelected ? 'scale-105' : ''}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm sm:text-base font-black truncate ${isSelected ? 'text-slate-950' : 'text-slate-800'}`}>
                            {cat.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {cat.tag}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shrink-0 ${
                      isSelected ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {isSelected ? 'Active View' : 'Explore'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Onboarding Button */}
            <div className="pt-3 px-1">
              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-indigo-600/25 active:scale-95 transition-all text-center"
              >
                <span>Create Booking Link for {current.title}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Dynamic Live Chamber Mode Console Mockup */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.98, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl overflow-hidden ring-1 ring-slate-800"
              >
                {/* Console Top Window Bar */}
                <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-400 font-mono text-[11px] ml-2 hidden sm:inline">
                      BookSaathi Chamber OS • {current.badge}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Reception View</span>
                  </span>
                </div>

                {/* Console Main Workspace */}
                <div className="p-6 sm:p-7 space-y-6">
                  
                  {/* Practitioner Chamber Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${current.accent}`}>
                        <CurrentIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base sm:text-lg font-black text-white">{current.preview.practitioner}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{current.preview.role}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{current.preview.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fee Per Visit</span>
                      <span className="text-sm font-black text-emerald-400">{current.preview.fee}</span>
                    </div>
                  </div>

                  {/* Chamber Real-Time Queue */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Today's Live Queue</span>
                      </span>
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>{current.preview.actionLabel}</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {current.preview.queue.map((item, qIdx) => (
                        <div
                          key={qIdx}
                          className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-indigo-300 text-xs shrink-0">
                              {item.token}
                            </span>
                            <div>
                              <div className="font-bold text-white text-xs">{item.name}</div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{item.time}</span>
                              </div>
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.badge}`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practice Specific Perks Checklist */}
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/40 space-y-2">
                    <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                      Why {current.title} choose BookSaathi:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      {current.perks.map((perk, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
