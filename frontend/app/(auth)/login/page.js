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

// Official Multi-Color Google SVG Icon Component
function GoogleIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    {
      role: 'Doctor',
      name: 'Dr. Rajesh Sharma',
      email: 'dr.rajesh@booksaathi.in',
      password: 'Password123',
      icon: Stethoscope,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    },
    {
      role: 'CA',
      name: 'CA Priya Agarwal',
      email: 'priya.ca@booksaathi.in',
      password: 'Password123',
      icon: Briefcase,
      color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    },
    {
      role: 'Client',
      name: 'Rahul Sharma',
      email: 'rahul.user@booksaathi.in',
      password: 'User@12345',
      icon: User,
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    },
    {
      role: 'Admin',
      name: 'Command Center',
      email: 'admin@booksaathi.in',
      password: 'Admin@12345',
      icon: ShieldCheck,
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:bg-indigo-700 transition-colors">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Book<span className="text-indigo-600">Saathi</span>
          </span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Sign in to manage your appointments, queue, and schedule
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-5 sm:px-8 shadow-sm border border-slate-200/80 rounded-2xl">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
              </label>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center my-4">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              or continue with
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Single "Continue with Google" Button at Bottom */}
          <div>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                handleQuickLogin(demoAccounts[0]); // Doctor
                toast.success('Signed in with Google Demo');
              }}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 active:scale-98 border border-slate-200/90 text-slate-700 font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer group disabled:opacity-50"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Compact 1-Tap Demo Access Toolbar */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Quick Demo Logins
              </span>
              <span className="text-[10px] text-slate-400 font-medium">1-click test</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {demoAccounts.map((demo, idx) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickLogin(demo)}
                    className={`flex items-center gap-1.5 p-1.5 sm:p-2 rounded-xl border text-left transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${demo.color}`}
                    title={`Login as ${demo.name} (${demo.role})`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold truncate leading-tight">{demo.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Don't have an account? </span>
            <Link
              href="/register"
              className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

