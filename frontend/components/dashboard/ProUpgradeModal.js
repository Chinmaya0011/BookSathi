'use client';

import { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Zap,
  ShieldCheck,
  Crown,
  MessageCircle,
  TrendingUp,
  QrCode,
  CalendarCheck,
  Clock,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';
import { subscriptionService } from '@/services/subscription.service';
import { useAuth } from '@/hooks/useAuth';

export default function ProUpgradeModal({ isOpen, onClose, onUpgradeSuccess }) {
  const { refreshProfile } = useAuth();
  const [billingCycle, setBillingCycle] = useState('YEARLY'); // 'MONTHLY' | 'YEARLY'
  const [upgrading, setUpgrading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await subscriptionService.selectPlan({
        planKey: 'PRO',
        billingCycle,
      });
      await refreshProfile();
      toast.success('🎉 Welcome to BookSaathi Pro! All premium practice limits have been unlocked.');
      if (onUpgradeSuccess) onUpgradeSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upgrade plan. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const proFeatures = [
    {
      title: 'Unlimited Appointments & Live Queue',
      desc: 'No 15/month limit. Run your clinic or consultancy with 0 restrictions.',
      icon: CalendarCheck,
    },
    {
      title: 'Automated WhatsApp Appointment Reminders',
      desc: 'Cut patient/client no-shows by up to 78% with instant 2-hour pre-slot pings.',
      icon: MessageCircle,
    },
    {
      title: 'Deep Revenue Analytics & Peak Demand Insights',
      desc: 'Unlock 30-day financials, hourly traffic heatmaps, and service breakdown reports.',
      icon: TrendingUp,
    },
    {
      title: 'Multi-Service Catalog & Custom Tariffs',
      desc: 'Create unlimited services, custom consultation fees, and variable slot durations.',
      icon: Zap,
    },
    {
      title: 'Free Acrylic QR Desk Standee Delivered to Clinic',
      desc: 'Get your customized physical QR standee hardware shipped with ₹0 courier fee.',
      icon: QrCode,
    },
    {
      title: 'Custom Vanity Handle & White-Label Look',
      desc: 'Claim your clean slug booksaathi.in/dr-yourname without standard branding.',
      icon: Crown,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-2xl w-full overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 font-sans">
        
        {/* Header Ribbon / Banner */}
        <div className="relative bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 font-black text-[11px] uppercase tracking-wider shadow-xs">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Limited Practice Offer
            </span>
            <span className="text-xs text-indigo-300/80 font-medium hidden sm:inline">
              Used by 2,400+ Verified Doctors & Specialists
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Unlock Full Practice Power with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-300 to-indigo-200">BookSaathi Pro</span>
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200/80 mt-1 max-w-lg">
            Remove all booking caps, stop customer no-shows with WhatsApp automation, and scale your daily practice seamlessly.
          </p>

          {/* Billing Interval Switcher */}
          <div className="mt-4 inline-flex items-center bg-white/10 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'MONTHLY'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Monthly Billing (₹199/mo)
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'YEARLY'
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              <span>Annual (₹1,499/yr)</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black tracking-tight">
                Save 37%
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Benefits List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {proFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{feat.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Free vs Pro summary bar */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-bold text-amber-900">Current Free Plan:</span>
              <span className="text-amber-800">Capped at 15 bookings/mo • Basic reports only</span>
            </div>
            <span className="font-extrabold text-indigo-600 shrink-0">Pro = Unlimited</span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-center sm:text-left">
            <div className="flex items-baseline gap-1.5 justify-center sm:justify-start">
              <span className="text-2xl font-black text-slate-950">
                {billingCycle === 'YEARLY' ? '₹1,499' : '₹199'}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {billingCycle === 'YEARLY' ? '/ year (₹125/mo)' : '/ month'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Instant activation • 100% money-back guarantee within 7 days
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={upgrading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>{upgrading ? 'Activating Pro...' : 'Activate Pro Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
