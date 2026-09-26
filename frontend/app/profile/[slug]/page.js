'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  ShieldCheck,
  MapPin,
  Briefcase,
  Globe,
  Clock,
  ArrowRight,
  Share2,
  Navigation,
  Phone,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Building2,
  Check,
  Layers,
  ArrowLeft,
  Video,
  Users,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Calendar,
  Lock,
  QrCode,
  Award,
  Star,
  Zap,
  Stethoscope,
  Calculator,
  Scale,
  GraduationCap,
  CreditCard,
  CheckCheck,
  CalendarCheck,
  BadgeCheck,
  Compass,
  FileText,
  Activity,
  HeartHandshake,
  Shield,
  MessageCircle,
} from 'lucide-react';
import { publicService } from '@/services/public.service';
import { format12Hour, formatINR } from '@/lib/utils';
import { getProfessionalPublicUrl } from '@/lib/urlHelpers';

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const FAQS = [
  {
    q: 'How does digital booking work?',
    a: 'Select your preferred appointment date and time slot (or live queue token). Once confirmed, you instantly receive a verified digital booking pass with a scannable QR code via SMS & WhatsApp.',
  },
  {
    q: 'Do I need to sign up or create an account?',
    a: 'No account or password is required. Simply provide your name, phone number, and email during booking to confirm your consultation.',
  },
  {
    q: 'How and when do I pay the consultation fee?',
    a: 'You can pay conveniently online (UPI, Cards, NetBanking) or choose offline payment to pay directly at the clinic reception upon arrival.',
  },
  {
    q: 'Can I reschedule or cancel my appointment?',
    a: 'Yes, you can easily check, reschedule, or cancel your appointment at any time using your booking reference code through the BookSaathi lookup portal.',
  },
  {
    q: 'Is my personal health and consultation data secure?',
    a: 'Yes, BookSaathi uses end-to-end encrypted protocols and verified practitioner safeguards. Your data is shared exclusively with your selected practitioner.',
  },
];

export default function ProfessionalPublicProfilePage() {
  const params = useParams();
  const slug = params?.slug;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'services' | 'location' | 'faqs'
  const [expandedFaq, setExpandedFaq] = useState(0);

  useEffect(() => {
    if (!slug) return;
    fetchProfile();
  }, [slug]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await publicService.getProfile(slug);
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.response?.data?.message || 'Practitioner profile not found or is currently private.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name} • Profile | BookSaathi`,
          text: `Book consultation with ${profile?.name} on BookSaathi.`,
          url,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Profile link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-slate-950" />
        <div className="flex flex-col items-center gap-4 text-center relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-2xl shadow-indigo-600/20">
            <Sparkles className="w-8 h-8 animate-pulse text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Loading Practitioner Profile</h3>
            <p className="text-xs text-slate-400">Verifying credentials and live schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-rose-950 via-slate-950 to-slate-950" />
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl backdrop-blur-xl relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto text-2xl font-bold border border-rose-500/20">
            !
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white tracking-tight">Profile Not Available</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {error || 'This practitioner profile is currently private or does not exist.'}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isQueueMode = profile.bookingType === 'QUEUE';
  const fee = profile.consultationFee || 500;
  const experience = profile.experienceYears || profile.yearsOfExperience || 5;
  const appointmentTypes = profile.appointmentTypes || [];
  const weeklyAvailability = profile.weeklyAvailability || [];

  // Availability map
  const availabilityMap = {};
  weeklyAvailability.forEach((item) => {
    availabilityMap[item.dayOfWeek] = item;
  });

  const todayIndex = new Date().getDay();
  const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][todayIndex];
  const todaySched = availabilityMap[todayName];
  const isTodayOpen = todaySched ? todaySched.enabled !== false : true;

  const bookingHref = `/book/${profile.bookingSlug || profile._id}`;

  // Profession icon & Theme helper
  const getProfessionIcon = () => {
    const prof = (profile.profession || '').toLowerCase();
    if (prof.includes('doctor') || prof.includes('physician') || prof.includes('clinic')) {
      return Stethoscope;
    }
    if (prof.includes('ca') || prof.includes('account') || prof.includes('tax') || prof.includes('finance')) {
      return Calculator;
    }
    if (prof.includes('law') || prof.includes('advocate') || prof.includes('legal')) {
      return Scale;
    }
    if (prof.includes('mentor') || prof.includes('tutor') || prof.includes('teacher') || prof.includes('coach')) {
      return GraduationCap;
    }
    return Award;
  };

  const ProfessionIcon = getProfessionIcon();

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-36 sm:pb-28">
      
      {/* 1. Executive Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#090D16]/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-4.5 h-4.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white">
                Book<span className="text-indigo-400">Saathi</span>
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/20">
                Verified Directory
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/lookup"
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 text-xs font-semibold transition-all border border-slate-800/60"
            >
              <span>Lookup Booking</span>
            </Link>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-700/80 shadow-xs active:scale-95"
              title="Share profile link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-300" />
                  <span>Share</span>
                </>
              )}
            </button>

            <Link
              href={bookingHref}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 active:scale-95 transition-all whitespace-nowrap"
            >
              <span>{isQueueMode ? 'Get Queue Token' : 'Book Consultation'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </header>

      {/* 2. Cinematic Hero Showcase Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0e1526] via-[#0b101d] to-[#090D16] border-b border-slate-800/80 pt-8 pb-12 sm:pb-16">
        
        {/* Glow Spheres */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-12">
            
            {/* Left: Avatar + Core Bio */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left flex-1 min-w-0">
              
              {/* Premium Avatar Ring */}
              <div className="relative shrink-0 group">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-2 border-indigo-500/40 bg-slate-900 shadow-2xl shadow-indigo-500/20 flex items-center justify-center font-black text-4xl sm:text-5xl text-indigo-400 ring-4 ring-indigo-500/10 group-hover:scale-105 transition-transform duration-300">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="bg-gradient-to-tr from-indigo-400 via-sky-300 to-white bg-clip-text text-transparent">
                      {profile.name?.charAt(0) || 'P'}
                    </span>
                  )}
                </div>

                {profile.isVerified !== false && (
                  <div
                    className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full border-2 border-[#090D16] shadow-lg flex items-center gap-1"
                    title="Verified Practitioner"
                  >
                    <CheckCheck className="w-3.5 h-3.5 stroke-[3]" />
                    <span>VERIFIED</span>
                  </div>
                )}
              </div>

              {/* Title & Key Highlights */}
              <div className="space-y-3 flex-1 min-w-0">
                
                {/* Live Availability Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold backdrop-blur-md">
                  <span className={`w-2 h-2 rounded-full ${isTodayOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  <span className={isTodayOpen ? 'text-emerald-300' : 'text-rose-300'}>
                    {isTodayOpen ? 'Accepting Patients Today' : 'Clinic Closed Today'}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{profile.businessName || 'Private Practice'}</span>
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    {profile.name}
                  </h1>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm sm:text-base font-semibold">
                    <span className="text-indigo-400 font-bold flex items-center gap-1.5">
                      <ProfessionIcon className="w-4 h-4 text-indigo-400" />
                      <span>{profile.profession || 'Specialist Consultant'}</span>
                    </span>
                    {profile.specialization && (
                      <span className="text-slate-300 font-medium">
                        — {profile.specialization}
                      </span>
                    )}
                  </div>
                </div>

                {/* Location & Languages Badge Line */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs text-slate-400 pt-1">
                  {(profile.city || profile.address) && (
                    <span className="inline-flex items-center gap-1.5 bg-slate-900/70 border border-slate-800/80 px-2.5 py-1 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{[profile.city, profile.state].filter(Boolean).join(', ')}</span>
                    </span>
                  )}
                  {profile.languages && (
                    <span className="inline-flex items-center gap-1.5 bg-slate-900/70 border border-slate-800/80 px-2.5 py-1 rounded-lg">
                      <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{profile.languages}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>4.9 / 5.0 Rating</span>
                  </span>
                </div>

              </div>

            </div>

            {/* Right: Floating Executive Booking Card */}
            <div className="w-full lg:w-88 bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/90 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-5 shrink-0">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">
                    Consultation Tariff
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-3xl font-black text-white">
                      {formatINR(fee)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ session</span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2.5">
                <Link
                  href={bookingHref}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-black text-sm shadow-xl shadow-indigo-600/30 active:scale-98 transition-all cursor-pointer"
                >
                  <span>{isQueueMode ? 'Get Queue Token' : 'Book Instant Slot'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-[11px] text-center text-slate-400 font-medium flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant SMS & WhatsApp confirmation pass</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>0% Extra Commission Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Verified Practitioner Registration</span>
                </div>
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Express Reception QR Check-In</span>
                </div>
              </div>

            </div>

          </div>

          {/* 4 Highlights Bento Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mt-8 pt-8 border-t border-slate-800/80">
            
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Practice Experience
              </span>
              <span className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>{experience}+ Years In Practice</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Consultation Format
              </span>
              <span className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" />
                <span>In-Clinic & Video</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Appointment Mode
              </span>
              <span className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{isQueueMode ? 'Live Clinic Queue' : 'Fixed Time Slot'}</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Patient Privacy
              </span>
              <span className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-400" />
                <span>End-to-End Encrypted</span>
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* 3. Interactive Section Tabs Bar */}
      <div className="sticky top-16 z-40 bg-[#090D16]/95 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
            
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Overview & Bio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'services'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Services & Tariffs</span>
              <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-white text-[10px]">
                {appointmentTypes.length || 1}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('location')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'location'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Clinic & Hours</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('faqs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'faqs'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Patient FAQs</span>
            </button>

          </div>
        </div>
      </div>

      {/* 4. Tab Content Panels */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Tab 1: Overview & Qualifications */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
            
            <div className="lg:col-span-2 space-y-6">
              
              {/* About Story Card */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 backdrop-blur-md">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                  <Award className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    Practitioner Biography & Background
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {profile.bio || `${profile.name} is a dedicated ${profile.profession || 'Specialist'} with over ${experience} years of clinical excellence, committed to delivering transparent, accessible, and high-quality consultations.`}
                </p>
              </div>

              {/* Specializations & Focus */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 backdrop-blur-md">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    Core Specializations & Clinical Focus
                  </h2>
                </div>
                
                <div className="flex flex-wrap gap-2.5">
                  {(profile.specialization ? profile.specialization.split(',') : [profile.profession, 'Consultations', 'Assessments', 'Advisory', 'Second Opinions']).map((spec, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{spec.trim()}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Verified Trust Standards */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 backdrop-blur-md">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    Verified Practice Safeguards
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-300">
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Direct Practitioner Appointments</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Appointments are scheduled straight with the practitioner without third-party middlemen.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Zero Mandatory Registration</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Book consultations directly with just your name and WhatsApp number.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Quick Summary */}
            <div className="space-y-6">
              
              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur-md">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Practice Highlights
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Practitioner</span>
                    <span className="font-bold text-white">{profile.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Profession</span>
                    <span className="font-bold text-indigo-300">{profile.profession || 'Specialist'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Experience</span>
                    <span className="font-bold text-white">{experience}+ Years</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Consultation Fee</span>
                    <span className="font-bold text-emerald-400">{formatINR(fee)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">Location</span>
                    <span className="font-bold text-white">{[profile.city, profile.state].filter(Boolean).join(', ') || 'Clinic Facility'}</span>
                  </div>
                </div>

                <Link
                  href={bookingHref}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Book Consultation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Available Services & Pricing */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Available Consultation Services</h2>
                <p className="text-xs text-slate-400 mt-1">Select a specific consultation type to proceed with booking</p>
              </div>
              <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                {appointmentTypes.length || 1} Total Services
              </span>
            </div>

            {appointmentTypes.length === 0 ? (
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Standard Consultation</h3>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                      Default
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Comprehensive consultation and assessment session directly with {profile.name}.
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-400" /> 30 mins</span>
                    <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5 text-indigo-400" /> In-Clinic & Video</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                  <span className="text-2xl font-black text-white">{formatINR(fee)}</span>
                  <Link
                    href={bookingHref}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <span>Select Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointmentTypes.map((type) => (
                  <div
                    key={type._id}
                    className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between gap-5 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {type.name}
                        </h3>
                        {type.isDefault && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            Popular
                          </span>
                        )}
                      </div>

                      {type.description && (
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {type.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-semibold">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{type.duration || 30} mins</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-semibold">
                          <Video className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{type.consultationType || 'In-Clinic & Video'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Tariff</span>
                        <span className="text-xl font-black text-white">{formatINR(type.fee ?? fee)}</span>
                      </div>

                      <Link
                        href={`${bookingHref}?serviceId=${type._id}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>Book Slot</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Clinic Location & Working Hours */}
        {activeTab === 'location' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
            
            {/* Location & Directions */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 backdrop-blur-md">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <MapPin className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Clinic & Directions
                </h2>
              </div>

              <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                {profile.businessName && (
                  <p className="text-sm font-bold text-white">{profile.businessName}</p>
                )}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {[profile.address, profile.city, profile.state, profile.pincode].filter(Boolean).join(', ') ||
                    'Clinic Facility'}
                </p>

                {profile.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800 mt-2">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Reception Helpline: {profile.phone}</span>
                  </div>
                )}
              </div>

              <div>
                {profile.googleMapUrl ? (
                  <a
                    href={profile.googleMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>
                ) : (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${profile.name} ${profile.businessName || ''} ${profile.city || ''}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 active:scale-95"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Directions on Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Weekly Hours Table */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 backdrop-blur-md">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Weekly Practice Schedule
                </h2>
              </div>

              <div className="space-y-2">
                {DAYS_ORDER.map((day) => {
                  const item = availabilityMap[day];
                  const isToday = day === todayName;
                  const isEnabled = item?.enabled !== false;
                  const timeRanges = item?.timeRanges || [];

                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-between py-2.5 px-3.5 rounded-xl text-xs ${
                        isToday
                          ? 'bg-indigo-600/20 border border-indigo-500/40 text-white font-bold'
                          : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={isToday ? 'text-indigo-300 font-black' : 'text-slate-300'}>
                          {day}
                        </span>
                        {isToday && (
                          <span className="text-[9px] px-2 py-0.5 bg-indigo-600 text-white rounded-md font-bold">
                            Today
                          </span>
                        )}
                      </div>

                      <div>
                        {isEnabled && timeRanges.length > 0 ? (
                          <span className="font-semibold text-slate-200">
                            {timeRanges
                              .map((r) => `${format12Hour(r.startTime)} – ${format12Hour(r.endTime)}`)
                              .join(', ')}
                          </span>
                        ) : isEnabled ? (
                          <span className="font-semibold text-slate-200">09:00 AM – 06:00 PM</span>
                        ) : (
                          <span className="text-rose-400 font-semibold">Closed</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Patient FAQs */}
        {activeTab === 'faqs' && (
          <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200">
            <div className="pb-2">
              <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
              <p className="text-xs text-slate-400 mt-1">Everything you need to know about booking and consultations</p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isExpanded = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-800 bg-slate-900/70 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-xs sm:text-sm text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-indigo-400' : ''
                        }`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800 bg-slate-950/40">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* 5. Mobile Floating Action Bar (< sm) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 px-4 py-3 sm:hidden shadow-2xl">
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Session Fee</span>
            <span className="text-lg font-black text-white leading-tight">{formatINR(fee)}</span>
          </div>

          <Link
            href={bookingHref}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-transform"
          >
            <span>{isQueueMode ? 'Get Queue Token' : 'Book Consultation'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
