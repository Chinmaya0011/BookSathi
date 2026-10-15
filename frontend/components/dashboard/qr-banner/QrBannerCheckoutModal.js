'use client';

import { useState } from 'react';
import { CreditCard, X, ShieldCheck, Lock, Smartphone, Building2, Info, AlertTriangle } from 'lucide-react';
import { formatINR, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { launchCashfreeCheckout } from '@/lib/cashfree';

/**
 * QrBannerCheckoutModal
 *
 * Dedicated Cashfree checkout dialog for clinic QR Banner physical kits.
 * Exclusively integrated with Cashfree in Demo Mode.
 */
export default function QrBannerCheckoutModal({
  isOpen,
  onClose,
  pendingOrder,
  paymentMethod,
  onSelectPaymentMethod,
  onProcessPayment,
  processing,
  error,
}) {
  const [isLaunchingCashfree, setIsLaunchingCashfree] = useState(false);
  const [localError, setLocalError] = useState(null);

  if (!isOpen || !pendingOrder) return null;

  const totalAmount = pendingOrder.pricingBreakdown?.finalPayableAmount || 0;
  const paymentSessionId = pendingOrder.paymentSessionId;
  const isDemo = pendingOrder.isDemo ?? true;

  const handlePayWithCashfree = async ({ simulateFailure = false } = {}) => {
    if (isLaunchingCashfree) return;
    setIsLaunchingCashfree(true);
    setLocalError(null);

    if (simulateFailure) {
      setLocalError('Payment simulation was declined or cancelled. (Cashfree Demo Failure Test)');
      setIsLaunchingCashfree(false);
      return;
    }

    try {
      // If genuine session exists (non-demo), launch Cashfree JS SDK
      if (
        paymentSessionId &&
        !paymentSessionId.startsWith('session_demo_') &&
        !paymentSessionId.startsWith('session_mock_')
      ) {
        await launchCashfreeCheckout({
          paymentSessionId,
          redirectTarget: '_modal',
        });
      } else {
        // Fast demonstration latency
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // Complete order on backend via demo flow
      await onProcessPayment(true);
    } catch (err) {
      console.error('Cashfree QR Banner error:', err);
      setLocalError(err.message || 'Payment could not be completed with Cashfree.');
    } finally {
      setIsLaunchingCashfree(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 text-slate-900 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">QR Kit Checkout</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold uppercase tracking-wider">
                  Demo Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Order Ref: {pendingOrder.orderCode}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {(error || localError) && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error || localError}</span>
          </div>
        )}

        {/* Amount Summary */}
        <div className="my-5 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
            Total Payable Amount
          </span>
          <div className="text-3xl font-black text-slate-900 mt-1 font-mono">
            {formatINR(totalAmount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Package: {pendingOrder.planTitle}
          </div>
        </div>

        {/* Demo Mode Notice Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Cashfree Sandbox Demo Active</span>
            <p className="text-[11px] text-amber-700/90 mt-0.5">
              Live Cashfree credentials are not configured. Test order checkout without charging real funds.
            </p>
          </div>
        </div>

        {/* Cashfree Channels Preview */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Payment Gateway Integration: Cashfree
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <Smartphone className="w-4 h-4 text-indigo-600 mx-auto" />
                <span className="text-[10px] font-bold text-slate-800 block">UPI Instant</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <CreditCard className="w-4 h-4 text-indigo-600 mx-auto" />
                <span className="text-[10px] font-bold text-slate-800 block">Cards</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <Building2 className="w-4 h-4 text-indigo-600 mx-auto" />
                <span className="text-[10px] font-bold text-slate-800 block">Net Banking</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <Button
              onClick={() => handlePayWithCashfree({ simulateFailure: false })}
              loading={isLaunchingCashfree || processing}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-black shadow-xl shadow-emerald-600/25 rounded-2xl cursor-pointer"
            >
              Pay {formatINR(totalAmount)} with Cashfree (Simulate Demo Success)
            </Button>

            <Button
              variant="outline"
              onClick={() => handlePayWithCashfree({ simulateFailure: true })}
              disabled={isLaunchingCashfree || processing}
              className="w-full py-2.5 border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-2xl cursor-pointer"
            >
              Simulate Payment Failure (Test Error Handling)
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cashfree PG Integration</span>
          </span>
          <span>Demo Mode</span>
        </div>
      </div>
    </div>
  );
}
