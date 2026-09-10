'use client';

import { CreditCard, X } from 'lucide-react';
import { formatINR, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

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
  if (!isOpen || !pendingOrder) return null;

  const totalAmount = pendingOrder.pricingBreakdown?.finalPayableAmount || 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Checkout: QR & Banner</h3>
              <p className="text-[11px] text-slate-400">Order Ref: {pendingOrder.orderCode}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="my-5 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 text-center">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            Total Payable Amount
          </span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">
            {formatINR(totalAmount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Package: {pendingOrder.planTitle}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['UPI', 'CARD', 'NETBANKING'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onSelectPaymentMethod(m)}
                  className={cn(
                    'py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer',
                    paymentMethod === m
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            ⚡ <strong>Testing Notice:</strong> This simulation triggers instant order verification and queues physical printing of your Acrylic Standee & Vinyl Banner.
          </div>

          <div className="space-y-2 pt-2">
            <Button
              onClick={() => onProcessPayment(true)}
              loading={processing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/25"
            >
              Simulate Successful Payment ({formatINR(totalAmount)})
            </Button>
            <button
              type="button"
              disabled={processing}
              onClick={() => onProcessPayment(false)}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-all cursor-pointer"
            >
              Simulate Failed / Cancelled Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
