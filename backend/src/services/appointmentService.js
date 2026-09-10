import crypto from 'crypto';
import { Appointment } from '../models/Appointment.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { AppointmentType } from '../models/AppointmentType.js';
import { User } from '../models/User.js';
import { emitAppointmentCreated } from '../socket/socketEmitter.js';
import { getAvailableSlots } from './slotGeneratorService.js';
import { sendBookingNotifications } from './emailService.js';
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
} from '../utils/dateHelpers.js';

/**
 * Temporary Slot Hold (reserves slot for 5 minutes during customer booking checkout)
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

  // Resolve service / duration / buffer
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

  // Anti-spam and abuse rules check
  await checkBookingSpamRules({
    professionalId: profile._id,
    dateString: date,
    startTime: selectedSlotTime,
    clientIp: holdData.clientIp,
  });

  // 1. Verify Slot Availability
  const availabilityResult = await getAvailableSlots(profile, date, duration, buffer);
  const isSlotValid = availabilityResult.slots?.some((s) => s.time === selectedSlotTime && s.available);

  if (!isSlotValid) {
    recordBookingFailure(holdData.clientIp);
    const err = new Error('This time slot is no longer available. Please select another available time.');
    err.statusCode = 409;
    err.code = 'SLOT_ALREADY_BOOKED';
    err.isOperational = true;
    throw err;
  }

  const startMinutes = timeToMinutes(selectedSlotTime);
  const endMinutes = startMinutes + duration;
  const endTime = minutesToTime(endMinutes);

  const holdDurationMinutes = profile.bookingSettings?.holdDurationMinutes || 5;
  const holdExpiresAt = new Date(Date.now() + holdDurationMinutes * 60 * 1000);
  const holdToken = crypto.randomBytes(16).toString('hex');
  const appointmentCode = generateAppointmentCode();
  const [year, month, day] = date.split('-').map(Number);
  const appointmentDate = new Date(Date.UTC(year, month - 1, day));

  // Clean up any expired holds on this slot
  await Appointment.deleteMany({
    professionalId: profile._id,
    dateString: date,
    startTime: selectedSlotTime,
    status: 'HELD',
    holdExpiresAt: { $lte: new Date() },
  });

  try {
    const heldAppointment = await Appointment.create({
      appointmentCode,
      professionalId: profile._id,
      appointmentTypeId: resolvedTypeId,
      appointmentTypeName,
      customerName: 'Holding Customer',
      customerPhone: '0000000000',
      appointmentDate,
      dateString: date,
      startTime: selectedSlotTime,
      endTime,
      duration,
      buffer,
      fee,
      currency: profile.currency || 'INR',
      timezone: profile.timezone || 'Asia/Kolkata',
      bookingSource: 'ONLINE',
      status: 'HELD',
      holdExpiresAt,
      holdToken,
      paymentStatus: 'PENDING',
    });

    return {
      holdToken,
      holdExpiresAt,
      expiresInSeconds: holdDurationMinutes * 60,
      appointmentCode: heldAppointment.appointmentCode,
      slot: {
        date,
        time: selectedSlotTime,
        endTime,
        duration,
        buffer,
        fee,
      },
    };
  } catch (dbError) {
    if (dbError.code === 11000) {
      recordBookingFailure(holdData.clientIp);
      const err = new Error('This time slot is no longer available. Please select another available time.');
      err.statusCode = 409;
      err.code = 'SLOT_ALREADY_BOOKED';
      err.isOperational = true;
      throw err;
    }
    throw dbError;
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

  await Appointment.deleteOne({
    professionalId: profile._id,
    holdToken,
    status: 'HELD',
  });

  return { success: true, message: 'Hold released successfully' };
};

/**
 * Public Booking Creation with Concurrency Guard & Atomic Double Booking Prevention
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
      idempotencyKey,
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

  let consultationType = 'VIDEO';
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
        consultationType = apptType.consultationType === 'ANY' ? 'VIDEO' : apptType.consultationType;
      }
    }
  }

  // Resolve user account if booking as a registered user
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

  // 2. Anti-spam & abuse rules check before booking or confirming hold
  await checkBookingSpamRules({
    userId: resolvedUserId,
    customerPhone: cleanPhone,
    customerEmail: cleanEmail,
    professionalId: profile._id,
    dateString: date,
    startTime: selectedSlotTime,
    clientIp: bookingData.clientIp,
  });

  // Determine initial payment status
  let initialPaymentStatus = 'PENDING';
  let effectivePaymentMode = paymentMode;
  if (fee === 0 || paymentMode === 'FREE') {
    initialPaymentStatus = 'NOT_REQUIRED';
    effectivePaymentMode = 'FREE';
  } else if (paymentMode === 'PAY_AT_CLINIC' || paymentMode === 'OFFLINE') {
    initialPaymentStatus = 'PAY_AT_CLINIC';
    effectivePaymentMode = 'PAY_AT_CLINIC';
  }

  const startMinutes = timeToMinutes(selectedSlotTime);
  const endMinutes = startMinutes + duration;
  const endTime = minutesToTime(endMinutes);

  let appointment;

  // Case A: Confirm from active Hold
  if (holdToken) {
    const now = new Date();
    const heldAppt = await Appointment.findOne({
      professionalId: profile._id,
      holdToken,
      status: 'HELD',
      holdExpiresAt: { $gt: now },
    });

    if (heldAppt) {
      if (resolvedUserId && !heldAppt.userId) {
        heldAppt.userId = resolvedUserId;
      }
      heldAppt.customerName = customerName.trim();
      heldAppt.customerPhone = customerPhone.trim();
      heldAppt.customerEmail = (customerEmail || '').trim();
      heldAppt.reason = (reason || '').trim();
      heldAppt.status = 'CONFIRMED';
      heldAppt.confirmedAt = new Date();
      heldAppt.holdToken = null;
      heldAppt.holdExpiresAt = null;
      heldAppt.paymentStatus = initialPaymentStatus;
      heldAppt.paymentMode = effectivePaymentMode;
      heldAppt.consultationType = consultationType || 'IN_PERSON';
      if (idempotencyKey) heldAppt.idempotencyKey = idempotencyKey;

      await heldAppt.save();
      appointment = heldAppt;
    }
  }

  // Case B: Direct booking (or hold expired / not found)
  if (!appointment) {
    // 1. Verify Slot Availability via Slot Engine
    const availabilityResult = await getAvailableSlots(profile, date, duration, buffer);
    const isSlotValid = availabilityResult.slots?.some((s) => s.time === selectedSlotTime && s.available);

    if (!isSlotValid) {
      if (idempotencyKey) {
        for (let attempt = 0; attempt < 10; attempt++) {
          const match = await Appointment.findOne({
            professionalId: profile._id,
            idempotencyKey: String(idempotencyKey),
          });
          if (match) {
            return {
              appointment: match,
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
          await new Promise((r) => setTimeout(r, 60));
        }
      }
      recordBookingFailure(cleanPhone || cleanEmail || bookingData.clientIp);
      const err = new Error('This time slot is no longer available. Please select another available time.');
      err.statusCode = 409;
      err.code = 'SLOT_ALREADY_BOOKED';
      err.isOperational = true;
      throw err;
    }

    // Clean up any expired HELD records on this slot so they do not block partial unique index
    await Appointment.deleteMany({
      professionalId: profile._id,
      dateString: date,
      startTime: selectedSlotTime,
      status: 'HELD',
      holdExpiresAt: { $lte: new Date() },
    });

    // 2. Atomic Database Insert protected by Compound Unique Index & conflict checks
    try {
      const appointmentCode = generateAppointmentCode();
      const [year, month, day] = date.split('-').map(Number);
      const appointmentDate = new Date(Date.UTC(year, month - 1, day));

      appointment = await Appointment.create({
        appointmentCode,
        userId: resolvedUserId || undefined,
        professionalId: profile._id,
        appointmentTypeId: resolvedTypeId,
        appointmentTypeName,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: (customerEmail || '').trim(),
        reason: (reason || '').trim(),
        appointmentDate,
        dateString: date,
        startTime: selectedSlotTime,
        endTime,
        duration,
        buffer,
        fee,
        currency: profile.currency || 'INR',
        timezone: profile.timezone || 'Asia/Kolkata',
        bookingSource: 'ONLINE',
        consultationType: consultationType || 'IN_PERSON',
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        paymentStatus: initialPaymentStatus,
        paymentMode: effectivePaymentMode,
        idempotencyKey: idempotencyKey ? String(idempotencyKey) : undefined,
      });
    } catch (dbError) {
      // Catch MongoDB Duplicate Key error (race condition or duplicate retry)
      if (dbError.code === 11000) {
        if (idempotencyKey) {
          for (let attempt = 0; attempt < 10; attempt++) {
            const match = await Appointment.findOne({
              professionalId: profile._id,
              idempotencyKey: String(idempotencyKey),
            });
            if (match) {
              return {
                appointment: match,
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
            await new Promise((r) => setTimeout(r, 60));
          }
        }
        recordBookingFailure(cleanPhone || cleanEmail || bookingData.clientIp);
        const err = new Error('This time slot is already booked. Please select another available time.');
        err.statusCode = 409;
        err.code = 'SLOT_ALREADY_BOOKED';
        err.isOperational = true;
        throw err;
      }
      throw dbError;
    }

  }

  // Dispatch Notifications & Real-Time Socket Events asynchronously
  sendBookingNotifications(appointment, profile).catch((err) =>
    console.error('Async notification error:', err.message)
  );
  emitAppointmentCreated(appointment, profile, matchedUser).catch((err) =>
    console.error('Socket emit error:', err.message)
  );

  return {
    appointment,
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
 * Manual / Walk-In Professional Booking Creation
 * (Supports WALK_IN, PHONE, WHATSAPP, MANUAL with strict conflict protection)
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
    markAsArrived = false,
  } = bookingData;

  const targetDate = date || getDateString(new Date(), profile.timezone || 'Asia/Kolkata');
  const targetTime = time === 'NOW' ? getCurrentTimeString(profile.timezone || 'Asia/Kolkata') : (time || '10:00').trim();

  let duration = customDuration || profile.bookingSettings?.appointmentDuration || 30;
  let buffer = customBuffer !== undefined && customBuffer !== null
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

  const startMinutes = timeToMinutes(targetTime);
  const endMinutes = startMinutes + duration;
  const endTime = minutesToTime(endMinutes);

  // Validate conflict against active appointments and active non-expired holds
  const now = new Date();
  const existingActive = await Appointment.find({
    professionalId: profile._id,
    dateString: targetDate,
    $or: [
      {
        status: {
          $in: ['CONFIRMED', 'PENDING', 'ARRIVED', 'WAITING', 'IN_PROGRESS'],
        },
      },
      {
        status: 'HELD',
        holdExpiresAt: { $gt: now },
      },
    ],
  });

  const slotStartMinutes = startMinutes;
  const slotEndMinutes = endMinutes;
  const slotEndWithBuffer = slotEndMinutes + buffer;

  const hasConflict = existingActive.some((a) => {
    const aStart = timeToMinutes(a.startTime);
    const aEnd = timeToMinutes(a.endTime);
    const aEndWithBuffer = aEnd + (a.buffer || 0);

    // Direct overlap or buffer overlap
    if (doIntervalsOverlap(slotStartMinutes, slotEndMinutes, aStart, aEnd)) return true;
    if (slotStartMinutes < aEndWithBuffer && slotEndMinutes > aStart) return true;
    if (slotStartMinutes < aStart && slotEndWithBuffer > aStart) return true;
    return false;
  });

  if (hasConflict) {
    const err = new Error(
      `Cannot create appointment: ${targetTime} - ${endTime} overlaps with an existing appointment or buffer on this calendar.`
    );
    err.statusCode = 409;
    err.isOperational = true;
    throw err;
  }

  const appointmentCode = generateAppointmentCode();
  const [year, month, day] = targetDate.split('-').map(Number);
  const appointmentDateObj = new Date(Date.UTC(year, month - 1, day));

  const initialStatus = markAsArrived ? 'ARRIVED' : 'CONFIRMED';
  const arrivedTimestamp = markAsArrived ? new Date() : null;

  try {
    const appointment = await Appointment.create({
      appointmentCode,
      professionalId: profile._id,
      appointmentTypeId: resolvedTypeId,
      appointmentTypeName,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: (customerEmail || '').trim(),
      reason: (reason || '').trim(),
      appointmentDate: appointmentDateObj,
      dateString: targetDate,
      startTime: targetTime,
      endTime,
      duration,
      buffer,
      fee,
      currency: profile.currency || 'INR',
      timezone: profile.timezone || 'Asia/Kolkata',
      bookingSource,
      status: initialStatus,
      confirmedAt: new Date(),
      arrivedAt: arrivedTimestamp,
      paymentStatus: fee === 0 ? 'NOT_REQUIRED' : 'PENDING',
      paymentMode: fee === 0 ? 'FREE' : 'PAY_AT_CLINIC',
      notes: notes || '',
    });

    return appointment;
  } catch (dbError) {
    if (dbError.code === 11000) {
      const err = new Error('This time slot is already occupied. Please select another time.');
      err.statusCode = 409;
      err.isOperational = true;
      throw err;
    }
    throw dbError;
  }
};

/**
 * Reschedule Appointment to a new Date & Time with full conflict checking
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

  // Validate conflict against all OTHER active appointments and holds
  const now = new Date();
  const conflicting = await Appointment.find({
    professionalId,
    dateString: targetDate,
    _id: { $ne: appointmentId },
    $or: [
      {
        status: {
          $in: ['CONFIRMED', 'PENDING', 'ARRIVED', 'WAITING', 'IN_PROGRESS'],
        },
      },
      {
        status: 'HELD',
        holdExpiresAt: { $gt: now },
      },
    ],
  });

  const slotStartMinutes = startMinutes;
  const slotEndMinutes = endMinutes;
  const slotEndWithBuffer = slotEndMinutes + buffer;

  const hasConflict = conflicting.some((a) => {
    const aStart = timeToMinutes(a.startTime);
    const aEnd = timeToMinutes(a.endTime);
    const aEndWithBuffer = aEnd + (a.buffer || 0);

    if (doIntervalsOverlap(slotStartMinutes, slotEndMinutes, aStart, aEnd)) return true;
    if (slotStartMinutes < aEndWithBuffer && slotEndMinutes > aStart) return true;
    if (slotStartMinutes < aStart && slotEndWithBuffer > aStart) return true;
    return false;
  });

  if (hasConflict) {
    const err = new Error(
      `Cannot reschedule: ${targetTime} - ${endTime} on ${targetDate} is already booked or blocked.`
    );
    err.statusCode = 409;
    err.isOperational = true;
    throw err;
  }

  const [year, month, day] = targetDate.split('-').map(Number);
  const appointmentDateObj = new Date(Date.UTC(year, month - 1, day));

  appointment.dateString = targetDate;
  appointment.startTime = targetTime;
  appointment.endTime = endTime;
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
        $in: ['CONFIRMED', 'PENDING', 'ARRIVED', 'WAITING', 'IN_PROGRESS'],
      };
    } else if (tab === 'upcoming') {
      filter.dateString = { $gte: todayString };
      filter.status = {
        $in: ['CONFIRMED', 'PENDING', 'ARRIVED', 'WAITING', 'IN_PROGRESS'],
      };
    } else if (tab === 'past') {
      filter.dateString = { $lt: todayString };
    } else if (tab === 'cancelled') {
      filter.status = { $in: ['CANCELLED', 'NO_SHOW'] };
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
    const apptStartMinutes = timeToMinutes(appt.startTime);
    const apptEndMinutes = timeToMinutes(appt.endTime);

    // Dynamic arrival analysis
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

    // Queue Stage Classification
    let queueStage = 'UPCOMING';
    if (appt.status === 'IN_PROGRESS') {
      queueStage = 'NOW';
    } else if (appt.status === 'ARRIVED' || appt.status === 'WAITING') {
      queueStage = 'WAITING';
    } else if (appt.dateString === todayString) {
      if (currentMinutes >= apptStartMinutes && currentMinutes <= apptEndMinutes && appt.status === 'CONFIRMED') {
        queueStage = 'NOW';
      } else if (apptStartMinutes > currentMinutes && apptStartMinutes <= currentMinutes + 45) {
        queueStage = 'NEXT';
      } else if (apptStartMinutes > currentMinutes) {
        queueStage = 'UPCOMING';
      } else {
        queueStage = 'OVERDUE';
      }
    }

    return {
      ...appt,
      arrivalAnalysis,
      queueStage,
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
  } else if (status === 'COMPLETED') {
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
 * Update private clinical/consultation notes
 */
export const updateAppointmentNotes = async (professionalId, appointmentId, notes) => {
  const appointment = await Appointment.findOne({ _id: appointmentId, professionalId }).select('+notes');
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  appointment.notes = notes;
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

  const [
    allAppointments,
    todayRawSchedule,
    profile,
  ] = await Promise.all([
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

  // Enrich today's schedule
  const todaySchedule = todayRawSchedule.map((appt) => {
    const apptStartMinutes = timeToMinutes(appt.startTime);
    const apptEndMinutes = timeToMinutes(appt.endTime);

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
    } else if (currentMinutes >= apptStartMinutes && currentMinutes <= apptEndMinutes && appt.status === 'CONFIRMED') {
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

  // Calculate detailed counts
  const todayCount = todaySchedule.length;
  const waitingCount = todaySchedule.filter((a) => a.status === 'WAITING' || a.status === 'ARRIVED').length;
  const inProgressCount = todaySchedule.filter((a) => a.status === 'IN_PROGRESS').length;
  const completedTodayCount = todaySchedule.filter((a) => a.status === 'COMPLETED').length;
  const noShowTodayCount = todaySchedule.filter((a) => a.status === 'NO_SHOW').length;

  const upcomingCount = allAppointments.filter(
    (a) =>
      a.dateString >= todayString &&
      ['CONFIRMED', 'PENDING', 'ARRIVED', 'WAITING', 'IN_PROGRESS'].includes(a.status)
  ).length;

  const monthCount = allAppointments.filter(
    (a) =>
      a.dateString?.startsWith(monthPrefix) &&
      ['CONFIRMED', 'COMPLETED', 'ARRIVED', 'IN_PROGRESS'].includes(a.status)
  ).length;

  const totalRevenue = allAppointments
    .filter((a) => a.status === 'CONFIRMED' || a.status === 'COMPLETED')
    .reduce((sum, a) => sum + (a.fee || 0), 0);

  const monthRevenue = allAppointments
    .filter(
      (a) =>
        a.dateString?.startsWith(monthPrefix) &&
        (a.status === 'CONFIRMED' || a.status === 'COMPLETED')
    )
    .reduce((sum, a) => sum + (a.fee || 0), 0);

  // 7-day trend
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

  // Service distribution
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

  // Hourly distribution
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
