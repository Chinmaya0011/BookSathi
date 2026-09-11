import mongoose from 'mongoose';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { AppointmentType } from '../models/AppointmentType.js';
import { Appointment } from '../models/Appointment.js';
import {
  getAvailableSlots,
  getMonthlyAvailabilityOverview,
} from '../services/slotGeneratorService.js';
import {
  createPublicBooking,
  holdPublicSlot,
  releasePublicSlotHold,
  lookupAppointmentsByPhone,
  getRebookingDetails,
  getBookingChallengeService,
  cancelPublicBookingService,
  requestPublicRescheduleService,
} from '../services/appointmentService.js';
import { toPublicAppointment } from '../serializers/appointmentSerializer.js';
import { otpService } from '../services/otpService.js';
import { createIcsCalendarEvent } from '../services/icsService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * List / Browse All Verified Public Professionals with Search & Filters
 */
export const listProfessionals = async (req, res, next) => {
  try {
    const { search, profession, city, minFee, maxFee, page = 1, limit = 20 } = req.query;

    const filter = { isPublic: { $ne: false } };

    if (profession && profession !== 'ALL') {
      filter.profession = new RegExp(profession, 'i');
    }

    if (city && city !== 'ALL') {
      filter.city = new RegExp(city, 'i');
    }

    if (minFee || maxFee) {
      filter.consultationFee = {};
      if (minFee) filter.consultationFee.$gte = Number(minFee);
      if (maxFee) filter.consultationFee.$lte = Number(maxFee);
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { profession: regex },
        { specialization: regex },
        { city: regex },
        { businessName: regex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [professionals, total] = await Promise.all([
      ProfessionalProfile.find(filter)
        .select(
          'name profession specialization bio city state address profileImage consultationFee currency bookingSlug languages yearsOfExperience isVerified rating totalReviews'
        )
        .sort({ isVerified: -1, rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      ProfessionalProfile.countDocuments(filter),
    ]);

    return successResponse(res, 200, 'Professionals list retrieved', {
      professionals,
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
 * Get Public Professional Profile & Services
 */
export const getPublicProfile = async (req, res, next) => {
  try {
    const slug = (req.params.slug || '').trim().toLowerCase();
    
    let query = { bookingSlug: slug, isPublic: { $ne: false } };
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = { $or: [{ bookingSlug: slug }, { _id: slug }], isPublic: { $ne: false } };
    }

    const profile = await ProfessionalProfile.findOne(query);

    if (!profile) {
      return errorResponse(res, 404, 'Professional not found or profile is private');
    }

    const appointmentTypes = await AppointmentType.find({
      professionalId: profile._id,
      enabled: true,
    }).select('name description duration bufferTime fee consultationType onlineAvailable offlineAvailable enabled isDefault');

    // Only expose safe public fields
    const publicData = {
      _id: profile._id,
      name: profile.name,
      profession: profile.profession,
      specialization: profile.specialization,
      bio: profile.bio,
      city: profile.city,
      state: profile.state,
      address: profile.address,
      googleMapUrl: profile.googleMapUrl || '',
      profileImage: profile.profileImage,
      consultationFee: profile.consultationFee,
      isVerified: profile.isVerified,
      bookingSlug: profile.bookingSlug,
      languages: profile.languages,
      experienceYears: profile.yearsOfExperience || profile.experienceYears,
      appointmentTypes,
      bookingSettings: {
        appointmentDuration: profile.bookingSettings?.appointmentDuration || 30,
        bufferTime: profile.bookingSettings?.bufferTime ?? 10,
        minNoticeMinutes: profile.bookingSettings?.minNoticeMinutes ?? 0,
        maxAdvanceDays: profile.bookingSettings?.maxAdvanceDays || 60,
        allowSameDayBooking: profile.bookingSettings?.allowSameDayBooking !== false,
        timezone: profile.timezone || 'Asia/Kolkata',
      },
    };

    return successResponse(res, 200, 'Public profile retrieved', publicData);
  } catch (err) {
    next(err);
  }
};

/**
 * Get Monthly Availability Overview
 */
export const getPublicAvailability = async (req, res, next) => {
  try {
    const slug = (req.params.slug || '').trim().toLowerCase();
    const { year, month } = req.query;

    let query = { bookingSlug: slug, isPublic: { $ne: false } };
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = { $or: [{ bookingSlug: slug }, { _id: slug }], isPublic: { $ne: false } };
    }

    const profile = await ProfessionalProfile.findOne(query);
    if (!profile) {
      return errorResponse(res, 404, 'Professional not found');
    }

    const now = new Date();
    const targetYear = Number(year) || now.getFullYear();
    const targetMonth = Number(month) || now.getMonth() + 1;

    const overview = await getMonthlyAvailabilityOverview(profile, targetYear, targetMonth);
    return successResponse(res, 200, 'Monthly availability overview', overview);
  } catch (err) {
    next(err);
  }
};

/**
 * Get Slots for a Specific Date
 */
export const getPublicSlots = async (req, res, next) => {
  try {
    const slug = (req.params.slug || '').trim().toLowerCase();
    const { date, appointmentTypeId } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse(res, 400, 'Valid date parameter in YYYY-MM-DD format is required');
    }

    let query = { bookingSlug: slug, isPublic: { $ne: false } };
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = { $or: [{ bookingSlug: slug }, { _id: slug }], isPublic: { $ne: false } };
    }

    const profile = await ProfessionalProfile.findOne(query);
    if (!profile) {
      return errorResponse(res, 404, 'Professional not found');
    }

    let duration = profile.bookingSettings?.appointmentDuration || 30;
    let buffer = profile.bookingSettings?.bufferTime ?? 10;

    if (appointmentTypeId) {
      if (mongoose.Types.ObjectId.isValid(appointmentTypeId)) {
        const type = await AppointmentType.findOne({
          _id: appointmentTypeId,
          professionalId: profile._id,
          enabled: true,
        });
        if (type) {
          duration = type.duration;
          if (type.bufferTime !== null && type.bufferTime !== undefined) {
            buffer = type.bufferTime;
          }
        }
      } else if (!isNaN(Number(appointmentTypeId)) && Number(appointmentTypeId) > 0) {
        duration = Number(appointmentTypeId);
      }
    }

    const slotsData = await getAvailableSlots(profile, date, duration, buffer);
    return successResponse(res, 200, 'Available slots retrieved', slotsData);
  } catch (err) {
    next(err);
  }
};

/**
 * Temporary Hold on Slot
 */
export const holdSlotPublic = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const holdData = {
      ...req.body,
      clientIp: req.ip || req.headers['x-forwarded-for'] || '',
    };
    const result = await holdPublicSlot(slug, holdData);
    return successResponse(res, 200, 'Slot held temporarily for 5 minutes', result);
  } catch (err) {
    next(err);
  }
};

/**
 * Release Temporary Hold
 */
export const releaseHoldPublic = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { holdToken } = req.body;
    const result = await releasePublicSlotHold(slug, holdToken);
    return successResponse(res, 200, 'Slot hold released', result);
  } catch (err) {
    next(err);
  }
};

/**
 * Book Appointment Publicly
 */
export const bookPublicAppointment = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const idempotencyKey =
      req.headers['idempotency-key'] ||
      req.headers['x-idempotency-key'] ||
      req.body.idempotencyKey;

    const bookingData = {
      ...req.body,
      userId: req.user?._id || req.body.userId,
      idempotencyKey: idempotencyKey ? String(idempotencyKey) : undefined,
      clientIp: req.ip || req.headers['x-forwarded-for'] || '',
    };
    const result = await createPublicBooking(slug, bookingData);
    return successResponse(res, 201, 'Appointment confirmed successfully', {
      ...result,
      appointment: toPublicAppointment(result.appointment),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Download .ICS Calendar Invite for an Appointment
 */
export const downloadIcsCalendar = async (req, res, next) => {
  try {
    const { slug, code } = req.params;
    const profile = await ProfessionalProfile.findOne({ bookingSlug: slug });
    if (!profile) {
      return errorResponse(res, 404, 'Professional not found');
    }

    const appointment = await Appointment.findOne({
      appointmentCode: code,
      professionalId: profile._id,
    });

    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found');
    }

    const icsContent = await createIcsCalendarEvent(appointment, profile);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="appointment-${appointment.appointmentCode}.ics"`
    );
    return res.send(icsContent);
  } catch (err) {
    next(err);
  }
};

/**
 * Zero-Login Customer Booking Lookup by Phone Number
 */
export const lookupAppointments = async (req, res, next) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return errorResponse(res, 400, 'Please provide a 10-digit phone number');
    }
    const rawAppointments = await lookupAppointmentsByPhone(phone);
    const appointments = rawAppointments.map(toPublicAppointment);
    return successResponse(res, 200, 'Appointments retrieved', { appointments });
  } catch (err) {
    next(err);
  }
};

/**
 * 1-Tap "Book Again" Helper: Get Re-booking details for customer
 */
export const rebookAppointment = async (req, res, next) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return errorResponse(res, 400, 'Please provide a 10-digit phone number');
    }
    const details = await getRebookingDetails(phone);
    return successResponse(res, 200, 'Rebooking details retrieved', details);
  } catch (err) {
    next(err);
  }
};

/**
 * Public Booking Challenge: GET /api/public/booking/:code/challenge
 */
export const getBookingChallenge = async (req, res, next) => {
  try {
    const { code } = req.params;
    const cancelToken =
      req.query.token ||
      req.query.cancelToken ||
      req.headers['x-cancel-token'] ||
      req.body?.token;
    const manageSessionToken =
      req.headers['x-manage-session-token'] ||
      req.headers.authorization ||
      req.query.sessionToken ||
      req.body?.manageSessionToken;

    const result = await getBookingChallengeService({
      appointmentCode: code,
      cancelToken,
      manageSessionToken,
      user: req.user,
    });

    return successResponse(res, 200, 'Booking challenge info retrieved', result);
  } catch (err) {
    next(err);
  }
};

/**
 * Send OTP to customer phone: POST /api/public/booking/:code/otp
 */
export const sendBookingOtp = async (req, res, next) => {
  try {
    const { code } = req.params;
    const appointment = await Appointment.findOne({ appointmentCode: code });
    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found with the provided code');
    }

    const result = await otpService.sendBookingOtp({
      appointmentCode: code,
      customerPhone: appointment.customerPhone,
    });

    return successResponse(res, 200, result.message, result);
  } catch (err) {
    next(err);
  }
};

/**
 * Verify OTP: POST /api/public/booking/:code/verify-otp
 */
export const verifyBookingOtp = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return errorResponse(res, 400, 'Verification code (OTP) is required.');
    }

    const result = await otpService.verifyBookingOtp({
      appointmentCode: code,
      otp,
    });

    return successResponse(res, 200, 'OTP verified successfully', result);
  } catch (err) {
    next(err);
  }
};

/**
 * Public Cancel: POST /api/public/booking/:code/cancel
 */
export const cancelPublicBooking = async (req, res, next) => {
  try {
    const { code } = req.params;
    const cancelToken =
      req.body.token ||
      req.body.cancelToken ||
      req.query.token ||
      req.headers['x-cancel-token'];
    const otp = req.body.otp;
    const manageSessionToken =
      req.headers['x-manage-session-token'] ||
      req.headers.authorization ||
      req.body.manageSessionToken;
    const { reason } = req.body;

    const result = await cancelPublicBookingService({
      appointmentCode: code,
      cancelToken,
      otp,
      manageSessionToken,
      reason,
      clientIp: req.ip || req.headers['x-forwarded-for'] || '',
      user: req.user,
    });

    return successResponse(res, 200, result.message, result);
  } catch (err) {
    next(err);
  }
};

/**
 * Public Reschedule Request: POST /api/public/booking/:code/reschedule-request
 */
export const requestPublicReschedule = async (req, res, next) => {
  try {
    const { code } = req.params;
    const cancelToken =
      req.body.token ||
      req.body.cancelToken ||
      req.query.token ||
      req.headers['x-cancel-token'];
    const otp = req.body.otp;
    const manageSessionToken =
      req.headers['x-manage-session-token'] ||
      req.headers.authorization ||
      req.body.manageSessionToken;
    const newDate = req.body.newDate || req.body.requestedDate;
    const newTime = req.body.newTime || req.body.requestedTime;
    const { reason } = req.body;

    const result = await requestPublicRescheduleService({
      appointmentCode: code,
      cancelToken,
      otp,
      manageSessionToken,
      newDate,
      newTime,
      reason,
      clientIp: req.ip || req.headers['x-forwarded-for'] || '',
      user: req.user,
    });

    return successResponse(res, 200, result.message, result);
  } catch (err) {
    next(err);
  }
};

