'use client';

import { useEffect } from 'react';
import {
  ChevronLeft,
  User,
  Phone,
  Mail,
  FileText,
  CreditCard,
  ShieldCheck,
  Calendar,
  Clock,
  IndianRupee,
  Building2,
  Lock,
} from 'lucide-react';
import { formatINR, format12Hour, formatDisplayDate } from '@/lib/utils';
import { publicService } from '@/services/public.service';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function BookingPatientForm({
  selectedDate,
  selectedTime,
  selectedType,
  profile,
  patientName,
  setPatientName,
  patientPhone,
  setPatientPhone,
  patientEmail,
  setPatientEmail,
  reason,
  setReason,
  paymentMode,
  setPaymentMode,
  websiteHp,
  setWebsiteHp,
  submitting,
  onSubmit,
  onBack,
  holdCountdown = 0,
}) {
  const currentFee = selectedType?.fee || profile?.consultationFee || 500;
  const isQueue = profile?.bookingType === 'QUEUE';

  // Auto-fill returning customer's name on phone entry
  useEffect(() => {
    const cleanPhone = (patientPhone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10 && !patientName) {
      publicService
        .lookupByPhone(cleanPhone)
        .then((res) => {
          const list = res.data?.appointments || (Array.isArray(res.data) ? res.data : []);
          if (list.length > 0) {
            const prior = list.find((a) => a.customerName) || list[0];
            if (prior?.customerName) {
              setPatientName(prior.customerName);
              if (prior.customerEmail && !patientEmail) {
                setPatientEmail(prior.customerEmail);
              }
            }
          }
        })
        .catch(() => {});
    }
  }, [patientPhone, patientName, patientEmail, setPatientName, setPatientEmail]);

  return (
    <div className="p-4 sm:p-7 space-y-6">
      
      {/* Top Slot Summary & Back Button */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Change Slot</span>
        </button>

        {holdCountdown > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Slot reserved for {Math.floor(holdCountdown / 60)}:{(holdCountdown % 60).toString().padStart(2, '0')}</span>
          </span>
        )}
      </div>

      {/* Selected Slot Summary Card */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Booking with {profile?.name}
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              {formatDisplayDate(selectedDate)}
            </span>
            {!isQueue && selectedTime && (
              <span className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                <Clock className="w-3.5 h-3.5" />
                {format12Hour(selectedTime)}
              </span>
            )}
          </div>
        </div>

        <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
          <span className="text-[11px] text-slate-400 font-medium">Consultation Fee</span>
          <div className="text-base font-extrabold text-slate-900">
            {currentFee === 0 ? 'Free' : formatINR(currentFee)}
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        
        {/* Anti-spam honeypot */}
        <div className="hidden">
          <input
            type="text"
            name="website_hp"
            value={websiteHp}
            onChange={(e) => setWebsiteHp(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* 1. Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Your Full Name <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            required
            placeholder="e.g. Rahul Sharma"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            icon={<User className="w-4 h-4 text-slate-400" />}
            className="w-full text-sm"
          />
        </div>

        {/* 2. WhatsApp Mobile Number */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            WhatsApp Mobile Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs font-bold text-slate-500 z-10 select-none">
              +91
            </span>
            <input
              type="tel"
              required
              maxLength={10}
              placeholder="98765 43210"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-sm font-semibold text-slate-900 bg-white placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Your digital appointment pass and token number will be sent here.
          </p>
        </div>

        {/* 3. Reason for Visit (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason for Visit / Short Note <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <Input
            type="text"
            placeholder="e.g. Fever checkup, ITR consultation, Legal advice"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            icon={<FileText className="w-4 h-4 text-slate-400" />}
            className="w-full text-sm"
          />
        </div>

        {/* 4. Email (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email Address <span className="text-slate-400 font-normal">(Optional for calendar invite)</span>
          </label>
          <Input
            type="email"
            placeholder="name@example.com"
            value={patientEmail}
            onChange={(e) => setPatientEmail(e.target.value)}
            icon={<Mail className="w-4 h-4 text-slate-400" />}
            className="w-full text-sm"
          />
        </div>

        {/* 5. Payment Selection */}
        {currentFee > 0 && (
          <div className="pt-2 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMode('OFFLINE')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  paymentMode === 'OFFLINE'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Pay at Clinic
                </span>
                <span className="text-[10px] text-slate-500 mt-1">
                  Cash or UPI in-person
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('ONLINE')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  paymentMode === 'ONLINE'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> Pay Online Now
                </span>
                <span className="text-[10px] text-slate-500 mt-1">
                  UPI / Cards / NetBanking
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-3">
          <Button
            type="submit"
            disabled={submitting}
            isLoading={submitting}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 active:scale-98 transition-all"
          >
            {submitting ? 'Confirming Your Slot...' : `Confirm Appointment • ${currentFee === 0 ? 'Free' : formatINR(currentFee)}`}
          </Button>
        </div>

        {/* Trust Subline */}
        <div className="text-center pt-1">
          <span className="text-[11px] text-slate-400 font-medium inline-flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            <span>Instant booking • No registration required</span>
          </span>
        </div>

      </form>
    </div>
  );
}
