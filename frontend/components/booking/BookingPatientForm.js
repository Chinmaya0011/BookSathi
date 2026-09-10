'use client';

import Link from 'next/link';
import { ChevronLeft, User, Phone, Mail, FileText, CreditCard, ShieldCheck, Clock, Sparkles, Building2, Lock, LogIn } from 'lucide-react';
import { formatINR, format12Hour, formatDisplayDate, cn } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function BookingPatientForm({
  selectedDate,
  selectedTime,
  selectedType,
  profile,
  user,
  patientName,
  setPatientName,
  patientPhone,
  setPatientPhone,
  patientEmail,
  setPatientEmail,
  reason,
  setReason,
  paymentMode,
  setPaymentMode,
  submitting,
  onSubmit,
  onBack,
  holdCountdown = 0,
}) {
  const currentFee = selectedType?.fee || profile?.consultationFee || 500;
  const redirectPath = typeof window !== 'undefined' ? window.location.pathname : `/book/${profile?.bookingSlug || ''}`;

  const storedUser = typeof window !== 'undefined' ? (() => {
    try {
      const raw = localStorage.getItem('bs_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })() : null;

  const currentUser = user || storedUser;

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  return (
    <form onSubmit={onSubmit} className="p-5 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* 5-minute Hold countdown banner */}
      {holdCountdown > 0 && (
        <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-500/10 border border-amber-300 rounded-2xl flex items-center justify-between text-xs text-amber-950 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="font-bold">Slot Temporarily Reserved For You</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono font-black bg-amber-200/80 text-amber-950 px-2.5 py-1 rounded-xl shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>{formatCountdown(holdCountdown)}</span>
          </div>
        </div>
      )}

      {/* User Auth Status Banner */}
      {!currentUser ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-300/80 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-amber-950">Account Required to Book</h4>
              <p className="text-[11px] sm:text-xs text-amber-900/90 mt-0.5 leading-relaxed font-medium">
                Sign in or register to reserve this consultation, join the video room, and track appointments in your dashboard.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
            <Link
              href={`/register/user?redirect=${encodeURIComponent(redirectPath)}`}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs text-center transition-all shadow-2xs active:scale-95"
            >
              <span>Register</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>Signed in as</span>
                <span className="text-emerald-700 font-black">{currentUser.name}</span>
              </p>
              <p className="text-[11px] text-slate-500 font-mono">{currentUser.email || currentUser.phone}</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-xl border border-emerald-200">
            Verified Customer
          </span>
        </div>
      )}

      {/* Selected Slot Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-slate-600 hover:text-indigo-600 inline-flex items-center gap-1.5 cursor-pointer transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Change Date or Time Slot</span>
        </button>

        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <span className="font-bold text-indigo-950">
            {formatDisplayDate(selectedDate)} at {format12Hour(selectedTime)}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-indigo-700 font-semibold">{selectedType?.name || 'Consultation'}</span>
        </div>
      </div>

      {/* Client / Patient Information */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center text-[10px] font-black">1</span>
            <span>Your Contact Information</span>
          </label>
          <span className="text-[11px] text-slate-400 font-medium">Confidential & Encrypted</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            required
            placeholder="e.g. Rahul Sharma"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Mobile Number (WhatsApp Updates) *"
            required
            type="tel"
            placeholder="e.g. 9876543210"
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <Input
          label="Email Address (For Calendar Invite & PDF Slip)"
          type="email"
          placeholder="e.g. rahul@example.com"
          value={patientEmail}
          onChange={(e) => setPatientEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
        />

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Consultation Topic / Specific Notes (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Briefly describe your requirements or queries in advance..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed shadow-2xs"
          />
        </div>
      </div>

      {/* Payment Selection */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center text-[10px] font-black">2</span>
          <span>Select Payment Preference</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Pay In Person */}
          <button
            type="button"
            onClick={() => setPaymentMode('OFFLINE')}
            className={cn(
              'p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer shadow-2xs',
              paymentMode === 'OFFLINE'
                ? 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-600/25 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  <span>Pay at Clinic / Venue</span>
                </span>
                {paymentMode === 'OFFLINE' && (
                  <span className="w-3 h-3 rounded-full bg-indigo-600 ring-2 ring-indigo-200" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Zero advance payment required. Pay via UPI or Cash directly during your visit.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Pay on Arrival</span>
              <span className="text-xs font-black text-slate-900">{formatINR(currentFee)}</span>
            </div>
          </button>

          {/* Pay Online */}
          <button
            type="button"
            onClick={() => setPaymentMode('ONLINE')}
            className={cn(
              'p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer shadow-2xs',
              paymentMode === 'ONLINE'
                ? 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-600/25 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs sm:text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Pay Online (UPI / Card)</span>
                </span>
                {paymentMode === 'ONLINE' && (
                  <span className="w-3 h-3 rounded-full bg-indigo-600 ring-2 ring-indigo-200" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Instant confirmation, priority scheduling queue & digital GST invoice.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-indigo-700">Online Rate</span>
              <span className="text-xs font-black text-indigo-700">{formatINR(currentFee)}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Breakdown Summary Card */}
      <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 text-xs space-y-2">
        <div className="flex justify-between text-slate-600">
          <span>Consultation Service:</span>
          <span className="font-bold text-slate-900">
            {selectedType?.name || 'General Consultation'} ({selectedType?.duration || 30} mins)
          </span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Date & Time:</span>
          <span className="font-bold text-slate-900">
            {formatDisplayDate(selectedDate)} • {format12Hour(selectedTime)}
          </span>
        </div>
        <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
          <span className="font-bold text-slate-900">Total Consultation Fee:</span>
          <span className="font-black text-indigo-700 text-sm sm:text-base">{formatINR(currentFee)}</span>
        </div>
      </div>

      {/* Submit CTA */}
      {currentUser ? (
        <Button
          type="submit"
          loading={submitting}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold shadow-xl shadow-indigo-600/30 active:scale-[0.99] rounded-2xl cursor-pointer"
        >
          {paymentMode === 'ONLINE' ? 'Proceed to Instant Payment' : 'Confirm & Reserve Consultation Slot'}
        </Button>
      ) : (
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold shadow-xl shadow-indigo-600/30 active:scale-[0.99] rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In to Complete Booking</span>
        </Link>
      )}
    </form>
  );
}
