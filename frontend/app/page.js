'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CalendarCheck, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import LandingHero from '@/components/landing/LandingHero';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingInteractiveDemo from '@/components/landing/LandingInteractiveDemo';
import LandingPricing from '@/components/landing/LandingPricing';
import LandingTestimonials from '@/components/landing/LandingTestimonials';
import LandingFaq from '@/components/landing/LandingFaq';

import { getProfessionalPublicUrl } from '@/lib/urlHelpers';

export default function HomePage() {
  const demoUrl = getProfessionalPublicUrl('dr-rajesh');
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-600 selection:text-white flex flex-col no-scrollbar">
      {/* 1. Header Navigation */}
      <Navbar />

      {/* 2. Hero Section with Live Booking Preview */}
      <LandingHero />

      {/* 3. Core Features Bento Showcase */}
      <LandingFeatures />

      {/* 4. Practice Growth & ROI Calculator */}
      <LandingInteractiveDemo />

      {/* 5. Simple Transparent Pricing */}
      <LandingPricing />

      {/* 6. Verified Practitioner Testimonials */}
      <LandingTestimonials />

      {/* 7. FAQs */}
      <LandingFaq />

      {/* 8. Bottom Pre-Footer CTA Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Start Free in 2 Minutes</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Ready to automate your practice appointments?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join thousands of Indian doctors, chartered accountants, and independent professionals who save hours every week and collect 100% direct UPI fees.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all"
            >
              <span>Create Your Free Booking Page</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs sm:text-sm transition-all"
            >
              <span>Test Live Patient Demo</span>
            </a>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>0% Platform Commission</span>
            </span>
            <span>•</span>
            <span>No Credit Card Required</span>
            <span>•</span>
            <span>Instant Public URL</span>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <Footer />
    </div>
  );
}
