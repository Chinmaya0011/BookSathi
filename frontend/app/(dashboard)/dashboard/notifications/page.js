'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Calendar,
  Clock,
  ShieldAlert,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { notificationService } from '@/services/userAppointment.service';
import { connectSocket } from '@/lib/socket';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();

    const socket = connectSocket();
    if (socket) {
      const handleNewNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      };

      socket.on('notification:new', handleNewNotification);
      return () => {
        socket.off('notification:new', handleNewNotification);
      };
    }
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'APPOINTMENT_CONFIRMED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'APPOINTMENT_REJECTED':
      case 'APPOINTMENT_CANCELLED':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'APPOINTMENT_RESCHEDULED':
      case 'APPOINTMENT_RESCHEDULE_REQUESTED':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'APPOINTMENT_CREATED':
        return <Calendar className="w-5 h-5 text-indigo-500" />;
      default:
        return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Live Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-xs">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time appointment alerts, confirmations, and reminders
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded-md w-1/3" />
                  <div className="h-3 bg-slate-100 rounded-md w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-3">
              <Bell className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No notifications yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              You will receive live real-time notifications here as soon as appointments are booked, confirmed, or updated.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.isRead && handleMarkSingleRead(n._id)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                  !n.isRead ? 'bg-indigo-50/40 hover:bg-indigo-50/60' : 'hover:bg-slate-50'
                }`}
              >
                <div className="mt-0.5 p-2 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0">
                  {getIconForType(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{n.title}</h4>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">{n.message}</p>
                  
                  {n.link && (
                    <Link
                      href={n.link}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      <span>View in Dashboard</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
