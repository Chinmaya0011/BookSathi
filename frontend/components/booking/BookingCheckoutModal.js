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
  Info,
} from 'lucide-react';
import { formatINR, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { launchCashfreeCheckout } from '@/lib/cashfree';
import { paymentService } from '@/services/payment.service';

/**
 * BookingCheckoutModal
 *
 * Dedicated Cashfree checkout dialog for patient consultations & appointment bookings.
 * Configured exclusively for Cashfree (Demo Mode) when API credentials are absent.
 */
export default function BookingCheckoutModal({
  isOpen,
  onClose,
  pendingOrder,
  currentFee,
  selectedMethod,
  onSelectMethod,
  onProcessPayment,
  onPaymentSuccess,
  processing,
  error,
}) {
  const [stage, setStage] = useState('IDLE'); // 'IDLE' | 'OPENING_CASHFREE' | 'AWAITING_PAYMENT' | 'VERIFYING' | 'SUCCESS' | 'FAILED'
  const [stageError, setStageError] = useState(null);
  const [isLaunchingCheckout, setIsLaunchingCheckout] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStage('IDLE');
      setStageError(null);
    }
  }, [isOpen, pendingOrder]);

  if (!isOpen || !pendingOrder) return null;

  const orderAmount = pendingOrder.payment?.amount || pendingOrder.appointment?.fee || currentFee;
  const orderId = pendingOrder.orderId || pendingOrder.payment?.gatewayOrderId || pendingOrder.payment?.paymentCode;
  const paymentSessionId = pendingOrder.paymentSessionId || pendingOrder.payment?.paymentSessionId;
  const customerName = pendingOrder.appointment?.customerName || 'Customer';
  const serviceName = pendingOrder.appointment?.appointmentTypeName || 'Consultation';
  const isDemo = pendingOrder.isDemo || pendingOrder.payment?.isDemo || (orderId && orderId.startsWith('cf_demo_ord_')) || (paymentSessionId && (paymentSessionId.startsWith('session_demo_') || paymentSessionId.startsWith('session_mock_')));

  /**
   * Launch Cashfree Checkout or Simulate Demo Payment
   */
  const handleLaunchCashfree = async ({ simulateFailure = false } = {}) => {
    if (isLaunchingCheckout || stage === 'VERIFYING') return;
    setIsLaunchingCheckout(true);
    setStage('OPENING_CASHFREE');
    setStageError(null);

    if (simulateFailure) {
      setStage('FAILED');
      setStageError('Payment simulation was cancelled or declined. (Cashfree Demo Failure Test)');
      setIsLaunchingCheckout(false);
      return;
    }

    try {
      if (!paymentSessionId && !orderId) {
        throw new Error('Payment Session ID not found. Please retry creating the order.');
      }

      // If demo session, execute fast demonstration flow
      if (
        isDemo ||
        paymentSessionId?.startsWith('session_demo_') ||
        paymentSessionId?.startsWith('session_mock_') ||
        pendingOrder.isSimulated
      ) {
        setStage('VERIFYING');
        // Brief simulated network latency
        await new Promise((r) => setTimeout(r, 800));

        // Call verification endpoint
        const verifyRes = await paymentService.verifyPayment({
          orderId,
          paymentId: pendingOrder.payment?._id,
          gatewayPaymentId: pendingOrder.payment?.gatewayPaymentId,
        });

        const verifiedData = verifyRes.data || {};
        const isSuccessful =
          verifiedData.payment?.status === 'SUCCESS' ||
          verifiedData.payment?.status === 'DEMO_SUCCESS' ||
          verifiedData.appointment?.paymentStatus === 'PAID' ||
          verifiedData.appointment?.paymentStatus === 'DEMO_PAID' ||
          verifiedData.isPaid;

        if (isSuccessful) {
          setStage('SUCCESS');
          if (onPaymentSuccess) {
            await onPaymentSuccess({ ...verifiedData, isDemo: true });
          } else if (onProcessPayment) {
            await onProcessPayment(true);
          }
          return;
        } else {
          setStage('FAILED');
          setStageError('Demo verification could not be completed.');
          return;
        }
      }

      // Non-demo genuine Cashfree session
      setStage('AWAITING_PAYMENT');
      const checkoutRes = await launchCashfreeCheckout({
        paymentSessionId,
        redirectTarget: '_modal',
      });

      if (checkoutRes?.isSimulated) {
        setStage('VERIFYING');
        if (onProcessPayment) {
          await onProcessPayment(true);
        }
        return;
      }

      setStage('VERIFYING');

      // Poll/Verify backend server status
      let verified = false;
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const statusRes = await paymentService.getOrderStatus(orderId);
          if (
            statusRes.data?.status === 'SUCCESS' ||
            statusRes.data?.status === 'DEMO_SUCCESS' ||
            statusRes.data?.isPaid
          ) {
            verified = true;
            setStage('SUCCESS');
            if (onPaymentSuccess) {
              await onPaymentSuccess(statusRes.data);
            } else if (onProcessPayment) {
              await onProcessPayment(true);
            }
            break;
          } else if (statusRes.data?.status === 'FAILED' || statusRes.data?.status === 'DEMO_FAILED') {
            setStage('FAILED');
            setStageError('Payment failed or was cancelled by user.');
            break;
          }
        } catch (pollErr) {
          console.warn('Payment status polling error:', pollErr.message);
        }
        await new Promise((r) => setTimeout(r, 1500));
      }

      if (!verified && stage !== 'FAILED') {
        const verifyRes = await paymentService.verifyPayment({
          orderId,
          paymentId: pendingOrder.payment?._id,
          gatewayPaymentId: pendingOrder.payment?.gatewayPaymentId,
        });

        const status = verifyRes.data?.payment?.status;
        if (status === 'SUCCESS' || status === 'DEMO_SUCCESS') {
          setStage('SUCCESS');
          if (onPaymentSuccess) {
            await onPaymentSuccess(verifyRes.data);
          } else if (onProcessPayment) {
            await onProcessPayment(true);
          }
        } else {
          setStage('FAILED');
          setStageError('Payment confirmation pending or failed.');
        }
      }
    } catch (err) {
      console.error('Cashfree launch error:', err);
      setStage('FAILED');
      setStageError(err.message || 'Could not launch Cashfree Checkout. Please retry.');
    } finally {
      setIsLaunchingCheckout(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 animate-in zoom-in-95 text-slate-900 relative overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">Cashfree Payments</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold uppercase tracking-wider">
                  Demo Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Official Gateway • Demonstration Sandbox
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={stage === 'VERIFYING' || processing}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {(error || stageError) && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{error || stageError}</p>
              <p className="text-[11px] font-normal text-rose-600/90 mt-0.5">
                You can retry the simulated payment or choose another action.
              </p>
            </div>
          </div>
        )}

        {/* Order Fee Summary */}
        <div className="my-5 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-violet-50/50 to-slate-50 border border-indigo-100 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider block">
                Total Consultation Fee
              </span>
              <div className="text-3xl font-black text-slate-900 mt-0.5 font-mono">
                {formatINR(orderAmount)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                Service
              </span>
              <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[160px]">
                {serviceName}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-indigo-100/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Ref: {orderId || 'PENDING'}</span>
            <span className="text-slate-600 font-sans font-medium">Patient: {customerName}</span>
          </div>
        </div>

        {/* Demo Mode Notice */}
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Cashfree Demo Environment Active</span>
            <p className="text-[11px] text-amber-700/90 mt-0.5">
              Live Cashfree credentials are not configured. Test the payment flow in simulation mode without charging real funds.
            </p>
          </div>
        </div>

        {/* Dynamic Stage Views */}
        {stage === 'VERIFYING' ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-sm animate-spin">
              <RefreshCw className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Verifying Payment with Server</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Securely verifying signature and transaction status with Cashfree demo engine...
              </p>
            </div>
          </div>
        ) : stage === 'AWAITING_PAYMENT' ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Cashfree Checkout Active</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Complete your payment in the popup window. If closed, click below to check status.
              </p>
            </div>
            <Button
              onClick={() => handleLaunchCashfree({ simulateFailure: false })}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl"
            >
              Re-open Cashfree Checkout / Check Status
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cashfree Channels Preview */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                <Smartphone className="w-5 h-5 text-indigo-600 mx-auto" />
                <span className="text-[11px] font-extrabold text-slate-800 block">UPI Instant</span>
                <span className="text-[9px] text-slate-400 block font-medium">GPay, PhonePe, Paytm</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                <CreditCard className="w-5 h-5 text-indigo-600 mx-auto" />
                <span className="text-[11px] font-extrabold text-slate-800 block">Cards</span>
                <span className="text-[9px] text-slate-400 block font-medium">Visa, MC, RuPay</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                <Building2 className="w-5 h-5 text-indigo-600 mx-auto" />
                <span className="text-[11px] font-extrabold text-slate-800 block">Net Banking</span>
                <span className="text-[9px] text-slate-400 block font-medium">50+ Indian Banks</span>
              </div>
            </div>

            {/* Action Buttons: Demo Success & Demo Failure */}
            <div className="pt-2 space-y-2">
              <Button
                onClick={() => handleLaunchCashfree({ simulateFailure: false })}
                loading={isLaunchingCheckout || stage === 'OPENING_CASHFREE' || processing}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-black shadow-xl shadow-emerald-600/25 rounded-2xl cursor-pointer"
              >
                Pay {formatINR(orderAmount)} via Cashfree (Simulate Demo Success)
              </Button>

              <Button
                variant="outline"
                onClick={() => handleLaunchCashfree({ simulateFailure: true })}
                disabled={isLaunchingCheckout || processing}
                className="w-full py-2.5 border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-2xl cursor-pointer"
              >
                Simulate Payment Failure (Test Error Handling)
              </Button>
            </div>
          </div>
        )}

        {/* Security Trust Badges */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cashfree Gateway Integration</span>
          </span>
          <span className="font-mono text-[10px]">Demo Mode • Ready for Sandbox Keys</span>
        </div>
      </div>
    </div>
  );
}
