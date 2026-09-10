import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { Availability } from '../models/Availability.js';
import { AppointmentType } from '../models/AppointmentType.js';
import { errorResponse } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return errorResponse(res, 401, 'Authentication token missing. Please log in.');
    }

    const secret = process.env.JWT_SECRET || 'booksaathi_jwt_super_secret_key_2026_indian_professionals';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return errorResponse(res, 401, 'User account not found or inactive.');
    }

    let profile = await ProfessionalProfile.findOne({ userId: user._id });
    if (!profile && user.email) {
      profile = await ProfessionalProfile.findOne({ email: user.email.toLowerCase() });
      if (profile) {
        profile.userId = user._id;
        await profile.save();
      }
    }

    if (!profile && user.role === 'PROFESSIONAL') {
      try {
        let baseSlug = (user.email.split('@')[0] || 'pro').toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (baseSlug.length < 3) baseSlug = 'pro-' + Math.floor(1000 + Math.random() * 9000);
        let uniqueSlug = baseSlug;
        let counter = 1;
        while (await ProfessionalProfile.findOne({ bookingSlug: uniqueSlug })) {
          uniqueSlug = `${baseSlug}-${counter}`;
          counter++;
        }

        profile = await ProfessionalProfile.create({
          userId: user._id,
          name: user.email.split('@')[0] || 'Professional',
          email: user.email,
          phone: '+91 99999 99999',
          profession: 'Doctor',
          specialization: 'General Practice',
          city: 'Bhubaneswar',
          state: 'Odisha',
          bookingSlug: uniqueSlug,
          consultationFee: 500,
          languages: ['English', 'Hindi'],
          yearsOfExperience: 5,
          isPublic: true,
        });

        const availabilityDocs = [];
        for (let day = 0; day <= 6; day++) {
          const isWeekend = day === 0;
          const isSaturday = day === 6;
          let timeRanges = [];
          if (!isWeekend) {
            if (isSaturday) {
              timeRanges = [{ startTime: '10:00', endTime: '14:00' }];
            } else {
              timeRanges = [
                { startTime: '09:00', endTime: '13:00' },
                { startTime: '17:00', endTime: '20:00' },
              ];
            }
          }
          availabilityDocs.push({
            professionalId: profile._id,
            dayOfWeek: day,
            enabled: !isWeekend,
            timeRanges,
          });
        }
        await Availability.insertMany(availabilityDocs);

        await AppointmentType.create({
          professionalId: profile._id,
          name: 'General Consultation',
          description: 'Standard consultation session',
          duration: 30,
          fee: 500,
          onlineAvailable: true,
          offlineAvailable: true,
          isDefault: true,
          enabled: true,
        });
      } catch (profileErr) {
        console.error('Error auto-creating profile in authMiddleware:', profileErr);
      }
    }

    req.user = user;
    req.profile = profile || null;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Invalid or expired authentication session. Please log in again.');
    }
    return errorResponse(res, 500, 'Authentication error: ' + error.message);
  }
};

/**
 * Optional authentication: if token is present, populate req.user, else continue.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const secret = process.env.JWT_SECRET || 'booksaathi_jwt_super_secret_key_2026_indian_professionals';
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
        req.profile = await ProfessionalProfile.findOne({ userId: user._id });
      }
    }
    next();
  } catch (err) {
    // Continue without req.user
    next();
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return errorResponse(res, 403, 'Access denied. Administrator privileges required.');
  }
  next();
};

export const requireSuperAdmin = requireAdmin;
