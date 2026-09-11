'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { professionalService } from '@/services/professional.service';
import { appointmentService } from '@/services/appointment.service';
import { appointmentTypeService } from '@/services/appointmentType.service';

import DashboardHero from '@/components/dashboard/DashboardHero';
import ProfileCompletionCard from '@/components/dashboard/ProfileCompletionCard';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import DashboardTodaySchedule from '@/components/dashboard/DashboardTodaySchedule';
import DashboardQuickShortcuts from '@/components/dashboard/DashboardQuickShortcuts';
import DashboardPeakHours from '@/components/dashboard/DashboardPeakHours';
import DashboardTrendsChart from '@/components/dashboard/DashboardTrendsChart';
import DashboardServiceDistribution from '@/components/dashboard/DashboardServiceDistribution';
import ManualBookingModal from '@/components/dashboard/ManualBookingModal';
import UserDashboardOverview from '@/components/dashboard/UserDashboardOverview';
import { connectSocket } from '@/lib/socket';
import {
  Clock,
  MessageCircle,
  Phone,
  Sparkles,
  CalendarCheck,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { format12Hour } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Manual booking modal state
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [manualForm, setManualForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    appointmentTypeId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    reason: '',
    fee: 500,
    duration: 30,
  });
  const [creatingManual, setCreatingManual] = useState(false);

  const role = user?.role || 'USER';

  useEffect(() => {
    if (role === 'ADMIN') {
      router.push('/admin');
      return;
    }

    if (role === 'PROFESSIONAL') {
      loadDashboardData();

      // Listen for FAB trigger from mobile bottom nav
      const handleOpenManual = () => setManualModalOpen(true);
      window.addEventListener('open-manual-booking-modal', handleOpenManual);

      // Connect to Socket.IO real-time updates for instant schedule sync
      const socket = connectSocket();
      if (socket) {
        const handleProUpdate = () => {
          loadDashboardData();
        };

        socket.on('appointment:created', handleProUpdate);
        socket.on('appointment:confirmed', handleProUpdate);
        socket.on('appointment:rejected', handleProUpdate);
        socket.on('appointment:cancelled', handleProUpdate);
        socket.on('appointment:rescheduled', handleProUpdate);
        socket.on('appointment:completed', handleProUpdate);

        return () => {
          window.removeEventListener('open-manual-booking-modal', handleOpenManual);
          socket.off('appointment:created', handleProUpdate);
          socket.off('appointment:confirmed', handleProUpdate);
          socket.off('appointment:rejected', handleProUpdate);
          socket.off('appointment:cancelled', handleProUpdate);
          socket.off('appointment:rescheduled', handleProUpdate);
          socket.off('appointment:completed', handleProUpdate);
        };
      }

      return () => {
        window.removeEventListener('open-manual-booking-modal', handleOpenManual);
      };
    }
  }, [role, router]);

  const loadDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, typesRes] = await Promise.all([
        professionalService.getStats(),
        appointmentTypeService.getAppointmentTypes().catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      const fetchedServices = typesRes.data || [];
      setServices(fetchedServices);

      if (fetchedServices.length > 0 && !manualForm.appointmentTypeId) {
        setManualForm((prev) => ({
          ...prev,
          appointmentTypeId: fetchedServices[0]._id,
          fee: fetchedServices[0].fee,
          duration: fetchedServices[0].duration,
        }));
      }
      if (isManualRefresh) {
        toast.success('Dashboard metrics refreshed');
      }
    } catch (e) {
      console.error('Error loading dashboard stats:', e);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCopyBookingLink = () => {
    if (!profile?.bookingSlug) return;
    const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/book/${profile.bookingSlug}`;
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    toast.success('Public booking link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleManualServiceChange = (typeId) => {
    const found = services.find((s) => s._id === typeId);
    if (found) {
      setManualForm((prev) => ({
        ...prev,
        appointmentTypeId: typeId,
        fee: found.fee,
        duration: found.duration,
      }));
    } else {
      setManualForm((prev) => ({ ...prev, appointmentTypeId: typeId }));
    }
  };

  const handleCreateManualBooking = async (e) => {
    e.preventDefault();
    if (!manualForm.customerName.trim() || !manualForm.customerPhone.trim()) {
      toast.warning('Please enter patient/client name and mobile number');
      return;
    }

    setCreatingManual(true);
    try {
      await appointmentService.createManualBooking(manualForm);
      setManualModalOpen(false);
      setManualForm({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        appointmentTypeId: services[0]?._id || '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        reason: '',
        fee: services[0]?.fee || 500,
        duration: services[0]?.duration || 30,
      });
      toast.success('Walk-in appointment scheduled successfully!');
      await loadDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create manual appointment');
    } finally {
      setCreatingManual(false);
    }
  };

  const handleQuickStatusUpdate = async (appointmentId, newStatus) => {
    setUpdatingStatusId(appointmentId);
    try {
      await appointmentService.updateStatus(appointmentId, newStatus);
      toast.success(`Appointment marked as ${newStatus.toLowerCase()}!`);
      await loadDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Find next upcoming patient today for the quick spotlight card
  const todaySchedule = stats?.todaySchedule || [];
  const nextPatient = useMemo(() => {
    return todaySchedule.find(
      (a) => a.status === 'CONFIRMED' || a.status === 'PENDING' || a.status === 'IN_PROGRESS' || a.status === 'ARRIVED'
    );
  }, [todaySchedule]);

  // If not a professional, render customer dashboard
  if (role !== 'PROFESSIONAL') {
    return <UserDashboardOverview user={user} />;
  }

  return (
    <div className="space-y-6 w-full pb-10 font-sans animate-in fade-in duration-300">
      {/* 1. Setup Health Checklist (Collapsible / Non-Intrusive) */}
      <ProfileCompletionCard />

      {/* 2. Top Hero Welcome & Quick Command Actions */}
      <DashboardHero
        profile={profile}
        loading={loading}
        refreshing={refreshing}
        copied={copied}
        onRefresh={() => loadDashboardData(true)}
        onOpenManualModal={() => setManualModalOpen(true)}
        onCopyBookingLink={handleCopyBookingLink}
      />

      {/* 3. ⭐ PRIMARY WORKING ZONE: Today's Live Schedule (Top Priority) + Live Queue & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Today's Appointments Timeline & Queue Actions */}
        <div className="lg:col-span-2">
          <DashboardTodaySchedule
            todaySchedule={stats?.todaySchedule}
            loading={loading}
            profile={profile}
            onOpenManualModal={() => setManualModalOpen(true)}
            onQuickStatusUpdate={handleQuickStatusUpdate}
            updatingStatusId={updatingStatusId}
          />
        </div>

        {/* Right 1 Col: Next Patient Spotlight + Quick Operational Shortcuts */}
        <div className="space-y-6">
          {/* Next Up Live Queue Spotlight Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Queue Spotlight
                </span>
                <span className="text-xs text-indigo-200/80 font-medium">
                  {todaySchedule.filter((a) => a.status !== 'CANCELLED' && a.status !== 'COMPLETED').length} in line
                </span>
              </div>

              {nextPatient ? (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-indigo-200">Next Upcoming Patient:</p>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {nextPatient.customerName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-indigo-200">
                    <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md font-semibold text-white">
                      <Clock className="w-3.5 h-3.5 text-indigo-300" />
                      {format12Hour(nextPatient.startTime)}
                    </span>
                    <span>•</span>
                    <span className="truncate">{nextPatient.appointmentTypeName || 'Consultation'}</span>
                  </div>

                  {nextPatient.customerPhone && (
                    <div className="pt-2 flex items-center gap-2">
                      <a
                        href={`https://wa.me/91${nextPatient.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hello ${nextPatient.customerName}, Dr./Pro ${profile?.name || ''} here regarding your appointment today at ${format12Hour(nextPatient.startTime)}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Patient</span>
                      </a>
                      <a
                        href={`tel:${nextPatient.customerPhone}`}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Call patient"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center space-y-1 text-indigo-200/80">
                  <CalendarCheck className="w-8 h-8 mx-auto text-indigo-400 mb-1" />
                  <p className="text-xs font-semibold text-white">No active queue right now</p>
                  <p className="text-[11px]">All scheduled patients for the hour have been seen.</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-xs text-indigo-200">
              <button
                type="button"
                onClick={() => setManualModalOpen(true)}
                className="hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Walk-In</span>
              </button>
              <Link
                href="/dashboard/appointments"
                className="hover:text-white font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Full Schedule</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Quick Operational Shortcuts */}
          <DashboardQuickShortcuts />
        </div>
      </div>

      {/* 4. KPI Performance & Operational Summary Cards (Placed below Today's Appointments) */}
      <div className="pt-2">
        <DashboardMetrics stats={stats} loading={loading} />
      </div>

      {/* 5. SECONDARY ANALYTICS (Important to Low Priority: Peak Hours, 7-Day Trend, Service Mix) */}
      <div className="pt-2 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Practice Analytics & Demand Insights
            </h2>
            <p className="text-[11px] text-slate-400">
              Historical trends, peak appointment hours, and treatment breakdown
            </p>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DashboardPeakHours hourlyDistribution={stats?.hourlyDistribution} />
          <DashboardTrendsChart
            weeklyTrend={stats?.weeklyTrend}
            loading={loading}
          />
          <DashboardServiceDistribution
            serviceDistribution={stats?.serviceDistribution}
            loading={loading}
          />
        </div>
      </div>

      {/* 6. Manual Walk-In / Phone Booking Modal */}
      <ManualBookingModal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        manualForm={manualForm}
        setManualForm={setManualForm}
        services={services}
        onServiceChange={handleManualServiceChange}
        onSubmit={handleCreateManualBooking}
        creatingManual={creatingManual}
      />
    </div>
  );
}
