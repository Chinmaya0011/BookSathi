'use client';

import {
  Calendar,
  Clock,
  User,
  Phone,
  MessageSquare,
  FileText,
  CreditCard,
  Building,
  CheckCircle2,
  Play,
  UserCheck,
  CalendarCheck,
  AlertCircle,
  ExternalLink,
  Edit3,
  X,
  XCircle,
  Tag,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { format12Hour, formatDisplayDate, formatINR } from '@/lib/utils';
import { toast } from 'sonner';

export default function CalendarAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onStatusChange,
  onOpenReschedule,
  onOpenNotes,
  onOpenCancel,
  onOpenClientDrawer,
}) {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!appointment) return null;

  const isCompleted = ['DONE', 'COMPLETED'].includes(appointment.status);
  const isCancelled = ['CANCELLED', 'REJECTED', 'NO_SHOW'].includes(appointment.status);
  const isLive = ['IN_PROGRESS', 'WAITING', 'ARRIVED'].includes(appointment.status);

  // Phone cleaning for WhatsApp link
  const cleanPhone = (appointment.customerPhone || '').replace(/\D/g, '');
  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
    `Hello ${appointment.customerName}, this is regarding your appointment (${appointment.appointmentCode}) on ${formatDisplayDate(
      appointment.dateString
    )} at ${format12Hour(appointment.startTime)}.`
  )}`;

  const handleCopyCode = () => {
    if (appointment.appointmentCode) {
      navigator.clipboard.writeText(appointment.appointmentCode);
      setCopiedCode(true);
      toast.success('Booking code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <span className="font-black text-slate-900">Appointment Details</span>
          <button
            onClick={handleCopyCode}
            title="Click to copy booking code"
            className="group flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
          >
            <span>{appointment.appointmentCode}</span>
            {copiedCode ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3 text-indigo-400 group-hover:text-indigo-700" />
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Header Status Bar */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge status={appointment.status} />
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                appointment.bookingSource === 'WALK_IN'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : appointment.bookingSource === 'PHONE'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              {appointment.bookingSource === 'WALK_IN'
                ? 'Walk-In'
                : appointment.bookingSource === 'PHONE'
                ? 'Phone Booking'
                : 'Online Web Booking'}
            </span>
          </div>

          <div className="text-right">
            <div className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200/80 inline-block font-mono">
              {formatINR(appointment.fee)}
            </div>
          </div>
        </div>

        {/* Date & Time Slot Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-indigo-50/40 border border-indigo-100/90 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-indigo-950 font-mono">
                {format12Hour(appointment.startTime)} – {format12Hour(appointment.endTime)}
              </div>
              <div className="text-xs font-bold text-indigo-700 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDisplayDate(appointment.dateString, true)}</span>
              </div>
            </div>
          </div>

          <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-900 shadow-2xs font-mono">
            {appointment.duration || 30} mins session
          </div>
        </div>

        {/* Client Details Section */}
        <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <User className="w-3 h-3" /> Client Profile
            </span>
            {onOpenClientDrawer && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenClientDrawer({
                    name: appointment.customerName,
                    phone: appointment.customerPhone,
                    email: appointment.customerEmail,
                    notes: appointment.privateNotes || appointment.notes || '',
                    lastVisit: appointment.dateString,
                    totalVisits: 1,
                  });
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View Client History</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-black text-xs">
                {appointment.customerName ? appointment.customerName.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">{appointment.customerName}</h4>
                {appointment.customerEmail && (
                  <p className="text-xs text-slate-500 truncate max-w-xs">{appointment.customerEmail}</p>
                )}
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${appointment.customerPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                title="Call client directly"
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{appointment.customerPhone}</span>
              </a>

              {cleanPhone && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                  title="Chat on WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Service & Clinical Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Service Selected
            </span>
            <div className="text-xs font-black text-slate-900">
              {appointment.appointmentTypeName || 'General Consultation'}
            </div>
            {appointment.reason ? (
              <p className="text-[11px] text-slate-600 italic line-clamp-2">
                &ldquo;{appointment.reason}&rdquo;
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 italic">No specific reason noted</p>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Private Notes
              </span>
              {onOpenNotes && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNotes(appointment);
                  }}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{appointment.notes ? 'Edit' : 'Add'}</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-600 line-clamp-2">
              {appointment.notes || 'No private notes yet. Click Edit to record case history.'}
            </p>
          </div>
        </div>

        {/* Action Controls Pipeline */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
          {/* Primary Operations (Status Progression) */}
          <div className="flex items-center gap-2 flex-wrap">
            {appointment.status === 'PENDING' && onStatusChange && (
              <button
                onClick={() => {
                  onStatusChange(appointment._id, 'CONFIRMED');
                  onClose();
                }}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <CalendarCheck className="w-4 h-4" /> Accept & Confirm
              </button>
            )}

            {['CONFIRMED', 'BOOKED'].includes(appointment.status) && onStatusChange && (
              <button
                onClick={() => {
                  onStatusChange(appointment._id, 'WAITING');
                  onClose();
                }}
                className="flex-1 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" /> Mark Arrived (In Waiting)
              </button>
            )}

            {['CONFIRMED', 'WAITING', 'ARRIVED', 'BOOKED'].includes(appointment.status) && onStatusChange && (
              <button
                onClick={() => {
                  onStatusChange(appointment._id, 'IN_PROGRESS');
                  onClose();
                }}
                className="flex-1 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4" /> Start Consultation Session
              </button>
            )}

            {['IN_PROGRESS', 'CONFIRMED', 'WAITING', 'ARRIVED', 'BOOKED'].includes(appointment.status) && onStatusChange && (
              <button
                onClick={() => {
                  onStatusChange(appointment._id, 'DONE');
                  onClose();
                }}
                className="flex-1 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Completed
              </button>
            )}
          </div>

          {/* Secondary Actions (Reschedule, Cancel, Close) */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              {!isCompleted && !isCancelled && onOpenReschedule && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReschedule(appointment);
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Reschedule
                </button>
              )}

              {!isCompleted && !isCancelled && onOpenCancel && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCancel(appointment);
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel Booking
                </button>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
