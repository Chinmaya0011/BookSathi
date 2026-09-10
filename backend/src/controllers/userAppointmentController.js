import { Appointment } from '../models/Appointment.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { AppointmentType } from '../models/AppointmentType.js';
import { getAvailableSlots } from '../services/slotGeneratorService.js';
import {
  emitAppointmentCreated,
  emitAppointmentCancelled,
  emitAppointmentRescheduleRequested,
} from '../socket/socketEmitter.js';
import {
  generateAppointmentCode,
  timeToMinutes,
  minutesToTime,
  getDateString,
} from '../utils/dateHelpers.js';
import {
  checkBookingSpamRules,
  recordBookingFailure,
  recordCancellation,
} from '../services/abuseProtectionService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Authenticated User / Customer Books an Appointment
 */
export const bookAppointment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const idempotencyKey =
      req.headers['idempotency-key'] ||
      req.headers['x-idempotency-key'] ||
      req.body.idempotencyKey;

    const {
      professionalId,
      bookingSlug,
      appointmentTypeId,
      date,
      time,
      startTime,
      reason,
      notes,
      paymentMode = 'ONLINE',
    } = req.body;

    const selectedSlotTime = (time || startTime || '').trim();
    if (!date || !selectedSlotTime) {
      return errorResponse(res, 400, 'Appointment date and start time are required.');
    }

    // 1. Locate Professional Profile
    let profile = null;
    if (professionalId) {
      profile = await ProfessionalProfile.findById(professionalId);
    } else if (bookingSlug) {
      profile = await ProfessionalProfile.findOne({
        bookingSlug: bookingSlug.toLowerCase().trim(),
        isPublic: { $ne: false },
      });
    }

    if (!profile) {
      return errorResponse(res, 404, 'Professional not found or is currently inactive.');
    }

    // Check Idempotency Key
    if (idempotencyKey) {
      const existing = await Appointment.findOne({
        professionalId: profile._id,
        idempotencyKey: String(idempotencyKey),
      });
      if (existing) {
        return successResponse(res, 200, 'Appointment confirmed successfully', {
          appointment: existing,
          professional: {
            id: profile._id,
            name: profile.name,
            profession: profile.profession,
            specialization: profile.specialization,
            bookingSlug: profile.bookingSlug,
            city: profile.city,
            state: profile.state,
            consultationFee: profile.consultationFee,
          },
        });
      }
    }

    // Anti-spam & abuse rules check
    await checkBookingSpamRules({
      userId: req.user._id,
      customerPhone: req.user.phone,
      customerEmail: req.user.email,
      professionalId: profile._id,
      dateString: date,
      startTime: selectedSlotTime,
      clientIp: req.ip || req.headers['x-forwarded-for'] || '',
    });

    // 2. Resolve Service / Appointment Type
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

    // 3. Verify Slot Availability via Slot Engine
    const availabilityResult = await getAvailableSlots(profile, date, duration, buffer);
    const isSlotValid = availabilityResult.slots?.some(
      (s) => s.time === selectedSlotTime && s.available
    );

    if (!isSlotValid) {
      return errorResponse(
        res,
        409,
        'This time slot is no longer available. Please select another available time.'
      );
    }

    // Clean up any expired HELD records for this slot
    await Appointment.deleteMany({
      professionalId: profile._id,
      dateString: date,
      startTime: selectedSlotTime,
      status: 'HELD',
      holdExpiresAt: { $lte: new Date() },
    });

    const startMinutes = timeToMinutes(selectedSlotTime);
    const endMinutes = startMinutes + duration;
    const endTime = minutesToTime(endMinutes);

    const appointmentCode = generateAppointmentCode();
    const [year, month, day] = date.split('-').map(Number);
    const appointmentDate = new Date(Date.UTC(year, month - 1, day));

    let initialPaymentStatus = 'PENDING';
    let effectivePaymentMode = paymentMode;
    if (fee === 0 || paymentMode === 'FREE') {
      initialPaymentStatus = 'NOT_REQUIRED';
      effectivePaymentMode = 'FREE';
    } else if (paymentMode === 'PAY_AT_CLINIC' || paymentMode === 'OFFLINE') {
      initialPaymentStatus = 'PAY_AT_CLINIC';
      effectivePaymentMode = 'PAY_AT_CLINIC';
    }

    // 4. Atomic Database Insert protected by Compound Unique Index
    try {
      const customerName = req.user.name || req.body.customerName || 'Customer';
      const customerPhone = req.user.phone || req.body.customerPhone || '+91 99999 99999';
      const customerEmail = req.user.email || req.body.customerEmail || '';

      const appointment = await Appointment.create({
        appointmentCode,
        userId,
        professionalId: profile._id,
        appointmentTypeId: resolvedTypeId,
        appointmentTypeName,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
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
        status: 'PENDING', // Awaiting professional confirmation
        paymentStatus: initialPaymentStatus,
        paymentMode: effectivePaymentMode,
        notes: (notes || '').trim(),
        idempotencyKey: idempotencyKey ? String(idempotencyKey) : undefined,
      });

      // 5. Broadcast real-time Socket.IO event & persist notifications
      await emitAppointmentCreated(appointment, profile, req.user);

      return successResponse(res, 201, 'Appointment booked successfully!', {
        appointment,
        professional: {
          id: profile._id,
          name: profile.name,
          profession: profile.profession,
          specialization: profile.specialization,
          bookingSlug: profile.bookingSlug,
          city: profile.city,
          state: profile.state,
          consultationFee: profile.consultationFee,
        },
      });
    } catch (dbError) {
      if (dbError.code === 11000) {
        recordBookingFailure(req.user.phone || req.user.email || req.ip);
        return errorResponse(
          res,
          409,
          'This time slot is already booked. Please select another available time.',
          null,
          'SLOT_ALREADY_BOOKED'
        );
      }
      throw dbError;
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Get Authenticated User's Appointments (Upcoming, Pending, History, Cancelled)
 */
export const getMyAppointments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email?.toLowerCase().trim();
    const userPhone = req.user.phone?.trim();
    const { tab = 'all', status, page = 1, limit = 50 } = req.query;

    const userOr = [{ userId }];
    if (userEmail) userOr.push({ customerEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } });
    if (userPhone) {
      const cleanPhone = userPhone.replace(/\D/g, '');
      const last10 = cleanPhone.slice(-10);
      if (last10.length === 10) {
        userOr.push({ customerPhone: { $regex: new RegExp(`${last10}$`) } });
      } else {
        userOr.push({ customerPhone: userPhone });
      }
    }

    // Auto-link any matching unlinked appointments to user account
    if (userOr.length > 1) {
      Appointment.updateMany(
        { $or: userOr.slice(1), $or: [{ userId: { $exists: false } }, { userId: null }] },
        { $set: { userId } }
      ).catch(() => {});
    }

    const todayStr = getDateString(new Date(), 'Asia/Kolkata');

    let tabFilter = {};
    if (status) {
      tabFilter = { status };
    } else if (tab === 'upcoming') {
      tabFilter = {
        dateString: { $gte: todayStr },
        status: { $in: ['CONFIRMED', 'ARRIVED', 'WAITING', 'IN_PROGRESS', 'PENDING', 'RESCHEDULE_REQUESTED'] },
      };
    } else if (tab === 'pending') {
      tabFilter = { status: { $in: ['PENDING', 'RESCHEDULE_REQUESTED'] } };
    } else if (tab === 'history') {
      tabFilter = {
        $or: [
          { status: { $in: ['COMPLETED', 'NO_SHOW'] } },
          { dateString: { $lt: todayStr }, status: { $ne: 'CANCELLED' } },
        ],
      };
    } else if (tab === 'cancelled') {
      tabFilter = { status: { $in: ['CANCELLED', 'REJECTED'] } };
    }

    const filter = {
      $and: [
        { $or: userOr },
        tabFilter,
      ],
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate('professionalId', 'name profession specialization bookingSlug profileImage phone city state consultationFee')
        .populate('appointmentTypeId', 'name duration fee')
        .sort({ dateString: -1, startTime: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    return successResponse(res, 200, 'User appointments retrieved', {
      appointments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * User Cancels Their Appointment
 */
export const cancelUserAppointment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { reason = '' } = req.body;

    const appointment = await Appointment.findOne({ _id: id, userId });
    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found or you do not have permission to cancel it.');
    }

    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(appointment.status)) {
      return errorResponse(res, 400, `Cannot cancel an appointment that is already ${appointment.status}.`);
    }

    appointment.status = 'CANCELLED';
    appointment.cancellationReason = reason;
    appointment.cancelledBy = 'USER';
    appointment.cancelledAt = new Date();
    await appointment.save();

    recordCancellation(userId);

    const profile = await ProfessionalProfile.findById(appointment.professionalId);
    if (profile) {
      await emitAppointmentCancelled(appointment, profile, 'USER', reason);
    }

    return successResponse(res, 200, 'Appointment cancelled successfully', appointment);
  } catch (err) {
    next(err);
  }
};

/**
 * User Requests Reschedule for Their Appointment
 */
export const requestReschedule = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { requestedDate, requestedTime, reason = '' } = req.body;

    if (!requestedDate || !requestedTime) {
      return errorResponse(res, 400, 'New requested date and time are required.');
    }

    const appointment = await Appointment.findOne({ _id: id, userId });
    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found.');
    }

    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(appointment.status)) {
      return errorResponse(res, 400, `Cannot reschedule an appointment that is already ${appointment.status}.`);
    }

    appointment.status = 'RESCHEDULE_REQUESTED';
    appointment.rescheduleRequest = {
      requestedDate: requestedDate.trim(),
      requestedTime: requestedTime.trim(),
      requestedBy: 'USER',
      reason: reason.trim(),
      requestedAt: new Date(),
    };
    await appointment.save();

    const profile = await ProfessionalProfile.findById(appointment.professionalId);
    if (profile) {
      await emitAppointmentRescheduleRequested(appointment, profile, appointment.rescheduleRequest);
    }

    return successResponse(res, 200, 'Reschedule request submitted to the professional', appointment);
  } catch (err) {
    next(err);
  }
};
