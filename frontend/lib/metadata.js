/**
 * BookSaathi Centralized SEO & Social Metadata Builder
 * Generates OpenGraph, Twitter/X cards, canonical URLs, robots, and JSON-LD schemas
 */

const SITE_NAME = 'BookSaathi';
const DEFAULT_TITLE = 'BookSaathi — Simple Booking Platform for Indian Professionals';
const DEFAULT_DESCRIPTION =
  'India’s most streamlined appointment booking and live queue management system for Doctors, CAs, Lawyers, and Consultants. Share custom booking links on WhatsApp with automated UPI payments and QR standees.';

function getValidBaseUrl(raw) {
  let urlStr = (raw || process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://www.headerguards.online').trim();
  if (!/^https?:\/\//i.test(urlStr)) {
    urlStr = `https://${urlStr}`;
  }
  // Strip trailing slashes
  urlStr = urlStr.replace(/\/+$/, '');
  try {
    return new URL(urlStr);
  } catch {
    return new URL('https://www.headerguards.online');
  }
}

const DEFAULT_BASE_URL = getValidBaseUrl(process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.headerguards.online');
const APP_URL = DEFAULT_BASE_URL.origin;

export function constructMetadata({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = '/og-image.jpg',
  twitterImage = '/twitter-image.jpg',
  path = '',
  noIndex = false,
  keywords = [
    'appointment booking India',
    'doctor clinic appointment',
    'CA consultation scheduler',
    'lawyer client booking link',
    'WhatsApp booking link',
    'live queue token system',
    'Indian professional booking',
    'BookSaathi',
  ],
  type = 'website',
} = {}) {
  const url = `${APP_URL.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

  return {
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords,
    authors: [{ name: SITE_NAME, url: APP_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    metadataBase: DEFAULT_BASE_URL,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — Smart Scheduling & Live Queue`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [twitterImage],
      creator: '@BookSaathi',
      site: '@BookSaathi',
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          nocache: false,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}
