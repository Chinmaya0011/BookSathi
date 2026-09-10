import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { Availability } from '../models/Availability.js';
import { AppointmentType } from '../models/AppointmentType.js';
import { getDashboardStats } from '../services/appointmentService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await ProfessionalProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return errorResponse(res, 404, 'Professional profile not found');
    }
    return successResponse(res, 200, 'Profile retrieved', profile);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const profile = await ProfessionalProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    return successResponse(res, 200, 'Profile updated successfully', profile);
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const profile = req.profile || (await ProfessionalProfile.findOne({ userId: req.user._id }));
    if (!profile) {
      return successResponse(res, 200, 'Dashboard stats retrieved', {
        todayAppointments: 0,
        upcomingCount: 0,
        monthCount: 0,
        totalCount: 0,
        todaySchedule: [],
        revenueMonth: 0,
        chartData: [],
      });
    }
    const stats = await getDashboardStats(profile._id, profile.timezone);
    return successResponse(res, 200, 'Dashboard stats retrieved', stats);
  } catch (err) {
    next(err);
  }
};

export const getSetupStatus = async (req, res, next) => {
  try {
    const profile = req.profile || (await ProfessionalProfile.findOne({ userId: req.user._id }));
    if (!profile) {
      return successResponse(res, 200, 'Setup status retrieved', {
        isSetupComplete: false,
        hasAvailability: false,
        hasServices: false,
        hasProfileDetails: false,
        pendingItems: [
          {
            id: 'profile',
            title: 'Clinic & Specialization Details',
            path: '/dashboard/profile',
            actionText: 'Profile Complete Karein',
          },
        ],
        message: 'Aapka profile abhi create nahi hua hai. Profile details update karein.',
        primaryActionPath: '/dashboard/profile',
        primaryActionText: 'Complete Setup Now',
      });
    }

    const [availability, appointmentTypes] = await Promise.all([
      Availability.find({ professionalId: profile._id }),
      AppointmentType.find({ professionalId: profile._id }),
    ]);

    // Check Weekly Availability: at least one day enabled with valid time ranges
    const hasAvailability = availability.some(
      (day) => day.enabled && Array.isArray(day.timeRanges) && day.timeRanges.length > 0
    );

    // Check Services & Pricing: at least one enabled appointment type
    const hasServices = appointmentTypes.some((type) => type.enabled);

    // Check Basic Profile: Has specialization and address or business name
    const hasProfileDetails = Boolean(
      profile.specialization &&
      (profile.address || profile.businessName || profile.city)
    );

    const isSetupComplete = hasAvailability && hasServices && hasProfileDetails;

    // Build structured pending items
    const pendingItems = [];
    if (!hasServices) {
      pendingItems.push({
        id: 'services',
        title: 'Consultation Services & Pricing',
        path: '/dashboard/services',
        actionText: 'Services Add Karein',
      });
    }
    if (!hasAvailability) {
      pendingItems.push({
        id: 'availability',
        title: 'Weekly Availability',
        path: '/dashboard/availability',
        actionText: 'Availability Set Karein',
      });
    }
    if (!hasProfileDetails) {
      pendingItems.push({
        id: 'profile',
        title: 'Practice & Specialization Details',
        path: '/dashboard/profile',
        actionText: 'Profile Complete Karein',
      });
    }

    // Generate accurate Hinglish message
    let message = '';
    let primaryActionPath = '/dashboard';
    let primaryActionText = 'Setup Karein';

    if (!hasServices && !hasAvailability && !hasProfileDetails) {
      message = 'Aapka profile abhi complete nahi hai. Services & Pricing, Weekly Availability aur Profile Details complete karein taaki aap appointments start kar sakein.';
      primaryActionPath = '/dashboard/services';
      primaryActionText = 'Complete Setup Now';
    } else if (!hasServices && !hasAvailability) {
      message = 'Aapka profile abhi complete nahi hai. Services & Pricing aur Weekly Availability complete karein taaki aap appointments start kar sakein.';
      primaryActionPath = '/dashboard/services';
      primaryActionText = 'Complete Services & Availability';
    } else if (!hasAvailability) {
      message = 'Aapki Weekly Availability set nahi hai. Apne working days aur time slots set karein taaki clients appointments book kar sakein.';
      primaryActionPath = '/dashboard/availability';
      primaryActionText = 'Set Weekly Availability';
    } else if (!hasServices) {
      message = 'Aapke Services & Tariffs add nahi hain. Kam se kam ek service add karein taaki booking link activate ho sake.';
      primaryActionPath = '/dashboard/services';
      primaryActionText = 'Add Service';
    } else if (!hasProfileDetails) {
      message = 'Aapka Address & Specialization abhi complete nahi hai. Profile details update karein taaki clients ko clear info mile.';
      primaryActionPath = '/dashboard/profile';
      primaryActionText = 'Update Profile Details';
    }

    return successResponse(res, 200, 'Setup status retrieved', {
      isSetupComplete,
      hasAvailability,
      hasServices,
      hasProfileDetails,
      pendingItems,
      message,
      primaryActionPath,
      primaryActionText,
    });
  } catch (err) {
    next(err);
  }
};

