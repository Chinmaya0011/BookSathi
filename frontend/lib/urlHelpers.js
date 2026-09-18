/**
 * Generates canonical subdomain-based public booking URL for a professional
 * Development: http://<slug>.localhost:3000
 * Production:  https://<slug>.<APP_DOMAIN>
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
    const currentHost = window.location.host; // e.g. "localhost:3000", "dr-rajesh.localhost:3000", or "booksaathi.in"
    const currentProtocol = window.location.protocol; // "http:" or "https:"

    // If production custom domain is configured in env (e.g. booksaathi.in or yourdomain.com)
    if (envDomain && !envDomain.includes('localhost') && !envDomain.includes('127.0.0.1')) {
      return `https://${cleanSlug}.${envDomain}`;
    }

    // Localhost or loopback: format as clean subdomain http://dr-rajesh.localhost:3000
    if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
      const port = currentHost.includes(':') ? `:${currentHost.split(':')[1]}` : ':3000';
      return `${currentProtocol}//${cleanSlug}.localhost${port}`;
    }

    // Fallback based on apex domain
    const hostParts = currentHost.split(':')[0].split('.');
    const baseDomain = hostParts.length > 2 ? hostParts.slice(-2).join('.') : currentHost.split(':')[0];
    const port = currentHost.includes(':') ? `:${currentHost.split(':')[1]}` : '';
    return `${currentProtocol}//${cleanSlug}.${baseDomain}${port}`;
  }

  // Server-side execution
  if (envDomain && !envDomain.includes('localhost') && !envDomain.includes('127.0.0.1')) {
    return `https://${cleanSlug}.${envDomain}`;
  }

  return `http://${cleanSlug}.localhost:3000`;
}

/**
 * Generates display text for a professional's URL
 * @param {string|object} slugOrProfile 
 * @returns {string} e.g. "dr-rajesh.booksaathi.in" or "dr-rajesh.localhost:3000"
 */
export function getProfessionalDisplayUrl(slugOrProfile) {
  const fullUrl = getProfessionalPublicUrl(slugOrProfile);
  return fullUrl.replace(/^https?:\/\//, '');
}

/**
 * Returns clean standard path fallback if needed e.g. /book/dr-rajesh
 */
export function getProfessionalPathUrl(slugOrProfile) {
  const slug = typeof slugOrProfile === 'string' ? slugOrProfile : slugOrProfile?.bookingSlug;
  if (!slug) return '';
  return `/book/${slug.toLowerCase().trim()}`;
}
