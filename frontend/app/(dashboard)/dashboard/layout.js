'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SetupReminderBanner from '@/components/dashboard/SetupReminderBanner';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  const isChatPage = pathname?.startsWith('/dashboard/messages');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, mounted, router]);

  if (!mounted || loading || !user) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <p className="text-xs text-slate-500 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full flex bg-slate-50 text-slate-900 overflow-hidden relative">
      {/* Fixed Full-Height Sidebar on Desktop / Off-canvas on Mobile */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area with Independent Scroll */}
      <div className="flex-1 flex flex-col h-[100dvh] min-w-0 overflow-hidden">
        <DashboardHeader setMobileOpen={setMobileOpen} />
        {!isChatPage && <SetupReminderBanner />}
        
        {isChatPage ? (
          <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden p-0 sm:p-2 md:p-3 pb-[76px] md:pb-3 w-full">
            {children}
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 sm:px-4 lg:px-5 py-2.5 sm:py-3 pb-28 md:pb-6 overscroll-y-contain w-full">
            <div className="w-full max-w-full">
              {children}
            </div>
          </main>
        )}

        {/* Modern Mobile Bottom Navigation Bar (< md) */}
        <MobileBottomNav />
      </div>
    </div>
  );
}


