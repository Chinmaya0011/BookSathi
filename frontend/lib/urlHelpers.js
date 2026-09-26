/**
 * Generates canonical booking URL for a professional
 * - Vercel / Cloud Demo: https://book-sathi-three.vercel.app/book/<slug>
 * - Custom Wildcard Domain: https://<slug>.<APP_DOMAIN>
 * - Localhost: http://<slug>.localhost:3000 or http://localhost:3000/book/<slug>
 * 
 * @param {string|object} slugOrProfile
 * @returns {string}
 */
export function getProfessionalPublicUrl(slugOrProfile) {
  const slug = typeof slugOrProfile === 'string' ? slugOrProfile : slugOrProfile?.bookingSlug;
  if (!slug) return '';

  const cleanSlug = slug.toLowerCase().trim();
  const envDomain = (process.env.APP_DOMAIN || '').replace(/^https?:\/\//, '').trim();
  const allowWildcards = process.env.ENABLE_WILDCARD_SUBDOMAINS === 'true';

  // In browser environment
  if (typeof window !== 'undefined') {
    const currentHost = window.location.host; // e.g. "headerguards.online", "localhost:3000"
    const currentProtocol = window.location.protocol; // "http:" or "https:"

    // 1. Explicitly enabled Wildcard Subdomains on custom domain (e.g. *.headerguards.online)
    if (
      allowWildcards &&
      envDomain &&
      !envDomain.includes('localhost') &&
      !envDomain.includes('127.0.0.1') &&
      !envDomain.includes('vercel.app')
    ) {
      return `https://${cleanSlug}.${envDomain}`;
    }

    // 2. Standard direct path-based routing (Works 100% reliably on all hosts, domains & SSL)
    return `${currentProtocol}//${currentHost}/book/${cleanSlug}`;
  }

  // Server-side execution
  const appUrl = (process.env.APP_URL || '').replace(/\/+$/, '');
  if (appUrl) {
    return `${appUrl}/book/${cleanSlug}`;
  }

  if (
    allowWildcards &&
    envDomain &&
    !envDomain.includes('localhost') &&
    !envDomain.includes('127.0.0.1') &&
    !envDomain.includes('vercel.app')
  ) {
    return `https://${cleanSlug}.${envDomain}`;
  }

  return `/book/${cleanSlug}`;
}

/**
 * Generates display text for a professional's URL
 * @param {string|object} slugOrProfile 
 * @returns {string} e.g. "book-sathi-three.vercel.app/book/dr-rajesh" or "dr-rajesh.booksaathi.in"
 */
export function getProfessionalDisplayUrl(slugOrProfile) {
  const fullUrl = getProfessionalPublicUrl(slugOrProfile);
  return fullUrl.replace(/^https?:\/\//, '');
}

/**
 * Returns clean standard path fallback e.g. /book/dr-rajesh
 */
export function getProfessionalPathUrl(slugOrProfile) {
  const slug = typeof slugOrProfile === 'string' ? slugOrProfile : slugOrProfile?.bookingSlug;
  if (!slug) return '';
  return `/book/${slug.toLowerCase().trim()}`;
}
