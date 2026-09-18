'use client';

import { useState } from 'react';
import {
  MessageCircle,
  FileSpreadsheet,
  Megaphone,
  Receipt,
  Lock,
  Sparkles,
  QrCode,
  Briefcase,
  Clock,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Crown,
  FileText,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function ProFeaturesHub({
  isPro = false,
  onOpenUpgradeModal,
  onOpenBatchWhatsApp,
  onExportCSV,
  onOpenEmergencyNotice,
  onOpenReceipt,
  onOpenNotes,
  todaySchedule = [],
}) {
  const tools = [
    {
      id: 'whatsapp_broadcast',
      title: 'Batch WhatsApp Broadcast',
      desc: 'Send running-late, slot confirmation & direction alerts to today queue.',
      icon: MessageCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: 'PRO',
      action: onOpenBatchWhatsApp,
    },
    {
      id: 'csv_export',
      title: 'Tax & Financial CSV Export',
      desc: '1-click download of patient ledger, fee collections & dates to Excel.',
      icon: FileSpreadsheet,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badge: 'PRO',
      action: onExportCSV,
    },
    {
      id: 'emergency_notice',
      title: 'Emergency Practice Notice',
      desc: 'Broadcast delay warnings or urgent marquee alerts to booking link.',
      icon: Megaphone,
      color: 'text-rose-600',
      bg: 'bg-rose-50 text-rose-600 border-rose-100',
      badge: 'PRO',
      action: onOpenEmergencyNotice,
    },
    {
      id: 'consultation_receipt',
      title: '1-Tap Consultation Receipt',
      desc: 'Print official patient tax invoice & paid slips with practice header.',
      icon: Receipt,
      color: 'text-amber-600',
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: 'PRO',
      action: onOpenReceipt,
    },
    {
      id: 'private_notes',
      title: 'Private Clinical Notes Vault',
      desc: 'Record confidential diagnoses & case observations for patients.',
      icon: FileText,
      color: 'text-sky-600',
      bg: 'bg-sky-50 text-sky-600 border-sky-100',
      badge: 'PRO',
      action: onOpenNotes,
    },
    {
      id: 'acrylic_standee',
      title: 'Free Acrylic QR Standee',
      desc: 'Order custom physical clinic desk standee hardware with ₹0 courier.',
      icon: QrCode,
      color: 'text-purple-600',
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
      badge: 'PRO PERK',
      href: '/dashboard/qr-banner',
    },
    {
      id: 'multi_service',
      title: 'Multi-Service Tariff Suite',
      desc: 'Create unlimited consultation packages, durations, and tariffs.',
      icon: Briefcase,
      color: 'text-blue-600',
      bg: 'bg-blue-50 text-blue-600 border-blue-100',
      badge: 'PRO',
      href: '/dashboard/services',
    },
    {
      id: 'split_shifts',
      title: 'Split Shift Hours (Morning & Evening)',
      desc: 'Configure dual morning/evening OPD shifts for Indian clinics.',
      icon: Clock,
      color: 'text-teal-600',
      bg: 'bg-teal-50 text-teal-600 border-teal-100',
      badge: 'PRO',
      href: '/dashboard/availability',
    },
  ];

  const handleCardClick = (tool) => {
    if (!isPro) {
      if (onOpenUpgradeModal) onOpenUpgradeModal();
      return;
    }
    if (tool.action) {
      tool.action();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-3 font-sans relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Crown className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Pro Practice Operating Suite
            </h3>
            {isPro ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                All Unlocked
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase">
                Pro Only (8 Tools)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automations, patient broadcast, financial ledger exports, and practice expansion tools
          </p>
        </div>

        {!isPro && (
          <button
            type="button"
            onClick={onOpenUpgradeModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all self-start sm:self-auto shrink-0"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Unlock Suite (₹199)</span>
          </button>
        )}
      </div>

      {/* Grid of 8 Pro Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const CardContent = (
            <div
              key={tool.id}
              onClick={() => !tool.href && handleCardClick(tool)}
              className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative group text-left ${
                !isPro
                  ? 'border-slate-200/80 bg-slate-50/50 hover:bg-amber-50/30 hover:border-amber-300 cursor-pointer shadow-2xs'
                  : 'border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-xs cursor-pointer shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border ${tool.bg} shadow-2xs`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                      !isPro
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {tool.badge}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {tool.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  {tool.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                <span className={!isPro ? 'text-amber-700' : 'text-indigo-600'}>
                  {!isPro ? '🔒 Unlock Pro' : 'Open Tool'}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );

          if (tool.href && isPro) {
            return (
              <Link key={tool.id} href={tool.href}>
                {CardContent}
              </Link>
            );
          }

          return CardContent;
        })}
      </div>

    </div>
  );
}
