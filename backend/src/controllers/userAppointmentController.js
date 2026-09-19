import { Appointment } from '../models/Appointment.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { createPublicBooking } from '../services/appointmentService.js';
import { toUserAppointment } from '../serializers/appointmentSerializer.js';
import {
  emitAppointmentCancelled,
  emitAppointmentRescheduleRequested,
} from '../socket/socketEmitter.js';
import { recordCancellation } from '../services/abuseProtectionService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { getDateString } from '../utils/dateHelpers.js';

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
      holdToken,
    } = req.body;

    const selectedSlotTime = (time || startTime || '').trim();
    if (!date || !selectedSlotTime) {
      return errorResponse(res, 400, 'Appointment date and start time are required.');
    }

    // Locate Professional Profile
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

    const customerName = req.user.name || req.body.customerName || 'Customer';
    const customerPhone = req.user.phone || req.body.customerPhone || '+91 99999 99999';
    const customerEmail = req.user.email || req.body.customerEmail || '';

    const bookingResult = await createPublicBooking(profile.bookingSlug, {
      date,
      startTime: selectedSlotTime,
      appointmentTypeId,
      customerName,
      customerPhone,
      customerEmail,
      userId,
      reason,
      notes,
      paymentMode,
      holdToken,
      idempotencyKey,
      clientIp: req.ip || req.headers['x-forwarded-for'] || '',
    });

    return successResponse(res, 201, 'Appointment booked successfully!', {
      appointment: toUserAppointment(bookingResult.appointment),
      professional: bookingResult.professional,
    });
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

    // Auto-link matching unlinked appointments for this verified user
    if (userOr.length > 1) {
      Appointment.updateMany(
        {
          $and: [
            { $or: userOr.slice(1) },
            { $or: [{ userId: { $exists: false } }, { userId: null }] },
          ],
        },
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
        .select('-notes -notesUpdatedAt -notesUpdatedBy -cancelTokenHash -cancelAttempts -lastCancelAttemptAt')
        .populate('professionalId', 'name profession specialization bookingSlug profileImage phone city state consultationFee')
        .populate('appointmentTypeId', 'name duration fee')
        .sort({ dateString: -1, startTime: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    const sanitizedAppointments = appointments.map(toUserAppointment);

    return successResponse(res, 200, 'User appointments retrieved', {
      appointments: sanitizedAppointments,
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

    const appointment = await Appointment.findOne({ _id: id, userId }).select(
      '-notes -notesUpdatedAt -notesUpdatedBy -cancelTokenHash'
    );
    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found or you do not have permission to cancel it.');
    }

    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(appointment.status)) {
      return errorResponse(res, 400, `Cannot cancel an appointment that is already ${appointment.status}.`);
    }

    const profile = await ProfessionalProfile.findById(appointment.professionalId);

    // Enforce professional cancellation notice window
    const minNoticeMinutes = profile?.bookingSettings?.minNoticeMinutes ?? 0;
    if (minNoticeMinutes > 0 && appointment.startAt) {
      const now = new Date();
      const diffMinutes = Math.floor((new Date(appointment.startAt) - now) / (1000 * 60));
      if (diffMinutes < minNoticeMinutes) {
        return errorResponse(
          res,
          400,
          `Cancellations must be made at least ${minNoticeMinutes} minutes before scheduled appointment time.`
        );
      }
    }

    appointment.status = 'CANCELLED';
    appointment.cancellationReason = reason;
    appointment.cancelledBy = 'USER';
    appointment.cancelledAt = new Date();
    await appointment.save();

    recordCancellation(userId);

    if (profile) {
      await emitAppointmentCancelled(appointment, profile, 'USER', reason);
    }

    return successResponse(res, 200, 'Appointment cancelled successfully', toUserAppointment(appointment));
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

    const appointment = await Appointment.findOne({ _id: id, userId }).select(
      '-notes -notesUpdatedAt -notesUpdatedBy -cancelTokenHash'
    );
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

    return successResponse(
      res,
      200,
      'Reschedule request submitted to the professional',
      toUserAppointment(appointment)
    );
  } catch (err) {
    next(err);
  }
};
