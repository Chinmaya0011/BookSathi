'use client';

import { CreditCard, X, ShieldCheck, Lock } from 'lucide-react';
import { formatINR, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function BookingCheckoutModal({
  isOpen,
  onClose,
  pendingOrder,
  currentFee,
  selectedMethod,
  onSelectMethod,
  onProcessPayment,
  processing,
  error,
}) {
  if (!isOpen || !pendingOrder) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 text-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Secure Payment</h3>
              <p className="text-[11px] text-slate-400 font-medium">Encrypted Checkout Gateway</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        <div className="my-5 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
            Total Payable Consultation Fee
          </span>
          <div className="text-3xl font-black text-slate-900 mt-1 font-mono">
            {formatINR(pendingOrder.payment?.amount || currentFee)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Order Ref: {pendingOrder.payment?.paymentCode || 'PENDING'}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['UPI', 'CARD', 'NETBANKING'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onSelectMethod(m)}
                  className={cn(
                    'py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all text-center cursor-pointer shadow-2xs',
                    selectedMethod === m
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25 ring-2 ring-indigo-600/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-indigo-200'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600">
            ⚡ <strong>Sandbox Simulation:</strong> This invokes the BookSaathi Payment Gateway Adapter. In production, Razorpay / UPI checkout modal seamlessly triggers here.
          </div>

          <div className="space-y-2 pt-2">
            <Button
              onClick={() => onProcessPayment(true)}
              loading={processing}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-black shadow-xl shadow-emerald-600/25 rounded-2xl"
            >
              Simulate Successful Payment ({formatINR(pendingOrder.payment?.amount || currentFee)})
            </Button>
            <button
              type="button"
              disabled={processing}
              onClick={() => onProcessPayment(false)}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 text-xs font-bold hover:bg-rose-50 transition-all cursor-pointer"
            >
              Simulate Failed / Cancelled Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
