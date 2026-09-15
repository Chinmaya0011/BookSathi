'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  User,
  Stethoscope,
  Briefcase,
  ShieldCheck,
  Sparkles,
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

  const demoAccounts = [
    {
      role: 'Customer / Client',
      name: 'Rahul Sharma',
      email: 'rahul.user@booksaathi.in',
      password: 'User@12345',
      icon: User,
      color: 'from-blue-600 to-indigo-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      role: 'Doctor (Pro)',
      name: 'Dr. Rajesh Sharma',
      email: 'dr.rajesh@booksaathi.in',
      password: 'Password123',
      icon: Stethoscope,
      color: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      role: 'CA (Pro)',
      name: 'CA Priya Agarwal',
      email: 'priya.ca@booksaathi.in',
      password: 'Password123',
      icon: Briefcase,
      color: 'from-amber-600 to-orange-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      role: 'Super Admin',
      name: 'Command Center',
      email: 'admin@booksaathi.in',
      password: 'Admin@12345',
      icon: ShieldCheck,
      color: 'from-purple-600 to-indigo-700',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];

  const performLogin = async (loginEmail, loginPassword) => {
    setError('');
    setLoading(true);

    try {
      const data = await login(loginEmail, loginPassword);
      toast.success('Signed in successfully');

      const redirectParam = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect')
        : null;

      if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//') && redirectParam !== '/') {
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
    }
  };

  const handleQuickLogin = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
    performLogin(demo.email, demo.password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Book<span className="text-indigo-600">Saathi</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Sign in to manage your appointments and schedule
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm border border-slate-200/80 rounded-2xl">
          {/* One-Tap Demo Accounts Section */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-slate-50 to-sky-50/60 border border-indigo-100/90 shadow-2xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>One-Tap Demo Login</span>
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                Instant Access
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((demo, idx) => {
                const IconComponent = demo.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickLogin(demo)}
                    className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-indigo-300 text-left transition-all hover:shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div
                        className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${demo.color} text-white flex items-center justify-center shadow-2xs`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${demo.badgeBg}`}
                      >
                        {demo.role.split(' ')[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                        {demo.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {demo.email.split('@')[0]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              or enter credentials
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* Footer Divider & Links */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Don't have an account? </span>
            <Link
              href="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
