import Link from 'next/link';
import { CalendarCheck, ShieldCheck, Search } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 sm:py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3.5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-600/30">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Book<span className="text-indigo-400">Saathi</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              The simplest online appointment booking platform built exclusively for Indian doctors, CAs, advocates, tutors, and independent service professionals.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>0% Platform Commission • Instant WhatsApp Confirmations</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">For Clients</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a href="#directory" className="hover:text-white transition-colors">
                  Find Verified Doctors & Pros
                </a>
              </li>
              <li>
                <Link href="/lookup" className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold inline-flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  <span>Find My Booking (By Phone)</span>
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How Booking Works
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Client FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">For Professionals</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Create Free Booking Link
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Professional Sign In
                </Link>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Free vs Pro Pricing
                </a>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-white transition-colors">
                  2-Minute Setup Wizard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BookSaathi.in • Built for Indian Professionals</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/lookup" className="hover:text-slate-400">
              Customer Lookup
            </Link>
            <Link href="/login" className="hover:text-slate-400">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-slate-400">
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
