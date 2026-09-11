import crypto from 'crypto';
import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { AppointmentType } from '../models/AppointmentType.js';
import { BlockedDate } from '../models/BlockedDate.js';
import { Availability } from '../models/Availability.js';
import { User } from '../models/User.js';
import {
  emitAppointmentCreated,
  emitAppointmentCancelled,
  emitAppointmentRescheduleRequested,
} from '../socket/socketEmitter.js';
import { getAvailableSlots } from './slotGeneratorService.js';
import { sendBookingNotifications } from './emailService.js';
import { otpService } from './otpService.js';
import {
  checkBookingSpamRules,
  recordBookingFailure,
  recordCancellation,
} from './abuseProtectionService.js';
import {
  generateAppointmentCode,
  timeToMinutes,
  minutesToTime,
  getDateString,
  getCurrentTimeString,
  evaluateArrivalStatus,
  doIntervalsOverlap,
  createUtcDateFromLocal,
  fromIst,
  toIstParts,
  nowIst,
  APP_TZ,
} from '../utils/dateHelpers.js';

export const ACTIVE_LOCK_STATUSES = [
  'HOLD',
  'HELD',
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'BOOKED',
];

/**
 * Generate cryptographically secure raw cancel token (32 bytes / 64 hex chars) and its sha256 hash
 */
export const generateCancelToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, tokenHash };
};

/**
 * Hash raw cancel token with SHA-256
 */
export const hashCancelToken = (rawToken) => {
  if (!rawToken) return null;
  return crypto.createHash('sha256').update(String(rawToken).trim()).digest('hex');
};

/**
 * Sweeper to automatically transition expired HOLDs to EXPIRED
 */
export const sweepExpiredHolds = async () => {
  const now = new Date();
  const res = await Appointment.updateMany(
    {
      status: { $in: ['HOLD', 'HELD'] },
      holdExpiresAt: { $lte: now, $ne: null },
    },
    {
      $set: {
        status: 'EXPIRED',
        holdExpiresAt: null,
      },
    }
  );
  return res.modifiedCount || 0;
};

/**
 * Re-run slot legality within transaction (blocked dates, weekly availability, notice, advance)
 */
export const validateSlotLegality = async ({
  profile,
  dateString,
  startMinutes,
  endMinutes,
  session = null,
  isPublic = true,
}) => {
  const istNow = nowIst();
  const todayString = istNow.dateString;

  const [year, month, day] = dateString.split('-').map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = targetDate.getUTCDay();

  const maxDays = profile.bookingSettings?.maxAdvanceDays || 60;
  const minNoticeMinutes = profile.bookingSettings?.minNoticeMinutes ?? 0;
  const allowSameDay = profile.bookingSettings?.allowSameDayBooking !== false;

  const slotStartAt = fromIst(dateString, startMinutes);
  const nowMs = Date.now();
  const minNoticeMs = minNoticeMinutes * 60 * 1000;

  if (isPublic) {
    if (dateString < todayString) {
      const err = new Error('Past dates are not available for booking.');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    if (dateString === todayString && !allowSameDay) {
      const err = new Error('Same-day appointments are not accepted by this professional.');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    const todayDate = new Date(todayString + 'T00:00:00Z');
    const diffDays = Math.floor((targetDate - todayDate) / (1000 * 60 * 60 * 24));
    if (diffDays > maxDays) {
      const err = new Error(`Bookings are only open up to ${maxDays} days in advance.`);
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    // Exact UTC comparison for minimum notice and past slot check
    if (slotStartAt.getTime() < nowMs + minNoticeMs) {
      const err = new Error('This time slot is in the past or does not meet minimum notice requirement.');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }
  }

  // 1. Blocked Dates Check
  let blockedQuery = BlockedDate.find({ professionalId: profile._id, date: dateString });
  if (session) blockedQuery = blockedQuery.session(session);
  const blockedDates = await blockedQuery;

  const fullDayBlocked = blockedDates.find((b) => b.allDay);
  if (fullDayBlocked) {
    const err = new Error(fullDayBlocked.reason || 'Professional is unavailable on this date.');
    err.statusCode = 409;
    err.code = 'DATE_BLOCKED';
    err.isOperational = true;
    throw err;
  }

  const partialBlocked = blockedDates.find((b) => {
    if (b.allDay || !b.startTime || !b.endTime) return false;
    const bStart = timeToMinutes(b.startTime);
    const bEnd = timeToMinutes(b.endTime);
    return doIntervalsOverlap(startMinutes, endMinutes, bStart, bEnd);
  });

  if (partialBlocked) {
    const err = new Error(partialBlocked.reason || 'This time slot is blocked on the professional calendar.');
    err.statusCode = 409;
    err.code = 'SLOT_BLOCKED';
    err.isOperational = true;
    throw err;
  }

  // 2. Weekly Availability Check
  let availQuery = Availability.findOne({ professionalId: profile._id, dayOfWeek });
  if (session) availQuery = availQuery.session(session);
  let dayAvailability = await availQuery;

  let totalAvailQuery = Availability.countDocuments({ professionalId: profile._id });
  if (session) totalAvailQuery = totalAvailQuery.session(session);
  const totalAvailabilityDocs = await totalAvailQuery;

  if (totalAvailabilityDocs === 0 && !dayAvailability) {
    if (dayOfWeek !== 0) {
      dayAvailability = {
        enabled: true,
        timeRanges: [{ startTime: '09:00', endTime: '17:00' }],
      };
    }
  }

  if (isPublic) {
    if (!dayAvailability || !dayAvailability.enabled || !dayAvailability.timeRanges?.length) {
      const err = new Error('Professional is closed on this day.');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    const fitsWorkingRange = dayAvailability.timeRanges.some((range) => {
      const rStart = timeToMinutes(range.startTime);
      const rEnd = timeToMinutes(range.endTime);
      return startMinutes >= rStart && endMinutes <= rEnd;
    });

    if (!fitsWorkingRange) {
      const err = new Error('The requested time slot falls outside professional working hours.');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }
  }

  return true;
};

/**
 * Reusable Atomic Booking Lock Function running inside a MongoDB transaction
 * Prevents any overlapping slot collisions (e.g. 09:00-09:30 vs 09:15-09:45)
 */
export const reserveSlotAtomically = async ({
  professionalId,
  dateString,
  startTime,
  endTime,
  duration: customDuration,
  buffer = 0,
  payload = {},
  session: externalSession = null,
  isPublic = true,
  targetStatus = 'HOLD',
  holdDurationMinutes = 3,
}) => {
  const executeInSession = async (sess) => {
    // a. Re-validate professional is ACTIVE + PUBLIC
    let profileQuery = ProfessionalProfile.findById(professionalId);
    if (sess) profileQuery = profileQuery.session(sess);
    const profile = await profileQuery;

    if (!profile) {
      const err = new Error('Professional not found.');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    if (isPublic && profile.isPublic === false) {
      const err = new Error('Professional profile is not active.');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    // Parse integer minutes bounds
    const startMinutes = timeToMinutes(startTime);
    const duration =
      customDuration ||
      (endTime ? timeToMinutes(endTime) - startMinutes : (profile.bookingSettings?.appointmentDuration || 30));
    const calculatedEndMinutes = startMinutes + duration;
    const endMinutes = endTime ? timeToMinutes(endTime) : calculatedEndMinutes;
    const formattedEndTime = minutesToTime(endMinutes);

    if (startMinutes < 0 || startMinutes >= 1440 || endMinutes <= startMinutes || endMinutes > 1440) {
      const err = new Error('Invalid slot timing bounds.');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    // b. Re-run slot legality (blocked date, availability, minNotice, maxAdvance, same-day prune)
    await validateSlotLegality({
      profile,
      dateString,
      startMinutes,
      endMinutes,
      session: sess,
      isPublic,
    });

    // c. Query Overlap using Active Lock Statuses:
    // startMinutes < requestedEndMinutes && endMinutes > requestedStartMinutes
    const now = new Date();
    const overlapQuery = {
      professionalId: profile._id,
      dateString,
      $or: [
        { status: { $in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'BOOKED', 'DONE'] } },
        { status: { $in: ['HOLD', 'HELD'] }, holdExpiresAt: { $gt: now } },
      ],
      startMinutes: { $lt: endMinutes },
      endMinutes: { $gt: startMinutes },
    };

    let findOverlap = Appointment.findOne(overlapQuery);
    if (sess) findOverlap = findOverlap.session(sess);
    const overlap = await findOverlap;

    // d. If overlap exists, abort with 409: "This time slot is no longer available."
    if (overlap) {
      const err = new Error('This time slot is no longer available.');
      err.statusCode = 409;
      err.code = 'SLOT_ALREADY_BOOKED';
      err.isOperational = true;
      throw err;
    }

    // Clean up any expired holds within this slot window
    let deleteExpired = Appointment.deleteMany({
      professionalId: profile._id,
      dateString,
      status: { $in: ['HOLD', 'HELD'] },
      holdExpiresAt: { $lte: now, $ne: null },
      startMinutes: { $lt: endMinutes },
      endMinutes: { $gt: startMinutes },
    });
    if (sess) deleteExpired = deleteExpired.session(sess);
    await deleteExpired;

    // e. Prepare UTC dates, hold token, cancel token, and insert
    const appointmentCode = payload.appointmentCode || generateAppointmentCode();
    const [year, month, day] = dateString.split('-').map(Number);
    const appointmentDate = new Date(Date.UTC(year, month - 1, day));
    const startAt = fromIst(dateString, startMinutes);
    const endAt = fromIst(dateString, endMinutes);

    let holdExpiresAt = null;
    let holdToken = payload.holdToken || null;
    if (targetStatus === 'HOLD' || targetStatus === 'HELD') {
      holdExpiresAt = new Date(Date.now() + (holdDurationMinutes || 3) * 60 * 1000);
      if (!holdToken) {
        holdToken = crypto.randomBytes(16).toString('hex');
      }
    }

    // Generate Cancel Token
    const { rawToken: rawCancelToken, tokenHash: cancelTokenHash } = generateCancelToken();

    const appointmentData = {
      appointmentCode,
      professionalId: profile._id,
      appointmentTypeId: payload.appointmentTypeId || undefined,
      appointmentTypeName: payload.appointmentTypeName || 'General Consultation',
      customerName: (payload.customerName || 'Customer').trim(),
      customerPhone: (payload.customerPhone || '0000000000').trim(),
      customerEmail: (payload.customerEmail || '').trim().toLowerCase(),
      userId: payload.userId || undefined,
      reason: (payload.reason || '').trim(),
      appointmentDate,
      dateString,
      startTime,
      endTime: formattedEndTime,
      startMinutes,
      endMinutes,
      startAt,
      endAt,
      duration,
      buffer: buffer ?? (profile.bookingSettings?.bufferTime ?? 0),
      fee: payload.fee !== undefined ? payload.fee : (profile.consultationFee || 500),
      currency: profile.currency || 'INR',
      timezone: profile.timezone || 'Asia/Kolkata',
      bookingSource: payload.bookingSource || 'ONLINE',
      consultationType: payload.consultationType || 'IN_PERSON',
      status: targetStatus,
      holdExpiresAt,
      holdToken,
      cancelTokenHash,
      paymentStatus:
        payload.paymentStatus ||
        (targetStatus === 'HOLD' ? 'PENDING' : payload.fee === 0 ? 'NOT_REQUIRED' : 'PENDING'),
      paymentMode: payload.paymentMode || (payload.fee === 0 ? 'FREE' : 'ONLINE'),
      idempotencyKey: payload.idempotencyKey ? String(payload.idempotencyKey) : undefined,
      notes: payload.notes || '',
      confirmedAt: targetStatus === 'CONFIRMED' || targetStatus === 'BOOKED' ? new Date() : null,
    };

    const [createdAppt] = await Appointment.create([appointmentData], sess ? { session: sess } : {});
    const manageUrl = `/book/manage?code=${createdAppt.appointmentCode}&token=${rawCancelToken}`;

    return {
      appointment: createdAppt,
      profile,
      cancelToken: rawCancelToken,
      manageUrl,
    };
  };

  if (externalSession) {
    return await executeInSession(externalSession);
  }

  // Orchestrate Session & Transaction
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await executeInSession(session);
    });
    return result;
  } catch (err) {
    if (err.code === 11000) {
      const conflictErr = new Error('This time slot is no longer available.');
      conflictErr.statusCode = 409;
      conflictErr.code = 'SLOT_ALREADY_BOOKED';
      conflictErr.isOperational = true;
      throw conflictErr;
    }
    throw err;
  } finally {
    await session.endSession();
  }
};

/**
 * Temporary Slot Hold (reserves slot for 3 minutes during checkout)
 */
export const holdPublicSlot = async (slug, holdData) => {
  const safeSlug = (slug || '').trim().toLowerCase();
  const profile = await ProfessionalProfile.findOne({
    bookingSlug: safeSlug,
    isPublic: { $ne: false },
  });
  if (!profile) {
    const err = new Error('Professional not found or profile is not active.');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  const { date, time, startTime, appointmentTypeId } = holdData;
  const selectedSlotTime = (time || startTime || '').trim();

  let duration = profile.bookingSettings?.appointmentDuration || 30;
  let buffer = profile.bookingSettings?.bufferTime ?? 10;
  let fee = profile.consultationFee || 500;
  let appointmentTypeName = 'General Consultation';
  let resolvedTypeId = null;

  if (appointmentTypeId) {
    const apptType = await AppointmentType.findOne({
      _id: appointmentTypeId,
      professionalId: profile._id,
      enabled: true,
    });
    if (apptType) {
      duration = apptType.duration;
      if (apptType.bufferTime !== null && apptType.bufferTime !== undefined) {
        buffer = apptType.bufferTime;
      }
      fee = apptType.fee;
      appointmentTypeName = apptType.name;
      resolvedTypeId = apptType._id;
    }
  }

  // Anti-spam rules check
  await checkBookingSpamRules({
    professionalId: profile._id,
    dateString: date,
    startTime: selectedSlotTime,
    clientIp: holdData.clientIp,
  });

  const holdDurationMinutes = profile.bookingSettings?.holdDurationMinutes || 3;

  try {
    const { appointment } = await reserveSlotAtomically({
      professionalId: profile._id,
      dateString: date,
      startTime: selectedSlotTime,
      duration,
      buffer,
      targetStatus: 'HOLD',
      holdDurationMinutes,
      payload: {
        appointmentTypeId: resolvedTypeId,
        appointmentTypeName,
        customerName: 'Holding Customer',
        customerPhone: '0000000000',
        fee,
      },
    });

    return {
      holdToken: appointment.holdToken,
      holdExpiresAt: appointment.holdExpiresAt,
      expiresInSeconds: holdDurationMinutes * 60,
      appointmentCode: appointment.appointmentCode,
      slot: {
        date,
        time: selectedSlotTime,
        endTime: appointment.endTime,
        duration,
        buffer,
        fee,
      },
    };
  } catch (err) {
    recordBookingFailure(holdData.clientIp);
    throw err;
  }
};

/**
 * Release Temporary Hold
 */
export const releasePublicSlotHold = async (slug, holdToken) => {
  if (!holdToken) return { success: true };
  const safeSlug = (slug || '').trim().toLowerCase();
  const profile = await ProfessionalProfile.findOne({ bookingSlug: safeSlug });
  if (!profile) return { success: true };

  await Appointment.updateOne(
    {
      professionalId: profile._id,
      holdToken,
      status: { $in: ['HOLD', 'HELD'] },
    },
    {
      $set: {
        status: 'EXPIRED',
        holdExpiresAt: null,
      },
    }
  );

  return { success: true, message: 'Hold released successfully' };
};

/**
 * Public Booking Creation with Concurrency Guard & Atomic Slot Lock
 */
export const createPublicBooking = async (slug, bookingData) => {
  const safeSlug = (slug || '').trim().toLowerCase();
  const profile = await ProfessionalProfile.findOne({
    bookingSlug: safeSlug,
    isPublic: { $ne: false },
  });
  if (!profile) {
    const err = new Error('Professional not found or profile is not active.');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  const {
    date,
    time,
    startTime,
    customerName,
    customerPhone,
    customerEmail,
    reason,
    appointmentTypeId,
    paymentMode = 'ONLINE',
    holdToken,
    idempotencyKey,
  } = bookingData;

  // Idempotency check
  if (idempotencyKey) {
    const existing = await Appointment.findOne({
      professionalId: profile._id,
      idempotencyKey: String(idempotencyKey),
    });
    if (existing) {
      return {
        appointment: existing,
        professional: {
          name: profile.name,
          profession: profile.profession,
          specialization: profile.specialization,
          bookingSlug: profile.bookingSlug,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          phone: profile.phone,
          consultationFee: profile.consultationFee,
        },
      };
    }
  }

  const selectedSlotTime = (time || startTime || '').trim();

  // Resolve appointment type or default
  let duration = profile.bookingSettings?.appointmentDuration || 30;
  let buffer = profile.bookingSettings?.bufferTime ?? 10;
  let fee = profile.consultationFee || 500;
  let appointmentTypeName = 'General Consultation';
  let resolvedTypeId = null;
  let consultationType = 'IN_PERSON';

  if (appointmentTypeId) {
    const apptType = await AppointmentType.findOne({
      _id: appointmentTypeId,
      professionalId: profile._id,
      enabled: true,
    });
    if (apptType) {
      duration = apptType.duration;
      if (apptType.bufferTime !== null && apptType.bufferTime !== undefined) {
        buffer = apptType.bufferTime;
      }
      fee = apptType.fee;
      appointmentTypeName = apptType.name;
      resolvedTypeId = apptType._id;
      if (apptType.consultationType) {
        consultationType = apptType.consultationType === 'ANY' ? 'IN_PERSON' : apptType.consultationType;
      }
    }
  }

  // Resolve user account if registered
  let resolvedUserId = bookingData.userId || null;
  let matchedUser = null;
  const cleanEmail = (customerEmail || '').toLowerCase().trim();
  const cleanPhone = (customerPhone || '').trim();

  if (resolvedUserId) {
    matchedUser = await User.findById(resolvedUserId).catch(() => null);
  }
  if (!matchedUser && (cleanEmail || cleanPhone)) {
    const orConditions = [];
    if (cleanEmail) orConditions.push({ email: cleanEmail });
    if (cleanPhone) orConditions.push({ phone: cleanPhone });
    if (orConditions.length > 0) {
      matchedUser = await User.findOne({ $or: orConditions });
      if (matchedUser) {
        resolvedUserId = matchedUser._id;
      }
    }
  }

  // Anti-spam rules check
  await checkBookingSpamRules({
    userId: resolvedUserId,
    customerPhone: cleanPhone,
    customerEmail: cleanEmail,
    professionalId: profile._id,
    dateString: date,
    startTime: selectedSlotTime,
    clientIp: bookingData.clientIp,
  });

  // Determine payment status
  let initialPaymentStatus = 'PENDING';
  let effectivePaymentMode = paymentMode;
  if (fee === 0 || paymentMode === 'FREE') {
    initialPaymentStatus = 'NOT_REQUIRED';
    effectivePaymentMode = 'FREE';
  } else if (paymentMode === 'PAY_AT_CLINIC' || paymentMode === 'OFFLINE') {
    initialPaymentStatus = 'PAY_AT_CLINIC';
    effectivePaymentMode = 'PAY_AT_CLINIC';
  }

  let appointment;
  let rawCancelToken = null;
  let manageUrl = null;

  // Case A: Confirm from active non-expired HOLD
  if (holdToken) {
    const now = new Date();
    const heldAppt = await Appointment.findOne({
      professionalId: profile._id,
      holdToken,
      status: { $in: ['HOLD', 'HELD'] },
      holdExpiresAt: { $gt: now },
    });

    if (heldAppt) {
      const { rawToken, tokenHash } = generateCancelToken();
      rawCancelToken = rawToken;

      if (resolvedUserId && !heldAppt.userId) {
        heldAppt.userId = resolvedUserId;
      }
      heldAppt.customerName = customerName.trim();
      heldAppt.customerPhone = customerPhone.trim();
      heldAppt.customerEmail = (customerEmail || '').trim().toLowerCase();
      heldAppt.reason = (reason || '').trim();
      heldAppt.status = 'CONFIRMED';
      heldAppt.confirmedAt = new Date();
      heldAppt.holdToken = null;
      heldAppt.holdExpiresAt = null;
      heldAppt.cancelTokenHash = tokenHash;
      heldAppt.paymentStatus = initialPaymentStatus;
      heldAppt.paymentMode = effectivePaymentMode;
      heldAppt.consultationType = consultationType;
      if (idempotencyKey) heldAppt.idempotencyKey = String(idempotencyKey);

      await heldAppt.save();
      appointment = heldAppt;
      manageUrl = `/book/manage?code=${appointment.appointmentCode}&token=${rawCancelToken}`;
    }
  }

  // Case B: Direct Booking (or hold expired / not supplied)
  if (!appointment) {
    const res = await reserveSlotAtomically({
      professionalId: profile._id,
      dateString: date,
      startTime: selectedSlotTime,
      duration,
      buffer,
      targetStatus: 'BOOKED',
      payload: {
        userId: resolvedUserId || undefined,
        appointmentTypeId: resolvedTypeId,
        appointmentTypeName,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: (customerEmail || '').trim().toLowerCase(),
        reason: (reason || '').trim(),
        fee,
        consultationType,
        paymentStatus: initialPaymentStatus,
        paymentMode: effectivePaymentMode,
        idempotencyKey: idempotencyKey ? String(idempotencyKey) : undefined,
      },
    });
    appointment = res.appointment;
    rawCancelToken = res.cancelToken;
    manageUrl = res.manageUrl;
  }

  // Dispatch Notifications & Socket Events with secure manage URL
  sendBookingNotifications(appointment, profile, { manageUrl, cancelToken: rawCancelToken }).catch((err) =>
    console.error('Async notification error:', err.message)
  );
  emitAppointmentCreated(appointment, profile, matchedUser).catch((err) =>
    console.error('Socket emit error:', err.message)
  );

  return {
    appointment,
    cancelToken: rawCancelToken,
    manageUrl,
    professional: {
      name: profile.name,
      profession: profile.profession,
      specialization: profile.specialization,
      bookingSlug: profile.bookingSlug,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      phone: profile.phone,
      consultationFee: profile.consultationFee,
    },
  };
};

/**
 * Public Booking Challenge Service:
 * Returns masked info for unauthenticated visitors, or full info + permissions when authenticated via token/session.
 */
export const getBookingChallengeService = async ({ appointmentCode, cancelToken, manageSessionToken, user }) => {
  const code = (appointmentCode || '').trim();
  if (!code) {
    const err = new Error('Appointment code is required.');
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  const appointment = await Appointment.findOne({ appointmentCode: code })
    .select('+cancelTokenHash')
    .populate('professionalId', 'name profession specialization city address phone bookingSettings consultationFee')
    .populate('appointmentTypeId', 'name duration fee');

  if (!appointment) {
    const err = new Error('Appointment not found with the provided code.');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  const profile = appointment.professionalId;
  let isAuthenticated = false;

  // 1. Check logged-in user ownership
  if (user && appointment.userId && user._id.toString() === appointment.userId.toString()) {
    isAuthenticated = true;
  }

  // 2. Check cancelToken
  if (!isAuthenticated && cancelToken) {
    const hash = hashCancelToken(cancelToken);
    if (appointment.cancelTokenHash && hash === appointment.cancelTokenHash) {
      isAuthenticated = true;
    }
  }

  // 3. Check manageSessionToken
  if (!isAuthenticated && manageSessionToken) {
    if (otpService.verifyManageSessionToken(manageSessionToken, code)) {
      isAuthenticated = true;
    }
  }

  const cleanPhone = (appointment.customerPhone || '').replace(/[^0-9]/g, '');
  const maskedPhone =
    cleanPhone.length >= 4 ? `+91 ******${cleanPhone.slice(-4)}` : appointment.customerPhone;

  // Calculate notice window
  const now = new Date();
  const minNoticeMinutes = profile?.bookingSettings?.minNoticeMinutes ?? 0;
  const diffMinutes = appointment.startAt
    ? Math.floor((new Date(appointment.startAt) - now) / (1000 * 60))
    : 999;
  const isWithinCancellationNotice = diffMinutes >= minNoticeMinutes;
  const canCancel =
    ['BOOKED', 'CONFIRMED', 'PENDING', 'HOLD', 'HELD'].includes(appointment.status) &&
    isWithinCancellationNotice;
  const canReschedule = ['BOOKED', 'CONFIRMED', 'PENDING', 'HOLD', 'HELD'].includes(appointment.status);

  if (isAuthenticated) {
    return {
      authenticated: true,
      requiresAuth: false,
      appointment: {
        _id: appointment._id,
        appointmentCode: appointment.appointmentCode,
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone,
        customerEmail: appointment.customerEmail,
        dateString: appointment.dateString,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        fee: appointment.fee,
        appointmentTypeName: appointment.appointmentTypeName,
        status: appointment.status,
        canCancel,
        canReschedule,
        minNoticeMinutes,
      },
      professional: {
        id: profile?._id,
        name: profile?.name,
        profession: profile?.profession,
        specialization: profile?.specialization,
        city: profile?.city,
        address: profile?.address,
        phone: profile?.phone,
      },
    };
  }

  // Return masked challenge payload for unauthenticated public viewers
  return {
    authenticated: false,
    requiresAuth: true,
    appointment: {
      appointmentCode: appointment.appointmentCode,
      customerName: appointment.customerName
        ? `${appointment.customerName.charAt(0)}${'*'.repeat(Math.max(2, appointment.customerName.length - 1))}`
        : 'Customer',
      maskedPhone,
      dateString: appointment.dateString,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      appointmentTypeName: appointment.appointmentTypeName,
      status: appointment.status,
    },
    professional: {
      name: profile?.name,
      profession: profile?.profession,
      city: profile?.city,
    },
  };
};

/**
 * Public Booking Cancel Service:
 * Requires valid cancelToken, OTP verification, or manageSessionToken.
 * Enforces notice window and rate limit (max 5 cancel attempts / 24h per phone).
 */
export const cancelPublicBookingService = async ({
  appointmentCode,
  cancelToken,
  otp,
  manageSessionToken,
  reason = '',
  clientIp = '',
  user = null,
}) => {
  const code = (appointmentCode || '').trim();
  if (!code) {
    const err = new Error('Appointment code is required.');
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  const appointment = await Appointment.findOne({ appointmentCode: code }).select(
    '+cancelTokenHash +cancelAttempts +lastCancelAttemptAt'
  );

  if (!appointment) {
    const err = new Error('Appointment not found with the provided code.');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  const profile = await ProfessionalProfile.findById(appointment.professionalId);
  const targetPhone = appointment.customerPhone || clientIp;

  // Enforce 5 cancel attempts / 24h rate limit per phone
  otpService.checkCancelRateLimit(targetPhone);

  let isAuthenticated = false;
  let authenticatedBy = null;

  // 1. Check logged-in user
  if (user && appointment.userId && user._id.toString() === appointment.userId.toString()) {
    isAuthenticated = true;
    authenticatedBy = 'USER';
  }

  // 2. Check cancelToken
  if (!isAuthenticated && cancelToken) {
    const hash = hashCancelToken(cancelToken);
    if (appointment.cancelTokenHash && hash === appointment.cancelTokenHash) {
      isAuthenticated = true;
      authenticatedBy = 'CANCEL_TOKEN';
    }
  }

  // 3. Check OTP direct verification
  if (!isAuthenticated && otp) {
    await otpService.verifyBookingOtp({ appointmentCode: code, otp });
    isAuthenticated = true;
    authenticatedBy = 'PHONE_OTP';
  }

  // 4. Check manageSessionToken
  if (!isAuthenticated && manageSessionToken) {
    if (otpService.verifyManageSessionToken(manageSessionToken, code)) {
      isAuthenticated = true;
      authenticatedBy = 'MANAGE_SESSION';
    }
  }

  if (!isAuthenticated) {
    otpService.recordCancelAttempt(targetPhone);
    const err = new Error(
      'Unauthorized. Valid cancellation token or phone verification OTP is required to cancel this appointment.'
    );
    err.statusCode = 401;
    err.isOperational = true;
    throw err;
  }

  // Check appointment status
  if (['COMPLETED', 'DONE', 'CANCELLED', 'REJECTED', 'NO_SHOW'].includes(appointment.status)) {
    const err = new Error(`Cannot cancel an appointment that is already ${appointment.status}.`);
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  // Check notice window rules
  const minNoticeMinutes = profile?.bookingSettings?.minNoticeMinutes ?? 0;
  if (minNoticeMinutes > 0 && appointment.startAt) {
    const now = new Date();
    const diffMinutes = Math.floor((new Date(appointment.startAt) - now) / (1000 * 60));
    if (diffMinutes < minNoticeMinutes) {
      const err = new Error(
        `Cancellations must be made at least ${minNoticeMinutes} minutes before scheduled appointment time.`
      );
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }
  }

  appointment.status = 'CANCELLED';
  appointment.cancelledBy = authenticatedBy === 'USER' ? 'USER' : 'CUSTOMER';
  appointment.cancellationReason = (reason || '').trim();
  appointment.cancelledAt = new Date();
  await appointment.save();

  recordCancellation(appointment.userId?.toString() || appointment.customerPhone);

  if (profile) {
    await emitAppointmentCancelled(appointment, profile, appointment.cancelledBy, reason);
  }

  return {
    success: true,
    message: 'Appointment cancelled successfully.',
    appointment: {
      appointmentCode: appointment.appointmentCode,
      status: appointment.status,
      cancelledAt: appointment.cancelledAt,
      cancellationReason: appointment.cancellationReason,
    },
  };
};

/**
 * Public Booking Reschedule Request Service:
 * Requires valid cancelToken, OTP verification, or manageSessionToken.
 */
export const requestPublicRescheduleService = async ({
  appointmentCode,
  cancelToken,
  otp,
  manageSessionToken,
  newDate,
  newTime,
  reason = '',
  clientIp = '',
  user = null,
}) => {
  const code = (appointmentCode || '').trim();
  if (!code) {
    const err = new Error('Appointment code is required.');
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  if (!newDate || !newTime) {
    const err = new Error('New requested date and start time are required.');
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  const appointment = await Appointment.findOne({ appointmentCode: code }).select('+cancelTokenHash');

  if (!appointment) {
    const err = new Error('Appointment not found with the provided code.');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  const profile = await ProfessionalProfile.findById(appointment.professionalId);

  let isAuthenticated = false;

  // 1. Check logged-in user
  if (user && appointment.userId && user._id.toString() === appointment.userId.toString()) {
    isAuthenticated = true;
  }

  // 2. Check cancelToken
  if (!isAuthenticated && cancelToken) {
    const hash = hashCancelToken(cancelToken);
    if (appointment.cancelTokenHash && hash === appointment.cancelTokenHash) {
      isAuthenticated = true;
    }
  }

  // 3. Check OTP direct verification
  if (!isAuthenticated && otp) {
    await otpService.verifyBookingOtp({ appointmentCode: code, otp });
    isAuthenticated = true;
  }

  // 4. Check manageSessionToken
  if (!isAuthenticated && manageSessionToken) {
    if (otpService.verifyManageSessionToken(manageSessionToken, code)) {
      isAuthenticated = true;
    }
  }

  if (!isAuthenticated) {
    const err = new Error(
      'Unauthorized. Valid cancellation token or phone verification OTP is required to request a reschedule.'
    );
    err.statusCode = 401;
    err.isOperational = true;
    throw err;
  }

  if (['COMPLETED', 'DONE', 'CANCELLED', 'REJECTED'].includes(appointment.status)) {
    const err = new Error(`Cannot reschedule an appointment that is already ${appointment.status}.`);
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  appointment.status = 'RESCHEDULE_REQUESTED';
  appointment.rescheduleRequest = {
    requestedDate: (newDate || '').trim(),
    requestedTime: (newTime || '').trim(),
    requestedBy: user ? 'USER' : 'CUSTOMER',
    reason: (reason || '').trim(),
    requestedAt: new Date(),
  };
  await appointment.save();

  if (profile) {
    await emitAppointmentRescheduleRequested(appointment, profile, appointment.rescheduleRequest);
  }

  return {
    success: true,
    message: 'Reschedule request submitted to the professional.',
    appointment: {
      appointmentCode: appointment.appointmentCode,
      status: appointment.status,
      rescheduleRequest: appointment.rescheduleRequest,
    },
  };
};

/**
 * Manual / Walk-In Professional Booking Creation
 * Uses the exact same reserveSlotAtomically transaction helper!
 */
export const createManualBooking = async (professionalId, bookingData) => {
  const profile = await ProfessionalProfile.findById(professionalId);
  if (!profile) {
    const err = new Error('Professional not found.');
    err.statusCode = 404;
    throw err;
  }

  const {
    date,
    time,
    customerName,
    customerPhone,
    customerEmail,
    reason,
    appointmentTypeId,
    duration: customDuration,
    buffer: customBuffer,
    fee: customFee,
    notes,
    bookingSource = 'WALK_IN',
  } = bookingData;

  const targetDate = date || getDateString(new Date(), profile.timezone || 'Asia/Kolkata');
  const targetTime =
    time === 'NOW' ? getCurrentTimeString(profile.timezone || 'Asia/Kolkata') : (time || '10:00').trim();

  let duration = customDuration || profile.bookingSettings?.appointmentDuration || 30;
  let buffer =
    customBuffer !== undefined && customBuffer !== null
      ? customBuffer
      : (profile.bookingSettings?.bufferTime ?? 10);
  let fee = customFee !== undefined ? customFee : profile.consultationFee || 500;
  let appointmentTypeName = 'General Consultation';
  let resolvedTypeId = null;

  if (appointmentTypeId) {
    const apptType = await AppointmentType.findOne({
      _id: appointmentTypeId,
      professionalId: profile._id,
    });
    if (apptType) {
      duration = customDuration || apptType.duration;
      if (customBuffer === undefined && apptType.bufferTime !== null && apptType.bufferTime !== undefined) {
        buffer = apptType.bufferTime;
      }
      fee = customFee !== undefined ? customFee : apptType.fee;
      appointmentTypeName = apptType.name;
      resolvedTypeId = apptType._id;
    }
  }

  const { appointment } = await reserveSlotAtomically({
    professionalId: profile._id,
    dateString: targetDate,
    startTime: targetTime,
    duration,
    buffer,
    isPublic: false,
    targetStatus: 'BOOKED',
    payload: {
      appointmentTypeId: resolvedTypeId,
      appointmentTypeName,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: (customerEmail || '').trim().toLowerCase(),
      reason: (reason || '').trim(),
      fee,
      bookingSource,
      notes: notes || '',
      paymentStatus: fee === 0 ? 'NOT_REQUIRED' : 'PENDING',
      paymentMode: fee === 0 ? 'FREE' : 'PAY_AT_CLINIC',
    },
  });

  return appointment;
};

/**
 * Reschedule Appointment with conflict checking
 */
export const rescheduleAppointment = async (professionalId, appointmentId, rescheduleData) => {
  const appointment = await Appointment.findOne({ _id: appointmentId, professionalId });
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  const profile = await ProfessionalProfile.findById(professionalId);
  if (!profile) {
    const err = new Error('Professional not found');
    err.statusCode = 404;
    throw err;
  }

  const { newDate, newTime, appointmentTypeId } = rescheduleData;
  const targetDate = (newDate || appointment.dateString).trim();
  const targetTime = (newTime || appointment.startTime).trim();

  let duration = appointment.duration;
  let buffer = appointment.buffer || 0;
  let resolvedTypeId = appointment.appointmentTypeId;
  let apptTypeName = appointment.appointmentTypeName;

  if (appointmentTypeId) {
    const apptType = await AppointmentType.findOne({
      _id: appointmentTypeId,
      professionalId,
    });
    if (apptType) {
      duration = apptType.duration;
      if (apptType.bufferTime !== null && apptType.bufferTime !== undefined) {
        buffer = apptType.bufferTime;
      }
      resolvedTypeId = apptType._id;
      apptTypeName = apptType.name;
    }
  }

  const startMinutes = timeToMinutes(targetTime);
  const endMinutes = startMinutes + duration;
  const endTime = minutesToTime(endMinutes);

  // Validate conflict against all other active locks
  const now = new Date();
  const conflicting = await Appointment.findOne({
    professionalId,
    dateString: targetDate,
    _id: { $ne: appointmentId },
    $or: [
      { status: { $in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'BOOKED', 'DONE'] } },
      { status: { $in: ['HOLD', 'HELD'] }, holdExpiresAt: { $gt: now } },
    ],
    startMinutes: { $lt: endMinutes },
    endMinutes: { $gt: startMinutes },
  });

  if (conflicting) {
    const err = new Error(
      `Cannot reschedule: ${targetTime} - ${endTime} on ${targetDate} is already booked or blocked.`
    );
    err.statusCode = 409;
    err.isOperational = true;
    throw err;
  }

  const [year, month, day] = targetDate.split('-').map(Number);
  const appointmentDateObj = new Date(Date.UTC(year, month - 1, day));
  const startAt = createUtcDateFromLocal(targetDate, startMinutes, profile.timezone || 'Asia/Kolkata');
  const endAt = createUtcDateFromLocal(targetDate, endMinutes, profile.timezone || 'Asia/Kolkata');

  appointment.dateString = targetDate;
  appointment.startTime = targetTime;
  appointment.endTime = endTime;
  appointment.startMinutes = startMinutes;
  appointment.endMinutes = endMinutes;
  appointment.startAt = startAt;
  appointment.endAt = endAt;
  appointment.duration = duration;
  appointment.buffer = buffer;
  appointment.appointmentDate = appointmentDateObj;
  appointment.appointmentTypeId = resolvedTypeId;
  appointment.appointmentTypeName = apptTypeName;
  appointment.status = 'CONFIRMED';
  await appointment.save();

  return appointment;
};

/**
 * Get Professional Appointments with Tab Filters, Queue Categorization & Search
 */
export const getProfessionalAppointments = async (professionalId, query = {}) => {
  const { tab = 'upcoming', date, status, search, page = 1, limit = 50 } = query;
  const profile = await ProfessionalProfile.findById(professionalId);
  const timezone = profile?.timezone || 'Asia/Kolkata';
  const todayString = getDateString(new Date(), timezone);
  const currentTimeString = getCurrentTimeString(timezone);
  const currentMinutes = timeToMinutes(currentTimeString);

  const filter = { professionalId };

  if (date) {
    filter.dateString = date;
  }

  if (status) {
    filter.status = status;
  } else {
    if (tab === 'today') {
      filter.dateString = todayString;
      filter.status = { $ne: 'CANCELLED' };
    } else if (tab === 'queue') {
      filter.dateString = todayString;
      filter.status = {
        $in: ['CONFIRMED', 'PENDING', 'ARRIVED', 'WAITING', 'IN_PROGRESS', 'BOOKED'],
      };
    } else if (tab === 'upcoming') {
      filter.dateString = { $gte: todayString };
      filter.status = {
        $in: ['CONFIRMED', 'PENDING', 'ARRIVED', 'WAITING', 'IN_PROGRESS', 'BOOKED'],
      };
    } else if (tab === 'past') {
      filter.dateString = { $lt: todayString };
    } else if (tab === 'cancelled') {
      filter.status = { $in: ['CANCELLED', 'NO_SHOW', 'REJECTED'] };
    }
  }

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { customerName: regex },
      { customerPhone: regex },
      { appointmentCode: regex },
      { appointmentTypeName: regex },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortDirection = tab === 'past' || tab === 'cancelled' ? -1 : 1;

  const [rawAppointments, total] = await Promise.all([
    Appointment.find(filter)
      .select('+notes')
      .sort({ dateString: sortDirection, startTime: sortDirection })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Appointment.countDocuments(filter),
  ]);

  // Enrich appointments with arrival analysis and queue categorization
  const earlyArrivalLimit = profile?.bookingSettings?.earlyArrivalMinutes || 15;
  const lateGraceLimit = profile?.bookingSettings?.lateGraceMinutes || 10;
  const noShowLimit = profile?.bookingSettings?.noShowThresholdMinutes || 15;

  const enrichedAppointments = rawAppointments.map((appt) => {
    const apptStartMinutes = appt.startMinutes ?? timeToMinutes(appt.startTime);
    const apptEndMinutes = appt.endMinutes ?? timeToMinutes(appt.endTime);

    let normalizedStatus = appt.status;
    if (
      normalizedStatus === 'BOOKED' ||
      normalizedStatus === 'CONFIRMED' ||
      normalizedStatus === 'PENDING' ||
      normalizedStatus === 'ARRIVED' ||
      normalizedStatus === 'WAITING' ||
      normalizedStatus === 'IN_PROGRESS'
    ) {
      if (appt.dateString < todayString || (appt.dateString === todayString && apptEndMinutes < currentMinutes)) {
        normalizedStatus = 'DONE';
      } else {
        normalizedStatus = 'BOOKED';
      }
    } else if (normalizedStatus === 'COMPLETED') {
      normalizedStatus = 'DONE';
    } else if (normalizedStatus === 'CANCELLED' || normalizedStatus === 'REJECTED' || normalizedStatus === 'NO_SHOW') {
      normalizedStatus = 'CANCELLED';
    }

    let arrivalAnalysis = null;
    if (appt.dateString === todayString) {
      const evaluationRefMinutes = appt.arrivedAt
        ? timeToMinutes(getCurrentTimeString(timezone, new Date(appt.arrivedAt)))
        : currentMinutes;

      arrivalAnalysis = evaluateArrivalStatus({
        scheduledStartTime: appt.startTime,
        arrivalMinutes: evaluationRefMinutes,
        earlyArrivalMinutes: earlyArrivalLimit,
        lateGraceMinutes: lateGraceLimit,
        noShowThresholdMinutes: noShowLimit,
      });
    }

    return {
      ...appt,
      status: normalizedStatus,
      rawStatus: appt.status,
      arrivalAnalysis,
    };
  });

  return {
    appointments: enrichedAppointments,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Status Lifecycle Transitions (Arrived, Waiting, In-Progress, Completed, No-Show, Cancel)
 */
export const updateAppointmentStatus = async (
  professionalId,
  appointmentId,
  { status, cancelReason }
) => {
  const appointment = await Appointment.findOne({ _id: appointmentId, professionalId });
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  const now = new Date();
  appointment.status = status;

  if (status === 'ARRIVED') {
    appointment.arrivedAt = now;
  } else if (status === 'WAITING') {
    if (!appointment.arrivedAt) appointment.arrivedAt = now;
  } else if (status === 'IN_PROGRESS') {
    appointment.startedAt = now;
  } else if (status === 'COMPLETED' || status === 'DONE') {
    appointment.completedAt = now;
  } else if (status === 'NO_SHOW') {
    appointment.noShowAt = now;
  } else if (status === 'CANCELLED') {
    appointment.cancelledAt = now;
    if (cancelReason) {
      appointment.cancelReason = cancelReason;
    }
    recordCancellation(appointment.userId?.toString() || appointment.customerPhone);
  }

  await appointment.save();
  return appointment;
};

/**
 * Update private clinical/consultation notes (Professional or Admin)
 */
export const updateAppointmentNotes = async (
  professionalId,
  appointmentId,
  notes,
  updatedBy = 'PROFESSIONAL'
) => {
  const appointment = await Appointment.findOne({ _id: appointmentId, professionalId }).select('+notes');
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  appointment.notes = notes;
  appointment.notesUpdatedAt = new Date();
  appointment.notesUpdatedBy = updatedBy;
  await appointment.save();
  return appointment;
};

/**
 * Get Comprehensive Dashboard Statistics & Realtime Queue Data
 */
export const getDashboardStats = async (professionalId, timezone = 'Asia/Kolkata') => {
  const todayString = getDateString(new Date(), timezone);
  const currentTimeString = getCurrentTimeString(timezone);
  const currentMinutes = timeToMinutes(currentTimeString);
  const [year, month] = todayString.split('-');
  const monthPrefix = `${year}-${month}`;

  const [allAppointments, todayRawSchedule, profile] = await Promise.all([
    Appointment.find({ professionalId }).lean(),
    Appointment.find({
      professionalId,
      dateString: todayString,
      status: { $ne: 'CANCELLED' },
    })
      .sort({ startTime: 1 })
      .lean(),
    ProfessionalProfile.findById(professionalId).lean(),
  ]);

  const earlyArrivalLimit = profile?.bookingSettings?.earlyArrivalMinutes || 15;
  const lateGraceLimit = profile?.bookingSettings?.lateGraceMinutes || 10;
  const noShowLimit = profile?.bookingSettings?.noShowThresholdMinutes || 15;

  const todaySchedule = todayRawSchedule.map((appt) => {
    const apptStartMinutes = appt.startMinutes ?? timeToMinutes(appt.startTime);
    const apptEndMinutes = appt.endMinutes ?? timeToMinutes(appt.endTime);

    const evaluationRefMinutes = appt.arrivedAt
      ? timeToMinutes(getCurrentTimeString(timezone, new Date(appt.arrivedAt)))
      : currentMinutes;

    const arrivalAnalysis = evaluateArrivalStatus({
      scheduledStartTime: appt.startTime,
      arrivalMinutes: evaluationRefMinutes,
      earlyArrivalMinutes: earlyArrivalLimit,
      lateGraceMinutes: lateGraceLimit,
      noShowThresholdMinutes: noShowLimit,
    });

    let queueStage = 'UPCOMING';
    if (appt.status === 'IN_PROGRESS') {
      queueStage = 'NOW';
    } else if (appt.status === 'ARRIVED' || appt.status === 'WAITING') {
      queueStage = 'WAITING';
    } else if (
      currentMinutes >= apptStartMinutes &&
      currentMinutes <= apptEndMinutes &&
      (appt.status === 'CONFIRMED' || appt.status === 'BOOKED')
    ) {
      queueStage = 'NOW';
    } else if (apptStartMinutes > currentMinutes && apptStartMinutes <= currentMinutes + 45) {
      queueStage = 'NEXT';
    }

    return {
      ...appt,
      arrivalAnalysis,
      queueStage,
    };
  });

  const todayCount = todaySchedule.length;
  const waitingCount = todaySchedule.filter((a) => a.status === 'WAITING' || a.status === 'ARRIVED').length;
  const inProgressCount = todaySchedule.filter((a) => a.status === 'IN_PROGRESS').length;
  const completedTodayCount = todaySchedule.filter((a) => a.status === 'COMPLETED' || a.status === 'DONE').length;
  const noShowTodayCount = todaySchedule.filter((a) => a.status === 'NO_SHOW').length;

  const upcomingCount = allAppointments.filter(
    (a) =>
      a.dateString >= todayString &&
      ['CONFIRMED', 'PENDING', 'ARRIVED', 'WAITING', 'IN_PROGRESS', 'BOOKED'].includes(a.status)
  ).length;

  const monthCount = allAppointments.filter(
    (a) =>
      a.dateString?.startsWith(monthPrefix) &&
      ['CONFIRMED', 'COMPLETED', 'ARRIVED', 'IN_PROGRESS', 'BOOKED', 'DONE'].includes(a.status)
  ).length;

  const totalRevenue = allAppointments
    .filter((a) => ['CONFIRMED', 'COMPLETED', 'BOOKED', 'DONE'].includes(a.status))
    .reduce((sum, a) => sum + (a.fee || 0), 0);

  const monthRevenue = allAppointments
    .filter(
      (a) =>
        a.dateString?.startsWith(monthPrefix) &&
        ['CONFIRMED', 'COMPLETED', 'BOOKED', 'DONE'].includes(a.status)
    )
    .reduce((sum, a) => sum + (a.fee || 0), 0);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyTrend = [];
  const todayObj = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayObj);
    d.setDate(todayObj.getDate() - i);
    const dateStr = getDateString(d, timezone);
    const dayName = daysOfWeek[d.getDay()];

    const dayBookings = allAppointments.filter(
      (a) => a.dateString === dateStr && a.status !== 'CANCELLED'
    );
    const dayRevenue = dayBookings.reduce((sum, a) => sum + (a.fee || 0), 0);

    weeklyTrend.push({
      date: dateStr,
      day: dayName,
      appointments: dayBookings.length,
      revenue: dayRevenue,
    });
  }

  const serviceMap = {};
  allAppointments.forEach((a) => {
    const type = a.appointmentTypeName || 'General Consultation';
    serviceMap[type] = (serviceMap[type] || 0) + 1;
  });

  const serviceDistribution = Object.keys(serviceMap).map((name) => ({
    name,
    count: serviceMap[name],
    percentage: Math.round((serviceMap[name] / (allAppointments.length || 1)) * 100),
  }));

  const hourMap = {
    '09:00 AM': 0,
    '10:00 AM': 0,
    '11:00 AM': 0,
    '12:00 PM': 0,
    '05:00 PM': 0,
    '06:00 PM': 0,
    '07:00 PM': 0,
  };

  allAppointments.forEach((a) => {
    if (!a.startTime) return;
    const [h] = a.startTime.split(':').map(Number);
    const hourKey =
      h === 9
        ? '09:00 AM'
        : h === 10
        ? '10:00 AM'
        : h === 11
        ? '11:00 AM'
        : h === 12
        ? '12:00 PM'
        : h === 17
        ? '05:00 PM'
        : h === 18
        ? '06:00 PM'
        : h === 19
        ? '07:00 PM'
        : null;

    if (hourKey && hourMap[hourKey] !== undefined) {
      hourMap[hourKey] += 1;
    }
  });

  const hourlyDistribution = Object.keys(hourMap).map((time) => ({
    time,
    bookings: hourMap[time],
  }));

  return {
    todayCount,
    waitingCount,
    inProgressCount,
    completedTodayCount,
    noShowTodayCount,
    upcomingCount,
    monthCount,
    totalCount: allAppointments.length,
    totalRevenue,
    monthRevenue,
    weeklyTrend,
    serviceDistribution,
    hourlyDistribution,
    todaySchedule,
  };
};

/**
 * Zero-login Phone Lookup for Customers
 */
export const lookupAppointmentsByPhone = async (phone) => {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length < 10) {
    const err = new Error('Valid 10-digit Indian phone number is required');
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  const phoneRegex = new RegExp(cleanPhone + '$');
  const appointments = await Appointment.find({ customerPhone: phoneRegex })
    .select('-notes -notesUpdatedAt -notesUpdatedBy -cancelTokenHash -cancelAttempts -lastCancelAttemptAt')
    .populate('professionalId', 'name profession specialization city address bookingSlug profileImage')
    .sort({ dateString: -1, startTime: -1 })
    .limit(30)
    .lean();

  const today = getDateString(new Date(), 'Asia/Kolkata');
  const nowMinutes = timeToMinutes(getCurrentTimeString('Asia/Kolkata'));

  const enriched = appointments.map((a) => {
    let status = a.status;
    const endMinutes = a.endMinutes ?? timeToMinutes(a.endTime || '17:00');
    if (
      status === 'BOOKED' ||
      status === 'CONFIRMED' ||
      status === 'PENDING' ||
      status === 'ARRIVED' ||
      status === 'WAITING' ||
      status === 'IN_PROGRESS'
    ) {
      if (a.dateString < today || (a.dateString === today && endMinutes < nowMinutes)) {
        status = 'DONE';
      } else {
        status = 'BOOKED';
      }
    } else if (status === 'COMPLETED') {
      status = 'DONE';
    } else if (status === 'CANCELLED' || status === 'REJECTED' || status === 'NO_SHOW') {
      status = 'CANCELLED';
    }

    return {
      ...a,
      status,
    };
  });

  return enriched;
};

/**
 * 1-Tap "Book Again" Helper
 */
export const getRebookingDetails = async (phone) => {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length < 10) {
    const err = new Error('Valid 10-digit Indian phone number is required');
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  const phoneRegex = new RegExp(cleanPhone + '$');
  const lastAppt = await Appointment.findOne({ customerPhone: phoneRegex })
    .populate('professionalId')
    .sort({ createdAt: -1 });

  if (!lastAppt || !lastAppt.professionalId) {
    return { canRebook: false, message: 'No previous appointments found for this phone number' };
  }

  const profile = lastAppt.professionalId;
  const now = new Date();
  const isPro = profile.plan === 'PRO' && (!profile.planExpiresAt || new Date(profile.planExpiresAt) > now);

  if (!isPro) {
    return {
      canRebook: false,
      isPro: false,
      message: 'Standard booking available',
      professional: {
        name: profile.name,
        bookingSlug: profile.bookingSlug,
      },
    };
  }

  const today = getDateString(now, profile.timezone || 'Asia/Kolkata');

  let nextSlot = null;
  let targetDate = today;

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = getDateString(d, profile.timezone || 'Asia/Kolkata');
    const slotsData = await getAvailableSlots(profile, dateStr, lastAppt.duration || 30, lastAppt.buffer || 10);
    const firstOpen = slotsData.slots?.find((s) => s.available);
    if (firstOpen) {
      nextSlot = firstOpen;
      targetDate = dateStr;
      break;
    }
  }

  return {
    canRebook: true,
    lastAppointment: {
      customerName: lastAppt.customerName,
      customerPhone: lastAppt.customerPhone,
      serviceName: lastAppt.appointmentTypeName,
      fee: lastAppt.fee,
      duration: lastAppt.duration,
    },
    professional: {
      id: profile._id,
      name: profile.name,
      profession: profile.profession,
      specialization: profile.specialization,
      bookingSlug: profile.bookingSlug,
      city: profile.city,
      consultationFee: profile.consultationFee,
    },
    suggestedSlot: nextSlot
      ? {
          date: targetDate,
          time: nextSlot.time,
          time12: nextSlot.time12,
        }
      : null,
  };
};
