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
} from '../services/appointmentService.js';
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
    return successResponse(res, 201, 'Appointment confirmed successfully', result);
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
