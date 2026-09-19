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
  callNextQueue,
} from '../controllers/appointmentController.js';
import { authenticate, requireProfessionalProfile } from '../middleware/authMiddleware.js';
import {
  bookingLimiter,
  appointmentActionLimiter,
} from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  updateAppointmentStatusSchema,
  rescheduleSchema,
  manualBookingSchema,
  updateAppointmentNotesSchema,
} from '../validators/appointmentValidators.js';

const router = express.Router();

router.use(authenticate);
router.use(requireProfessionalProfile);

router.get('/', getAppointments);
router.post('/manual', bookingLimiter, validate(manualBookingSchema), createManual);
router.post('/queue/call-next', appointmentActionLimiter, callNextQueue);
router.get('/:id', getAppointmentById);

// Specific lifecycle actions
router.patch('/:id/confirm', appointmentActionLimiter, confirmAppointment);
router.patch('/:id/accept', appointmentActionLimiter, confirmAppointment);
router.patch('/:id/reject', appointmentActionLimiter, rejectAppointment);
router.patch('/:id/cancel', appointmentActionLimiter, cancelAppointment);
router.patch('/:id/complete', appointmentActionLimiter, completeAppointment);
router.patch('/:id/reschedule', appointmentActionLimiter, validate(rescheduleSchema), reschedule);
router.patch('/:id/status', appointmentActionLimiter, validate(updateAppointmentStatusSchema), changeStatus);
router.patch('/:id/notes', validate(updateAppointmentNotesSchema), saveNotes);

export default router;

