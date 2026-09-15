'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Share2,
  Copy,
  Check,
  Clock,
  Briefcase,
  CheckCircle2,
  XCircle,
  Calculator,
  Scale,
  Stethoscope,
  GraduationCap,
  Scissors,
  Dumbbell,
  Compass,
  Laptop,
  Layers,
  RefreshCw,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { professionalService } from '@/services/professional.service';
import { availabilityService } from '@/services/availability.service';
import { bookingLinkService } from '@/services/public.service';
import { getProfessionalPublicUrl, getProfessionalDisplayUrl } from '@/lib/urlHelpers';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const ONBOARDING_PROFESSIONS = [
  { name: 'Doctor / Clinic', icon: Stethoscope, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { name: 'CA / Tax Consultant', icon: Calculator, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { name: 'Lawyer / Advocate', icon: Scale, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { name: 'Tutor / Educator', icon: GraduationCap, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { name: 'Consultant / Advisor', icon: Briefcase, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { name: 'Salon / Beauty Pro', icon: Scissors, color: 'text-pink-600 bg-pink-50 border-pink-200' },
  { name: 'Fitness Coach', icon: Dumbbell, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { name: 'Freelancer / Other', icon: Laptop, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('Doctor / Clinic');
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState('idle'); // idle | checking | available | taken | invalid
  const [slugMessage, setSlugMessage] = useState('');

  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [workingDays, setWorkingDays] = useState({
    1: true, // Mon
    2: true, // Tue
    3: true, // Wed
    4: true, // Thu
    5: true, // Fri
    6: true, // Sat
    0: false, // Sun
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setSlug(profile.bookingSlug || '');
      if (profile.profession) {
        const matched = ONBOARDING_PROFESSIONS.find((p) =>
          p.name.toLowerCase().includes(profile.profession.toLowerCase())
        );
        if (matched) setProfession(matched.name);
      }
    }
  }, [profile]);

  // Feature 3: Live slug availability check (debounced ~400ms)
  useEffect(() => {
    if (!slug || slug.trim().length < 3) {
      setSlugStatus('idle');
      setSlugMessage('');
      return;
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (cleanSlug !== slug) {
      setSlug(cleanSlug);
    }

    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await bookingLinkService.checkSlug(cleanSlug);
        if (res.data?.isAvailable) {
          setSlugStatus('available');
          setSlugMessage('Available!');
        } else {
          setSlugStatus('taken');
          setSlugMessage(res.data?.message || 'Already taken');
        }
      } catch (err) {
        setSlugStatus('invalid');
        setSlugMessage(err.response?.data?.message || 'Invalid slug format');
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [slug]);

  const toggleDay = (dayIndex) => {
    setWorkingDays((prev) => ({
      ...prev,
      [dayIndex]: !prev[dayIndex],
    }));
  };

  const handleStep1 = async (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (slugStatus === 'taken' || slugStatus === 'invalid') {
      toast.error('Please select an available booking link username');
      return;
    }

    setLoading(true);
    try {
      await professionalService.updateProfile({
        name: name.trim(),
        profession,
        consultationFee: 500, // Sane default
      });

      if (slug && slug !== profile?.bookingSlug && slugStatus === 'available') {
        await bookingLinkService.updateSlug(slug);
      }

      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const weeklySchedule = [0, 1, 2, 3, 4, 5, 6].map((dayNum) => ({
        dayOfWeek: dayNum,
        enabled: !!workingDays[dayNum],
        timeRanges: workingDays[dayNum] ? [{ startTime, endTime }] : [],
      }));

      await availabilityService.updateWeeklyAvailability(weeklySchedule);
      await refreshProfile();
      setStep(3);
      toast.success('Your booking link is ready!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save working hours');
    } finally {
      setLoading(false);
    }
  };

  const bookingSlug = slug || profile?.bookingSlug || 'my-practice';
  const bookingUrl = getProfessionalPublicUrl(bookingSlug);
  const displayUrl = getProfessionalDisplayUrl(bookingSlug);

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    toast.success('Booking link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hello! You can now book appointments directly with me here:\n${bookingUrl}`
  )}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/30 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Book<span className="text-indigo-600">Saathi</span>
          </span>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80">
          {/* Progress Indicators (2 steps) */}
          {step < 3 && (
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= 1
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-50'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Step 1</p>
                  <p className="text-sm font-bold text-slate-900">Your Identity</p>
                </div>
              </div>

              <div className="w-12 h-0.5 bg-slate-200">
                <div
                  className={`h-full bg-indigo-600 transition-all ${
                    step >= 2 ? 'w-full' : 'w-0'
                  }`}
                />
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= 2
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-50'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  2
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Step 2</p>
                  <p className="text-sm font-bold text-slate-900">Working Hours</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Name + Profession + Live Slug Check */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-900">Welcome! Let's get you set up in 60 seconds</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Tell your clients who you are and choose your personal link.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name or Practice / Business Name *
                </label>
                <Input
                  placeholder="e.g. Adv. Priya Patel, Dr. Rajesh Sharma, CA Amit Verma"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug && e.target.value) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
                    }
                  }}
                  className="h-12 text-base font-medium rounded-xl"
                  required
                />
              </div>

              {/* Feature 3: Live slug availability check */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Your Booking Link Handle
                  </label>
                  {slugStatus === 'checking' && (
                    <span className="text-[11px] font-semibold text-slate-400 inline-flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Checking...
                    </span>
                  )}
                  {slugStatus === 'available' && (
                    <span className="text-[11px] font-bold text-emerald-600 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {slugMessage}
                    </span>
                  )}
                  {(slugStatus === 'taken' || slugStatus === 'invalid') && (
                    <span className="text-[11px] font-bold text-rose-600 inline-flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" /> {slugMessage}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <span className="text-xs font-bold text-slate-400 absolute left-3.5 top-3.5 select-none">
                    booksaathi.in/
                  </span>
                  <input
                    type="text"
                    placeholder="priya-patel"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full pl-28 pr-10 h-12 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                  <div className="absolute right-3.5 top-3.5">
                    {slugStatus === 'available' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    {(slugStatus === 'taken' || slugStatus === 'invalid') && <XCircle className="w-5 h-5 text-rose-500" />}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Select Your Profession
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {ONBOARDING_PROFESSIONS.map((p) => {
                    const Icon = p.icon;
                    const isSelected = profession === p.name;
                    return (
                      <button
                        type="button"
                        key={p.name}
                        onClick={() => setProfession(p.name)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 ring-2 ring-indigo-600/20 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg border shrink-0 ${p.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-base shadow-lg shadow-indigo-200"
              >
                Continue to Working Hours <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          )}

          {/* STEP 2: Working Hours */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">When are you available for clients?</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Pick your daily working hours. You can change this anytime from settings.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Opening Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Closing Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Active Working Days
                </label>
                <div className="flex gap-1.5 justify-between">
                  {[
                    { id: 1, label: 'Mon' },
                    { id: 2, label: 'Tue' },
                    { id: 3, label: 'Wed' },
                    { id: 4, label: 'Thu' },
                    { id: 5, label: 'Fri' },
                    { id: 6, label: 'Sat' },
                    { id: 0, label: 'Sun' },
                  ].map((d) => {
                    const active = workingDays[d.id];
                    return (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => toggleDay(d.id)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          active
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-800 font-medium">
                  Default 30-min booking slots with 10-min rest buffers have been auto-configured for you!
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-12 rounded-xl px-4 border-slate-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-base shadow-lg shadow-indigo-200"
                >
                  Complete Setup & Get Booking Link
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Done / Ready Screen */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900">You are ready to accept appointments!</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Share your personal link on WhatsApp or put it on your social bios.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-left">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Booking Link</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={displayUrl}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-indigo-700 select-all"
                  />
                  <Button
                    onClick={copyLink}
                    variant="outline"
                    className="h-10 px-4 rounded-xl border-slate-200 hover:border-slate-300 font-bold text-xs"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span className="ml-1.5">{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Share on WhatsApp
                </a>

                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm"
                >
                  Go to Today's Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
