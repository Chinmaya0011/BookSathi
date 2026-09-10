'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { professionalService } from '@/services/professional.service';
import { appointmentService } from '@/services/appointment.service';
import { appointmentTypeService } from '@/services/appointmentType.service';

import DashboardHero from '@/components/dashboard/DashboardHero';
import ProfileCompletionCard from '@/components/dashboard/ProfileCompletionCard';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import DashboardTrendsChart from '@/components/dashboard/DashboardTrendsChart';
import DashboardServiceDistribution from '@/components/dashboard/DashboardServiceDistribution';
import DashboardTodaySchedule from '@/components/dashboard/DashboardTodaySchedule';
import DashboardPeakHours from '@/components/dashboard/DashboardPeakHours';
import DashboardQuickShortcuts from '@/components/dashboard/DashboardQuickShortcuts';
import ManualBookingModal from '@/components/dashboard/ManualBookingModal';
import UserDashboardOverview from '@/components/dashboard/UserDashboardOverview';
import { connectSocket } from '@/lib/socket';

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

  // If not a professional, render customer dashboard
  if (role !== 'PROFESSIONAL') {
    return <UserDashboardOverview user={user} />;
  }

  return (
    <div className="space-y-5 sm:space-y-7 w-full pb-8 sm:pb-12 animate-in fade-in duration-300">
      {/* Profile Completion Checklist Card */}
      <ProfileCompletionCard />

      {/* 1. Hero Welcome & Quick Command Bar */}
      <DashboardHero
        profile={profile}
        loading={loading}
        refreshing={refreshing}
        copied={copied}
        onRefresh={() => loadDashboardData(true)}
        onOpenManualModal={() => setManualModalOpen(true)}
        onCopyBookingLink={handleCopyBookingLink}
      />

      {/* 2. 4 Core KPI Metric Cards */}
      <DashboardMetrics stats={stats} loading={loading} />

      {/* 3. Visual Analytics: 7-Day Trend + Service Breakdown Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardTrendsChart
          weeklyTrend={stats?.weeklyTrend}
          loading={loading}
        />
        <DashboardServiceDistribution
          serviceDistribution={stats?.serviceDistribution}
          loading={loading}
        />
      </div>

      {/* 4. Today's Live Schedule + Peak Hours Demand & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardTodaySchedule
          todaySchedule={stats?.todaySchedule}
          loading={loading}
          profile={profile}
          onOpenManualModal={() => setManualModalOpen(true)}
          onQuickStatusUpdate={handleQuickStatusUpdate}
          updatingStatusId={updatingStatusId}
        />

        <div className="space-y-6">
          <DashboardPeakHours hourlyDistribution={stats?.hourlyDistribution} />
          <DashboardQuickShortcuts />
        </div>
      </div>

      {/* 5. Manual Walk-In / Phone Booking Modal */}
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
