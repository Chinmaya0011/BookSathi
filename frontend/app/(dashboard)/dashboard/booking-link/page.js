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
  Printer,
  FileDown,
  Palette,
  Eye,
  CheckCheck,
  CalendarCheck,
  Building2,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { bookingLinkService } from '@/services/public.service';
import { subscriptionService } from '@/services/subscription.service';
import { getProfessionalPublicUrl, getProfessionalDisplayUrl } from '@/lib/urlHelpers';
import { generateReceptionStandeePdf } from '@/lib/generateReceptionStandeePdf';
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

  // Standee Customization States
  const [standeeTheme, setStandeeTheme] = useState('sapphire'); // 'sapphire' | 'emerald' | 'obsidian' | 'clean'
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

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

  // Helper to extract QR Data URL
  const getQrDataUrl = () => {
    return new Promise((resolve) => {
      const svgElement = document.getElementById('practice-qr-svg');
      if (!svgElement) {
        resolve(null);
        return;
      }
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = 600;
        canvas.height = 600;
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 30, 30, 540, 540);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(null);
        }
      };

      img.onerror = () => resolve(null);
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });
  };

  // 1. Download Standee PDF (Print-Ready A4)
  const handleDownloadStandeePdf = async () => {
    setGeneratingPdf(true);
    try {
      const qrDataUrl = await getQrDataUrl();
      generateReceptionStandeePdf(profile, bookingUrl, qrDataUrl);
      toast.success('Print-ready Reception Standee PDF generated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate standee PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  // 2. Download High-Res HD Standee Poster PNG (1200 x 1600 px)
  const handleDownloadStandeePoster = async () => {
    setGeneratingImage(true);
    try {
      const qrDataUrl = await getQrDataUrl();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1200;
      canvas.height = 1600;

      if (!ctx) return;

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 1600);
      if (standeeTheme === 'emerald') {
        grad.addColorStop(0, '#064e3b');
        grad.addColorStop(0.35, '#022c22');
        grad.addColorStop(1, '#0f172a');
      } else if (standeeTheme === 'obsidian') {
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(0.4, '#090d16');
        grad.addColorStop(1, '#020617');
      } else if (standeeTheme === 'clean') {
        grad.addColorStop(0, '#f8fafc');
        grad.addColorStop(1, '#ffffff');
      } else {
        // Sapphire Executive
        grad.addColorStop(0, '#312e81');
        grad.addColorStop(0.35, '#0f172a');
        grad.addColorStop(1, '#020617');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 1600);

      // Inner White Card
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(80, 80, 1040, 1440, 36);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Header Banner inside card
      ctx.fillStyle = standeeTheme === 'emerald' ? '#047857' : standeeTheme === 'obsidian' ? '#0f172a' : '#4338ca';
      ctx.beginPath();
      ctx.roundRect(80, 80, 1040, 180, [36, 36, 0, 0]);
      ctx.fill();

      // Brand Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 46px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BookSaathi', 600, 160);

      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#e0e7ff';
      ctx.fillText('VERIFIED RECEPTION BOOKING DESK', 600, 205);

      // Practitioner Info
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 48px sans-serif';
      ctx.fillText(profile?.name || 'Verified Practitioner', 600, 360);

      ctx.fillStyle = '#4f46e5';
      ctx.font = 'bold 28px sans-serif';
      const profStr = `${profile?.profession || 'Specialist Consultant'} ${profile?.specialization ? `• ${profile.specialization}` : ''}`;
      ctx.fillText(profStr, 600, 410);

      ctx.fillStyle = '#64748b';
      ctx.font = 'normal 24px sans-serif';
      ctx.fillText(`${profile?.businessName || 'Consultation Facility'} ${profile?.city ? `(${profile.city})` : ''}`, 600, 455);

      // Verified Badge Pill
      ctx.fillStyle = '#eef2ff';
      ctx.beginPath();
      ctx.roundRect(380, 485, 440, 50, 25);
      ctx.fill();
      ctx.strokeStyle = '#c7d2fe';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#4338ca';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('● VERIFIED DIRECT APPOINTMENTS', 600, 517);

      // QR Code Box
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(340, 570, 520, 520, 32);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw QR Image
      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.onload = () => {
          ctx.drawImage(qrImg, 380, 610, 440, 440);

          // Instructions under QR
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 36px sans-serif';
          ctx.fillText('SCAN TO BOOK INSTANTLY', 600, 1160);

          // URL Box
          ctx.fillStyle = '#f1f5f9';
          ctx.beginPath();
          ctx.roundRect(250, 1190, 700, 60, 20);
          ctx.fill();

          ctx.fillStyle = '#4338ca';
          ctx.font = 'bold 24px monospace';
          ctx.fillText(displayUrl || bookingUrl, 600, 1230);

          // 3-Step Walk-in boxes
          const stepW = 280;
          const stepH = 120;
          const startX = 140;
          const stepY = 1280;

          const steps = [
            { num: '1', title: 'Scan QR Code', desc: 'Any Camera / WhatsApp' },
            { num: '2', title: 'Pick Slot / Queue', desc: 'Select consultation' },
            { num: '3', title: 'Priority Entry', desc: 'Instant WhatsApp pass' },
          ];

          steps.forEach((st, i) => {
            const sx = startX + i * 330;
            ctx.fillStyle = '#fafafc';
            ctx.beginPath();
            ctx.roundRect(sx, stepY, stepW, stepH, 16);
            ctx.fill();
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#4338ca';
            ctx.beginPath();
            ctx.arc(sx + 40, stepY + 40, 20, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(st.num, sx + 40, stepY + 47);

            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(st.title, sx + 75, stepY + 47);

            ctx.fillStyle = '#64748b';
            ctx.font = 'normal 16px sans-serif';
            ctx.fillText(st.desc, sx + 25, stepY + 85);
            ctx.textAlign = 'center';
          });

          // Bottom Bar
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.roundRect(80, 1440, 1040, 80, [0, 0, 36, 36]);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText('0% Extra Commission • Direct Booking • Powered by BookSaathi', 600, 1490);

          // Trigger Download
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `reception-standee-${profile?.bookingSlug || 'practice'}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          toast.success('High-Resolution Standee Poster downloaded!');
        };
        qrImg.src = qrDataUrl;
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to download standee poster');
    } finally {
      setGeneratingImage(false);
    }
  };

  // 3. Download Clean QR Code (PNG)
  const downloadCleanQrCode = () => {
    const svgElement = document.getElementById('practice-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 40, 40, 520, 520);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `qr-${profile?.bookingSlug || 'practice'}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success('Clean QR Code downloaded successfully!');
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // 4. Direct Print
  const handlePrint = () => {
    window.print();
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hello! You can easily book an appointment with me directly here:\n${bookingUrl}`
  )}`;

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-200 pb-20 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Booking Link & Reception Desk QR
            </h1>
            {isPro ? (
              <div className="inline-flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-800 border border-amber-400/40 text-xs font-black uppercase">
                  ⭐ PRO PRACTICE
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
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold uppercase">
                FREE STARTER PLAN
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your public booking URL, generate custom reception standees, and download ready-to-print posters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <span>Visit Public Booking Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* SECTION 1: Personal Booking Link & Vanity Handle */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Globe className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Your Shareable Booking Link</h2>
              <p className="text-xs text-slate-500">Instant direct access for clients and patients</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ● Active & Live
          </span>
        </div>

        {/* Display Link Strip with Copy & WhatsApp Actions */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="font-mono text-xs sm:text-sm font-bold text-indigo-700 truncate select-all">
              {displayUrl || bookingUrl}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold border transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95',
                  copied
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                )}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all inline-flex items-center gap-1.5 shadow-xs active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Share WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Custom Vanity Slug Handle Updater */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Custom Link Username
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
                /book/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="your-practice-name"
                className="w-full pl-16 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <Button
              onClick={handleSaveSlug}
              loading={savingSlug}
              disabled={slug === profile?.bookingSlug || slugStatus === 'taken' || slugStatus === 'invalid'}
              className="w-full sm:w-auto text-xs font-bold px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95"
            >
              Save Custom Link
            </Button>
          </div>
        </div>
      </div>

      {/* SECTION 2: EXECUTIVE RECEPTION DESK STANDEE & QR SHOWCASE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8">
        
        {/* Section Header with Theme Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/25">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Reception Desk QR Standee</h2>
                <p className="text-xs text-slate-500">
                  Ready-to-print acrylic standee & poster for your clinic front-desk
                </p>
              </div>
            </div>
          </div>

          {/* Standee Theme Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              <span>Theme:</span>
            </span>

            {[
              { id: 'sapphire', label: 'Sapphire', color: 'bg-indigo-600' },
              { id: 'emerald', label: 'Emerald', color: 'bg-emerald-600' },
              { id: 'obsidian', label: 'Obsidian', color: 'bg-slate-900' },
              { id: 'clean', label: 'Minimalist', color: 'bg-slate-100 text-slate-800' },
            ].map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => setStandeeTheme(th.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border',
                  standeeTheme === th.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                )}
              >
                <span className={cn('w-2.5 h-2.5 rounded-full', th.color)} />
                <span>{th.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Split: Standee Live 3D Preview (Left) vs Export Actions & Details (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Animated 3D Standee Card (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            
            {/* Standee Frame Container with subtle 3D hover depth */}
            <div
              className={cn(
                'w-full max-w-[340px] rounded-3xl p-5 shadow-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:rotate-0.5 relative select-none',
                standeeTheme === 'emerald'
                  ? 'bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white border-emerald-500/30'
                  : standeeTheme === 'obsidian'
                  ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-[#030712] text-white border-slate-800'
                  : standeeTheme === 'clean'
                  ? 'bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 border-slate-300'
                  : 'bg-gradient-to-b from-indigo-950 via-slate-900 to-[#090D16] text-white border-indigo-500/30'
              )}
            >
              {/* Standee Inner Card Frame */}
              <div className="bg-white rounded-2xl p-5 text-center text-slate-900 shadow-md border border-slate-100 space-y-3.5">
                
                {/* Standee Brand Banner */}
                <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-left">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-[10px]">
                      BS
                    </div>
                    <div>
                      <span className="text-xs font-black tracking-tight text-slate-900 block leading-tight">
                        BookSaathi
                      </span>
                      <span className="text-[8px] font-bold text-indigo-600 uppercase block tracking-wider">
                        Verified Desk
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black border border-emerald-200">
                    SCAN & BOOK
                  </span>
                </div>

                {/* Professional Photo & Identity */}
                <div className="flex flex-col items-center gap-2 pt-1">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-200 shadow-md bg-slate-100 flex items-center justify-center font-black text-xl text-indigo-600">
                      {profile?.profileImage ? (
                        <img
                          src={profile.profileImage}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{profile?.name?.charAt(0) || 'P'}</span>
                      )}
                    </div>

                    <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[8px] font-bold shadow-xs">
                      ✓
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">
                      {profile?.name || 'Verified Practitioner'}
                    </h3>
                    <p className="text-[11px] font-bold text-indigo-600 mt-0.5">
                      {profile?.profession || 'Specialist Consultant'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[240px]">
                      {[profile?.businessName, profile?.city].filter(Boolean).join(', ') || 'Consultation Facility'}
                    </p>
                  </div>
                </div>

                {/* Center Vector QR Frame */}
                <div className="p-3 bg-slate-50/90 rounded-2xl border-2 border-dashed border-indigo-200 inline-block mx-auto relative group shadow-2xs">
                  <QRCodeSVG
                    id="practice-qr-svg"
                    value={bookingUrl}
                    size={135}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNGY0NmU1IiBzdHJva2Utd2lkdGg9IjIiPjxyZWN0IHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgeD0iMyIgeT0iNCIgcng9IjQiLz48L3N2Zz4=',
                      height: 24,
                      width: 24,
                      excavate: true,
                    }}
                  />
                </div>

                {/* URL Strip */}
                <div className="p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-indigo-700 truncate select-all">
                  {displayUrl || bookingUrl}
                </div>

                {/* 3-Step Walk-In Guide */}
                <div className="grid grid-cols-3 gap-1 pt-1 text-[9px] text-slate-500 border-t border-slate-100">
                  <div className="p-1 rounded-lg bg-slate-50">
                    <span className="font-bold text-slate-800 block">1. Scan</span>
                    <span>Any Camera</span>
                  </div>
                  <div className="p-1 rounded-lg bg-slate-50">
                    <span className="font-bold text-slate-800 block">2. Select</span>
                    <span>Slot / Token</span>
                  </div>
                  <div className="p-1 rounded-lg bg-slate-50">
                    <span className="font-bold text-slate-800 block">3. Pass</span>
                    <span>Instant Entry</span>
                  </div>
                </div>

                {/* Bottom Trust Line */}
                <div className="text-[9px] font-bold text-slate-400 pt-0.5">
                  ⚡ Direct Self-Booking • 0% Extra Fee
                </div>

              </div>
            </div>

          </div>

          {/* Right: Export Actions, Formats & Reception Guides (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-900">Download Ready-to-Print Standee Formats</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Place this standee on your clinic reception desk, waiting room table, or billing counter so patients can scan and book immediate priority walk-ins without queue congestion.
              </p>
            </div>

            {/* Quick Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* 1. PDF Standee Download */}
              <button
                type="button"
                onClick={handleDownloadStandeePdf}
                disabled={generatingPdf}
                className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 transition-all text-left group cursor-pointer shadow-xs active:scale-98"
              >
                <div className="flex items-center justify-between pb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <FileDown className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                    Ready to Print
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                  {generatingPdf ? 'Generating PDF...' : 'Desk Standee PDF (A4)'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  High-resolution vector PDF formatted for acrylic stands & frame prints.
                </p>
              </button>

              {/* 2. HD Standee Image Download */}
              <button
                type="button"
                onClick={handleDownloadStandeePoster}
                disabled={generatingImage}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 transition-all text-left group cursor-pointer shadow-xs active:scale-98"
              >
                <div className="flex items-center justify-between pb-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                    <Download className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    HD PNG
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                  {generatingImage ? 'Exporting Image...' : 'Standee Poster Image (.png)'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ultra-clear 1200x1600px graphic with your photo, credentials & branding.
                </p>
              </button>

              {/* 3. Raw QR Code Download */}
              <button
                type="button"
                onClick={downloadCleanQrCode}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left group cursor-pointer shadow-xs active:scale-98"
              >
                <div className="flex items-center justify-between pb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Stationery
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                  Clean QR Code (.png)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Transparent vector QR code for visiting cards, letterheads & prescriptions.
                </p>
              </button>

              {/* 4. Direct Print Action */}
              <button
                type="button"
                onClick={handlePrint}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left group cursor-pointer shadow-xs active:scale-98"
              >
                <div className="flex items-center justify-between pb-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold shadow-xs">
                    <Printer className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    Direct Print
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                  Print Standee Now
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Send directly to connected office or desk printer.
                </p>
              </button>

            </div>

            {/* Reception Deployment Tips */}
            <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>How to Deploy at Your Reception Desk</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-500 list-disc list-inside">
                <li>Print in color on A4 photo paper or cardstock for maximum durability.</li>
                <li>Insert into a standard acrylic T-standee or magnetic wooden photo frame.</li>
                <li>Patients scanning will receive an instant digital token on their WhatsApp.</li>
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* SECTION 3: Plan & Subscription Management (Free vs Pro) */}
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
                  Everything an independent practitioner or consultant needs to get booked online.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited client appointments</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Shareable booking link + Reception QR Standee</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Today queue dashboard with live token calling</span>
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
