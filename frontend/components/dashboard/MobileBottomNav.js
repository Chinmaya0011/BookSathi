'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Briefcase,
  Search,
  MessageSquare,
  User,
  Settings,
  Plus,
  Clock,
  QrCode,
  Sparkles,
  Menu,
  X,
  ShieldCheck,
  ListOrdered,
  Users,
  Ban,
  LifeBuoy,
  ExternalLink,
  Zap,
  UserPlus,
  IndianRupee,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function MobileBottomNav({ onOpenManualModal }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, profile, logout } = useAuth();
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const role = user?.role || 'USER';

  // Mobile Bottom Navigation Destinations (Strict 5-slot architecture)
  let navItems = [];

  if (role === 'USER') {
    navItems = [
      {
        label: 'Home',
        href: '/dashboard',
        icon: LayoutDashboard,
        exact: true,
      },
      {
        label: 'Find',
        href: '/dashboard/find',
        icon: Search,
      },
      {
        isFab: true,
        label: 'Book',
        action: () => setCreateSheetOpen(true),
        icon: Plus,
      },
      {
        label: 'Bookings',
        href: '/dashboard/appointments',
        icon: Calendar,
      },
      {
        label: 'Account',
        href: '/dashboard/profile',
        icon: User,
      },
    ];
  } else if (role === 'ADMIN') {
    navItems = [
      {
        label: 'Home',
        href: '/admin',
        icon: LayoutDashboard,
        exact: true,
      },
      {
        label: 'Messages',
        href: '/admin/messages',
        icon: MessageSquare,
      },
      {
        isFab: true,
        label: 'Action',
        action: () => setCreateSheetOpen(true),
        icon: Plus,
      },
      {
        label: 'Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        label: 'Settings',
        href: '/admin/settings',
        icon: Settings,
      },
    ];
  } else {
    // PROFESSIONAL role (Exact: Home, Queue, + Create, Schedule, More)
    navItems = [
      {
        label: 'Home',
        href: '/dashboard',
        icon: LayoutDashboard,
        exact: true,
      },
      {
        label: 'Queue',
        href: '/dashboard/appointments?tab=queue',
        icon: ListOrdered,
      },
      {
        isFab: true,
        label: 'Create',
        action: () => setCreateSheetOpen(true),
        icon: Plus,
      },
      {
        label: 'Schedule',
        href: '/dashboard/appointments',
        icon: Calendar,
      },
      {
        label: 'More',
        isAction: true,
        action: () => setMoreMenuOpen(true),
        icon: Menu,
      },
    ];
  }

  // Quick Action Options for Center "+" Create FAB
  const proQuickActions = [
    {
      id: 'walkin',
      title: 'Walk-In Appointment',
      subtitle: 'Schedule instant offline / phone client',
      icon: Zap,
      iconColor: 'bg-indigo-600 text-white shadow-indigo-600/30',
      action: () => {
        setCreateSheetOpen(false);
        if (onOpenManualModal) onOpenManualModal();
        else if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('open-manual-booking-modal'));
        }
      },
    },
    {
      id: 'appointment',
      title: 'New Scheduled Slot',
      subtitle: 'Open calendar to schedule a future visit',
      icon: Calendar,
      iconColor: 'bg-sky-600 text-white shadow-sky-600/30',
      href: '/dashboard/appointments',
      action: () => setCreateSheetOpen(false),
    },
    {
      id: 'patient',
      title: 'Add Patient Record',
      subtitle: 'Register client profile & medical notes',
      icon: UserPlus,
      iconColor: 'bg-emerald-600 text-white shadow-emerald-600/30',
      href: '/dashboard/appointments?tab=patients',
      action: () => setCreateSheetOpen(false),
    },
    {
      id: 'payment',
      title: 'Collect Payment / Bill',
      subtitle: 'Issue invoice or record fee settlement',
      icon: IndianRupee,
      iconColor: 'bg-amber-600 text-white shadow-amber-600/30',
      href: '/dashboard/payments',
      action: () => setCreateSheetOpen(false),
    },
  ];

  // More Drawer Categorized Sections for Professional
  const proMoreSections = [
    {
      title: 'PRACTICE',
      items: [
        { label: 'Patients Directory', href: '/dashboard/appointments?tab=patients', icon: Users, desc: 'Client medical profiles' },
        { label: 'Payments & Revenue', href: '/dashboard/payments', icon: CreditCard, desc: 'Earnings & settlements' },
        { label: 'Direct Messages', href: '/dashboard/messages', icon: MessageSquare, desc: 'Client inquiries' },
      ],
    },
    {
      title: 'MANAGE',
      items: [
        { label: 'Services & Tariffs', href: '/dashboard/services', icon: Briefcase, desc: 'Tariffs, fees & duration' },
        { label: 'Weekly Availability', href: '/dashboard/availability', icon: Clock, desc: 'Shifts & working hours' },
        { label: 'Blocked Dates', href: '/dashboard/blocked-dates', icon: Ban, desc: 'Leaves & clinic holidays' },
      ],
    },
    {
      title: 'PRACTICE SETUP',
      items: [
        { label: 'Professional Profile', href: '/dashboard/profile', icon: User, desc: 'Doctor/CA bio & details' },
        { label: 'Public Booking Page', href: '/dashboard/booking-link', icon: ExternalLink, desc: 'Live subdomain link' },
        { label: 'Reception QR Kit', href: '/dashboard/booking-link?tab=qr', icon: QrCode, desc: 'Order acrylic standee kit' },
        { label: 'Subscription & Pro', href: '/dashboard/subscription', icon: Sparkles, desc: 'Membership & limits' },
      ],
    },
    {
      title: 'PREFERENCES',
      items: [
        { label: 'Practice Settings', href: '/dashboard/settings', icon: Settings, desc: 'Notifications & security' },
        { label: 'Help & Support Desk', href: '/dashboard/grievance', icon: LifeBuoy, desc: 'Tickets & dispute triage' },
      ],
    },
  ];

  return (
    <>
      {/* 1. Center "+" Quick Action Bottom Sheet */}
      {createSheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs"
            onClick={() => setCreateSheetOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 max-h-[85vh] overflow-y-auto overscroll-contain animate-in slide-in-from-bottom duration-300">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Create New Action</h3>
                <p className="text-xs text-slate-500">Fast 1-tap shortcut creation</p>
              </div>
              <button
                type="button"
                onClick={() => setCreateSheetOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {proQuickActions.map((act) => {
                const Icon = act.icon;
                if (act.href) {
                  return (
                    <Link
                      key={act.id}
                      href={act.href}
                      onClick={act.action}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/80 hover:bg-indigo-50/70 hover:border-indigo-200 active:scale-98 transition-all"
                    >
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-md shrink-0', act.iconColor)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{act.subtitle}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </Link>
                  );
                }

                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={act.action}
                    className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/80 hover:bg-indigo-50/70 hover:border-indigo-200 active:scale-98 transition-all text-left cursor-pointer"
                  >
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-md shrink-0', act.iconColor)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{act.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Full-Height Categorized "More" Drawer Sheet */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs"
            onClick={() => setMoreMenuOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 max-h-[85vh] overflow-y-auto overscroll-contain animate-in slide-in-from-bottom duration-300">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Practice Hub & Settings</h3>
                  <p className="text-[11px] text-slate-500">Quick access to all practice features</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMoreMenuOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Categorized Groups */}
            <div className="space-y-4">
              {proMoreSections.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                    {group.title}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href.split('?')[0];
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setMoreMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-98',
                            isActive
                              ? 'bg-indigo-50/90 border-indigo-200 text-indigo-900'
                              : 'bg-slate-50/70 border-slate-100 text-slate-700 hover:bg-slate-100'
                          )}
                        >
                          <div
                            className={cn(
                              'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs',
                              isActive ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate leading-tight">{item.label}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.desc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Sign Out Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setMoreMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Practice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modern Floating Bottom Navigation Bar for Mobile (< md) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_25px_rgba(15,23,42,0.08)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-all select-none min-h-[62px]"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto relative">
          {navItems.map((item, idx) => {
            // FAB Item (Center Elevated Button)
            if (item.isFab) {
              return (
                <div key="fab-button" className="relative -top-3.5 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={item.action}
                    aria-label={item.label}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 active:scale-90 transition-transform cursor-pointer border-2 border-white"
                  >
                    <item.icon className="w-6 h-6 stroke-[2.5]" />
                  </button>
                  <span className="text-[10px] font-extrabold text-indigo-600 mt-0.5">
                    {item.label}
                  </span>
                </div>
              );
            }

            // Custom Action Item (e.g. More Drawer trigger)
            if (item.isAction) {
              const Icon = item.icon;
              return (
                <button
                  key={`action-${idx}`}
                  type="button"
                  onClick={item.action}
                  className="flex flex-col items-center justify-center py-1 px-3 min-w-[56px] text-slate-500 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="w-9 h-7 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold mt-0.5 truncate">
                    {item.label}
                  </span>
                </button>
              );
            }

            // Standard Route Link Tab
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
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-1 px-2.5 min-w-[56px] rounded-2xl transition-all active:scale-95 relative',
                  isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {/* Active Pill Glow Indicator */}
                <div
                  className={cn(
                    'w-9 h-7 rounded-xl flex items-center justify-center transition-all',
                    isActive ? 'bg-indigo-50 text-indigo-600 shadow-2xs font-bold' : ''
                  )}
                >
                  <Icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110 stroke-[2.5]')} />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-semibold mt-0.5 truncate tracking-tight',
                    isActive ? 'font-black text-indigo-700' : 'text-slate-500'
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 absolute bottom-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
