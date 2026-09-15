'use client';

import { useState } from 'react';
import {
  Check,
  Image as ImageIcon,
  Sparkles,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Clock,
  Download,
  QrCode,
  Sliders,
  Eye,
  Award,
  Video,
  CheckCheck,
  ArrowRight,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { getProfessionalPublicUrl } from '@/lib/urlHelpers';

export default function BannerDesignSelector({
  profile,
  selectedDesign,
  onSelectDesign,
}) {
  const [showAddress, setShowAddress] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [customTagline, setCustomTagline] = useState('');

  const targetUrl = getProfessionalPublicUrl(profile);

  const designs = [
    {
      id: 'classic-indigo',
      name: 'Midnight Sapphire Clinical (Default)',
      subtitle: 'Premium Navy',
      desc: 'Deep navy-slate gradient with cyan & emerald trust accents and crisp typography.',
      bgClass: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-indigo-500/30 shadow-2xl',
      headerBg: 'border-white/10 bg-white/5',
      taglineBg: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
      titleColor: 'text-white',
      subtitleColor: 'text-sky-400',
      infoBg: 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600',
      avatarRing: 'ring-4 ring-indigo-500/20 border-indigo-400/40 shadow-xl',
      qrBoxClass: 'bg-slate-900/90 text-white border border-indigo-500/30 shadow-xl hover:border-indigo-400/60',
      tagline: 'OFFICIAL APPOINTMENT PORTAL',
      badge: 'Recommended',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
      accentPill: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      footerClass: 'border-white/10 text-slate-400',
      boltColor: 'from-slate-400 via-white to-slate-300 border-slate-500',
      boltCore: 'bg-slate-700',
    },
    {
      id: 'clinical-emerald',
      name: 'Emerald Health & Polyclinic',
      subtitle: 'Modern Medical',
      desc: 'Deep slate-emerald gradient with refreshing mint badges and clean healthcare typography.',
      bgClass: 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white border border-emerald-500/30 shadow-2xl',
      headerBg: 'border-white/10 bg-white/5',
      taglineBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
      titleColor: 'text-white',
      subtitleColor: 'text-emerald-400',
      infoBg: 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600',
      avatarRing: 'ring-4 ring-emerald-500/20 border-emerald-400/40 shadow-xl',
      qrBoxClass: 'bg-slate-900/90 text-white border border-emerald-500/30 shadow-xl hover:border-emerald-400/60',
      tagline: 'INSTANT TOKEN QUEUE',
      badge: 'Clinical',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      accentPill: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      footerClass: 'border-white/10 text-slate-400',
      boltColor: 'from-slate-400 via-white to-slate-300 border-slate-500',
      boltCore: 'bg-slate-700',
    },
    {
      id: 'gold-minimal',
      name: 'Executive Onyx & Gold VIP',
      subtitle: 'Consultant Chambers',
      desc: 'Charcoal onyx palette with champagne gold accents for legal counsels & senior specialists.',
      bgClass: 'bg-gradient-to-br from-slate-950 via-stone-950 to-indigo-950 text-white border border-amber-500/30 shadow-2xl',
      headerBg: 'border-white/10 bg-white/5',
      taglineBg: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
      titleColor: 'text-white',
      subtitleColor: 'text-amber-400',
      infoBg: 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600',
      avatarRing: 'ring-4 ring-amber-500/20 border-amber-400/40 shadow-xl',
      qrBoxClass: 'bg-slate-900/90 text-white border border-amber-500/30 shadow-xl hover:border-amber-400/60',
      tagline: 'VERIFIED PRACTICE',
      badge: 'Executive',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      accentPill: 'bg-amber-600 hover:bg-amber-500 text-white',
      footerClass: 'border-white/10 text-slate-400',
      boltColor: 'from-amber-200 via-white to-amber-300 border-amber-400',
      boltCore: 'bg-amber-700',
    },
    {
      id: 'minimal-frost',
      name: 'Porcelain Clean Minimalist',
      subtitle: 'Daylight Aesthetic',
      desc: 'Crisp porcelain canvas with deep slate typography and sapphire accents.',
      bgClass: 'bg-white text-slate-900 border border-slate-200/90 shadow-xl',
      headerBg: 'border-slate-100 bg-slate-50/70',
      taglineBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
      titleColor: 'text-slate-900',
      subtitleColor: 'text-indigo-600',
      infoBg: 'bg-slate-50/80 border-slate-200/70 text-slate-700 hover:bg-slate-100 hover:border-slate-300',
      avatarRing: 'ring-4 ring-indigo-50 border-indigo-100 shadow-md',
      qrBoxClass: 'bg-slate-50/90 text-slate-900 border border-slate-200/90 shadow-md hover:border-indigo-300',
      tagline: 'DIGITAL APPOINTMENTS',
      badge: 'Minimal',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      accentPill: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      footerClass: 'border-slate-100 text-slate-500',
      boltColor: 'from-slate-200 via-slate-100 to-slate-300 border-slate-300',
      boltCore: 'bg-slate-400',
    },
  ];

  const currentDesign = designs.find((d) => d.id === selectedDesign) || designs[0];

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('banner-preview-svg-qr');
    if (!svgElement) return;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `booksaathi-clinic-banner-${profile?.bookingSlug || 'clinic'}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                Clinic Wall Banner • Photorealistic 3D Preview
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                Waiting Area & Clinic Door
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Premium UV-matte wall board with chrome standoff bolts, customer check-in guide, and instant QR booking.
            </p>
          </div>
        </div>

        {/* Live Controls Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAddress(!showAddress)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer',
              showAddress
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            )}
          >
            Address {showAddress ? '✓' : '✗'}
          </button>
          <button
            type="button"
            onClick={() => setShowPhone(!showPhone)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer',
              showPhone
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            )}
          >
            Helpline {showPhone ? '✓' : '✗'}
          </button>
          <button
            type="button"
            onClick={handleDownloadSVG}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Vector QR</span>
          </button>
        </div>
      </div>

      {/* Realistic 3D Wall Environment with Chrome Standoff Bolts */}
      <div className="relative rounded-3xl p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 border border-slate-300/80 shadow-inner overflow-hidden">
        
        {/* Subtle Clinic Wall Texture Grid */}
        <div 
          className="absolute inset-0 opacity-[0.35] pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}
        />

        {/* 3D Wall Mounted Banner Board */}
        <div className="relative rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:scale-[1.002]">
          
          {/* Banner Canvas Container */}
          <div className={cn('p-6 sm:p-8 lg:p-10 rounded-3xl relative overflow-hidden transition-all duration-200', currentDesign.bgClass)}>
            
            {/* Ambient Lighting Sheen */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* 4 Realistic 3D Chrome Wall Standoff Screws */}
            <div className={cn('absolute top-3.5 left-3.5 sm:top-4 sm:left-4 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr shadow-md flex items-center justify-center z-20 border', currentDesign.boltColor)}>
              <div className={cn('w-1.5 h-1.5 rounded-full', currentDesign.boltCore)} />
            </div>
            <div className={cn('absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr shadow-md flex items-center justify-center z-20 border', currentDesign.boltColor)}>
              <div className={cn('w-1.5 h-1.5 rounded-full', currentDesign.boltCore)} />
            </div>
            <div className={cn('absolute bottom-3.5 left-3.5 sm:bottom-4 sm:left-4 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr shadow-md flex items-center justify-center z-20 border', currentDesign.boltColor)}>
              <div className={cn('w-1.5 h-1.5 rounded-full', currentDesign.boltCore)} />
            </div>
            <div className={cn('absolute bottom-3.5 right-3.5 sm:bottom-4 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr shadow-md flex items-center justify-center z-20 border', currentDesign.boltColor)}>
              <div className={cn('w-1.5 h-1.5 rounded-full', currentDesign.boltCore)} />
            </div>

            {/* 1. TOP HEADER BAR: Distinct Trust Signals & Tagline */}
            <div className={cn('flex flex-wrap items-center justify-between gap-3 pb-4 border-b text-xs px-2', currentDesign.headerBg)}>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="uppercase tracking-wider">BookSaathi Certified Clinic</span>
                </div>
                
                <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider', currentDesign.taglineBg)}>
                  {customTagline || currentDesign.tagline}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 font-medium text-xs text-slate-300">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Digital Token • Zero Counter Queue</span>
              </div>
            </div>

            {/* 2. MAIN BANNER CONTENT: Doctor Photo + Text Details + QR Box (Vertically Centered) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center my-8 px-2">
              
              {/* Photo & Verified Seal (4 cols) */}
              <div className="md:col-span-4 flex justify-center md:justify-start">
                <div className="relative shrink-0 group">
                  {profile?.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile?.name || 'Doctor Photo'}
                      className={cn(
                        'w-36 h-36 sm:w-44 sm:h-44 rounded-2xl object-cover bg-slate-900 transition-transform duration-200 shadow-xl',
                        currentDesign.avatarRing
                      )}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className={cn(
                        'w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-900 flex flex-col items-center justify-center text-white transition-transform duration-200 shadow-xl',
                        currentDesign.avatarRing
                      )}
                    >
                      <span className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-md">
                        {profile?.name ? profile.name.charAt(0).toUpperCase() : 'Dr'}
                      </span>
                      <span className="text-[11px] uppercase tracking-wider font-extrabold text-indigo-200 mt-1">
                        {profile?.profession || 'Doctor'}
                      </span>
                    </div>
                  )}
                  
                  {/* Distinct Holographic Verified Badge */}
                  <div className="absolute -bottom-2.5 -right-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-lg flex items-center gap-1 border-2 border-slate-950 tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    <span>VERIFIED PRACTICE</span>
                  </div>
                </div>
              </div>

              {/* Doctor Details & Credentials (5 cols) */}
              <div className="md:col-span-5 space-y-3.5 text-center md:text-left">
                <div>
                  <h2 className={cn('text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight', currentDesign.titleColor)}>
                    {profile?.name || 'Dr. Rajesh Sharma'}
                  </h2>
                  <p className={cn('text-sm sm:text-base font-semibold mt-1 tracking-wide', currentDesign.subtitleColor)}>
                    {profile?.specialization || profile?.profession || 'MBBS, MD (General Medicine) • Senior Consultant'}
                  </p>
                </div>

                <div className="pt-1 space-y-2 text-xs sm:text-sm">
                  {showAddress && (profile?.address || profile?.city) && (
                    <div className={cn('flex items-center justify-center md:justify-start gap-2.5 px-3.5 py-2 rounded-xl border transition-colors', currentDesign.infoBg)}>
                      <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="font-medium truncate">{[profile?.address, profile?.city].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {showPhone && profile?.phone && (
                    <div className={cn('flex items-center justify-center md:justify-start gap-2.5 px-3.5 py-2 rounded-xl border transition-colors', currentDesign.infoBg)}>
                      <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-medium">Clinic Helpline: {profile.phone}</span>
                    </div>
                  )}
                </div>

                {/* Feature Micro-Interactions Buttons */}
                <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800/90 text-slate-200 border border-slate-700 hover:border-slate-600 hover:bg-slate-700/80 transition-colors shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Instant UPI & Cash</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800/90 text-slate-200 border border-slate-700 hover:border-slate-600 hover:bg-slate-700/80 transition-colors shadow-xs">
                    <Video className="w-3.5 h-3.5 text-indigo-400" />
                    <span>WhatsApp Token</span>
                  </span>
                </div>
              </div>

              {/* QR Code Booking Station (3 cols) */}
              <div className="md:col-span-3 flex justify-center md:justify-end">
                <div className={cn('flex flex-col items-center justify-center p-5 rounded-2xl text-center w-48 sm:w-52 transition-all duration-200 hover:scale-[1.02] shadow-xl', currentDesign.qrBoxClass)}>
                  <span className="text-[11px] font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-slate-200">
                    <Smartphone className="w-4 h-4 text-indigo-400 animate-bounce" />
                    <span>Scan To Book</span>
                  </span>
                  
                  {/* High-contrast QR canvas frame */}
                  <div className="bg-white p-3 rounded-xl shadow-md border border-white/80 inline-block">
                    <QRCodeSVG
                      id="banner-preview-svg-qr"
                      value={targetUrl}
                      size={120}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  
                  <button
                    type="button"
                    className={cn('w-full text-xs font-bold mt-3 py-2 px-3 rounded-xl shadow-md transition-all duration-150 flex items-center justify-center gap-1', currentDesign.accentPill)}
                  >
                    <span>Select Time Slot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-slate-400 font-medium mt-1.5">
                    Instant WhatsApp Slip
                  </span>
                </div>
              </div>

            </div>

            {/* 3. BOTTOM PATIENT GUIDE FOOTER */}
            <div className={cn('pt-4 border-t flex flex-col sm:flex-row items-center justify-between text-xs font-medium gap-2 px-2', currentDesign.footerClass)}>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Scan with Camera, Google Lens, Paytm, PhonePe, or GPay</span>
              </span>
              <span className="font-bold text-slate-200">Direct Doctor Appointment • Instant WhatsApp Token</span>
            </div>

          </div>
        </div>
      </div>

      {/* 4 Selectable Design Option Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {designs.map((d) => {
          const isSelected = selectedDesign === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelectDesign(d.id)}
              className={cn(
                'p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer group',
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-xs font-bold', isSelected ? 'text-white' : 'text-slate-900')}>
                    {d.name}
                  </span>
                  {isSelected ? (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border', d.badgeColor)}>
                      {d.badge}
                    </span>
                  )}
                </div>
                <p className={cn('text-[11px] leading-snug', isSelected ? 'text-slate-300' : 'text-slate-500')}>
                  {d.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}



