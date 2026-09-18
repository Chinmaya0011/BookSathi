import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { Availability } from '../models/Availability.js';
import { AppointmentType } from '../models/AppointmentType.js';
import { slugify } from '../utils/slugify.js';
import { isReservedSlug } from '../utils/reservedSlugs.js';
import {
  sendPasswordResetEmail,
  sendPasswordChangedConfirmationEmail,
} from './emailService.js';
import { recordLoginActivity } from './loginActivityService.js';

export const ACCESS_TOKEN_EXPIRES_IN = '15m'; // 15 minutes access token
export const REFRESH_TOKEN_EXPIRES_DAYS = 7; // 7 days refresh token
export const MAX_FAILED_LOGIN_ATTEMPTS = 5; // Lock after 5 failed attempts
export const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Generate 15-minute Access Token with active Session Identifier
 */
export const generateAccessToken = (user, sessionId = null) => {
  const secret = process.env.JWT_SECRET || 'booksaathi_jwt_super_secret_key_2026_indian_professionals';
  const id = user._id || user.id || user;
  const role = user.role || 'USER';
  const activeSession = sessionId || user.activeSessionId || null;

  const payload = { id, role };
  if (activeSession) {
    payload.sessionId = activeSession;
  }

  return jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
};

// Backwards compatibility alias
export const generateToken = (userId, role = 'USER', sessionId = null) => {
  return generateAccessToken({ _id: userId, role, activeSessionId: sessionId }, sessionId);
};

/**
 * Generate 7-day Rotating Refresh Token and persist SHA-256 hash in User document
 */
export const generateRefreshToken = async (user, { userAgent = '', ipAddress = '' } = {}) => {
  const rawRefreshToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  const userDoc = user instanceof User ? user : await User.findById(user._id || user);
  if (!userDoc) {
    throw new Error('User not found for refresh token generation');
  }

  // Prune expired tokens and append new token
  const now = new Date();
  const currentTokens = (userDoc.refreshTokens || []).filter((rt) => rt.expiresAt > now);
  currentTokens.push({
    tokenHash,
    createdAt: now,
    expiresAt,
    userAgent,
    ipAddress,
  });

  userDoc.refreshTokens = currentTokens;
  await userDoc.save({ validateBeforeSave: false });

  return rawRefreshToken;
};

/**
 * Generate CSRF Token
 */
export const generateCsrfToken = () => {
  return crypto.randomBytes(24).toString('hex');
};

/**
 * Helper to set secure httpOnly cookies
 */
export const setAuthCookies = (res, { accessToken, refreshToken, csrfToken }) => {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite = isProd ? 'none' : 'lax';

  if (accessToken) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite,
      maxAge: 15 * 60 * 1000,
    });
  }

  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite,
      path: '/',
      maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  if (csrfToken) {
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false, // Readable by client JS to send in X-CSRF-Token header
      secure: isProd,
      sameSite,
      path: '/',
      maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    });
  }
};

/**
 * Helper to clear authentication cookies on logout
 */
export const clearAuthCookies = (res) => {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite = isProd ? 'none' : 'lax';
  const opts = { httpOnly: true, secure: isProd, sameSite };

  res.clearCookie('accessToken', opts);
  res.clearCookie('token', opts);
  res.clearCookie('refreshToken', { ...opts, path: '/' });
  res.clearCookie('csrfToken', { httpOnly: false, secure: isProd, sameSite, path: '/' });
};

/**
 * Rotate Refresh Token: Invalidate old token and issue new access & refresh tokens
 */
export const rotateRefreshToken = async (rawRefreshToken, { userAgent = '', ipAddress = '' } = {}) => {
  if (!rawRefreshToken) {
    const error = new Error('Refresh token is required.');
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  const now = new Date();

  const user = await User.findOne({
    'refreshTokens.tokenHash': tokenHash,
    'refreshTokens.expiresAt': { $gt: now },
  });

  if (!user) {
    const error = new Error('Invalid or expired refresh token. Please log in again.');
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account has been deactivated. Please contact support.');
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  // Remove used refresh token
  user.refreshTokens = (user.refreshTokens || []).filter((rt) => rt.tokenHash !== tokenHash && rt.expiresAt > now);

  // Generate new refresh token
  const newRawRefreshToken = crypto.randomBytes(32).toString('hex');
  const newTokenHash = crypto.createHash('sha256').update(newRawRefreshToken).digest('hex');
  const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  user.refreshTokens.push({
    tokenHash: newTokenHash,
    createdAt: now,
    expiresAt: newExpiresAt,
    userAgent,
    ipAddress,
  });

  // Ensure user has active session id
  if (!user.activeSessionId) {
    user.activeSessionId = crypto.randomUUID();
  }

  await user.save({ validateBeforeSave: false });

  const accessToken = generateAccessToken(user, user.activeSessionId);
  const csrfToken = generateCsrfToken();

  let profile = null;
  if (user.role === 'PROFESSIONAL') {
    profile = await ProfessionalProfile.findOne({ userId: user._id });
  }

  return {
    user: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      timezone: user.timezone,
    },
    profile,
    accessToken,
    refreshToken: newRawRefreshToken,
    token: accessToken, // for backward compatibility
    sessionId: user.activeSessionId,
    csrfToken,
  };
};

/**
 * Revoke a refresh token on logout
 */
export const revokeRefreshToken = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  await User.updateOne(
    { 'refreshTokens.tokenHash': tokenHash },
    { $pull: { refreshTokens: { tokenHash } } }
  );
};

/**
 * Comprehensive User Logout: Revokes refresh token, invalidates active session, and logs event
 */
export const logoutUser = async (user, rawRefreshToken, { userAgent = '', ipAddress = '', sessionId = '' } = {}) => {
  if (rawRefreshToken) {
    await revokeRefreshToken(rawRefreshToken);
  }

  if (user) {
    const uId = user._id || user.id || user;
    const currentSession = sessionId || user.activeSessionId || '';

    // Clear activeSessionId on user document
    await User.findByIdAndUpdate(uId, { $set: { activeSessionId: null } });

    // Record LOGOUT in LoginActivity
    await recordLoginActivity({
      userId: uId,
      userEmail: user.email || '',
      userRole: user.role || 'USER',
      eventType: 'LOGOUT',
      status: 'success',
      ipAddress,
      userAgent,
      sessionId: currentSession,
      details: { method: 'user_initiated' },
    });
  }
};

/**
 * Register a Customer / User account
 */
export const registerCustomer = async (userData, { userAgent = '', ipAddress = '' } = {}) => {
  const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    error.isOperational = true;
    throw error;
  }

  const sessionId = crypto.randomUUID();

  const user = await User.create({
    name: (userData.name || '').trim(),
    phone: (userData.phone || '').trim(),
    email: userData.email.toLowerCase().trim(),
    password: userData.password,
    role: 'USER',
    timezone: userData.timezone || 'Asia/Kolkata',
    activeSessionId: sessionId,
    failedLoginAttempts: 0,
    lockUntil: null,
  });

  // Record LOGIN_SUCCESS for registration session
  await recordLoginActivity({
    userId: user._id,
    userEmail: user.email,
    userRole: user.role,
    eventType: 'LOGIN_SUCCESS',
    status: 'success',
    ipAddress,
    userAgent,
    sessionId,
    details: { registration: true },
  });

  const accessToken = generateAccessToken(user, sessionId);
  const refreshToken = await generateRefreshToken(user, { userAgent, ipAddress });
  const csrfToken = generateCsrfToken();

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
    accessToken,
    refreshToken,
    token: accessToken,
    sessionId,
    csrfToken,
  };
};

/**
 * Register a new professional user and automatically set up initial profile,
 * default Monday-Saturday availability, and default appointment type.
 */
export const registerProfessional = async (userData, { userAgent = '', ipAddress = '' } = {}) => {
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

  const sessionId = crypto.randomUUID();

  // Create User
  const user = await User.create({
    name: userData.name,
    phone: userData.phone,
    email: userData.email.toLowerCase().trim(),
    password: userData.password,
    role: 'PROFESSIONAL',
    timezone: userData.timezone || 'Asia/Kolkata',
    activeSessionId: sessionId,
    failedLoginAttempts: 0,
    lockUntil: null,
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

  // Create default Weekly Availability
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

  // Record LOGIN_SUCCESS for professional registration
  await recordLoginActivity({
    userId: user._id,
    userEmail: user.email,
    userRole: user.role,
    eventType: 'LOGIN_SUCCESS',
    status: 'success',
    ipAddress,
    userAgent,
    sessionId,
    details: { registration: true },
  });

  const accessToken = generateAccessToken(user, sessionId);
  const refreshToken = await generateRefreshToken(user, { userAgent, ipAddress });
  const csrfToken = generateCsrfToken();

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
    accessToken,
    refreshToken,
    token: accessToken,
    sessionId,
    csrfToken,
  };
};

/**
 * Universal Login with Account Lockout after N Failed Attempts and Single Active Session
 */
export const loginUser = async (email, password, { userAgent = '', ipAddress = '' } = {}) => {
  const cleanEmail = (email || '').toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail }).select('+password');
  if (!user) {
    const dummyId = new mongoose.Types.ObjectId();
    await recordLoginActivity({
      userId: dummyId,
      userEmail: cleanEmail,
      userRole: 'USER',
      eventType: 'LOGIN_FAILED',
      status: 'failed',
      ipAddress,
      userAgent,
      details: { reason: 'User not found' },
    });
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  // 1. Check if Account is Locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    const remainingMinutes = Math.max(1, Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000));
    await recordLoginActivity({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      eventType: 'LOGIN_FAILED',
      status: 'failed',
      ipAddress,
      userAgent,
      details: { reason: 'Account temporarily locked', lockUntil: user.lockUntil },
    });
    const error = new Error(`Account is temporarily locked due to too many failed login attempts. Please try again after ${remainingMinutes} minute(s) or reset your password.`);
    error.statusCode = 423; // 423 Locked
    error.isOperational = true;
    throw error;
  }

  // 2. Compare Password
  const isMatch = await user.comparePassword(password, user.password);
  if (!isMatch) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    await recordLoginActivity({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      eventType: 'LOGIN_FAILED',
      status: 'failed',
      ipAddress,
      userAgent,
      details: { reason: 'Invalid password', attemptNumber: user.failedLoginAttempts },
    });

    if (user.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      user.failedLoginAttempts = 0; // Reset counter after lockout trigger
      await user.save({ validateBeforeSave: false });

      const error = new Error(`Account locked for 15 minutes due to ${MAX_FAILED_LOGIN_ATTEMPTS} consecutive failed login attempts.`);
      error.statusCode = 423;
      error.isOperational = true;
      throw error;
    }

    await user.save({ validateBeforeSave: false });
    const attemptsRemaining = MAX_FAILED_LOGIN_ATTEMPTS - user.failedLoginAttempts;
    const error = new Error(`Invalid email or password. ${attemptsRemaining} attempt(s) remaining before account lockout.`);
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  // 3. Check if Active
  if (!user.isActive) {
    await recordLoginActivity({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      eventType: 'LOGIN_FAILED',
      status: 'failed',
      ipAddress,
      userAgent,
      details: { reason: 'Account deactivated' },
    });
    const error = new Error('Your account has been deactivated. Please contact support.');
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  // 4. Single Active Session Replacement
  const newSessionId = crypto.randomUUID();
  const oldSessionId = user.activeSessionId;

  if (oldSessionId && oldSessionId !== newSessionId) {
    // Record SESSION_REPLACED audit log for the superseded session
    await recordLoginActivity({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      eventType: 'SESSION_REPLACED',
      status: 'revoked',
      ipAddress,
      userAgent,
      sessionId: oldSessionId,
      details: {
        reason: 'New login detected from another device or browser. Previous session invalidated.',
        replacedBySessionId: newSessionId,
      },
    });
  }

  // 5. Successful Login: Update Active Session and Reset Lockout/Failed Counters
  user.activeSessionId = newSessionId;
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save({ validateBeforeSave: false });

  // Record LOGIN_SUCCESS for the newly established active session
  await recordLoginActivity({
    userId: user._id,
    userEmail: user.email,
    userRole: user.role,
    eventType: 'LOGIN_SUCCESS',
    status: 'success',
    ipAddress,
    userAgent,
    sessionId: newSessionId,
  });

  let profile = null;
  if (user.role === 'PROFESSIONAL') {
    profile = await ProfessionalProfile.findOne({ userId: user._id });
  }

  const accessToken = generateAccessToken(user, newSessionId);
  const refreshToken = await generateRefreshToken(user, { userAgent, ipAddress });
  const csrfToken = generateCsrfToken();

  return {
    user: {
      id: user._id,
      _id: user._id,
      name: user.name || (profile ? profile.name : ''),
      email: user.email,
      phone: user.phone || (profile ? profile.phone : ''),
      role: user.role,
      avatar: user.avatar || (profile ? profile.profileImage : ''),
      timezone: user.timezone,
    },
    profile,
    accessToken,
    refreshToken,
    token: accessToken, // for backward compatibility
    sessionId: newSessionId,
    csrfToken,
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
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  return { success: true, message: 'Password changed successfully' };
};

/**
 * Generate password reset token and send secure reset link via Nodemailer
 */
export const createPasswordResetToken = async (email) => {
  const cleanEmail = (email || '').toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail });
  if (!user) {
    // Return null so controller returns a generic message (prevents email enumeration)
    return null;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Set 15-minute expiration
  const expiresMinutes = 15;
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + expiresMinutes * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const frontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

  // Send Nodemailer Email
  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetUrl,
    expiresMinutes,
  });

  return { user, resetToken: rawToken };
};

/**
 * Verify if a password reset token is valid and unexpired
 */
export const verifyPasswordResetToken = async (rawToken) => {
  if (!rawToken || typeof rawToken !== 'string') {
    const error = new Error('A valid reset token is required.');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  const hashedToken = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error('This password reset link has expired or has already been used.');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  // Mask email for client display (e.g. j***@gmail.com)
  const [localPart, domain] = (user.email || '').split('@');
  const maskedLocal = localPart.length > 2 ? `${localPart[0]}***${localPart[localPart.length - 1]}` : `${localPart}***`;
  const maskedEmail = `${maskedLocal}@${domain || ''}`;

  return {
    valid: true,
    email: maskedEmail,
  };
};

/**
 * Reset password using token (Single-use: expires immediately upon consumption)
 */
export const resetUserPassword = async (rawToken, newPassword, { userAgent = '', ipAddress = '' } = {}) => {
  if (!rawToken || typeof rawToken !== 'string') {
    const error = new Error('A valid reset token is required.');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  if (!newPassword || newPassword.length < 6) {
    const error = new Error('New password must be at least 6 characters long.');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  const hashedToken = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error('This password reset link has expired or has already been used. Please request a new one.');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  // 1. Update password
  user.password = newPassword;

  // 2. Invalidate reset token immediately (Single-use enforcement)
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.failedLoginAttempts = 0;
  user.lockUntil = null;

  // 3. Security: Invalidate all existing refresh tokens and establish new active session
  user.refreshTokens = [];
  const sessionId = crypto.randomUUID();
  user.activeSessionId = sessionId;

  await user.save();

  // Record LOGIN_SUCCESS for password reset
  await recordLoginActivity({
    userId: user._id,
    userEmail: user.email,
    userRole: user.role,
    eventType: 'LOGIN_SUCCESS',
    status: 'success',
    ipAddress,
    userAgent,
    sessionId,
    details: { passwordReset: true },
  });

  // 4. Send Security Confirmation Email
  await sendPasswordChangedConfirmationEmail({
    to: user.email,
    name: user.name,
  }).catch(() => {});

  const accessToken = generateAccessToken(user, sessionId);
  const refreshToken = await generateRefreshToken(user, { userAgent, ipAddress });
  const profile = await ProfessionalProfile.findOne({ userId: user._id });
  const csrfToken = generateCsrfToken();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    profile,
    accessToken,
    refreshToken,
    token: accessToken,
    sessionId,
    csrfToken,
  };
};
