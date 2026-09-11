'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  ArrowRight,
  Search,
  Phone,
  MessageCircle,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Video,
  MapPin,
  IndianRupee,
  Check,
} from 'lucide-react';
import { format12Hour, formatINR, formatRelativeTime, cn } from '@/lib/utils';
import { getProfessionalPublicUrl } from '@/lib/urlHelpers';

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

  // Normalize statuses for clean filtering
  const normalizedSchedule = useMemo(() => {
    return (todaySchedule || []).map((appt) => {
      let status = appt.status;
      let displayStatus = 'BOOKED';
      if (status === 'COMPLETED') {
        displayStatus = 'DONE';
      } else if (status === 'CANCELLED' || status === 'REJECTED') {
        displayStatus = 'CANCELLED';
      } else if (status === 'IN_PROGRESS' || status === 'ARRIVED') {
        displayStatus = 'IN_PROGRESS';
      }
      return { ...appt, normalizedStatus: displayStatus };
    });
  }, [todaySchedule]);

  const todayActiveCount = useMemo(() => {
    return normalizedSchedule.filter(
      (a) => a.normalizedStatus !== 'CANCELLED'
    ).length;
  }, [normalizedSchedule]);

  const filterCounts = useMemo(() => {
    return {
      ALL: todayActiveCount,
      BOOKED: normalizedSchedule.filter((a) => a.normalizedStatus === 'BOOKED' || a.normalizedStatus === 'IN_PROGRESS').length,
      DONE: normalizedSchedule.filter((a) => a.normalizedStatus === 'DONE').length,
      CANCELLED: normalizedSchedule.filter((a) => a.normalizedStatus === 'CANCELLED').length,
    };
  }, [normalizedSchedule, todayActiveCount]);

  // Earliest upcoming appointment today
  const nextAppointment = useMemo(() => {
    return normalizedSchedule.find(
      (a) => a.normalizedStatus === 'BOOKED' || a.normalizedStatus === 'IN_PROGRESS'
    );
  }, [normalizedSchedule]);

  const filteredSchedule = useMemo(() => {
    return normalizedSchedule.filter((appt) => {
      let matchesFilter = true;
      if (scheduleFilter === 'BOOKED') {
        matchesFilter = appt.normalizedStatus === 'BOOKED' || appt.normalizedStatus === 'IN_PROGRESS';
      } else if (scheduleFilter === 'DONE') {
        matchesFilter = appt.normalizedStatus === 'DONE';
      } else if (scheduleFilter === 'CANCELLED') {
        matchesFilter = appt.normalizedStatus === 'CANCELLED';
      }

      const matchesSearch =
        !searchQuery ||
        appt.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.customerPhone?.includes(searchQuery) ||
        appt.appointmentCode?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [normalizedSchedule, scheduleFilter, searchQuery]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between overflow-hidden font-sans">
      <div>
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Today&apos;s Live Appointments
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                    {todayActiveCount} Total
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Real-time patient queue and consultation manager
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenManualModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>Walk-In</span>
              </button>
              <Link
                href="/dashboard/appointments"
                className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <span>Full List</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Next Up Spotlight Banner */}
          {nextAppointment && (
            <div className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/50 border border-indigo-100/80 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse shrink-0" />
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  Next Patient:
                </span>
                <span className="text-slate-900 font-black truncate text-sm">
                  {nextAppointment.customerName}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-100">
                  {format12Hour(nextAppointment.startTime)}
                </span>
              </div>
              {nextAppointment.customerPhone && (
                <a
                  href={`https://wa.me/91${nextAppointment.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${nextAppointment.customerName}, Dr./Pro ${profile?.name || ''} here regarding your appointment today at ${format12Hour(nextAppointment.startTime)}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 shrink-0 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              )}
            </div>
          )}

          {/* Filter Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl text-xs overflow-x-auto">
              {[
                { id: 'ALL', label: `All (${filterCounts.ALL})` },
                { id: 'BOOKED', label: `Queue (${filterCounts.BOOKED})` },
                { id: 'DONE', label: `Done (${filterCounts.DONE})` },
                { id: 'CANCELLED', label: `Cancelled (${filterCounts.CANCELLED})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setScheduleFilter(tab.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap',
                    scheduleFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name / phone..."
                className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Schedule List */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-500">Loading today&apos;s appointments...</p>
            </div>
          ) : filteredSchedule.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No appointments in this view</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Share your public booking link on WhatsApp or click &quot;Walk-In&quot; to schedule a patient directly into today&apos;s queue.
              </p>
            </div>
          ) : (
            filteredSchedule.map((appt) => {
              const isUpdating = updatingStatusId === appt._id;
              return (
                <div
                  key={appt._id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                >
                  {/* Left: Time Block + Patient Information */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="px-3 py-2 rounded-xl bg-slate-100/90 border border-slate-200/80 text-center shrink-0 min-w-[70px]">
                      <span className="text-xs font-black text-slate-900 block leading-tight">
                        {format12Hour(appt.startTime)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold block leading-tight mt-0.5">
                        {appt.duration || 30}m
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {appt.customerName}
                        </span>

                        {/* Status Chip */}
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-md border',
                            appt.normalizedStatus === 'DONE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : appt.normalizedStatus === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : appt.normalizedStatus === 'IN_PROGRESS'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          )}
                        >
                          {appt.normalizedStatus === 'DONE'
                            ? 'Completed'
                            : appt.normalizedStatus === 'CANCELLED'
                            ? 'Cancelled'
                            : appt.normalizedStatus === 'IN_PROGRESS'
                            ? 'In Progress'
                            : 'Confirmed'}
                        </span>

                        {/* Payment Status Badge */}
                        {appt.paymentStatus === 'PAID' ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ₹ Paid
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            Pay at Clinic
                          </span>
                        )}

                        {appt.appointmentCode && (
                          <span className="text-[10px] font-mono font-semibold text-slate-400">
                            #{appt.appointmentCode}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-2.5 flex-wrap">
                        <span className="font-semibold text-slate-700">
                          {appt.appointmentTypeName || 'General Consultation'}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-slate-600">
                          {formatINR(appt.fee || 500)}
                        </span>
                        {appt.reason && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400 truncate max-w-xs">{appt.reason}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Controls */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {appt.customerPhone && (
                      <div className="flex items-center gap-1 mr-1">
                        <a
                          href={`tel:${appt.customerPhone}`}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title={`Call ${appt.customerPhone}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/91${appt.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${appt.customerName}, Dr./Pro ${profile?.name || ''} here regarding your appointment today at ${format12Hour(appt.startTime)}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                          title="WhatsApp patient"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {appt.normalizedStatus !== 'DONE' && appt.normalizedStatus !== 'CANCELLED' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onQuickStatusUpdate(appt._id, 'COMPLETED')}
                          disabled={isUpdating}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                        >
                          {isUpdating ? '...' : 'Mark Done'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onQuickStatusUpdate(appt._id, 'CANCELLED')}
                          disabled={isUpdating}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
