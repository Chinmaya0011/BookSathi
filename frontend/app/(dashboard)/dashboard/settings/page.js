'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { professionalService } from '@/services/professional.service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import UserCustomerSettings from '@/components/dashboard/UserCustomerSettings';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const role = user?.role || 'USER';

  // If role is USER, render dedicated customer settings
  if (role === 'USER') {
    return <UserCustomerSettings user={user} />;
  }

  const [duration, setDuration] = useState(30);
  const [buffer, setBuffer] = useState(10);
  const [minNotice, setMinNotice] = useState(30);
  const [maxAdvance, setMaxAdvance] = useState(60);
  const [allowSameDay, setAllowSameDay] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.bookingSettings) {
      setDuration(profile.bookingSettings.appointmentDuration || 30);
      setBuffer(profile.bookingSettings.bufferTime || 10);
      setMinNotice(profile.bookingSettings.minNoticeMinutes ?? 0);
      setMaxAdvance(profile.bookingSettings.maxAdvanceDays || 60);
      setAllowSameDay(profile.bookingSettings.allowSameDayBooking ?? true);
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await professionalService.updateProfile({
        bookingSettings: {
          appointmentDuration: Number(duration),
          bufferTime: Number(buffer),
          minNoticeMinutes: Number(minNotice),
          maxAdvanceDays: Number(maxAdvance),
          allowSameDayBooking: Boolean(allowSameDay),
        },
      });
      await refreshProfile();
      toast.success('Booking preferences saved successfully!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Booking Preferences & Rules
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure appointment durations, rest buffer times, and advance notice rules.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Slot Timing & Intervals
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Default Consultation Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes (Recommended)</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes (1 Hour)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  How long each appointment slot will be scheduled for.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Buffer Time Between Bookings
                </label>
                <select
                  value={buffer}
                  onChange={(e) => setBuffer(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  <option value={0}>0 Minutes (Back-to-back)</option>
                  <option value={5}>5 Minutes</option>
                  <option value={10}>10 Minutes (Recommended)</option>
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Rest/preparation gap added between consecutive appointments.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Advance Notice & Scheduling Window
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimum Booking Notice (Minutes)"
                type="number"
                value={minNotice}
                onChange={(e) => setMinNotice(Number(e.target.value))}
                helperText="Prevents clients from booking on zero notice (e.g. 30 mins before)."
              />

              <Input
                label="Maximum Advance Booking Window (Days)"
                type="number"
                value={maxAdvance}
                onChange={(e) => setMaxAdvance(Number(e.target.value))}
                helperText="How many days into the future clients can schedule (e.g. 60 days)."
              />
            </div>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={allowSameDay}
                onChange={(e) => setAllowSameDay(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-800">
                Allow Same-Day Appointments (Subject to minimum notice)
              </span>
            </label>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Timezone & Region
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <Globe className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Timezone: {profile?.timezone || 'Asia/Kolkata (IST)'}
                </p>
                <p className="text-[11px] text-slate-500">
                  All customer slots and calendar exports are calculated in Indian Standard Time.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" loading={saving} size="lg">
              <Save className="w-4 h-4 mr-1.5" /> Save Booking Preferences
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
