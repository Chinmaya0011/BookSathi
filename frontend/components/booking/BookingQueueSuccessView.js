'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Ticket,
  Users,
  Clock,
  Download,
  Share2,
  Copy,
  Check,
  Building2,
  Calendar,
  Sparkles,
  MessageCircle,
  Repeat,
  RefreshCw,
  Bell,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { formatINR, formatDisplayDate } from '@/lib/utils';

export default function BookingQueueSuccessView({
  confirmedBooking,
  confirmedPayment,
  profile,
  currentFee,
  downloadingPdf,
  onDownloadPdf,
  icsDownloadUrl,
  whatsappShareUrl,
  onBookAnother,
  queueStatus,
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#6366f1', '#8b5cf6', '#10b981', '#38bdf8', '#f59e0b'],
      });
    } catch {
      // Graceful fallback
    }
  }, []);

  if (!confirmedBooking) return null;

  const handleCopyCode = () => {
    if (confirmedBooking.appointmentCode) {
      navigator.clipboard.writeText(confirmedBooking.appointmentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const bookingDate = confirmedBooking.date || confirmedBooking.dateString;
  const tokenNumber = confirmedBooking.queueNumber || '—';
  const currentCalling = queueStatus?.currentCallingNumber ?? 0;
  const isNowCalling = currentCalling === Number(tokenNumber);
  const peopleAhead = Math.max(0, Number(tokenNumber) - Math.max(1, currentCalling) - (isNowCalling ? 0 : 0));
  const estimatedWait = confirmedBooking.estimatedWaitMinutes || (peopleAhead * (profile?.queueSettings?.estimatedServiceTimeMinutes || 15));

  const clientWaUrl =
    whatsappShareUrl ||
    (profile?.phone
      ? `https://wa.me/91${profile.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
          `Hello ${profile.name}, I have received my Queue Token #${tokenNumber} for ${formatDisplayDate(
            bookingDate
          )} (Ref: ${confirmedBooking.appointmentCode}).`
        )}`
      : null);

  return (
    <div className="p-6 sm:p-9 text-center space-y-6 animate-in zoom-in-95 duration-200">
      {/* Celebration Header */}
      <div className="space-y-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/25 ring-4 ring-indigo-500/15">
          <Ticket className="w-9 h-9 sm:w-11 sm:h-11 stroke-[2]" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Queue Token Issued Successfully</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            You're in the Live Queue!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Your live token has been allocated with <strong className="text-slate-800">{profile?.name}</strong>.
          </p>
        </div>
      </div>

      {/* Massive Digital Token Pass Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 shadow-xl border border-indigo-500/30 max-w-md mx-auto">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 block">
                {profile?.businessName || profile?.name}
              </span>
              <span className="text-xs text-slate-400 font-semibold block">
                Live Token Pass • {formatDisplayDate(bookingDate)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isNowCalling ? 'CALLED' : 'ACTIVE'}</span>
            </div>
          </div>

          {/* Token Big Badge */}
          <div className="py-2">
            <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
              Your Token Number
            </span>
            <div className="inline-flex items-center justify-center min-w-[140px] px-6 py-2 rounded-3xl bg-white/10 border border-white/20 shadow-inner backdrop-blur-md">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                #{tokenNumber}
              </span>
            </div>
          </div>

          {/* Live Queue Progress Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 backdrop-blur-xs">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                Now Serving
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5 block">
                {currentCalling > 0 ? `#${currentCalling}` : '—'}
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 backdrop-blur-xs">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                Ahead of You
              </span>
              <span className="text-base sm:text-lg font-black text-white font-mono mt-0.5 block">
                {peopleAhead}
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 backdrop-blur-xs">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                Est. Wait
              </span>
              <span className="text-base sm:text-lg font-black text-amber-400 font-mono mt-0.5 block">
                {estimatedWait > 0 ? `~${estimatedWait}m` : '0m'}
              </span>
            </div>
          </div>

          {/* Booking Ref Code */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-white/10">
            <span className="text-[11px] font-mono">Ref: {confirmedBooking.appointmentCode || 'CONFIRMED'}</span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-white font-bold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-indigo-300" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Structured Details Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-3 shadow-xs">
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-indigo-600" />
              <span>Token Number:</span>
            </span>
            <span className="font-mono font-black text-slate-900 text-sm">#{tokenNumber}</span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Booking Date:</span>
            </span>
            <span className="font-bold text-slate-900">{formatDisplayDate(bookingDate)}</span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Consultation Fee:</span>
            </span>
            <span className="font-bold text-slate-900 font-mono">
              {formatINR(currentFee || confirmedBooking.fee || 500)}
            </span>
          </div>

          {profile?.address && (
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Location:</span>
              </span>
              <span className="font-semibold text-slate-800 text-right text-[11px] max-w-[200px]">
                {profile.address}, {profile.city}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="max-w-md mx-auto space-y-3 pt-1">
        {clientWaUrl && (
          <a
            href={clientWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Save Token on WhatsApp</span>
          </a>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-all active:scale-95 cursor-pointer"
          >
            {downloadingPdf ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{downloadingPdf ? 'Generating...' : 'Download Pass'}</span>
          </button>

          <button
            type="button"
            onClick={onBookAnother}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all active:scale-95 cursor-pointer"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Get Another Token</span>
          </button>
        </div>

        <div className="pt-2 text-center">
          <a
            href="/lookup"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Looking for previous bookings? Find by phone number →
          </a>
        </div>
      </div>
    </div>
  );
}
