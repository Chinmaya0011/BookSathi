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

// OTP / Password reset requests (15 minutes, 5 requests per IP/user)
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'OTP_RATE_LIMIT_EXCEEDED',
    message: 'Too many OTP or verification requests. Please wait 15 minutes before requesting again.',
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

// Appointment Creation & Slot Hold (15 minutes, 15 attempts per IP / User)
export const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Key by authenticated user ID if present, otherwise client IP
    return req.user?._id ? `user_${req.user._id}` : req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
  message: {
    success: false,
    code: 'BOOKING_RATE_LIMIT_EXCEEDED',
    message: 'Too many appointment booking attempts. Please wait 15 minutes before creating another booking.',
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
