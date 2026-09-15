'use client';

import { useState } from 'react';
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
  ArrowRight,
  RefreshCw,
  Gift,
  X,
  QrCode,
  Package,
  Check,
  ExternalLink,
  ChevronRight,
  Receipt,
  BellRing,
} from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';
import { useQrBannerStore } from '@/stores/useQrBannerStore';
import { QR_BANNER_PLANS } from '@/lib/qrPricingCalculator';

export default function SubscriptionDetailsModal({ isOpen, onClose, profile, onOpenCheckout }) {
  const { hasActivePurchase, order } = useQrBannerStore();
  const [selectedRenewalKey, setSelectedRenewalKey] = useState('HALF_YEARLY');
  const [autoRenew, setAutoRenew] = useState(true);
  const [renewalNotifs, setRenewalNotifs] = useState(true);

  if (!isOpen) return null;

  // Active plan derivation
  const planKey = order?.planKey || 'HALF_YEARLY';
  const planMeta = QR_BANNER_PLANS[planKey] || QR_BANNER_PLANS.HALF_YEARLY;
  
  // Expiry calculation
  const expiryDate = order?.subscriptionExpiryDate
    ? new Date(order.subscriptionExpiryDate)
    : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

  const formattedExpiry = expiryDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const now = new Date();
  const diffTime = expiryDate - now;
  const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalDays = planMeta.durationMonths * 30;
  const percentElapsed = Math.min(100, Math.max(5, Math.round(((totalDays - daysLeft) / totalDays) * 100)));

  const renewalPlans = [
    {
      key: 'HALF_YEARLY',
      title: '6 Months Pro SaaS + FREE Hardware Kit',
      price: 2394,
      originalPrice: 2994,
      monthly: 399,
      badge: 'Most Popular',
      popular: true,
      perks: ['1x Free 3D Acrylic Standee', '1x Free Clinic Banner', 'Free Express Shipping'],
    },
    {
      key: 'YEARLY',
      title: '1 Year Pro SaaS VIP + Full Hardware Kit',
      price: 3588,
      originalPrice: 5988,
      monthly: 299,
      badge: 'Best Value (40% OFF)',
      popular: false,
      perks: ['1x Free 3D Acrylic Standee', '1x Free Clinic Banner', 'VIP Priority Support'],
    },
    {
      key: 'MONTHLY',
      title: '1 Month Pro SaaS',
      price: 499,
      originalPrice: 499,
      monthly: 499,
      badge: 'Standard',
      popular: false,
      perks: ['Full Dashboard Access', 'Unlimited Bookings', 'Digital QR Generator'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header with Dark Indigo Gradient */}
        <div className="relative p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white tracking-tight">
                    Subscription & Membership Hub
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active Pro
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Manage your BookSaathi Pro SaaS subscription, renewal dates, and official clinic hardware kit.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Active Plan Status Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-white border border-indigo-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/80 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  Current Active Plan
                </span>
                <h4 className="text-base sm:text-lg font-black text-slate-900">
                  {order?.planTitle || '6-Months BookSaathi Pro SaaS Plan'}
                </h4>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-500 block">Valid Until</span>
                <span className="text-sm font-black text-slate-900 flex items-center gap-1.5 sm:justify-end">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>{formattedExpiry}</span>
                </span>
              </div>
            </div>

            {/* Validity Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong>{daysLeft} days</strong> remaining in current cycle</span>
                </span>
                <span className="text-indigo-600 font-bold">100% Active</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${100 - percentElapsed}%` }}
                />
              </div>
            </div>

            {/* Plan Info Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-medium">Order ID</span>
                <span className="font-mono font-bold text-slate-900 truncate block">
                  {order?.orderId || 'QRO-885944'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-medium">Billing Cycle</span>
                <span className="font-bold text-slate-900">{planMeta.durationMonths} Months</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-medium">Payment Mode</span>
                <span className="font-bold text-emerald-600">UPI / Auto-Verified</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-medium">Hardware Kit</span>
                <span className="font-bold text-indigo-600">Included Free</span>
              </div>
            </div>
          </div>

          {/* Included Pro Features */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Included Pro Subscription Benefits</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Unlimited Customer Bookings</strong> with zero platform commission</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Instant WhatsApp Token & Receipts</strong> for every customer</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>1x Laser-Engraved 3D Standee</strong> + 1x Wall Banner</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Direct UPI Payments</strong> to your bank account</span>
              </div>
            </div>
          </div>

          {/* Renewal & Extension Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Renew or Extend Your Subscription</span>
                </h5>
                <p className="text-[11px] text-slate-500">
                  Select a renewal plan. Renewal duration stacks directly onto your remaining validity.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {renewalPlans.map((p) => {
                const isSelected = selectedRenewalKey === p.key;
                return (
                  <div
                    key={p.key}
                    onClick={() => setSelectedRenewalKey(p.key)}
                    className={cn(
                      'p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between',
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    )}
                  >
                    {p.badge && (
                      <span className={cn(
                        'absolute -top-2.5 right-3 px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider',
                        p.popular ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-900 text-white'
                      )}>
                        {p.badge}
                      </span>
                    )}

                    <div>
                      <h6 className="text-xs font-bold text-slate-900">{p.title}</h6>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-900">{formatINR(p.price)}</span>
                        {p.originalPrice > p.price && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatINR(p.originalPrice)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">₹{p.monthly} / month effective</span>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1">
                        {p.perks.map((perk, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                            <Check className="w-3 h-3 text-indigo-600 shrink-0" />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-2">
                      <div className={cn(
                        'w-full py-1.5 rounded-lg text-[11px] font-bold text-center transition-all',
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      )}>
                        {isSelected ? 'Selected Plan' : 'Select'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preferences & Notifications */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-indigo-600" />
                <span>WhatsApp Renewal Reminders (7 Days Prior)</span>
              </span>
              <input
                type="checkbox"
                checked={renewalNotifs}
                onChange={(e) => setRenewalNotifs(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>

        </div>

        {/* Footer Actions Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            <span>Selected Renewal: </span>
            <strong className="text-slate-900 font-bold">
              {renewalPlans.find((p) => p.key === selectedRenewalKey)?.title}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenCheckout) {
                  onOpenCheckout(selectedRenewalKey);
                }
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Renew & Extend Validity</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
