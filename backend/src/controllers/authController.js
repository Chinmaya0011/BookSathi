import {
  registerCustomer,
  registerProfessional,
  loginUser,
  updateUserProfile,
  changePassword,
  createPasswordResetToken,
  resetUserPassword,
} from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const role = (req.body.role || 'USER').toUpperCase();
    let result;
    if (role === 'PROFESSIONAL') {
      result = await registerProfessional(req.body);
    } else {
      result = await registerCustomer(req.body);
    }
    return successResponse(res, 201, 'Account registered successfully', result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    return successResponse(res, 200, 'Logged in successfully', result);
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'Current user retrieved', {
      user: {
        _id: req.user._id,
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        avatar: req.user.avatar,
        timezone: req.user.timezone || 'Asia/Kolkata',
      },
      profile: req.profile,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const result = await updateUserProfile(req.user._id, req.body);
    return successResponse(res, 200, 'Profile updated successfully', result);
  } catch (err) {
    next(err);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await changePassword(req.user._id, currentPassword, newPassword);
    return successResponse(res, 200, result.message);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  return successResponse(res, 200, 'Logged out successfully');
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await createPasswordResetToken(email);

    if (result && process.env.NODE_ENV !== 'production') {
      console.log(`[Password Reset Token for ${email}]: ${result.resetToken}`);
    }

    return successResponse(
      res,
      200,
      'If an account exists with that email, a password reset link has been dispatched.'
    );
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const result = await resetUserPassword(token, password);
    return successResponse(res, 200, 'Password updated successfully', result);
  } catch (err) {
    next(err);
  }
};
