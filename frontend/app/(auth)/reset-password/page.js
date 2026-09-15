'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CalendarCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    let isMounted = true;

    async function checkToken() {
      if (!token) {
        if (isMounted) {
          setVerifying(false);
          setTokenValid(false);
          setTokenError('No password reset token was provided in the link.');
        }
        return;
      }

      try {
        setVerifying(true);
        const res = await authService.verifyResetToken(token);
        if (isMounted) {
          setTokenValid(true);
          setMaskedEmail(res.data?.email || '');
        }
      } catch (err) {
        if (isMounted) {
          setTokenValid(false);
          setTokenError(
            err.response?.data?.message ||
              'This password reset link is invalid, has expired, or has already been used.'
          );
        }
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    }

    checkToken();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Password strength calculations
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumberOrSpecial = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const strengthScore = [hasMinLength, hasLetter, hasNumberOrSpecial].filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields match.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to reset password. This link may have expired or already been used.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background accents */}
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
          Create new password
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
          Set a secure password for your BookSaathi account.
        </p>
      </div>

      {/* Card Content */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white/95 backdrop-blur-sm py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/50 border border-slate-200/80 rounded-2xl">
          {verifying ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Verifying secure reset link...</p>
              <p className="text-xs text-slate-500">Checking link expiration and security cryptographic signature</p>
            </div>
          ) : !tokenValid ? (
            <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Link Expired or Invalid</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                {tokenError || 'This password reset link is invalid, has expired, or has already been used.'}
              </p>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 mb-6 text-left text-xs text-amber-900">
                <p className="font-semibold mb-1">Why did this happen?</p>
                <ul className="list-disc list-inside space-y-1 text-amber-800/90">
                  <li>Reset links expire automatically after 15 minutes.</li>
                  <li>Reset links can only be used once for security.</li>
                  <li>A newer reset link may have been requested.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Link href="/forgot-password" className="block w-full">
                  <Button className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2">
                    Request a New Reset Link
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/login" className="block w-full">
                  <Button variant="outline" className="w-full justify-center py-2.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Password Changed!</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Your password has been successfully updated. All previous sessions have been signed out for security.
              </p>

              <Button
                onClick={() => router.push('/login')}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                Sign In With New Password
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
              {maskedEmail && (
                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center gap-2 text-xs text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Resetting password for <strong className="font-semibold text-indigo-950">{maskedEmail}</strong>
                  </span>
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength meter */}
                {password && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strengthScore === 1
                            ? 'w-1/3 bg-red-500'
                            : strengthScore === 2
                            ? 'w-2/3 bg-amber-500'
                            : 'w-full bg-emerald-500'
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        Strength:{' '}
                        <strong
                          className={
                            strengthScore === 1
                              ? 'text-red-600'
                              : strengthScore === 2
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }
                        >
                          {strengthScore === 1 ? 'Weak' : strengthScore === 2 ? 'Medium' : 'Strong'}
                        </strong>
                      </span>
                      <span>Min 6 characters</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-3 bg-slate-50/50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-sm ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-300 focus:border-red-500'
                        : confirmPassword && passwordsMatch
                        ? 'border-emerald-400 focus:border-emerald-500'
                        : 'border-slate-200 focus:border-indigo-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {confirmPassword && !passwordsMatch && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && passwordsMatch && (
                  <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    Passwords match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={!password || !confirmPassword || password !== confirmPassword}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                Reset Password & Sign In
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}
        </div>

        {/* Security Info */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
          <span>Single-use link securely verified by BookSaathi</span>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
