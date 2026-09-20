'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Settings,
  User,
  Briefcase,
  Clock,
  Sparkles,
  Shield,
  CreditCard,
  QrCode,
  CheckCircle2,
  Calendar,
  Building,
  MapPin,
  Save,
  Sliders,
  Stethoscope,
  Scale,
  Calculator,
  GraduationCap,
  Scissors,
  Activity,
  IndianRupee,
  Info,
  ArrowRight,
  Zap,
  ExternalLink,
  Copy,
  Check,
  Palmtree,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { professionalService } from '@/services/professional.service';
import { getProfessionalPublicUrl } from '@/lib/urlHelpers';
import { formatINR } from '@/lib/utils';
import ProUpgradeModal from '@/components/dashboard/ProUpgradeModal';
import LoginActivityCard from '@/components/dashboard/LoginActivityCard';

const TABS = [
  { id: 'profile', label: 'Business Profile', icon: User, desc: 'Name, profession & clinic info' },
  { id: 'modules', label: 'Practice Modules', icon: Zap, desc: 'Quick access to all practice tools' },
  { id: 'account', label: 'Account & Plan', icon: Shield, desc: 'Password & Pro subscription' },
];

const PROFESSIONS = [
  { id: 'DOCTOR', label: 'Doctor / Clinic', icon: Stethoscope },
  { id: 'CA', label: 'Chartered Accountant (CA)', icon: Calculator },
  { id: 'LAWYER', label: 'Advocate / Lawyer', icon: Scale },
  { id: 'CONSULTANT', label: 'Consultant / Advisor', icon: Briefcase },
  { id: 'TUTOR', label: 'Tutor / Teacher', icon: GraduationCap },
  { id: 'SALON', label: 'Salon / Beauty Spa', icon: Scissors },
  { id: 'COACH_TRAINER', label: 'Fitness / Yoga Coach', icon: Activity },
  { id: 'OTHER', label: 'Other Professional', icon: Building },
];

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams ? searchParams.get('tab') : null;
  const [activeTab, setActiveTab] = useState('profile');
  const { profile, user, refreshProfile } = useAuth();

  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    profession: 'DOCTOR',
    specialization: '',
    clinicName: '',
    address: '',
    city: '',
    bio: '',
    bookingSlug: '',
    consultationFee: 500,
    upiId: '',
  });

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Handle URL Redirections for extracted standalone pages
  useEffect(() => {
    if (!urlTab) return;

    if (urlTab === 'services') {
      router.replace('/dashboard/services');
      return;
    }
    if (urlTab === 'hours' || urlTab === 'availability') {
      router.replace('/dashboard/availability');
      return;
    }
    if (urlTab === 'booking-mode' || urlTab === 'settings') {
      router.replace('/dashboard/settings');
      return;
    }
    if (urlTab === 'booking') {
      router.replace('/dashboard/booking-link');
      return;
    }
    if (urlTab === 'blocked-dates') {
      router.replace('/dashboard/blocked-dates');
      return;
    }

    if (TABS.some((t) => t.id === urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab, router]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || user?.name || '',
        profession: profile.profession || 'DOCTOR',
        specialization: profile.specialization || '',
        clinicName: profile.clinicName || profile.businessName || '',
        address: profile.address?.street || profile.address || '',
        city: profile.address?.city || profile.city || '',
        bio: profile.bio || '',
        bookingSlug: profile.bookingSlug || '',
        consultationFee: profile.consultationFee || 500,
        upiId: profile.paymentSettings?.upiId || profile.upiId || '',
      });
    }
  }, [profile, user]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    router.push(`/dashboard/setup?tab=${tabId}`);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await professionalService.updateProfile({
        name: profileForm.name,
        profession: profileForm.profession,
        specialization: profileForm.specialization,
        clinicName: profileForm.clinicName,
        address: {
          street: profileForm.address,
          city: profileForm.city,
        },
        bio: profileForm.bio,
        bookingSlug: profileForm.bookingSlug,
        consultationFee: Number(profileForm.consultationFee),
        paymentSettings: {
          upiId: profileForm.upiId,
        },
      });

      await refreshProfile();
      toast.success('Practice profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setChangingPassword(true);
    try {
      await professionalService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const publicUrl = profile ? getProfessionalPublicUrl(profile) : '';

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success('Public booking URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Practice Profile & Setup
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your public business details, branding, and account preferences.
          </p>
        </div>

        {publicUrl && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Link' : 'Copy Booking Link'}</span>
            </button>

            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 shadow-2xs transition-colors"
            >
              <span>View Live Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Main Tabs Segmented Controller */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-2xl border border-slate-200 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-black/5 font-black'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BUSINESS PROFILE & PRACTICE INFO                                  */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6 animate-in fade-in duration-150 max-w-4xl">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">Professional & Practice Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your profession category and update details shown on your public booking page.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Profession Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Your Profession Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PROFESSIONS.map((prof) => {
                  const Icon = prof.icon;
                  const isSelected = profileForm.profession === prof.id;
                  return (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, profession: prof.id })}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/30 text-indigo-950 font-black shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white font-medium hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                      <span className="text-xs leading-tight">{prof.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Basic Info Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Specialization / Sub-Field
                </label>
                <input
                  type="text"
                  value={profileForm.specialization}
                  onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                  placeholder="e.g. Cardiologist, GST & Tax Advisor, Corporate Lawyer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Clinic / Business / Chamber Name
                </label>
                <input
                  type="text"
                  value={profileForm.clinicName}
                  onChange={(e) => setProfileForm({ ...profileForm, clinicName: e.target.value })}
                  placeholder="e.g. Sharma Health Clinic, Apex Legal Chamber"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Custom Booking Handle / Slug <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-600 bg-slate-50">
                  <span className="text-xs text-slate-400 font-mono px-3 select-none">/book/</span>
                  <input
                    type="text"
                    required
                    value={profileForm.bookingSlug}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        bookingSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                      })
                    }
                    placeholder="dr-rajesh-clinic"
                    className="flex-1 px-3 py-2.5 bg-white text-sm focus:outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Address & City */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Clinic / Chamber Physical Address
                </label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="e.g. Suite 402, Trade Tower, MG Road"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  placeholder="e.g. Mumbai, Bengaluru, Delhi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Bio & Professional Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                About & Professional Experience
              </label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Share your qualifications, years of experience, or consultation guidance..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
              />
            </div>

            {/* Fees & UPI Payment Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Default Consultation Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={profileForm.consultationFee}
                    onChange={(e) => setProfileForm({ ...profileForm, consultationFee: e.target.value })}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  You can also create multiple custom priced services in the Services Catalog.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  UPI ID for Direct Client Payments
                </label>
                <input
                  type="text"
                  value={profileForm.upiId}
                  onChange={(e) => setProfileForm({ ...profileForm, upiId: e.target.value })}
                  placeholder="e.g. doctor@upi or 9876543210@paytm"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Clients will receive this UPI ID on their booking slip for direct payments.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRACTICE MODULES & SYSTEM DIRECTORY                                */}
      {/* ========================================================================= */}
      {activeTab === 'modules' && (
        <div className="space-y-4 max-w-4xl animate-in fade-in duration-150">
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-sm border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-black">Modular Practice Command Center</h2>
            </div>
            <p className="text-xs text-indigo-200">
              Each core setting has its own dedicated full-screen page for fast configuration and deep control.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Availability & Shifts */}
            <Link
              href="/dashboard/availability"
              className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Working Hours & Availability
                </h3>
                <p className="text-xs text-slate-500">
                  Set weekly shift timings, morning/evening split hours, lunch breaks, and one-click schedule duplication.
                </p>
              </div>
              <div className="pt-4 flex items-center justify-between text-xs font-bold text-indigo-600">
                <span>Manage Shifts →</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100">
                  /dashboard/availability
                </span>
              </div>
            </Link>

            {/* 2. Services & Fees */}
            <Link
              href="/dashboard/services"
              className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Services & Fees Catalog
                </h3>
                <p className="text-xs text-slate-500">
                  Configure consultation types, follow-up visits, custom durations, and pricing with instant templates.
                </p>
              </div>
              <div className="pt-4 flex items-center justify-between text-xs font-bold text-emerald-600">
                <span>Configure Services →</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100">
                  /dashboard/services
                </span>
              </div>
            </Link>

            {/* 3. Booking Rules & Slot Gaps */}
            <Link
              href="/dashboard/settings"
              className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  Booking Rules & Slot Gaps
                </h3>
                <p className="text-xs text-slate-500">
                  Configure rest buffer times between appointments, minimum notice periods, and maximum advance booking limits.
                </p>
              </div>
              <div className="pt-4 flex items-center justify-between text-xs font-bold text-amber-600">
                <span>Edit Slot Rules →</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 border border-amber-100">
                  /dashboard/settings
                </span>
              </div>
            </Link>

            {/* 4. Holidays & Blocked Dates */}
            <Link
              href="/dashboard/blocked-dates"
              className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
                  <Palmtree className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                  Holidays & Blocked Leaves
                </h3>
                <p className="text-xs text-slate-500">
                  Block vacation dates, emergency off-days, and festival holidays to automatically close booking slots.
                </p>
              </div>
              <div className="pt-4 flex items-center justify-between text-xs font-bold text-rose-600">
                <span>Manage Leaves →</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 border border-rose-100">
                  /dashboard/blocked-dates
                </span>
              </div>
            </Link>

            {/* 5. My Link & QR Poster */}
            <Link
              href="/dashboard/booking-link"
              className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group sm:col-span-2"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 group-hover:scale-105 transition-transform">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                    My Public Booking Link & Printable Standee QR
                  </h3>
                  <p className="text-xs text-slate-500">
                    Share your custom URL on WhatsApp, print clinic desk standees, and download high-resolution QR posters.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center justify-between text-xs font-bold text-purple-600">
                <span>Get Standees & Posters →</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 border border-purple-100">
                  /dashboard/booking-link
                </span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACCOUNT, SECURITY & PLAN                                          */}
      {/* ========================================================================= */}
      {activeTab === 'account' && (
        <div className="space-y-6 max-w-4xl animate-in fade-in duration-150">
          {/* Subscription & Plan Status Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Plan</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {profile?.subscriptionTier || 'PRO PLAN'}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900">
                BookSaathi Professional Edition
              </h3>
              <p className="text-xs text-slate-500">
                Includes automated WhatsApp reminders, custom booking URL, QR standee generation, and queue management.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setUpgradeModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              View Plan Features
            </button>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Change Password</h3>
              <p className="text-xs text-slate-500">
                Update your account login password to keep your dashboard secure.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {changingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Active Logins & Security Audit */}
          <LoginActivityCard />
        </div>
      )}

      {/* Pro Upgrade Details Modal */}
      <ProUpgradeModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} />
    </div>
  );
}
