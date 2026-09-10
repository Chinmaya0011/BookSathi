'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Save,
  QrCode,
  Sparkles,
  Smartphone,
  ShieldCheck,
  MapPin,
  Phone,
  Printer,
  Sliders,
  Image as ImageIcon,
  Package,
  Layers,
  Truck,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { bookingLinkService } from '@/services/bookingLink.service';
import { useQrBannerOrder } from '@/hooks/useQrBannerOrder';
import QrOrderStatusCard from '@/components/dashboard/qr-banner/QrOrderStatusCard';
import QrLivePreview from '@/components/dashboard/qr-banner/QrLivePreview';
import BannerDesignSelector from '@/components/dashboard/qr-banner/BannerDesignSelector';
import QrPricingCards from '@/components/dashboard/qr-banner/QrPricingCards';
import QrOrderReviewModal from '@/components/dashboard/qr-banner/QrOrderReviewModal';
import QrBannerCheckoutModal from '@/components/dashboard/qr-banner/QrBannerCheckoutModal';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { getProfessionalPublicUrl, getProfessionalDisplayUrl } from '@/lib/urlHelpers';
import { isReservedSlug } from '@/lib/reservedSlugs';

export default function BookingLinkAndQrKitPage() {
  const router = useRouter();
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user && user.role !== 'PROFESSIONAL') {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const [activeTab, setActiveTab] = useState('standee'); // 'standee' | 'banner' | 'printable' | 'pricing'
  const [copied, setCopied] = useState(false);
  const [slug, setSlug] = useState('');
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(true);
  const [slugError, setSlugError] = useState('');
  const [savingSlug, setSavingSlug] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [showSlugEditor, setShowSlugEditor] = useState(false);

  const {
    hasActivePurchase,
    activeOrder,
    plans,
    selectedPlanKey,
    selectedDesign,
    currentPricing,
    shippingForm,
    reviewModalOpen,
    setReviewModalOpen,
    checkoutModalOpen,
    setCheckoutModalOpen,
    pendingCreatedOrder,
    submittingOrder,
    processingPayment,
    paymentMethod,
    setPaymentMethod,
    checkoutError,
    handleShippingChange,
    handleSelectPlan,
    handleSelectDesign,
    handleOpenReview,
    handleCreateOrder,
    handleProcessPayment,
  } = useQrBannerOrder();

  useEffect(() => {
    if (profile?.bookingSlug) {
      setSlug(profile.bookingSlug);
    }
  }, [profile]);

  const bookingUrl = getProfessionalPublicUrl(profile);
  const displayUrl = getProfessionalDisplayUrl(profile);

  const whatsappMessage = `Hi! You can book an appointment directly with me here:\n${bookingUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
  const emailShareUrl = `mailto:?subject=Book an Appointment with ${profile?.name || 'Practitioner'}&body=${encodeURIComponent(
    `Hi,\n\nYou can book an appointment with me using this link:\n${bookingUrl}\n\nThanks,\n${profile?.name || 'Practitioner'}`
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSlugChange = (e) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(val);
    setSlugError('');
    setSaveSuccess('');
  };

  const checkAvailability = async () => {
    if (!slug || slug.length < 3) {
      setSlugError('Username must be at least 3 characters long');
      setSlugAvailable(false);
      return;
    }
    if (isReservedSlug(slug)) {
      setSlugError('This username is reserved by the system. Please choose another.');
      setSlugAvailable(false);
      return;
    }
    if (slug === profile?.bookingSlug) {
      setSlugAvailable(true);
      setSlugError('');
      return;
    }
    setCheckingSlug(true);
    try {
      const res = await bookingLinkService.checkSlug(slug);
      setSlugAvailable(res.data?.isAvailable);
      if (!res.data?.isAvailable) {
        setSlugError(res.data?.message || 'This subdomain username is already taken by another professional.');
      }
    } catch (e) {
      setSlugError('Could not verify slug availability.');
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleSaveSlug = async () => {
    if (isReservedSlug(slug)) {
      setSlugError('This username is reserved by the system. Please choose another.');
      return;
    }

    setSavingSlug(true);
    setSlugError('');
    setSaveSuccess('');
    try {
      await bookingLinkService.updateSlug(slug);
      await refreshProfile();
      setSaveSuccess('Your subdomain booking link has been updated successfully!');
      setShowSlugEditor(false);
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (e) {
      setSlugError(e.response?.data?.message || 'Failed to update booking slug');
    } finally {
      setSavingSlug(false);
    }
  };

  const downloadPrintableCanvas = () => {
    const canvas = document.getElementById('printable-counter-canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `booksaathi-qr-card-${profile?.bookingSlug || 'counter'}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const studioTabs = [
    { id: 'standee', label: '3D Acrylic Desk Standee', icon: QrCode, badge: 'Popular' },
    { id: 'banner', label: 'Clinic Wall Banner', icon: ImageIcon, badge: null },
    { id: 'printable', label: 'Printable QR Card (300 DPI)', icon: Printer, badge: null },
    { id: 'pricing', label: 'Physical Kit Orders & Plans', icon: Package, badge: 'Free Delivery' },
  ];

  // Derive domain suffix for slug input
  const domainSuffix = typeof window !== 'undefined'
    ? (window.location.host.includes('localhost') ? '.localhost:3000' : `.${process.env.NEXT_PUBLIC_APP_DOMAIN || window.location.host.split('.').slice(-2).join('.')}`)
    : '.yourdomain.com';

  return (
    <div className="space-y-7 w-full animate-in fade-in duration-200 pb-16">
      
      {/* 1. Header with Page Title & Studio Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Subdomain Booking Link & QR Hardware Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Subdomain URL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Every professional gets their own personalized subdomain URL, vector QR codes, and physical clinic hardware.
          </p>
        </div>

        {/* Tab Navigator */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-2xs self-start md:self-auto overflow-x-auto max-w-full">
          {studioTabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-indigo-600' : 'text-slate-500')} />
                <span>{t.label}</span>
                {t.badge && (
                  <span className={cn(
                    'text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider',
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/70 text-slate-600'
                  )}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Top Branded Booking Link Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-7 rounded-3xl shadow-xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                Personal Subdomain Booking Portal
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowSlugEditor(!showSlugEditor)}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{showSlugEditor ? 'Close Customizer' : 'Change Subdomain Slug ✎'}</span>
            </button>
          </div>

          <h2 className="text-base sm:text-2xl font-mono font-black tracking-tight text-white break-all">
            {bookingUrl}
          </h2>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-indigo-600" />}
              <span>{copied ? 'Copied Subdomain!' : 'Copy URL'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </a>

            <a
              href={emailShareUrl}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Email Link</span>
            </a>

            {bookingUrl && (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-indigo-200 hover:text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visit Subdomain</span>
              </a>
            )}
          </div>

          {/* Expandable URL Slug Customizer */}
          {showSlugEditor && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-in fade-in duration-150">
              <span className="text-xs font-bold text-indigo-200 block">
                Choose Your Unique Subdomain Username:
              </span>
              
              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccess}</span>
                </div>
              )}

              {slugError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{slugError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <div className="flex items-center flex-1">
                  <span className="px-3 py-2 bg-slate-900 border border-r-0 border-slate-700 rounded-l-xl text-xs font-mono text-slate-400 select-none shrink-0">
                    https://
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={handleSlugChange}
                    onBlur={checkAvailability}
                    placeholder="dr-rajesh"
                    className="w-full px-3 py-2 bg-slate-900/90 border-y border-slate-700 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-indigo-400 font-mono"
                  />
                  <span className="px-3 py-2 bg-slate-900 border border-l-0 border-slate-700 rounded-r-xl text-xs font-mono text-slate-400 select-none shrink-0">
                    {domainSuffix}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSlug}
                  disabled={slug === profile?.bookingSlug || !slugAvailable || savingSlug || checkingSlug}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSlug ? 'Saving...' : 'Save Subdomain'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Active Order Tracker (if any physical kit ordered) */}
      {activeOrder && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Your Official Hardware Dispatch Tracker
          </h2>
          <QrOrderStatusCard order={activeOrder} />
        </div>
      )}

      {/* 4. Tab View: 3D Standee Studio */}
      {activeTab === 'standee' && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>3D Acrylic QR Desk Standee (Doctor Table & Reception Showcase)</span>
          </h2>
          <QrLivePreview profile={profile} selectedDesign={selectedDesign} />
        </div>
      )}

      {/* 5. Tab View: Clinic Wall Banner Studio */}
      {activeTab === 'banner' && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Clinic Wall Banner (Waiting Area & Clinic Entrance)</span>
          </h2>
          <BannerDesignSelector
            profile={profile}
            selectedDesign={selectedDesign}
            onSelectDesign={handleSelectDesign}
          />
        </div>
      )}

      {/* 6. Tab View: Printable Counter QR Card Sheet */}
      {activeTab === 'printable' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Instant Printable Counter Card (300 DPI)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Print this card on any standard printer or photo paper for immediate counter display.
              </p>
            </div>

            <button
              type="button"
              onClick={downloadPrintableCanvas}
              className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Download 300 DPI PNG</span>
            </button>
          </div>

          <div className="flex justify-center p-6 sm:p-10 bg-slate-100 rounded-2xl border border-slate-200">
            <div className="w-full max-w-[320px] bg-white rounded-3xl p-6 shadow-2xl border-2 border-slate-200 text-center space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider">
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Certified Clinic
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>BookSaathi Desk</span>
                </span>
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900">
                  {profile?.name || 'Dr. Rajesh Sharma'}
                </h4>
                <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                  {profile?.specialization || profile?.profession || 'Specialist Consultations'}
                </p>
              </div>

              <div className="flex justify-center my-2">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md">
                  <QRCodeCanvas
                    id="printable-counter-canvas"
                    value={bookingUrl}
                    size={160}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-xs font-black text-emerald-600 flex items-center justify-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 animate-bounce" />
                  <span>Scan to Book & Pay</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  GPay • PhonePe • Paytm • Camera
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[9px] font-mono text-slate-400 truncate">
                {displayUrl}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Hardware Pricing & Subscription Plans */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-indigo-600" />
          <span>Official Physical Hardware Kit Packages & SaaS Subscription</span>
        </h2>
        <QrPricingCards
          plans={plans}
          selectedPlanKey={selectedPlanKey}
          onSelectPlan={handleSelectPlan}
          onOpenReview={handleOpenReview}
        />
      </div>

      {/* 8. Review & Shipping Address Modal */}
      <QrOrderReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        pricing={currentPricing}
        selectedDesign={selectedDesign}
        shippingForm={shippingForm}
        onShippingChange={handleShippingChange}
        onSubmitOrder={handleCreateOrder}
        submitting={submittingOrder}
      />

      {/* 9. Payment Gateway Modal */}
      <QrBannerCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        pendingOrder={pendingCreatedOrder}
        paymentMethod={paymentMethod}
        onSelectPaymentMethod={setPaymentMethod}
        onProcessPayment={handleProcessPayment}
        processing={processingPayment}
        error={checkoutError}
      />
    </div>
  );
}
