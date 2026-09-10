'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  ArrowRight,
  Search,
  Phone,
  MessageCircle,
  PlusCircle,
  RefreshCw,
  Clock,
  Play,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle2,
  User,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { format12Hour, formatINR, cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function DashboardTodaySchedule({
  todaySchedule = [],
  loading,
  profile,
  onOpenManualModal,
  onQuickStatusUpdate,
  updatingStatusId,
}) {
  const [scheduleFilter, setScheduleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filterCounts = useMemo(() => {
    return {
      ALL: todaySchedule.length,
      NOW: todaySchedule.filter((a) => a.queueStage === 'NOW' || a.status === 'IN_PROGRESS').length,
      WAITING: todaySchedule.filter((a) => a.status === 'WAITING' || a.status === 'ARRIVED').length,
      NEXT: todaySchedule.filter((a) => a.queueStage === 'NEXT').length,
      UPCOMING: todaySchedule.filter(
        (a) =>
          ['CONFIRMED', 'PENDING'].includes(a.status) &&
          a.queueStage !== 'NOW' &&
          a.queueStage !== 'NEXT'
      ).length,
      COMPLETED: todaySchedule.filter((a) => a.status === 'COMPLETED').length,
    };
  }, [todaySchedule]);

  const filteredSchedule = useMemo(() => {
    return todaySchedule.filter((appt) => {
      let matchesFilter = true;
      if (scheduleFilter === 'NOW') {
        matchesFilter = appt.queueStage === 'NOW' || appt.status === 'IN_PROGRESS';
      } else if (scheduleFilter === 'WAITING') {
        matchesFilter = appt.status === 'WAITING' || appt.status === 'ARRIVED';
      } else if (scheduleFilter === 'NEXT') {
        matchesFilter = appt.queueStage === 'NEXT';
      } else if (scheduleFilter === 'UPCOMING') {
        matchesFilter =
          ['CONFIRMED', 'PENDING'].includes(appt.status) &&
          appt.queueStage !== 'NOW' &&
          appt.queueStage !== 'NEXT';
      } else if (scheduleFilter === 'COMPLETED') {
        matchesFilter = appt.status === 'COMPLETED';
      }

      const matchesSearch =
        !searchQuery ||
        appt.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.customerPhone?.includes(searchQuery) ||
        appt.appointmentCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.appointmentTypeName?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [todaySchedule, scheduleFilter, searchQuery]);

  const getSourceBadge = (source) => {
    const s = source || 'ONLINE';
    if (s === 'WALK_IN') {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Walk-In</span>;
    }
    if (s === 'PHONE') {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Phone</span>;
    }
    if (s === 'WHATSAPP') {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">WhatsApp</span>;
    }
    if (s === 'MANUAL') {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">Manual</span>;
    }
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">Online</span>;
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header & Filter Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Live Appointment & Waiting Queue
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                Real-time queue tracking with arrival status alerts and instant consultation actions
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" onClick={onOpenManualModal} className="text-xs shadow-sm">
                <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Walk-In
              </Button>
              <Link
                href="/dashboard/appointments"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            {/* Status Tab Pills with counts */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl overflow-x-auto no-scrollbar">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'NOW', label: 'Now' },
                { key: 'WAITING', label: 'Waiting' },
                { key: 'NEXT', label: 'Next' },
                { key: 'UPCOMING', label: 'Upcoming' },
                { key: 'COMPLETED', label: 'Done' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setScheduleFilter(tab.key)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer',
                    scheduleFilter === tab.key
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold',
                      scheduleFilter === tab.key
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-slate-200/80 text-slate-600'
                    )}
                  >
                    {filterCounts[tab.key] || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Schedule List */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-xs font-medium text-slate-500">Syncing live queue...</p>
          </div>
        ) : filteredSchedule.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredSchedule.map((appt) => {
              const cleanPhone = (appt.customerPhone || '').replace(/[^0-9]/g, '');
              const waLink = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                `Hello ${appt.customerName}, this is regarding your appointment scheduled today (${format12Hour(
                  appt.startTime
                )}) with ${profile?.name || 'our practice'}.`
              )}`;

              const isLate = appt.arrivalAnalysis?.isLate;
              const isOverdueNoShow = appt.arrivalAnalysis?.isNoShowRisk;

              return (
                <div
                  key={appt._id}
                  className={cn(
                    'p-3.5 sm:p-5 transition-all duration-150',
                    appt.status === 'IN_PROGRESS'
                      ? 'bg-indigo-50/50 border-l-4 border-indigo-600'
                      : appt.status === 'WAITING' || appt.status === 'ARRIVED'
                      ? 'bg-amber-50/40 border-l-4 border-amber-500'
                      : 'hover:bg-slate-50/80'
                  )}
                >
                  {/* Desktop Layout (sm and up) */}
                  <div className="hidden sm:flex sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Time & Duration Pill */}
                      <div className="px-3 py-2 bg-indigo-50/90 border border-indigo-100 rounded-2xl text-center shrink-0 min-w-[76px] shadow-2xs">
                        <span className="text-xs font-bold text-indigo-700 block whitespace-nowrap">
                          {format12Hour(appt.startTime)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {appt.duration}m {appt.buffer ? `+ ${appt.buffer}m` : ''}
                        </span>
                      </div>

                      {/* Client & Service Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{appt.customerName}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold shrink-0">
                            {appt.appointmentCode}
                          </span>
                          {getSourceBadge(appt.bookingSource)}

                          {/* Early / Late / Queue Indicators */}
                          {appt.arrivalAnalysis?.label && appt.status !== 'COMPLETED' && (
                            <span
                              className={cn(
                                'text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1',
                                isOverdueNoShow
                                  ? 'bg-rose-100 text-rose-800'
                                  : isLate
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              )}
                            >
                              {isLate ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              <span>{appt.arrivalAnalysis.label}</span>
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
                          <span className="font-semibold text-slate-700">{appt.appointmentTypeName || 'Consultation'}</span>
                          <span>•</span>
                          <span className="font-black text-slate-900">{formatINR(appt.fee)}</span>
                          <span>•</span>
                          <a
                            href={`tel:${appt.customerPhone}`}
                            className="text-slate-600 hover:text-indigo-600 inline-flex items-center gap-1 font-medium hover:underline"
                          >
                            <Phone className="w-3 h-3 text-indigo-500" />
                            <span>{appt.customerPhone}</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Status Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      <Badge status={appt.status} />

                      {/* WhatsApp shortcut */}
                      {cleanPhone && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Message on WhatsApp"
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:scale-95 transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Step 1: Mark Arrived / Waiting */}
                      {appt.status === 'CONFIRMED' && (
                        <button
                          type="button"
                          disabled={updatingStatusId === appt._id}
                          onClick={() => onQuickStatusUpdate(appt._id, 'WAITING')}
                          title="Mark Customer Arrived / Waiting"
                          className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 active:scale-95 transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>Arrived</span>
                        </button>
                      )}

                      {/* Step 2: Start Consultation */}
                      {(appt.status === 'CONFIRMED' || appt.status === 'WAITING' || appt.status === 'ARRIVED') && (
                        <button
                          type="button"
                          disabled={updatingStatusId === appt._id}
                          onClick={() => onQuickStatusUpdate(appt._id, 'IN_PROGRESS')}
                          title="Start Consultation"
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Start</span>
                        </button>
                      )}

                      {/* Step 3: Complete Consultation */}
                      {appt.status === 'IN_PROGRESS' && (
                        <button
                          type="button"
                          disabled={updatingStatusId === appt._id}
                          onClick={() => onQuickStatusUpdate(appt._id, 'COMPLETED')}
                          title="Mark Completed"
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Finish</span>
                        </button>
                      )}

                      {/* No-Show trigger when overdue */}
                      {appt.status === 'CONFIRMED' && isLate && (
                        <button
                          type="button"
                          disabled={updatingStatusId === appt._id}
                          onClick={() => onQuickStatusUpdate(appt._id, 'NO_SHOW')}
                          title="Mark as No-Show"
                          className="px-2 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 active:scale-95 transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>No-Show</span>
                        </button>
                      )}

                      {/* Full ledger link */}
                      <Link
                        href="/dashboard/appointments"
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="View Full Ledger"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Mobile Optimized Android Card Layout (< sm) */}
                  <div className="sm:hidden space-y-2.5">
                    {/* Top Row: Time, Code, Source, Status */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700">
                        <Clock className="w-3 h-3" />
                        <span>{format12Hour(appt.startTime)}</span>
                        <span className="text-[10px] text-indigo-500 font-semibold">({appt.duration}m)</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {getSourceBadge(appt.bookingSource)}
                        <Badge status={appt.status} />
                      </div>
                    </div>

                    {/* Middle Row: Patient Name & Service */}
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">{appt.customerName}</h4>
                        <span className="text-[10px] font-mono font-bold text-slate-500">{appt.appointmentCode}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700 truncate">{appt.appointmentTypeName || 'Consultation'}</span>
                        <span className="font-black text-slate-900 shrink-0">{formatINR(appt.fee)}</span>
                      </div>

                      {appt.arrivalAnalysis?.label && appt.status !== 'COMPLETED' && (
                        <p className={cn(
                          'text-[11px] font-bold mt-1 flex items-center gap-1',
                          isLate ? 'text-rose-600' : 'text-emerald-600'
                        )}>
                          {isLate ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {appt.arrivalAnalysis.label}
                        </p>
                      )}
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 flex-wrap">
                      {appt.customerPhone && (
                        <a
                          href={`tel:${appt.customerPhone}`}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-semibold"
                        >
                          <Phone className="w-3 h-3 text-indigo-600" />
                          <span>Call</span>
                        </a>
                      )}

                      {cleanPhone && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 px-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:scale-95 text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WA</span>
                        </a>
                      )}

                      {appt.status === 'CONFIRMED' && (
                        <button
                          type="button"
                          onClick={() => onQuickStatusUpdate(appt._id, 'WAITING')}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 active:scale-95"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Arrived</span>
                        </button>
                      )}

                      {(appt.status === 'CONFIRMED' || appt.status === 'WAITING' || appt.status === 'ARRIVED') && (
                        <button
                          type="button"
                          onClick={() => onQuickStatusUpdate(appt._id, 'IN_PROGRESS')}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs active:scale-95"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Start</span>
                        </button>
                      )}

                      {appt.status === 'IN_PROGRESS' && (
                        <button
                          type="button"
                          onClick={() => onQuickStatusUpdate(appt._id, 'COMPLETED')}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs active:scale-95"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-14 h-14 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 border border-indigo-100 shadow-2xs">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No appointments in this view</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || scheduleFilter !== 'ALL'
                ? 'No appointments matched your selected filter.'
                : 'Your queue is clear for today. Add a walk-in client or wait for online bookings.'}
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={onOpenManualModal}>
                <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Walk-In Appointment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
