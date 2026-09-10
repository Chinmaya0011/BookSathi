'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  UserCheck,
  User,
  ShieldAlert,
  Briefcase,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Star,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoLoggingRole, setAutoLoggingRole] = useState(null);

  const performLogin = async (loginEmail, loginPassword) => {
    setError('');
    setLoading(true);

    try {
      const data = await login(loginEmail, loginPassword);
      toast.success('Signed in successfully');

      const redirectParam = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect')
        : null;

      if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
        router.push(redirectParam);
      } else if (data?.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setAutoLoggingRole(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleQuickDemo = (demoEmail, demoPassword, roleKey) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setAutoLoggingRole(roleKey);
    performLogin(demoEmail, demoPassword);
  };

  const demoAccounts = [
    {
      roleKey: 'PRO',
      title: 'Dr. Rajesh Sharma',
      email: 'dr.rajesh@booksaathi.in',
      pass: 'Password123',
      badge: 'Doctor Desk',
      icon: Briefcase,
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      roleKey: 'USER',
      title: 'Rahul Sharma',
      email: 'rahul.user@booksaathi.in',
      pass: 'User@12345',
      badge: 'Customer',
      icon: UserCheck,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      roleKey: 'ADMIN',
      title: 'Super Admin',
      email: 'admin@booksaathi.in',
      pass: 'Admin@12345',
      badge: 'Admin',
      icon: ShieldAlert,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[660px]">
        {/* Left Column: Fixed Width 420px Visual Showcase */}
        <div className="w-full lg:w-[420px] shrink-0 relative p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white overflow-hidden">
          {/* Background Photography */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <img
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=1000&auto=format&fit=crop&q=80"
              alt="Professional Consultation"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Top Brand */}
          <div className="relative z-10 space-y-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Book<span className="text-indigo-400">Saathi</span>
              </span>
            </Link>
            <p className="text-xs text-slate-300 font-medium pt-1">
              India's unified appointment platform for doctors, consultants & clients.
            </p>
          </div>

          {/* Center: Animated Floating SaaS Badges */}
          <div className="relative z-10 py-6 space-y-3.5 my-auto hidden sm:block">
            {/* Floating Card 1 */}
            <div className="animate-float-slow bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-xl max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Appointment Confirmed</h4>
                  <p className="text-[10px] text-slate-300">Dr. Rajesh Sharma • Today, 4:30 PM</p>
                </div>
              </div>
            </div>

            {/* Floating Card 2 */}
            <div className="animate-float-reverse ml-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-xl max-w-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Verified Practice</span>
                    <span className="text-[10px] text-indigo-300">100% Encrypted Records</span>
                  </div>
                </div>
                <div className="flex items-center text-amber-400 text-xs font-bold">
                  <Star className="w-3 h-3 fill-current mr-1" /> 4.9
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Over 25,000+ consultations scheduled</span>
          </div>
        </div>

        {/* Right Form Column: Flex-1 */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          {/* Top Unified Mode Switcher Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-3 gap-1 mb-6">
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-semibold text-xs bg-white text-slate-900 shadow-xs transition-all text-center"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Sign In</span>
            </Link>

            <Link
              href="/register/professional"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-semibold text-xs text-slate-600 hover:text-slate-900 transition-all text-center"
            >
              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Practice Sign-Up</span>
            </Link>

            <Link
              href="/register/user"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-semibold text-xs text-slate-600 hover:text-slate-900 transition-all text-center"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Customer Sign-Up</span>
            </Link>
          </div>

          {/* Form Content */}
          <div className="space-y-4 my-auto">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Sign In to Your Workspace
              </h2>
              <p className="text-xs text-slate-500">
                Access your appointment calendar, live consultations, and patient records.
              </p>
            </div>

            {/* 1-Tap Quick Demo Logins */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>1-Tap Instant Demo Logins</span>
                </div>
                <span className="text-[10px] text-slate-400">Quick Test</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {demoAccounts.map((account) => {
                  const Icon = account.icon;
                  const isLogging = loading && autoLoggingRole === account.roleKey;

                  return (
                    <button
                      key={account.roleKey}
                      type="button"
                      onClick={() => handleQuickDemo(account.email, account.pass, account.roleKey)}
                      disabled={loading}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                          <Icon className="w-3 h-3" />
                        </div>
                        <span className={`text-[8px] font-bold px-1 py-0.2 rounded border ${account.badgeClass}`}>
                          {account.badge}
                        </span>
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold text-slate-800 truncate">{account.title}</div>
                        <div className="text-[9px] text-slate-400 truncate">{isLogging ? 'Signing in...' : 'Click to Login'}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                loading={loading && !autoLoggingRole}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-indigo-100 transition-all"
              >
                Sign In to Account
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </div>

          {/* Footer Notice */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 flex items-center justify-between">
            <span>New to BookSaathi?</span>
            <div className="flex items-center gap-2">
              <Link href="/register/professional" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Join as Doctor/CA
              </Link>
              <span>•</span>
              <Link href="/register/user" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Join as Client
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
