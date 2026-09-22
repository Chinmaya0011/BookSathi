'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  PlusCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Phone,
  MessageCircle,
  Check,
  Stethoscope,
  Volume2,
  FileText,
  Download,
  Smartphone,
  ExternalLink,
  MapPin,
  CreditCard,
  QrCode,
  Layers,
  Copy,
  TrendingUp,
  UserCheck,
  Printer,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { toast } from 'sonner';
import { generateAppointmentPdf } from '@/lib/generateAppointmentPdf';
import Link from 'next/link';

export default function ProductSuiteShowcase() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'booking' | 'standee' | 'whatsapp'

  // --------------------------------------------------------------------------
  // TAB 1: INTERACTIVE QUEUE & CALLING DESK STATE
  // --------------------------------------------------------------------------
  const [activeQueue, setActiveQueue] = useState([
    {
      id: 1,
      token: '#04',
      time: '10:30 AM',
      name: 'Rahul Varma',
      phone: '+91 98765 43210',
      status: 'In Chamber',
      type: 'Online Booking',
      fee: 500,
    },
    {
      id: 2,
      token: '#05',
      time: '11:00 AM',
      name: 'Priya Das',
      phone: '+91 94370 12345',
      status: 'Waiting',
      type: 'Online Booking',
      fee: 500,
    },
    {
      id: 3,
      token: '#06',
      time: '11:30 AM',
      name: 'Sanjay Mohanty',
      phone: '+91 91234 56789',
      status: 'Waiting',
      type: 'Walk-In Patient',
      fee: 500,
    },
    {
      id: 4,
      token: '#07',
      time: '12:00 PM',
      name: 'Anita Mishra',
      phone: '+91 98111 22233',
      status: 'Waiting',
      type: 'Online Booking',
      fee: 500,
    },
  ]);

  const [currentToken, setCurrentToken] = useState('#04');
  const [callingSound, setCallingSound] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [showWalkinForm, setShowWalkinForm] = useState(false);

  // Call Next Patient Function
  const handleCallNext = () => {
    setCallingSound(true);
    const waitingIdx = activeQueue.findIndex((item) => item.status === 'Waiting');
    if (waitingIdx !== -1) {
      const nextPerson = activeQueue[waitingIdx];
      const updated = activeQueue.map((item, idx) => {
        if (item.status === 'In Chamber') return { ...item, status: 'Completed' };
        if (idx === waitingIdx) return { ...item, status: 'In Chamber' };
        return item;
      });
      setActiveQueue(updated);
      setCurrentToken(nextPerson.token);
      toast.success(`Calling Token ${nextPerson.token}: ${nextPerson.name}`);
    } else {
      toast.info('All patients in queue have been attended!');
    }
    setTimeout(() => setCallingSound(false), 2000);
  };

  // Add Walk-in Patient
  const handleAddWalkin = (e) => {
    e.preventDefault();
    if (!walkinName.trim()) {
      toast.error('Please enter patient or client name');
      return;
    }
    const nextTokenNum = activeQueue.length + 4;
    const newToken = `#${nextTokenNum < 10 ? '0' + nextTokenNum : nextTokenNum}`;
    const newEntry = {
      id: Date.now(),
      token: newToken,
      time: 'Immediate',
      name: walkinName.trim(),
      phone: walkinPhone ? `+91 ${walkinPhone}` : 'Walk-in',
      status: 'Waiting',
      type: 'Reception Walk-In',
      fee: 500,
    };
    setActiveQueue([...activeQueue, newEntry]);
    setWalkinName('');
    setWalkinPhone('');
    setShowWalkinForm(false);
    toast.success(`Walk-in added: Token ${newToken} generated!`);
  };

  // --------------------------------------------------------------------------
  // TAB 3: STANDEE CUSTOMIZATION PREVIEW STATE
  // --------------------------------------------------------------------------
  const [standeeDoctor, setStandeeDoctor] = useState('Dr. Rajesh Sharma, MD');
  const [standeeSubtitle, setStandeeSubtitle] = useState('General Medicine & Family Clinic');
  const [standeeSlug, setStandeeSlug] = useState('dr-rajesh');

  const handleDownloadSamplePdf = () => {
    try {
      generateAppointmentPdf({
        bookingId: 'BK-SAMPLE-2026',
        tokenNumber: '#08',
        clientName: 'Rahul Verma',
        clientPhone: '+91 98765 43210',
        doctorName: standeeDoctor,
        doctorTitle: standeeSubtitle,
        date: new Date().toISOString(),
        timeSlot: '11:00 AM',
        fee: 500,
        clinicAddress: 'Apollo Clinic, Bhubaneswar, Odisha',
        status: 'CONFIRMED',
      });
      toast.success('Generated and downloaded Official Appointment Pass PDF!');
    } catch (err) {
      toast.error('Could not generate PDF: ' + err.message);
    }
  };

  return (
    <section id="interactive-demo" className="py-16 sm:py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Interactive Live Product Suite</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            See BookSaathi in action right now
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Test the live calling desk, frictionless WhatsApp client booking, table standee studio, and digital slips below.
          </p>
        </div>

        {/* 4 Feature Tabs Switcher */}
        <div className="flex justify-center">
          <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200/90 inline-flex flex-wrap items-center justify-center gap-1.5 shadow-2xs max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Live Calling Desk</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('booking')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'booking'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>30-Sec Client Booking</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('standee')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'standee'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Tabletop QR Standee</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('whatsapp')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'whatsapp'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Digital Slips</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: LIVE QUEUE & CALLING DESK */}
        {/* ================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-2xl p-4 sm:p-6 md:p-8 space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="text-lg font-bold text-white">Live OPD & Reception Calling Desk</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    ACTIVE TODAY
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Manage patient tokens in real-time, inject walk-ins with 1-click, and call next numbers with audio chime.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowWalkinForm(!showWalkinForm)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>+ Quick Walk-In</span>
                </button>

                <button
                  type="button"
                  onClick={handleCallNext}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95 ${
                    callingSound ? 'ring-2 ring-emerald-300 animate-pulse' : ''
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Call Next Token</span>
                </button>
              </div>
            </div>

            {/* Walk-in Form Modal / Drawer */}
            {showWalkinForm && (
              <form
                onSubmit={handleAddWalkin}
                className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Add Walk-in Patient / Client to Queue</span>
                  <button
                    type="button"
                    onClick={() => setShowWalkinForm(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ✕ Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Patient / Client Full Name (e.g. Ramesh Sahoo)"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number (Optional for WhatsApp token)"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
                  >
                    Generate Walk-in Token
                  </button>
                </div>
              </form>
            )}

            {/* Live Chamber Status & Queue Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Chamber Spotlight Card */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-850 border border-slate-700/80 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                    Now Serving In Chamber
                  </span>
                  <div className="text-4xl font-black text-white font-mono tracking-tight">
                    {currentToken}
                  </div>
                  <p className="text-xs text-slate-300 font-semibold">
                    {activeQueue.find((q) => q.status === 'In Chamber')?.name || 'Dr. Rajesh Sharma Chamber'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Waiting in Queue</span>
                    <span className="font-bold text-white">
                      {activeQueue.filter((q) => q.status === 'Waiting').length} Patients
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Estimated Wait Time</span>
                    <span className="font-bold text-emerald-400">~15 mins</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Consultation Fee</span>
                    <span className="font-bold text-white">₹500 (Direct UPI)</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Public token display syncs on clinic TVs automatically</span>
                </div>
              </div>

              {/* Right Queue List */}
              <div className="lg:col-span-8 space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Today&apos;s Active Token Sequence
                </span>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {activeQueue.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        item.status === 'In Chamber'
                          ? 'bg-emerald-950/40 border-emerald-500/80 text-white ring-1 ring-emerald-500/30'
                          : item.status === 'Completed'
                          ? 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60'
                          : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-10 h-10 rounded-xl font-mono font-black text-sm flex items-center justify-center shrink-0 ${
                            item.status === 'In Chamber'
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          {item.token}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{item.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300 font-medium">
                              {item.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{item.time}</span>
                            </span>
                            <span>•</span>
                            <span>{item.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            item.status === 'In Chamber'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : item.status === 'Completed'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {item.status}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">₹{item.fee} UPI</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: 30-SEC CLIENT BOOKING FLOW */}
        {/* ================================================================= */}
        {activeTab === 'booking' && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-6 sm:p-8 md:p-10 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Info */}
              <div className="lg:col-span-6 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  Zero Friction Client Experience
                </span>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  No app download. No password to remember.
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your patients and clients tap your link on WhatsApp, choose an open time slot, verify with their phone number, and receive an instant digital token pass with one-tap calendar sync.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/80">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs">
                      1
                    </div>
                    <div className="text-xs">
                      <strong className="text-slate-900 block font-bold">Pick Date & Available Slot</strong>
                      <span className="text-slate-500">Live concurrency prevents double-booking automatically.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/80">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-xs">
                      2
                    </div>
                    <div className="text-xs">
                      <strong className="text-slate-900 block font-bold">Pay Direct via UPI Intent</strong>
                      <span className="text-slate-500">GPay, PhonePe, Paytm open directly with 0% platform fee.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/80">
                    <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 font-bold text-xs">
                      3
                    </div>
                    <div className="text-xs">
                      <strong className="text-slate-900 block font-bold">Receive Instant WhatsApp Token Pass</strong>
                      <span className="text-slate-500">Includes clinic Google Maps pin, token #, and reschedule option.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <span>Get Your Custom Booking Link</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Mobile Mockup Container */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="w-full max-w-sm rounded-3xl bg-slate-900 p-3 shadow-2xl border-4 border-slate-800">
                  <div className="rounded-2xl bg-white overflow-hidden text-slate-900 space-y-3 pb-4">
                    
                    {/* Mobile Status Bar */}
                    <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-[11px] font-mono">
                      <span>9:41 AM</span>
                      <span>5G • 100%</span>
                    </div>

                    {/* Booking Header */}
                    <div className="px-4 pt-2 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black text-indigo-600">BOOKSAATHI</div>
                        <h4 className="text-sm font-bold text-slate-900">Dr. Rajesh Sharma, MD</h4>
                        <p className="text-[11px] text-slate-500">Family Medicine • Apollo Clinic</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                        ₹500 Fee
                      </span>
                    </div>

                    {/* Date Picker Ribbon */}
                    <div className="px-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Select Date
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="p-2 rounded-xl bg-indigo-600 text-white text-center text-xs font-bold shadow-xs">
                          <div className="text-[10px] uppercase">Today</div>
                          <div className="text-sm">22 Sep</div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-700 text-center text-xs font-semibold">
                          <div className="text-[10px] uppercase">Tomorrow</div>
                          <div className="text-sm">23 Sep</div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-700 text-center text-xs font-semibold">
                          <div className="text-[10px] uppercase">Wed</div>
                          <div className="text-sm">24 Sep</div>
                        </div>
                      </div>
                    </div>

                    {/* Slot Grid */}
                    <div className="px-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Available Afternoon Slots
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-600 text-indigo-900 font-bold flex items-center justify-between">
                          <span>04:30 PM</span>
                          <Check className="w-3 h-3 text-indigo-600" />
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold">
                          05:00 PM
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold">
                          05:30 PM
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold">
                          06:00 PM
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="px-4 pt-2">
                      <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center text-xs font-bold shadow-sm">
                        Pay ₹500 & Confirm Slot →
                      </div>
                      <div className="text-[9px] text-center text-slate-400 mt-1">
                        Opens GPay / PhonePe directly
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: TABLETOP QR STANDEE STUDIO */}
        {/* ================================================================= */}
        {activeTab === 'standee' && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-6 sm:p-8 md:p-10 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Standee Customizer Controls */}
              <div className="lg:col-span-6 space-y-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-bold border border-violet-100">
                  <QrCode className="w-3.5 h-3.5 text-violet-600" />
                  Clinic & Chamber Standee Studio
                </span>

                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  High-resolution printable acrylic standees for your front desk
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Place this QR standee on your reception counter or chamber door. Walk-in clients scan with their smartphone camera to instantly book and join today&apos;s digital queue.
                </p>

                <div className="space-y-3 p-4 rounded-xl bg-white border border-slate-200/80">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Professional Name / Practice
                    </label>
                    <input
                      type="text"
                      value={standeeDoctor}
                      onChange={(e) => setStandeeDoctor(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Designation / Specialty
                    </label>
                    <input
                      type="text"
                      value={standeeSubtitle}
                      onChange={(e) => setStandeeSubtitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadSamplePdf}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Official PDF Pass</span>
                  </button>

                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Create Your Own Standee</span>
                  </Link>
                </div>
              </div>

              {/* Standee Visual Acrylic Preview */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="w-full max-w-sm p-6 rounded-2xl bg-white border-2 border-slate-800 shadow-xl text-center space-y-4 relative">
                  
                  {/* Acrylic Top Hole Badge */}
                  <div className="w-4 h-4 rounded-full bg-slate-200 mx-auto border border-slate-300 shadow-inner" />

                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                      SCAN TO BOOK & JOIN QUEUE
                    </div>
                    <h4 className="text-base font-black text-slate-900">{standeeDoctor}</h4>
                    <p className="text-xs text-slate-500 font-medium">{standeeSubtitle}</p>
                  </div>

                  {/* QR Box Visual */}
                  <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-indigo-200 inline-block mx-auto">
                    <div className="w-36 h-36 bg-white rounded-xl flex flex-col items-center justify-center p-2 shadow-xs border border-slate-200">
                      <QrCode className="w-28 h-28 text-slate-900" />
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 font-mono bg-slate-100 p-2 rounded-lg font-semibold truncate">
                    booksaathi.in/book/{standeeSlug}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <Zap className="w-3 h-3 text-indigo-500" />
                      Instant Digital Token
                    </span>
                    <span>•</span>
                    <span>Direct UPI Payment</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: WHATSAPP DIGITAL SLIP */}
        {/* ================================================================= */}
        {activeTab === 'whatsapp' && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-6 sm:p-8 md:p-10 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* WhatsApp Info */}
              <div className="lg:col-span-6 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Automated WhatsApp Notification
                </span>

                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Instant appointment slips delivered straight to their WhatsApp
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  No more phone calls asking &ldquo;What is my token number?&rdquo; or &ldquo;Where is your clinic located?&rdquo;. BookSaathi sends confirmed slips with live token passes and Google Maps navigation.
                </p>

                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Token number & estimated arrival window</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Clinic Google Maps pin with 1-tap navigation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>One-tap .ics Calendar sync for Google & Apple Calendars</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Self-service reschedule link with zero phone calls</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/lookup"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <span>Test Patient Lookup Flow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* WhatsApp Chat Bubble Mockup */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="w-full max-w-sm rounded-2xl bg-[#0b141a] p-4 text-white shadow-xl space-y-3 font-sans">
                  
                  {/* WhatsApp Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs">
                      BS
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>BookSaathi Official</span>
                        <span className="w-3 h-3 rounded-full bg-emerald-500 text-[8px] flex items-center justify-center font-bold">✓</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Verified Business Account</div>
                    </div>
                  </div>

                  {/* Message Bubble */}
                  <div className="p-3.5 rounded-2xl bg-[#202c33] text-xs text-slate-200 space-y-2.5 shadow-xs">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Appointment Confirmed with Dr. Rajesh Sharma</span>
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Hi Rahul, your consultation is confirmed for today.
                    </p>

                    <div className="p-2.5 rounded-xl bg-[#111b21] border border-slate-700/60 text-[11px] space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-400 font-bold">Token Number:</span>
                        <span className="font-mono font-bold text-white">#08</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span><strong>Time Slot:</strong> 11:00 AM (Today)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span><strong>Location:</strong> Apollo Clinic, Bhubaneswar</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3 h-3 text-emerald-400" />
                        <span><strong>Payment:</strong> ₹500 (Paid via UPI)</span>
                      </div>
                    </div>

                    <div className="pt-1 flex flex-col gap-1.5">
                      <div className="py-2 px-3 rounded-lg bg-[#00a884] text-slate-950 font-bold text-[11px] text-center flex items-center justify-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Open Clinic in Google Maps</span>
                      </div>
                      <div className="py-2 px-3 rounded-lg bg-slate-700/60 text-white font-medium text-[11px] text-center flex items-center justify-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                        <span>Add to Google / Apple Calendar (.ics)</span>
                      </div>
                    </div>

                    <div className="text-[9px] text-right text-slate-400 pt-1">
                      9:42 AM • Delivered
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
