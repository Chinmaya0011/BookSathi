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
  ChevronDown,
  ChevronRight,
  Stethoscope,
  Calculator,
  Scale,
  GraduationCap,
  Zap,
  BookOpen,
} from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [practiceDropdownOpen, setPracticeDropdownOpen] = useState(false);
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
      {/* Top Announcement Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 text-white text-xs py-2 px-3 sm:px-4 text-center font-medium border-b border-indigo-900/60 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] sm:text-[11px] font-bold border border-indigo-400/30">
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>0% Commission</span>
          </span>
          <span className="text-slate-200 text-[11px] sm:text-xs">
            Direct UPI settlements to your bank account for Doctors, CAs & Advocates.
          </span>
          <Link
            href="/register"
            className="inline-flex items-center gap-1 text-white font-bold underline hover:text-indigo-200 text-[11px] sm:text-xs ml-1 transition-colors"
          >
            <span>Claim Your Link</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Floating Glassmorphism Sticky Navbar */}
      <header className="sticky top-0 inset-x-0 z-50 flex justify-center px-3 sm:px-6 py-2.5 sm:py-3 transition-all duration-300">
        <div
          className={`w-full max-w-7xl rounded-2xl transition-all duration-300 ${
            scrolled
              ? 'bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg shadow-slate-900/5 py-2 px-3 sm:px-5'
              : 'bg-white/85 backdrop-blur-md border border-slate-200/70 shadow-xs py-2.5 px-3 sm:px-5'
          }`}
        >
          <div className="flex items-center justify-between gap-2 lg:gap-4">
            
            {/* Left: Brand Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25 group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Book<span className="text-indigo-600">Saathi</span>
                </span>
                <span className="hidden xl:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                  India
                </span>
              </div>
            </Link>

            {/* Center: Desktop Navigation Links (Clean & Responsive) */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-slate-600 font-semibold text-xs">
              <a
                href="#interactive-demo"
                className="px-2.5 xl:px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors whitespace-nowrap"
              >
                Product Suite
              </a>

              <a
                href="#how-it-works"
                className="px-2.5 xl:px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors whitespace-nowrap"
              >
                How It Works
              </a>

              <a
                href="#features"
                className="px-2.5 xl:px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors whitespace-nowrap"
              >
                Features
              </a>

              {/* Practices Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setPracticeDropdownOpen(true)}
                onMouseLeave={() => setPracticeDropdownOpen(false)}
              >
                <a
                  href="#for-practice"
                  className="px-2.5 xl:px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <span>For Practices</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${practiceDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                </a>

                {/* Dropdown Menu */}
                {practiceDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 p-2 bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 space-y-1 animate-in fade-in zoom-in-95 duration-150 z-50">
                    <a
                      href="#for-practice"
                      onClick={() => setPracticeDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Stethoscope className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">Doctors & OPD Clinics</div>
                        <div className="text-[10px] text-slate-500 font-normal">Live Queue Calling & Tokens</div>
                      </div>
                    </a>

                    <a
                      href="#for-practice"
                      onClick={() => setPracticeDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Calculator className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">CAs & Tax Advisors</div>
                        <div className="text-[10px] text-slate-500 font-normal">Fixed Slots & Document Lists</div>
                      </div>
                    </a>

                    <a
                      href="#for-practice"
                      onClick={() => setPracticeDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                        <Scale className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">Advocates & Legal</div>
                        <div className="text-[10px] text-slate-500 font-normal">Chambers & Court Buffers</div>
                      </div>
                    </a>

                    <a
                      href="#for-practice"
                      onClick={() => setPracticeDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">Mentors & Tutors</div>
                        <div className="text-[10px] text-slate-500 font-normal">1:1 Paid Session Scheduler</div>
                      </div>
                    </a>
                  </div>
                )}
              </div>

              <a
                href="#pricing"
                className="px-2.5 xl:px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors whitespace-nowrap"
              >
                Pricing
              </a>

              <Link
                href="/blog"
                className="px-2.5 xl:px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <span>Blog</span>
              </Link>

              <a
                href="#faq"
                className="px-2.5 xl:px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors whitespace-nowrap"
              >
                FAQ
              </a>
            </nav>

            {/* Right: Quick Pass Lookup + Auth CTAs */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                href="/lookup"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 px-2.5 xl:px-3 py-1.5 rounded-xl hover:bg-slate-100/80 transition-colors whitespace-nowrap"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">Find Pass</span>
              </Link>

              {mounted && user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all active:scale-95 whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 px-2.5 sm:px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/25 transition-all active:scale-95 whitespace-nowrap"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors lg:hidden shrink-0"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>

          {/* Mobile Dropdown Drawer */}
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
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Features & Capabilities
              </a>
              <a
                href="#for-practice"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                For Practice (Doctors, CAs, Advocates)
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Pricing & Plans
              </a>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100 font-bold text-indigo-600"
              >
                Blog & Practice Guides
              </Link>
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
                  <span>Find Booking Pass</span>
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
