import {
  registerCustomer,
  registerProfessional,
  loginUser,
  rotateRefreshToken,
  revokeRefreshToken,
  logoutUser,
  updateUserProfile,
  changePassword,
  createPasswordResetToken,
  verifyPasswordResetToken,
  resetUserPassword,
  generateCsrfToken,
  setAuthCookies,
  clearAuthCookies,
} from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const role = (req.body.role || 'USER').toUpperCase();
    const meta = {
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
    };

    let result;
    if (role === 'PROFESSIONAL') {
      result = await registerProfessional(req.body, meta);
    } else {
      result = await registerCustomer(req.body, meta);
    }

    setAuthCookies(res, result);
    return successResponse(res, 201, 'Account registered successfully', result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const meta = {
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
    };

    const result = await loginUser(email, password, meta);
    setAuthCookies(res, result);
    return successResponse(res, 200, 'Logged in successfully', result);
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const rawRefreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    const meta = {
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
    };

    const result = await rotateRefreshToken(rawRefreshToken, meta);
    setAuthCookies(res, result);
    return successResponse(res, 200, 'Token refreshed successfully', result);
  } catch (err) {
    next(err);
  }
};

export const getCsrfToken = async (req, res, next) => {
  try {
    const csrfToken = req.cookies?.csrfToken || generateCsrfToken();
    setAuthCookies(res, { csrfToken });
    return successResponse(res, 200, 'CSRF token retrieved', { csrfToken });
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
  try {
    const rawRefreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
    const meta = {
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      sessionId: req.sessionId || req.user?.activeSessionId || '',
    };
    await logoutUser(req.user, rawRefreshToken, meta);
    clearAuthCookies(res);
    return successResponse(res, 200, 'Logged out successfully');
  } catch (err) {
    clearAuthCookies(res);
    return successResponse(res, 200, 'Logged out successfully');
  }
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

export const verifyResetToken = async (req, res, next) => {
  try {
    const token = req.query.token || req.body?.token;
    const result = await verifyPasswordResetToken(token);
    return successResponse(res, 200, 'Password reset link is valid', result);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const meta = {
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
    };
    const result = await resetUserPassword(token, password, meta);
    setAuthCookies(res, result);
    return successResponse(res, 200, 'Password updated successfully', result);
  } catch (err) {
    next(err);
  }
};
