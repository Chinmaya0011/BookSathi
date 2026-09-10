'use client';

import { X, Truck, ShieldCheck, MapPin, Package, CreditCard } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function QrOrderReviewModal({
  isOpen,
  onClose,
  pricing,
  selectedDesign,
  shippingForm,
  onShippingChange,
  onSubmitOrder,
  submitting,
}) {
  if (!isOpen || !pricing) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Review QR & Banner Order</h3>
              <p className="text-[11px] text-slate-500">Shipping destination & invoice breakdown</p>
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

        <form onSubmit={onSubmitOrder} className="space-y-4 pt-3">
          {/* Transparent Pricing Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Selected Package:</span>
              <span className="text-indigo-700">{pricing.planTitle}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Subscription Subtotal ({pricing.durationMonths} Months):</span>
              <span>{formatINR(pricing.subtotal)}</span>
            </div>
            {pricing.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Plan Discount ({pricing.discountPercent}% Off):</span>
                <span>-{formatINR(pricing.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Courier & Delivery Fee:</span>
              {pricing.isOrderFeeFree ? (
                <span className="text-emerald-700 font-bold">FREE (₹0)</span>
              ) : (
                <span>₹{pricing.orderDeliveryFee}</span>
              )}
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
              <span>Total Payable Amount:</span>
              <span className="text-indigo-700">{formatINR(pricing.finalPayableAmount)}</span>
            </div>
          </div>

          {/* Shipping Address Form */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Clinic / Delivery Shipping Address</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Recipient Doctor / Clinic Name"
                required
                placeholder="Dr. Rajesh Sharma"
                value={shippingForm.recipientName}
                onChange={(e) => onShippingChange('recipientName', e.target.value)}
              />
              <Input
                label="Contact Mobile Number"
                required
                type="tel"
                placeholder="9876543210"
                value={shippingForm.phone}
                onChange={(e) => onShippingChange('phone', e.target.value)}
              />
            </div>

            <Input
              label="Street Address / Clinic Plot Number"
              required
              placeholder="e.g. Plot 42, Saheed Nagar, Near Axis Bank"
              value={shippingForm.street}
              onChange={(e) => onShippingChange('street', e.target.value)}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <Input
                label="City"
                required
                placeholder="Bhubaneswar"
                value={shippingForm.city}
                onChange={(e) => onShippingChange('city', e.target.value)}
              />
              <Input
                label="State"
                required
                placeholder="Odisha"
                value={shippingForm.state}
                onChange={(e) => onShippingChange('state', e.target.value)}
              />
              <Input
                label="PIN Code"
                required
                placeholder="751007"
                value={shippingForm.pincode}
                onChange={(e) => onShippingChange('pincode', e.target.value)}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <Button
              type="submit"
              loading={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              Proceed to Payment ({formatINR(pricing.finalPayableAmount)})
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
