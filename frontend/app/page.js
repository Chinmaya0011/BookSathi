import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import TrustBar from '@/components/landing/TrustBar';
import ProductSuiteShowcase from '@/components/landing/ProductSuiteShowcase';
import HowItWorks from '@/components/landing/HowItWorks';
import RoiCalculator from '@/components/landing/RoiCalculator';
import FeatureBento from '@/components/landing/FeatureBento';
import ProfessionalCategories from '@/components/landing/ProfessionalCategories';
import LandingTestimonials from '@/components/landing/LandingTestimonials';
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
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-600 selection:text-white flex flex-col font-sans">
      {/* 1. Top Announcement Bar & Sleek Floating Glass Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* 2. Modern Hero Section with Live Simulator & Interactive Preview */}
        <HeroSection />

        {/* 3. Trust & Metrics Strip with Direct UPI Interoperability */}
        <TrustBar />

        {/* 4. 4-Pillar Interactive Product Suite: Calling Desk, WhatsApp Booking, QR Standee & Digital Pass */}
        <ProductSuiteShowcase />

        {/* 5. 3-Step Visual Practice Workflow */}
        <HowItWorks />

        {/* 6. Interactive ROI & Time-Saved Practice Calculator */}
        <RoiCalculator />

        {/* 7. Asymmetrical Feature Bento Grid */}
        <FeatureBento />

        {/* 8. Tailored For Indian Professional Practices */}
        <ProfessionalCategories />

        {/* 9. Verified Practitioner Case Studies & Testimonials */}
        <LandingTestimonials />

        {/* 10. Simple & Transparent 2-Tier Pricing with Annual Discount Toggle */}
        <PricingSection />

        {/* 11. Frequently Asked Questions with Quick Category Filters */}
        <FaqSection />

        {/* 12. High-Impact Final Conversion Call-to-Action */}
        <FinalCta />
      </main>

      {/* 13. Comprehensive Professional SaaS Footer */}
      <Footer />
    </div>
  );
}
