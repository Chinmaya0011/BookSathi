'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  UserCheck,
  Settings,
  LogOut,
  ExternalLink,
  Activity,
  Menu,
  X,
  LifeBuoy,
  Package,
  Sparkles,
  FileText,
  Sliders,
  History,
  Layers,
  ArrowLeft,
  ChevronRight,
  MessageSquare,
  Search,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, mounted, router]);

  if (!mounted || loading || !user || user.role !== 'ADMIN') {
    return (
      <div className="h-screen w-screen bg-slate-950 text-slate-300 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
          </div>
          <p className="text-xs font-semibold tracking-wide text-slate-300">Verifying Admin Authorization...</p>
        </div>
      </div>
    );
  }

  const navGroups = [
    {
      title: 'COMMAND & CONTROL',
      items: [
        { label: 'Executive Overview', href: '/admin', icon: LayoutDashboard },
        { label: 'Live Chat & Comms', href: '/admin/messages', icon: MessageSquare, badge: 'Omni' },
      ],
    },
    {
      title: 'COMMERCE & PARTNERS',
      items: [
        { label: 'Professionals Directory', href: '/admin/professionals', icon: UserCheck },
        { label: 'QR Standee & Kits', href: '/admin/orders', icon: Package },
        { label: 'Subscriptions & Tiers', href: '/admin/subscriptions', icon: Layers },
        { label: 'Financial Ledger', href: '/admin/payments', icon: CreditCard },
      ],
    },
    {
      title: 'PLATFORM OPERATIONS',
      items: [
        { label: 'Global Appointments', href: '/admin/appointments', icon: Calendar },
        { label: 'Support & Grievances', href: '/admin/grievances', icon: LifeBuoy },
      ],
    },
    {
      title: 'SECURITY & INFRASTRUCTURE',
      items: [
        { label: 'Security & Login Activity', href: '/admin/security', icon: ShieldAlert, badge: 'Active' },
        { label: 'Users & RBAC', href: '/admin/users', icon: Users },
        { label: 'System Audit Logs', href: '/admin/audit-logs', icon: History },
        { label: 'Platform Settings', href: '/admin/settings', icon: Sliders },
      ],
    },
  ];

  // Helper for current page title
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Executive Command Center';
    const sub = pathname.replace('/admin/', '');
    return sub
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#0a0e17] text-slate-100 selection:bg-rose-500 selection:text-white font-sans antialiased">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Admin Obsidian Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-68 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen md:shrink-0 select-none shadow-2xl',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-rose-600/30">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-sm font-black text-white tracking-tight flex items-center gap-1">
                Book<span className="text-rose-400">Saathi</span>
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block -mt-0.5">
                Admin Console
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[9px] font-black uppercase tracking-wider">
            Super
          </span>
        </div>

        {/* Admin Identity Pill */}
        <div className="p-3.5 border-b border-slate-800/60 shrink-0 bg-slate-950/30">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
              {user.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-200 truncate">{user.email}</h4>
              <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Super Administrator</span>
              </p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto overscroll-contain">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <span className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                {group.title}
              </span>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group',
                        isActive
                          ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30 border border-rose-500/50'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-rose-400')} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span className={cn(
                            'text-[9px] font-extrabold px-1.5 py-0.2 rounded-md uppercase tracking-wider',
                            isActive ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-300'
                          )}>
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Quick Return & Logout Footer */}
        <div className="p-3 border-t border-slate-800/80 space-y-1.5 shrink-0 bg-slate-950/50">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-700/60"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>User Dashboard</span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">PRO</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Control</span>
          </button>
        </div>
      </aside>

      {/* Main Administrative Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#0a0e17]">
        {/* Top Command Header Bar */}
        <header className="h-16 px-4 sm:px-8 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="text-slate-300 hidden sm:inline">BookSaathi Master</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-rose-400 font-mono text-[11px] uppercase tracking-wider">
                {getPageTitle()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>System Operational</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-bold text-slate-300 border border-slate-700/80 transition-colors shadow-xs"
            >
              <span>View Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Scrollable Main Viewport */}
        <main
          className={cn(
            'flex-1 min-w-0 min-h-0',
            pathname?.startsWith('/admin/messages')
              ? 'overflow-hidden flex flex-col p-0 sm:p-3 md:p-4'
              : 'overflow-y-auto p-4 sm:p-8 overscroll-contain'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
