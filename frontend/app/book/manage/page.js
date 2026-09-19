'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarCheck,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  FileText,
  Download,
  Share2,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Receipt,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { publicService } from '@/services/public.service';
import { format12Hour, formatDisplayDate, formatINR } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

function ManageContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const initialToken = searchParams.get('token') || '';

  const [appointmentCode, setAppointmentCode] = useState(initialCode);
  const [cancelToken, setCancelToken] = useState(initialToken);
  const [sessionToken, setSessionToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [challengeData, setChallengeData] = useState(null);
  const [needsOtp, setNeedsOtp] = useState(false);

  // OTP Verification State
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Action Modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Auto-fetch appointment if code and token are present in URL
  useEffect(() => {
    if (initialCode) {
      fetchBookingDetails(initialCode, initialToken, sessionToken);
    }
  }, [initialCode, initialToken]);

  const fetchBookingDetails = async (code, token, sessTok) => {
    if (!code) return;
    setLoading(true);
    try {
      const res = await publicService.getBookingChallenge(code, {
        token: token || cancelToken,
        sessionToken: sessTok || sessionToken,
      });

      const data = res.data || res;
      if (data.isAuthorized) {
        setAppointment(data.appointment);
        setProfessional(data.professional);
        setNeedsOtp(false);
      } else {
        setChallengeData(data);
        setNeedsOtp(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Appointment not found or expired.');
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!appointmentCode.trim()) {
      toast.error('Please enter a valid appointment booking code (e.g. BS-12345)');
      return;
    }
    fetchBookingDetails(appointmentCode.trim(), cancelToken.trim(), sessionToken);
  };

  const handleSendOtp = async () => {
    if (!appointmentCode) return;
    setSendingOtp(true);
    try {
      const res = await publicService.sendBookingOtp(appointmentCode);
      toast.success(res.message || 'Verification code sent to your registered phone number');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send verification code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await publicService.verifyBookingOtp(appointmentCode, otp);
      const sess = res.sessionToken || res.data?.sessionToken;
      if (sess) {
        setSessionToken(sess);
        toast.success('Identity verified successfully');
        await fetchBookingDetails(appointmentCode, cancelToken, sess);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP code');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    setCancelling(true);
    try {
      await publicService.cancelBooking(appointmentCode, {
        token: cancelToken,
        sessionToken,
        reason: cancelReason,
      });
      toast.success('Appointment cancelled successfully');
      setShowCancelModal(false);
      await fetchBookingDetails(appointmentCode, cancelToken, sessionToken);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const handleRequestReschedule = async (e) => {
    e.preventDefault();
    if (!newDate || !newTime) {
      toast.error('Please select both a new preferred date and time');
      return;
    }

    setRescheduling(true);
    try {
      await publicService.requestReschedule(appointmentCode, {
        token: cancelToken,
        sessionToken,
        requestedDate: newDate,
        requestedTime: newTime,
        reason: rescheduleReason,
      });
      toast.success('Reschedule request submitted to practitioner');
      setShowRescheduleModal(false);
      await fetchBookingDetails(appointmentCode, cancelToken, sessionToken);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit reschedule request');
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-indigo-50/20 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
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
            href="/lookup"
            className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors"
          >
            <span>Search by Phone</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Search Bar if not yet loaded */}
        {!appointment && !needsOtp && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <FileText className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Manage Your Booking
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Enter your Booking ID (e.g. BS-XXXXX) to view status, download calendar invite, reschedule, or cancel.
              </p>
            </div>

            <form onSubmit={handleManualSearch} className="space-y-4 max-w-md mx-auto pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Appointment Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. BS-45892"
                  value={appointmentCode}
                  onChange={(e) => setAppointmentCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm"
              >
                Find Booking Details
              </Button>
            </form>
          </div>
        )}

        {/* OTP Security Challenge Card (if token missing) */}
        {needsOtp && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Security Verification Required
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                To protect your appointment privacy under the DPDP Act 2023, please verify your mobile number.
              </p>
              {challengeData?.maskedPhone && (
                <p className="text-xs font-bold text-indigo-600 bg-indigo-50 py-1.5 px-3 rounded-lg inline-block mt-2">
                  Code sent to {challengeData.maskedPhone}
                </p>
              )}
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-sm mx-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-center">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-widest text-2xl font-mono font-black py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOtp}
                  loading={sendingOtp}
                  className="flex-1 text-xs font-bold"
                >
                  Resend Code
                </Button>
                <Button
                  type="submit"
                  loading={verifyingOtp}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  Verify & Open
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Verified Appointment Card */}
        {appointment && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden space-y-6 pb-6">
            {/* Top Banner with Status */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 text-white space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-full bg-white/10 text-indigo-200 border border-white/10">
                  {appointment.appointmentCode}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    appointment.status === 'CONFIRMED' || appointment.status === 'BOOKED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : appointment.status === 'CANCELLED' || appointment.status === 'REJECTED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                      : appointment.status === 'RESCHEDULE_REQUESTED'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                  }`}
                >
                  {appointment.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {appointment.appointmentTypeName || 'Consultation'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 mt-1">
                  <span>with</span>
                  <span className="font-bold text-white">{professional?.name || 'Professional'}</span>
                  {professional?.specialization && (
                    <span className="text-slate-400">({professional.specialization})</span>
                  )}
                </p>
              </div>
            </div>

            {/* Schedule & Venue Grid */}
            <div className="px-6 sm:px-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Date & Schedule</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {formatDisplayDate(appointment.dateString || appointment.date)}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {appointment.bookingType === 'QUEUE'
                        ? `Queue Token #${appointment.queueNumber}`
                        : `${format12Hour(appointment.startTime)} (${appointment.duration || 30}m)`}
                    </span>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer Details</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{appointment.customerName}</p>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    {appointment.customerPhone}
                  </p>
                </div>
              </div>
            </div>

            {/* Practitioner Location & Instructions */}
            {professional?.address && (
              <div className="px-6 sm:px-8">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600">
                    <p className="font-bold text-slate-900">Clinic / Office Location</p>
                    <p className="mt-0.5 leading-relaxed">{professional.address}, {professional.city}, {professional.state}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-6 sm:px-8 pt-2 space-y-3">
              <div className="flex flex-wrap gap-2.5">
                {/* ICS Download */}
                <a
                  href={publicService.getIcsDownloadUrl(professional?.bookingSlug || 'pro', appointment.appointmentCode)}
                  download
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Add to Calendar</span>
                </a>

                {/* Reschedule Button */}
                {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                  <Button
                    variant="outline"
                    onClick={() => setShowRescheduleModal(true)}
                    className="flex-1 text-xs font-bold"
                  >
                    Reschedule
                  </Button>
                )}

                {/* Cancel Button */}
                {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {showRescheduleModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Request Appointment Reschedule</h3>
                <p className="text-xs text-slate-500">
                  Select your new preferred date and time. Your practitioner will be notified.
                </p>
              </div>

              <form onSubmit={handleRequestReschedule} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Preferred Time</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Schedule conflict"
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRescheduleModal(false)}
                    className="flex-1 text-xs font-bold"
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    loading={rescheduling}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                  >
                    Submit Request
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cancellation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 text-rose-600">Cancel Appointment</h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>
              </div>

              <form onSubmit={handleCancelBooking} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason for cancellation</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Health recovered, emergency, etc."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 text-xs font-bold"
                  >
                    Keep Booking
                  </Button>
                  <Button
                    type="submit"
                    loading={cancelling}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                  >
                    Confirm Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingManagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><RefreshCw className="w-6 h-6 animate-spin text-indigo-600" /></div>}>
      <ManageContent />
    </Suspense>
  );
}
