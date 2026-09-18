import { constructMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }) {
  const slug = params?.slug || 'professional';
  const cleanTitle = slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return constructMetadata({
    title: `${cleanTitle} — Verified Profile & Practice Info | BookSaathi`,
    description: `View verified credentials, consultation services, fee tariffs, clinic timing, and public patient feedback for ${cleanTitle} on BookSaathi.`,
    path: `/profile/${slug}`,
    keywords: [
      `${cleanTitle} profile`,
      `${cleanTitle} doctor clinic`,
      `${cleanTitle} reviews`,
      'verified professional profile India',
      'BookSaathi',
    ],
  });
}

export default function ProfileSlugLayout({ children }) {
  return <>{children}</>;
}
