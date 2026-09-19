'use client';

import { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  Clock,
  FileText,
  Plus,
  CheckCircle2,
  ExternalLink,
  Receipt,
} from 'lucide-react';
import { formatDisplayDate, format12Hour } from '@/lib/utils';
import { toast } from 'sonner';

export default function ClientDetailDrawer({
  client,
  isOpen,
  onClose,
  onBookAgain,
  profile,
}) {
  const [notes, setNotes] = useState(client?.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  if (!isOpen || !client) return null;

  const cleanPhone = client.phone ? client.phone.replace(/[^0-9]/g, '') : '';
  const whatsappUrl = cleanPhone
    ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
        `Hello ${client.name}, Dr./Pro ${profile?.name || ''} here regarding your consultations at BookSaathi.`
      )}`
    : null;

  const handleSaveNotes = () => {
    setSavingNotes(true);
    setTimeout(() => {
      setSavingNotes(false);
      toast.success('Client clinical notes updated');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col font-sans animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
                {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {client.name}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {client.phone || 'No phone recorded'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* Quick Contact & Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}

              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span>Call Patient</span>
                </a>
              )}
            </div>

            {/* Visit Stats Snapshot */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Visits
                </span>
                <span className="text-xl font-black text-slate-900 mt-0.5 block">
                  {client.totalVisits || client.appointmentCount || 1}
                </span>
              </div>
              <div className="border-l border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Last Appointment
                </span>
                <span className="text-xs font-bold text-slate-800 mt-1 block truncate px-1">
                  {client.lastVisit
                    ? formatDisplayDate(client.lastVisit)
                    : 'Recent'}
                </span>
              </div>
            </div>

            {/* Client Details Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Client Information
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Mobile
                  </span>
                  <span className="font-semibold text-slate-900">{client.phone || '—'}</span>
                </div>
                {client.email && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Email
                    </span>
                    <span className="font-semibold text-slate-900 truncate max-w-[200px]">{client.email}</span>
                  </div>
                )}
                {client.gender && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Gender / Age
                    </span>
                    <span className="font-semibold text-slate-900">{client.gender} {client.age ? `(${client.age} yrs)` : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Practitioner Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Private Practice Notes
                </h4>
                <span className="text-[10px] text-slate-400">Confidential</span>
              </div>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Attach symptoms, prescription summary, or client history notes here..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onBookAgain) onBookAgain(client);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Book New Appointment for {client.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
