'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Settings,
  User,
  Briefcase,
  Clock,
  Sparkles,
  Shield,
  CreditCard,
  QrCode,
  CheckCircle2,
  Calendar,
  Ban,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Copy,
  Check,
  Building,
  MapPin,
  Save,
  MessageCircle,
  Sliders,
  ListOrdered,
  Stethoscope,
  Scale,
  Calculator,
  GraduationCap,
  Scissors,
  Activity,
  IndianRupee,
  Info,
  Timer,
  Coffee,
  Hourglass,
  CalendarCheck,
  ArrowRight,
  ArrowLeft,
  X,
  Layers,
  Zap,
  CheckCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useAvailability } from '@/hooks/useAvailability';
import { professionalService } from '@/services/professional.service';
import { appointmentTypeService } from '@/services/appointmentType.service';
import { getProfessionalPublicUrl } from '@/lib/urlHelpers';
import { formatINR } from '@/lib/utils';
import ProUpgradeModal from '@/components/dashboard/ProUpgradeModal';

const TABS = [
  { id: 'profile', label: 'Business Profile', icon: User, desc: 'Name, profession & clinic info' },
  { id: 'booking-mode', label: 'Booking Mode & Slot Gaps', icon: Sliders, desc: 'Time slots vs Live OPD token queue' },
  { id: 'services', label: 'Services & Fees', icon: Briefcase, desc: 'Consultation types & pricing' },
  { id: 'hours', label: 'Working Hours & Holidays', icon: Clock, desc: 'Weekly schedule & exceptions' },
  { id: 'booking', label: 'My Link & QR', icon: Sparkles, desc: 'Public URL & printable standee' },
  { id: 'account', label: 'Account & Plan', icon: Shield, desc: 'Password & Pro subscription' },
];

const PROFESSIONS = [
  { id: 'DOCTOR', label: 'Doctor / Clinic', icon: Stethoscope },
  { id: 'CA', label: 'Chartered Accountant (CA)', icon: Calculator },
  { id: 'LAWYER', label: 'Advocate / Lawyer', icon: Scale },
  { id: 'CONSULTANT', label: 'Consultant / Advisor', icon: Briefcase },
  { id: 'TUTOR', label: 'Tutor / Teacher', icon: GraduationCap },
  { id: 'SALON', label: 'Salon / Beauty Spa', icon: Scissors },
  { id: 'COACH_TRAINER', label: 'Fitness / Yoga Coach', icon: Activity },
  { id: 'OTHER', label: 'Other Professional', icon: Building },
];

const DURATION_PRESETS = [15, 20, 30, 45, 60, 90];
const BUFFER_PRESETS = [0, 5, 10, 15, 20, 30];

const MIN_NOTICE_OPTIONS = [
  { value: 0, label: 'Immediate (No minimum notice)' },
  { value: 15, label: '15 minutes in advance' },
  { value: 30, label: '30 minutes in advance' },
  { value: 60, label: '1 hour in advance' },
  { value: 120, label: '2 hours in advance' },
  { value: 240, label: '4 hours in advance' },
  { value: 1440, label: '24 hours in advance (1 day)' },
];

const MAX_ADVANCE_OPTIONS = [
  { value: 7, label: '7 days ahead' },
  { value: 14, label: '14 days (2 weeks)' },
  { value: 30, label: '30 days (1 month)' },
  { value: 60, label: '60 days (2 months)' },
  { value: 90, label: '90 days (3 months)' },
  { value: 180, label: '180 days (6 months)' },
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper to convert "HH:MM" to total minutes from midnight
function timeStrToMinutes(str) {
  if (!str) return 0;
  const [h, m] = str.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams ? searchParams.get('tab') : null;
  const [activeTab, setActiveTab] = useState(urlTab || 'profile');
  const { profile, user, refreshProfile } = useAuth();

  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Profile & Booking Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    profession: 'DOCTOR',
    specialization: '',
    clinicName: '',
    address: '',
    city: '',
    bio: '',
    bookingSlug: '',
    consultationFee: 500,
    upiId: '',
    bookingType: 'TIME_SLOT',
    // Scheduled Slot Settings
    appointmentDuration: 30,
    bufferTime: 10,
    minNoticeMinutes: 0,
    maxAdvanceDays: 60,
    allowSameDayBooking: true,
    // Live Queue Settings
    queueDailyLimit: 50,
    queueStartTime: '09:00',
    queueEndTime: '18:00',
    lastBookingTime: '17:00',
  });

  // Services State
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    name: '',
    duration: 30,
    fee: 500,
    description: '',
  });
  const [addingService, setAddingService] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Working Hours & Availability from Hook
  const {
    availability,
    loading: loadingAvailability,
    saving: savingAvailability,
    toggleDay,
    updateTimeRange,
    addTimeRange,
    removeTimeRange,
    copyMondayToAll,
    saveAvailability,
  } = useAvailability();

  // Blocked Dates State
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState({
    date: '',
    reason: '',
  });

  useEffect(() => {
    if (urlTab && TABS.some((t) => t.id === urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || user?.name || '',
        profession: profile.profession || 'DOCTOR',
        specialization: profile.specialization || '',
        clinicName: profile.clinicName || profile.businessName || '',
        address: profile.address?.street || profile.address || '',
        city: profile.address?.city || profile.city || '',
        bio: profile.bio || '',
        bookingSlug: profile.bookingSlug || '',
        consultationFee: profile.consultationFee || 500,
        upiId: profile.paymentSettings?.upiId || profile.upiId || '',
        bookingType: profile.bookingType || 'TIME_SLOT',
        // Scheduled Slot Settings
        appointmentDuration: profile.bookingSettings?.appointmentDuration || 30,
        bufferTime: profile.bookingSettings?.bufferTime ?? 10,
        minNoticeMinutes: profile.bookingSettings?.minNoticeMinutes ?? 0,
        maxAdvanceDays: profile.bookingSettings?.maxAdvanceDays || 60,
        allowSameDayBooking: profile.bookingSettings?.allowSameDayBooking !== false,
        // Live Queue Settings
        queueDailyLimit: profile.queueSettings?.dailyLimit || 50,
        queueStartTime: profile.queueSettings?.queueStartTime || '09:00',
        queueEndTime: profile.queueSettings?.queueEndTime || '18:00',
        lastBookingTime: profile.queueSettings?.lastBookingTime || '17:00',
      });
    }
  }, [profile, user]);

  useEffect(() => {
    loadServices();
    loadBlockedDates();
  }, []);

  const loadServices = async () => {
    try {
      const res = await appointmentTypeService.getAppointmentTypes();
      setServices(res?.data || []);
    } catch (e) {}
  };

  const loadBlockedDates = async () => {
    try {
      const res = await professionalService.getBlockedDates();
      setBlockedDates(res?.data || []);
    } catch (e) {}
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    router.replace(`/dashboard/setup?tab=${tabId}`, { scroll: false });
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await professionalService.updateProfile({
        name: profileForm.name,
        profession: profileForm.profession,
        specialization: profileForm.specialization,
        clinicName: profileForm.clinicName,
        businessName: profileForm.clinicName,
        bio: profileForm.bio,
        consultationFee: Number(profileForm.consultationFee) || 500,
        bookingType: profileForm.bookingType,
        paymentSettings: {
          upiId: profileForm.upiId.trim(),
        },
        bookingSettings: {
          appointmentDuration: Number(profileForm.appointmentDuration) || 30,
          bufferTime: Number(profileForm.bufferTime) >= 0 ? Number(profileForm.bufferTime) : 10,
          minNoticeMinutes: Number(profileForm.minNoticeMinutes) || 0,
          maxAdvanceDays: Number(profileForm.maxAdvanceDays) || 60,
          allowSameDayBooking: Boolean(profileForm.allowSameDayBooking),
        },
        queueSettings: {
          dailyLimit: Number(profileForm.queueDailyLimit) || 50,
          queueStartTime: profileForm.queueStartTime || '09:00',
          queueEndTime: profileForm.queueEndTime || '18:00',
          lastBookingTime: profileForm.lastBookingTime || '17:00',
        },
        address: {
          street: profileForm.address,
          city: profileForm.city,
        },
      });
      await refreshProfile();
      toast.success('Practice settings updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newService.name.trim()) {
      toast.warning('Please enter service name');
      return;
    }
    try {
      await appointmentTypeService.createAppointmentType(newService);
      setNewService({ name: '', duration: 30, fee: 500, description: '' });
      setAddingService(false);
      toast.success('New service added successfully!');
      loadServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add service');
    }
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    if (!editingService?.name?.trim()) {
      toast.warning('Please enter service name');
      return;
    }
    try {
      await appointmentTypeService.updateAppointmentType(editingService._id, editingService);
      setEditingService(null);
      toast.success('Service updated successfully!');
      loadServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update service');
    }
  };

  const handleDeleteService = async (id) => {
    try {
      await appointmentTypeService.deleteAppointmentType(id);
      toast.success('Service removed');
      loadServices();
    } catch (err) {
      toast.error('Failed to remove service');
    }
  };

  const handleAddBlockedDate = async (e) => {
    e.preventDefault();
    if (!newBlockedDate.date) {
      toast.warning('Please pick a date to block');
      return;
    }
    try {
      await professionalService.addBlockedDate(newBlockedDate);
      setNewBlockedDate({ date: '', reason: '' });
      toast.success('Date blocked from public booking');
      loadBlockedDates();
    } catch (err) {
      toast.error('Failed to block date');
    }
  };

  const handleRemoveBlockedDate = async (id) => {
    try {
      await professionalService.removeBlockedDate(id);
      toast.success('Date unblocked');
      loadBlockedDates();
    } catch (err) {
      toast.error('Failed to unblock date');
    }
  };

  const copyBookingLink = () => {
    const bookingUrl = getProfessionalPublicUrl(profile);
    if (!bookingUrl) return;
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    toast.success('Public booking URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const bookingUrl = getProfessionalPublicUrl(profile);
  const isPro =
    profile?.plan === 'PRO' &&
    (!profile?.planExpiresAt || new Date(profile.planExpiresAt) > new Date());

  // ==========================================
  // 🔗 INTER-LINKED LOGIC & CAPACITY CALCULATOR
  // ==========================================
  const scheduleIntelligence = useMemo(() => {
    const baseDuration = Number(profileForm.appointmentDuration) || 30;
    const bufferGap = Number(profileForm.bufferTime) >= 0 ? Number(profileForm.bufferTime) : 10;
    const baseTotalBlock = baseDuration + bufferGap;

    // 1. Calculate working minutes for each day
    const dayStats = availability.map((day) => {
      if (!day.enabled || !day.timeRanges || day.timeRanges.length === 0) {
        return { dayOfWeek: day.dayOfWeek, enabled: false, totalMinutes: 0, slotsCount: 0 };
      }

      let totalMins = 0;
      day.timeRanges.forEach((range) => {
        const start = timeStrToMinutes(range.startTime);
        const end = timeStrToMinutes(range.endTime);
        if (end > start) {
          totalMins += end - start;
        }
      });

      const daySlots = baseTotalBlock > 0 ? Math.floor(totalMins / baseTotalBlock) : 0;
      return {
        dayOfWeek: day.dayOfWeek,
        enabled: true,
        totalMinutes: totalMins,
        totalHours: (totalMins / 60).toFixed(1),
        slotsCount: daySlots,
      };
    });

    const openDays = dayStats.filter((d) => d.enabled);
    const openDaysCount = openDays.length;
    const totalWeeklyMinutes = dayStats.reduce((acc, d) => acc + d.totalMinutes, 0);
    const avgDailyMinutes = openDaysCount > 0 ? Math.round(totalWeeklyMinutes / openDaysCount) : 0;
    const defaultDailySlots = baseTotalBlock > 0 ? Math.floor(avgDailyMinutes / baseTotalBlock) : 0;
    const totalWeeklySlots = dayStats.reduce((acc, d) => acc + d.slotsCount, 0);

    // 2. Calculate impact on configured services
    const servicesBreakdown = services.map((srv) => {
      const srvDuration = Number(srv.duration) || 30;
      const srvTotalBlock = srvDuration + bufferGap;
      const dailySessions = srvTotalBlock > 0 ? Math.floor(avgDailyMinutes / srvTotalBlock) : 0;
      return {
        id: srv._id,
        name: srv.name,
        duration: srvDuration,
        fee: srv.fee,
        bufferGap,
        totalBlock: srvTotalBlock,
        dailyCapacity: dailySessions,
      };
    });

    return {
      baseDuration,
      bufferGap,
      baseTotalBlock,
      openDaysCount,
      avgDailyMinutes,
      avgDailyHours: (avgDailyMinutes / 60).toFixed(1),
      defaultDailySlots,
      totalWeeklySlots,
      dayStatsMap: new Map(dayStats.map((d) => [d.dayOfWeek, d])),
      servicesBreakdown,
    };
  }, [availability, profileForm.appointmentDuration, profileForm.bufferTime, services]);

  // Helper to format sample timeline slots
  const previewSlots = useMemo(() => {
    const dur = Number(profileForm.appointmentDuration) || 30;
    const buf = Number(profileForm.bufferTime) >= 0 ? Number(profileForm.bufferTime) : 10;
    let startMins = 10 * 60; // 10:00 AM

    const formatMins = (m) => {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 || 12;
      return `${displayH}:${min.toString().padStart(2, '0')} ${ampm}`;
    };

    const slots = [];
    for (let i = 0; i < 3; i++) {
      const slotStart = startMins;
      const slotEnd = slotStart + dur;
      const bufferEnd = slotEnd + buf;

      slots.push({
        index: i + 1,
        slotStartTime: formatMins(slotStart),
        slotEndTime: formatMins(slotEnd),
        bufferStartTime: formatMins(slotEnd),
        bufferEndTime: formatMins(bufferEnd),
        duration: dur,
        buffer: buf,
      });

      startMins = bufferEnd;
    }
    return slots;
  }, [profileForm.appointmentDuration, profileForm.bufferTime]);

  const isInterlinkedTab =
    activeTab === 'booking-mode' || activeTab === 'services' || activeTab === 'hours';

  return (
    <div className="space-y-4 font-sans animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Practice Setup & Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your profession, slot times, rest buffers, services, and weekly working hours.
          </p>
        </div>

        {bookingUrl && (
          <button
            type="button"
            onClick={copyBookingLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Link Copied' : 'Copy Booking Link'}</span>
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs overflow-x-auto no-scrollbar flex items-center gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 🔗 UNIFIED PRACTICE SCHEDULE BLUEPRINT (INTER-LINK HEALTH BAR) */}
      {/* ========================================================================= */}
      {isInterlinkedTab && (
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800 space-y-3.5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-800/50 pb-2.5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-indigo-200">
                Live Inter-linked Schedule Engine
              </span>
            </div>
            <span className="text-[11px] text-indigo-300">
              Working Hours, Slot Intervals & Services are synchronized in real-time
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* 1. Working Schedule Container */}
            <div
              onClick={() => handleTabChange('hours')}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group space-y-1"
            >
              <div className="flex items-center justify-between text-indigo-300 text-[11px] font-semibold">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  Working Hours
                </span>
                <span className="text-[10px] text-indigo-400 group-hover:text-white">Edit →</span>
              </div>
              <div className="font-extrabold text-sm text-white">
                {scheduleIntelligence.openDaysCount} Days Open / Wk
              </div>
              <div className="text-[11px] text-slate-300">
                Avg. ~{scheduleIntelligence.avgDailyHours} hrs/day available
              </div>
            </div>

            {/* 2. Slot & Buffer Footprint */}
            <div
              onClick={() => handleTabChange('booking-mode')}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group space-y-1"
            >
              <div className="flex items-center justify-between text-indigo-300 text-[11px] font-semibold">
                <span className="flex items-center gap-1">
                  <Timer className="w-3 h-3 text-amber-400" />
                  Slot & Buffer
                </span>
                <span className="text-[10px] text-indigo-400 group-hover:text-white">Edit →</span>
              </div>
              <div className="font-extrabold text-sm text-white">
                {scheduleIntelligence.baseTotalBlock}m Total Window
              </div>
              <div className="text-[11px] text-slate-300">
                {scheduleIntelligence.baseDuration}m slot + {scheduleIntelligence.bufferGap}m rest buffer
              </div>
            </div>

            {/* 3. Services Catalog */}
            <div
              onClick={() => handleTabChange('services')}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group space-y-1"
            >
              <div className="flex items-center justify-between text-indigo-300 text-[11px] font-semibold">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-emerald-400" />
                  Custom Services
                </span>
                <span className="text-[10px] text-indigo-400 group-hover:text-white">Edit →</span>
              </div>
              <div className="font-extrabold text-sm text-white">
                {services.length} Service{services.length === 1 ? '' : 's'} Configured
              </div>
              <div className="text-[11px] text-slate-300">
                {services.length > 0 ? 'Custom durations active' : `Base fee: ₹${profileForm.consultationFee}`}
              </div>
            </div>

            {/* 4. Live Daily Capacity */}
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 space-y-1">
              <div className="text-amber-300 text-[11px] font-bold flex items-center gap-1">
                <CalendarCheck className="w-3 h-3" />
                Calculated Daily Capacity
              </div>
              <div className="font-black text-sm text-white">
                ~{scheduleIntelligence.defaultDailySlots} Appointments / Day
              </div>
              <div className="text-[11px] text-indigo-200">
                Up to ~{scheduleIntelligence.totalWeeklySlots} total clients / week
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Business Profile & Profession */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6 animate-in fade-in duration-200 max-w-4xl">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Professional & Practice Details</h2>
            <p className="text-xs text-slate-500">
              Select your profession category and update details shown on your public booking page.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Profession Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Your Profession Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROFESSIONS.map((prof) => {
                  const Icon = prof.icon;
                  const isSelected = profileForm.profession === prof.id;
                  return (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, profession: prof.id })}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 text-indigo-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white font-medium'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                      <span className="text-xs leading-tight">{prof.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name / Title</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specialization / Qualifications</label>
                <input
                  type="text"
                  value={profileForm.specialization}
                  onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                  placeholder="e.g. MBBS, MD / FCA, DISA / High Court Advocate"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinic / Chamber / Office Name</label>
                <input
                  type="text"
                  value={profileForm.clinicName}
                  onChange={(e) => setProfileForm({ ...profileForm, clinicName: e.target.value })}
                  placeholder="e.g. Apollo Clinic / Singhania Tax Chamber"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Direct UPI ID (for 0% commission fees)</label>
                <input
                  type="text"
                  value={profileForm.upiId}
                  onChange={(e) => setProfileForm({ ...profileForm, upiId: e.target.value })}
                  placeholder="e.g. yourname@okhdfcbank / paytm"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Practice Address & City</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="Street, locality, city, state"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">About Your Practice (Short Bio)</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Brief introductory overview for your clients..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('booking-mode')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                <span>Next: Booking Mode & Slot Gaps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Booking Mode & Slot Gaps (Inter-linked with Hours & Services) */}
      {activeTab === 'booking-mode' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6 animate-in fade-in duration-200 max-w-4xl">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Appointment Mode & Slot Gap Engine</h2>
              <p className="text-xs text-slate-500">
                Configure appointment duration, rest buffer gaps, and how they allocate slots across your weekly working hours.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTabChange('hours')}
                className="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors"
              >
                🕒 Active Hours: {scheduleIntelligence.openDaysCount} Days/Wk
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Booking Mode 2-Option Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Scheduled Time Slots */}
              <div
                onClick={() => setProfileForm({ ...profileForm, bookingType: 'TIME_SLOT' })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  profileForm.bookingType === 'TIME_SLOT'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    {profileForm.bookingType === 'TIME_SLOT' && (
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                        Active Mode
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Scheduled Time Slots
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Clients choose specific available times (e.g. 10:00 AM, 11:30 AM). Best for CAs, Lawyers, Consultants, and Private Clinics.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-indigo-700 pt-1">
                  ✓ Custom slot durations • Buffer gaps • Double-booking guard
                </div>
              </div>

              {/* Option 2: Live OPD / Token Queue */}
              <div
                onClick={() => setProfileForm({ ...profileForm, bookingType: 'QUEUE' })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  profileForm.bookingType === 'QUEUE'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <ListOrdered className="w-5 h-5" />
                    </div>
                    {profileForm.bookingType === 'QUEUE' && (
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                        Active Mode
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Live OPD / Token Queue
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Clients join today's queue and receive sequential token numbers (#01, #02, #03) with live wait tracking. Best for OPD Clinics and Walk-in Centers.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-emerald-700 pt-1">
                  ✓ Sequential tokens • Walk-in patient injection • Live calling
                </div>
              </div>
            </div>

            {/* Scheduled Time Slots Custom Configuration */}
            {profileForm.bookingType === 'TIME_SLOT' && (
              <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-200/80 space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-indigo-700" />
                    Slot Durations & Buffer Gap Allocation
                  </h4>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                    {scheduleIntelligence.defaultDailySlots} Slots Available / Day
                  </span>
                </div>

                {/* 1. Default Slot Duration */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      Default Appointment Slot Duration
                    </label>
                    <span className="text-xs font-black text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200 shadow-2xs">
                      {profileForm.appointmentDuration} minutes / client
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Standard consultation duration when a client books general appointment without a specific service.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {DURATION_PRESETS.map((dur) => {
                      const isSelected = Number(profileForm.appointmentDuration) === dur;
                      return (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, appointmentDuration: dur })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs scale-102'
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {dur} mins
                        </button>
                      );
                    })}
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-400 font-semibold">Custom:</span>
                      <input
                        type="number"
                        min={5}
                        max={360}
                        value={profileForm.appointmentDuration}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            appointmentDuration: Math.max(5, Number(e.target.value) || 5),
                          })
                        }
                        className="w-14 text-xs font-bold text-indigo-700 outline-none text-center"
                      />
                      <span className="text-[11px] text-slate-500 font-medium">m</span>
                    </div>
                  </div>
                </div>

                {/* 2. Buffer Gap Between Slots */}
                <div className="space-y-2 pt-2 border-t border-indigo-100/70">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5 text-amber-600" />
                      Rest / Buffer Gap Between Appointments
                    </label>
                    <span className="text-xs font-black text-amber-700 bg-white px-2.5 py-0.5 rounded-lg border border-amber-200 shadow-2xs">
                      {profileForm.bufferTime > 0 ? `${profileForm.bufferTime} minutes gap` : '0 min (Back-to-back)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Automatically added after EVERY appointment to prevent client delay overlap, sanitize rooms, and give you rest.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {BUFFER_PRESETS.map((buf) => {
                      const isSelected = Number(profileForm.bufferTime) === buf;
                      return (
                        <button
                          key={buf}
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, bufferTime: buf })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-600 text-white shadow-xs scale-102'
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {buf === 0 ? '0 min (Back-to-Back)' : `${buf} mins`}
                        </button>
                      );
                    })}
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-400 font-semibold">Custom:</span>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={profileForm.bufferTime}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            bufferTime: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="w-14 text-xs font-bold text-amber-700 outline-none text-center"
                      />
                      <span className="text-[11px] text-slate-500 font-medium">m</span>
                    </div>
                  </div>
                </div>

                {/* 3. Live Visual Timeline Preview */}
                <div className="p-3.5 rounded-xl bg-white border border-indigo-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Hourglass className="w-3.5 h-3.5 text-indigo-600" />
                      Live Schedule Timeline Preview
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Total Blocked Window:{' '}
                      <strong className="text-slate-900">
                        {Number(profileForm.appointmentDuration) + Number(profileForm.bufferTime)} mins
                      </strong>{' '}
                      per client
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {previewSlots.map((slot) => (
                      <div
                        key={slot.index}
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900">
                          <span>Slot #{slot.index}</span>
                          <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded text-[10px]">
                            {slot.duration}m Session
                          </span>
                        </div>
                        <div className="text-xs font-extrabold text-slate-800">
                          {slot.slotStartTime} - {slot.slotEndTime}
                        </div>
                        {slot.buffer > 0 ? (
                          <div className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                            <Coffee className="w-3 h-3 text-amber-600" />
                            <span>
                              {slot.buffer}m Gap ({slot.bufferStartTime} - {slot.bufferEndTime})
                            </span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 font-medium italic">
                            No gap (Next slot starts immediately)
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Inter-link Impact on Configured Services */}
                {scheduleIntelligence.servicesBreakdown.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                        How Your Buffer Gap ({scheduleIntelligence.bufferGap}m) Applies to Your Services:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTabChange('services')}
                        className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Manage Services →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {scheduleIntelligence.servicesBreakdown.map((srv) => (
                        <div key={srv.id} className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] space-y-1">
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span className="truncate">{srv.name}</span>
                            <span className="text-emerald-700">₹{srv.fee}</span>
                          </div>
                          <div className="text-slate-500 text-[10px]">
                            {srv.duration}m service + {srv.bufferGap}m buffer = <strong>{srv.totalBlock}m total</strong>
                          </div>
                          <div className="text-[10px] text-indigo-700 font-semibold">
                            ~{srv.dailyCapacity} max sessions / day
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Advance Notice & Booking Rules */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-indigo-100/70">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Minimum Notice Required
                    </label>
                    <select
                      value={profileForm.minNoticeMinutes}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, minNoticeMinutes: Number(e.target.value) })
                      }
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 outline-none"
                    >
                      {MIN_NOTICE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Prevents last-second surprise bookings
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Max Advance Booking Window
                    </label>
                    <select
                      value={profileForm.maxAdvanceDays}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, maxAdvanceDays: Number(e.target.value) })
                      }
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 outline-none"
                    >
                      {MAX_ADVANCE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      How far into future clients can book
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Allow Same-Day Booking
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setProfileForm({
                          ...profileForm,
                          allowSameDayBooking: !profileForm.allowSameDayBooking,
                        })
                      }
                      className={`w-full p-2 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        profileForm.allowSameDayBooking
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span>{profileForm.allowSameDayBooking ? '✓ Yes, Allowed' : '✕ Disabled'}</span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          profileForm.allowSameDayBooking ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                    </button>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Allow clients to book slots for today
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Queue Mode Settings (visible when Queue Mode is active) */}
            {profileForm.bookingType === 'QUEUE' && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-4 animate-in fade-in duration-200">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4 text-emerald-700" />
                  Live Token Queue Rules
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Max Daily Tokens</label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={profileForm.queueDailyLimit}
                      onChange={(e) => setProfileForm({ ...profileForm, queueDailyLimit: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Max tokens issued per day</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Queue Opens At</label>
                    <input
                      type="time"
                      value={profileForm.queueStartTime}
                      onChange={(e) => setProfileForm({ ...profileForm, queueStartTime: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">When clients can start booking</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Queue Closes At</label>
                    <input
                      type="time"
                      value={profileForm.queueEndTime}
                      onChange={(e) => setProfileForm({ ...profileForm, queueEndTime: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Closing time for appointments</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Booking Mode & Slot Rules'}</span>
              </button>

              <div className="flex items-center gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleTabChange('profile')}
                  className="text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Business Profile</span>
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => handleTabChange('services')}
                  className="text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
                >
                  <span>Services & Fees</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Services & Consultation Fees (Inter-linked with Slot Gaps & Hours) */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5 animate-in fade-in duration-200 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Services & Consultation Types</h2>
              <p className="text-xs text-slate-500">
                Define individual consultation services. Each service duration dynamically sets the required slot length on your calendar.
              </p>
            </div>
            {!addingService && !editingService && (
              <button
                type="button"
                onClick={() => setAddingService(true)}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Service</span>
              </button>
            )}
          </div>

          {/* Active Buffer Gap Context Banner */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <Coffee className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Active Rest Buffer: <strong>+{scheduleIntelligence.bufferGap} mins</strong> is added after every service booking.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleTabChange('booking-mode')}
              className="text-[11px] font-bold text-amber-800 hover:underline shrink-0"
            >
              Adjust Buffer Gap →
            </button>
          </div>

          {/* Add Service Inline Form */}
          {addingService && (
            <form onSubmit={handleAddService} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  New Service Item
                </h3>
                <button
                  type="button"
                  onClick={() => setAddingService(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    placeholder="e.g. General Consultation / Root Canal / ITR Filing"
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Slot Duration (Mins)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={5}
                      max={360}
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
                      placeholder="30"
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500 font-semibold"
                      required
                    />
                    <span className="text-xs text-slate-400 font-medium">mins</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Fee (in ₹)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      value={newService.fee}
                      onChange={(e) => setNewService({ ...newService, fee: Number(e.target.value) })}
                      placeholder="500"
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500 font-semibold"
                      required
                    />
                    <span className="text-xs text-slate-400 font-medium">₹</span>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Short Description (Optional)</label>
                  <input
                    type="text"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Brief note for clients explaining what this session covers..."
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Duration Quick Presets & Impact Calculation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-semibold">Quick Durations:</span>
                  {DURATION_PRESETS.map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setNewService({ ...newService, duration: dur })}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                        newService.duration === dur
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>

                <span className="text-[11px] text-indigo-700 font-bold bg-indigo-50 px-2 py-1 rounded-lg">
                  Reserves {Number(newService.duration || 30) + scheduleIntelligence.bufferGap}m total window
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Save Service
                </button>
                <button
                  type="button"
                  onClick={() => setAddingService(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Edit Service Form */}
          {editingService && (
            <form onSubmit={handleUpdateService} className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                  Edit Service: {editingService.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    value={editingService.name}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Slot Duration (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    max={360}
                    value={editingService.duration}
                    onChange={(e) => setEditingService({ ...editingService, duration: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Fee (in ₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingService.fee}
                    onChange={(e) => setEditingService({ ...editingService, fee: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500 font-semibold"
                    required
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={editingService.description || ''}
                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-indigo-200/60">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Update Service
                </button>
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Services List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No Custom Services Added Yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Clients will book your default consultation fee (₹{profileForm.consultationFee}) with a {profileForm.appointmentDuration} min slot.
                </p>
                <button
                  type="button"
                  onClick={() => setAddingService(true)}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Service</span>
                </button>
              </div>
            ) : (
              services.map((srv) => {
                const totalSlotBlock = (srv.duration || 30) + scheduleIntelligence.bufferGap;
                const dailyCapacity =
                  totalSlotBlock > 0 ? Math.floor(scheduleIntelligence.avgDailyMinutes / totalSlotBlock) : 0;

                return (
                  <div
                    key={srv._id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex flex-col justify-between shadow-2xs space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{srv.name}</h4>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ₹{srv.fee}
                        </span>
                      </div>
                      {srv.description && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{srv.description}</p>
                      )}

                      <div className="mt-3 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                        <div className="flex items-center justify-between text-slate-700 font-semibold">
                          <span className="flex items-center gap-1 text-indigo-700 font-bold">
                            <Clock className="w-3 h-3" />
                            {srv.duration}m session
                          </span>
                          <span className="text-amber-700 font-semibold">
                            +{scheduleIntelligence.bufferGap}m buffer
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 border-t border-slate-200/50">
                          <span>Total block: <strong>{totalSlotBlock} mins</strong></span>
                          <span className="text-indigo-700 font-bold">~{dailyCapacity} / day</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingService(srv)}
                        className="text-slate-600 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(srv._id)}
                        className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleTabChange('booking-mode')}
              className="text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Booking Mode & Slot Gaps</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('hours')}
              className="text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
            >
              <span>Working Hours & Holidays</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Working Hours & Blocked Dates (Inter-linked with Slot Timings) */}
      {activeTab === 'hours' && (
        <div className="space-y-4 animate-in fade-in duration-200 max-w-4xl">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Weekly Working Schedule</h2>
                <p className="text-xs text-slate-500">
                  Set open shift hours for each day of the week. Slots are automatically segmented based on your {profileForm.appointmentDuration}m slot + {profileForm.bufferTime}m buffer settings.
                </p>
              </div>

              <button
                type="button"
                onClick={copyMondayToAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Monday to All</span>
              </button>
            </div>

            <div className="space-y-3 divide-y divide-slate-100">
              {availability.map((day) => {
                const dayName = DAY_NAMES[day.dayOfWeek];
                const stats = scheduleIntelligence.dayStatsMap.get(day.dayOfWeek);

                return (
                  <div key={day.dayOfWeek} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="w-36 font-bold text-slate-800 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${day.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span>{dayName}</span>
                      </div>
                      {day.enabled && stats && (
                        <div className="text-[10px] text-indigo-700 font-semibold pl-4.5">
                          {stats.totalHours}h open • ~{stats.slotsCount} slots
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      {day.enabled && day.timeRanges?.length > 0 ? (
                        day.timeRanges.map((range, rangeIdx) => (
                          <div key={rangeIdx} className="flex items-center gap-2">
                            <input
                              type="time"
                              value={range.startTime}
                              onChange={(e) => updateTimeRange(day.dayOfWeek, rangeIdx, 'startTime', e.target.value)}
                              className="text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                            />
                            <span className="text-slate-400 font-medium">to</span>
                            <input
                              type="time"
                              value={range.endTime}
                              onChange={(e) => updateTimeRange(day.dayOfWeek, rangeIdx, 'endTime', e.target.value)}
                              className="text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                            />
                            {day.timeRanges.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTimeRange(day.dayOfWeek, rangeIdx)}
                                className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                                title="Remove shift"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Closed (No public bookings)</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {day.enabled && (
                        <button
                          type="button"
                          onClick={() => addTimeRange(day.dayOfWeek)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          + Add Shift
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleDay(day.dayOfWeek)}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                          day.enabled
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {day.enabled ? 'Open' : 'Closed'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                disabled={savingAvailability}
                onClick={saveAvailability}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                {savingAvailability ? 'Saving Schedule...' : 'Save Weekly Schedule'}
              </button>

              <div className="flex items-center gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleTabChange('services')}
                  className="text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Services & Fees</span>
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => handleTabChange('booking')}
                  className="text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
                >
                  <span>My Link & QR</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Blocked Dates */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-600" />
                Holidays & Blocked Exceptions
              </h2>
              <p className="text-xs text-slate-500">
                Block specific calendar dates for vacations, medical leave, or festival holidays.
              </p>
            </div>

            <form onSubmit={handleAddBlockedDate} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="date"
                value={newBlockedDate.date}
                onChange={(e) => setNewBlockedDate({ ...newBlockedDate, date: e.target.value })}
                className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 outline-none"
                required
              />
              <input
                type="text"
                value={newBlockedDate.reason}
                onChange={(e) => setNewBlockedDate({ ...newBlockedDate, reason: e.target.value })}
                placeholder="Reason (e.g. Diwali Holiday, Medical Conference)"
                className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 outline-none flex-1"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Block Date
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {blockedDates.length === 0 ? (
                <p className="text-xs text-slate-400">No upcoming dates blocked. Your practice follows standard weekly hours.</p>
              ) : (
                blockedDates.map((item) => (
                  <div
                    key={item._id || item.date}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Ban className="w-3.5 h-3.5 text-rose-600" />
                      <span className="font-bold text-slate-900">{item.date}</span>
                      <span className="text-slate-500">({item.reason || 'Leave'})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveBlockedDate(item._id)}
                      className="text-rose-600 hover:text-rose-800 font-semibold text-[11px] cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: My Link & QR */}
      {activeTab === 'booking' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5 animate-in fade-in duration-200 max-w-4xl">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Your Booking Page & QR Code</h2>
            <p className="text-xs text-slate-500">
              Share your direct booking link with clients or download printable counter QR codes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Public Booking Link</h3>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
                <span className="truncate flex-1">{bookingUrl}</span>
                <button
                  type="button"
                  onClick={copyBookingLink}
                  className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Hello! You can easily book an appointment or consultation with me directly here:\n${bookingUrl}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </a>
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
                  title="Open public page"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Printable Reception QR</h3>
              <p className="text-xs text-slate-500">
                Generate high-resolution printable QR table-top standees for your clinic reception desk.
              </p>
              <button
                type="button"
                onClick={() => router.push('/dashboard/booking-link')}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Open Full QR Standee Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Account & Plan */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5 animate-in fade-in duration-200 max-w-2xl">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Account & Subscription</h2>
            <p className="text-xs text-slate-500">
              Manage your credentials, login security, and BookSaathi Pro membership.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Current Plan
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase">
                {isPro ? 'PRO TIER ⭐' : 'STARTER (FREE)'}
              </span>
            </div>
            <p className="text-xs text-amber-900 font-medium">
              {isPro
                ? 'Your Pro membership gives you unlimited bookings, custom QR standees, and WhatsApp broadcasts.'
                : 'Free tier includes up to 15 bookings per month. Upgrade to Pro for unlimited appointments.'}
            </p>
            {!isPro && (
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade to Pro Plan</span>
              </button>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold">Registered Email</span>
              <span className="font-bold text-slate-900">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold">Account Role</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onUpgradeSuccess={() => refreshProfile()}
      />
    </div>
  );
}
