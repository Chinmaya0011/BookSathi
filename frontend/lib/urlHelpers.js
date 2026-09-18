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

  // In browser environment
  if (typeof window !== 'undefined') {
    const currentHost = window.location.host; // e.g. "book-sathi-three.vercel.app", "localhost:3000", or "booksaathi.in"
    const currentProtocol = window.location.protocol; // "http:" or "https:"

    // 1. Vercel deployment (*.vercel.app) -> Vercel does NOT support wildcard subdomains on .vercel.app
    if (currentHost.includes('vercel.app')) {
      return `${currentProtocol}//${currentHost}/book/${cleanSlug}`;
    }

    // 2. Custom Domain configured (e.g. booksaathi.in) with wildcard DNS
    if (
      envDomain &&
      !envDomain.includes('localhost') &&
      !envDomain.includes('127.0.0.1') &&
      !envDomain.includes('vercel.app')
    ) {
      return `https://${cleanSlug}.${envDomain}`;
    }

    // 3. Localhost or loopback
    if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
      const port = currentHost.includes(':') ? `:${currentHost.split(':')[1]}` : ':3000';
      return `${currentProtocol}//${cleanSlug}.localhost${port}`;
    }

    // 4. Fallback path-based routing
    return `${currentProtocol}//${currentHost}/book/${cleanSlug}`;
  }

  // Server-side execution
  const appUrl = (process.env.APP_URL || '').replace(/\/+$/, '');
  if (appUrl && appUrl.includes('vercel.app')) {
    return `${appUrl}/book/${cleanSlug}`;
  }

  if (
    envDomain &&
    !envDomain.includes('localhost') &&
    !envDomain.includes('127.0.0.1') &&
    !envDomain.includes('vercel.app')
  ) {
    return `https://${cleanSlug}.${envDomain}`;
  }

  return `http://${cleanSlug}.localhost:3000`;
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
