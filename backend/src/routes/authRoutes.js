import express from 'express';
import {
  register,
  login,
  refresh,
  getCsrfToken,
  getMe,
  updateProfile,
  updatePassword,
  logout,
  forgotPassword,
  verifyResetToken,
  resetPassword,
} from '../controllers/authController.js';
import { getMyLogs } from '../controllers/loginActivityController.js';
import { authenticate, optionalAuth, verifyCsrf } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', authLimiter, refresh);
router.post('/refresh-token', authLimiter, refresh);
router.get('/csrf-token', getCsrfToken);
router.post('/logout', optionalAuth, logout);
router.post('/forgot-password', otpLimiter, validate(forgotPasswordSchema), forgotPassword);
router.get('/verify-reset-token', otpLimiter, verifyResetToken);
router.post('/reset-password', otpLimiter, validate(resetPasswordSchema), resetPassword);

// Authenticated user routes (with optional CSRF protection for cookie-based auth)
router.get('/me', authenticate, getMe);
router.get('/login-activity', authenticate, getMyLogs);
router.patch('/profile', authenticate, verifyCsrf, updateProfile);
router.patch('/change-password', authenticate, verifyCsrf, updatePassword);

export default router;
