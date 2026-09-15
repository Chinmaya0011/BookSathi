import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  ArrowRight,
  Search,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Check,
  User,
  Play,
  RotateCcw,
  X,
  CreditCard,
  AlertCircle,
  Ticket,
  Megaphone,
  UserX,
} from 'lucide-react';
import { format12Hour, formatINR, formatDisplayDate, cn } from '@/lib/utils';

export default function DashboardTodaySchedule({
  todaySchedule = [],
  loading,
  profile,
  onOpenManualModal,
  onQuickStatusUpdate,
  updatingStatusId,
  onCallNextQueue,
  callingNext,
  currentServingToken,
}) {
  const [scheduleFilter, setScheduleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const isQueueMode = profile?.bookingType === 'QUEUE';

  // Normalize statuses for accurate filtering and display
  const normalizedSchedule = useMemo(() => {
    return (todaySchedule || []).map((appt) => {
      const rawStatus = (appt.status || '').toUpperCase();
      let displayStatus = 'BOOKED';

      if (rawStatus === 'DONE' || rawStatus === 'COMPLETED') {
        displayStatus = 'DONE';
      } else if (rawStatus === 'CANCELLED' || rawStatus === 'REJECTED') {
        displayStatus = 'CANCELLED';
      } else if (rawStatus === 'NO_SHOW') {
        displayStatus = 'NO_SHOW';
      } else if (rawStatus === 'IN_PROGRESS') {
        displayStatus = 'IN_PROGRESS';
      } else if (rawStatus === 'CALLED') {
        displayStatus = 'CALLED';
      } else if (rawStatus === 'WAITING' || rawStatus === 'ARRIVED') {
        displayStatus = 'WAITING';
      } else {
        displayStatus = 'BOOKED';
      }

      return {
        ...appt,
        normalizedStatus: displayStatus,
        isDone: displayStatus === 'DONE',
        isCancelled: displayStatus === 'CANCELLED' || displayStatus === 'NO_SHOW',
        isNoShow: displayStatus === 'NO_SHOW',
        isActive: displayStatus !== 'DONE' && displayStatus !== 'CANCELLED' && displayStatus !== 'NO_SHOW',
      };
    });
  }, [todaySchedule]);

  const todayActiveCount = useMemo(() => {
    return normalizedSchedule.filter((a) => !a.isCancelled).length;
  }, [normalizedSchedule]);

  const waitingQueueTokens = useMemo(() => {
    return normalizedSchedule.filter((a) => a.normalizedStatus === 'WAITING' || a.normalizedStatus === 'BOOKED');
  }, [normalizedSchedule]);

  const filterCounts = useMemo(() => {
    return {
      ALL: todayActiveCount,
      QUEUE: normalizedSchedule.filter((a) => a.isActive).length,
      DONE: normalizedSchedule.filter((a) => a.isDone).length,
      CANCELLED: normalizedSchedule.filter((a) => a.isCancelled).length,
    };
  }, [normalizedSchedule, todayActiveCount]);

  const filteredSchedule = useMemo(() => {
    return normalizedSchedule.filter((appt) => {
      let matchesFilter = true;
      if (scheduleFilter === 'QUEUE') {
        matchesFilter = appt.isActive;
      } else if (scheduleFilter === 'DONE') {
        matchesFilter = appt.isDone;
      } else if (scheduleFilter === 'CANCELLED') {
        matchesFilter = appt.isCancelled;
      }

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        appt.customerName?.toLowerCase().includes(query) ||
        appt.customerPhone?.includes(query) ||
        appt.appointmentCode?.toLowerCase().includes(query) ||
        appt.appointmentTypeName?.toLowerCase().includes(query) ||
        (appt.queueNumber && String(appt.queueNumber).includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [normalizedSchedule, scheduleFilter, searchQuery]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden font-sans h-full min-h-[360px]">
      <div className="flex flex-col flex-1 h-full">
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                {isQueueMode ? <Ticket className="w-4 h-4" /> : <CalendarCheck className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    {isQueueMode ? "Today's Live Queue" : "Today's Appointments"}
                  </h2>
                  <span className="px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                    {isQueueMode ? `${filterCounts.QUEUE} in queue` : `${filterCounts.QUEUE} scheduled`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {/* Call Next Token Button (Queue Mode) */}
              {isQueueMode && onCallNextQueue && (
                <button
                  type="button"
                  onClick={onCallNextQueue}
                  disabled={callingNext || waitingQueueTokens.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>{callingNext ? 'Calling...' : 'Call Next Token'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenManualModal}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <span>{isQueueMode ? '+ Issue Token' : '+ Walk-In'}</span>
              </button>
              <Link
                href="/dashboard/appointments"
                className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span>All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Filter Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100/80 rounded-xl text-xs overflow-x-auto no-scrollbar">
              {[
                { id: 'ALL', label: 'All', count: filterCounts.ALL },
                { id: 'QUEUE', label: 'Waiting', count: filterCounts.QUEUE },
                { id: 'DONE', label: 'Done', count: filterCounts.DONE },
                { id: 'CANCELLED', label: 'Cancelled', count: filterCounts.CANCELLED },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setScheduleFilter(tab.id)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1',
                    scheduleFilter === tab.id
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.1 rounded-full font-bold',
                      scheduleFilter === tab.id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-slate-200/70 text-slate-500'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, phone..."
                className="w-full pl-8 pr-7 py-1 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Schedule List */}
        <div className="divide-y divide-slate-100 flex-1 flex flex-col min-h-[220px] max-h-[520px] overflow-y-auto">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-400 space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-500">Loading today&apos;s schedule...</p>
            </div>
          ) : filteredSchedule.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-2.5 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto shadow-2xs">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800">No appointments in this view</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5 leading-relaxed">
                  {searchQuery
                    ? `No records matched "${searchQuery}".`
                    : scheduleFilter === 'DONE'
                    ? 'No appointments completed yet today.'
                    : isQueueMode
                    ? 'Click "+ Issue Token" to add a customer directly to today\'s queue.'
                    : 'Click "+ Walk-In" to add a customer directly to today\'s schedule.'}
                </p>
              </div>
            </div>
          ) : (
            filteredSchedule.map((appt) => {
              const isUpdating = updatingStatusId === appt._id;
              const initials = appt.customerName
                ? appt.customerName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'PT';

              return (
                <div
                  key={appt._id}
                  className={cn(
                    'p-3 sm:p-3.5 transition-colors duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5',
                    appt.isDone
                      ? 'bg-emerald-50/15 hover:bg-emerald-50/25'
                      : appt.isCancelled
                      ? 'bg-slate-50/40 opacity-70'
                      : 'hover:bg-slate-50/70 bg-white'
                  )}
                >
                  {/* Left: Time Block / Queue Token Badge + Patient Information */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Time / Queue Token Chip */}
                    {isQueueMode || appt.queueNumber ? (
                      <div className="px-2.5 py-1.5 rounded-xl bg-violet-600 text-white border border-violet-700 text-center shrink-0 min-w-[64px] shadow-xs">
                        <span className="text-xs font-black font-mono block leading-tight">
                          #{appt.queueNumber || '—'}
                        </span>
                        <span className="text-[9px] text-violet-200 uppercase font-bold block leading-tight">
                          Token
                        </span>
                      </div>
                    ) : (
                      <div className="px-2.5 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/70 text-center shrink-0 min-w-[64px]">
                        <span className="text-xs font-black text-slate-900 block leading-tight">
                          {format12Hour(appt.startTime)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block leading-tight">
                          {appt.duration || 30}m
                        </span>
                      </div>
                    )}

                    {/* Patient Details */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Avatar Initials */}
                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                          {initials}
                        </div>

                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {appt.customerName}
                        </span>

                        {/* Status Chip */}
                        <span
                          className={cn(
                            'text-[9px] font-bold px-1.5 py-0.2 rounded-md border inline-flex items-center gap-1',
                            appt.isDone
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : appt.isCancelled
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : appt.normalizedStatus === 'CALLED'
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs animate-pulse'
                              : appt.normalizedStatus === 'IN_PROGRESS'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : appt.normalizedStatus === 'WAITING'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          )}
                        >
                          {appt.isDone ? (
                            <>
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Done</span>
                            </>
                          ) : appt.normalizedStatus === 'CALLED' ? (
                            <>
                              <Megaphone className="w-2.5 h-2.5" />
                              <span>Called</span>
                            </>
                          ) : appt.isCancelled ? (
                            <span>{appt.normalizedStatus === 'NO_SHOW' ? 'No Show' : 'Cancelled'}</span>
                          ) : appt.normalizedStatus === 'IN_PROGRESS' ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              <span>In Progress</span>
                            </>
                          ) : appt.normalizedStatus === 'WAITING' ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                              <span>Waiting</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span>Confirmed</span>
                            </>
                          )}
                        </span>

                        {/* Payment Status Badge */}
                        {appt.paymentStatus === 'PAID' ? (
                          <span className="text-[9px] font-bold px-1 py-0.1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ₹ Paid
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium px-1 py-0.1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            Pay on Arrival
                          </span>
                        )}
                      </div>

                      {/* Service and Patient Details Bar */}
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                          {appt.appointmentTypeName || 'Consultation'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-medium text-slate-600">
                          {formatINR(appt.fee || 500)}
                        </span>
                        {appt.customerPhone && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400 font-mono text-[10px]">
                              {appt.customerPhone}
                            </span>
                          </>
                        )}
                        {appt.reason && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400 italic truncate max-w-[120px]">
                              {appt.reason}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Controls */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {/* Patient Communication Icons */}
                    {appt.customerPhone && (
                      <div className="flex items-center gap-1 mr-0.5">
                        <a
                          href={`tel:${appt.customerPhone}`}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title={`Call ${appt.customerPhone}`}
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://wa.me/91${appt.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            isQueueMode || appt.queueNumber
                              ? `Hello ${appt.customerName}, Dr./Pro ${profile?.name || ''} here regarding your Queue Token #${appt.queueNumber || ''} today.`
                              : `Hello ${appt.customerName}, Dr./Pro ${profile?.name || ''} here regarding your appointment today at ${format12Hour(appt.startTime)}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                          title="WhatsApp customer"
                        >
                          <MessageCircle className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Operational Status Action Buttons */}
                    {appt.isDone ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1 border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Done</span>
                      </span>
                    ) : appt.isCancelled ? (
                      <span className="px-2 py-0.5 text-[11px] text-rose-500 font-medium">
                        {appt.normalizedStatus === 'NO_SHOW' ? 'No Show' : 'Cancelled'}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        {/* Call Button in Queue Mode */}
                        {isQueueMode && appt.normalizedStatus === 'WAITING' && (
                          <button
                            type="button"
                            onClick={() => onQuickStatusUpdate(appt._id, 'CALLED')}
                            disabled={isUpdating}
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors cursor-pointer border border-emerald-200 inline-flex items-center gap-1"
                            title="Call Token"
                          >
                            <Megaphone className="w-2.5 h-2.5 text-emerald-700" />
                            <span>Call</span>
                          </button>
                        )}

                        {/* Start Consultation button if not in progress */}
                        {appt.normalizedStatus !== 'IN_PROGRESS' && (
                          <button
                            type="button"
                            onClick={() => onQuickStatusUpdate(appt._id, 'IN_PROGRESS')}
                            disabled={isUpdating}
                            className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer border border-indigo-200 inline-flex items-center gap-1"
                            title="Start consultation"
                          >
                            <Play className="w-2.5 h-2.5 fill-indigo-700 text-indigo-700" />
                            <span>Start</span>
                          </button>
                        )}

                        {/* Primary One-Click "Mark Done" Button */}
                        <button
                          type="button"
                          onClick={() => onQuickStatusUpdate(appt._id, 'DONE')}
                          disabled={isUpdating}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                          title="Complete consultation"
                        >
                          <Check className="w-3 h-3" />
                          <span>{isUpdating ? '...' : 'Done'}</span>
                        </button>

                        {/* No Show Button (in Queue Mode) */}
                        {isQueueMode && (
                          <button
                            type="button"
                            onClick={() => onQuickStatusUpdate(appt._id, 'NO_SHOW')}
                            disabled={isUpdating}
                            className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
                            title="Mark No Show"
                          >
                            No Show
                          </button>
                        )}

                        {/* Cancel Button */}
                        <button
                          type="button"
                          onClick={() => onQuickStatusUpdate(appt._id, 'CANCELLED')}
                          disabled={isUpdating}
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Cancel appointment"
                        >
                          <X className="w-3.5 h-3.5" />
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
