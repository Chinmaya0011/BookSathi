'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Search,
  Phone,
  Calendar,
  Clock,
  UserCheck,
  MessageCircle,
  Repeat,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { publicService } from '@/services/public.service';
import { format12Hour, formatDisplayDate, formatINR } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function BookingLookupPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const handleLookup = async (e) => {
    e?.preventDefault();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await publicService.lookupByPhone(cleanPhone);
      const list = res.data?.appointments || (Array.isArray(res.data) ? res.data : []);
      setAppointments(list);
      setSearched(true);
      if (list.length === 0) {
        toast.info('No bookings found for this phone number');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to search bookings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              Book<span className="text-indigo-600">Saathi</span>
            </span>
          </Link>

          <Link
            href="/login"
            className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1"
          >
            <span>Professional Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Hero Card with Phone Input */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80 space-y-6">
          <div className="text-center max-w-md mx-auto space-y-2">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Find Your Bookings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Zero login required. Enter your 10-digit mobile number to view upcoming and past appointments.
            </p>
          </div>

          <form onSubmit={handleLookup} className="space-y-4 max-w-md mx-auto">
            <div className="relative">
              <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-center tracking-wider"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold text-sm shadow-lg shadow-indigo-200"
            >
              Search My Appointments
            </Button>
          </form>
        </div>

        {/* Search Results */}
        {searched && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider px-1">
              Your Appointments ({appointments.length})
            </h2>

            {appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((appt) => {
                  const pro = appt.professionalId || {};
                  const isBooked = appt.status === 'BOOKED';
                  const isDone = appt.status === 'DONE';
                  const isCancelled = appt.status === 'CANCELLED';
                  const dateStr = appt.date || appt.appointmentDate;
                  const proPhone = pro.phone?.replace(/[^0-9]/g, '');

                  return (
                    <div
                      key={appt._id}
                      className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4"
                    >
                      {/* Top row: Doctor + Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0 border border-indigo-100">
                            <UserCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-900">
                              {pro.name || 'Healthcare Professional'}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              {pro.profession || 'Specialist'} {pro.city ? `• ${pro.city}` : ''}
                            </p>
                          </div>
                        </div>

                        <Badge status={appt.status} />
                      </div>

                      {/* Middle row: Schedule info */}
                      <div className="p-3 bg-slate-50 rounded-2xl grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="font-bold">{formatDisplayDate(dateStr)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="font-bold">{format12Hour(appt.startTime)}</span>
                        </div>
                      </div>

                      {/* Bottom row: 1-Tap Actions */}
                      <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                        <div className="text-xs font-mono text-slate-400">
                          Code: <strong className="text-slate-700">{appt.appointmentCode}</strong>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* WhatsApp Doctor */}
                          {proPhone && (
                            <a
                              href={`https://wa.me/91${proPhone}?text=${encodeURIComponent(
                                `Hello ${pro.name}, this is regarding my appointment on ${formatDisplayDate(dateStr)} (Ref: ${appt.appointmentCode}).`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          {/* Manage Booking Button */}
                          <Link
                            href={`/book/manage?code=${appt.appointmentCode}`}
                            className="p-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                          >
                            <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Manage</span>
                          </Link>

                          {/* 1-Tap Book Again */}
                          {pro.bookingSlug && (
                            <Link
                              href={`/book/${pro.bookingSlug}`}
                              className="p-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                            >
                              <Repeat className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Book Again</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">No appointments found</h3>
                <p className="text-xs text-slate-500">
                  We couldn't find any appointments linked to this number.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
