import {
  getMyLoginActivity,
  getAdminLoginActivity,
} from '../services/loginActivityService.js';
import { successResponse } from '../utils/response.js';

/**
 * Get current authenticated user's login activity
 */
export const getMyLogs = async (req, res, next) => {
  try {
    const currentSessionId = req.sessionId || req.user?.activeSessionId || '';
    const result = await getMyLoginActivity(req.user, currentSessionId, req.query);
    return successResponse(res, 200, 'Login activity retrieved successfully', result);
  } catch (err) {
    next(err);
  }
};

/**
 * Get platform-wide login activity for administrators
 */
export const getAdminLogs = async (req, res, next) => {
  try {
    const result = await getAdminLoginActivity(req.query);
    return successResponse(res, 200, 'Admin security login activity retrieved successfully', result);
  } catch (err) {
    next(err);
  }
};
