'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Ban,
  User,
  Settings,
  CalendarCheck,
  LogOut,
  Briefcase,
  CreditCard,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LifeBuoy,
  QrCode,
  Sparkles,
  ShieldCheck,
  Search,
  Bell,
  Users,
  ShieldAlert,
  MessageSquare,
  ListOrdered,
  UserPlus,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQrBannerStore } from '@/stores/useQrBannerStore';
import { cn } from '@/lib/utils';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { profile, user, logout } = useAuth();
  const { hasActivePurchase, fetchMyOrder } = useQrBannerStore();
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role || 'USER';

  useEffect(() => {
    if (user && role === 'PROFESSIONAL') {
      fetchMyOrder();
    }
  }, [user, role, fetchMyOrder]);

  // Load / save collapsed state and auto-collapse on tablet
  useEffect(() => {
    try {
      const saved = localStorage.getItem('booksaathi_sidebar_collapsed');
      if (saved !== null) {
        setCollapsed(saved === 'true');
      } else if (typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024) {
        // Auto compact on tablet
        setCollapsed(true);
      }
    } catch (e) {}
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('booksaathi_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Exact categorized information architecture
  let navGroups = [];

  if (role === 'USER') {
    navGroups = [
      {
        title: 'CUSTOMER DASHBOARD',
        items: [
          { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Find Professionals', href: '/dashboard/find', icon: Search },
          { label: 'My Appointments', href: '/dashboard/appointments', icon: Calendar },
          { label: 'Payments & Receipts', href: '/dashboard/payments', icon: CreditCard },
        ],
      },
      {
        title: 'COMMUNICATION',
        items: [
          { label: 'Live Chat & Support', href: '/dashboard/messages', icon: MessageSquare },
          { label: 'Live Notifications', href: '/dashboard/notifications', icon: Bell },
          { label: 'Support & Grievances', href: '/dashboard/grievance', icon: LifeBuoy },
        ],
      },
      {
        title: 'PREFERENCES',
        items: [
          { label: 'My Profile', href: '/dashboard/profile', icon: User },
          { label: 'Account Settings', href: '/dashboard/settings', icon: Settings },
        ],
      },
    ];
  } else if (role === 'ADMIN') {
    navGroups = [
      {
        title: 'ADMINISTRATION',
        items: [
          { label: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
          { label: 'Live Messages Hub', href: '/admin/messages', icon: MessageSquare },
          { label: 'Manage Users', href: '/admin/users', icon: Users },
          { label: 'Manage Professionals', href: '/admin/professionals', icon: ShieldCheck },
          { label: 'Global Appointments', href: '/admin/appointments', icon: Calendar },
        ],
      },
      {
        title: 'MONITORING & LOGS',
        items: [
          { label: 'Live Activity Logs', href: '/admin/audit-logs', icon: ShieldAlert },
          { label: 'Financial Reports', href: '/admin/payments', icon: CreditCard },
          { label: 'Platform Settings', href: '/admin/settings', icon: Settings },
        ],
      },
    ];
  } else {
    // PROFESSIONAL role (Strict 1-click & 2-click hierarchy)
    navGroups = [
      {
        title: 'PRACTICE',
        items: [
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
          { label: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
          { label: 'Queue', href: '/dashboard/appointments?tab=queue', icon: ListOrdered },
          { label: 'Patients', href: '/dashboard/appointments?tab=patients', icon: Users },
          { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
        ],
      },
      {
        title: 'MANAGE',
        items: [
          { label: 'Services', href: '/dashboard/services', icon: Briefcase },
          { label: 'Availability', href: '/dashboard/availability', icon: Clock },
          { label: 'Blocked Dates', href: '/dashboard/blocked-dates', icon: Ban },
          { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
        ],
      },
      {
        title: 'PRACTICE SETUP',
        items: [
          { label: 'Profile', href: '/dashboard/profile', icon: User },
          {
            label: 'Booking Page',
            href: '/dashboard/booking-link',
            icon: ExternalLink,
          },
          {
            label: 'QR Kit',
            href: '/dashboard/booking-link?tab=qr',
            icon: QrCode,
            badge: hasActivePurchase ? 'Active' : 'Get Kit',
          },
          {
            label: 'Subscription',
            href: '/dashboard/subscription',
            icon: Sparkles,
            badge: 'Pro',
            badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
          },
        ],
      },
      {
        title: 'PREFERENCES',
        items: [
          { label: 'Settings', href: '/dashboard/settings', icon: Settings },
          { label: 'Help & Support', href: '/dashboard/grievance', icon: LifeBuoy },
        ],
      },
    ];
  }

  const displayName = user?.name || profile?.name || user?.email?.split('@')[0] || 'User';
  const displayRole = role === 'USER' ? 'Customer' : role === 'ADMIN' ? 'Administrator' : profile?.profession || 'Professional';

  // On mobile screens (mobileOpen === true), the off-canvas drawer is ALWAYS full expanded view
  const isCollapsed = collapsed && !mobileOpen;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Fixed on Desktop/Tablet, Off-Canvas on Mobile */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-slate-950 text-slate-300 flex flex-col transition-all duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen md:shrink-0 select-none border-r border-slate-800/80 shadow-2xl md:shadow-none overflow-hidden',
          mobileOpen ? 'translate-x-0 w-72 max-w-[85vw]' : '-translate-x-full md:translate-x-0',
          isCollapsed ? 'md:w-[76px]' : 'md:w-64'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-800/80 shrink-0 bg-slate-900/50 flex items-center justify-between">
          {!isCollapsed ? (
            <>
              <Link
                href={role === 'ADMIN' ? '/admin' : '/dashboard'}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 min-w-0 flex-1 mr-2"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white font-black shadow-md shadow-indigo-600/30 shrink-0">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div className="overflow-hidden min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black text-white tracking-tight truncate">
                      Book<span className="text-indigo-400">Saathi</span>
                    </span>
                    <span
                      className={cn(
                        'text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md border shrink-0',
                        role === 'ADMIN'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : role === 'USER'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      )}
                    >
                      {role === 'ADMIN' ? 'ADMIN' : role === 'USER' ? 'USER' : 'PRO'}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Desktop / Tablet Collapse Toggle */}
              <button
                type="button"
                onClick={toggleCollapse}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:inline-flex shrink-0 cursor-pointer"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>

              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden shrink-0 cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            /* Collapsed Mode Header */
            <div className="w-full flex items-center justify-center">
              <button
                type="button"
                onClick={toggleCollapse}
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 hover:from-indigo-500 hover:to-indigo-400 flex items-center justify-center text-white font-black shadow-md shadow-indigo-600/30 transition-transform active:scale-95 cursor-pointer"
                title="Click to expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* User Profile Card */}
        <div
          className={cn(
            'border-b border-slate-800/80 shrink-0 bg-slate-900/30 transition-all',
            isCollapsed ? 'p-2.5 flex flex-col items-center' : 'p-3.5'
          )}
        >
          <div
            className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}
            title={`${displayName} (${displayRole})`}
          >
            <div className="relative shrink-0">
              {profile?.profileImage || user?.avatar ? (
                <img
                  src={profile?.profileImage || user?.avatar}
                  alt={displayName}
                  className="w-9 h-9 rounded-xl object-cover border border-indigo-400/40 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-sm shadow-md border',
                    role === 'ADMIN'
                      ? 'bg-gradient-to-br from-amber-500 to-red-600 border-amber-400/40'
                      : role === 'USER'
                      ? 'bg-gradient-to-br from-sky-500 to-indigo-600 border-sky-400/40'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400/40'
                  )}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-bold text-white truncate">{displayName}</h4>
                  {profile?.isVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">{displayRole}</p>
              </div>
            )}
          </div>
        </div>

        {/* Categorized Navigation Links */}
        <nav
          className={cn(
            'flex-1 overflow-y-auto overscroll-contain no-scrollbar transition-all',
            isCollapsed ? 'p-2 space-y-3' : 'p-3 space-y-4'
          )}
        >
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed ? (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {group.title}
                </p>
              ) : (
                gIdx > 0 && <div className="my-1.5 border-t border-slate-800/80 mx-2" />
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const [itemBase, itemQuery] = item.href.split('?');
                  const currentTab = searchParams ? searchParams.get('tab') : null;

                  let isActive = false;
                  if (itemQuery) {
                    const itemParams = new URLSearchParams(itemQuery);
                    const itemTab = itemParams.get('tab');
                    isActive = pathname === itemBase && currentTab === itemTab;
                  } else if (item.exact) {
                    isActive = pathname === item.href && !currentTab;
                  } else if (pathname === itemBase) {
                    isActive = !currentTab;
                  } else if (itemBase !== '/dashboard' && itemBase !== '/admin' && pathname.startsWith(itemBase)) {
                    isActive = true;
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        'group flex items-center rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer relative',
                        isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2',
                        isActive
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center min-w-0',
                          isCollapsed ? 'justify-center' : 'gap-2.5'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-300'
                          )}
                        />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span
                          className={cn(
                            'text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md',
                            item.badgeColor
                              ? item.badgeColor
                              : isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-indigo-500/20 text-indigo-300'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: Live Real-time Status & Logout */}
        <div
          className={cn(
            'border-t border-slate-800/80 shrink-0 bg-slate-950 transition-all pb-[max(0.75rem,env(safe-area-inset-bottom))]',
            isCollapsed ? 'p-2 space-y-1.5' : 'p-3 space-y-2'
          )}
        >
          {/* Live System Indicator */}
          {!isCollapsed ? (
            <div className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                <span className="font-semibold text-slate-300">Live Sync</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">Online</span>
            </div>
          ) : (
            <div
              className="flex justify-center p-1.5 text-emerald-400"
              title="Real-Time System Connected"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            </div>
          )}

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={logout}
            title={isCollapsed ? 'Sign Out' : undefined}
            className={cn(
              'w-full flex items-center justify-center rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer',
              isCollapsed ? 'p-2' : 'gap-2 px-3 py-1.5'
            )}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
