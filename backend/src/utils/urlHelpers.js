/**
 * Generates canonical subdomain-based public booking URL for a professional
 * Development: http://<slug>.localhost:3000
 * Production:  https://<slug>.<APP_DOMAIN>
 * 
 * @param {string|object} slugOrProfile
 * @returns {string}
 */
export const getProfessionalPublicUrl = (slugOrProfile) => {
  const slug = typeof slugOrProfile === 'string' ? slugOrProfile : slugOrProfile?.bookingSlug;
  if (!slug) return '';

  const rawDomain = (
    process.env.APP_DOMAIN ||
    process.env.CLIENT_URL?.replace(/^https?:\/\//, '') ||
    'localhost:3000'
  ).trim();

  // Strip protocol if included
  const cleanDomain = rawDomain.replace(/^https?:\/\//, '');

  if (cleanDomain.startsWith('localhost') || cleanDomain.startsWith('127.0.0.1')) {
    const port = cleanDomain.includes(':') ? `:${cleanDomain.split(':')[1]}` : ':3000';
    return `http://${slug}.localhost${port}`;
  }

  // Production domain
  return `https://${slug}.${cleanDomain}`;
};
