'use client';

import { CheckCircle2, Package, Truck, Calendar, Sparkles, Clock, ExternalLink } from 'lucide-react';
import { formatINR, formatDisplayDate } from '@/lib/utils';

export default function QrOrderStatusCard({ order }) {
  if (!order) return null;

  const statusSteps = [
    { key: 'ORDER_PLACED', label: 'Order Confirmed', icon: CheckCircle2 },
    { key: 'IN_PRINTING', label: 'In Printing Queue', icon: Package },
    { key: 'SHIPPED', label: 'Shipped via Express', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered to Clinic', icon: CheckCircle2 },
  ];

  const currentStatusIndex = statusSteps.findIndex((s) => s.key === order.orderStatus);
  const activeIdx = currentStatusIndex >= 0 ? currentStatusIndex : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900">Active QR & Banner Package</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
              {order.planTitle}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Order Reference: <strong className="text-slate-800 font-mono">{order.orderCode}</strong> • Paid on{' '}
            {formatDisplayDate(order.paidAt || order.createdAt)}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-slate-500 block">Subscription Valid Until:</span>
          <span className="text-sm font-black text-indigo-700">
            {formatDisplayDate(order.subscriptionExpiresAt)}
          </span>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="py-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
          Physical Dispatch & Printing Status
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statusSteps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx <= activeIdx;
            const isCurrent = idx === activeIdx;

            return (
              <div
                key={step.key}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-600/20 shadow-xs'
                    : isDone
                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl mx-auto mb-1.5 flex items-center justify-center ${
                    isCurrent
                      ? 'bg-indigo-600 text-white'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold block">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracking and Address Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <span className="font-bold text-slate-800 block">Courier Tracking:</span>
          <p className="text-slate-600">
            Partner: <strong>{order.courierPartner}</strong>
          </p>
          <p className="text-slate-600">
            AWB Number: <strong className="font-mono text-indigo-700">{order.trackingNumber || 'Generating...'}</strong>
          </p>
          <p className="text-slate-500 text-[11px] pt-1">
            Est. Delivery: {formatDisplayDate(order.estimatedDeliveryDate || new Date())}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <span className="font-bold text-slate-800 block">Delivery Address:</span>
          <p className="text-slate-700 font-semibold">{order.shippingAddress?.recipientName}</p>
          <p className="text-slate-500">
            {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
          </p>
          <p className="text-slate-500">Phone: {order.shippingAddress?.phone}</p>
        </div>
      </div>
    </div>
  );
}
