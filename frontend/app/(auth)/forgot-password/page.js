'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
      setResendCooldown(60);
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset link. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group transition-transform hover:scale-[1.02]">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 group-hover:bg-indigo-700 transition-colors">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Book<span className="text-indigo-600">Saathi</span>
          </span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
          Enter your registered email address and we'll send you a secure, single-use reset link.
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white/95 backdrop-blur-sm py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/50 border border-slate-200/80 rounded-2xl">
          {submitted ? (
            <div className="text-center py-2 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Mail className="w-7 h-7 animate-bounce" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-2">Check your inbox</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                We've sent a secure reset link to <br />
                <strong className="text-slate-900 font-semibold bg-slate-100 px-2.5 py-1 rounded-md text-xs sm:text-sm inline-block mt-1">
                  {email}
                </strong>
              </p>

              {/* Security features highlight */}
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 mb-6 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Link expires automatically in <strong>15 minutes</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Single-use link — automatically expires upon reset</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={loading || resendCooldown > 0}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : 'Did not receive email? Resend'}
                </button>

                <Link href="/login" className="block w-full">
                  <Button variant="outline" className="w-full justify-center py-2.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                Send Password Reset Link
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Security badge footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
          <span>Encrypted with SHA-256 tokens & single-use security</span>
        </div>
      </div>
    </div>
  );
}
