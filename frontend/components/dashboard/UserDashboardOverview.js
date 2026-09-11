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
    <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-300 pb-16">
      {/* 1. Hero Welcome & Search Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-7 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Customer Portal • Verified Consultations</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Welcome back, {user?.name || 'Customer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Search and book appointments with verified Doctors, CAs, Lawyers, and Consultants across India.
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
            className="flex flex-col sm:flex-row items-stretch gap-2 max-w-lg pt-1.5"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, specialty, or profession..."
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Popular:</span>
            {POPULAR_SPECIALTIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => router.push(`/dashboard/find?search=${encodeURIComponent(cat.query)}`)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-slate-300 text-xs font-medium transition-all cursor-pointer"
                >
                  <Icon className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Decorative background glows */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Key Customer Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Upcoming</p>
            <p className="text-xl font-black text-slate-900">{confirmedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100/80 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending</p>
            <p className="text-xl font-black text-slate-900">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed</p>
            <p className="text-xl font-black text-slate-900">{completedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100/80 flex items-center justify-center text-sky-600 shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Visits</p>
            <p className="text-xl font-black text-slate-900">{appointments.length}</p>
          </div>
        </div>
      </div>

      {/* 3. Next Upcoming Appointment Spotlight */}
      {nextAppointment ? (
        <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
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
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {nextAppointment.professionalId?.name || 'Professional Consultant'}
                </h3>
                <p className="text-xs text-slate-300 mb-2">
                  {nextAppointment.appointmentTypeName || 'General Consultation'} • {nextAppointment.duration} mins
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{formatDisplayDate(nextAppointment.dateString)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{format12Hour(nextAppointment.startTime)} - {format12Hour(nextAppointment.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{nextAppointment.professionalId?.city || 'Online'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Link
                href="/dashboard/appointments"
                className="flex-1 md:flex-none text-center bg-white hover:bg-slate-100 active:scale-95 text-slate-900 font-semibold text-xs px-4 py-2 rounded-lg shadow-2xs transition-all cursor-pointer"
              >
                View Details
              </Link>
              <button
                onClick={() => handleCancel(nextAppointment._id)}
                disabled={cancellingId === nextAppointment._id}
                className="flex-1 md:flex-none text-center bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 border border-rose-500/30 text-rose-300 font-semibold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer"
              >
                {cancellingId === nextAppointment._id ? 'Cancelling...' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">No upcoming appointments</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Book an appointment with an experienced doctor, CA, lawyer, or consultant with instant confirmation.
          </p>
          <Link
            href="/dashboard/find"
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Browse Professionals</span>
          </Link>
        </div>
      )}

      {/* 4. Quick Customer Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          href="/dashboard/find"
          className="bg-white hover:bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs active:scale-95 transition-all flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">Find Experts</h4>
            <p className="text-[10px] text-slate-500">Doctors, CAs & Lawyers</p>
          </div>
        </Link>

        <Link
          href="/dashboard/appointments"
          className="bg-white hover:bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs active:scale-95 transition-all flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-600">My Bookings</h4>
            <p className="text-[10px] text-slate-500">Track status & queue</p>
          </div>
        </Link>

        <Link
          href="/dashboard/payments"
          className="bg-white hover:bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs active:scale-95 transition-all flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600">Invoices & Slips</h4>
            <p className="text-[10px] text-slate-500">Download receipts</p>
          </div>
        </Link>

        <Link
          href="/dashboard/messages"
          className="bg-white hover:bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs active:scale-95 transition-all flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-600">Live Chat</h4>
            <p className="text-[10px] text-slate-500">Direct message experts</p>
          </div>
        </Link>
      </div>

      {/* 5. Top Verified Professionals Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Top Verified Professionals</h2>
            <p className="text-xs text-slate-500">Book direct consultations with top-rated experts</p>
          </div>
          <Link
            href="/dashboard/find"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {professionals.map((pro) => (
            <div
              key={pro._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative shrink-0">
                    {pro.profileImage ? (
                      <img
                        src={pro.profileImage}
                        alt={pro.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                        {pro.name?.charAt(0) || 'P'}
                      </div>
                    )}
                    {pro.isVerified && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                        <Check className="w-2 h-2 text-white stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{pro.name}</h4>
                    <p className="text-xs font-semibold text-indigo-600 truncate">{pro.profession}</p>
                    <p className="text-[11px] text-slate-500 truncate">{pro.specialization || pro.city}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 mb-3 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-800">Fee: {formatINR(pro.consultationFee || 500)}</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Star className="w-3 h-3 fill-current" />
                    <span>4.9</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/book/${pro.bookingSlug || pro._id}`}
                className="w-full text-center bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-semibold text-xs py-2 rounded-lg transition-all cursor-pointer active:scale-95"
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
