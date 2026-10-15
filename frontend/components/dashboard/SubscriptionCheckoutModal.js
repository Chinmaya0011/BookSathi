'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  X,
  ShieldCheck,
  Lock,
  Smartphone,
  Building2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Zap,
  Info,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { formatINR, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { subscriptionService } from '@/services/subscription.service';
import { launchCashfreeCheckout } from '@/lib/cashfree';
import { useAuth } from '@/hooks/useAuth';

/**
 * SubscriptionCheckoutModal
 *
 * Dedicated Cashfree-only payment checkout dialog for BookSaathi Pro subscription upgrades.
 * Configured exclusively for Cashfree (Demo Mode) when API credentials are absent.
 * Features:
 * - Real-time Monthly / Annual billing toggle
 * - Prominent Cashfree Demo Mode labelling and test flow
 * - Simulated Payment Success and Failure actions
 * - Ready for seamless Cashfree Sandbox credentials upgrade
 */
export default function SubscriptionCheckoutModal({
  isOpen,
  onClose,
  initialBillingCycle = 'MONTHLY',
  onSuccess,
}) {
  const { user, profile, refreshProfile } = useAuth();

  const [billingCycle, setBillingCycle] = useState(initialBillingCycle);
  // Checkout stages: 'SELECT' | 'PROCESSING' | 'VERIFYING' | 'SUCCESS' | 'FAILED'
  const [stage, setStage] = useState('SELECT');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  // Sync initialBillingCycle when opened
  useEffect(() => {
    if (isOpen) {
      setBillingCycle(initialBillingCycle);
      setStage('SELECT');
      setErrorMessage('');
      setStatusMessage('');
      setOrderData(null);
      initOrder(initialBillingCycle);
    }
  }, [isOpen, initialBillingCycle]);

  // Create payment order on backend via Cashfree service
  const initOrder = async (cycle) => {
    setLoadingOrder(true);
    setErrorMessage('');
    try {
      const res = await subscriptionService.createOrder({
        planKey: 'PRO',
        billingCycle: cycle,
      });
      const data = res?.data || res;
      setOrderData(data);
    } catch (err) {
      console.error('Failed to create subscription order:', err);
      setErrorMessage(
        err.response?.data?.message || err.message || 'Unable to initialize Cashfree payment order.'
      );
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleCycleChange = (cycle) => {
    if (cycle === billingCycle || stage !== 'SELECT') return;
    setBillingCycle(cycle);
    initOrder(cycle);
  };

  const amount = billingCycle === 'YEARLY' ? 1499 : 199;
  const orderId = orderData?.orderId || `cf_demo_ord_SUB_${billingCycle === 'YEARLY' ? 'YR' : 'MO'}_${Date.now().toString().slice(-6)}`;
  const paymentSessionId = orderData?.paymentSessionId;
  const isDemoMode = orderData?.isDemo ?? true;

  /**
   * Finalize and verify payment via Cashfree flow
   */
  const handleCompletePayment = async ({ simulateFailure = false } = {}) => {
    if (stage === 'PROCESSING' || stage === 'VERIFYING') return;
    setErrorMessage('');

    if (simulateFailure) {
      setStage('FAILED');
      setErrorMessage('Payment simulation was declined or cancelled. (Cashfree Demo Failure Test)');
      return;
    }

    try {
      setStage('PROCESSING');
      setStatusMessage('Initializing Cashfree secure checkout...');

      // If genuine session exists (non-demo), launch Cashfree JS SDK
      if (paymentSessionId && !paymentSessionId.startsWith('session_demo_') && !paymentSessionId.startsWith('session_mock_')) {
        setStatusMessage('Launching Cashfree Checkout modal...');
        const cfResult = await launchCashfreeCheckout({
          paymentSessionId,
          redirectTarget: '_modal',
        });

        if (cfResult?.error) {
          throw new Error(cfResult.error.message || 'Cashfree checkout failed.');
        }
      } else {
        // Fast demonstration delay for realistic UX
        await new Promise((resolve) => setTimeout(resolve, 900));
      }

      setStage('VERIFYING');
      setStatusMessage('Verifying transaction confirmation with BookSaathi server...');

      // Server-side verification: backend validates demo order & marks DEMO_ACTIVE
      const verifyRes = await subscriptionService.verifyPayment({
        orderId,
        planKey: 'PRO',
        billingCycle,
      });

      // Refresh user profile in background
      if (refreshProfile) {
        await refreshProfile().catch(() => {});
      }

      setStage('SUCCESS');
      setStatusMessage('Payment verified! Your Pro Membership is active (Demo Mode).');

      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      toast.success('🎉 Welcome to Pro (Demo Mode)! All premium features have been unlocked.');

      if (onSuccess) {
        onSuccess(verifyRes?.data || verifyRes);
      }
    } catch (err) {
      console.error('Subscription verification failed:', err);
      setStage('FAILED');
      setErrorMessage(
        err.response?.data?.message || err.message || 'Payment verification failed. Please try again.'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 font-sans">
        
        {/* Modal Top Header */}
        <div className="relative bg-[#0c1220] border-b border-slate-800/80 p-5 sm:p-6 text-white shrink-0">
          <button
            type="button"
            disabled={stage === 'PROCESSING' || stage === 'VERIFYING'}
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-30"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold text-[10px] uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
              Cashfree Demo Mode
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Ref: {orderId}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Activate BookSaathi <span className="text-indigo-300">Pro Practice</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Exclusively integrated with Cashfree Payments • Demonstration Sandbox
          </p>

          {/* Billing Interval Toggle Inside Modal */}
          {stage === 'SELECT' && (
            <div className="mt-3.5 inline-flex items-center bg-white/10 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => handleCycleChange('MONTHLY')}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  billingCycle === 'MONTHLY'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                )}
              >
                Monthly (₹199/mo)
              </button>
              <button
                type="button"
                onClick={() => handleCycleChange('YEARLY')}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer',
                  billingCycle === 'YEARLY'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                )}
              >
                <span>Annual (₹1,499/yr)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold">
                  Save 37%
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">

          {/* SUCCESS STATE */}
          {stage === 'SUCCESS' && (
            <div className="text-center py-6 px-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">Pro Activated in Demo Mode!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Your BookSaathi Pro subscription has been verified and activated for{' '}
                  <strong className="text-slate-900">{billingCycle === 'YEARLY' ? '1 Year (Annual)' : '1 Month'}</strong>.
                  All premium features (live queue, WhatsApp reminders, custom handle) are now active.
                </p>
              </div>

              {/* Demo Notice Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 text-left flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Demonstration Notice:</span> No genuine financial transaction occurred. When real Cashfree API credentials are added, actual payments will process through the Cashfree payment gateway.
                </div>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Transaction ID:</span>
                  <span className="font-bold text-slate-900">{orderId}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Provider:</span>
                  <span className="font-bold text-indigo-700">Cashfree (Demo Mode)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Plan:</span>
                  <span className="font-bold text-slate-900">BookSaathi Pro ({billingCycle})</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Simulated Amount:</span>
                  <span className="font-bold text-emerald-700">{formatINR(amount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Status:</span>
                  <span className="font-bold text-amber-600 uppercase">DEMO_ACTIVE / DEMO_PAID</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Button
                  onClick={onClose}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer"
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* FAILED STATE */}
          {stage === 'FAILED' && (
            <div className="text-center py-6 px-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">Payment Failed (Demo Simulation)</h3>
                <p className="text-xs text-rose-600 max-w-md mx-auto font-medium">
                  {errorMessage || 'The simulated payment was declined or cancelled.'}
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-300 text-slate-700 font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  onClick={() => setStage('SELECT')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* PROCESSING / VERIFYING STATE */}
          {(stage === 'PROCESSING' || stage === 'VERIFYING') && (
            <div className="text-center py-12 px-4 space-y-5 animate-in fade-in duration-200">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center text-indigo-600 font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-black text-slate-900">
                  {stage === 'PROCESSING' ? 'Processing Cashfree Checkout...' : 'Verifying Demo Confirmation...'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {statusMessage || 'Please do not refresh or close this window.'}
                </p>
              </div>
            </div>
          )}

          {/* ACTIVE SELECT & CHECKOUT VIEW */}
          {stage === 'SELECT' && (
            <>
              {/* Order Cost Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shrink-0">
                    <Zap className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      BookSaathi Pro Practice Membership
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Billed {billingCycle === 'YEARLY' ? 'Annually (₹125/mo)' : 'Monthly'} • Auto-renewal optional
                    </span>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Payable Amount
                  </span>
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {formatINR(amount)}
                  </span>
                </div>
              </div>

              {/* Demo Mode Notice Banner */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="text-xs font-extrabold tracking-wide uppercase text-amber-800">
                    Cashfree Sandbox Demo Environment Active
                  </span>
                </div>
                <p className="text-[11px] text-amber-700/90 leading-relaxed">
                  Real Cashfree API credentials are not yet configured. The checkout operates in <strong>demo mode</strong> so you can test complete end-to-end activation without charging real money.
                </p>
              </div>

              {/* Cashfree Channels Preview */}
              <div className="space-y-2">
                <span className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Payment Gateway Integration: Cashfree
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                    <Smartphone className="w-5 h-5 text-indigo-600 mx-auto" />
                    <span className="text-xs font-bold text-slate-900 block">UPI Instant</span>
                    <span className="text-[10px] text-slate-400">GPay, PhonePe, QR</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                    <CreditCard className="w-5 h-5 text-indigo-600 mx-auto" />
                    <span className="text-xs font-bold text-slate-900 block">Cards</span>
                    <span className="text-[10px] text-slate-400">Credit / Debit</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                    <Building2 className="w-5 h-5 text-indigo-600 mx-auto" />
                    <span className="text-xs font-bold text-slate-900 block">Net Banking</span>
                    <span className="text-[10px] text-slate-400">50+ Indian Banks</span>
                  </div>
                </div>
              </div>

              {/* Error Message if any */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Demo Action Buttons */}
              <div className="pt-2 space-y-2">
                <Button
                  onClick={() => handleCompletePayment({ simulateFailure: false })}
                  loading={loadingOrder}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-2xs rounded-xl cursor-pointer transition-all active:scale-[0.99]"
                >
                  Pay {formatINR(amount)} via Cashfree (Simulate Demo Success)
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleCompletePayment({ simulateFailure: true })}
                  className="w-full py-2.5 border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Simulate Cashfree Payment Failure (Test Error Handling)
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer Security Badges */}
        <div className="p-3.5 sm:p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cashfree PG Integration • Demo Mode</span>
          </span>
          <span className="font-mono text-[10px]">
            Ready for Sandbox Keys
          </span>
        </div>
      </div>
    </div>
  );
}
