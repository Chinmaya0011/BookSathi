import rateLimit from 'express-rate-limit';

// Standard general API rate limiter (15 minutes, 300 requests)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

// Strict limiter for Auth & Registration endpoints (15 minutes, 20 requests)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Too many login/registration attempts from this network. Please try again after 15 minutes.',
  },
});

// OTP / Verification requests (Isolated per email/phone, 15 minutes, 10 requests per user)
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = (req.body?.email || req.query?.email || '').trim().toLowerCase();
    const phone = (req.body?.customerPhone || req.body?.phone || '').replace(/\D/g, '');
    if (email) return `otp_email_${email}`;
    if (phone) return `otp_phone_${phone}`;
    return req.ip || req.headers['x-forwarded-for'] || 'unknown_ip';
  },
  message: {
    success: false,
    code: 'OTP_RATE_LIMIT_EXCEEDED',
    message: 'Too many OTP or verification requests for this account. Please wait a few minutes before requesting again.',
  },
});

// Public Search & Professional Directory Browsing (1 minute, 60 requests)
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'SEARCH_RATE_LIMIT_EXCEEDED',
    message: 'Too many search requests. Please slow down.',
  },
});

// Slot Availability Querying (1 minute, 60 requests)
export const slotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'SLOT_QUERY_RATE_LIMIT_EXCEEDED',
    message: 'Too many slot availability queries. Please wait a moment before refreshing.',
  },
});

// Appointment Creation & Slot Hold (1 hour, max 10 attempts per IP)
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
  message: {
    success: false,
    code: 'BOOKING_RATE_LIMIT_EXCEEDED',
    message: 'Too many appointment booking attempts (maximum 10 per hour from this IP). Please try again after an hour.',
  },
});

// Appointment Actions (Reschedule, Cancel, Status Change - 10 minutes, 15 requests)
export const appointmentActionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?._id ? `user_${req.user._id}` : req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
  message: {
    success: false,
    code: 'ACTION_RATE_LIMIT_EXCEEDED',
    message: 'Too many appointment modification requests. Please wait a few minutes.',
  },
});
