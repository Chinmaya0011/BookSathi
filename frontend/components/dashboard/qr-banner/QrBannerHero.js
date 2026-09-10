'use client';

import { Sparkles, QrCode, Truck, ShieldCheck, Check, Zap, Layers, Award } from 'lucide-react';

export default function QrBannerHero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white border border-indigo-500/20 shadow-2xl">
      {/* Ambient Lighting Gradients */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-bl from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Geometric grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}
      />

      <div className="relative z-10 max-w-4xl space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Clinic Hardware & Official Merchandise Kit</span>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Truck className="w-3.5 h-3.5" />
            <span>100% Free Express Shipping in India</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
          Turn Walk-in Footfall Into{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
            Instant Self-Bookings & Payments
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
          Upgrade your practice with laser-engraved 3D Acrylic QR Desk Standees and UV-resistant Matte Wall Banners. Patients simply scan with Google Lens, Paytm, PhonePe, or Camera to book tokens and pay directly with zero reception queue chaos.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">3D Acrylic Desk Standee</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <Check className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-semibold">Clinic Matte Wall Banner</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <Check className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-semibold">High-Res Vector Assets</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Official QR Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}

