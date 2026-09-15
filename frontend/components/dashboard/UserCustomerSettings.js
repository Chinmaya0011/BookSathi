'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Lock,
  Bell,
  Shield,
  CheckCircle2,
  Save,
  KeyRound,
  Smartphone,
  Mail,
  Video,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function UserCustomerSettings({ user }) {
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Notification Preferences (persisted in localStorage / user session)
  const [notifications, setNotifications] = useState({
    emailConfirmations: true,
    smsReminders: true,
    whatsappAlerts: true,
    promotionalUpdates: false,
    autoCalendarSync: true,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('booksaathi_user_notifications');
        if (saved) setNotifications(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);
  const [savingPreferences, setSavingPreferences] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.warning('Please enter your current password.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters long.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      toast.success('Password updated successfully! Keep your credentials secure.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleToggleNotification = (key) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('booksaathi_user_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    toast.success('Notification preference updated');
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full animate-in fade-in duration-300 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Account Security & Notifications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Manage your account login credentials, real-time alert channels, and booking notifications.
          </p>
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Security & Change Password Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>Change Password</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your password regularly to keep your consultation appointments secure.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="sm"
                loading={savingPassword}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-md cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                <span>Update Password</span>
              </Button>
            </div>
          </form>
        </div>

        {/* 2. Notification Channels Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <span>Notification Preferences</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose how you receive appointment confirmations, professional status alerts, and reminders.
              </p>
            </div>

            <div className="space-y-3">
              {/* WhatsApp Alerts */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">WhatsApp Booking Updates</h4>
                    <p className="text-[11px] text-slate-500">Instant appointment confirmation and reminder slips on WhatsApp</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.whatsappAlerts}
                  onChange={() => handleToggleNotification('whatsappAlerts')}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              {/* SMS Reminders */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">SMS Reminders</h4>
                    <p className="text-[11px] text-slate-500">SMS 1 hour before scheduled consultation</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.smsReminders}
                  onChange={() => handleToggleNotification('smsReminders')}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              {/* Email Confirmations */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Email Invoices & Calendar Invites</h4>
                    <p className="text-[11px] text-slate-500">Detailed invoice PDFs and Google/Apple Calendar links</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailConfirmations}
                  onChange={() => handleToggleNotification('emailConfirmations')}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              {/* Calendar Sync */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Real-Time Queue Notifications</h4>
                    <p className="text-[11px] text-slate-500">Alerts when professional starts consultation or is running late</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.autoCalendarSync}
                  onChange={() => handleToggleNotification('autoCalendarSync')}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Preferences are automatically synchronized with your BookSaathi session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
