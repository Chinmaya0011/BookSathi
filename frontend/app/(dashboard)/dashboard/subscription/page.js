'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useQrBannerOrder } from '@/hooks/useQrBannerOrder';
import QrOrderStatusCard from '@/components/dashboard/qr-banner/QrOrderStatusCard';
import QrPricingCards from '@/components/dashboard/qr-banner/QrPricingCards';
import QrOrderReviewModal from '@/components/dashboard/qr-banner/QrOrderReviewModal';
import QrBannerCheckoutModal from '@/components/dashboard/qr-banner/QrBannerCheckoutModal';
import {
  Sparkles,
  ShieldCheck,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  Download,
  Zap,
  RefreshCw,
  Gift,
  QrCode,
  Package,
  Receipt,
  BellRing,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { formatINR, cn } from '@/lib/utils';
import { QR_BANNER_PLANS } from '@/lib/qrPricingCalculator';

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const {
    profile,
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

  const [renewalNotifs, setRenewalNotifs] = useState(true);

  if (!authLoading && user && user.role !== 'PROFESSIONAL') {
    router.replace('/dashboard');
    return null;
  }

  // Active plan derivation
  const planKey = activeOrder?.planKey || 'HALF_YEARLY';
  const planMeta = QR_BANNER_PLANS[planKey] || QR_BANNER_PLANS.HALF_YEARLY;

  const expiryDate = activeOrder?.subscriptionExpiryDate
    ? new Date(activeOrder.subscriptionExpiryDate)
    : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

  const formattedExpiry = expiryDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const now = new Date();
  const diffTime = expiryDate - now;
  const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalDays = (planMeta?.durationMonths || 6) * 30;
  const percentElapsed = Math.min(100, Math.max(5, Math.round(((totalDays - daysLeft) / totalDays) * 100)));

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-200 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Subscription & Membership Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Pro
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor your SaaS plan validity, renewal countdown, verified practice badge, and clinic hardware perks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const pricingElem = document.getElementById('renewal-pricing-plans');
            pricingElem?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="self-start sm:self-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Renew / Extend Subscription</span>
        </button>
      </div>

      {/* 1. Active Plan Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                Current Subscription Status
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {activeOrder?.planTitle || 'BookSaathi Pro SaaS — 6 Months Plan'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full Pro Dashboard • Verified Practice Seal • Physical Hardware Included
              </p>
            </div>
          </div>

          <div className="flex flex-col md:items-end">
            <span className="text-xs text-slate-500">Subscription Renews On</span>
            <span className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{formattedExpiry}</span>
            </span>
          </div>
        </div>

        {/* Validity Countdown Bar */}
        <div className="space-y-2 p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-slate-200/70">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span><strong>{daysLeft} Days</strong> remaining in current billing cycle</span>
            </span>
            <span className="text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
              Active & Protected
            </span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${100 - percentElapsed}%` }}
            />
          </div>
        </div>

        {/* 4 Details Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium block">Order Reference</span>
            <span className="font-mono font-bold text-slate-900 truncate block mt-0.5">
              {activeOrder?.orderId || 'QRO-885944'}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium block">Billing Interval</span>
            <span className="font-bold text-slate-900 block mt-0.5">
              {planMeta?.durationMonths || 6} Months Cycle
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium block">Payment Status</span>
            <span className="font-bold text-emerald-600 block mt-0.5">
              Paid & Verified (UPI)
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium block">Hardware Welcome Kit</span>
            <span className="font-bold text-indigo-600 block mt-0.5">
              Standee + Banner Free
            </span>
          </div>
        </div>
      </div>

      {/* 2. Dispatch / Physical Order Status */}
      {activeOrder && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Official Hardware Dispatch Tracking
          </h2>
          <QrOrderStatusCard order={activeOrder} />
        </div>
      )}

      {/* 3. Renewal Plans Section */}
      <div id="renewal-pricing-plans" className="space-y-2">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Renew or Upgrade Your Subscription
        </h2>
        <QrPricingCards
          plans={plans}
          selectedPlanKey={selectedPlanKey}
          onSelectPlan={handleSelectPlan}
          onOpenReview={handleOpenReview}
        />
      </div>

      {/* 4. Review & Shipping Address Modal */}
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

      {/* 5. Payment Gateway Modal */}
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
