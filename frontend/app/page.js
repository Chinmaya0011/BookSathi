import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import ProductSuiteShowcase from '@/components/landing/ProductSuiteShowcase';
import HowItWorks from '@/components/landing/HowItWorks';
import FeatureBento from '@/components/landing/FeatureBento';
import ProfessionalCategories from '@/components/landing/ProfessionalCategories';
import PricingSection from '@/components/landing/PricingSection';
import FaqSection from '@/components/landing/FaqSection';
import FinalCta from '@/components/landing/FinalCta';
import Footer from '@/components/landing/Footer';
import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'BookSaathi — Smart Online Appointment Booking & Live Queue for Indian Professionals',
  description:
    'The easiest appointment scheduler for Doctors, Chartered Accountants, Lawyers, and Consultants in India. Share custom booking links on WhatsApp with automated UPI payments and QR standees.',
  path: '/',
  keywords: [
    'online appointment booking India',
    'doctor clinic scheduler',
    'CA appointment link',
    'lawyer consultation scheduling',
    'WhatsApp booking link',
    'live queue token system',
    'QR code standee booking',
    'UPI payment scheduler India',
    'BookSaathi',
  ],
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-600 selection:text-white flex flex-col">
      {/* Modern Fixed Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* Modern Hero Section with Interactive Preview */}
        <HeroSection />

        {/* 🌟 3-Pillar Interactive Mock Showcase: Dashboard, Booking Page & PDF */}
        <ProductSuiteShowcase />

        {/* 3-Step Simple How It Works */}
        <HowItWorks />

        {/* 6-Card Core Features Grid */}
        <FeatureBento />

        {/* Tailored For Indian Professional Practices */}
        <ProfessionalCategories />

        {/* Simple & Transparent 2-Tier Pricing */}
        <PricingSection />

        {/* Frequently Asked Questions */}
        <FaqSection />

        {/* High-Conversion Final Call-to-Action */}
        <FinalCta />
      </main>

      {/* Modern SaaS Footer */}
      <Footer />
    </div>
  );
}
