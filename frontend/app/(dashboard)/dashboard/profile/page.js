'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Save,
  CheckCircle2,
  ExternalLink,
  Upload,
  Camera,
  Trash2,
  User,
  ShieldCheck,
  MapPin,
  Briefcase,
  Building2,
  IndianRupee,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { professionalService } from '@/services/professional.service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import UserCustomerProfile from '@/components/dashboard/UserCustomerProfile';
import { cn } from '@/lib/utils';

const PROFESSIONS = [
  'Doctor / Healthcare',
  'CA / Tax Consultant',
  'Lawyer / Advocate',
  'Tutor / Educator',
  'Business / Tech Consultant',
  'Salon / Beauty Specialist',
  'Fitness Coach / Nutritionist',
  'Astrologer / Vastu Expert',
  'Freelancer / Creator',
  'Real Estate & Financial Advisor',
  'Other Professional',
];

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

const AVATAR_PRESETS = [
  { url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80', label: 'Doctor / Physician' },
  { url: 'https://images.unsplash.com/photo-1594824813689-ee03b22b1156?w=400&auto=format&fit=crop&q=80', label: 'Doctor / Clinic' },
  { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', label: 'CA / Tax' },
  { url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&q=80', label: 'Lawyer / Advocate' },
  { url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80', label: 'Consultant' },
  { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', label: 'Salon / Beauty' },
  { url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&auto=format&fit=crop&q=80', label: 'Fitness Coach' },
  { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80', label: 'Teacher / Tutor' },
];

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef(null);

  const role = user?.role || 'USER';

  // If role is USER, render dedicated customer profile
  if (role === 'USER') {
    return <UserCustomerProfile user={user} />;
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profession: 'Doctor / Healthcare',
    specialization: '',
    profileImage: '',
    bio: '',
    businessName: '',
    address: '',
    googleMapUrl: '',
    city: 'Bhubaneswar',
    state: 'Odisha',
    consultationFee: 500,
    yearsOfExperience: 5,
    onlineConsultation: true,
    offlineConsultation: true,
    isPublic: true,
  });

  const [saving, setSaving] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        profession: profile.profession || 'Doctor / Healthcare',
        specialization: profile.specialization || '',
        profileImage: profile.profileImage || '',
        bio: profile.bio || '',
        businessName: profile.businessName || '',
        address: profile.address || '',
        googleMapUrl: profile.googleMapUrl || '',
        city: profile.city || 'Bhubaneswar',
        state: profile.state || 'Odisha',
        consultationFee: profile.consultationFee || 500,
        yearsOfExperience: profile.yearsOfExperience || 5,
        onlineConsultation: profile.onlineConsultation ?? true,
        offlineConsultation: profile.offlineConsultation ?? true,
        isPublic: profile.isPublic ?? true,
      });
      setImagePreviewError(false);
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      setImagePreviewError(false);
      toast.success('Photo preview ready. Tap Save to apply.');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url) => {
    setFormData((prev) => ({ ...prev, profileImage: url }));
    setImagePreviewError(false);
    toast.success('Avatar selected. Tap Save to apply.');
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profileImage: '' }));
    setImagePreviewError(false);
    toast.info('Photo removed.');
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.name?.trim()) {
      toast.warning('Doctor name is required.');
      return;
    }

    setSaving(true);

    try {
      await professionalService.updateProfile({
        ...formData,
        consultationFee: Number(formData.consultationFee),
        yearsOfExperience: Number(formData.yearsOfExperience),
      });
      await refreshProfile();
      toast.success('Doctor profile updated successfully!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 w-full pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
            Doctor Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your credentials, clinic address, tariffs, and booking page details.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {profile?.bookingSlug && (
            <>
              <Link
                href={`/profile/${profile.bookingSlug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-all"
              >
                <span>View Public Profile</span>
                <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
              </Link>

              <Link
                href={`/book/${profile.bookingSlug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              >
                <span>Booking Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        
        {/* Photo Upload Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
            Profile Photo
          </h3>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl sm:text-2xl shadow-xs">
                {formData.profileImage && !imagePreviewError ? (
                  <img
                    src={formData.profileImage}
                    alt={formData.name || 'Doctor'}
                    className="w-full h-full object-cover"
                    onError={() => setImagePreviewError(true)}
                  />
                ) : (
                  <span>{formData.name ? formData.name.charAt(0).toUpperCase() : 'Dr'}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs border-2 border-white hover:bg-indigo-500 transition-all cursor-pointer"
                title="Change Photo"
                aria-label="Upload Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 flex-1 text-center sm:text-left w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageFileChange}
                className="hidden"
              />

              <div className="flex items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-2xs active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Photo
                </button>

                {formData.profileImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Preset Avatars */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    title={preset.label}
                    onClick={() => handleSelectPreset(preset.url)}
                    className={cn(
                      'w-8 h-8 rounded-lg overflow-hidden border transition-all cursor-pointer shrink-0',
                      formData.profileImage === preset.url
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs scale-105'
                        : 'border-slate-200 hover:border-slate-400'
                    )}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 1. Identity & Credentials Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Professional Identity & Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Full Name / Display Name"
              name="name"
              required
              placeholder="e.g. Adv. Priya Patel, Dr. Rajesh Sharma, CA Amit Verma"
              value={formData.name}
              onChange={handleChange}
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Profession <span className="text-rose-500">*</span>
              </label>
              <select
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {PROFESSIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Specialization / Department"
              name="specialization"
              placeholder="e.g. Corporate Law, Tax Advisory, Cardiology, Yoga Therapy"
              value={formData.specialization}
              onChange={handleChange}
            />

            <Input
              label="Years of Experience"
              name="yearsOfExperience"
              type="number"
              value={formData.yearsOfExperience}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Mobile Number"
              name="phone"
              required
              placeholder="98765 43210"
              value={formData.phone}
              onChange={handleChange}
            />

            <Input
              label="Official Email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* 2. Clinic / Office Location Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Office / Practice / Chamber Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Firm / Office / Practice Name"
              name="businessName"
              placeholder="e.g. Apex Law Chambers, Zenith Tax Consultancy, City Practice"
              value={formData.businessName}
              onChange={handleChange}
            />

            <Input
              label="Street Address"
              name="address"
              placeholder="e.g. 102 M.G. Road"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                State
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Input
              label="Google Maps URL"
              name="googleMapUrl"
              placeholder="e.g. https://maps.app.goo.gl/..."
              value={formData.googleMapUrl}
              onChange={handleChange}
            />
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-600 shrink-0" />
              <span>Adds GPS &quot;Navigate to Workplace/Clinic&quot; on customer booking slips.</span>
            </p>
          </div>
        </div>

        {/* 3. Tariffs & Bio Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Consultation Fee & Bio
          </h3>

          <div>
            <Input
              label="Consultation Fee (₹)"
              name="consultationFee"
              type="number"
              value={formData.consultationFee}
              onChange={handleChange}
              prefix={<span className="text-xs font-bold text-slate-400">₹</span>}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Doctor Bio & Instructions
            </label>
            <textarea
              name="bio"
              rows={3}
              placeholder="Describe your medical background, timings, or pre-visit instructions..."
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            size="md"
            loading={saving}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4 mr-2" /> Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
