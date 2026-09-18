/**
 * User-Agent and Client IP parsing utilities for BookSaathi audit logging.
 */

/**
 * Extract client IP address taking into account trusted proxies and load balancers.
 * @param {import('express').Request} req
 * @returns {string}
 */
export const getClientIp = (req) => {
  if (!req) return '127.0.0.1';

  const forwarded = req.headers?.['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return normalizeIp(firstIp);
  }

  const realIp = req.headers?.['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    return normalizeIp(realIp.trim());
  }

  if (req.ip) {
    return normalizeIp(req.ip);
  }

  if (req.socket?.remoteAddress) {
    return normalizeIp(req.socket.remoteAddress);
  }

  return '127.0.0.1';
};

/**
 * Normalize IPv6 localhost and mapped IPv4 formats
 */
export const normalizeIp = (ip) => {
  if (!ip) return '127.0.0.1';
  let cleaned = ip.trim();
  if (cleaned === '::1' || cleaned === '::ffff:127.0.0.1') return '127.0.0.1';
  if (cleaned.startsWith('::ffff:')) return cleaned.replace('::ffff:', '');
  return cleaned;
};

/**
 * Mask IP address for non-sensitive public display (e.g. 192.168.1.100 -> 192.168.***.***)
 * @param {string} ip
 * @returns {string}
 */
export const maskIpAddress = (ip) => {
  if (!ip) return '***.***.***.***';
  const norm = normalizeIp(ip);
  if (norm.includes('.')) {
    const parts = norm.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.***`;
    }
  }
  if (norm.includes(':')) {
    const parts = norm.split(':');
    return `${parts[0]}:${parts[1]}:****:****`;
  }
  return norm;
};

/**
 * Parse User-Agent string into device type, browser, and operating system
 * @param {string} userAgent
 * @returns {{ deviceType: 'desktop'|'mobile'|'tablet'|'bot'|'unknown', browser: string, operatingSystem: string }}
 */
export const parseUserAgent = (userAgent = '') => {
  if (!userAgent || typeof userAgent !== 'string') {
    return {
      deviceType: 'desktop',
      browser: 'Browser',
      operatingSystem: 'Unknown OS',
    };
  }

  const ua = userAgent.toLowerCase();

  // 1. Device Type Detection
  let deviceType = 'desktop';
  if (/ipad|tablet|playbook|silk/i.test(userAgent) || (ua.includes('android') && !ua.includes('mobile'))) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/bot|crawler|spider|crawling|googlebot|bingbot|slurp/i.test(userAgent)) {
    deviceType = 'bot';
  }

  // 2. Operating System Detection
  let operatingSystem = 'Unknown OS';
  if (ua.includes('windows nt 10.0') || ua.includes('windows nt 11.0')) {
    operatingSystem = 'Windows 10/11';
  } else if (ua.includes('windows nt 6.3')) {
    operatingSystem = 'Windows 8.1';
  } else if (ua.includes('windows nt 6.1')) {
    operatingSystem = 'Windows 7';
  } else if (ua.includes('windows')) {
    operatingSystem = 'Windows';
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    operatingSystem = 'iOS';
  } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
    operatingSystem = 'macOS';
  } else if (ua.includes('android')) {
    operatingSystem = 'Android';
  } else if (ua.includes('linux')) {
    operatingSystem = 'Linux';
  } else if (ua.includes('cros')) {
    operatingSystem = 'ChromeOS';
  }

  // 3. Browser Detection (ordered from specific to general)
  let browser = 'Unknown Browser';
  if (ua.includes('edg/') || ua.includes('edge/')) {
    browser = 'Edge';
  } else if (ua.includes('opr/') || ua.includes('opera/')) {
    browser = 'Opera';
  } else if (ua.includes('chrome/') && !ua.includes('chromium')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox/')) {
    browser = 'Firefox';
  } else if (ua.includes('safari/') && !ua.includes('chrome/')) {
    browser = 'Safari';
  } else if (ua.includes('msie') || ua.includes('trident/')) {
    browser = 'Internet Explorer';
  } else if (ua.includes('postmanruntime')) {
    browser = 'Postman';
  } else if (ua.includes('curl/')) {
    browser = 'cURL';
  } else if (ua.includes('axios') || ua.includes('node-fetch')) {
    browser = 'API Client';
  }

  return {
    deviceType,
    browser,
    operatingSystem,
  };
};
