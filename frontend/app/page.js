import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import TrustBar from '@/components/landing/TrustBar';
import ProductDashboard from '@/components/landing/ProductDashboard';
import HowItWorks from '@/components/landing/HowItWorks';
import CustomerExperience from '@/components/landing/CustomerExperience';
import ProfessionalCategories from '@/components/landing/ProfessionalCategories';
import BookingLinkPreview from '@/components/landing/BookingLinkPreview';
import FeatureBento from '@/components/landing/FeatureBento';
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
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-600 selection:text-white flex flex-col no-scrollbar">
      {/* 1. Minimal Sticky Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* 2. SaaS Hero Section with Interactive Slot Picker & Booking Confirmation Preview */}
        <HeroSection />

        {/* 3. Compact 4-Metric Trust / Value Strip */}
        <TrustBar />

        {/* 4. Product-First Today Dashboard Centerpiece with Feature Cards */}
        <ProductDashboard />

        {/* 5. 3-Step Simple Flow (Share -> Book -> Manage) */}
        <HowItWorks />

        {/* 6. Zero-Login Customer Experience with Mobile Phone Pass */}
        <CustomerExperience />

        {/* 7. Built for Real Indian Professionals (Doctors, CAs, Lawyers, Tutors, Consultants) */}
        <ProfessionalCategories />

        {/* 8. Branded Booking Page Preview with Multi-Channel Share Strip */}
        <BookingLinkPreview />

        {/* 9. Feature Bento Grid */}
        <FeatureBento />

        {/* 10. Clean 2-Tier Pricing (Free & Pro) with Billing Interval Toggle */}
        <PricingSection />

        {/* 11. 10-Question Accordion FAQ */}
        <FaqSection />

        {/* 12. High-Conversion Final CTA */}
        <FinalCta />
      </main>

      {/* 13. Professional SaaS Footer */}
      <Footer />
    </div>
  );
}
