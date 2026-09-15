'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  RefreshCw,
  XCircle,
  CalendarCheck,
  Search,
  Download,
  AlertCircle,
  FileText,
  User,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { userAppointmentService } from '@/services/userAppointment.service';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { format12Hour, formatDisplayDate, formatINR } from '@/lib/utils';
import { connectSocket } from '@/lib/socket';
import { toast } from 'sonner';

import { generateAppointmentPdf } from '@/lib/generateAppointmentPdf';

export default function UserAppointmentsView({ user }) {
  const [tab, setTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  // Cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Reschedule request modal
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    requestedDate: '',
    requestedTime: '',
    reason: '',
  });
  const [requestingReschedule, setRequestingReschedule] = useState(false);

  useEffect(() => {
    fetchAppointments();

    const socket = connectSocket();
    if (socket) {
      const handleUpdate = () => {
        fetchAppointments();
      };

      socket.on('appointment:created', handleUpdate);
      socket.on('appointment:confirmed', handleUpdate);
      socket.on('appointment:rejected', handleUpdate);
      socket.on('appointment:cancelled', handleUpdate);
      socket.on('appointment:rescheduled', handleUpdate);
      socket.on('appointment:completed', handleUpdate);

      return () => {
        socket.off('appointment:created', handleUpdate);
        socket.off('appointment:confirmed', handleUpdate);
        socket.off('appointment:rejected', handleUpdate);
        socket.off('appointment:cancelled', handleUpdate);
        socket.off('appointment:rescheduled', handleUpdate);
        socket.off('appointment:completed', handleUpdate);
      };
    }
  }, [tab]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await userAppointmentService.getMyAppointments({ tab, search });
      setAppointments(res.data?.appointments || []);
    } catch (err) {
      console.error('Failed to load user appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  const handleDownloadPdf = (appt) => {
    setDownloadingId(appt._id);
    try {
      generateAppointmentPdf(appt, appt.professionalId || {});
      toast.success('Consultation slip downloaded!');
    } catch (e) {
      console.error('PDF error:', e);
      toast.error('Failed to generate PDF slip');
    } finally {
      setDownloadingId(null);
    }
  };

  const openCancelModal = (appt) => {
    setSelectedAppt(appt);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedAppt) return;
    setCancelling(true);
    try {
      await userAppointmentService.cancelAppointment(selectedAppt._id, cancelReason);
      toast.success('Appointment cancelled successfully');
      setCancelModalOpen(false);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const openRescheduleModal = (appt) => {
    setSelectedAppt(appt);
    setRescheduleForm({
      requestedDate: appt.dateString,
      requestedTime: appt.startTime,
      reason: '',
    });
    setRescheduleModalOpen(true);
  };

  const confirmRescheduleRequest = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setRequestingReschedule(true);
    try {
      await userAppointmentService.requestReschedule(selectedAppt._id, rescheduleForm);
      toast.success('Reschedule request sent to the professional');
      setRescheduleModalOpen(false);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request reschedule');
    } finally {
      setRequestingReschedule(false);
    }
  };

  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const pendingCount = appointments.filter((a) => ['PENDING', 'RESCHEDULE_REQUESTED'].includes(a.status)).length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
            <span>My Appointments & Consultations</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track your verified appointments, attend video & audio calls, and manage your booking history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/lookup"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Lookup Pass by Phone</span>
          </Link>

          <button
            onClick={fetchAppointments}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmed</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{confirmedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Pending / Requests</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{completedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0 shadow-2xs">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Total in View</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{appointments.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'upcoming', label: 'Upcoming Consultations' },
            { id: 'pending', label: 'Pending Approval' },
            { id: 'history', label: 'Completed History' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                tab === t.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-72">
          <Input
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            className="py-2 text-xs"
          />
        </form>
      </div>

      {/* Appointment Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-slate-400 border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs font-semibold">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No appointments found in this section</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Bookings made through your practitioner&apos;s personal booking link or clinic QR code will appear here.
            </p>
            <Link
              href="/lookup"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Lookup Booking with Phone Number</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((appt) => {
              const pro = appt.professionalId || {};
              const isCancelable = ['CONFIRMED', 'PENDING', 'ARRIVED', 'WAITING'].includes(appt.status);

              return (
                <div
                  key={appt._id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Header: Pro Info & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <Link
                          href={`/profile/${pro.bookingSlug || pro._id}`}
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-base shrink-0 shadow-md hover:opacity-90 transition-opacity"
                        >
                          {pro.profileImage ? (
                            <img
                              src={pro.profileImage}
                              alt={pro.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            pro.name?.charAt(0) || 'P'
                          )}
                        </Link>
                        <div className="min-w-0">
                          <Link
                            href={`/profile/${pro.bookingSlug || pro._id}`}
                            className="text-sm font-bold text-slate-900 truncate hover:text-indigo-600 transition-colors block"
                          >
                            {pro.name || 'Professional'}
                          </Link>
                          <p className="text-xs font-semibold text-indigo-600 truncate">{pro.profession || 'Specialist'}</p>
                          <p className="text-[11px] text-slate-400 truncate">{pro.specialization || pro.city}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <Badge status={appt.status} />
                        <span className="text-[10px] font-mono text-slate-400 mt-1">#{appt.appointmentCode}</span>
                      </div>
                    </div>

                    {/* Date, Time & Service Details */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Service:</span>
                        <span className="font-bold text-slate-900">{appt.appointmentTypeName || 'Consultation'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Date & Time:</span>
                        <span className="font-bold text-indigo-700">
                          {formatDisplayDate(appt.dateString)} • {format12Hour(appt.startTime)} - {format12Hour(appt.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Consultation Fee:</span>
                        <span className="font-extrabold text-slate-900">{formatINR(appt.fee)}</span>
                      </div>
                    </div>

                    {(pro.address || pro.city) && (
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs text-slate-800">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="font-semibold truncate">
                            {pro.address ? `${pro.address}, ${pro.city || ''}` : `${pro.city || 'Clinic / Physical Venue'}`}
                          </span>
                        </div>
                      </div>
                    )}

                    {appt.rescheduleRequest?.requestedDate && appt.status === 'RESCHEDULE_REQUESTED' && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                        <span className="font-bold">Reschedule Requested:</span> {appt.rescheduleRequest.requestedDate} at {appt.rescheduleRequest.requestedTime}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100 flex-wrap">
                    <Link
                      href={`/profile/${pro.bookingSlug || pro._id}`}
                      className="inline-flex items-center justify-center gap-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Doctor Profile</span>
                    </Link>

                    <button
                      onClick={() => handleDownloadPdf(appt)}
                      disabled={downloadingId === appt._id}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloadingId === appt._id ? 'Generating...' : 'Receipt PDF'}</span>
                    </button>

                    {isCancelable && (
                      <>
                        <button
                          onClick={() => openRescheduleModal(appt)}
                          className="flex-1 text-center py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Reschedule
                        </button>

                        <button
                          onClick={() => openCancelModal(appt)}
                          className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule Request Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title={`Request Reschedule: #${selectedAppt?.appointmentCode}`}
      >
        <form onSubmit={confirmRescheduleRequest} className="space-y-4">
          <p className="text-xs text-slate-500">
            Submit a proposed new date and time. The professional will be notified in real-time to accept or adjust.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Preferred Date"
              type="date"
              required
              value={rescheduleForm.requestedDate}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, requestedDate: e.target.value })}
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Preferred Time (HH:mm) <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={rescheduleForm.requestedTime}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, requestedTime: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <Input
            label="Reason for Rescheduling (Optional)"
            placeholder="e.g. Schedule conflict, personal emergency"
            value={rescheduleForm.reason}
            onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setRescheduleModalOpen(false)}>
              Keep Existing
            </Button>
            <Button type="submit" size="sm" loading={requestingReschedule}>
              Send Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title={`Cancel Booking: #${selectedAppt?.appointmentCode}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to cancel your appointment with{' '}
            <strong>{selectedAppt?.professionalId?.name || 'the professional'}</strong> on{' '}
            {selectedAppt && formatDisplayDate(selectedAppt.dateString)}?
          </p>

          <Input
            label="Reason for Cancellation (Optional)"
            placeholder="e.g. Change of plans, resolved ailment"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep Booking
            </Button>
            <Button variant="danger" size="sm" loading={cancelling} onClick={confirmCancel}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
