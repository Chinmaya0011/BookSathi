const rawDomain = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://www.headerguards.online').trim();
const BASE_URL = /^https?:\/\//i.test(rawDomain) ? rawDomain.replace(/\/+$/, '') : `https://${rawDomain.replace(/\/+$/, '')}`;

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/_next/',
          '/reset-password',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
