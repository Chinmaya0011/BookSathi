'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Search,
  ArrowRight,
  ShieldCheck,
  MapPin,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  Building2,
  QrCode,
  LifeBuoy,
} from 'lucide-react';
import { userAppointmentService } from '@/services/userAppointment.service';
import { connectSocket } from '@/lib/socket';
import { formatINR, formatDisplayDate, format12Hour } from '@/lib/utils';
import { toast } from 'sonner';

export default function UserDashboardOverview({ user }) {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadUserData();

    // Connect to Socket.IO real-time updates
    const socket = connectSocket();
    if (socket) {
      const handleAppointmentUpdate = () => {
        loadUserData();
      };

      socket.on('appointment:created', handleAppointmentUpdate);
      socket.on('appointment:confirmed', handleAppointmentUpdate);
      socket.on('appointment:rejected', handleAppointmentUpdate);
      socket.on('appointment:cancelled', handleAppointmentUpdate);
      socket.on('appointment:rescheduled', handleAppointmentUpdate);
      socket.on('appointment:completed', handleAppointmentUpdate);

      return () => {
        socket.off('appointment:created', handleAppointmentUpdate);
        socket.off('appointment:confirmed', handleAppointmentUpdate);
        socket.off('appointment:rejected', handleAppointmentUpdate);
        socket.off('appointment:cancelled', handleAppointmentUpdate);
        socket.off('appointment:rescheduled', handleAppointmentUpdate);
        socket.off('appointment:completed', handleAppointmentUpdate);
      };
    }
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const apptRes = await userAppointmentService.getMyAppointments({ limit: 10 }).catch(() => ({ data: { appointments: [] } }));
      setAppointments(apptRes.data?.appointments || []);
    } catch (err) {
      console.error('Error loading user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt('Please enter a cancellation reason (optional):') || 'Customer requested cancellation';
    try {
      setCancellingId(id);
      await userAppointmentService.cancelAppointment(id, reason);
      toast.success('Appointment cancelled successfully');
      loadUserData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const upcomingAppointments = appointments.filter((a) =>
    ['CONFIRMED', 'PENDING', 'ARRIVED', 'WAITING', 'IN_PROGRESS'].includes(a.status)
  );
  const nextAppointment = upcomingAppointments[0];
  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;
  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-300 pb-16">
      {/* 1. Hero Welcome & Direct Booking Lookup Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Customer Portal • On-Visit Appointments & Live Passes</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome, {user?.name || 'Customer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Manage your booked clinic visits, digital queue tokens, and consultation receipts. Book new visits directly using your local doctor or practitioner&apos;s personal link or QR code.
          </p>

          {/* Quick Lookup by Phone / Reference */}
          <div className="pt-2">
            <Link
              href="/lookup"
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Lookup Appointment by Phone Number</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Decorative background ambient */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Key Customer Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Confirmed</p>
            <p className="text-2xl font-black text-slate-900">{confirmedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-black text-slate-900">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-black text-slate-900">{completedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Visits</p>
            <p className="text-2xl font-black text-slate-900">{appointments.length}</p>
          </div>
        </div>
      </div>

      {/* 3. Next Upcoming Appointment Spotlight */}
      {nextAppointment ? (
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden border border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                    Next Consultation
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      nextAppointment.status === 'CONFIRMED'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {nextAppointment.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {nextAppointment.professionalId?.name || 'Practitioner'}
                </h3>
                <p className="text-xs text-slate-300">
                  {nextAppointment.appointmentTypeName || 'Consultation'} • {nextAppointment.duration || 30} mins
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{formatDisplayDate(nextAppointment.dateString)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{format12Hour(nextAppointment.startTime)} - {format12Hour(nextAppointment.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{nextAppointment.professionalId?.businessName || nextAppointment.professionalId?.city || 'In-Clinic'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Link
                href="/dashboard/appointments"
                className="flex-1 md:flex-none text-center bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                View Pass & Details
              </Link>
              <button
                onClick={() => handleCancel(nextAppointment._id)}
                disabled={cancellingId === nextAppointment._id}
                className="flex-1 md:flex-none text-center bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                {cancellingId === nextAppointment._id ? 'Cancelling...' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">No Upcoming Appointments</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              When you book a consultation via your practitioner&apos;s personal booking link or clinic QR pass, your appointment will appear here automatically.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/lookup"
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Lookup Existing Appointment</span>
            </Link>
          </div>
        </div>
      )}

      {/* 4. Quick Customer Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        <Link
          href="/dashboard/appointments"
          className="bg-white hover:bg-slate-50 p-5 rounded-3xl border border-slate-200/90 shadow-2xs transition-all flex items-center gap-4 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600">My Bookings</h4>
            <p className="text-[11px] text-slate-500">Track passes & queue</p>
          </div>
        </Link>

        <Link
          href="/lookup"
          className="bg-white hover:bg-slate-50 p-5 rounded-3xl border border-slate-200/90 shadow-2xs transition-all flex items-center gap-4 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-600">Lookup Pass</h4>
            <p className="text-[11px] text-slate-500">Check by phone number</p>
          </div>
        </Link>

        <Link
          href="/dashboard/payments"
          className="bg-white hover:bg-slate-50 p-5 rounded-3xl border border-slate-200/90 shadow-2xs transition-all flex items-center gap-4 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-600">Invoices & Slips</h4>
            <p className="text-[11px] text-slate-500">Download payment slips</p>
          </div>
        </Link>

        <Link
          href="/dashboard/grievance"
          className="bg-white hover:bg-slate-50 p-5 rounded-3xl border border-slate-200/90 shadow-2xs transition-all flex items-center gap-4 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-600">Help & Support</h4>
            <p className="text-[11px] text-slate-500">Grievance & inquiries</p>
          </div>
        </Link>
      </div>

      {/* 5. Recent Bookings Summary List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-8 lg:p-9 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider">
              Recent Consultations & Passes
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your recent in-clinic and on-visit appointment history
            </p>
          </div>
          <Link
            href="/dashboard/appointments"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
            No booking history yet. Appointments booked with practitioners will appear here.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {appointments.slice(0, 5).map((appt) => (
              <div
                key={appt._id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {appt.professionalId?.name || 'Practitioner'}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        appt.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : appt.status === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{formatDisplayDate(appt.dateString)}</span>
                    <span>•</span>
                    <span>{format12Hour(appt.startTime)}</span>
                    {appt.appointmentCode && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-indigo-600 font-semibold">#{appt.appointmentCode}</span>
                      </>
                    )}
                  </div>
                </div>

                <Link
                  href="/dashboard/appointments"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
