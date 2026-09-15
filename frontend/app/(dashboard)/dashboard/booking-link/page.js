'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import {
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Globe,
  QrCode,
  MessageCircle,
  Zap,
  Repeat,
  Calendar,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { bookingLinkService } from '@/services/public.service';
import { subscriptionService } from '@/services/subscription.service';
import { getProfessionalPublicUrl, getProfessionalDisplayUrl } from '@/lib/urlHelpers';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function UnifiedBookingLinkAndPlanPage() {
  const router = useRouter();
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();

  const [copied, setCopied] = useState(false);
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState('idle'); // idle | checking | available | taken | invalid
  const [slugMessage, setSlugMessage] = useState('');
  const [savingSlug, setSavingSlug] = useState(false);

  // Plan upgrade states
  const [annualBilling, setAnnualBilling] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [subData, setSubData] = useState(null);

  useEffect(() => {
    if (!authLoading && user && user.role !== 'PROFESSIONAL') {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile?.bookingSlug) {
      setSlug(profile.bookingSlug);
    }
  }, [profile]);

  useEffect(() => {
    subscriptionService
      .getMySubscription()
      .then((res) => {
        if (res.data) setSubData(res.data);
      })
      .catch(() => {});
  }, [profile]);

  // Expiration date computation
  const planExpiresAt = profile?.planExpiresAt || subData?.planExpiresAt;
  const currentPlan = subData?.plan || profile?.plan || 'FREE';

  const isPro =
    currentPlan === 'PRO' &&
    (!planExpiresAt || new Date(planExpiresAt) > new Date());

  const isPlanExpired =
    currentPlan === 'PRO' &&
    planExpiresAt &&
    new Date(planExpiresAt) <= new Date();

  const formattedExpiryDate = planExpiresAt
    ? new Date(planExpiresAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const diffTime = planExpiresAt ? new Date(planExpiresAt) - new Date() : null;
  const daysLeft =
    diffTime && diffTime > 0 ? Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))) : 0;

  // Live slug availability check (debounced ~450ms)
  useEffect(() => {
    if (!slug || slug.trim().length < 3) {
      setSlugStatus('idle');
      setSlugMessage('');
      return;
    }

    if (slug === profile?.bookingSlug) {
      setSlugStatus('available');
      setSlugMessage('Current link');
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
        setSlugMessage(err.response?.data?.message || 'Invalid format');
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [slug, profile?.bookingSlug]);

  const bookingUrl = getProfessionalPublicUrl(profile);
  const displayUrl = getProfessionalDisplayUrl(profile);


  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    toast.success('Booking link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSlug = async () => {
    if (slug === profile?.bookingSlug) {
      toast.info('No changes to booking slug');
      return;
    }
    if (slugStatus === 'taken' || slugStatus === 'invalid') {
      toast.error('Please choose an available username');
      return;
    }

    setSavingSlug(true);
    try {
      await bookingLinkService.updateSlug(slug);
      toast.success('Booking link updated successfully!');
      if (refreshProfile) await refreshProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update booking slug');
    } finally {
      setSavingSlug(false);
    }
  };

  const handlePlanAction = async (planKey) => {
    setUpgrading(true);
    try {
      const cycle = annualBilling ? 'YEARLY' : 'MONTHLY';
      await subscriptionService.selectPlan({ planKey, billingCycle: cycle });
      toast.success(`Plan updated to ${planKey === 'PRO' ? 'Pro' : 'Free'}!`);
      if (refreshProfile) await refreshProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update plan');
    } finally {
      setUpgrading(false);
    }
  };

  const downloadQrCode = () => {
    const svgElement = document.getElementById('practice-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `qr-${profile?.bookingSlug || 'practice'}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success('QR Code downloaded successfully!');
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hello! You can easily book an appointment with me directly here:\n${bookingUrl}`
  )}`;

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Booking Link & Plan
            </h1>
            {isPro ? (
              <div className="inline-flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-800 border border-amber-400/40 text-xs font-black uppercase">
                  ⭐ PRO
                </span>
                {formattedExpiryDate && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Expires: {formattedExpiryDate}</span>
                    {daysLeft > 0 && (
                      <span className="text-emerald-700 font-semibold">({daysLeft} days left)</span>
                    )}
                  </span>
                )}
              </div>
            ) : isPlanExpired ? (
              <div className="inline-flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>PRO EXPIRED</span>
                </span>
                {formattedExpiryDate && (
                  <span className="px-3 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                    Expired on {formattedExpiryDate}
                  </span>
                )}
              </div>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold uppercase">
                FREE PLAN
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal booking link, download your QR code, and manage your subscription tier.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <span>Visit Public Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* SECTION 1: Personal Booking Link & QR Code Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Link Details & Vanity Slug Updater */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-7 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black text-slate-900">Your Shareable Link</h2>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Active & Live
              </span>
            </div>

            {/* Display Link Strip with Copy & WhatsApp Actions */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="font-mono text-xs sm:text-sm font-bold text-indigo-700 truncate select-all">
                  {displayUrl || bookingUrl}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={cn(
                      'px-3.5 py-2 rounded-xl text-xs font-bold border transition-all inline-flex items-center gap-1.5 cursor-pointer',
                      copied
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    )}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Custom Vanity Slug Handle Updater */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Custom Link Handle
                </label>
                {slugStatus === 'checking' && (
                  <span className="text-[11px] font-semibold text-slate-400 inline-flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Checking...
                  </span>
                )}
                {slugStatus === 'available' && (
                  <span className="text-[11px] font-bold text-emerald-600 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {slugMessage}
                  </span>
                )}
                {(slugStatus === 'taken' || slugStatus === 'invalid') && (
                  <span className="text-[11px] font-bold text-rose-600 inline-flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> {slugMessage}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <span className="text-xs font-bold text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 select-none">
                    booksaathi.in/book/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="your-practice-name"
                    className="w-full pl-36 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <Button
                  onClick={handleSaveSlug}
                  loading={savingSlug}
                  disabled={slug === profile?.bookingSlug || slugStatus === 'taken' || slugStatus === 'invalid'}
                  className="w-full sm:w-auto text-xs font-bold px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                >
                  Save Handle
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Customers can book with this link on any mobile browser with 0% convenience fees.</span>
          </div>
        </div>

        {/* Right 1 Col: QR Code Generator Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 text-center space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mx-auto">
              <QrCode className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-slate-900">QR Code for Reception</h3>
            <p className="text-xs text-slate-500">
              Print or display this QR code on your desk for instant walk-in self-booking.
            </p>
          </div>

          {/* Render Vector QR */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block mx-auto shadow-2xs">
            <QRCodeSVG
              id="practice-qr-svg"
              value={bookingUrl}
              size={140}
              level="H"
              includeMargin={false}
            />
          </div>

          <Button
            onClick={downloadQrCode}
            variant="outline"
            className="w-full text-xs font-bold py-2 rounded-xl border-slate-200 hover:border-slate-300"
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Download QR Image (.png)
          </Button>
        </div>
      </div>

      {/* SECTION 2: Plan & Subscription Management (Free vs Pro) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black text-slate-900">Subscription & Plan Tier</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Simple flat pricing. Core booking features remain free forever.
            </p>
          </div>

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center gap-2.5 text-xs font-bold bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setAnnualBilling(false)}
              className={cn(
                'px-3 py-1.5 rounded-xl transition-all cursor-pointer',
                !annualBilling ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnualBilling(true)}
              className={cn(
                'px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1',
                annualBilling ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <span>Annual</span>
              <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 rounded">Save 37%</span>
            </button>
          </div>
        </div>

        {/* Expiration Status Banner */}
        {isPro && formattedExpiryDate && (
          <div className="flex items-center justify-between gap-3 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold">Active Pro Subscription</span>
                <span className="text-emerald-700 block sm:inline sm:ml-1">
                  • Expires on <strong>{formattedExpiryDate}</strong> {daysLeft > 0 ? `(${daysLeft} days remaining in current billing cycle)` : ''}
                </span>
              </div>
            </div>
          </div>
        )}

        {isPlanExpired && (
          <div className="flex items-center justify-between gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold">Pro Subscription Expired</span>
                <span className="text-rose-700 block sm:inline sm:ml-1">
                  • Your plan expired on <strong>{formattedExpiryDate || 'Recently'}</strong>. Renew below to restore Pro features.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2 Plan Cards (Free vs Pro) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FREE PLAN */}
          <div
            className={cn(
              'rounded-3xl p-6 flex flex-col justify-between space-y-6 border transition-all',
              !isPro
                ? 'bg-slate-50 border-indigo-600 ring-2 ring-indigo-600/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            )}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">Free Starter</h3>
                {!isPro && (
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                    Current Plan
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹0</span>
                  <span className="text-xs font-semibold text-slate-500">/month (Free Forever)</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Everything an independent doctor or consultant needs to get booked online.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited client appointments</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Shareable booking link + QR code</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Today queue dashboard with count badge</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero-login customer booking lookup</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>0% platform convenience fees</span>
                </li>
              </ul>
            </div>

            {isPro && (
              <Button
                variant="outline"
                disabled={upgrading}
                onClick={() => handlePlanAction('FREE')}
                className="w-full text-xs font-bold py-2.5 rounded-xl border-slate-300 cursor-pointer"
              >
                Switch to Free Plan
              </Button>
            )}
          </div>

          {/* PRO PLAN */}
          <div
            className={cn(
              'rounded-3xl p-6 flex flex-col justify-between space-y-6 border transition-all relative overflow-hidden',
              isPro
                ? 'bg-gradient-to-br from-indigo-950 to-slate-900 text-white border-amber-400/40 shadow-xl'
                : 'bg-gradient-to-br from-indigo-950 to-slate-900 text-white border-indigo-500/30'
            )}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white">Pro Practice</h3>
                {isPro ? (
                  <span className="text-xs font-black text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                    Active Plan
                  </span>
                ) : isPlanExpired ? (
                  <span className="text-[10px] font-black text-rose-300 bg-rose-500/20 border border-rose-400/30 px-2 py-0.5 rounded-full">
                    Plan Expired
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    {annualBilling ? '₹1,499' : '₹199'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {annualBilling ? '/year (₹125/mo)' : '/month'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Automated reminders, customer retention, and custom handle perks.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-200 pt-2">
                <li className="flex items-center gap-2 font-bold text-white">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Everything in Free, plus:</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated WhatsApp reminder before appointment</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1-Tap "Book Again" for returning customers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom vanity booking slug handle</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Priority account triage tag</span>
                </li>
              </ul>
            </div>

            {!isPro ? (
              <Button
                loading={upgrading}
                onClick={() => handlePlanAction('PRO')}
                className="w-full text-xs font-black py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                {isPlanExpired
                  ? `Renew Pro Plan (${annualBilling ? '₹1,499/yr' : '₹199/mo'})`
                  : `Upgrade to Pro (${annualBilling ? '₹1,499/yr' : '₹199/mo'})`}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-center space-y-1">
                  <div className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active Pro Membership</span>
                  </div>
                  {formattedExpiryDate && (
                    <div className="text-[11px] text-slate-300 flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-300" />
                      <span>
                        Expires: <strong className="text-white">{formattedExpiryDate}</strong>{' '}
                        {daysLeft > 0 ? `(${daysLeft} days remaining)` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
