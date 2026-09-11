import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { isValidSlug } from '../utils/slugify.js';
import { isReservedSlug } from '../utils/reservedSlugs.js';
import { getProfessionalPublicUrl } from '../utils/urlHelpers.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getBookingLinkDetails = async (req, res, next) => {
  try {
    const profile = await ProfessionalProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return errorResponse(res, 404, 'Profile not found');
    }

    const bookingUrl = getProfessionalPublicUrl(profile.bookingSlug);
    const whatsappTemplate = encodeURIComponent(
      `Hi! You can book an appointment directly with me here:\n${bookingUrl}`
    );

    return successResponse(res, 200, 'Booking link details', {
      bookingSlug: profile.bookingSlug,
      bookingUrl,
      whatsappShareUrl: `https://wa.me/?text=${whatsappTemplate}`,
      isPublic: profile.isPublic,
    });
  } catch (err) {
    next(err);
  }
};

export const checkSlugAvailability = async (req, res, next) => {
  try {
    const { slug } = req.query;
    if (!slug || !isValidSlug(slug)) {
      return errorResponse(
        res,
        400,
        'Invalid slug. Must be 3-50 lowercase alphanumeric characters or hyphens.'
      );
    }

    const cleanSlug = slug.toLowerCase().trim();

    if (isReservedSlug(cleanSlug)) {
      return successResponse(res, 200, 'Slug checked', {
        slug: cleanSlug,
        isAvailable: false,
        isReserved: true,
        message: 'This name is reserved by the system. Please choose another username.',
      });
    }

    const query = { bookingSlug: cleanSlug };
    if (req.user?._id) {
      query.userId = { $ne: req.user._id };
    }

    const existing = await ProfessionalProfile.findOne(query);

    return successResponse(res, 200, 'Slug checked', {
      slug: cleanSlug,
      isAvailable: !existing,
      isReserved: false,
      message: existing ? 'This username is already taken.' : 'Username is available!',
    });
  } catch (err) {
    next(err);
  }
};

export const updateBookingSlug = async (req, res, next) => {
  try {
    const { bookingSlug } = req.body;
    if (!bookingSlug) {
      return errorResponse(res, 400, 'Booking slug is required');
    }

    const cleanSlug = bookingSlug.toLowerCase().trim();

    if (!isValidSlug(cleanSlug)) {
      return errorResponse(
        res,
        400,
        'Invalid slug. Must be 3-50 lowercase alphanumeric characters or hyphens.'
      );
    }

    if (isReservedSlug(cleanSlug)) {
      return errorResponse(
        res,
        400,
        'This name is reserved for system use. Please choose another custom username.'
      );
    }

    const existing = await ProfessionalProfile.findOne({
      bookingSlug: cleanSlug,
      userId: { $ne: req.user._id },
    });

    if (existing) {
      return errorResponse(res, 409, 'This booking link is already taken. Please choose another.');
    }

    const updated = await ProfessionalProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { bookingSlug: cleanSlug } },
      { new: true }
    );

    const bookingUrl = getProfessionalPublicUrl(updated.bookingSlug);

    return successResponse(res, 200, 'Booking link updated successfully', {
      bookingSlug: updated.bookingSlug,
      bookingUrl,
    });
  } catch (err) {
    next(err);
  }
};
