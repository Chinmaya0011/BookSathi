'use client';

import { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Zap,
  ShieldCheck,
  Crown,
  MessageCircle,
  TrendingUp,
  QrCode,
  CalendarCheck,
  Clock,
  ArrowRight,
  Flame,
  CreditCard,
  Lock,
  Smartphone,
  Building2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { subscriptionService } from '@/services/subscription.service';
import { launchCashfreeCheckout } from '@/lib/cashfree';
import { useAuth } from '@/hooks/useAuth';
import SubscriptionCheckoutModal from './SubscriptionCheckoutModal';

export default function ProUpgradeModal({ isOpen, onClose, onUpgradeSuccess }) {
  const { refreshProfile } = useAuth();
  const [billingCycle, setBillingCycle] = useState('YEARLY'); // 'MONTHLY' | 'YEARLY'
  const [showCheckout, setShowCheckout] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(''); // 'ORDER' | 'CHECKOUT' | 'VERIFYING'

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setShowCheckout(true);
  };

  const proFeatures = [
    {
      title: 'Unlimited Appointments & Live Queue',
      desc: 'No 15/month cap. Run your clinic or consultancy with 0 restrictions.',
      icon: CalendarCheck,
    },
    {
      title: 'Automated WhatsApp Reminders',
      desc: 'Cut patient no-shows by up to 78% with instant 2-hour pre-slot pings.',
      icon: MessageCircle,
    },
    {
      title: 'Revenue Analytics & Peak Demand Insights',
      desc: 'Unlock 30-day financials, hourly traffic heatmaps, and service breakdown.',
      icon: TrendingUp,
    },
    {
      title: 'Multi-Service Catalog & Custom Tariffs',
      desc: 'Create unlimited services, custom consultation fees, and variable slot durations.',
      icon: Zap,
    },
    {
      title: 'Free Acrylic QR Desk Standee Delivered',
      desc: 'Get your customized physical QR standee hardware shipped with ₹0 courier fee.',
      icon: QrCode,
    },
    {
      title: 'Custom Vanity Handle & White-Label Look',
      desc: 'Claim clean slug booksaathi.in/dr-yourname without standard branding.',
      icon: Crown,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={upgrading ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-2xl w-full overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150 font-sans">
        
        {/* Header Ribbon / Banner */}
        <div className="relative bg-slate-900 p-5 sm:p-6 text-white overflow-hidden shrink-0 border-b border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            disabled={upgrading}
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-30"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[11px] uppercase tracking-wider shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Limited Practice Offer
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Used by 2,400+ Verified Doctors & Specialists
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Unlock Full Practice Power with <span className="text-indigo-400">BookSaathi Pro</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg leading-relaxed">
            Remove all booking caps, stop customer no-shows with WhatsApp automation, and scale your daily practice seamlessly.
          </p>

          {/* Billing Interval Switcher */}
          <div className="mt-4 inline-flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              disabled={upgrading}
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'MONTHLY'
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing (₹199/mo)
            </button>
            <button
              type="button"
              disabled={upgrading}
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'YEARLY'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual (₹1,499/yr)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black tracking-tight">
                Save 37%
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Benefits List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {proFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{feat.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment gateway support details */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3 sm:p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                Accepted Payment Methods via Cashfree
              </span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                256-Bit SSL Encrypted
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700 shadow-2xs">
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                <span>UPI (GPay / PhonePe)</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700 shadow-2xs">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                <span>Credit / Debit Cards</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Net Banking (50+ Banks)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 bg-slate-50/90 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-center sm:text-left">
            <div className="flex items-baseline gap-1.5 justify-center sm:justify-start">
              <span className="text-2xl font-black text-slate-950">
                {billingCycle === 'YEARLY' ? '₹1,499' : '₹199'}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {billingCycle === 'YEARLY' ? '/ year (₹125/mo)' : '/ month'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Instant activation via Cashfree • 100% money-back guarantee within 7 days
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={upgrading}
              onClick={onClose}
              className="w-1/3 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
            >
              Maybe Later
            </button>
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={upgrading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {upgrading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>
                    {loadingStage === 'ORDER'
                      ? 'Creating Order...'
                      : loadingStage === 'CHECKOUT'
                      ? 'Checkout Active...'
                      : 'Verifying Payment...'}
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>
                    Pay {billingCycle === 'YEARLY' ? '₹1,499' : '₹199'} & Activate Pro
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Subscription Payment Checkout Dialog */}
      <SubscriptionCheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        initialBillingCycle={billingCycle}
        onSuccess={(data) => {
          setShowCheckout(false);
          if (onUpgradeSuccess) onUpgradeSuccess(data);
          onClose();
        }}
      />
    </div>
  );
}
