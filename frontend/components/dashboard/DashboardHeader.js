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
  Search,
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

// Helper map for clean secondary page titles and parent back links
const SUBPAGE_METADATA = {
  '/dashboard/appointments': { title: 'Appointments & Queue', back: '/dashboard' },
  '/dashboard/services': { title: 'Services & Tariffs', back: '/dashboard' },
  '/dashboard/availability': { title: 'Weekly Availability', back: '/dashboard' },
  '/dashboard/blocked-dates': { title: 'Blocked Dates', back: '/dashboard' },
  '/dashboard/booking-link': { title: 'Booking Link & QR', back: '/dashboard' },
  '/dashboard/subscription': { title: 'Subscription & Hardware', back: '/dashboard' },
  '/dashboard/messages': { title: 'Live Messages', back: '/dashboard' },
  '/dashboard/notifications': { title: 'Live Alerts', back: '/dashboard' },
  '/dashboard/grievance': { title: 'Help & Grievance Desk', back: '/dashboard' },
  '/dashboard/profile': { title: 'Professional Profile', back: '/dashboard' },
  '/dashboard/settings': { title: 'Practice Settings', back: '/dashboard' },
  '/dashboard/payments': { title: 'Payments & Revenue', back: '/dashboard' },
  '/dashboard/find': { title: 'Find Professionals', back: '/dashboard' },
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

  // Subpage detection for mobile contextual back header
  const isRootDashboard = pathname === '/dashboard' || pathname === '/admin';
  const currentSubPage = SUBPAGE_METADATA[pathname] || (pathname.startsWith('/dashboard/') ? { title: 'Back', back: '/dashboard' } : null);

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

  // Click outside listener for dropdowns
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
    toast.success('Public booking link copied to clipboard!');
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
  const displayRole = role === 'USER' ? 'Customer' : role === 'ADMIN' ? 'Administrator' : profile?.profession || 'Professional';

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-all select-none">
      {/* Left Section: Contextual Back on Mobile / Brand Context on Desktop */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Mobile: Dynamic Back Button if on subpage */}
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
            className="inline-flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xs md:hidden transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
            <span className="truncate max-w-[150px]">{currentSubPage.title}</span>
          </button>
        ) : (
          /* Mobile Drawer Trigger on Root Dashboard */
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Brand context on desktop */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {role === 'ADMIN' ? 'Admin Control' : role === 'USER' ? 'Patient Portal' : 'Practice Desk'}
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-bold text-slate-800">
            {currentSubPage ? currentSubPage.title : 'Overview'}
          </span>
        </div>
      </div>

      {/* Right Action Icons & Profile Card */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Public Booking Link 1-Tap Trigger on Desktop */}
        {role === 'PROFESSIONAL' && profile?.bookingSlug && (
          <div className="hidden lg:flex items-center gap-1.5 bg-indigo-50/80 border border-indigo-100 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-indigo-900">Booking:</span>
            <button
              type="button"
              onClick={copyBookingLink}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
              title="Click to copy link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
            <Link
              href={getProfessionalPublicUrl(profile) || `/book/${profile.bookingSlug}`}
              target="_blank"
              className="text-indigo-500 hover:text-indigo-700 ml-1"
              title="Open public page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Messages Direct Link Button */}
        <Link
          href={role === 'ADMIN' ? '/admin/messages' : '/dashboard/messages'}
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 flex items-center justify-center transition-all cursor-pointer border border-slate-200/60 active:scale-95"
          title="Live Messages"
          aria-label="Open messages"
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>

        {/* Real-time Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={handleNotificationClick}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 flex items-center justify-center transition-all cursor-pointer border border-slate-200/60 group active:scale-95"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel (Desktop only; Mobile routes directly) */}
          {notifDropdownOpen && (
            <div className="hidden md:block absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Live Alerts</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.2 bg-indigo-600 text-white text-[10px] font-bold rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-indigo-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 overscroll-contain">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">No notifications yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Real-time alerts will appear here live.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && handleMarkSingleRead(n._id)}
                      className={cn(
                        'p-3.5 flex items-start gap-3 transition-colors cursor-pointer',
                        !n.isRead ? 'bg-indigo-50/50 hover:bg-indigo-50/80' : 'hover:bg-slate-50'
                      )}
                    >
                      <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0 shadow-2xs mt-0.5">
                        {getIconForType(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h5 className="text-xs font-bold text-slate-900 truncate">{n.title}</h5>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">{n.message}</p>
                      </div>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />}
                    </div>
                  ))
                )}
              </div>

              {/* Footer Link */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1.5"
                >
                  <span>View full notification center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 transition-all cursor-pointer active:scale-95"
            aria-label="User profile menu"
          >
            <div className="relative shrink-0">
              {profile?.profileImage || user?.avatar ? (
                <img
                  src={profile?.profileImage || user?.avatar}
                  alt={displayName}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover border border-indigo-200 shadow-2xs"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 border border-indigo-300 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
            </div>

            <div className="hidden sm:block text-left min-w-0 max-w-[120px]">
              <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">{displayName}</h4>
              <p className="text-[10px] text-slate-500 truncate leading-tight">{displayRole}</p>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block shrink-0" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-0.5">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <Link
                href="/dashboard/profile"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/dashboard/settings"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Account Settings</span>
              </Link>

              <Link
                href="/dashboard/payments"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>{role === 'USER' ? 'Invoices & Receipts' : 'Payments & Revenue'}</span>
              </Link>

              <div className="border-t border-slate-100 my-1" />

              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
