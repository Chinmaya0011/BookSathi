const BASE_URL = process.env.APP_URL || 'https://booksaathi.in';

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
