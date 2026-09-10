'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  MapPin,
  CalendarCheck,
  Star,
  RefreshCw,
  XCircle,
  Phone,
  Video,
  Sparkles,
  CreditCard,
  LifeBuoy,
  MessageSquare,
  User,
  Stethoscope,
  Calculator,
  Scale,
  Briefcase,
  Dumbbell,
  Check,
  ChevronRight,
} from 'lucide-react';
import { userAppointmentService } from '@/services/userAppointment.service';
import { publicService } from '@/services/public.service';
import { connectSocket } from '@/lib/socket';
import { formatINR, formatDisplayDate, format12Hour, cn } from '@/lib/utils';
import { toast } from 'sonner';

const POPULAR_SPECIALTIES = [
  { label: 'Doctors', query: 'Doctor', icon: Stethoscope },
  { label: 'CAs & Tax', query: 'CA', icon: Calculator },
  { label: 'Lawyers', query: 'Lawyer', icon: Scale },
  { label: 'Consultants', query: 'Consultant', icon: Briefcase },
  { label: 'Fitness Coaches', query: 'Fitness Coach', icon: Dumbbell },
];

export default function UserDashboardOverview({ user }) {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
      const [apptRes, proRes] = await Promise.all([
        userAppointmentService.getMyAppointments({ limit: 10 }).catch(() => ({ data: { appointments: [] } })),
        publicService.getProfessionals({ limit: 4 }).catch(() => ({ data: { professionals: [] } })),
      ]);

      setAppointments(apptRes.data?.appointments || []);
      setProfessionals(proRes.data?.professionals || []);
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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-16">
      {/* 1. Hero Welcome & Mobile-First Search Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 p-5 sm:p-8 text-white shadow-xl shadow-indigo-950/20">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>Customer Portal • Instant Verified Booking</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {user?.name || 'Customer'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Search and book appointments with verified Doctors, CAs, Lawyers, and Consultants across India with instant confirmation and queue tracking.
          </p>

          {/* Quick Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                router.push(`/dashboard/find?search=${encodeURIComponent(searchQuery.trim())}`);
              } else {
                router.push('/dashboard/find');
              }
            }}
            className="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-lg pt-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by doctor, CA, lawyer, or specialty..."
                className="w-full bg-slate-900/95 border border-slate-700/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Category Chips with Lucide Icons */}
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <span className="text-[11px] text-slate-400 font-bold mr-1">Popular:</span>
            {POPULAR_SPECIALTIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => router.push(`/dashboard/find?search=${encodeURIComponent(cat.query)}`)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Decorative background glows */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Key Customer Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{confirmedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{completedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0 shadow-2xs">
            <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Total Visits</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{appointments.length}</p>
          </div>
        </div>
      </div>

      {/* 3. Next Upcoming Appointment Spotlight */}
      {nextAppointment ? (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden border border-indigo-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-lg">
                <CalendarCheck className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Next Consultation
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      nextAppointment.status === 'CONFIRMED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {nextAppointment.status}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {nextAppointment.professionalId?.name || 'Professional Consultant'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-2">
                  {nextAppointment.appointmentTypeName || 'General Consultation'} • {nextAppointment.duration} mins
                </p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>{formatDisplayDate(nextAppointment.dateString)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>{format12Hour(nextAppointment.startTime)} - {format12Hour(nextAppointment.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <span>{nextAppointment.professionalId?.city || 'Online'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <Link
                href="/dashboard/appointments"
                className="flex-1 md:flex-none text-center bg-white hover:bg-slate-100 active:scale-95 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                View Details
              </Link>
              <button
                onClick={() => handleCancel(nextAppointment._id)}
                disabled={cancellingId === nextAppointment._id}
                className="flex-1 md:flex-none text-center bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 border border-rose-500/40 text-rose-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                {cancellingId === nextAppointment._id ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-10 text-center shadow-xs">
          <div className="w-14 h-14 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-3 shadow-2xs">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">No upcoming appointments</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
            Book an appointment with an experienced doctor, CA, lawyer, or consultant with instant confirmation.
          </p>
          <Link
            href="/dashboard/find"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Browse Professionals</span>
          </Link>
        </div>
      )}

      {/* 4. Quick Customer Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/dashboard/find"
          className="bg-white hover:bg-indigo-50/60 p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-200 active:scale-95 transition-all flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">Find Experts</h4>
            <p className="text-[10px] text-slate-500">Doctors, CAs & Lawyers</p>
          </div>
        </Link>

        <Link
          href="/dashboard/appointments"
          className="bg-white hover:bg-indigo-50/60 p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-200 active:scale-95 transition-all flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-600">My Bookings</h4>
            <p className="text-[10px] text-slate-500">Track appointment queue</p>
          </div>
        </Link>

        <Link
          href="/dashboard/payments"
          className="bg-white hover:bg-indigo-50/60 p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-200 active:scale-95 transition-all flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600">Invoices & Slips</h4>
            <p className="text-[10px] text-slate-500">Download PDF receipts</p>
          </div>
        </Link>

        <Link
          href="/dashboard/messages"
          className="bg-white hover:bg-indigo-50/60 p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-200 active:scale-95 transition-all flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-600">Live Chat</h4>
            <p className="text-[10px] text-slate-500">Direct message experts</p>
          </div>
        </Link>
      </div>

      {/* 5. Top Verified Professionals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Top Verified Professionals</h2>
            <p className="text-xs text-slate-500">Book direct consultations with top-rated experts</p>
          </div>
          <Link
            href="/dashboard/find"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {professionals.map((pro) => (
            <div
              key={pro._id}
              className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-all hover:border-indigo-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative shrink-0">
                    {pro.profileImage ? (
                      <img
                        src={pro.profileImage}
                        alt={pro.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-base shadow-2xs">
                        {pro.name?.charAt(0) || 'P'}
                      </div>
                    )}
                    {pro.isVerified && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-2xs">
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{pro.name}</h4>
                    <p className="text-xs font-semibold text-indigo-600 truncate">{pro.profession}</p>
                    <p className="text-[11px] text-slate-500 truncate">{pro.specialization || pro.city}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-2xl">
                  <span className="font-bold text-slate-800">Fee: {formatINR(pro.consultationFee || 500)}</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>4.9</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/book/${pro.bookingSlug || pro._id}`}
                className="w-full text-center bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                Book Consultation
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
