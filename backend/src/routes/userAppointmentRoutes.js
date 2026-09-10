import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  cancelUserAppointment,
  requestReschedule,
} from '../controllers/userAppointmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

import {
  bookingLimiter,
  appointmentActionLimiter,
} from '../middleware/rateLimiter.js';

const router = express.Router();

// All customer appointment routes require authentication
router.post('/', authenticate, bookingLimiter, bookAppointment);
router.get('/my', authenticate, getMyAppointments);
router.patch('/:id/cancel', authenticate, appointmentActionLimiter, cancelUserAppointment);
router.patch('/:id/reschedule-request', authenticate, appointmentActionLimiter, requestReschedule);

export default router;

