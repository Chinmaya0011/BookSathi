'use client';

import {
  Zap,
  User,
  Phone,
  Clock,
  CheckSquare,
  Calendar,
  IndianRupee,
  Briefcase,
  FileText,
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
  services,
  onServiceChange,
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
      markAsArrived: true,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Walk-In / Offline Client"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Banner with NOW shortcut */}
        <div className="bg-gradient-to-r from-indigo-50 via-indigo-50/70 to-sky-50 p-3.5 rounded-2xl border border-indigo-100/90 text-xs text-indigo-950 flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Instantly schedule walk-in clients. The time slot is reserved and immediately synced to your queue.
            </p>
          </div>
          <button
            type="button"
            onClick={setTimeToNow}
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl text-[10px] shrink-0 transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Right NOW</span>
          </button>
        </div>

        {/* Booking Source Selector */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
            Booking Channel
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'WALK_IN', label: 'Walk-In' },
              { id: 'PHONE', label: 'Phone' },
              { id: 'WHATSAPP', label: 'WhatsApp' },
              { id: 'MANUAL', label: 'Manual' },
            ].map((src) => (
              <button
                key={src.id}
                type="button"
                onClick={() => setManualForm({ ...manualForm, bookingSource: src.id })}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer active:scale-95 ${
                  (manualForm.bookingSource || 'WALK_IN') === src.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {src.label}
              </button>
            ))}
          </div>
        </div>

        {/* Patient / Client Name */}
        <Input
          label="Patient / Client Full Name"
          required
          placeholder="e.g. Amit Sharma"
          value={manualForm.customerName}
          onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
          prefix={<User className="w-4 h-4 text-slate-400" />}
        />

        {/* Mobile Number */}
        <Input
          label="Mobile Phone Number"
          required
          placeholder="98765 43210"
          value={manualForm.customerPhone}
          onChange={(e) => setManualForm({ ...manualForm, customerPhone: e.target.value })}
          prefix={<Phone className="w-4 h-4 text-slate-400" />}
        />

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="Consultation Date"
            type="date"
            required
            value={manualForm.date}
            onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Start Time (24-Hour) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={setTimeToNow}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
              >
                Set Current Time
              </button>
            </div>
            <input
              type="time"
              required
              value={manualForm.time}
              onChange={(e) => setManualForm({ ...manualForm, time: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Service Type and Fee Charged */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Service / Consultation Type
            </label>
            <select
              value={manualForm.appointmentTypeId}
              onChange={(e) => onServiceChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.duration}m • ₹{s.fee})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Fee Charged (₹)"
            type="number"
            value={manualForm.fee}
            onChange={(e) => setManualForm({ ...manualForm, fee: Number(e.target.value) })}
            prefix={<span className="text-xs font-bold text-slate-400">₹</span>}
          />
        </div>

        {/* Mark as arrived toggle */}
        <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/80 transition-colors">
          <input
            type="checkbox"
            checked={manualForm.markAsArrived || false}
            onChange={(e) => setManualForm({ ...manualForm, markAsArrived: e.target.checked })}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-xs font-semibold text-slate-800 select-none">
            Client has arrived (Add directly to live waiting room queue)
          </span>
        </label>

        {/* Notes / Reason */}
        <Input
          label="Consultation Notes (Optional)"
          placeholder="e.g. Regular follow-up, urgent consultation..."
          value={manualForm.reason}
          onChange={(e) => setManualForm({ ...manualForm, reason: e.target.value })}
        />

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={creatingManual} className="w-full sm:w-auto shadow-md">
            Confirm & Occupy Slot
          </Button>
        </div>
      </form>
    </Modal>
  );
}
