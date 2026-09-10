'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  MapPin,
  Briefcase,
  UserCheck,
  ShieldCheck,
  Search,
  Clock,
  Receipt,
  Eye,
  EyeOff,
  CheckCircle2,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Delhi',
  'Gujarat',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
  'Other State / UT',
];

export default function UserRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    state: 'Odisha',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please provide your 10-digit mobile number.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: 'USER',
        city: formData.city.trim(),
        state: formData.state,
      };

      await register(payload);
      toast.success('Customer account created successfully');

      const redirectParam = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect')
        : null;

      if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
        router.push(redirectParam);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to create account. Please verify your details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[660px]">
        {/* Left Column: Fixed Width 420px Visual Showcase */}
        <div className="w-full lg:w-[420px] shrink-0 relative p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white overflow-hidden">
          {/* Background Photography */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <img
              src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1000&auto=format&fit=crop&q=80"
              alt="Patient Consultation"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Top Brand Info */}
          <div className="relative z-10 space-y-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Book<span className="text-emerald-400">Saathi</span>
              </span>
            </Link>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-semibold mt-1">
              <UserCheck className="w-3 h-3" />
              <span>Customer & Patient Portal</span>
            </div>
            <p className="text-xs text-slate-300 font-medium pt-1">
              Book consultations with verified doctors, CAs, and experts across India.
            </p>
          </div>

          {/* Center: Animated Floating SaaS Badges */}
          <div className="relative z-10 py-6 space-y-3.5 my-auto hidden sm:block">
            {/* Floating Card 1 */}
            <div className="animate-float-slow bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-xl max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">100% Verified Practitioners</h4>
                  <p className="text-[10px] text-slate-300">Doctors, Lawyers & Tax Advisors</p>
                </div>
              </div>
            </div>

            {/* Floating Card 2 */}
            <div className="animate-float-reverse ml-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-xl max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Live Status & Token Tracker</h4>
                  <p className="text-[10px] text-slate-300">SMS & Email queue alerts</p>
                </div>
              </div>
            </div>

            {/* Floating Card 3 */}
            <div className="animate-pulse-soft bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-xl max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Itemized Invoices</h4>
                  <p className="text-[10px] text-slate-300">Download printable slips instantly</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Protected Consultation Guarantee</span>
          </div>
        </div>

        {/* Right Form Column: Flex-1 */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          {/* Top Unified Mode Switcher Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-3 gap-1 mb-5">
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-semibold text-xs text-slate-600 hover:text-slate-900 transition-all text-center"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-semibold text-xs bg-white text-slate-900 shadow-xs transition-all text-center"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Customer Sign-Up</span>
            </Link>
          </div>

          {/* Form Content */}
          <div className="space-y-3.5 my-auto">
            <div className="space-y-0.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Create Customer Account
              </h2>
              <p className="text-xs text-slate-500">
                For Patients and Clients to book consultations with verified experts.
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    name="name"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              {/* Mobile & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="text-xs font-bold text-slate-400 absolute left-3.5 top-2.5">+91</span>
                    <input
                      name="phone"
                      required
                      placeholder="98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">City</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    <input
                      name="city"
                      placeholder="e.g. Bhubaneswar, Mumbai"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* State & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="rahul.client@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-1.5">
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-emerald-100 transition-all"
                >
                  Create Customer Account
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </form>
          </div>

          {/* Footer Notice */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500 flex items-center justify-between">
            <span>Are you a Doctor or CA?</span>
            <Link href="/register/professional" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Practice Sign-Up →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
