import { constructMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }) {
  const slug = params?.slug || 'professional';
  const cleanTitle = slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return constructMetadata({
    title: `Book Appointment with ${cleanTitle}`,
    description: `Schedule an instant consultation or join the live token queue with ${cleanTitle} on BookSaathi. Real-time availability, instant WhatsApp updates, and secure UPI payment.`,
    path: `/book/${slug}`,
    keywords: [
      `book ${cleanTitle}`,
      `${cleanTitle} appointment`,
      `${cleanTitle} consultation`,
      'online appointment booking India',
      'live queue token',
      'BookSaathi',
    ],
  });
}

export default function BookSlugLayout({ children }) {
  return <>{children}</>;
}
