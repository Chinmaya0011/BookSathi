'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Download,
  CalendarPlus,
  Share2,
  RefreshCw,
  Copy,
  Check,
  Building2,
  Calendar,
  UserCheck,
  Sparkles,
  MessageCircle,
  Repeat,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { formatINR, format12Hour, formatDisplayDate, formatTimeUntil } from '@/lib/utils';

export default function BookingSuccessView({
  confirmedBooking,
  confirmedPayment,
  profile,
  currentFee,
  downloadingPdf,
  onDownloadPdf,
  icsDownloadUrl,
  whatsappShareUrl,
  onBookAnother,
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#10b981', '#38bdf8', '#f59e0b'],
      });
    } catch (e) {
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

  const bookingDate =
    confirmedBooking.date || confirmedBooking.appointmentDate || confirmedBooking.dateString;

  // Feature 2: Time-until-next-appointment (client-side computed)
  const timeUntil = formatTimeUntil(bookingDate, confirmedBooking.startTime);

  // Custom client WhatsApp confirmation message
  const clientWaUrl =
    whatsappShareUrl ||
    (profile?.phone
      ? `https://wa.me/91${profile.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
          `Hello ${profile.name}, I have confirmed my appointment for ${formatDisplayDate(
            bookingDate
          )} at ${format12Hour(confirmedBooking.startTime)} (Ref: ${confirmedBooking.appointmentCode}).`
        )}`
      : null);

  return (
    <div className="p-6 sm:p-9 text-center space-y-6 animate-in zoom-in-95 duration-200">
      {/* Celebration Icon & Header */}
      <div className="space-y-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-400/20">
          <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11 stroke-[2.5]" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold border border-emerald-500/20 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Appointment Booked Successfully</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            You're All Set!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Your appointment is locked with <strong className="text-slate-800">{profile?.name}</strong>.
          </p>
        </div>
      </div>

      {/* Prominent Holographic Reference Token Card */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 text-white max-w-md mx-auto shadow-2xl border border-indigo-500/30 flex items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="text-left relative z-10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 block">
            Appointment Token
          </span>
          <span className="text-xl sm:text-2xl font-black tracking-widest font-mono text-white block mt-0.5">
            {confirmedBooking.appointmentCode || 'BOOKED'}
          </span>
        </div>

        {/* Feature 4: Copy-to-clipboard button with inline "Copied!" confirmation */}
        <button
          type="button"
          onClick={handleCopyCode}
          className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-300" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Structured Confirmation Details Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-50/90 border border-slate-200/90 max-w-md mx-auto text-left space-y-3 shadow-xs">
        <div className="space-y-2.5 text-xs">
          {/* Feature 9: Day of week label (formatDisplayDate) + Feature 2: Time-until (e.g. in 3 hours) */}
          <div className="flex items-start justify-between pb-2.5 border-b border-slate-200/70 gap-2">
            <span className="text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Date & Time:</span>
            </span>
            <div className="text-right">
              <span className="font-bold text-slate-900 block">
                {formatDisplayDate(bookingDate)} at {format12Hour(confirmedBooking.startTime)}
              </span>
              {timeUntil && (
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                  {timeUntil}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
            <span className="text-slate-500 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Professional:</span>
            </span>
            <span className="font-bold text-slate-900">{profile?.name}</span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Consultation Fee:</span>
            </span>
            <span className="font-bold text-slate-900">
              {formatINR(currentFee || confirmedBooking.fee || 500)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Status:</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
              BOOKED
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action: WhatsApp Confirmation */}
      <div className="max-w-md mx-auto space-y-3 pt-1">
        {clientWaUrl && (
          <a
            href={clientWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Open in WhatsApp & Save Details</span>
          </a>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          {/* Calendar Download */}
          {icsDownloadUrl && (
            <a
              href={icsDownloadUrl}
              download={`appointment-${confirmedBooking.appointmentCode}.ics`}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 active:scale-95 transition-all"
            >
              <CalendarPlus className="w-4 h-4 text-indigo-600" />
              <span>Add to Calendar</span>
            </a>
          )}

          {/* PDF Download */}
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all active:scale-95 cursor-pointer"
          >
            {downloadingPdf ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{downloadingPdf ? 'Generating...' : 'PDF Slip'}</span>
          </button>
        </div>

        {/* 1-Tap Book Again button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onBookAnother}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>1-Tap Book Again</span>
          </button>

          <span className="text-slate-300">•</span>

          <a
            href="/lookup"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            View My Bookings
          </a>
        </div>
      </div>
    </div>
  );
}
