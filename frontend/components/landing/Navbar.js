'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  CalendarCheck,
  Menu,
  X,
  ArrowRight,
  LayoutDashboard,
  Search,
  Sparkles,
  ShieldCheck,
  ChevronRight,
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
    <>
      {/* Top Notification / Announcement Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white text-xs py-2 px-4 text-center font-medium border-b border-indigo-700/50 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[11px] font-bold border border-indigo-400/30">
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>0% Commission</span>
          </span>
          <span className="text-slate-200">
            Direct UPI settlements directly to your bank account for Doctors, CAs & Advocates.
          </span>
          <Link
            href="/register"
            className="inline-flex items-center gap-1 text-white font-bold underline hover:text-indigo-200 ml-1 transition-colors"
          >
            <span>Claim Your Link</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Floating Glassmorphism Sticky Navbar */}
      <header className="sticky top-0 inset-x-0 z-50 flex justify-center px-3 sm:px-6 py-2.5 sm:py-3.5 transition-all duration-300">
        <div
          className={`w-full max-w-7xl rounded-2xl transition-all duration-300 ${
            scrolled
              ? 'bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg shadow-slate-900/5 py-2.5 px-4 sm:px-6'
              : 'bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-xs py-3 px-4 sm:px-6'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25 group-hover:scale-105 transition-transform shrink-0">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  Book<span className="text-indigo-600">Saathi</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100/80">
                  🇮🇳 India
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <a
                href="#interactive-demo"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
              >
                Product Suite
              </a>
              <a
                href="#how-it-works"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#roi-calculator"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
              >
                ROI Calculator
              </a>
              <a
                href="#features"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
              >
                Features
              </a>
              <a
                href="#for-practice"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
              >
                For Practices
              </a>
              <a
                href="#pricing"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
              >
                FAQ
              </a>
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden sm:flex items-center gap-2.5">
              <Link
                href="/lookup"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Find Booking Pass</span>
              </Link>

              {mounted && user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/25 transition-all active:scale-95"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger & Quick CTA */}
            <div className="flex items-center gap-2 lg:hidden">
              <Link
                href="/register"
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Free Setup
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="mt-3 pt-3 pb-2 border-t border-slate-200/80 space-y-1 text-sm font-semibold text-slate-700 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <a
                href="#interactive-demo"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Product Suite Showcase
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                How It Works
              </a>
              <a
                href="#roi-calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                ROI & Savings Calculator
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Features
              </a>
              <a
                href="#for-practice"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                For Practice
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Pricing
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                FAQ
              </a>
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <Link
                  href="/lookup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-indigo-600 font-bold hover:bg-indigo-50"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Booking / Lookup Pass</span>
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-100 font-bold"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg bg-indigo-600 text-white font-bold text-center shadow-xs"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
