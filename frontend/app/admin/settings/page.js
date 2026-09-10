'use client';

import { useState, useEffect } from 'react';
import {
  Sliders,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Activity,
  Server,
  Database,
  Lock,
  Radio,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  X,
  Zap,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/admin.service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    platformName: 'BookSaathi',
    supportEmail: 'support@booksaathi.in',
    supportPhone: '+91 98765 43210',
    maintenanceMode: false,
    allowNewRegistrations: true,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: true,
    defaultCommissionPercent: 0,
    minBookingNoticeMinutes: 30,
    featureFlags: {
      qrStandeeDelivery: true,
      instantPdfSlips: true,
      onlinePayments: true,
      multiLanguageSupport: true,
      aiScheduleOptimizer: false,
    },
    customAnnouncement: {
      enabled: false,
      message: '',
      type: 'INFO',
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSettings();
      if (res.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data,
          featureFlags: { ...prev.featureFlags, ...(res.data.featureFlags || {}) },
          customAnnouncement: { ...prev.customAnnouncement, ...(res.data.customAnnouncement || {}) },
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load platform settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      toast.success('Platform settings & feature flags updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatureFlag = (key) => {
    setSettings((prev) => ({
      ...prev,
      featureFlags: {
        ...prev.featureFlags,
        [key]: !prev.featureFlags?.[key],
      },
    }));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Platform Governance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            System Settings & Feature Flags
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure global platform parameters, maintenance mode, notification relays, and feature availability.
          </p>
        </div>

        <Button
          onClick={handleSave}
          loading={saving}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 shrink-0"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          Save Platform Settings
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* General Platform & Support Identity */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
            General Platform Identity & Support Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Platform Brand Name</label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Support Contact Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Support WhatsApp / Helpline</label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Operational Guardrails */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
            Operational Safety & Registration Toggles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Maintenance Mode</span>
                <span className="text-[11px] text-slate-400">
                  When enabled, non-admin visitors see a maintenance notice.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Allow New Registrations</span>
                <span className="text-[11px] text-slate-400">
                  Enables new professionals to onboard via /register.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.allowNewRegistrations}
                onChange={(e) => setSettings({ ...settings, allowNewRegistrations: e.target.checked })}
                className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
            Feature Flags & Capabilities
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'qrStandeeDelivery', label: 'QR Standee Courier Delivery' },
              { key: 'instantPdfSlips', label: 'Instant PDF Slip Generation' },
              { key: 'onlinePayments', label: 'Online Payment Gateway Checkout' },
              { key: 'multiLanguageSupport', label: 'Multi-Language UI (English / Hindi / Odia)' },
              { key: 'aiScheduleOptimizer', label: 'AI Schedule & Slot Optimizer (Beta)' },
            ].map((f) => (
              <div
                key={f.key}
                onClick={() => toggleFeatureFlag(f.key)}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
              >
                <span className="font-bold text-slate-300">{f.label}</span>
                <input
                  type="checkbox"
                  checked={!!settings.featureFlags?.[f.key]}
                  onChange={() => {}}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
