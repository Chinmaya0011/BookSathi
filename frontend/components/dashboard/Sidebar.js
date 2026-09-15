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
  Sparkles,
  ShieldCheck,
  Search,
  Bell,
  Users,
  ShieldAlert,
  MessageSquare,
  ListOrdered,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQrBannerStore } from '@/stores/useQrBannerStore';
import { cn } from '@/lib/utils';
import { getProfessionalPublicUrl } from '@/lib/urlHelpers';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { profile, user, logout } = useAuth();
  const { fetchMyOrder } = useQrBannerStore();
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role || 'USER';

  useEffect(() => {
    if (role === 'PROFESSIONAL') {
      fetchMyOrder();
    }
  }, [role, fetchMyOrder]);

  // Load / save collapsed state and auto-collapse on tablet
  useEffect(() => {
    try {
      const saved = localStorage.getItem('booksaathi_sidebar_collapsed');
      if (saved !== null) {
        setCollapsed(saved === 'true');
      } else if (typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024) {
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

  // Categorized Navigation Items
  let navGroups = [];

  if (role === 'USER') {
    navGroups = [
      {
        title: 'Main',
        items: [
          { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
          { label: 'Payments & Slips', href: '/dashboard/payments', icon: CreditCard },
          { label: 'Lookup Booking', href: '/lookup', icon: Search },
        ],
      },
      {
        title: 'Communication',
        items: [
          { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
          { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
          { label: 'Help & Support', href: '/dashboard/grievance', icon: LifeBuoy },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Profile', href: '/dashboard/profile', icon: User },
          { label: 'Settings', href: '/dashboard/settings', icon: Settings },
        ],
      },
    ];
  } else if (role === 'ADMIN') {
    navGroups = [
      {
        title: 'Management',
        items: [
          { label: 'Overview', href: '/admin', icon: LayoutDashboard },
          { label: 'Messages Hub', href: '/admin/messages', icon: MessageSquare },
          { label: 'Users', href: '/admin/users', icon: Users },
          { label: 'Professionals', href: '/admin/professionals', icon: ShieldCheck },
          { label: 'Appointments', href: '/admin/appointments', icon: Calendar },
        ],
      },
      {
        title: 'System',
        items: [
          { label: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
          { label: 'Financials', href: '/admin/payments', icon: CreditCard },
          { label: 'Platform Settings', href: '/admin/settings', icon: Settings },
        ],
      },
    ];
  } else {
    // PROFESSIONAL role
    navGroups = [
      {
        title: 'Practice',
        items: [
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
          { label: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
          { label: 'Queue', href: '/dashboard/appointments?tab=queue', icon: ListOrdered },
          { label: 'Customers', href: '/dashboard/appointments?tab=patients', icon: Users },
          { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
        ],
      },
      {
        title: 'Schedule & Services',
        items: [
          { label: 'Services', href: '/dashboard/services', icon: Briefcase },
          { label: 'Availability', href: '/dashboard/availability', icon: Clock },
          { label: 'Blocked Dates', href: '/dashboard/blocked-dates', icon: Ban },
          { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
        ],
      },
      {
        title: 'Setup & Brand',
        items: [
          { label: 'Profile', href: '/dashboard/profile', icon: User },
          {
            label: 'Booking Link & Plan',
            href: '/dashboard/booking-link',
            icon: Sparkles,
            badge: profile?.plan === 'PRO' ? 'PRO' : undefined,
          },
        ],
      },
      {
        title: 'Preferences',
        items: [
          { label: 'Settings', href: '/dashboard/settings', icon: Settings },
          { label: 'Support Desk', href: '/dashboard/grievance', icon: LifeBuoy },
        ],
      },
    ];
  }

  const displayName = user?.name || profile?.name || user?.email?.split('@')[0] || 'User';
  const displayRole =
    role === 'USER'
      ? 'Customer'
      : role === 'ADMIN'
      ? 'Admin'
      : profile?.profession || 'Professional';

  const isCollapsed = collapsed && !mobileOpen;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden transition-opacity duration-200"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-[#0c111d] text-slate-300 flex flex-col transition-all duration-250 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen md:shrink-0 select-none border-r border-slate-800/70 shadow-2xl md:shadow-none overflow-hidden font-sans',
          mobileOpen ? 'translate-x-0 w-68 max-w-[85vw]' : '-translate-x-full md:translate-x-0',
          isCollapsed ? 'md:w-[70px]' : 'md:w-64'
        )}
      >
        {/* Brand Header */}
        <div className="h-15 px-4 border-b border-slate-800/60 shrink-0 flex items-center justify-between">
          {!isCollapsed ? (
            <>
              <Link
                href={role === 'ADMIN' ? '/admin' : '/dashboard'}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 min-w-0 flex-1 group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0 transition-transform group-hover:scale-105">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div className="overflow-hidden min-w-0 flex items-center gap-2">
                  <span className="text-[15px] font-bold text-white tracking-tight">
                    Book<span className="text-indigo-400">Saathi</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 border border-slate-700/60 px-1.5 py-0.5 rounded">
                    {role === 'ADMIN' ? 'Admin' : role === 'USER' ? 'Customer' : 'Pro'}
                  </span>
                </div>
              </Link>

              {/* Collapse Button (Desktop) */}
              <button
                type="button"
                onClick={toggleCollapse}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition-colors hidden md:inline-flex shrink-0 cursor-pointer"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>

              {/* Close Button (Mobile) */}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 md:hidden shrink-0 cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            /* Collapsed Header */
            <div className="w-full flex items-center justify-center">
              <button
                type="button"
                onClick={toggleCollapse}
                className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white transition-transform active:scale-95 cursor-pointer shadow-xs"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Groups */}
        <nav
          className={cn(
            'flex-1 overflow-y-auto overscroll-contain no-scrollbar transition-all py-3',
            isCollapsed ? 'px-2 space-y-4' : 'px-3 space-y-4'
          )}
        >
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-2.5 pb-1 text-[11px] font-medium text-slate-400 tracking-wider">
                  {group.title}
                </div>
              ) : (
                gIdx > 0 && <div className="my-2 border-t border-slate-800/60 mx-1" />
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
                  } else if (
                    itemBase !== '/dashboard' &&
                    itemBase !== '/admin' &&
                    pathname.startsWith(itemBase)
                  ) {
                    isActive = true;
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        'group flex items-center rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer',
                        isCollapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-1.5',
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-400 font-semibold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
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
                            'w-4 h-4 shrink-0 transition-colors',
                            isActive
                              ? 'text-indigo-400'
                              : 'text-slate-400 group-hover:text-slate-200'
                          )}
                        />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30">
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

        {/* Profile Card & Signout Footer */}
        <div
          className={cn(
            'border-t border-slate-800/60 shrink-0 bg-[#0a0e17] transition-all',
            isCollapsed ? 'p-2 space-y-2' : 'p-3 space-y-2'
          )}
        >
          {/* User Preview */}
          <div
            className={cn(
              'flex items-center rounded-lg bg-slate-900/50 border border-slate-800/50 transition-colors',
              isCollapsed ? 'p-1.5 justify-center' : 'p-2 gap-2.5'
            )}
            title={`${displayName} • ${displayRole}`}
          >
            <div className="relative shrink-0">
              {profile?.profileImage || user?.avatar ? (
                <img
                  src={profile?.profileImage || user?.avatar}
                  alt={displayName}
                  className="w-7 h-7 rounded-md object-cover border border-slate-700"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-[#0a0e17]" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-slate-200 truncate leading-tight">
                    {displayName}
                  </span>
                  {profile?.isVerified && (
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  )}
                </div>
                <span className="text-[11px] text-slate-400 truncate block leading-tight">
                  {displayRole}
                </span>
              </div>
            )}
          </div>

          {/* Sign Out Action */}
          <button
            type="button"
            onClick={logout}
            title={isCollapsed ? 'Sign Out' : undefined}
            className={cn(
              'w-full flex items-center justify-center rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer',
              isCollapsed ? 'p-1.5' : 'gap-2 px-2.5 py-1.5'
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
