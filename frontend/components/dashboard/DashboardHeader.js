'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  Bell,
  CheckCheck,
  Calendar,
  Clock,
  Info,
  CheckCircle2,
  XCircle,
  ArrowRight,
  MessageSquare,
  User,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/userAppointment.service';
import { connectSocket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { getProfessionalPublicUrl } from '@/lib/urlHelpers';

const SUBPAGE_METADATA = {
  '/dashboard/appointments': { title: 'Appointments & Queue', back: '/dashboard' },
  '/dashboard/services': { title: 'Services & Tariffs', back: '/dashboard' },
  '/dashboard/availability': { title: 'Weekly Availability', back: '/dashboard' },
  '/dashboard/blocked-dates': { title: 'Blocked Dates', back: '/dashboard' },
  '/dashboard/booking-link': { title: 'Booking Link & Plan', back: '/dashboard' },
  '/dashboard/subscription': { title: 'Booking Link & Plan', back: '/dashboard' },
  '/dashboard/messages': { title: 'Messages', back: '/dashboard' },
  '/dashboard/notifications': { title: 'Notifications', back: '/dashboard' },
  '/dashboard/grievance': { title: 'Support Desk', back: '/dashboard' },
  '/dashboard/profile': { title: 'Profile Settings', back: '/dashboard' },
  '/dashboard/settings': { title: 'Account Settings', back: '/dashboard' },
  '/dashboard/payments': { title: 'Payments & Revenue', back: '/dashboard' },
  '/dashboard/find': { title: 'Directory', back: '/dashboard' },
};

export default function DashboardHeader({ setMobileOpen }) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, user, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const role = user?.role || 'USER';

  const isRootDashboard = pathname === '/dashboard' || pathname === '/admin';
  const currentSubPage =
    SUBPAGE_METADATA[pathname] ||
    (pathname.startsWith('/dashboard/') ? { title: 'Back', back: '/dashboard' } : null);

  useEffect(() => {
    loadNotifications();

    const socket = connectSocket();
    if (socket) {
      const handleNewNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev.slice(0, 9)]);
        setUnreadCount((prev) => prev + 1);
      };

      socket.on('notification:new', handleNewNotification);
      return () => {
        socket.off('notification:new', handleNewNotification);
      };
    }
  }, [user]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data?.notifications?.slice(0, 8) || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (e) {}
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

  const handleNotificationClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setNotifDropdownOpen(false);
      router.push('/dashboard/notifications');
    } else {
      setNotifDropdownOpen((prev) => !prev);
    }
  };

  const copyBookingLink = () => {
    const bookingUrl = getProfessionalPublicUrl(profile);
    if (!bookingUrl) return;
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    toast.success('Booking link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'APPOINTMENT_CONFIRMED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'APPOINTMENT_REJECTED':
      case 'APPOINTMENT_CANCELLED':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'APPOINTMENT_RESCHEDULED':
      case 'APPOINTMENT_RESCHEDULE_REQUESTED':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'APPOINTMENT_CREATED':
        return <Calendar className="w-4 h-4 text-indigo-500" />;
      default:
        return <Info className="w-4 h-4 text-sky-500" />;
    }
  };

  const displayName = user?.name || profile?.name || user?.email?.split('@')[0] || 'User';
  const displayRole =
    role === 'USER'
      ? 'Client'
      : role === 'ADMIN'
      ? 'Administrator'
      : profile?.profession || 'Professional';

  return (
    <header className="h-14 bg-white/90 backdrop-blur-md border-b border-slate-200/70 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-all select-none font-sans">
      {/* Left Section: Breadcrumb & Context Navigation */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Subpage Back Button */}
        {!isRootDashboard && currentSubPage ? (
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 2) {
                router.back();
              } else {
                router.push(currentSubPage.back);
              }
            }}
            className="inline-flex items-center gap-1 py-1 px-2 rounded-md bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-semibold text-xs md:hidden transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
            <span className="truncate max-w-[140px]">{currentSubPage.title}</span>
          </button>
        ) : (
          /* Mobile Sidebar Trigger */
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Clean Breadcrumb Title (Desktop) */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400">
            {role === 'ADMIN' ? 'Admin Portal' : role === 'USER' ? 'Client Area' : 'Practice'}
          </span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900">
            {currentSubPage ? currentSubPage.title : 'Overview'}
          </span>
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Professional Quick Booking Link Trigger */}
        {role === 'PROFESSIONAL' && profile?.bookingSlug && (
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs transition-colors">
            <span className="font-medium text-slate-500">Link:</span>
            <button
              type="button"
              onClick={copyBookingLink}
              className="font-semibold text-slate-800 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
              title="Copy public booking link"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{copied ? 'Copied' : `/${profile.bookingSlug}`}</span>
            </button>
            <Link
              href={getProfessionalPublicUrl(profile) || `/book/${profile.bookingSlug}`}
              target="_blank"
              className="text-slate-400 hover:text-indigo-600 ml-0.5"
              title="Open public page"
            >
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Messages Action Button */}
        <Link
          href={role === 'ADMIN' ? '/admin/messages' : '/dashboard/messages'}
          className="w-8 h-8 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          title="Messages"
          aria-label="Open messages"
        >
          <MessageSquare className="w-4 h-4" />
        </Link>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={handleNotificationClick}
            className="relative w-8 h-8 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute 1.5 top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notifDropdownOpen && (
            <div className="hidden md:block absolute right-0 mt-1.5 w-80 sm:w-88 bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    <p className="text-xs font-medium text-slate-500">No new notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && handleMarkSingleRead(n._id)}
                      className={cn(
                        'p-3 flex items-start gap-2.5 transition-colors cursor-pointer text-left',
                        !n.isRead ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'
                      )}
                    >
                      <div className="p-1.5 rounded-md bg-white border border-slate-200/80 shrink-0 mt-0.5">
                        {getIconForType(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                          {n.message}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-2" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                >
                  <span>View all notifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="User profile menu"
          >
            <div className="relative shrink-0">
              {profile?.profileImage || user?.avatar ? (
                <img
                  src={profile?.profileImage || user?.avatar}
                  alt={displayName}
                  className="w-7 h-7 rounded-md object-cover border border-slate-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-7 h-7 rounded-md bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="hidden sm:block text-left min-w-0 max-w-[120px]">
              <span className="text-xs font-semibold text-slate-800 truncate block leading-tight">
                {displayName}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block shrink-0" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 p-1 space-y-0.5">
              <div className="px-3 py-2 border-b border-slate-100 mb-0.5">
                <span className="text-xs font-semibold text-slate-900 truncate block">
                  {displayName}
                </span>
                <span className="text-[11px] text-slate-400 truncate block">
                  {user?.email}
                </span>
              </div>

              <Link
                href="/dashboard/profile"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/dashboard/settings"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Account Settings</span>
              </Link>

              <Link
                href="/dashboard/payments"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span>Payments</span>
              </Link>

              <div className="border-t border-slate-100 my-0.5" />

              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
