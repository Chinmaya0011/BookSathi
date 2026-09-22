'use client';

import {
  Percent,
  Smartphone,
  Clock,
  QrCode,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Users,
} from 'lucide-react';

export default function TrustBar() {
  const metrics = [
    {
      stat: '0%',
      label: 'Platform Commission',
      desc: '100% of your consultation fee goes directly to your bank account via UPI',
      icon: Percent,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200/80',
    },
    {
      stat: 'Zero App',
      label: 'Client Experience',
      desc: 'Clients book in 30 seconds via WhatsApp or Web without any app downloads',
      icon: Smartphone,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200/80',
    },
    {
      stat: 'Live Tokens',
      label: 'Real-Time Queue',
      desc: 'Instant digital OPD tokens with live status updates, wait times & walk-ins',
      icon: QrCode,
      color: 'text-violet-600 bg-violet-50 border-violet-200/80',
    },
    {
      stat: '< 2 Mins',
      label: 'Practice Onboarding',
      desc: 'Get your branded booking link, UPI QR & practice hours running instantly',
      icon: Zap,
      color: 'text-amber-600 bg-amber-50 border-amber-200/80',
    },
  ];

  return (
    <section className="py-10 sm:py-14 bg-white border-y border-slate-200/70 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 hover:bg-white transition-all shadow-2xs group flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight">
                      {item.stat}
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {item.label}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust Badges Strip with Supported Payment Apps & Safety */}
        <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold text-[11px] border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Direct UPI Settlement
            </span>
            <span>Compatible with all Indian UPI Apps:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 font-bold text-[11px] text-slate-700">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">Google Pay</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">PhonePe</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">Paytm UPI</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">BHIM UPI</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">Any Banking App</span>
          </div>
        </div>

      </div>
    </section>
  );
}
