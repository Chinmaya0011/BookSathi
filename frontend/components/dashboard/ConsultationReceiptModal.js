'use client';

import { useState, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Receipt,
  ShieldCheck,
  CheckCircle2,
  Building,
  User,
  Phone,
  Calendar,
  Clock,
  IndianRupee,
} from 'lucide-react';
import { formatINR, format12Hour } from '@/lib/utils';
import { toast } from 'sonner';

export default function ConsultationReceiptModal({
  isOpen,
  onClose,
  appointment,
  profile,
}) {
  const receiptRef = useRef(null);
  const [taxId, setTaxId] = useState(profile?.gstin || '');

  if (!isOpen || !appointment) return null;

  const receiptNumber = `RCP-${new Date().getFullYear()}-${appointment.queueNumber || '01'}-${String(appointment._id || '').slice(-4).toUpperCase()}`;
  const appointmentDate = appointment.date
    ? new Date(appointment.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  const fee = Number(appointment.fee) || Number(profile?.consultationFee) || 500;
  const gstRate = 0; // Standard healthcare / individual consultation exempt
  const totalAmount = fee;

  const handlePrint = () => {
    window.print();
    toast.success('Consultation receipt sent to printer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 font-sans">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Consultation Receipt</h3>
              <p className="text-[11px] text-slate-500">Official Patient Invoice & Payment Slip</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div
            ref={receiptRef}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-slate-800"
            id="printable-receipt"
          >
            {/* Header: Practice Info */}
            <div className="border-b border-dashed border-slate-300 pb-3 flex justify-between items-start">
              <div>
                <h4 className="text-base font-black text-slate-950 tracking-tight">
                  {profile?.name || 'Professional Practice'}
                </h4>
                <p className="text-xs text-indigo-600 font-bold">
                  {profile?.specialization || profile?.profession || 'Consultant'}
                </p>
                <p className="text-[11px] text-slate-500 max-w-[240px] mt-0.5">
                  {profile?.address || profile?.city || 'India'}
                </p>
                {profile?.phone && (
                  <p className="text-[11px] text-slate-500">Phone: {profile.phone}</p>
                )}
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                  PAID
                </span>
                <p className="text-[11px] font-mono text-slate-500 mt-1">{receiptNumber}</p>
                <p className="text-[10px] text-slate-400">{appointmentDate}</p>
              </div>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-2 gap-2 text-xs py-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient / Client:</span>
                <span className="font-bold text-slate-900">{appointment.customerName || 'Walk-In Customer'}</span>
                {appointment.customerPhone && (
                  <span className="text-[11px] text-slate-500 block">{appointment.customerPhone}</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Token / Slot:</span>
                <span className="font-bold text-indigo-600">
                  {appointment.queueNumber ? `Token #${appointment.queueNumber}` : format12Hour(appointment.startTime)}
                </span>
                <span className="text-[11px] text-slate-500 block">{appointmentDate}</span>
              </div>
            </div>

            {/* Service & Fee Breakdown Table */}
            <div className="border-t border-b border-slate-200 py-2 space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-slate-400 text-[10px] uppercase">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between items-center text-slate-800 font-semibold">
                <span>{appointment.appointmentTypeName || 'Professional Consultation'}</span>
                <span className="font-mono font-bold">{formatINR(fee)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-1 text-sm font-black text-slate-950">
              <span>Total Received</span>
              <span className="text-base text-indigo-600 font-mono">{formatINR(totalAmount)}</span>
            </div>

            {/* Footer Note */}
            <div className="pt-2 border-t border-dashed border-slate-200 text-center space-y-0.5">
              <p className="text-[10px] text-slate-400 font-medium">
                Thank you for choosing {profile?.name || 'our practice'}. Please retain this slip for records.
              </p>
              <p className="text-[9px] text-slate-300 font-mono">
                Verified via BookSaathi Practice OS
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>

      </div>
    </div>
  );
}
