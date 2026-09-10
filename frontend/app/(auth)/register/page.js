'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Eye,
  EyeOff,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Search,
  Clock,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PROFESSIONS = [
  'Doctor',
  'CA',
  'Lawyer',
  'Consultant',
  'Therapist',
  'Tutor',
  'Trainer',
  'Nutritionist',
  'Coach',
  'Freelancer',
  'Other',
];

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

function RegisterGateway() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  const roleParam = searchParams.get('role');
  const [selectedRole, setSelectedRole] = useState(
    roleParam === 'user' || roleParam === 'customer' ? 'USER' : 'PROFESSIONAL'
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    profession: 'Doctor',
    specialization: '',
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
        role: selectedRole,
        ...(selectedRole === 'PROFESSIONAL'
          ? {
              profession: formData.profession,
              specialization: formData.specialization.trim(),
              city: formData.city.trim() || 'Bhubaneswar',
              state: formData.state,
            }
          : {
              city: formData.city.trim(),
              state: formData.state,
            }),
      };

      await register(payload);

      if (selectedRole === 'PROFESSIONAL') {
        toast.success('Professional account created successfully');
        router.push('/onboarding');
      } else {
        toast.success('Customer account created successfully');
        router.push('/dashboard');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to create account. Please ensure all details are valid.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isPro = selectedRole === 'PROFESSIONAL';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[660px]">
        {/* Left Column: Fixed Width 420px Visual Showcase */}
        <div className={cn(
          "w-full lg:w-[420px] shrink-0 relative p-6 sm:p-8 flex flex-col justify-between text-white overflow-hidden transition-colors duration-500",
          isPro
            ? "bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950"
            : "bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950"
        )}>
          {/* Background Photography */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <img
              src={
                isPro
                  ? "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000&auto=format&fit=crop&q=80"
                  : "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1000&auto=format&fit=crop&q=80"
              }
              alt="Consultation Showcase"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Top Brand Info */}
          <div className="relative z-10 space-y-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md",
                isPro ? "bg-indigo-600 shadow-indigo-500/30" : "bg-emerald-600 shadow-emerald-500/30"
              )}>
                <CalendarCheck className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Book<span className={isPro ? "text-indigo-400" : "text-emerald-400"}>Saathi</span>
              </span>
            </Link>
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold mt-1",
              isPro
                ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300"
                : "bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
            )}>
              {isPro ? <Briefcase className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
              <span>{isPro ? 'Practice Portal Desk' : 'Customer & Patient Portal'}</span>
            </div>
            <p className="text-xs text-slate-300 font-medium pt-1">
              {isPro
                ? 'Accept online client appointments, automate reminders & manage your practice desk.'
                : 'Book consultations with verified doctors, CAs, and experts across India.'}
            </p>
          </div>

          {/* Center: Animated Floating Badges */}
          <div className="relative z-10 py-6 space-y-3.5 my-auto hidden sm:block">
            {/* Floating Card 1 */}
            <div className="animate-float-slow bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-xl max-w-xs">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-xl border flex items-center justify-center shrink-0",
                  isPro
                    ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300"
                    : "bg-emerald-500/20 border-emerald-400/30 text-emerald-400"
                )}>
                  {isPro ? <Calendar className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {isPro ? 'Custom Booking Desk' : 'Verified Professionals'}
                  </h4>
                  <p className="text-[10px] text-slate-300">
                    {isPro ? '/book/your-practice-name' : 'Doctors, CAs & Lawyers'}
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Card 2 */}
            <div className="animate-float-reverse ml-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-xl max-w-xs">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-xl border flex items-center justify-center shrink-0",
                  isPro
                    ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-400"
                    : "bg-teal-500/20 border-teal-400/30 text-teal-400"
                )}>
                  {isPro ? <MessageSquare className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {isPro ? 'WhatsApp & SMS Alerts' : 'Live Status & Queue Alert'}
                  </h4>
                  <p className="text-[10px] text-slate-300">
                    {isPro ? 'Automated slot reminders' : 'Real-time token notifications'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Free Account Onboarding</span>
            </span>
            <Link
              href={isPro ? '/register/user' : '/register/professional'}
              className="text-xs text-slate-300 hover:text-white font-semibold"
            >
              {isPro ? 'Customer Sign-Up →' : 'Doctor / CA Sign-Up →'}
            </Link>
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

            <button
              type="button"
              onClick={() => setSelectedRole('PROFESSIONAL')}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-semibold text-xs transition-all text-center cursor-pointer",
                isPro
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Briefcase className={cn("w-3.5 h-3.5 shrink-0", isPro ? "text-indigo-600" : "text-slate-400")} />
              <span>Practice Sign-Up</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('USER')}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-semibold text-xs transition-all text-center cursor-pointer",
                !isPro
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <UserCheck className={cn("w-3.5 h-3.5 shrink-0", !isPro ? "text-emerald-600" : "text-slate-400")} />
              <span>Customer Sign-Up</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="space-y-3.5 my-auto">
            <div className="space-y-0.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {isPro ? 'Create Professional Practice' : 'Create Customer Account'}
              </h2>
              <p className="text-xs text-slate-500">
                {isPro
                  ? 'Accept online client appointments and automate reminders.'
                  : 'Book appointments with verified doctors and consultants.'}
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
                  {isPro ? 'Full Name & Title' : 'Full Name'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    name="name"
                    required
                    placeholder={isPro ? 'e.g. Dr. Rajesh Sharma or CA Priya Patel' : 'e.g. Rahul Sharma'}
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              {/* Professional Fields */}
              {isPro && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Profession <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    >
                      {PROFESSIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Specialization
                    </label>
                    <input
                      name="specialization"
                      placeholder="e.g. MBBS, MD or Tax Specialist"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    />
                  </div>
                </div>
              )}

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
                      className="w-full pl-11 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
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
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
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
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
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
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
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
                    className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
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
                  className={cn(
                    "w-full py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-sm transition-all",
                    isPro
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
                      : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                  )}
                >
                  {isPro ? 'Create Practice & Set Availability' : 'Create Customer Account'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </form>
          </div>

          {/* Links */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500 flex items-center justify-between">
            <Link
              href={isPro ? '/register/user' : '/register/professional'}
              className="text-slate-600 hover:text-slate-900"
            >
              {isPro ? 'Customer Sign-Up Page →' : 'Professional Practice Page →'}
            </Link>

            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterGateway />
    </Suspense>
  );
}
