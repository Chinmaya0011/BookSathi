'use client';

import Link from 'next/link';
import { CalendarCheck } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white">
                  Book<span className="text-indigo-400">Saathi</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-950 text-indigo-300 rounded border border-indigo-800/60">
                  India
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The smart online appointment scheduling & live queue system for Indian doctors, chartered accountants, advocates, and consultants.
            </p>

            <div className="text-[11px] text-slate-400 pt-1">
              <span>🇮🇳 Made for Indian professional practices</span>
            </div>
          </div>

          {/* Links Col 1: Product */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#for-practice" className="hover:text-white transition-colors">
                  For Practice
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing & Plans
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Links Col 2: For Practice */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Practices
            </h4>
            <ul className="space-y-2">
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
                  Advocates & Legal
                </a>
              </li>
              <li>
                <a href="#for-practice" className="hover:text-white transition-colors">
                  Tutors & Consultants
                </a>
              </li>
            </ul>
          </div>

          {/* Links Col 3: Clients */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Clients
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/lookup" className="hover:text-white transition-colors text-indigo-400">
                  Find Booking Pass
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Professional Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Start Free Account
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {currentYear} BookSaathi. All rights reserved.
          </div>
          <div>
            Zero Commission • HIPAA & Data Privacy Compliant
          </div>
        </div>

      </div>
    </footer>
  );
}
