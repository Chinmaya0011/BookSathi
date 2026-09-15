'use client';

import { useState, useEffect } from 'react';
import { KeyRound, X, Mail, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function BookingOtpModal({
  isOpen,
  onClose,
  email,
  patientName,
  onVerifyAndConfirm,
  onResendOtp,
  sendingOtp,
  verifying,
  error,
}) {
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    if (isOpen) {
      setOtp('');
      setCooldown(30);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      onVerifyAndConfirm(otp);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || sendingOtp) return;
    await onResendOtp();
    setCooldown(30);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 text-slate-900 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
            <KeyRound className="w-7 h-7 stroke-[1.75]" />
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Verify Your Booking
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            We sent a 6-digit verification code to <span className="font-bold text-slate-800">{email}</span> to confirm your appointment.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 text-center animate-in shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5 text-center">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Enter 6-Digit Code
            </label>
            <input
              type="text"
              autoFocus
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-full py-3.5 px-4 text-center tracking-[0.5em] font-mono font-black text-2xl bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all"
            />
            <p className="text-[11px] text-slate-400 pt-1">
              Valid for 5 minutes • Maximum 5 attempts
            </p>
          </div>

          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-500">Didn't receive code?</span>
            {cooldown > 0 ? (
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Resend in {cooldown}s</span>
              </span>
            ) : (
              <button
                type="button"
                disabled={sendingOtp}
                onClick={handleResend}
                className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sendingOtp ? 'animate-spin' : ''}`} />
                <span>Resend OTP</span>
              </button>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              disabled={otp.length !== 6 || verifying}
              loading={verifying}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-600/25 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              Verify & Complete Booking
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 text-center cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-Bit SSL Encrypted Verification</span>
        </div>
      </div>
    </div>
  );
}
