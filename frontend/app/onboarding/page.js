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
  Crown,
  ShieldCheck,
  Truck,
  Zap,
  Calculator,
  Scale,
  Stethoscope,
  GraduationCap,
  Briefcase,
  Scissors,
  Dumbbell,
  Compass,
  Laptop,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { professionalService } from '@/services/professional.service';
import { availabilityService } from '@/services/availability.service';
import { bookingLinkService } from '@/services/bookingLink.service';
import { subscriptionService } from '@/services/subscription.service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ONBOARDING_PROFESSIONS = [
  { name: 'CA / Tax Consultant', icon: Calculator, iconColor: 'text-blue-600', iconBg: 'bg-blue-50 border-blue-200/80', sub: 'Audits, GST & ITR' },
  { name: 'Lawyer / Advocate', icon: Scale, iconColor: 'text-amber-600', iconBg: 'bg-amber-50 border-amber-200/80', sub: 'Legal Counsel & Court' },
  { name: 'Doctor / Clinic', icon: Stethoscope, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50 border-emerald-200/80', sub: 'Healthcare & Consults' },
  { name: 'Tutor / Educator', icon: GraduationCap, iconColor: 'text-purple-600', iconBg: 'bg-purple-50 border-purple-200/80', sub: '1-on-1 Classes & Coaching' },
  { name: 'Consultant / Advisor', icon: Briefcase, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50 border-indigo-200/80', sub: 'Business, Tech & Strategy' },
  { name: 'Salon / Beauty Pro', icon: Scissors, iconColor: 'text-pink-600', iconBg: 'bg-pink-50 border-pink-200/80', sub: 'Makeup, Hair & Styling' },
  { name: 'Fitness Coach / Trainer', icon: Dumbbell, iconColor: 'text-orange-600', iconBg: 'bg-orange-50 border-orange-200/80', sub: 'Workouts & Diet Plans' },
  { name: 'Astrologer / Vastu', icon: Compass, iconColor: 'text-violet-600', iconBg: 'bg-violet-50 border-violet-200/80', sub: 'Horoscope & Kundli' },
  { name: 'Freelancer / Creator', icon: Laptop, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-50 border-cyan-200/80', sub: 'Design, Dev & Media' },
  { name: 'Other Service Pro', icon: Layers, iconColor: 'text-slate-600', iconBg: 'bg-slate-100 border-slate-200/80', sub: 'Any Paid Appointments' },
];

const ONBOARDING_PLANS = [
  {
    key: 'SOLO_FREE',
    name: 'Solo Practitioner',
    price: '₹0',
    period: 'Free Forever',
    badge: 'Standard',
    features: [
      'Personal booking link',
      'Digital PDF slips',
      '0% platform commission',
      'Basic schedule management',
    ],
    popular: false,
  },
  {
    key: 'PRO_MONTHLY',
    name: 'Pro Practice (1 Mo)',
    price: '₹499',
    period: '1 Month (₹499/mo)',
    badge: 'Monthly',
    features: [
      'Unlimited services & consultations',
      'Instant digital vector QR kit',
      'WhatsApp & SMS reminders',
      'Standard support',
    ],
    popular: false,
  },
  {
    key: 'PRO_HALF_YEARLY',
    name: 'Pro Practice (6 Mo)',
    price: '₹2,199',
    period: '6 Months (₹366/mo • Save 26%)',
    badge: '⭐ Most Popular',
    freeDelivery: true,
    features: [
      '1x Acrylic QR Desk Standee (100% FREE)',
      '1x Clinic Wall Vinyl Banner (100% FREE)',
      '100% FREE Express Courier Delivery',
      'Unlimited appointments & services',
      'Priority 24/7 dedicated support',
    ],
    popular: true,
  },
  {
    key: 'PRO_YEARLY',
    name: 'Pro Annual (12 Mo)',
    price: '₹3,599',
    period: '12 Months (₹299/mo • Save 40%)',
    badge: 'Save 40%',
    freeDelivery: true,
    features: [
      '1x Acrylic QR Desk Standee (100% FREE)',
      '1x Clinic Wall Vinyl Banner (100% FREE)',
      '100% FREE Express Courier Delivery',
      'Lifetime Standee Replacement',
      'VIP Dedicated Account Manager',
    ],
    popular: false,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('Doctor');
  const [specialization, setSpecialization] = useState('');
  const [fee, setFee] = useState(500);
  const [city, setCity] = useState('Bhubaneswar');
  const [slug, setSlug] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('SOLO_FREE');

  // Availability state
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
      setProfession(profile.profession || 'Doctor');
      setSpecialization(profile.specialization || '');
      setFee(profile.consultationFee || 500);
      setCity(profile.city || 'Bhubaneswar');
      setSlug(profile.bookingSlug || '');
    }
  }, [profile]);

  const handleNext = async () => {
    setLoading(true);
    try {
      if (step === 1) {
        await professionalService.updateProfile({ name, specialization, consultationFee: Number(fee), city });
        setStep(2);
      } else if (step === 2) {
        await professionalService.updateProfile({ profession });
        setStep(3);
      } else if (step === 3) {
        const currentAvail = await availabilityService.getWeeklyAvailability();
        const updated = (currentAvail.data || []).map((day) => ({
          dayOfWeek: day.dayOfWeek,
          enabled: !!workingDays[day.dayOfWeek],
          timeRanges: workingDays[day.dayOfWeek]
            ? day.timeRanges?.length
              ? day.timeRanges
              : [{ startTime: '09:00', endTime: '17:00' }]
            : [],
        }));
        await availabilityService.updateWeeklyAvailability(updated);
        setStep(4);
      } else if (step === 4) {
        if (slug && slug !== profile?.bookingSlug) {
          await bookingLinkService.updateSlug(slug);
        }
        setStep(5);
      } else if (step === 5) {
        // Select onboarding membership tier
        await subscriptionService.selectPlan({
          planKey: selectedPlan,
          paymentMethod: selectedPlan === 'SOLO_FREE' ? 'FREE' : 'PAY_ONLINE_LATER',
        });
        await refreshProfile();
        setStep(6);
        toast.success('Onboarding complete! Your schedule and plan are ready.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const url = `http://localhost:3000/book/${slug || profile?.bookingSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Booking link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const bookingUrl = `http://localhost:3000/book/${slug || profile?.bookingSlug}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hi! You can book an appointment directly with me here:\n${bookingUrl}`
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Book<span className="text-indigo-600">Saathi</span>
          </span>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= i
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-50'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > i ? <Check className="w-4 h-4" /> : i}
                </div>
                {i < 6 && (
                  <div
                    className={`w-5 sm:w-10 h-1 mx-0.5 sm:mx-1 rounded ${
                      step > i ? 'bg-indigo-600' : 'bg-slate-100'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 1: Your Professional Profile</h3>
                <p className="text-xs text-slate-500">How clients and customers will identify you on your public link.</p>
              </div>

              <Input
                label="Full Name / Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CA Priya Agarwal / Adv. Vikram Singh / Dr. Rajesh"
                required
              />

              <Input
                label="Specialization / Title / Expertise"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Corporate Tax / High Court Litigator / Math Tutor / General Physician / Bridal Makeup"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Consultation / Service Fee (₹)"
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  prefix={<span className="text-xs font-bold text-slate-500">₹</span>}
                />
                <Input
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai / Delhi / Bhubaneswar"
                />
              </div>

              <div className="pt-4">
                <Button onClick={handleNext} loading={loading} className="w-full">
                  Continue to Select Profession
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 2: What is your primary profession?</h3>
                <p className="text-xs text-slate-500">Select your category to tailor your default appointment setup.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                {ONBOARDING_PROFESSIONS.map((p) => {
                  const Icon = p.icon;
                  const isSelected = profession === p.name || profession === p.name.split(' / ')[0];
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setProfession(p.name)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700 bg-white'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : `${p.iconBg} ${p.iconColor}`
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">{p.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="w-1/3">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={handleNext} loading={loading} className="w-2/3">
                  Continue to Availability
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 3: Which days are you open?</h3>
                <p className="text-xs text-slate-500">You can adjust exact working hours in the dashboard later.</p>
              </div>

              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                  <label
                    key={d}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-800">{DAYS[d]}</span>
                    <input
                      type="checkbox"
                      checked={!!workingDays[d]}
                      onChange={(e) =>
                        setWorkingDays({ ...workingDays, [d]: e.target.checked })
                      }
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="w-1/3">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={handleNext} loading={loading} className="w-2/3">
                  Continue to Booking Link
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 4: Your Custom Booking Link</h3>
                <p className="text-xs text-slate-500">Choose a clean, memorable URL slug to share with clients.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Public Booking URL
                </label>
                <div className="flex items-center">
                  <span className="px-3.5 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs font-mono text-slate-500 select-none">
                    booksaathi.in/book/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-r-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(3)} className="w-1/3">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={handleNext} loading={loading} className="w-2/3">
                  Continue to Plan
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Step 5: Select Your Plan</h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5" /> Cancel anytime
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Start with Free Forever or supercharge your clinic with QR Standees & Banners.
                </p>
              </div>

              <div className="space-y-3">
                {ONBOARDING_PLANS.map((p) => {
                  const isSelected = selectedPlan === p.key;
                  return (
                    <div
                      key={p.key}
                      onClick={() => setSelectedPlan(p.key)}
                      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {p.popular && (
                        <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                          ⭐ {p.badge}
                        </div>
                      )}
                      {!p.popular && p.badge && (
                        <div className="absolute -top-2.5 right-4 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {p.badge}
                        </div>
                      )}

                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="onboarding_plan"
                              checked={isSelected}
                              onChange={() => setSelectedPlan(p.key)}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                          </div>
                          <p className="text-xs text-slate-500 ml-6">{p.period}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-extrabold text-slate-900">{p.price}</span>
                          {p.freeDelivery && (
                            <span className="block text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 justify-end">
                              <Truck className="w-3 h-3" /> Free Delivery
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 ml-6 grid grid-cols-1 sm:grid-cols-2 gap-1 border-t border-slate-100 pt-2">
                        {p.features.slice(0, 4).map((f, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(4)} className="w-1/3">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={handleNext} loading={loading} className="w-2/3">
                  Complete Setup 🎉
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="text-center py-4 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">🎉 Your setup is complete!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your booking link and professional portal are ready to accept appointments.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <p className="text-xs font-mono text-indigo-900 font-bold break-all">
                  {bookingUrl}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={copyLink} className="w-full sm:w-1/2">
                  {copied ? <Check className="w-4 h-4 mr-1 text-emerald-600" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? 'Copied Link!' : 'Copy Link'}
                </Button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-1/2"
                >
                  <Button variant="whatsapp" className="w-full">
                    <Share2 className="w-4 h-4 mr-1" /> Share on WhatsApp
                  </Button>
                </a>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link href="/dashboard" className="block">
                  <Button className="w-full">
                    Go to Professional Dashboard
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
