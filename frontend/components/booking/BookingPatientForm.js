'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  User,
  Phone,
  Mail,
  FileText,
  CreditCard,
  ShieldCheck,
  Clock,
  Sparkles,
  Building2,
  Lock,
  LogIn,
  CheckCircle2,
  Calendar,
  IndianRupee,
  ArrowRight,
  Video,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatINR, format12Hour, formatDisplayDate, cn } from '@/lib/utils';
import { publicService } from '@/services/public.service';
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
  websiteHp,
  setWebsiteHp,
  submitting,
  onSubmit,
  onBack,
  holdCountdown = 0,
}) {
  const currentFee = selectedType?.fee || profile?.consultationFee || 500;
  const redirectPath = typeof window !== 'undefined' ? window.location.pathname : `/book/${profile?.bookingSlug || ''}`;

  // Feature 7: Auto-fill returning customer's name on phone entry
  useEffect(() => {
    const cleanPhone = (patientPhone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10 && !patientName) {
      publicService
        .lookupByPhone(cleanPhone)
        .then((res) => {
          const list = res.data?.appointments || (Array.isArray(res.data) ? res.data : []);
          if (list.length > 0) {
            const prior = list.find((a) => a.customerName) || list[0];
            if (prior?.customerName) {
              setPatientName(prior.customerName);
              if (prior.customerEmail && !patientEmail) {
                setPatientEmail(prior.customerEmail);
              }
            }
          }
        })
        .catch(() => {
          // Graceful fallback if no prior appointment
        });
    }
  }, [patientPhone, patientName, patientEmail, setPatientName, setPatientEmail]);

  const storedUser =
    typeof window !== 'undefined'
      ? (() => {
          try {
            const raw = localStorage.getItem('bs_user');
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        })()
      : null;

  const currentUser = user || storedUser;

  // Email OTP Verification state
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const handleSendEmailOtp = async () => {
    if (!patientEmail || !patientEmail.includes('@')) {
      toast.error('Please enter a valid email address first');
      return;
    }
    setSendingOtp(true);
    try {
      await publicService.sendEmailOtp(profile?.bookingSlug, {
        email: patientEmail,
        customerName: patientName,
      });
      setOtpSent(true);
      setOtpCooldown(30);
      toast.success(`6-digit code sent to ${patientEmail}`);
      const timer = setInterval(() => {
        setOtpCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send verification code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!enteredOtp || enteredOtp.trim().length < 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    setVerifyingOtp(true);
    try {
      await publicService.verifyEmailOtp(profile?.bookingSlug, {
        email: patientEmail,
        otp: enteredOtp.trim(),
      });
      setIsEmailVerified(true);
      setOtpSent(false);
      toast.success('Email verified successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  return (
    <form onSubmit={onSubmit} className="p-5 sm:p-7 space-y-6 animate-in fade-in duration-200 relative">
      {/* Invisible Honeypot field for bot trapping */}
      <input
        type="text"
        name="website_hp"
        value={websiteHp || ''}
        onChange={(e) => setWebsiteHp && setWebsiteHp(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{
          opacity: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          height: 0,
          width: 0,
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />

      {/* 3-minute Slot Hold Countdown Banner */}
      {holdCountdown > 0 && (
        <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border border-amber-300/80 rounded-2xl flex items-center justify-between text-xs text-amber-950 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="font-extrabold">Slot Temporarily Reserved For You</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono font-black bg-amber-200/90 text-amber-950 px-2.5 py-1 rounded-xl shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-800" />
            <span>{formatCountdown(holdCountdown)}</span>
          </div>
        </div>
      )}

      {/* Selected Slot Recap Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 text-white shadow-md border border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
            Selected Slot
          </span>
          <div className="flex items-center gap-2 text-sm sm:text-base font-black">
            <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{formatDisplayDate(selectedDate)}</span>
            <span>•</span>
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{format12Hour(selectedTime)}</span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            {selectedType?.name || 'General Consultation'} ({selectedType?.duration || 30} mins)
          </p>
        </div>

        <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation Fee</span>
          <span className="text-lg sm:text-xl font-black text-white">{formatINR(currentFee)}</span>
        </div>
      </div>

      {/* Patient Personal Information */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white inline-flex items-center justify-center text-[10px] font-black shadow-xs shadow-indigo-600/30">
              1
            </span>
            <span>Patient & Contact Details</span>
          </label>
          <span className="text-[11px] text-slate-400 font-medium">No account needed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="e.g. Aarav Patel"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
              prefix={<User className="w-4 h-4 text-slate-400" />}
              className="py-2.5 text-xs sm:text-sm bg-white border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Mobile Number (+91) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="tel"
              placeholder="10-digit phone number"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              required
              prefix={<Phone className="w-4 h-4 text-slate-400" />}
              className="py-2.5 text-xs sm:text-sm bg-white border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Email Address <span className="text-slate-400 font-normal">(For instant calendar invite & OTP)</span>
            </label>
            {isEmailVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
            ) : patientEmail && patientEmail.includes('@') ? (
              <button
                type="button"
                disabled={sendingOtp || otpCooldown > 0}
                onClick={handleSendEmailOtp}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="w-3 h-3" />
                <span>{sendingOtp ? 'Sending...' : otpCooldown > 0 ? `Resend (${otpCooldown}s)` : otpSent ? 'Resend OTP' : 'Verify with OTP'}</span>
              </button>
            ) : null}
          </div>
          <Input
            type="email"
            placeholder="e.g. aarav@gmail.com"
            value={patientEmail}
            onChange={(e) => {
              setPatientEmail(e.target.value);
              if (isEmailVerified) setIsEmailVerified(false);
            }}
            prefix={<Mail className="w-4 h-4 text-slate-400" />}
            className="py-2.5 text-xs sm:text-sm bg-white border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
          />

          {/* Inline Email OTP Input Field */}
          {otpSent && !isEmailVerified && (
            <div className="mt-2.5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 animate-in fade-in duration-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Enter 6-Digit Email Code</span>
                </span>
                <span className="text-[10px] text-indigo-700">Code sent via Nodemailer</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-36 px-3 py-1.5 text-center tracking-widest font-mono font-black text-sm bg-white border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <button
                  type="button"
                  disabled={verifyingOtp || enteredOtp.length < 6}
                  onClick={handleVerifyEmailOtp}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {verifyingOtp ? 'Verifying...' : 'Confirm OTP'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Symptoms or Reason for Visit <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            placeholder="Briefly describe symptoms, previous diagnosis, or purpose of consultation..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Payment Preference */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white inline-flex items-center justify-center text-[10px] font-black shadow-xs shadow-indigo-600/30">
              2
            </span>
            <span>Payment Method</span>
          </label>
          <span className="text-[11px] font-semibold text-emerald-600">0% Convenience Fee</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMode('PAY_AT_CLINIC')}
            className={cn(
              'p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3 cursor-pointer',
              paymentMode === 'PAY_AT_CLINIC'
                ? 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-600/25 shadow-xs'
                : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                paymentMode === 'PAY_AT_CLINIC' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              )}
            >
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900">Pay at Clinic / Session</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Pay in cash or clinic UPI during consultation.</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMode('PAY_ONLINE')}
            className={cn(
              'p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3 cursor-pointer',
              paymentMode === 'PAY_ONLINE'
                ? 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-600/25 shadow-xs'
                : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                paymentMode === 'PAY_ONLINE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              )}
            >
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900">Pay Online Now (UPI / Card)</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Instant confirmation with digital receipt.</p>
            </div>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex flex-col-reverse sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Slots</span>
        </button>

        <Button
          type="submit"
          loading={submitting}
          className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-indigo-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>{user ? 'Confirm & Lock Appointment' : 'Sign In & Confirm Appointment'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
