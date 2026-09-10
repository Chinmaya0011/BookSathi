/**
 * Generates canonical subdomain-based public booking URL for a professional
 * Development: http://<slug>.localhost:3000
 * Production:  https://<slug>.<NEXT_PUBLIC_APP_DOMAIN>
 * 
 * @param {string|object} slugOrProfile
 * @returns {string}
 */
export function getProfessionalPublicUrl(slugOrProfile) {
  const slug = typeof slugOrProfile === 'string' ? slugOrProfile : slugOrProfile?.bookingSlug;
  if (!slug) return '';

  // In browser environment
  if (typeof window !== 'undefined') {
    const currentHost = window.location.host; // e.g. "localhost:3000", "dr-rajesh.localhost:3000", or "booksaathi.in"
    const currentProtocol = window.location.protocol; // "http:" or "https:"

    // Localhost or loopback: use apex /book/:slug so cookies and localStorage are shared
    if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
      const port = currentHost.includes(':') ? `:${currentHost.split(':')[1]}` : ':3000';
      return `${currentProtocol}//localhost${port}/book/${slug}`;
    }

    // Production / Custom Domain
    const envDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;
    if (envDomain && !envDomain.includes('localhost')) {
      const cleanEnv = envDomain.replace(/^https?:\/\//, '');
      return `https://${slug}.${cleanEnv}`;
    }

    // Fallback based on apex domain
    const hostParts = currentHost.split(':')[0].split('.');
    const baseDomain = hostParts.length > 2 ? hostParts.slice(-2).join('.') : currentHost.split(':')[0];
    const port = currentHost.includes(':') ? `:${currentHost.split(':')[1]}` : '';
    return `${currentProtocol}//${slug}.${baseDomain}${port}`;
  }

  // Server-side execution
  const appDomain = (process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000').replace(/^https?:\/\//, '');
  if (appDomain.includes('localhost') || appDomain.includes('127.0.0.1')) {
    const port = appDomain.includes(':') ? `:${appDomain.split(':')[1]}` : ':3000';
    return `http://localhost${port}/book/${slug}`;
  }

  return `https://${slug}.${appDomain}`;
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
