import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { sendBookingOtpEmail } from './emailService.js';

// In-memory state for active OTPs and rate limits
const otpStore = new Map();
// Structure: appointmentCode -> { otp, expiresAt, attempts, phone, createdAt }

const emailOtpStore = new Map();
// Structure: cleanEmail -> { otp, expiresAt, attempts, createdAt }

const cancelAttemptsStore = new Map();
// Structure: phoneKey -> [timestamps of cancel attempts]

const JWT_SECRET =
  process.env.JWT_SECRET || 'booksaathi_jwt_super_secret_key_2026_indian_professionals';

export const otpService = {
  /**
   * Send a 6-digit OTP to customerPhone for an appointment
   */
  async sendBookingOtp({ appointmentCode, customerPhone }) {
    const cleanPhone = (customerPhone || '').replace(/[^0-9]/g, '').slice(-10);
    const now = Date.now();
    const existing = otpStore.get(appointmentCode);

    if (existing && existing.createdAt && now - existing.createdAt < 20000) {
      const err = new Error('Please wait 20 seconds before requesting another OTP.');
      err.statusCode = 429;
      err.isOperational = true;
      throw err;
    }

    // Generate 6-digit OTP
    const otp =
      process.env.NODE_ENV === 'test' && process.env.TEST_FIXED_OTP
        ? process.env.TEST_FIXED_OTP
        : String(Math.floor(100000 + Math.random() * 900000));

    const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

    otpStore.set(appointmentCode, {
      otp,
      expiresAt,
      attempts: 0,
      phone: cleanPhone,
      createdAt: now,
    });

    const maskedPhone =
      cleanPhone.length >= 4
        ? `+91 ******${cleanPhone.slice(-4)}`
        : `+91 ${cleanPhone}`;

    console.log(`\n================== [OTP DISPATCHED] ==================`);
    console.log(`Appointment: ${appointmentCode}`);
    console.log(`Customer Phone: ${maskedPhone}`);
    console.log(`6-Digit OTP: ${otp}`);
    console.log(`======================================================\n`);

    return {
      success: true,
      message: `Verification code sent to ${maskedPhone}`,
      maskedPhone,
      expiresInSeconds: 300,
      ...(process.env.NODE_ENV === 'test' ? { testOtp: otp } : {}),
    };
  },

  /**
   * Verify the 6-digit OTP and generate a short-lived manageSessionToken (15m validity)
   */
  async verifyBookingOtp({ appointmentCode, otp }) {
    const entry = otpStore.get(appointmentCode);
    if (!entry) {
      const err = new Error('No active verification code found. Please request a new OTP.');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(appointmentCode);
      const err = new Error('Verification code has expired. Please request a new OTP.');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    if (entry.attempts >= 5) {
      otpStore.delete(appointmentCode);
      const err = new Error('Maximum 5 failed attempts reached. This OTP is now locked. Please request a new OTP.');
      err.statusCode = 429;
      err.code = 'MAX_OTP_ATTEMPTS_EXCEEDED';
      err.isOperational = true;
      throw err;
    }

    if (entry.otp !== String(otp).trim()) {
      entry.attempts += 1;
      const remaining = 5 - entry.attempts;
      if (remaining <= 0) {
        otpStore.delete(appointmentCode);
        const err = new Error('Maximum 5 failed attempts reached. This OTP is now locked. Please request a new OTP.');
        err.statusCode = 429;
        err.code = 'MAX_OTP_ATTEMPTS_EXCEEDED';
        err.isOperational = true;
        throw err;
      }
      const err = new Error(`Invalid verification code. ${remaining} attempt(s) remaining.`);
      err.statusCode = 401;
      err.isOperational = true;
      throw err;
    }

    // OTP verified successfully! Clear OTP
    otpStore.delete(appointmentCode);

    const manageSessionToken = jwt.sign(
      {
        appointmentCode,
        phone: entry.phone,
        type: 'MANAGE_SESSION',
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return {
      success: true,
      manageSessionToken,
      expiresInMinutes: 15,
    };
  },

  /**
   * Validate a manageSessionToken
   */
  verifyManageSessionToken(token, expectedAppointmentCode) {
    if (!token) return false;
    try {
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      const decoded = jwt.verify(cleanToken, JWT_SECRET);
      return (
        decoded.type === 'MANAGE_SESSION' &&
        decoded.appointmentCode === expectedAppointmentCode
      );
    } catch {
      return false;
    }
  },

  /**
   * Rate limiting: max 5 cancel attempts per 24 hours per phone number
   */
  checkCancelRateLimit(phone) {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    if (!cleanPhone) return true;

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    let attempts = cancelAttemptsStore.get(cleanPhone) || [];
    attempts = attempts.filter((ts) => ts > oneDayAgo);
    cancelAttemptsStore.set(cleanPhone, attempts);

    if (attempts.length >= 5) {
      const err = new Error(
        'Maximum cancellation attempts (5 per 24 hours) exceeded for this phone number.'
      );
      err.statusCode = 429;
      err.isOperational = true;
      throw err;
    }

    return true;
  },

  /**
   * Record a cancel attempt
   */
  recordCancelAttempt(phone) {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    if (!cleanPhone) return;

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    let attempts = cancelAttemptsStore.get(cleanPhone) || [];
    attempts = attempts.filter((ts) => ts > oneDayAgo);
    attempts.push(now);
    cancelAttemptsStore.set(cleanPhone, attempts);
  },

  /**
   * Send 6-digit OTP to customerEmail before completing booking
   */
  async sendBookingEmailOtp({ email, customerName, practitionerName }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      const err = new Error('A valid email address is required to receive verification code.');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    const now = Date.now();
    const existing = emailOtpStore.get(cleanEmail);

    if (existing && existing.createdAt && now - existing.createdAt < 20000) {
      const err = new Error('Please wait 20 seconds before requesting another verification code.');
      err.statusCode = 429;
      err.isOperational = true;
      throw err;
    }

    // Generate 6-digit OTP
    const otp =
      process.env.NODE_ENV === 'test' && process.env.TEST_FIXED_OTP
        ? process.env.TEST_FIXED_OTP
        : String(Math.floor(100000 + Math.random() * 900000));

    const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

    emailOtpStore.set(cleanEmail, {
      otp,
      expiresAt,
      attempts: 0,
      createdAt: now,
    });

    console.log(`\n================== [BOOKING EMAIL OTP DISPATCHED] ==================`);
    console.log(`To Email: ${cleanEmail}`);
    console.log(`Customer: ${customerName || 'Guest Patient'}`);
    console.log(`Practitioner: ${practitionerName || 'Practitioner'}`);
    console.log(`6-Digit OTP: ${otp}`);
    console.log(`====================================================================\n`);

    // Send email via Nodemailer
    const emailSent = await sendBookingOtpEmail({
      to: cleanEmail,
      customerName,
      otp,
      practitionerName,
    });

    return {
      success: true,
      message: emailSent
        ? `Verification code sent to ${cleanEmail}`
        : `Verification code generated for ${cleanEmail}`,
      emailDelivered: emailSent,
      expiresInSeconds: 300,
      ...(process.env.NODE_ENV === 'test' ? { testOtp: otp } : {}),
    };
  },

  /**
   * Verify the 6-digit email OTP
   */
  async verifyBookingEmailOtp({ email, otp }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const entry = emailOtpStore.get(cleanEmail);

    if (!entry) {
      const err = new Error('No active verification code found for this email. Please click Send OTP.');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    if (Date.now() > entry.expiresAt) {
      emailOtpStore.delete(cleanEmail);
      const err = new Error('Verification code has expired. Please request a new code.');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    if (entry.attempts >= 5) {
      emailOtpStore.delete(cleanEmail);
      const err = new Error('Maximum 5 failed attempts reached. This OTP is now locked. Please request a new verification code.');
      err.statusCode = 429;
      err.code = 'MAX_OTP_ATTEMPTS_EXCEEDED';
      err.isOperational = true;
      throw err;
    }

    if (entry.otp !== String(otp).trim()) {
      entry.attempts += 1;
      const remaining = 5 - entry.attempts;
      if (remaining <= 0) {
        emailOtpStore.delete(cleanEmail);
        const err = new Error('Maximum 5 failed attempts reached. This OTP is now locked. Please request a new verification code.');
        err.statusCode = 429;
        err.code = 'MAX_OTP_ATTEMPTS_EXCEEDED';
        err.isOperational = true;
        throw err;
      }
      const err = new Error(`Invalid verification code. ${remaining} attempt(s) remaining.`);
      err.statusCode = 401;
      err.isOperational = true;
      throw err;
    }

    // Verified successfully! Remove used OTP
    emailOtpStore.delete(cleanEmail);

    // Create a 15-minute booking verified token
    const otpVerificationToken = jwt.sign(
      {
        email: cleanEmail,
        type: 'EMAIL_BOOKING_VERIFIED',
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return {
      success: true,
      message: 'Email verified successfully',
      otpVerificationToken,
    };
  },

  /**
   * Clear test stores
   */
  _clearForTests() {
    otpStore.clear();
    emailOtpStore.clear();
    cancelAttemptsStore.clear();
  },
};
