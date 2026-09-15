'use client';

import Link from 'next/link';
import { CalendarCheck, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Brand Info (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">
                  Book<span className="text-indigo-400">Saathi</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-indigo-900/60 text-indigo-300 rounded-md border border-indigo-700/50">
                  Practice OS
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-normal">
              The simple Practice & Booking OS for local doctors, CAs, lawyers, tutors, and consultants. Share one link with your local clients.
            </p>

            <div className="flex items-center gap-2 text-slate-300 font-semibold text-[11px] pt-1">
              <span>🇮🇳</span>
              <span>Built for Indian professional practices</span>
            </div>
          </div>

          {/* 3 Columns (8 cols) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* For Your Practice */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                For Your Practice
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Create Booking Link
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Professional Sign In
                  </Link>
                </li>
                <li>
                  <Link href="#dashboard-preview" className="hover:text-white transition-colors">
                    Today Queue
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white transition-colors">
                    Pricing & Plans
                  </Link>
                </li>
              </ul>
            </div>

            {/* Practice Types */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                Practice Types
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#for-professionals" className="hover:text-white transition-colors">
                    Doctors & Clinics
                  </a>
                </li>
                <li>
                  <a href="#for-professionals" className="hover:text-white transition-colors">
                    CAs & Tax Advisors
                  </a>
                </li>
                <li>
                  <a href="#for-professionals" className="hover:text-white transition-colors">
                    Lawyers & Advocates
                  </a>
                </li>
                <li>
                  <a href="#for-professionals" className="hover:text-white transition-colors">
                    Tutors & Consultants
                  </a>
                </li>
              </ul>
            </div>

            {/* Client Experience */}
            <div className="space-y-3 col-span-2 sm:col-span-1">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                Client Experience
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/lookup" className="hover:text-white transition-colors">
                    Client Pass Lookup
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-white transition-colors">
                    How Booking Works
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-white transition-colors">
                    Practice FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    0% Commission Guarantee
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {currentYear} BookSaathi.in. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-slate-400 font-medium">
            <span>Made for Indian professionals</span>
            <span>🇮🇳</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
