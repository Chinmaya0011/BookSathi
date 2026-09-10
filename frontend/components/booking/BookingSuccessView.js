'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Download,
  CalendarPlus,
  Share2,
  RefreshCw,
  Receipt,
  Navigation,
  Copy,
  Check,
  Building2,
  Calendar,
  Clock,
  UserCheck,
} from 'lucide-react';
import { formatINR, format12Hour, formatDisplayDate } from '@/lib/utils';

export default function BookingSuccessView({
  confirmedBooking,
  confirmedPayment,
  profile,
  currentFee,
  downloadingPdf,
  onDownloadPdf,
  icsDownloadUrl,
  whatsappShareUrl,
  onOpenInvoice,
  onBookAnother,
}) {
  const [copied, setCopied] = useState(false);

  if (!confirmedBooking) return null;

  const handleCopyCode = () => {
    if (confirmedBooking.appointmentCode) {
      navigator.clipboard.writeText(confirmedBooking.appointmentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 sm:p-10 text-center space-y-6 animate-in zoom-in-95 duration-200">
      {/* Celebration Icon */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-400/20">
        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
      </div>

      <div>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold border border-emerald-500/20 mb-2">
          ✓ Booking Confirmed & Reserved
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Appointment Scheduled!
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
          Your consultation slot is locked with <strong className="text-slate-800">{profile?.name}</strong>. Please save your reference token below.
        </p>
      </div>

      {/* Prominent Reference Token Card with 1-Click Copy */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-950 to-slate-900 text-white max-w-md mx-auto shadow-xl flex items-center justify-between gap-3">
        <div className="text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 block">
            Booking Reference Token
          </span>
          <span className="text-xl sm:text-2xl font-black tracking-widest font-mono text-white block mt-0.5">
            {confirmedBooking.appointmentCode || 'CONFIRMED'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all active:scale-95 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-300" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>



      {/* Confirmation Details Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-50/90 border border-slate-200 max-w-md mx-auto text-left space-y-3 shadow-xs">
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Date & Time:</span>
            </span>
            <span className="font-bold text-slate-900">
              {formatDisplayDate(confirmedBooking.date || confirmedBooking.appointmentDate || confirmedBooking.dateString)} at {format12Hour(confirmedBooking.startTime)}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Service:</span>
            </span>
            <span className="font-bold text-slate-900">
              {confirmedBooking.appointmentTypeName || 'General Consultation'}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Client Name:</span>
            </span>
            <span className="font-bold text-slate-900">
              {confirmedBooking.customerName} ({confirmedBooking.customerPhone})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Payment Mode:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
              {confirmedBooking.paymentStatus === 'PAID' ? 'PAID ONLINE' : 'PAY AT VENUE'} ({formatINR(confirmedBooking.fee || currentFee)})
            </span>
          </div>

          {profile?.address && (
            <div className="pt-2.5 border-t border-slate-200 text-[11px] space-y-1">
              <span className="text-slate-500 font-semibold block">Clinic / Office Venue:</span>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                <span className="font-medium text-slate-800">
                  {profile.address}, {profile.city}
                </span>
                {profile.googleMapUrl && (
                  <a
                    href={profile.googleMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline shrink-0"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Open in Google Maps</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cohesive Action Buttons: PDF Download, Calendar, WhatsApp */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 max-w-md sm:max-w-lg mx-auto w-full">
        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={downloadingPdf}
          className="inline-flex items-center justify-center gap-2 h-12 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/25 active:scale-[0.98] transition-all disabled:opacity-70 cursor-pointer"
        >
          {downloadingPdf ? (
            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
          ) : (
            <Download className="w-4 h-4 shrink-0 text-indigo-200" />
          )}
          <span className="truncate">Download PDF Slip</span>
        </button>

        <a
          href={icsDownloadUrl}
          download={`BookSaathi-${confirmedBooking.appointmentCode || 'appointment'}.ics`}
          className="inline-flex items-center justify-center gap-2 h-12 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-bold border border-slate-200 hover:border-slate-300 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
        >
          <CalendarPlus className="w-4 h-4 shrink-0 text-indigo-600" />
          <span className="truncate">Add to Calendar</span>
        </a>

        <a
          href={whatsappShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 h-12 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4 shrink-0 text-emerald-200" />
          <span className="truncate">Share WhatsApp</span>
        </a>
      </div>

      {/* Online tax receipt */}
      {(confirmedPayment || confirmedBooking.paymentId) && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onOpenInvoice}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>View & Print Official GST Receipt</span>
          </button>
        </div>
      )}

      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBookAnother}
          className="text-xs font-bold text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          ← Book another consultation appointment
        </button>
      </div>
    </div>
  );
}
