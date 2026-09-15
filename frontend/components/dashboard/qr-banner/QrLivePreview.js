'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Sparkles,
  Smartphone,
  ShieldCheck,
  ExternalLink,
  Phone,
  Truck,
  CheckCircle2,
  Clock,
  Download,
  Zap,
  Check,
  Award,
  ArrowRight,
  Copy,
  Star,
  Printer,
  Sliders,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProfessionalPublicUrl, getProfessionalDisplayUrl } from '@/lib/urlHelpers';

export default function QrLivePreview({ profile, selectedDesign = 'classic-indigo' }) {
  const [standeeTheme, setStandeeTheme] = useState('frost');
  const [baseMaterial, setBaseMaterial] = useState('aluminum'); // 'aluminum' | 'walnut' | 'obsidian'
  const [showPhoto, setShowPhoto] = useState(true);
  const [showFee, setShowFee] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [copied, setCopied] = useState(false);

  const targetUrl = getProfessionalPublicUrl(profile);
  const displayUrl = getProfessionalDisplayUrl(profile);

  const themes = {
    frost: {
      id: 'frost',
      name: 'Crystal Frost Glass',
      tag: 'Minimalist & Clean',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
      plateBg: 'bg-white/95 text-slate-900 border border-slate-200/90 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.18)] backdrop-blur-xl',
      headerTag: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
      doctorNameColor: 'text-slate-900',
      specialtyColor: 'text-indigo-600',
      feePill: 'bg-indigo-50/90 text-indigo-700 border-indigo-200/70',
      qrBg: 'bg-white border-2 border-slate-100 shadow-md',
      accentCta: 'bg-slate-900 hover:bg-indigo-600 text-white',
      footerText: 'text-slate-500',
      bevelEdge: 'border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]',
    },
    midnight: {
      id: 'midnight',
      name: 'Midnight Sapphire Glass',
      tag: 'Executive Navy',
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
      plateBg: 'bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 text-white border border-indigo-500/30 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.8)] backdrop-blur-xl',
      headerTag: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
      doctorNameColor: 'text-white',
      specialtyColor: 'text-sky-400',
      feePill: 'bg-indigo-900/60 text-cyan-300 border-indigo-500/30',
      qrBg: 'bg-white border-2 border-white/90 shadow-xl',
      accentCta: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      footerText: 'text-slate-400',
      bevelEdge: 'border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]',
    },
    emerald: {
      id: 'emerald',
      name: 'Emerald Clinical Glass',
      tag: 'Medical & Wellness',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      plateBg: 'bg-gradient-to-b from-slate-900 via-slate-950 to-emerald-950 text-white border border-emerald-500/30 shadow-[0_30px_60px_-15px_rgba(6,78,59,0.5)] backdrop-blur-xl',
      headerTag: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
      doctorNameColor: 'text-white',
      specialtyColor: 'text-emerald-400',
      feePill: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/30',
      qrBg: 'bg-white border-2 border-white/90 shadow-xl',
      accentCta: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      footerText: 'text-slate-400',
      bevelEdge: 'border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]',
    },
    obsidianGold: {
      id: 'obsidianGold',
      name: 'Obsidian & Gold Glass',
      tag: 'Luxury VIP Chambers',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      plateBg: 'bg-gradient-to-b from-slate-950 via-stone-950 to-stone-900 text-white border border-amber-500/30 shadow-[0_30px_60px_-15px_rgba(120,53,15,0.4)] backdrop-blur-xl',
      headerTag: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
      doctorNameColor: 'text-white',
      specialtyColor: 'text-amber-400',
      feePill: 'bg-stone-900/80 text-amber-300 border-amber-500/30',
      qrBg: 'bg-white border-2 border-white/90 shadow-xl',
      accentCta: 'bg-amber-600 hover:bg-amber-500 text-white',
      footerText: 'text-slate-400',
      bevelEdge: 'border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]',
    },
  };

  const bases = {
    aluminum: {
      id: 'aluminum',
      name: 'Brushed Aerospace Aluminum',
      class: 'bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 border-t border-white/80 shadow-[0_20px_40px_rgba(0,0,0,0.2)]',
      slotGlow: 'bg-slate-500/40',
    },
    walnut: {
      id: 'walnut',
      name: 'Natural Solid Walnut Wood',
      class: 'bg-gradient-to-b from-amber-900 via-stone-800 to-amber-950 border-t border-amber-700/50 shadow-[0_20px_40px_rgba(0,0,0,0.35)]',
      slotGlow: 'bg-amber-500/30',
    },
    obsidian: {
      id: 'obsidian',
      name: 'Matte Jet Black Acrylic',
      class: 'bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-t border-slate-700 shadow-[0_20px_40px_rgba(0,0,0,0.4)]',
      slotGlow: 'bg-indigo-500/30',
    },
  };

  const currentTheme = themes[standeeTheme] || themes.frost;
  const currentBase = bases[baseMaterial] || bases.aluminum;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadStandeeSVG = () => {
    const svgElement = document.getElementById('desk-standee-qr-svg');
    if (!svgElement) return;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `booksaathi-desk-standee-${profile?.bookingSlug || 'qr'}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 lg:p-9 space-y-7">
      
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                3D Acrylic QR Desk Standee Studio
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Included with Kit
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Heavy 8mm laser-cut cast acrylic display with solid weighted base for consultation desks, counters, and reception.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Free Express Courier Delivery Included</span>
          </span>
        </div>
      </div>

      {/* Main Studio Viewport: Photorealistic 3D Stage (Left 7 cols) + Precision Customizer (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: 3D Acrylic Desk Standee Mockup Stage */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-100 via-slate-200/80 to-slate-300/70 border border-slate-300/80 shadow-inner relative overflow-hidden min-h-[540px]">
          
          {/* Studio Floor Perspective & Ambient Lighting */}
          <div 
            className="absolute inset-0 opacity-[0.2] pointer-events-none" 
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #475569 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-white/70 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-72 h-14 bg-slate-950/40 rounded-full blur-2xl pointer-events-none" />

          {/* Standee Assembly Unit */}
          <div className="relative w-full max-w-[310px] my-2 transition-transform duration-300 hover:scale-[1.02] group">
            
            {/* Specular Bevel Glass Edge */}
            <div className={cn('relative rounded-3xl p-6 text-center flex flex-col items-center overflow-hidden transition-all duration-300', currentTheme.plateBg, currentTheme.bevelEdge)}>
              
              {/* Glossy Reflection Sheen (Realistic 45° glass beam) */}
              <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/20 rounded-full blur-xl pointer-events-none" />

              {/* Standee Top Header */}
              <div className="w-full flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 text-[10px] font-black uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="tracking-wide">Direct Desk Booking</span>
                </div>
                <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-extrabold border shadow-2xs', currentTheme.headerTag)}>
                  Official Desk
                </span>
              </div>

              {/* Professional Details */}
              <div className="mt-3 mb-2 flex flex-col items-center">
                {showPhoto && (
                  <div className="relative mb-2">
                    {profile?.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt={profile?.name || 'Professional'}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md bg-slate-900"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white text-xl font-black border-2 border-white shadow-md">
                        {profile?.name ? profile.name.charAt(0).toUpperCase() : 'P'}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm border-2 border-white">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}

                <h4 className={cn('text-base font-black truncate max-w-[250px] tracking-tight leading-tight', currentTheme.doctorNameColor)}>
                  {profile?.name || 'Professional Name'}
                </h4>
                
                <p className={cn('text-xs font-semibold truncate max-w-[250px] mt-0.5', currentTheme.specialtyColor)}>
                  {profile?.specialization || profile?.profession || 'Consultant'}
                </p>

                {showFee && (
                  <div className={cn('mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border', currentTheme.feePill)}>
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>Instant Token Queue • Google Lens / QR</span>
                  </div>
                )}
              </div>

              {/* High-Contrast QR Code Card */}
              <div className={cn('p-3.5 rounded-2xl my-2.5 inline-block transition-transform duration-200 group-hover:scale-105', currentTheme.qrBg)}>
                <QRCodeSVG
                  id="desk-standee-qr-svg"
                  value={targetUrl}
                  size={140}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* Scan Prompt with App Logos */}
              <div className="mt-1 space-y-1">
                <div className="text-xs font-black flex items-center justify-center gap-1.5 text-emerald-500">
                  <Smartphone className="w-3.5 h-3.5 animate-bounce" />
                  <span>Scan to Book Instantly</span>
                </div>
                <p className="text-[10px] opacity-75 font-medium">
                  GPay • Paytm • PhonePe • BHIM • Camera
                </p>
              </div>

              {/* Booking URL / Phone Footer */}
              <div className={cn('mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 w-full text-[9px] font-mono flex items-center justify-between', currentTheme.footerText)}>
                <span className="truncate max-w-[170px]">{displayUrl || 'yourname.booksaathi.in'}</span>
                {showPhone && profile?.phone && (
                  <span className="font-semibold">{profile.phone}</span>
                )}
              </div>

            </div>

            {/* Weighted Solid Stand Base */}
            <div className={cn('relative mx-auto -mt-3.5 w-64 h-7 rounded-2xl border flex items-center justify-center transition-all duration-300', currentBase.class)}>
              <div className={cn('w-44 h-1 rounded-full', currentBase.slotGlow)} />
            </div>

          </div>

          <p className="text-[11px] text-slate-500 font-medium mt-4 text-center">
            8mm Optical Cast Acrylic • Precision Slotted Pedestal • Anti-Scratch Finish
          </p>
        </div>

        {/* Right: Customizer & Controls Panel */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Acrylic Theme Finishes */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
              1. Acrylic Plate Finish
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {Object.values(themes).map((t) => {
                const isSelected = standeeTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setStandeeTheme(t.id)}
                    className={cn(
                      'p-3 rounded-2xl border text-left flex items-center justify-between transition-all duration-150',
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn('w-4 h-4 rounded-full border flex items-center justify-center', isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300')}>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{t.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{t.tag}</span>
                      </div>
                    </div>

                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md border', t.badgeClass)}>
                      {t.id === 'frost' ? 'Minimal' : t.id === 'midnight' ? 'Executive' : t.id === 'emerald' ? 'Clinical' : 'VIP'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Base Material Selection */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
              2. Pedestal Base Material
            </span>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(bases).map((b) => {
                const isSelected = baseMaterial === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBaseMaterial(b.id)}
                    className={cn(
                      'p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1',
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    <span className="text-[11px] font-bold leading-tight">{b.name.split(' ')[0]}</span>
                    <span className="text-[9px] opacity-75">{b.id === 'aluminum' ? 'Metal' : b.id === 'walnut' ? 'Wood' : 'Acrylic'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display Controls */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Visible Elements on Standee</span>
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShowPhoto(!showPhoto)}
                className={cn(
                  'py-1.5 px-2 rounded-xl text-xs font-semibold border text-center transition-all',
                  showPhoto
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                )}
              >
                Photo {showPhoto ? '✓' : '✗'}
              </button>
              <button
                type="button"
                onClick={() => setShowFee(!showFee)}
                className={cn(
                  'py-1.5 px-2 rounded-xl text-xs font-semibold border text-center transition-all',
                  showFee
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                )}
              >
                Badge {showFee ? '✓' : '✗'}
              </button>
              <button
                type="button"
                onClick={() => setShowPhone(!showPhone)}
                className={cn(
                  'py-1.5 px-2 rounded-xl text-xs font-semibold border text-center transition-all',
                  showPhone
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                )}
              >
                Phone {showPhone ? '✓' : '✗'}
              </button>
            </div>
          </div>

          {/* Download & Actions Bar */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadStandeeSVG}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Vector Standee QR (SVG)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-600" />
                <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
              </button>
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                <span>Test Live Page</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}





