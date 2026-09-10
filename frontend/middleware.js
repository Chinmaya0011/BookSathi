import { NextResponse } from 'next/server';
import { isReservedSlug } from './lib/reservedSlugs';

export function middleware(req) {
  const url = req.nextUrl;
  const host = req.headers.get('host') || '';

  // Extract hostname without port
  const hostname = host.split(':')[0].toLowerCase();
  const port = host.includes(':') ? `:${host.split(':')[1]}` : '';

  // Configured Base App Domain
  const configuredAppDomain = (process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost').toLowerCase().replace(/^https?:\/\//, '').split(':')[0];

  let subdomain = null;

  // 1. Detect development subdomain on localhost (e.g. dr-rajesh.localhost)
  if (hostname.endsWith('.localhost')) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      subdomain = parts[0];
    }
  } 
  // 2. Detect production / custom domain subdomain (e.g. dr-rajesh.booksaathi.in)
  else if (hostname.includes('.') && configuredAppDomain && hostname.endsWith(configuredAppDomain)) {
    const prefix = hostname.slice(0, -(configuredAppDomain.length + 1));
    if (prefix && !prefix.includes('.')) {
      subdomain = prefix;
    }
  }

  // Handle Subdomain Requests
  if (subdomain && !isReservedSlug(subdomain)) {
    // 1. If accessing an App route (dashboard, auth, admin, etc.) on a professional's subdomain,
    // redirect to the main apex domain so authentication and dashboard are unified
    const isAppRoute =
      url.pathname.startsWith('/dashboard') ||
      url.pathname.startsWith('/login') ||
      url.pathname.startsWith('/register') ||
      url.pathname.startsWith('/admin') ||
      url.pathname.startsWith('/onboarding') ||
      url.pathname.startsWith('/forgot-password') ||
      url.pathname.startsWith('/support');

    if (isAppRoute) {
      const protocol =
        req.headers.get('x-forwarded-proto') ||
        (hostname.endsWith('.localhost') || hostname === 'localhost' || hostname === '127.0.0.1' ? 'http' : 'https');
      const apexHost = hostname.endsWith('.localhost')
        ? `localhost${port}`
        : `${configuredAppDomain || 'booksaathi.in'}${port}`;
      const search = url.search || '';
      return NextResponse.redirect(new URL(`${protocol}://${apexHost}${url.pathname}${search}`));
    }

    // Pass through static assets and Next.js internals
    if (
      url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/favicon.ico') ||
      url.pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // Rewrite root route on subdomain to /book/:subdomain
    if (url.pathname === '/' || url.pathname === '') {
      return NextResponse.rewrite(new URL(`/book/${subdomain}`, req.url));
    }

    // If client visits /book/:subdomain directly on their subdomain, redirect cleanly to root
    if (url.pathname === `/book/${subdomain}` || url.pathname === `/book/${subdomain}/`) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // 3. For apex domain /book/:slug
  // In development, keep /book/:slug on localhost to preserve shared localStorage session.
  // In production (with live custom domain), redirect to subdomain if configured.
  if (!subdomain && url.pathname.startsWith('/book/')) {
    const pathSlug = url.pathname.replace(/^\/book\//, '').split('/')[0]?.trim().toLowerCase();
    
    if (pathSlug && !isReservedSlug(pathSlug)) {
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
      // In local dev, allow /book/:slug directly on localhost:3000 so authentication session is preserved
      if (isLocal) {
        return NextResponse.next();
      }

      // In production with custom domain configured
      if (configuredAppDomain && !configuredAppDomain.includes('localhost')) {
        const protocol = req.headers.get('x-forwarded-proto') || 'https';
        const targetHost = `${pathSlug}.${configuredAppDomain}${port}`;
        return NextResponse.redirect(`${protocol}://${targetHost}/`, 308);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
