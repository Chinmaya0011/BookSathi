import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Professional Registration — Doctors, CAs, Lawyers & Consultants',
  description: 'Create your dedicated booking page with custom subdomain, automated UPI payments, WhatsApp notifications, and live queue management on BookSaathi.',
  path: '/register/professional',
  keywords: [
    'doctor clinic registration',
    'CA appointment system',
    'lawyer client management',
    'professional booking page India',
    'BookSaathi',
  ],
});

export default function ProfessionalRegisterLayout({ children }) {
  return <>{children}</>;
}
