import { Grievance } from '../models/Grievance.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { successResponse, errorResponse } from '../utils/response.js';

const generateTicketId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `GRV-${randomNum}`;
};

/**
 * Submit a new grievance (Public or Authenticated)
 */
export const createGrievance = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      category,
      priority,
      subject,
      description,
      referenceCode,
      userType,
    } = req.body;

    if (!name || !email || !subject || !description) {
      return errorResponse(res, 400, 'Please provide name, email, subject, and description');
    }

    let resolvedUserType = userType || 'CUSTOMER';
    let userId = null;
    let professionalId = null;

    if (req.user) {
      userId = req.user._id;
      if (req.user.role === 'PROFESSIONAL') {
        resolvedUserType = 'PROFESSIONAL';
        const profile = await ProfessionalProfile.findOne({ userId: req.user._id });
        if (profile) {
          professionalId = profile._id;
        }
      }
    }

    const ticketId = generateTicketId();

    const grievance = await Grievance.create({
      ticketId,
      userType: resolvedUserType,
      userId,
      professionalId,
      name,
      email,
      phone: phone || '',
      category: category || 'OTHER',
      priority: priority || 'MEDIUM',
      subject,
      description,
      referenceCode: referenceCode || '',
      status: 'OPEN',
    });

    return successResponse(res, 201, 'Grievance submitted successfully. Our administration team has been notified.', grievance);
  } catch (err) {
    next(err);
  }
};

/**
 * Get grievances submitted by current authenticated professional / user
 */
export const getMyGrievances = async (req, res, next) => {
  try {
    const filter = {
      $or: [{ userId: req.user._id }, { email: req.user.email }],
    };

    const grievances = await Grievance.find(filter).sort({ createdAt: -1 });

    return successResponse(res, 200, 'User grievances retrieved', grievances);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get all grievances with filters, search, and pagination
 */
export const getAllGrievances = async (req, res, next) => {
  try {
    const {
      status,
      category,
      priority,
      userType,
      search,
      page = 1,
      limit = 30,
    } = req.query;

    const filter = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    if (priority && priority !== 'ALL') {
      filter.priority = priority;
    }

    if (userType && userType !== 'ALL') {
      filter.userType = userType;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { ticketId: regex },
        { name: regex },
        { email: regex },
        { subject: regex },
        { referenceCode: regex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [grievances, total] = await Promise.all([
      Grievance.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Grievance.countDocuments(filter),
    ]);

    return successResponse(res, 200, 'All grievances retrieved for admin', {
      grievances,
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
 * Admin: Get grievance overview statistics
 */
export const getGrievanceStats = async (req, res, next) => {
  try {
    const [total, openCount, inProgressCount, resolvedCount, urgentCount, recentTickets] = await Promise.all([
      Grievance.countDocuments(),
      Grievance.countDocuments({ status: 'OPEN' }),
      Grievance.countDocuments({ status: 'IN_PROGRESS' }),
      Grievance.countDocuments({ status: 'RESOLVED' }),
      Grievance.countDocuments({ priority: 'URGENT', status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
      Grievance.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const categories = await Grievance.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return successResponse(res, 200, 'Grievance statistics retrieved', {
      total,
      openCount,
      inProgressCount,
      resolvedCount,
      urgentCount,
      categories,
      recentTickets,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Update grievance status and admin resolution response
 */
export const updateGrievanceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const grievance = await Grievance.findById(id);
    if (!grievance) {
      return errorResponse(res, 404, 'Grievance ticket not found');
    }

    if (status) {
      grievance.status = status;
      if (status === 'RESOLVED' || status === 'CLOSED') {
        grievance.resolvedBy = req.user._id;
        grievance.resolvedAt = new Date();
      }
    }

    if (adminResponse !== undefined) {
      grievance.adminResponse = adminResponse;
    }

    await grievance.save();

    return successResponse(res, 200, 'Grievance ticket updated successfully', grievance);
  } catch (err) {
    next(err);
  }
};
