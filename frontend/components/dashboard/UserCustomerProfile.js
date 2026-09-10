'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Save,
  CheckCircle2,
  Camera,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CalendarCheck,
  ShieldCheck,
  HeartHandshake,
  Upload,
  Globe,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { userAppointmentService } from '@/services/userAppointment.service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Delhi',
  'Gujarat',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
  'Other State / UT',
];

const CUSTOMER_AVATARS = [
  { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', label: 'Casual 1' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', label: 'Casual 2' },
  { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80', label: 'Professional Female' },
  { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', label: 'Professional Male' },
  { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80', label: 'Friendly 1' },
  { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80', label: 'Friendly 2' },
];

export default function UserCustomerProfile({ user }) {
  const { refreshProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    city: 'Bhubaneswar',
    state: 'Odisha',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    preferredLanguage: 'Hindi / English',
    consultationNotes: '',
  });

  const [saving, setSaving] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [stats, setStats] = useState({ total: 0, upcoming: 0 });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        city: user.city || 'Bhubaneswar',
        state: user.state || 'Odisha',
        address: user.address || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
        preferredLanguage: user.preferredLanguage || 'Hindi / English',
        consultationNotes: user.consultationNotes || '',
      });
      setImagePreviewError(false);
    }
  }, [user]);

  useEffect(() => {
    // Fetch customer's appointment stats
    userAppointmentService.getMyAppointments({ limit: 50 })
      .then((res) => {
        const list = res.data?.appointments || [];
        const upcoming = list.filter((a) =>
          ['CONFIRMED', 'PENDING', 'ARRIVED', 'WAITING'].includes(a.status)
        ).length;
        setStats({ total: list.length, upcoming });
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result;
      setFormData((prev) => ({ ...prev, avatar: base64Data }));
      setImagePreviewError(false);
      toast.success('Photo preview updated! Click "Save Changes" to apply.');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url) => {
    setFormData((prev) => ({ ...prev, avatar: url }));
    setImagePreviewError(false);
    toast.success('Avatar selected! Click "Save Changes" to apply.');
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, avatar: '' }));
    setImagePreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Profile avatar removed.');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning('Please enter your full name');
      return;
    }
    setSaving(true);
    try {
      await authService.updateProfile(formData);
      await refreshProfile();
      toast.success('Your profile details have been saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const displayName = formData.name || user?.name || 'Customer';

  return (
    <div className="space-y-6 sm:space-y-8 w-full animate-in fade-in duration-300 pb-16">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Customer Account Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              My Profile & Preferences
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Manage your personal info, contact details, emergency notes, and consultation preferences across BookSaathi.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700/80 p-3 rounded-2xl shrink-0">
            <div className="px-3 text-center border-r border-slate-700">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Bookings</p>
              <p className="text-lg font-black text-white">{stats.total}</p>
            </div>
            <div className="px-3 text-center">
              <p className="text-[10px] uppercase font-bold text-emerald-400">Upcoming</p>
              <p className="text-lg font-black text-emerald-300">{stats.upcoming}</p>
            </div>
          </div>
        </div>

        {/* Decorative background glows */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 2. Avatar & Photo Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>Profile Picture & Avatar</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload your photo or select an avatar to display on your appointment confirmations and chat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
            {/* Live Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-indigo-50 shadow-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-3xl">
                {formData.avatar && !imagePreviewError ? (
                  <img
                    src={formData.avatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={() => setImagePreviewError(true)}
                  />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Upload trigger button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg border-2 border-white transition-transform active:scale-90 cursor-pointer"
                title="Upload Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Controls & Presets */}
            <div className="space-y-4 flex-1 text-center sm:text-left">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Photo
                  </Button>

                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mt-2">
                  Supports JPG, PNG, WEBP (Max 5MB).
                </p>
              </div>

              {/* Quick Preset Avatars */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">
                  Or pick a customer avatar:
                </span>
                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  {CUSTOMER_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      title={preset.label}
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`w-10 h-10 rounded-2xl overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                        formData.avatar === preset.url
                          ? 'border-indigo-600 ring-2 ring-indigo-500/30 shadow-md'
                          : 'border-slate-200 hover:border-indigo-400'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Personal & Contact Information */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Personal & Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              required
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={handleChange}
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              required
              disabled
              helperText="Email is locked to your login credentials."
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Mobile Number"
              name="phone"
              required
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={handleChange}
              prefix={<Phone className="w-3.5 h-3.5 text-slate-400" />}
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Preferred Language for Consultation
              </label>
              <select
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="Hindi / English">Hindi / English (Bilingual)</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                <option value="Bengali">Bengali (বাংলা)</option>
                <option value="Marathi">Marathi (मराठी)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                <option value="Gujarati">Gujarati (ગુજરાતી)</option>
              </select>
            </div>
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="City / Town"
              name="city"
              placeholder="e.g. Bhubaneswar / Mumbai / Bengaluru"
              value={formData.city}
              onChange={handleChange}
              prefix={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                State
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Residential / Billing Address (Optional)"
            name="address"
            placeholder="e.g. Flat 102, Green Valley Apartments, Infocity Road"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        {/* 4. Consultation Notes & Emergency Contact */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-indigo-600" />
            <span>Consultation Preferences & Emergency Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Emergency Contact Person (Optional)"
              name="emergencyContactName"
              placeholder="e.g. Parent / Spouse / Friend"
              value={formData.emergencyContactName}
              onChange={handleChange}
            />

            <Input
              label="Emergency Contact Phone (Optional)"
              name="emergencyContactPhone"
              placeholder="e.g. 9876543210"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              General Medical / Consultation Notes (Optional)
            </label>
            <textarea
              name="consultationNotes"
              rows={3}
              placeholder="Any ongoing health conditions, allergies, tax filing years, or recurring discussion topics you want readily available during consultations..."
              value={formData.consultationNotes}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>This information is private and will only be shared when you explicitly book a consultation.</span>
            </p>
          </div>

          {/* Save Action Bar */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              type="submit"
              size="md"
              loading={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4 mr-2" /> Save Profile Details
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
