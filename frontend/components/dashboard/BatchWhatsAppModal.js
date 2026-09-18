'use client';

import { useState } from 'react';
import {
  X,
  MessageCircle,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { format12Hour } from '@/lib/utils';

export default function BatchWhatsAppModal({
  isOpen,
  onClose,
  todaySchedule = [],
  profile,
}) {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('DELAY');
  const [customDelayMinutes, setCustomDelayMinutes] = useState(15);
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const validPatients = todaySchedule.filter(
    (a) =>
      a.customerPhone &&
      a.status !== 'CANCELLED' &&
      a.status !== 'REJECTED' &&
      a.status !== 'COMPLETED' &&
      a.status !== 'DONE'
  );

  const templates = {
    DELAY: {
      title: 'Running Late Notice',
      icon: Clock,
      getText: (patient) =>
        `Hello ${patient.customerName}, this is an update from ${profile?.name || 'Dr./Practice'}. Due to emergency procedures, consultations are currently running approx ${customDelayMinutes} minutes behind schedule. Your patience is appreciated!`,
    },
    CONFIRM: {
      title: 'Slot Confirmation & Address',
      icon: MapPin,
      getText: (patient) =>
        `Hello ${patient.customerName}, your appointment with ${profile?.name || 'our practice'} is confirmed for today at ${format12Hour(patient.startTime)}. Location: ${profile?.address || profile?.city || 'Clinic'}. Google Maps: ${profile?.googleMapUrl || 'Contact practice'}.`,
    },
    QUEUE_ALERT: {
      title: 'Your Token Is Next Alert',
      icon: Sparkles,
      getText: (patient) =>
        `Hello ${patient.customerName}, token #${patient.queueNumber || 'next'} is now called at ${profile?.name || 'our desk'}. Please proceed to the consultation room.`,
    },
    FOLLOWUP: {
      title: 'Follow-up & Care Instructions',
      icon: FileText,
      getText: (patient) =>
        `Hello ${patient.customerName}, thank you for visiting ${profile?.name || 'our practice'} today. Please adhere to your prescribed routine. You can book your next review at any time: https://booksaathi.in/book/${profile?.bookingSlug || ''}`,
    },
  };

  const handleSendWhatsApp = (patient) => {
    const rawPhone = patient.customerPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const text = encodeURIComponent(templates[selectedTemplateKey].getText(patient));
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
    toast.success(`WhatsApp opened for ${patient.customerName}`);
  };

  const handleCopyMessage = (patient, idx) => {
    const text = templates[selectedTemplateKey].getText(patient);
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success('Message copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-xl w-full overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-white">Batch WhatsApp Broadcast</h3>
                <span className="px-2 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                  PRO
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">1-Click Patient Queue Communications</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Template Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Select Broadcast Template:</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(templates).map(([key, tpl]) => {
                const Icon = tpl.icon;
                const active = selectedTemplateKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedTemplateKey(key)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      active
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-xs truncate">{tpl.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional: Delay Minutes selector */}
          {selectedTemplateKey === 'DELAY' && (
            <div className="flex items-center gap-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs">
              <span className="font-bold text-amber-900">Delay Time:</span>
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setCustomDelayMinutes(mins)}
                  className={`px-2 py-0.5 rounded-md font-bold text-xs transition-colors cursor-pointer ${
                    customDelayMinutes === mins
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  +{mins}m
                </button>
              ))}
            </div>
          )}

          {/* Queue Recipients List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                Recipients ({validPatients.length} Waiting Customers):
              </span>
              <span className="text-slate-400 text-[11px]">Click WhatsApp to send</span>
            </div>

            {validPatients.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                <p className="text-xs font-bold text-slate-600">No active queue waiting right now</p>
                <p className="text-[11px] text-slate-400">All today customers have completed consultations.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {validPatients.map((patient, idx) => (
                  <div
                    key={patient._id || idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 truncate">
                          {patient.customerName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                          {format12Hour(patient.startTime)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">{patient.customerPhone}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(patient, idx)}
                        className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                        title="Copy message text"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendWhatsApp(patient)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Powered by BookSaathi Pro Instant Pings
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
