'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  User,
  Users,
  BarChart3,
  ShieldCheck,
  Stethoscope,
  Activity,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIWelcomeScreen({ role = 'GUEST', userName = '', onSelectPrompt }) {
  const getSuggestions = () => {
    if (role === 'USER') {
      return [
        {
          icon: <Calendar className="w-4 h-4 text-indigo-600" />,
          title: 'My Appointments',
          desc: 'What appointments do I have tomorrow?',
          prompt: 'What appointments do I have tomorrow?',
        },
        {
          icon: <Stethoscope className="w-4 h-4 text-sky-600" />,
          title: 'Next Doctor',
          desc: 'Who is my next consultation with?',
          prompt: 'Who is my next appointment with?',
        },
        {
          icon: <BarChart3 className="w-4 h-4 text-emerald-600" />,
          title: 'Monthly Summary',
          desc: 'How many bookings do I have this month?',
          prompt: 'How many appointments do I have this month?',
        },
        {
          icon: <ShieldCheck className="w-4 h-4 text-amber-600" />,
          title: 'Booking Policy',
          desc: 'Refund & cancellation rules',
          prompt: 'What is the refund and cancellation policy?',
        },
      ];
    }

    if (role === 'PROFESSIONAL') {
      return [
        {
          icon: <Activity className="w-4 h-4 text-amber-600" />,
          title: "Today's Live Queue",
          desc: 'Serving token & waiting patient count',
          prompt: "What's today's live queue?",
        },
        {
          icon: <Calendar className="w-4 h-4 text-indigo-600" />,
          title: "Today's Schedule",
          desc: 'Consultations booked for today',
          prompt: 'How many bookings do I have today?',
        },
        {
          icon: <Clock className="w-4 h-4 text-sky-600" />,
          title: 'Shift Timings',
          desc: 'Review weekly working hours',
          prompt: 'What is my weekly availability?',
        },
        {
          icon: <BarChart3 className="w-4 h-4 text-emerald-600" />,
          title: 'Practice Metrics',
          desc: 'Completed bookings & patient trends',
          prompt: 'How many appointments completed this week?',
        },
      ];
    }

    if (role === 'ADMIN') {
      return [
        {
          icon: <BarChart3 className="w-4 h-4 text-indigo-600" />,
          title: 'Platform Overview',
          desc: 'Key platform activity summary',
          prompt: 'Give me a summary of platform activity',
        },
        {
          icon: <Users className="w-4 h-4 text-emerald-600" />,
          title: 'Registered Users',
          desc: 'Total verified professionals & clients',
          prompt: 'How many users are registered?',
        },
        {
          icon: <Calendar className="w-4 h-4 text-sky-600" />,
          title: 'Monthly Bookings',
          desc: 'Total consultations created this month',
          prompt: 'How many bookings were created this month?',
        },
        {
          icon: <ShieldCheck className="w-4 h-4 text-amber-600" />,
          title: 'Grievance Review',
          desc: 'Review pending open tickets',
          prompt: 'Review pending grievances',
        },
      ];
    }

    // GUEST / Default
    return [
      {
        icon: <Stethoscope className="w-4 h-4 text-indigo-600" />,
        title: 'Find a Doctor',
        desc: 'Explore verified doctors in Bhubaneswar',
        prompt: 'Find a doctor in Bhubaneswar',
      },
      {
        icon: <Layers className="w-4 h-4 text-sky-600" />,
        title: 'How It Works',
        desc: 'Learn how instant booking operates',
        prompt: 'How does booking work?',
      },
      {
        icon: <User className="w-4 h-4 text-emerald-600" />,
        title: 'Join Practice',
        desc: 'Register as a doctor or consultant',
        prompt: 'How do I register as a Professional?',
      },
      {
        icon: <ShieldCheck className="w-4 h-4 text-amber-600" />,
        title: 'Privacy & Security',
        desc: 'DPDP compliant data security',
        prompt: 'Is my consultation data secure?',
      },
    ];
  };

  const suggestions = getSuggestions();

  return (
    <div className="flex flex-col items-center justify-center text-center px-1 py-3 sm:py-5 animate-in fade-in duration-200">
      {/* Central Clean AI Emblem */}
      <div className="mb-3 flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 border border-indigo-500/40">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Greeting & Headline */}
      <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
        {userName ? `Namaste, ${userName}` : 'BookSaathi AI Copilot'}
      </h2>
      <p className="text-xs text-slate-600 max-w-[280px] sm:max-w-xs mt-1 leading-relaxed">
        How can I help you today? Ask about your appointments, practice queue, or doctor directory.
      </p>

      {/* Suggestion Cards Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-left">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt && onSelectPrompt(item.prompt)}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-900 transition-all duration-150 group flex items-start gap-2.5 cursor-pointer shadow-xs text-left"
          >
            <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-indigo-100 transition-colors shrink-0 mt-0.5">
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>{item.title}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 shrink-0 ml-1" />
              </span>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                {item.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
