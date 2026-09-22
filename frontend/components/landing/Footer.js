'use client';

import Link from 'next/link';
import { CalendarCheck, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">
                  Book<span className="text-indigo-400">Saathi</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-950 text-indigo-300 rounded-full border border-indigo-800/80">
                  🇮🇳 India
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The smart online appointment scheduling, 0% UPI fee collection & live OPD token queue platform for Indian doctors, chartered accountants, advocates, and independent consultants.
            </p>

            <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1.5">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for Indian professional practices</span>
            </div>
          </div>

          {/* Links Col 1: Product Suite */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
              Product Suite
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <a href="#interactive-demo" className="hover:text-white transition-colors">
                  Live Calling Desk
                </a>
              </li>
              <li>
                <a href="#interactive-demo" className="hover:text-white transition-colors">
                  Client WhatsApp Booking
                </a>
              </li>
              <li>
                <a href="#interactive-demo" className="hover:text-white transition-colors">
                  Tabletop QR Standee Studio
                </a>
              </li>
              <li>
                <a href="#roi-calculator" className="hover:text-white transition-colors">
                  ROI & Savings Calculator
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Concurrency & Buffer Engine
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing & Plans
                </a>
              </li>
            </ul>
          </div>

          {/* Links Col 2: For Practices */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
              For Practice
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <a href="#for-practice" className="hover:text-white transition-colors">
                  Doctors & OPD Clinics
                </a>
              </li>
              <li>
                <a href="#for-practice" className="hover:text-white transition-colors">
                  Chartered Accountants
                </a>
              </li>
              <li>
                <a href="#for-practice" className="hover:text-white transition-colors">
                  Advocates & Legal Chambers
                </a>
              </li>
              <li>
                <a href="#for-practice" className="hover:text-white transition-colors">
                  Mentors, Tutors & Coaches
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Links Col 3: Quick Shortcuts */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <Link href="/lookup" className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold flex items-center gap-1">
                  <span>Find Booking Pass</span>
                  <span>→</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Professional Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Create Free Account
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {currentYear} BookSaathi. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> 0% UPI Middleman Fee
            </span>
            <span>•</span>
            <span>HIPAA & Data Privacy Encrypted</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
