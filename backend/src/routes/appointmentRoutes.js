import express from 'express';
import {
  getAppointments,
  getAppointmentById,
  confirmAppointment,
  rejectAppointment,
  cancelAppointment,
  completeAppointment,
  changeStatus,
  reschedule,
  saveNotes,
  createManual,
} from '../controllers/appointmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  bookingLimiter,
  appointmentActionLimiter,
} from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAppointments);
router.post('/manual', bookingLimiter, createManual);
router.get('/:id', getAppointmentById);

// Specific lifecycle actions
router.patch('/:id/confirm', appointmentActionLimiter, confirmAppointment);
router.patch('/:id/accept', appointmentActionLimiter, confirmAppointment);
router.patch('/:id/reject', appointmentActionLimiter, rejectAppointment);
router.patch('/:id/cancel', appointmentActionLimiter, cancelAppointment);
router.patch('/:id/complete', appointmentActionLimiter, completeAppointment);
router.patch('/:id/reschedule', appointmentActionLimiter, reschedule);
router.patch('/:id/status', appointmentActionLimiter, changeStatus);
router.patch('/:id/notes', saveNotes);

export default router;

