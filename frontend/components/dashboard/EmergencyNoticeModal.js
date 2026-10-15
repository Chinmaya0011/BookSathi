'use client';

import { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Flame,
  Check,
  Megaphone,
  Clock,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function EmergencyNoticeModal({
  isOpen,
  onClose,
  profile,
}) {
  const [active, setActive] = useState(false);
  const [noticeText, setNoticeText] = useState(
    'Doctor is currently attending to an urgent emergency consultation. Scheduled slots will proceed with a slight delay.'
  );

  useEffect(() => {
    try {
      const savedNotice = localStorage.getItem('booksaathi_emergency_notice');
      if (savedNotice) {
        const parsed = JSON.parse(savedNotice);
        setActive(parsed.active || false);
        if (parsed.text) setNoticeText(parsed.text);
      }
    } catch (e) {}
  }, [isOpen]);

  if (!isOpen) return null;

  const presets = [
    'Attending to critical emergency. Morning slots delayed by 30 mins.',
    'Clinic power outage / maintenance. Offline slots will resume shortly.',
    'Urgent surgical schedule today. Please check WhatsApp for token calls.',
    'Practice closing early today at 5:00 PM for scheduled sanitization.',
  ];

  const handleSave = () => {
    try {
      localStorage.setItem(
        'booksaathi_emergency_notice',
        JSON.stringify({ active, text: noticeText, updatedAt: new Date().toISOString() })
      );
      if (active) {
        toast.warning('📢 Emergency Notice is now LIVE on your public booking page!');
      } else {
        toast.info('Emergency Notice turned off');
      }
      onClose();
    } catch (e) {
      toast.error('Failed to save emergency notice');
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
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center font-bold">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Emergency Practice Notice</h3>
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-500">Live marquee banner on public booking link</p>
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
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          
          {/* Active Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div>
              <p className="text-xs font-semibold text-slate-900">Broadcast Notice Status</p>
              <p className="text-[11px] text-slate-500">
                {active ? 'Banner is visible to all patients online' : 'Disabled / Hidden'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                active ? 'bg-rose-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-2xs ring-0 transition duration-200 ease-in-out ${
                  active ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Notice Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Notice Banner Message:</label>
            <textarea
              rows={3}
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-xs text-slate-800 resize-none font-medium focus:outline-hidden"
              placeholder="Enter message for patients booking online..."
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Quick One-Tap Presets:
            </span>
            <div className="space-y-1.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNoticeText(preset)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50/80 hover:bg-rose-50/60 border border-slate-200/80 hover:border-rose-200 text-xs text-slate-700 hover:text-rose-900 transition-colors truncate block cursor-pointer"
                >
                  ⚡ {preset}
                </button>
              ))}
            </div>
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
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            Save & Publish Notice
          </button>
        </div>

      </div>
    </div>
  );
}
