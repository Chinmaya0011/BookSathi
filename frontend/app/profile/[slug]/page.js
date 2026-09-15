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
} from 'lucide-react';
import { publicService } from '@/services/public.service';
import { format12Hour, formatINR } from '@/lib/utils';

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const FAQS = [
  {
    q: 'How does digital booking work?',
    a: 'Select your preferred appointment date and time slot (or live queue token). Once confirmed, you will instantly receive a digital booking pass with a verified QR code via SMS & WhatsApp.',
  },
  {
    q: 'Do I need to sign up or create an account?',
    a: 'No account or password is required. Simply provide your name, phone number, and email during booking to confirm your consultation.',
  },
  {
    q: 'How and when do I pay the consultation fee?',
    a: 'You can pay conveniently online (UPI, Cards, NetBanking) or pay in cash/card at the clinic reception upon arrival.',
  },
  {
    q: 'Can I reschedule or cancel my appointment?',
    a: 'Yes, you can easily check, reschedule, or cancel your appointment at any time using your booking reference code through our patient portal.',
  },
];

export default function ProfessionalPublicProfilePage() {
  const params = useParams();
  const slug = params?.slug;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl">
            <div className="w-7 h-7 rounded-full border-2 border-indigo-400/20 border-t-indigo-400 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-slate-300">Loading practitioner profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto text-2xl font-bold border border-rose-500/20">
            !
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Profile Not Available</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {error || 'This practitioner profile is currently private or does not exist.'}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-600 selection:text-white pb-32 sm:pb-24">
      {/* Clean Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-slate-900 font-extrabold text-lg tracking-tight hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-indigo-500/20">
              BS
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">BookSaathi</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/lookup"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-all"
            >
              <span>Lookup Booking</span>
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-all cursor-pointer border border-slate-200/60 shadow-2xs"
              title="Share profile"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Share</span>
                </>
              )}
            </button>

            <Link
              href={bookingHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>{isQueueMode ? 'Join Queue' : 'Book Appointment'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-8 sm:space-y-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-indigo-600 transition-colors font-medium">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold truncate">{profile.name}</span>
        </div>

        {/* 1. Hero Identity Card with Generous Spacing */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-9 lg:p-10 shadow-sm space-y-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Avatar & Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-7">
              <div className="relative shrink-0">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border border-slate-200 shadow-sm"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-4xl sm:text-5xl shadow-md">
                    {profile.name?.charAt(0) || 'P'}
                  </div>
                )}

                {profile.isVerified !== false && (
                  <div
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xs"
                    title="Verified Practitioner"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </div>

              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {profile.name}
                  </h1>
                  {profile.isVerified !== false && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified Practitioner</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-semibold text-indigo-600">
                  <span className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold">
                    {profile.profession || 'Specialist Consultant'}
                  </span>
                  {profile.specialization && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-700 font-medium">{profile.specialization}</span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500 pt-1">
                  {(profile.businessName || profile.city) && (
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{[profile.businessName, profile.city, profile.state].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {profile.languages && (
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Languages: {profile.languages}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Action & Live Status */}
            <div className="w-full lg:w-auto flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <span
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                  isTodayOpen
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isTodayOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span>{isTodayOpen ? 'Available for Consultations' : 'Closed Today'}</span>
              </span>

              <Link
                href={bookingHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 cursor-pointer"
              >
                <span>{isQueueMode ? 'Get Queue Token' : 'Book Appointment'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 4 Stat Highlights with Rich Spacing */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-6 border-t border-slate-100">
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Consultation Fee
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 block">
                {formatINR(fee)}
              </span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Clinical Experience
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>{experience}+ Years In Practice</span>
              </span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Consultation Mode
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <Video className="w-4 h-4 text-indigo-600" />
                <span>In-Clinic & Video</span>
              </span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Booking Type
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>{isQueueMode ? 'Live Digital Queue' : 'Time Slot Booking'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
          {/* Left 2 Columns */}
          <div className="lg:col-span-2 space-y-8 sm:space-y-10">
            {/* About Practitioner */}
            {profile.bio && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-8 lg:p-9 shadow-sm space-y-4">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2.5">
                  <Award className="w-4.5 h-4.5 text-indigo-600" />
                  <span>About Practitioner</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Consultation Services */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-8 lg:p-9 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2.5">
                    <Layers className="w-4.5 h-4.5 text-indigo-600" />
                    <span>Available Services & Tariffs</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a service to book directly with {profile.name}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                  {appointmentTypes.length || 1} {appointmentTypes.length === 1 ? 'Service' : 'Services'}
                </span>
              </div>

              {appointmentTypes.length === 0 ? (
                <div className="p-6 sm:p-7 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-bold text-slate-900">Standard Consultation</h3>
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                        Default
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Standard consultation & clinical assessment session
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>30 mins</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-slate-400" />
                        <span>In-Clinic & Video</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                    <span className="text-lg font-black text-slate-900">
                      {formatINR(fee)}
                    </span>
                    <Link
                      href={bookingHref}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <span>Select</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointmentTypes.map((type) => (
                    <div
                      key={type._id}
                      className="p-6 rounded-2xl border border-slate-200/90 hover:border-indigo-300 bg-white hover:bg-indigo-50/10 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 group"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                            {type.name}
                          </h3>
                          {type.isDefault && (
                            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                              Default
                            </span>
                          )}
                        </div>

                        {type.description && (
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                            {type.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-500 pt-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{type.duration || 30} mins</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            <Video className="w-3.5 h-3.5 text-slate-400" />
                            <span>{type.consultationType || 'In-Clinic & Video'}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <span className="text-base sm:text-lg font-black text-slate-900">
                          {formatINR(type.fee ?? fee)}
                        </span>
                        <Link
                          href={`${bookingHref}?serviceId=${type._id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md"
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

            {/* How It Works (3 Steps) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-8 lg:p-9 shadow-sm space-y-6">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2.5">
                <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
                <span>How On-Visit Booking Works</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Select Date & Time</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Choose an available time slot or join the live clinic queue token online.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Instant Digital Pass</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Receive your verified pass with QR code and directions on WhatsApp/SMS.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Priority Check-In</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Show your booking pass at reception for immediate priority entry.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-8 lg:p-9 shadow-sm space-y-6">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2.5">
                <HelpCircle className="w-4.5 h-4.5 text-indigo-600" />
                <span>Frequently Asked Questions</span>
              </h2>

              <div className="space-y-3.5">
                {FAQS.map((faq, idx) => {
                  const isExpanded = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200/80 rounded-2xl overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                        className="w-full flex items-center justify-between p-5 text-left font-bold text-xs sm:text-sm text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Card & Clinic Info */}
          <div className="space-y-8">
            <div className="sticky top-24 space-y-8">
              {/* Sticky Reservation Widget */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-md space-y-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Session Fee
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {formatINR(fee)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/ consultation</span>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <Link
                    href={bookingHref}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <span>{isQueueMode ? 'Get Queue Token' : 'Book Appointment'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <p className="text-[11px] text-center text-slate-400 font-medium">
                    ⚡ Instant SMS & WhatsApp confirmation pass
                  </p>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Verified Practitioner</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>No Account Required to Book</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <QrCode className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Express QR Reception Check-in</span>
                  </div>
                </div>
              </div>

              {/* Clinic Facility & Location Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-sm space-y-4">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>Clinic & Directions</span>
                </h2>

                <div className="p-4.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  {profile.businessName && (
                    <p className="text-xs font-bold text-slate-900">{profile.businessName}</p>
                  )}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {[profile.address, profile.city, profile.state].filter(Boolean).join(', ') ||
                      'Clinic Facility'}
                  </p>

                  {profile.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Helpline: {profile.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  {profile.googleMapUrl ? (
                    <a
                      href={profile.googleMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-100 cursor-pointer"
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
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200/60 cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Directions on Maps</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Weekly Working Hours Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-sm space-y-4">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Working Hours</span>
                </h2>

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
                            ? 'bg-indigo-50/90 border border-indigo-100 text-indigo-950 font-bold'
                            : 'text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={isToday ? 'text-indigo-900 font-bold' : 'text-slate-600'}>
                            {day}
                          </span>
                          {isToday && (
                            <span className="text-[10px] px-2 py-0.5 bg-indigo-600 text-white rounded-md font-bold">
                              Today
                            </span>
                          )}
                        </div>

                        <div>
                          {isEnabled && timeRanges.length > 0 ? (
                            <span className="font-semibold text-slate-800">
                              {timeRanges
                                .map((r) => `${format12Hour(r.startTime)} – ${format12Hour(r.endTime)}`)
                                .join(', ')}
                            </span>
                          ) : isEnabled ? (
                            <span className="font-semibold text-slate-800">09:00 AM – 06:00 PM</span>
                          ) : (
                            <span className="text-rose-500 font-semibold">Closed</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Mobile Quick Booking Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-4 sm:hidden shadow-2xl">
        <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation</span>
            <span className="text-lg font-black text-slate-900">{formatINR(fee)}</span>
          </div>

          <Link
            href={bookingHref}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-md"
          >
            <span>{isQueueMode ? 'Get Queue Token' : 'Book Appointment'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
