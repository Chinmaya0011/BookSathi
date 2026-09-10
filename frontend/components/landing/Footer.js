import Link from 'next/link';
import { CalendarCheck, ShieldCheck, Heart } from 'lucide-react';
import { getProfessionalPublicUrl } from '@/lib/urlHelpers';

export default function Footer() {
  const demoUrl = getProfessionalPublicUrl('dr-rajesh');
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
              <span className="text-xl font-bold text-white tracking-tight">
                Book<span className="text-indigo-400">Saathi</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              The simplest online appointment booking platform built exclusively for Indian doctors, CAs, advocates, tutors, and independent service professionals.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Engineered for Indian Practices • Direct UPI Settlements</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Core Features
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-white transition-colors">
                  Practice ROI Calculator
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  SaaS Pricing & Plans
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-white transition-colors">
                  Practitioner Reviews
                </a>
              </li>
              <li>
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Live Patient Booking Demo
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Get Started</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Create Free Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Professional Sign In
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  Help & Support Center
                </Link>
              </li>
              <li className="pt-2">
                <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                  IST Timezone (UTC +05:30)
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BookSaathi.in. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <Link href="/support" className="hover:text-slate-400">
              Support Relay
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
