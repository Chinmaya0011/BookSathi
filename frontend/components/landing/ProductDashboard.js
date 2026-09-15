'use client';

import { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  PlusCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function ProductDashboard() {
  const [appointments, setAppointments] = useState([
    { id: 1, time: '09:00 AM', name: 'Amit Kumar', status: 'Confirmed', statusColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 2, time: '09:30 AM', name: 'Priya Das', status: 'Completed', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 3, time: '10:00 AM', name: 'Rahul Mishra', status: 'Waiting', statusColor: 'bg-amber-50 text-amber-800 border-amber-200' },
    { id: 4, time: '10:30 AM', name: 'Sneha Patnaik', status: 'Confirmed', statusColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  ]);

  const handleMarkDone = (id) => {
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: 'Completed', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' } : app
      )
    );
  };

  const handleCancel = (id) => {
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: 'Cancelled', statusColor: 'bg-rose-50 text-rose-700 border-rose-200' } : app
      )
    );
  };

  const featureCards = [
    {
      title: 'Live Queue',
      desc: "See today's appointments in one place.",
      icon: Users,
      badge: 'Real-time OS',
    },
    {
      title: 'Instant Confirmation',
      desc: 'Every booking gets a confirmation and token.',
      icon: CheckCircle2,
      badge: 'Zero friction',
    },
    {
      title: 'Walk-in Friendly',
      desc: 'Add offline customers directly to your queue.',
      icon: PlusCircle,
      badge: 'Single queue',
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Practice Operating System
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
            Everything your practice needs to manage bookings
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            A single, responsive workspace designed for Indian clinics, chambers, and consultation desks.
          </p>
        </div>

        {/* Product Grid: Dashboard Centerpiece (8 cols) + Feature Cards (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Dashboard Centerpiece */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-slate-200/90 bg-slate-900 text-white shadow-2xl overflow-hidden ring-1 ring-slate-800">
              
              {/* App Bar */}
              <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-xs font-mono text-slate-400 font-medium">
                  BookSaathi Practice Dashboard • Today Queue
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Sync</span>
                </span>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Header Row with Date and Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 block">Today's Schedule</span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">Tuesday, 15 September</h3>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Add Walk-in</span>
                  </button>
                </div>

                {/* Metrics 4-Pill Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[11px] font-semibold text-slate-400 block">Total Appointments</span>
                    <span className="text-xl font-black text-white block mt-0.5">08</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[11px] font-semibold text-emerald-400 block">Completed</span>
                    <span className="text-xl font-black text-emerald-300 block mt-0.5">03</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[11px] font-semibold text-amber-400 block">Waiting</span>
                    <span className="text-xl font-black text-amber-300 block mt-0.5">02</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[11px] font-semibold text-indigo-400 block">Upcoming</span>
                    <span className="text-xl font-black text-indigo-300 block mt-0.5">03</span>
                  </div>
                </div>

                {/* Queue List Table */}
                <div className="space-y-2.5">
                  {appointments.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 text-xs font-mono font-bold text-slate-400 shrink-0">
                          {item.time}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-white block">{item.name}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.statusColor}`}>
                          {item.status}
                        </span>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {item.status !== 'Completed' && item.status !== 'Cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleMarkDone(item.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Mark Done
                          </button>
                        )}
                        {item.status !== 'Cancelled' && item.status !== 'Completed' && (
                          <button
                            type="button"
                            onClick={() => handleCancel(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-700/50 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* 3 Concise Feature Cards (Right 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {featureCards.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all space-y-2.5 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                      {feat.badge}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
