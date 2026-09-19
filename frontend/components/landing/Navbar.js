'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  CalendarCheck,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  Search,
  CheckCircle2,
} from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-2 sm:top-4 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
      <div
        className={`pointer-events-auto w-full max-w-6xl rounded-full transition-all duration-300 ${
          scrolled
            ? 'bg-slate-950 border border-slate-700/80 shadow-2xl shadow-black/80 ring-1 ring-white/15 py-2 sm:py-2.5 px-4 sm:px-6'
            : 'bg-slate-900 border border-slate-700/70 shadow-2xl shadow-black/50 ring-1 ring-white/10 py-2.5 sm:py-3 px-4 sm:px-6'
        }`}
      >
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/40 group-hover:scale-105 transition-transform shrink-0">
              <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-white font-sans">
                Book<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-300">Saathi</span>
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-400/30">
                Practice OS
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1 rounded-full border border-slate-800">
            <a
              href="#how-it-works"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              How It Works
            </a>
            <a
              href="#dashboard-preview"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              Today Queue
            </a>
            <a
              href="#for-professionals"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              For Practice
            </a>
            <a
              href="#pricing"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              FAQ
            </a>
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/lookup"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-all"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Find Booking</span>
            </Link>

            {mounted && user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Create Free Link</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger & Fast Action */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link
              href="/register"
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs font-bold rounded-full shadow-xs"
            >
              Start Free
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="mt-3 pt-3 pb-2 border-t border-white/10 space-y-2 text-sm font-semibold text-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-white/10"
            >
              How It Works
            </a>
            <a
              href="#dashboard-preview"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-white/10"
            >
              Today Queue
            </a>
            <a
              href="#for-professionals"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-white/10"
            >
              For Practice
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-white/10"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-white/10"
            >
              FAQ
            </a>
            <Link
              href="/lookup"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-white/10 text-indigo-300 font-bold"
            >
              🔍 Client Pass Lookup
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-white/10 font-bold"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
