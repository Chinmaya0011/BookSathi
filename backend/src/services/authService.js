import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { Availability } from '../models/Availability.js';
import { AppointmentType } from '../models/AppointmentType.js';
import { slugify } from '../utils/slugify.js';
import { isReservedSlug } from '../utils/reservedSlugs.js';

export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'booksaathi_jwt_super_secret_key_2026_indian_professionals';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

/**
 * Register a Customer / User account
 */
export const registerCustomer = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    error.isOperational = true;
    throw error;
  }

  const user = await User.create({
    name: (userData.name || '').trim(),
    phone: (userData.phone || '').trim(),
    email: userData.email.toLowerCase().trim(),
    password: userData.password,
    role: 'USER',
    timezone: userData.timezone || 'Asia/Kolkata',
  });

  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      timezone: user.timezone,
    },
    token,
  };
};

/**
 * Register a new professional user and automatically set up initial profile,
 * default Monday-Saturday availability, and default appointment type.
 */
export const registerProfessional = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    error.isOperational = true;
    throw error;
  }

  // Generate unique initial booking slug
  let baseSlug = slugify(userData.name);
  if (!baseSlug || baseSlug.length < 3 || isReservedSlug(baseSlug)) {
    baseSlug = baseSlug && !isReservedSlug(baseSlug) ? baseSlug : `${baseSlug || 'pro'}-consultant`;
  }
  if (isReservedSlug(baseSlug)) {
    baseSlug = `pro-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  let uniqueSlug = baseSlug;
  let counter = 1;
  while (isReservedSlug(uniqueSlug) || (await ProfessionalProfile.findOne({ bookingSlug: uniqueSlug }))) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create User
  const user = await User.create({
    name: userData.name,
    phone: userData.phone,
    email: userData.email.toLowerCase().trim(),
    password: userData.password,
    role: 'PROFESSIONAL',
    timezone: userData.timezone || 'Asia/Kolkata',
  });

  // Create Professional Profile
  const profile = await ProfessionalProfile.create({
    userId: user._id,
    name: userData.name,
    email: userData.email.toLowerCase().trim(),
    phone: userData.phone,
    profession: userData.profession || 'Doctor',
    specialization: userData.specialization || '',
    city: userData.city || 'Bhubaneswar',
    state: userData.state || 'Odisha',
    bookingSlug: uniqueSlug,
    consultationFee: userData.consultationFee || 500,
    languages: userData.languages || ['English', 'Hindi'],
    yearsOfExperience: userData.yearsOfExperience || 5,
    isPublic: true,
  });

  // Create default Weekly Availability (Monday to Saturday: 09:00 - 13:00, 17:00 - 20:00)
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

  // Create default Appointment Type
  await AppointmentType.create({
    professionalId: profile._id,
    name: 'General Consultation',
    description: 'Standard consultation session',
    duration: 30,
    fee: userData.consultationFee || 500,
    onlineAvailable: true,
    offlineAvailable: true,
    isDefault: true,
    enabled: true,
  });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      timezone: user.timezone,
    },
    profile,
    token,
  };
};

/**
 * Universal Login for any role (USER, PROFESSIONAL, ADMIN)
 */
export const loginUser = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  const isMatch = await user.comparePassword(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Please contact support.');
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  let profile = null;
  if (user.role === 'PROFESSIONAL') {
    profile = await ProfessionalProfile.findOne({ userId: user._id });
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name || (profile ? profile.name : ''),
      email: user.email,
      phone: user.phone || (profile ? profile.phone : ''),
      role: user.role,
      avatar: user.avatar || (profile ? profile.profileImage : ''),
      timezone: user.timezone,
    },
    profile,
    token,
  };
};

// Backwards compatibility alias
export const loginProfessional = loginUser;

/**
 * Update current user profile
 */
export const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (updateData.name !== undefined) user.name = updateData.name.trim();
  if (updateData.phone !== undefined) user.phone = updateData.phone.trim();
  if (updateData.avatar !== undefined) user.avatar = updateData.avatar;
  if (updateData.timezone !== undefined) user.timezone = updateData.timezone;

  await user.save();

  let profile = null;
  if (user.role === 'PROFESSIONAL') {
    profile = await ProfessionalProfile.findOne({ userId: user._id });
    if (profile && updateData.name) {
      profile.name = updateData.name.trim();
      await profile.save();
    }
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      timezone: user.timezone,
    },
    profile,
  };
};

/**
 * Change authenticated user's password
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.comparePassword(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error('Current password is incorrect.');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error('New password must be at least 6 characters long.');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return { success: true, message: 'Password changed successfully' };
};

/**
 * Generate password reset token
 */
export const createPasswordResetToken = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return null;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  return { user, resetToken };
};

/**
 * Reset password using token
 */
export const resetUserPassword = async (rawToken, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error('Password reset token is invalid or has expired.');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = generateToken(user._id);
  const profile = await ProfessionalProfile.findOne({ userId: user._id });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    profile,
    token,
  };
};
