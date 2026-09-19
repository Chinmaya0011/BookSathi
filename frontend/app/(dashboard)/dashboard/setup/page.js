'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Settings,
  User,
  Briefcase,
  Clock,
  Sparkles,
  Bell,
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
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { professionalService } from '@/services/professional.service';
import { appointmentTypeService } from '@/services/appointmentType.service';
import { getProfessionalPublicUrl } from '@/lib/urlHelpers';
import { formatINR } from '@/lib/utils';
import ProUpgradeModal from '@/components/dashboard/ProUpgradeModal';

const TABS = [
  { id: 'profile', label: 'Business Profile', icon: User, desc: 'Name, profession & clinic location' },
  { id: 'services', label: 'Services & Fees', icon: Briefcase, desc: 'Consultation types & pricing' },
  { id: 'hours', label: 'Working Hours & Exceptions', icon: Clock, desc: 'Weekly schedule & blocked leaves' },
  { id: 'booking', label: 'Booking Page & QR', icon: Sparkles, desc: 'Public URL & printable standee' },
  { id: 'notifications', label: 'Notifications & Policy', icon: Bell, desc: 'WhatsApp reminders & notice windows' },
  { id: 'account', label: 'Account & Plan', icon: Shield, desc: 'Password & Pro subscription' },
];

const WEEKDAYS = [
  { id: 'mon', name: 'Monday' },
  { id: 'tue', name: 'Tuesday' },
  { id: 'wed', name: 'Wednesday' },
  { id: 'thu', name: 'Thursday' },
  { id: 'fri', name: 'Friday' },
  { id: 'sat', name: 'Saturday' },
  { id: 'sun', name: 'Sunday' },
];

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams ? searchParams.get('tab') : null;
  const [activeTab, setActiveTab] = useState(urlTab || 'profile');
  const { profile, user, refreshProfile } = useAuth();

  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    profession: '',
    specialization: '',
    clinicName: '',
    address: '',
    city: '',
    bio: '',
    bookingSlug: '',
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

  // Working Hours State
  const [workingHours, setWorkingHours] = useState({
    mon: { open: true, start: '10:00', end: '18:00' },
    tue: { open: true, start: '10:00', end: '18:00' },
    wed: { open: true, start: '10:00', end: '18:00' },
    thu: { open: true, start: '10:00', end: '18:00' },
    fri: { open: true, start: '10:00', end: '18:00' },
    sat: { open: true, start: '10:00', end: '14:00' },
    sun: { open: false, start: '10:00', end: '14:00' },
  });

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
        profession: profile.profession || '',
        specialization: profile.specialization || '',
        clinicName: profile.clinicName || '',
        address: profile.address?.street || profile.address || '',
        city: profile.address?.city || '',
        bio: profile.bio || '',
        bookingSlug: profile.bookingSlug || '',
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
    e.preventDefault();
    setSaving(true);
    try {
      await professionalService.updateProfile({
        name: profileForm.name,
        profession: profileForm.profession,
        specialization: profileForm.specialization,
        clinicName: profileForm.clinicName,
        bio: profileForm.bio,
        address: {
          street: profileForm.address,
          city: profileForm.city,
        },
      });
      await refreshProfile();
      toast.success('Business profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
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
      toast.success('New service added!');
      loadServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add service');
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

  return (
    <div className="space-y-4 font-sans animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Practice Setup Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your business profile, consultation tariffs, working hours, and booking link
          </p>
        </div>

        {bookingUrl && (
          <button
            type="button"
            onClick={copyBookingLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Link Copied' : 'Copy Booking Link'}</span>
          </button>
        )}
      </div>

      {/* Responsive Tab Bar */}
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

      {/* Tab 1: Business Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Professional & Clinic Profile</h2>
            <p className="text-xs text-slate-500">
              This information is displayed to your clients on your public booking page.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl">
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Profession</label>
                <input
                  type="text"
                  value={profileForm.profession}
                  onChange={(e) => setProfileForm({ ...profileForm, profession: e.target.value })}
                  placeholder="e.g. General Physician, Advocate, Chartered Accountant"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specialization / Expertise</label>
                <input
                  type="text"
                  value={profileForm.specialization}
                  onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                  placeholder="e.g. Cardiology, Corporate Law, Tax Audit"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinic / Chamber Name</label>
                <input
                  type="text"
                  value={profileForm.clinicName}
                  onChange={(e) => setProfileForm({ ...profileForm, clinicName: e.target.value })}
                  placeholder="e.g. City Health Clinic"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinic Address</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="Street, locality, landmark"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Short Description</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Brief introductory bio for your clients..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Services & Tariffs */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Services & Consultation Tariffs</h2>
              <p className="text-xs text-slate-500">
                Define the consultation categories, duration, and fees available to your clients.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAddingService(!addingService)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Service</span>
            </button>
          </div>

          {/* Add Service Inline Form */}
          {addingService && (
            <form onSubmit={handleAddService} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">New Service Item</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="Service name (e.g. Initial Checkup)"
                  className="text-xs p-2 rounded-xl border border-slate-200 bg-white outline-none"
                  required
                />
                <input
                  type="number"
                  value={newService.duration}
                  onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
                  placeholder="Duration (minutes)"
                  className="text-xs p-2 rounded-xl border border-slate-200 bg-white outline-none"
                  required
                />
                <input
                  type="number"
                  value={newService.fee}
                  onChange={(e) => setNewService({ ...newService, fee: Number(e.target.value) })}
                  placeholder="Fee (₹)"
                  className="text-xs p-2 rounded-xl border border-slate-200 bg-white outline-none"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                >
                  Save Service
                </button>
                <button
                  type="button"
                  onClick={() => setAddingService(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Services List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map((srv) => (
              <div
                key={srv._id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{srv.name}</h4>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ₹{srv.fee}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{srv.duration} mins session</span>
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-end">
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
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Working Hours & Blocked Dates COMBINED */}
      {activeTab === 'hours' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Working Hours Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Weekly Working Schedule</h2>
              <p className="text-xs text-slate-500">
                Set the days and hours when customers can book appointments with you.
              </p>
            </div>

            <div className="space-y-2.5 divide-y divide-slate-100">
              {WEEKDAYS.map((day) => {
                const config = workingHours[day.id];
                return (
                  <div key={day.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                    <div className="w-28 font-bold text-slate-800 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${config.open ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span>{day.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={config.start}
                        disabled={!config.open}
                        onChange={(e) =>
                          setWorkingHours({
                            ...workingHours,
                            [day.id]: { ...config, start: e.target.value },
                          })
                        }
                        className="text-xs p-1.5 rounded-lg border border-slate-200 bg-slate-50 disabled:opacity-40"
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="time"
                        value={config.end}
                        disabled={!config.open}
                        onChange={(e) =>
                          setWorkingHours({
                            ...workingHours,
                            [day.id]: { ...config, end: e.target.value },
                          })
                        }
                        className="text-xs p-1.5 rounded-lg border border-slate-200 bg-slate-50 disabled:opacity-40"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setWorkingHours({
                          ...workingHours,
                          [day.id]: { ...config, open: !config.open },
                        })
                      }
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                        config.open
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {config.open ? 'Open' : 'Closed'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => toast.success('Working schedule saved!')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Save Working Hours
              </button>
            </div>
          </div>

          {/* Blocked Dates & Holidays Card (Combined into the same view!) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-600" />
                Holidays & Blocked Exceptions
              </h2>
              <p className="text-xs text-slate-500">
                Block specific days for vacations, personal leave, or clinic holidays.
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
                placeholder="Reason (e.g. Festival Holiday, Conference)"
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
                <p className="text-xs text-slate-400">No upcoming dates blocked. Your schedule follows weekly hours.</p>
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

      {/* Tab 4: Booking Page & QR */}
      {activeTab === 'booking' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Your Booking Page & QR Code</h2>
            <p className="text-xs text-slate-500">
              Share your direct booking link with clients or download printable counter QR codes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {/* Direct Link Share */}
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

            {/* QR Standee Action */}
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

      {/* Tab 5: Notifications & Policies */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 animate-in fade-in duration-200 max-w-2xl">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Notifications & Cancellation Policy</h2>
            <p className="text-xs text-slate-500">
              Configure automated client reminders and cancellation notice windows.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <h4 className="font-bold text-slate-900">Instant Booking Confirmation</h4>
                <p className="text-slate-500 text-[11px]">Send instant email & SMS confirmation with token code</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <h4 className="font-bold text-slate-900">2-Hour Prior Reminder</h4>
                <p className="text-slate-500 text-[11px]">Send automated reminder ping 2 hours before scheduled slot</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <h4 className="font-bold text-slate-900">Minimum Cancellation Notice</h4>
                <p className="text-slate-500 text-[11px]">Minimum hours required for clients to cancel self-service</p>
              </div>
              <select className="p-1.5 rounded-lg border border-slate-200 bg-white font-bold text-xs">
                <option value="2">2 Hours</option>
                <option value="4">4 Hours</option>
                <option value="12">12 Hours</option>
                <option value="24">24 Hours</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toast.success('Notification policies updated')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
          >
            Save Policy Settings
          </button>
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

          {/* Pro Subscription Box */}
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

          {/* Account Details */}
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
