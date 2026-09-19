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
  PhoneCall,
  MessageCircle,
  Check,
  Stethoscope,
  Volume2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDashboard() {
  const [activeQueue, setActiveQueue] = useState([
    { id: 1, token: '#01', time: '09:00 AM', name: 'Amit Kumar', phone: '+91 98765 43210', status: 'In Chamber', type: 'Appointment', statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: 2, token: '#02', time: '09:30 AM', name: 'Priya Das', phone: '+91 94370 12345', status: 'Waiting', type: 'Walk-in', statusColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { id: 3, token: '#03', time: '10:00 AM', name: 'Rahul Mishra', phone: '+91 82490 56789', status: 'Waiting', type: 'Appointment', statusColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { id: 4, token: '#04', time: '10:30 AM', name: 'Sneha Patnaik', phone: '+91 70081 99887', status: 'Confirmed', type: 'Appointment', statusColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  ]);

  const [currentCallingToken, setCurrentCallingToken] = useState('#01');
  const [walkinCount, setWalkinCount] = useState(5);

  const handleCallNext = () => {
    const nextWaiting = activeQueue.find((item) => item.status === 'Waiting');
    if (nextWaiting) {
      setCurrentCallingToken(nextWaiting.token);
      setActiveQueue((prev) =>
        prev.map((item) => {
          if (item.status === 'In Chamber') {
            return { ...item, status: 'Completed', statusColor: 'bg-slate-700/50 text-slate-400 border-slate-700' };
          }
          if (item.id === nextWaiting.id) {
            return { ...item, status: 'In Chamber', statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
          }
          return item;
        })
      );
      toast.success(`Calling Token ${nextWaiting.token} (${nextWaiting.name}) to Consultation Desk!`);
    } else {
      toast.info('All currently waiting patients have been called.');
    }
  };

  const handleAddWalkin = () => {
    const newWalkin = {
      id: Date.now(),
      token: `#0${walkinCount}`,
      time: 'Now',
      name: `Walk-in Patient #${walkinCount}`,
      phone: '+91 98xxx xxxxx',
      status: 'Waiting',
      type: 'Walk-in',
      statusColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    setActiveQueue((prev) => [...prev, newWalkin]);
    setWalkinCount((c) => c + 1);
    toast.success(`Walk-in added! Assigned Token #0${walkinCount}`);
  };

  const handleMarkDone = (id) => {
    setActiveQueue((prev) =>
      prev.map((app) =>
        app.id === id
          ? { ...app, status: 'Completed', statusColor: 'bg-slate-700/50 text-slate-400 border-slate-700' }
          : app
      )
    );
    toast.success('Appointment marked as Completed.');
  };

  const featureCards = [
    {
      title: 'Real-time Live Queue',
      desc: 'See today’s schedule and sequential tokens at a glance on mobile or desktop.',
      icon: Users,
      badge: 'Zero Chaos',
    },
    {
      title: '1-Tap Reception Walk-ins',
      desc: 'Add offline patients arriving at your clinic desk into the same sequential queue.',
      icon: PlusCircle,
      badge: 'Single Queue',
    },
    {
      title: 'WhatsApp Token Ping',
      desc: 'Automatically notify clients when their turn is coming up to reduce waiting room crowd.',
      icon: MessageCircle,
      badge: 'Smart OPD',
    },
  ];

  return (
    <section id="dashboard-preview" className="py-20 sm:py-28 bg-slate-950 text-white overflow-hidden border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/20">
            Today Practice Command Center
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Run your chamber seamlessly every day
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-normal">
            A clean, purpose-built queue and schedule manager that replaces messy paper registers and chaotic WhatsApp threads.
          </p>
        </div>

        {/* Product Showcase Grid: Dashboard (8 cols) + Feature Cards (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Interactive Live Dashboard Display (8 cols) */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 text-white shadow-2xl overflow-hidden ring-1 ring-slate-800/80">
              
              {/* App Bar */}
              <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-xs font-mono text-slate-400 font-medium">
                  BookSaathi Practice OS • Live Desk
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/50">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Sync</span>
                </span>
              </div>

              {/* Dashboard Content Body */}
              <div className="p-6 sm:p-7 space-y-6">
                
                {/* Header Row with Date, Call Next, and Add Walk-in */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-400 block">Today's Practice Desk</span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">Dr. Rajesh Sharma (Chamber OPD)</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCallNext}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Call Next</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddWalkin}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Walk-in</span>
                    </button>
                  </div>
                </div>

                {/* Prominent Active Consultation Spotlight */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-mono font-black text-sm">
                      {currentCallingToken}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Now in Chamber</span>
                      <span className="text-sm font-bold text-white">Active Consultation in Progress</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                    ● On Desk
                  </span>
                </div>

                {/* Metrics 4-Pill Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 block">Total Today</span>
                    <span className="text-lg font-black text-white block mt-0.5">{activeQueue.length}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-semibold text-emerald-400 block">Completed</span>
                    <span className="text-lg font-black text-emerald-300 block mt-0.5">
                      {activeQueue.filter((x) => x.status === 'Completed').length}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-semibold text-amber-400 block">Waiting</span>
                    <span className="text-lg font-black text-amber-300 block mt-0.5">
                      {activeQueue.filter((x) => x.status === 'Waiting').length}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-semibold text-indigo-400 block">Upcoming</span>
                    <span className="text-lg font-black text-indigo-300 block mt-0.5">
                      {activeQueue.filter((x) => x.status === 'Confirmed').length}
                    </span>
                  </div>
                </div>

                {/* Queue List Table */}
                <div className="space-y-2">
                  {activeQueue.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 sm:p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-black text-slate-400 w-10">
                          {item.token}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-white">{item.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">({item.type})</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{item.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.statusColor}`}>
                          {item.status}
                        </span>

                        {item.status !== 'Completed' && (
                          <button
                            type="button"
                            onClick={() => handleMarkDone(item.id)}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                          >
                            ✓ Done
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Feature Cards (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {featureCards.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {feat.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{feat.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed font-normal">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
