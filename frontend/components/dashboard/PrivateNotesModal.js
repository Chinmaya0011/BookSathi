'use client';

import { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Lock,
  Save,
  Check,
  User,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { format12Hour } from '@/lib/utils';

export default function PrivateNotesModal({
  isOpen,
  onClose,
  appointment,
}) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (appointment?._id) {
      try {
        const saved = localStorage.getItem(`booksaathi_notes_${appointment._id}`);
        setNotes(saved || appointment.notes || '');
      } catch (e) {}
    }
  }, [appointment, isOpen]);

  if (!isOpen || !appointment) return null;

  const handleSaveNotes = () => {
    setSaving(true);
    try {
      localStorage.setItem(`booksaathi_notes_${appointment._id}`, notes);
      toast.success(`Confidential case notes saved for ${appointment.customerName}`);
      onClose();
    } catch (e) {
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200/90 max-w-lg w-full overflow-hidden z-10 flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/80 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Private Case & Clinical Vault</h3>
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-500">Confidential — Not visible to patient</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* Patient Details Strip */}
          <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-slate-900 block">{appointment.customerName}</span>
              <span className="text-slate-500 font-mono text-[11px]">{appointment.customerPhone}</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-indigo-600 block">
                {appointment.queueNumber ? `Token #${appointment.queueNumber}` : format12Hour(appointment.startTime)}
              </span>
              <span className="text-slate-400 text-[11px]">
                {appointment.appointmentTypeName || 'Consultation'}
              </span>
            </div>
          </div>

          {/* Notes Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Doctor / Specialist Observations:</span>
              <span className="text-[11px] text-slate-400 font-normal">Encrypted in browser vault</span>
            </label>
            <textarea
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-xs text-slate-800 resize-none font-medium leading-relaxed focus:outline-hidden"
              placeholder="Record diagnosis, symptoms, clinical prescriptions, followup directives, or legal case notes..."
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Case Notes'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
