import { Appointment } from '../models/Appointment.js';

// In-memory sliding abuse tracker (for progressive restriction)
const failedAttemptsMap = new Map(); // identifier -> { count, expiresAt }
const cancellationsMap = new Map();  // identifier -> { count, expiresAt }
const restrictionsMap = new Map();   // identifier -> restrictionExpiresAt

// Clean up expired in-memory tracking entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of failedAttemptsMap.entries()) {
    if (v.expiresAt <= now) failedAttemptsMap.delete(k);
  }
  for (const [k, v] of cancellationsMap.entries()) {
    if (v.expiresAt <= now) cancellationsMap.delete(k);
  }
  for (const [k, expiresAt] of restrictionsMap.entries()) {
    if (expiresAt <= now) restrictionsMap.delete(k);
  }
}, 5 * 60 * 1000);

export const SPAM_CONFIG = {
  MAX_UPCOMING_PER_CUSTOMER: 10,
  MAX_ACTIVE_PER_PROFESSIONAL: 3,
  MAX_BOOKINGS_PER_DAY_PER_PROFESSIONAL: 2, // Max 2 bookings / day / professional for same phone
  MAX_FAILED_ATTEMPTS_BEFORE_RESTRICTION: 5,
  FAILED_ATTEMPTS_WINDOW_MS: 15 * 60 * 1000,
  MAX_CANCELLATIONS_24H: 5,
  CANCELLATION_WINDOW_MS: 24 * 60 * 60 * 1000,
  RESTRICTION_DURATION_MS: 60 * 60 * 1000, // 1 hour
};

/**
 * Record a failed booking attempt (e.g. invalid slot, race collision, bad payload)
 */
export const recordBookingFailure = (identifier) => {
  if (!identifier) return;
  const now = Date.now();
  const current = failedAttemptsMap.get(identifier) || {
    count: 0,
    expiresAt: now + SPAM_CONFIG.FAILED_ATTEMPTS_WINDOW_MS,
  };

  current.count += 1;
  current.expiresAt = now + SPAM_CONFIG.FAILED_ATTEMPTS_WINDOW_MS;
  failedAttemptsMap.set(identifier, current);

  if (current.count >= SPAM_CONFIG.MAX_FAILED_ATTEMPTS_BEFORE_RESTRICTION) {
    restrictionsMap.set(identifier, now + SPAM_CONFIG.RESTRICTION_DURATION_MS);
  }
};

/**
 * Record an appointment cancellation by user
 */
export const recordCancellation = (identifier) => {
  if (!identifier) return;
  const now = Date.now();
  const current = cancellationsMap.get(identifier) || {
    count: 0,
    expiresAt: now + SPAM_CONFIG.CANCELLATION_WINDOW_MS,
  };

  current.count += 1;
  current.expiresAt = now + SPAM_CONFIG.CANCELLATION_WINDOW_MS;
  cancellationsMap.set(identifier, current);

  if (current.count >= SPAM_CONFIG.MAX_CANCELLATIONS_24H) {
    restrictionsMap.set(identifier, now + SPAM_CONFIG.RESTRICTION_DURATION_MS);
  }
};

/**
 * Check spam booking prevention rules & progressive abuse limits
 */
export const checkBookingSpamRules = async ({
  userId,
  customerPhone,
  customerEmail,
  professionalId,
  dateString,
  startTime,
  clientIp,
  website_hp,
  formLoadTime,
}) => {
  const now = Date.now();
  const identifiers = [
    userId ? `user_${userId}` : null,
    customerPhone ? `phone_${customerPhone.trim()}` : null,
    customerEmail ? `email_${customerEmail.trim().toLowerCase()}` : null,
    clientIp ? `ip_${clientIp}` : null,
  ].filter(Boolean);

  // 0. Invisible Honeypot Trap (Automated bots fill all hidden inputs)
  if (website_hp && typeof website_hp === 'string' && website_hp.trim().length > 0) {
    const err = new Error('Invalid request detected. Submission rejected.');
    err.statusCode = 400;
    err.code = 'BOT_SUBMISSION_REJECTED';
    err.isOperational = true;
    throw err;
  }

  // 0b. Time-to-Submit Velocity Heuristic (prevent sub-300ms scripted instant submissions)
  if (formLoadTime && typeof formLoadTime === 'number' && formLoadTime > 0) {
    const elapsedMs = now - formLoadTime;
    if (elapsedMs < 300 && elapsedMs > 0) {
      const err = new Error('Submission was too fast. Please take a moment and submit again.');
      err.statusCode = 429;
      err.code = 'SUBMISSION_TOO_FAST';
      err.isOperational = true;
      throw err;
    }
  }

  // 1. Check temporary abuse restrictions
  for (const id of identifiers) {
    const restrictionExpiry = restrictionsMap.get(id);
    if (restrictionExpiry && restrictionExpiry > now) {
      const remainingMinutes = Math.ceil((restrictionExpiry - now) / 60000);
      const err = new Error(
        `Booking access is temporarily restricted due to repeated abnormal requests. Please try again in ${remainingMinutes} minute(s).`
      );
      err.statusCode = 429;
      err.code = 'BOOKING_TEMPORARILY_RESTRICTED';
      err.isOperational = true;
      throw err;
    }
  }

  // Active status set
  const activeStatuses = ['CONFIRMED', 'PENDING', 'ARRIVED', 'WAITING', 'IN_PROGRESS', 'HELD'];

  // Customer match query (by userId, phone, or email)
  const customerOrConditions = [];
  if (userId) customerOrConditions.push({ userId });
  if (customerPhone) customerOrConditions.push({ customerPhone: customerPhone.trim() });
  if (customerEmail) customerOrConditions.push({ customerEmail: customerEmail.trim().toLowerCase() });

  if (customerOrConditions.length === 0) return true;

  const todayStr = new Date().toISOString().split('T')[0];

  // 2. Duplicate appointment check: Prevent user from booking the exact same time slot
  if (dateString && startTime) {
    const existingSameSlot = await Appointment.findOne({
      $or: customerOrConditions,
      dateString,
      startTime,
      status: { $in: activeStatuses },
    });

    if (existingSameSlot) {
      const err = new Error(
        `You already have an active appointment scheduled on ${dateString} at ${startTime}.`
      );
      err.statusCode = 409;
      err.code = 'DUPLICATE_APPOINTMENT_PREVENTED';
      err.isOperational = true;
      throw err;
    }
  }

  // 3. Max upcoming active appointments per customer
  const totalUpcoming = await Appointment.countDocuments({
    $or: customerOrConditions,
    dateString: { $gte: todayStr },
    status: { $in: activeStatuses },
  });

  if (totalUpcoming >= SPAM_CONFIG.MAX_UPCOMING_PER_CUSTOMER) {
    const err = new Error(
      `You have reached the maximum allowed limit of ${SPAM_CONFIG.MAX_UPCOMING_PER_CUSTOMER} upcoming appointments.`
    );
    err.statusCode = 429;
    err.code = 'MAX_UPCOMING_APPOINTMENTS_EXCEEDED';
    err.isOperational = true;
    throw err;
  }

  // 4. Max active appointments with the specific professional
  if (professionalId) {
    const activeWithPro = await Appointment.countDocuments({
      professionalId,
      $or: customerOrConditions,
      dateString: { $gte: todayStr },
      status: { $in: activeStatuses },
    });

    if (activeWithPro >= SPAM_CONFIG.MAX_ACTIVE_PER_PROFESSIONAL) {
      const err = new Error(
        `You have reached the maximum limit of ${SPAM_CONFIG.MAX_ACTIVE_PER_PROFESSIONAL} active bookings with this professional.`
      );
      err.statusCode = 429;
      err.code = 'MAX_ACTIVE_PER_PROFESSIONAL_EXCEEDED';
      err.isOperational = true;
      throw err;
    }

    // 4b. Same phone number: Maximum 2 bookings / day / professional
    if (dateString) {
      const dailyBookingsWithPro = await Appointment.countDocuments({
        professionalId,
        $or: customerOrConditions,
        dateString,
        status: { $in: activeStatuses },
      });

      if (dailyBookingsWithPro >= SPAM_CONFIG.MAX_BOOKINGS_PER_DAY_PER_PROFESSIONAL) {
        const err = new Error(
          `Maximum allowed limit of ${SPAM_CONFIG.MAX_BOOKINGS_PER_DAY_PER_PROFESSIONAL} bookings per day with this professional has been reached for this phone number.`
        );
        err.statusCode = 429;
        err.code = 'MAX_DAILY_BOOKINGS_PER_PROFESSIONAL_EXCEEDED';
        err.isOperational = true;
        throw err;
      }
    }
  }

  return true;
};
