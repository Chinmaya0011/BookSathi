'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ShieldCheck,
  Check,
  Zap,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  CreditCard,
  Lock,
  Smartphone,
  Building2,
  CheckCircle2,
  RefreshCw,
  Crown,
  MessageCircle,
  TrendingUp,
  Receipt,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionService } from '@/services/subscription.service';
import Button from '@/components/ui/Button';
import SubscriptionCheckoutModal from '@/components/dashboard/SubscriptionCheckoutModal';
import { cn, formatINR } from '@/lib/utils';

export default function SubscriptionPlanPage() {
  const router = useRouter();
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();

  const [annualBilling, setAnnualBilling] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [switchingToFree, setSwitchingToFree] = useState(false);
  const [subData, setSubData] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);

  useEffect(() => {
    if (!authLoading && user && user.role !== 'PROFESSIONAL') {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const loadSubscription = async () => {
    setLoadingSub(true);
    try {
      const res = await subscriptionService.getMySubscription();
      if (res?.data) {
        setSubData(res.data);
      }
    } catch (err) {
      console.warn('Could not load subscription details:', err);
    } finally {
      setLoadingSub(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, [profile]);

  // Plan computations
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

  const handleSwitchToFree = async () => {
    setSwitchingToFree(true);
    try {
      const cycle = annualBilling ? 'YEARLY' : 'MONTHLY';
      await subscriptionService.selectPlan({ planKey: 'FREE', billingCycle: cycle });
      toast.success('Switched to Free plan');
      if (refreshProfile) await refreshProfile();
      await loadSubscription();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to switch to Free plan');
    } finally {
      setSwitchingToFree(false);
    }
  };

  const handleCheckoutSuccess = async () => {
    if (refreshProfile) await refreshProfile();
    await loadSubscription();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Subscription & Plan Tier
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Simple flat pricing. Core booking features remain free forever.
              </p>
            </div>
          </div>
        </div>

        {/* Monthly / Annual Billing Selector */}
        <div className="flex items-center gap-2 text-xs font-bold bg-slate-100 p-1.5 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setAnnualBilling(false)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl transition-all cursor-pointer',
              !annualBilling ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            )}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setAnnualBilling(true)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5',
              annualBilling ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded">
              Save 37%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Status Banner */}
      {isPro && formattedExpiryDate && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-emerald-950">Active Pro Subscription</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <span className="text-emerald-700 text-xs mt-0.5 block">
                Valid until <strong>{formattedExpiryDate}</strong> {daysLeft > 0 ? `(${daysLeft} days remaining in current billing cycle)` : ''}
              </span>
            </div>
          </div>

          <Button
            onClick={() => setCheckoutModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shrink-0 cursor-pointer"
          >
            Renew / Extend Plan
          </Button>
        </div>
      )}

      {isPlanExpired && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-rose-50/70 border border-rose-200/90 rounded-2xl text-xs text-rose-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-sm text-rose-950">Pro Subscription Expired</span>
              <p className="text-rose-700 text-xs mt-0.5">
                Your plan expired on <strong>{formattedExpiryDate || 'Recently'}</strong>. Renew below to restore automated reminders and queue tools.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setCheckoutModalOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2 rounded-xl shrink-0 cursor-pointer"
          >
            Renew Pro Now
          </Button>
        </div>
      )}

      {/* 2 Plan Cards: Free vs Pro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* FREE STARTER PLAN */}
        <div
          className={cn(
            'rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 border transition-all',
            !isPro
              ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-2xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          )}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Free Starter</h3>
                <p className="text-xs text-slate-500 mt-0.5">For independent practitioners</p>
              </div>
              {!isPro && (
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                  Current Active Plan
                </span>
              )}
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-slate-900">₹0</span>
                <span className="text-xs font-semibold text-slate-500">/ month (Free Forever)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Zero fees, zero setup costs. Everything you need to get booked online.
              </p>
            </div>

            <ul className="space-y-3 text-xs text-slate-700 pt-2 border-t border-slate-200/80">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unlimited client appointments</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Shareable booking link + Reception QR Standee</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Today queue dashboard with live token calling</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero-login customer booking lookup</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>0% platform convenience fees</span>
              </li>
            </ul>
          </div>

          {isPro && (
            <Button
              variant="outline"
              disabled={switchingToFree}
              onClick={handleSwitchToFree}
              className="w-full text-xs font-bold py-3 rounded-xl border-slate-300 hover:bg-slate-100 cursor-pointer"
            >
              {switchingToFree ? 'Switching...' : 'Switch to Free Plan'}
            </Button>
          )}
        </div>

        {/* PRO PRACTICE PLAN */}
        <div
          className={cn(
            'rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 border transition-all relative overflow-hidden text-white',
            isPro
              ? 'bg-[#0c1220] border-amber-400/50 shadow-xl ring-1 ring-amber-400/30'
              : 'bg-[#0c1220] border-slate-800 shadow-md'
          )}
        >
          {/* Subtle Glow Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-5 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Pro Practice</h3>
                <p className="text-xs text-indigo-200/80 mt-0.5">Automations & retention engine</p>
              </div>
              {isPro ? (
                <span className="text-xs font-black text-amber-300 bg-amber-400/20 border border-amber-400/40 px-3 py-1 rounded-full shadow-xs">
                  Active Pro Member
                </span>
              ) : isPlanExpired ? (
                <span className="text-xs font-black text-rose-300 bg-rose-500/20 border border-rose-400/30 px-3 py-1 rounded-full">
                  Plan Expired
                </span>
              ) : (
                <span className="text-xs font-black text-amber-300 bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-full">
                  Recommended
                </span>
              )}
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-white font-mono">
                  {annualBilling ? '₹1,499' : '₹199'}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {annualBilling ? '/ year (₹125/mo)' : '/ month'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Automated WhatsApp reminders, customer retention, and custom handle perks.
              </p>
            </div>

            <ul className="space-y-3 text-xs text-slate-200 pt-2 border-t border-white/10">
              <li className="flex items-center gap-2.5 font-bold text-white">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Everything in Free, plus:</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automated WhatsApp reminder before appointment</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1-Tap "Book Again" for returning clients</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Custom vanity booking handle / slug</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Priority account triage and VIP support</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 pt-2">
            {!isPro ? (
              <Button
                onClick={() => setCheckoutModalOpen(true)}
                className="w-full text-xs font-black py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>
                  {isPlanExpired
                    ? `Renew Pro Plan (${annualBilling ? '₹1,499/yr' : '₹199/mo'})`
                    : `Upgrade to Pro (${annualBilling ? '₹1,499/yr' : '₹199/mo'})`}
                </span>
                <ArrowRight className="w-4 h-4" />
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
                <Button
                  onClick={() => setCheckoutModalOpen(true)}
                  className="w-full text-xs font-bold py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white cursor-pointer"
                >
                  Extend Subscription
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Security & Accepted Gateway Strip */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Exclusive Payment Partner: Cashfree Payments (Demo Mode)
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Operating in secure demo sandbox without live credentials • No real money charged
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold bg-amber-50 border border-amber-200 px-3 py-1 rounded-full self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5" />
            <span>Demo Mode Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <Smartphone className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
            <span className="text-xs font-bold text-slate-800 block">UPI Instant</span>
            <span className="text-[10px] text-slate-400">Google Pay, PhonePe, Paytm</span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <CreditCard className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
            <span className="text-xs font-bold text-slate-800 block">Cards</span>
            <span className="text-[10px] text-slate-400">Visa, MasterCard, RuPay</span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <Building2 className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
            <span className="text-xs font-bold text-slate-800 block">Net Banking</span>
            <span className="text-[10px] text-slate-400">50+ Indian Banks</span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
            <span className="text-xs font-bold text-slate-800 block">Cashfree PG</span>
            <span className="text-[10px] text-slate-400">Direct Gateway SDK</span>
          </div>
        </div>
      </div>

      {/* Subscription Payment Checkout Dialog */}
      <SubscriptionCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        initialBillingCycle={annualBilling ? 'YEARLY' : 'MONTHLY'}
        onSuccess={handleCheckoutSuccess}
      />

    </div>
  );
}
