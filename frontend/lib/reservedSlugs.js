/**
 * Reserved system subdomains and paths that cannot be claimed by individual professionals
 */
export const RESERVED_SLUGS = new Set([
  'www',
  'app',
  'admin',
  'api',
  'auth',
  'login',
  'register',
  'dashboard',
  'support',
  'help',
  'blog',
  'mail',
  'status',
  'test',
  'dev',
  'staging',
  'root',
  'localhost',
  'terms',
  'privacy',
  'sitemap',
  'pricing',
  'features',
  'book',
  'booking',
  'settings',
  'payments',
  'account',
  'static',
  'assets',
  'public',
  'health',
  'webhook',
]);

/**
 * Check if a given slug is reserved by the system
 * @param {string} slug 
 * @returns {boolean}
 */
export const isReservedSlug = (slug) => {
  if (!slug) return true;
  const clean = slug.toString().toLowerCase().trim();
  return RESERVED_SLUGS.has(clean);
};
