'use client';

import {
  Zap,
  User,
  Phone,
  Clock,
  Sparkles,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ManualBookingModal({
  isOpen,
  onClose,
  manualForm,
  setManualForm,
  onSubmit,
  creatingManual,
}) {
  const setTimeToNow = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setManualForm({
      ...manualForm,
      date: new Date().toISOString().split('T')[0],
      time: `${hours}:${minutes}`,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Walk-In Booking"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-medium">3-field quick walk-in. Added directly to today's list.</span>
          </div>
          <button
            type="button"
            onClick={setTimeToNow}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] shrink-0 transition-all cursor-pointer inline-flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Right NOW</span>
          </button>
        </div>

        {/* 1. Patient / Client Name */}
        <Input
          label="Client / Patient Full Name"
          required
          placeholder="e.g. Rahul Sharma"
          value={manualForm.customerName}
          onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
          prefix={<User className="w-4 h-4 text-slate-400" />}
          autoFocus
        />

        {/* 2. Mobile Number */}
        <Input
          label="Mobile Phone Number"
          required
          placeholder="10-digit mobile number"
          value={manualForm.customerPhone}
          onChange={(e) => setManualForm({ ...manualForm, customerPhone: e.target.value })}
          prefix={<Phone className="w-4 h-4 text-slate-400" />}
        />

        {/* 3. Time Slot */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Time Slot <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={setTimeToNow}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Set Current Time
            </button>
          </div>
          <div className="relative">
            <input
              type="time"
              required
              value={manualForm.time}
              onChange={(e) => setManualForm({ ...manualForm, time: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={creatingManual} className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
            Add to Today's Queue
          </Button>
        </div>
      </form>
    </Modal>
  );
}
