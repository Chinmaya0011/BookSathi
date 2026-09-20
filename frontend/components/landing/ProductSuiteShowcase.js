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
} from 'lucide-react';
import { toast } from 'sonner';
import { format12Hour, formatDisplayDate, formatINR } from '@/lib/utils';
import { generateAppointmentPdf } from '@/lib/generateAppointmentPdf';
import Link from 'next/link';

export default function ProductSuiteShowcase() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'booking' | 'pdf'

  // --------------------------------------------------------------------------
  // TAB 1: INTERACTIVE DASHBOARD STATE
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
      phone: '+91 82490 56789',
      status: 'Waiting',
      type: 'Walk-in Desk',
      fee: 500,
    },
    {
      id: 4,
      token: '#07',
      time: '12:00 PM',
      name: 'Sneha Patnaik',
      phone: '+91 70081 99887',
      status: 'Waiting',
      type: 'Online Booking',
      fee: 800,
    },
  ]);
  const [walkinCounter, setWalkinCounter] = useState(8);
  const [completedCount, setCompletedCount] = useState(12);

  const handleCallNext = () => {
    const nextWaiting = activeQueue.find((item) => item.status === 'Waiting');
    if (nextWaiting) {
      setActiveQueue((prev) =>
        prev.map((item) => {
          if (item.status === 'In Chamber') {
            return { ...item, status: 'Completed' };
          }
          if (item.id === nextWaiting.id) {
            return { ...item, status: 'In Chamber' };
          }
          return item;
        })
      );
      setCompletedCount((c) => c + 1);
      toast.success(`Calling Token ${nextWaiting.token} (${nextWaiting.name}) to Consultation Desk!`);
    } else {
      toast.info('All scheduled waiting patients have been attended.');
    }
  };

  const handleAddWalkin = () => {
    const newWalkin = {
      id: Date.now(),
      token: `#0${walkinCounter}`,
      time: 'Just Now',
      name: `Walk-in Client #${walkinCounter}`,
      phone: '+91 98xxx xxxxx',
      status: 'Waiting',
      type: 'Walk-in Desk',
      fee: 500,
    };
    setActiveQueue((prev) => [...prev, newWalkin]);
    setWalkinCounter((c) => c + 1);
    toast.success(`Walk-in added! Assigned Token #0${walkinCounter}`);
  };

  // --------------------------------------------------------------------------
  // TAB 2: INTERACTIVE BOOKING PAGE STATE
  // --------------------------------------------------------------------------
  const [selectedService, setSelectedService] = useState('general');
  const [selectedDate, setSelectedDate] = useState('Today, 20 Sep');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('11:00 AM');
  const [bookingClientName, setBookingClientName] = useState('Ananya Sen');
  const [bookingClientPhone, setBookingClientPhone] = useState('9876543210');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const servicesList = [
    { id: 'general', name: 'General Consultation', duration: '30 mins', fee: 500 },
    { id: 'followup', name: 'Quick Follow-Up Visit', duration: '15 mins', fee: 300 },
    { id: 'comprehensive', name: 'Comprehensive Review', duration: '45 mins', fee: 800 },
  ];

  const timeSlots = ['09:30 AM', '10:30 AM', '11:00 AM', '04:30 PM', '05:30 PM', '06:30 PM'];

  const handleSimulateBooking = (e) => {
    e.preventDefault();
    setBookingConfirmed(true);
    toast.success('🎉 Booking Confirmed! SMS & WhatsApp Pass Generated.');
  };

  // --------------------------------------------------------------------------
  // TAB 3: REAL PDF GENERATOR DOWNLOAD TRIGGER
  // --------------------------------------------------------------------------
  const handleDownloadSamplePdf = (isQueue = false) => {
    try {
      const sampleAppointment = {
        appointmentCode: 'BK-7892',
        customerName: 'Rahul Varma',
        customerPhone: '+91 98765 43210',
        customerEmail: 'rahul.varma@example.com',
        appointmentTypeName: isQueue ? 'OPD Token Consultation' : 'General Health Consultation',
        dateString: new Date().toISOString().split('T')[0],
        startTime: '10:30',
        endTime: '11:00',
        duration: 30,
        fee: 500,
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        bookingType: isQueue ? 'QUEUE' : 'TIME_SLOT',
        queueNumber: 8,
        tokenNumber: 8,
      };

      const sampleProfile = {
        name: 'Dr. Rajesh Sharma',
        profession: 'DOCTOR',
        specialization: 'General Physician • MBBS, MD',
        clinicName: 'Sharma Health Clinic & Diagnostic',
        address: 'Suite 402, Kalinga Nagar, Bhubaneswar',
        city: 'Bhubaneswar',
        phone: '+91 94370 12345',
        googleMapUrl: 'https://maps.google.com',
        bookingSlug: 'dr-rajesh-clinic',
      };

      generateAppointmentPdf(sampleAppointment, sampleProfile);
      toast.success('Sample Official PDF Pass downloaded to your device!');
    } catch (e) {
      console.error('PDF error:', e);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <section className="py-20 sm:py-28 bg-slate-900 text-white overflow-hidden relative border-t border-b border-slate-800">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Platform Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            See BookSaathi in Action.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Experience the 3 core pillars: The Doctor/CA Daily Queue Dashboard, the Seamless Client Booking Page, and the Official Admission PDF Pass.
          </p>
        </div>

        {/* Pillar Switcher Tabs */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl max-w-full overflow-x-auto">
            {[
              { id: 'dashboard', label: '1. Pro Dashboard & Live Queue', icon: LayoutDashboard },
              { id: 'booking', label: '2. Client Booking Page', icon: Smartphone },
              { id: 'pdf', label: '3. Official PDF Pass & Slip', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-1 ring-indigo-400 font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SHOWCASE 1: PRO DASHBOARD & LIVE OPD TOKEN QUEUE                         */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl p-5 sm:p-8 space-y-6 animate-in fade-in duration-200">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-sm">
                  🩺
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">Dr. Rajesh Sharma, MD</h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      ● Clinic Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Sharma Health Clinic • OPD Session Active</p>
                </div>
              </div>

              {/* Action Buttons in Mock UI */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={handleAddWalkin}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>+ Add Walk-In Patient</span>
                </button>
                <button
                  onClick={handleCallNext}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Call Next Token</span>
                </button>
              </div>
            </div>

            {/* Live KPI Metric Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Bookings Today
                </span>
                <div className="text-xl sm:text-2xl font-black text-white font-mono">
                  {activeQueue.length + completedCount}
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +14% vs yesterday
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Today&apos;s Realized Revenue
                </span>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  ₹{((activeQueue.length + completedCount) * 500).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-400">0% Platform Fee • Instant UPI</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  Currently in Waiting
                </span>
                <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  {activeQueue.filter((a) => a.status === 'Waiting').length}
                </div>
                <div className="text-[11px] text-amber-300/80">Avg. ~15m turnaround</div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                  Consulted & Completed
                </span>
                <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">
                  {completedCount}
                </div>
                <div className="text-[11px] text-indigo-300/80">Automated WhatsApp Slip Sent</div>
              </div>
            </div>

            {/* Live Queue Ledger Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                <span>Active Patient Calling Ledger</span>
                <span>Click &quot;Call Next Token&quot; above to advance</span>
              </div>

              <div className="space-y-2">
                {activeQueue.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      item.status === 'In Chamber'
                        ? 'bg-indigo-950/60 border-indigo-500/50 shadow-md shadow-indigo-900/20'
                        : item.status === 'Completed'
                        ? 'bg-slate-900/40 border-slate-800 opacity-60'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm font-mono shrink-0 ${
                          item.status === 'In Chamber'
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 animate-pulse'
                            : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        {item.token}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-white truncate">{item.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-slate-800 text-slate-300">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{item.type}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">{formatINR(item.fee)} PAID</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                          item.status === 'In Chamber'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : item.status === 'Completed'
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SHOWCASE 2: PUBLIC CLIENT BOOKING PAGE EXPERIENCE                         */}
        {/* ========================================================================= */}
        {activeTab === 'booking' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
            {/* Left Column: Explainer */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  Zero App Download
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Your Branded Booking Link
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Patients or clients click your link on WhatsApp, choose a service and slot, and confirm with instant UPI payment. Works natively in any mobile browser in under 30 seconds.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Key Booking Features</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Instant WhatsApp confirmation & pass with clinic map link</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Live token queue tracking link so patients arrive just in time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Direct UPI collection (GPay, PhonePe, Paytm) — 0% fee</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/book/dr-rajesh"
                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300"
              >
                <span>Open Live Patient Booking Demo →</span>
              </Link>
            </div>

            {/* Right Column: Interactive Booking Widget Mockup */}
            <div className="lg:col-span-7 bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6">
              {/* Header Profile Badge */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                    👨‍⚕️
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">Dr. Rajesh Sharma</h4>
                    <p className="text-xs text-slate-500 font-semibold">
                      General Physician • MBBS, MD • Bhubaneswar
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Pro
                </span>
              </div>

              {!bookingConfirmed ? (
                <form onSubmit={handleSimulateBooking} className="space-y-4">
                  {/* Service Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      1. Select Consultation Service
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {servicesList.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedService(s.id)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            selectedService === s.id
                              ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 text-indigo-950 font-bold'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <span className="text-xs leading-snug">{s.name}</span>
                          <span className="text-[11px] text-emerald-700 font-bold mt-1">
                            {formatINR(s.fee)} • {s.duration}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slot Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      2. Pick Date & Available Slot
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                            selectedTimeSlot === slot
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Client Details Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={bookingClientName}
                        onChange={(e) => setBookingClientName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        WhatsApp Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={bookingClientPhone}
                        onChange={(e) => setBookingClientPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Confirm &amp; Pay ₹500 via UPI</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in zoom-in-95 duration-150">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xl shadow-xs">
                    ✓
                  </div>
                  <h4 className="text-base font-black text-emerald-950">Appointment Confirmed!</h4>
                  <p className="text-xs text-emerald-800">
                    Token #08 assigned for {bookingClientName} on {selectedTimeSlot}.
                    Digital slip sent to WhatsApp (+91 {bookingClientPhone}).
                  </p>
                  <button
                    onClick={() => setBookingConfirmed(false)}
                    className="px-4 py-2 bg-white text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 shadow-2xs cursor-pointer"
                  >
                    Book Another Test Slot
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SHOWCASE 3: OFFICIAL PDF APPOINTMENT PASS & ADMISSION SLIP               */}
        {/* ========================================================================= */}
        {activeTab === 'pdf' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-200">
            {/* Left Column: PDF Explainer & Download Button */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  Executive Document Engine
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Official Admission Pass &amp; PDF Receipt
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Generated automatically on confirmation and printable on reception. Features verified clinic location, QR verification barcode, token number, and payment acknowledgment.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDownloadSamplePdf(false)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Sample Appointment PDF</span>
                </button>

                <button
                  onClick={() => handleDownloadSamplePdf(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Download Live Token Queue Slip</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 italic">
                * Built with high-precision vector PDF rendering (jsPDF) with zero server latency.
              </p>
            </div>

            {/* Right Column: Realistic PDF Card Mockup Preview */}
            <div className="lg:col-span-7 bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
              {/* PDF Header Band */}
              <div className="bg-indigo-700 p-6 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-black tracking-tight">BookSaathi</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-800 text-indigo-200">
                      OFFICIAL PASS
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200 mt-0.5">Digital Appointment Slip &amp; Receipt</p>
                </div>

                <div className="text-right font-mono text-xs text-indigo-200">
                  <div>CODE: BK-7892</div>
                  <div className="text-[10px]">VERIFIED PASS</div>
                </div>
              </div>

              {/* PDF Body Mockup Content */}
              <div className="p-6 sm:p-8 space-y-6 bg-slate-50/50">
                {/* Priority Schedule Card */}
                <div className="p-4 rounded-2xl bg-indigo-50 border-l-4 border-l-indigo-600 border border-indigo-200/80 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      Priority Scheduled Slot
                    </span>
                    <div className="text-lg font-black text-indigo-950 font-mono mt-0.5">
                      10:30 AM – 11:00 AM
                    </div>
                    <div className="text-xs text-indigo-800 font-bold">
                      Thursday, 20 September 2026
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black px-3 py-1 rounded-xl bg-emerald-600 text-white inline-block shadow-2xs font-mono">
                      TOKEN #08
                    </span>
                  </div>
                </div>

                {/* 2-Column Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-1.5 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Patient Details
                    </span>
                    <div className="text-sm font-black text-slate-900">Rahul Varma</div>
                    <div className="text-slate-600 font-semibold">+91 98765 43210</div>
                    <div className="text-slate-500">rahul.varma@example.com</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-1.5 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Clinic &amp; Consultant
                    </span>
                    <div className="text-sm font-black text-slate-900">Dr. Rajesh Sharma, MD</div>
                    <div className="text-slate-600 font-semibold">Sharma Health Clinic</div>
                    <div className="text-slate-500">Suite 402, Kalinga Nagar, Bhubaneswar</div>
                  </div>
                </div>

                {/* Receipt & Security Footer */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      ✓
                    </span>
                    <div>
                      <span className="font-black text-emerald-950">Payment Acknowledged: ₹500.00</span>
                      <p className="text-[11px] text-emerald-700">Settled via Direct UPI (GPay / PhonePe)</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-800 bg-white px-2 py-1 rounded-md border border-emerald-200">
                    TXN #984210928
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
