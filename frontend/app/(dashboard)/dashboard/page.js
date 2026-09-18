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
import DashboardTrendsChart from '@/components/dashboard/DashboardTrendsChart';
import DashboardServiceDistribution from '@/components/dashboard/DashboardServiceDistribution';
import ManualBookingModal from '@/components/dashboard/ManualBookingModal';
import UserDashboardOverview from '@/components/dashboard/UserDashboardOverview';
import FreeTierLimitBanner from '@/components/dashboard/FreeTierLimitBanner';
import ProUpgradeModal from '@/components/dashboard/ProUpgradeModal';
import ProFeaturesHub from '@/components/dashboard/ProFeaturesHub';
import BatchWhatsAppModal from '@/components/dashboard/BatchWhatsAppModal';
import ConsultationReceiptModal from '@/components/dashboard/ConsultationReceiptModal';
import EmergencyNoticeModal from '@/components/dashboard/EmergencyNoticeModal';
import PrivateNotesModal from '@/components/dashboard/PrivateNotesModal';
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

import { dedupeQuery, invalidateQuery } from '@/lib/queryCache';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [callingNext, setCallingNext] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Pro feature modal states
  const [batchWhatsAppOpen, setBatchWhatsAppOpen] = useState(false);
  const [emergencyNoticeOpen, setEmergencyNoticeOpen] = useState(false);
  const [receiptModalAppt, setReceiptModalAppt] = useState(null);
  const [notesModalAppt, setNotesModalAppt] = useState(null);

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

  // Lazy-load appointment services only when user opens the walk-in modal
  const fetchServicesLazily = async () => {
    try {
      const data = await dedupeQuery(
        'appointment-types:active',
        async () => {
          const res = await appointmentTypeService.getAppointmentTypes();
          return res?.data || [];
        },
        { ttl: 300000 } // 5 minute cache
      );

      const fetchedServices = Array.isArray(data) ? data : [];
      setServices(fetchedServices);

      if (fetchedServices.length > 0 && !manualForm.appointmentTypeId) {
        setManualForm((prev) => ({
          ...prev,
          appointmentTypeId: fetchedServices[0]._id,
          fee: fetchedServices[0].fee,
          duration: fetchedServices[0].duration,
        }));
      }
    } catch (e) {
      console.error('Error fetching appointment types lazily:', e);
    }
  };

  const handleOpenManualModal = () => {
    setManualModalOpen(true);
    fetchServicesLazily();
  };

  // Load vital dashboard statistics and schedule
  const loadDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const statsRes = await dedupeQuery(
        'professional:stats',
        async () => {
          const res = await professionalService.getStats();
          return res?.data || res;
        },
        { ttl: 60000, force: isManualRefresh }
      );

      setStats(statsRes);
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

  useEffect(() => {
    if (role === 'ADMIN') {
      router.push('/admin');
      return;
    }

    if (role === 'PROFESSIONAL') {
      loadDashboardData();

      // Listen for FAB trigger from mobile bottom nav
      const handleOpenManual = () => handleOpenManualModal();
      window.addEventListener('open-manual-booking-modal', handleOpenManual);

      // Connect to Socket.IO real-time updates for instant schedule sync
      const socket = connectSocket();
      if (socket) {
        const handleProUpdate = () => {
          invalidateQuery('professional:stats');
          loadDashboardData(true);
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
      toast.warning('Please enter customer name and mobile number');
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

    // Optimistic UI update: Immediately update the item in state
    setStats((prev) => {
      if (!prev || !prev.todaySchedule) return prev;
      const updatedSchedule = prev.todaySchedule.map((item) => {
        if (item._id === appointmentId) {
          return {
            ...item,
            status: newStatus,
            completedAt:
              newStatus === 'DONE' || newStatus === 'COMPLETED'
                ? new Date().toISOString()
                : item.completedAt,
          };
        }
        return item;
      });
      return { ...prev, todaySchedule: updatedSchedule };
    });

    try {
      await appointmentService.updateStatus(appointmentId, newStatus);
      invalidateQuery('professional:stats');
      const actionName =
        newStatus === 'DONE' || newStatus === 'COMPLETED'
          ? 'marked as completed'
          : `updated to ${newStatus.toLowerCase()}`;
      toast.success(`Appointment ${actionName}!`);
      // Force refresh data in background to sync totals and server state
      await loadDashboardData(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
      // Revert / re-fetch on failure
      invalidateQuery('professional:stats');
      await loadDashboardData(true);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleCallNextQueue = async () => {
    setCallingNext(true);
    try {
      const res = await appointmentService.callNextQueue();
      const calledAppt = res.data?.appointment;
      if (calledAppt) {
        toast.success(`📢 Token #${calledAppt.queueNumber} (${calledAppt.customerName}) is now CALLED!`);
      } else {
        toast.info('No more waiting tokens in line for today.');
      }
      invalidateQuery('professional:stats');
      await loadDashboardData(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to call next queue token');
    } finally {
      setCallingNext(false);
    }
  };

  // CSV Financial & Patient Ledger Export for Pro
  const handleExportCSV = () => {
    if (!isPro) {
      setUpgradeModalOpen(true);
      return;
    }
    const schedule = stats?.todaySchedule || [];
    if (schedule.length === 0) {
      toast.info('No patient appointments recorded for today to export.');
      return;
    }

    const headers = [
      'Token/Slot',
      'Customer Name',
      'Phone',
      'Email',
      'Service',
      'Fee (INR)',
      'Status',
      'Payment Status',
      'Date',
    ];
    const rows = schedule.map((a) => [
      a.queueNumber ? `Token #${a.queueNumber}` : a.startTime || '10:00',
      `"${(a.customerName || '').replace(/"/g, '""')}"`,
      `"${a.customerPhone || ''}"`,
      `"${a.customerEmail || ''}"`,
      `"${(a.appointmentTypeName || 'Consultation').replace(/"/g, '""')}"`,
      a.fee || 500,
      a.status || 'BOOKED',
      a.paymentStatus || 'PENDING',
      a.date
        ? new Date(a.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `BookSaathi_Ledger_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('📊 Practice financial & patient ledger exported successfully!');
  };

  // Find next upcoming active customer today for the quick spotlight card
  const todaySchedule = stats?.todaySchedule || [];
  const nextCustomer = useMemo(() => {
    return todaySchedule.find(
      (a) =>
        a.status !== 'CANCELLED' &&
        a.status !== 'REJECTED' &&
        a.status !== 'NO_SHOW' &&
        a.status !== 'COMPLETED' &&
        a.status !== 'DONE'
    );
  }, [todaySchedule]);

  const activeQueueCount = useMemo(() => {
    return todaySchedule.filter(
      (a) =>
        a.status !== 'CANCELLED' &&
        a.status !== 'REJECTED' &&
        a.status !== 'COMPLETED' &&
        a.status !== 'DONE'
    ).length;
  }, [todaySchedule]);

  // Check Pro membership status
  const isPro =
    profile?.plan === 'PRO' &&
    (!profile?.planExpiresAt || new Date(profile.planExpiresAt) > new Date());

  const usedMonthlyBookings =
    stats?.monthCount !== undefined
      ? stats.monthCount
      : stats?.totalCount !== undefined
      ? stats.totalCount
      : todaySchedule.length;

  // If not a professional, render customer dashboard
  if (role !== 'PROFESSIONAL') {
    return <UserDashboardOverview user={user} />;
  }

  return (
    <div className="space-y-3.5 sm:space-y-4 w-full font-sans animate-in fade-in duration-300">
      {/* 0. Urgent Free Tier Quota & Upgrade Banner (Free Tier Only) */}
      {!isPro && (
        <FreeTierLimitBanner
          usedCount={usedMonthlyBookings}
          limit={15}
          onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
        />
      )}

      {/* 1. Setup Checklist (Collapsible / Non-Intrusive) */}
      <ProfileCompletionCard />

      {/* 2. Top Hero Welcome & Quick Command Actions */}
      <DashboardHero
        profile={profile}
        loading={loading}
        refreshing={refreshing}
        copied={copied}
        onRefresh={() => loadDashboardData(true)}
        onOpenManualModal={handleOpenManualModal}
        onCopyBookingLink={handleCopyBookingLink}
        onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
      />

      {/* 3. High-Priority KPI Metrics at a Glance */}
      <DashboardMetrics
        stats={stats}
        loading={loading}
        isPro={isPro}
        onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
      />

      {/* 4. ⭐ PRIMARY OPERATIONAL CENTERPIECE: Today's Live Schedule (Left 2 cols) + Next Spotlight & Shortcuts (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 items-stretch">
        {/* Left 2 Cols: Main Today's Appointments Timeline & Queue Actions */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <DashboardTodaySchedule
            todaySchedule={stats?.todaySchedule}
            loading={loading}
            profile={profile}
            onOpenManualModal={handleOpenManualModal}
            onQuickStatusUpdate={handleQuickStatusUpdate}
            updatingStatusId={updatingStatusId}
            onCallNextQueue={handleCallNextQueue}
            callingNext={callingNext}
            isPro={isPro}
            onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
            onOpenReceiptModal={(appt) => setReceiptModalAppt(appt)}
            onOpenNotesModal={(appt) => setNotesModalAppt(appt)}
          />
        </div>

        {/* Right 1 Col: Next Customer Spotlight + Quick Operational Shortcuts */}
        <div className="space-y-3.5 sm:space-y-4">
          {/* Next Up Live Queue Spotlight Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-4.5 text-white shadow-xs relative overflow-hidden flex flex-col justify-between border border-indigo-900/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-2.5 relative">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Queue Spotlight
                </span>
                <span className="text-[11px] text-indigo-200/90 font-medium px-2 py-0.2 rounded-full bg-white/10">
                  {activeQueueCount} in line
                </span>
              </div>

              {nextCustomer ? (
                <div className="space-y-2 pt-0.5">
                  <p className="text-[11px] text-indigo-300/80 font-medium">Next In-Line Consultation:</p>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                      {nextCustomer.customerName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-indigo-200 mt-0.5">
                      <span className="inline-flex items-center gap-1 bg-white/15 px-1.5 py-0.2 rounded-md font-bold text-white text-[11px]">
                        <Clock className="w-3 h-3 text-indigo-300" />
                        {format12Hour(nextCustomer.startTime)}
                      </span>
                      <span>•</span>
                      <span className="truncate text-indigo-200 font-medium text-[11px]">
                        {nextCustomer.appointmentTypeName || 'Consultation'}
                      </span>
                    </div>
                  </div>

                  {nextCustomer.customerPhone && (
                    <div className="pt-1.5 flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/91${nextCustomer.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hello ${nextCustomer.customerName}, Dr./Pro ${profile?.name || ''} here regarding your appointment today at ${format12Hour(nextCustomer.startTime)}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${nextCustomer.customerPhone}`}
                        className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Call customer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleQuickStatusUpdate(nextCustomer._id, 'DONE')}
                        className="ml-auto px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer"
                        title="Mark Done"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center space-y-1 text-indigo-200/80">
                  <CalendarCheck className="w-6 h-6 mx-auto text-indigo-400 mb-0.5" />
                  <p className="text-xs font-bold text-white">No active queue right now</p>
                  <p className="text-[11px] text-indigo-300/70">
                    All scheduled customers for today have been seen.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2.5 border-t border-white/10 mt-3 flex items-center justify-between text-xs text-indigo-200">
              <button
                type="button"
                onClick={handleOpenManualModal}
                className="hover:text-white font-bold flex items-center gap-1 transition-colors cursor-pointer text-xs"
              >
                <span>+ Walk-In</span>
              </button>
              <Link
                href="/dashboard/appointments"
                className="hover:text-white font-bold flex items-center gap-1 transition-colors text-xs"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Quick Operational Shortcuts */}
          <DashboardQuickShortcuts
            isPro={isPro}
            onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
          />
        </div>
      </div>

      {/* 5. Pro Practice Operating Suite Grid (8 Real Features & Free Locks) */}
      <ProFeaturesHub
        isPro={isPro}
        onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
        onOpenBatchWhatsApp={() => setBatchWhatsAppOpen(true)}
        onExportCSV={handleExportCSV}
        onOpenEmergencyNotice={() => setEmergencyNoticeOpen(true)}
        onOpenReceipt={() => {
          const firstAppt =
            todaySchedule.find((a) => a.status === 'DONE' || a.status === 'COMPLETED') ||
            todaySchedule[0];
          if (firstAppt) {
            setReceiptModalAppt(firstAppt);
          } else {
            toast.info('No appointments scheduled yet today to print receipts for.');
          }
        }}
        onOpenNotes={() => {
          const firstAppt = todaySchedule[0];
          if (firstAppt) {
            setNotesModalAppt(firstAppt);
          } else {
            toast.info('Add or select an appointment to attach case notes.');
          }
        }}
        todaySchedule={todaySchedule}
      />
      {/* 6. PRACTICE ANALYTICS & INSIGHTS: Balanced 2:1 Grid (Trends 2 cols + Distribution & Peak 1 col) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5 px-0.5">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Practice Analytics & Demand Insights
            </h2>
            <p className="text-[11px] text-slate-400">
              Historical trends, peak appointment hours, and treatment breakdown
            </p>
          </div>
          {!isPro && (
            <button
              type="button"
              onClick={() => setUpgradeModalOpen(true)}
              className="text-xs font-extrabold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>⚡ Unlock 30-Day Pro Reports</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 items-stretch">
          <div className="lg:col-span-2">
            <DashboardTrendsChart
              weeklyTrend={stats?.weeklyTrend}
              loading={loading}
              isPro={isPro}
              onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
            />
          </div>
          <div className="lg:col-span-1">
            <DashboardServiceDistribution
              serviceDistribution={stats?.serviceDistribution}
              hourlyDistribution={stats?.hourlyDistribution}
              loading={loading}
              isPro={isPro}
              onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
            />
          </div>
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
        profile={profile}
      />

      {/* 7. Pro Upgrade Modal */}
      <ProUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onUpgradeSuccess={() => loadDashboardData(true)}
      />

      {/* 8. Consultation Receipt Modal (Pro) */}
      <ConsultationReceiptModal
        isOpen={!!receiptModalAppt}
        onClose={() => setReceiptModalAppt(null)}
        appointment={receiptModalAppt}
        profile={profile}
      />

      {/* 9. Batch WhatsApp Broadcast Modal (Pro) */}
      <BatchWhatsAppModal
        isOpen={batchWhatsAppOpen}
        onClose={() => setBatchWhatsAppOpen(false)}
        todaySchedule={todaySchedule}
        profile={profile}
      />

      {/* 10. Emergency Notice Modal (Pro) */}
      <EmergencyNoticeModal
        isOpen={emergencyNoticeOpen}
        onClose={() => setEmergencyNoticeOpen(false)}
        profile={profile}
      />

      {/* 11. Private Case Notes Modal (Pro) */}
      <PrivateNotesModal
        isOpen={!!notesModalAppt}
        onClose={() => setNotesModalAppt(null)}
        appointment={notesModalAppt}
      />
    </div>
  );
}
