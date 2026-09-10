import { Router } from 'express';
import {
  createGrievance,
  getMyGrievances,
  getAllGrievances,
  getGrievanceStats,
  updateGrievanceStatus,
} from '../controllers/grievanceController.js';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Submit a grievance (public or authenticated)
router.post('/', optionalAuth, createGrievance);

// Professional / User views their own tickets
router.get('/my', authenticate, getMyGrievances);

// Admin routes
router.get('/admin', authenticate, requireAdmin, getAllGrievances);
router.get('/admin/stats', authenticate, requireAdmin, getGrievanceStats);
router.patch('/admin/:id', authenticate, requireAdmin, updateGrievanceStatus);

export default router;
