'use client';

import { Check, Sparkles, Truck, ShieldCheck, Gift } from 'lucide-react';
import { formatINR, cn } from '@/lib/utils';
import { calculateQrBannerPrice } from '@/lib/qrPricingCalculator';

export default function QrPricingCards({
  plans,
  selectedPlanKey,
  onSelectPlan,
  onOpenReview,
}) {
  const planKeys = ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Select Your SaaS Subscription & Hardware Package</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Every plan includes full BookSaathi Pro SaaS Dashboard access. <strong>6 Months & 1 Year plans include 1x Acrylic QR Standee + 1x Clinic Wall Banner + FREE Express Delivery!</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {planKeys.map((key) => {
          const planMeta = plans[key];
          const pricing = calculateQrBannerPrice(key);
          const isSelected = selectedPlanKey === key;

          return (
            <div
              key={key}
              onClick={() => onSelectPlan(key)}
              className={cn(
                'rounded-3xl p-5 sm:p-6 border-2 flex flex-col justify-between transition-all cursor-pointer relative group',
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xl ring-2 ring-indigo-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60 shadow-xs'
              )}
            >
              {/* Badge top */}
              {planMeta.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                  {planMeta.badge}
                </div>
              )}
              {!planMeta.popular && planMeta.badge && (
                <div className="absolute -top-2.5 right-4 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                  {planMeta.badge}
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-slate-900">{planMeta.title}</h4>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {formatINR(pricing.discountedSubscriptionPrice)}
                  </span>
                  <span className="text-xs text-slate-500">/ {planMeta.durationMonths}mo</span>
                </div>

                {/* Subtitle / Effective monthly rate */}
                <div className="mt-1 text-[11px] text-slate-500">
                  Effective <strong>{formatINR(pricing.effectiveMonthlyRate)}</strong> / month
                </div>

                {/* Free Kit & Delivery Callout */}
                <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1">
                  {pricing.isOrderFeeFree ? (
                    <>
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                        <Gift className="w-3 h-3 text-indigo-600" />
                        <span>1x Standee + 1x Banner FREE</span>
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          <Truck className="w-3 h-3" />
                          <span>100% FREE Courier Delivery</span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500">
                      + ₹{pricing.orderDeliveryFee} Courier Delivery Fee
                    </span>
                  )}
                </div>

                {/* Features */}
                <div className="mt-4 space-y-2 text-xs">
                  {planMeta.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-700 text-[11px]">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Select Button */}
              <div className="mt-6 pt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlan(key);
                    onOpenReview();
                  }}
                  className={cn(
                    'w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer',
                    isSelected
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  )}
                >
                  {isSelected ? 'Proceed to Order' : 'Choose Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
