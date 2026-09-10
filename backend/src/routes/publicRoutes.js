import { Router } from 'express';
import {
  listProfessionals,
  getPublicProfile,
  getPublicAvailability,
  getPublicSlots,
  holdSlotPublic,
  releaseHoldPublic,
  bookPublicAppointment,
  downloadIcsCalendar,
} from '../controllers/publicController.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  searchLimiter,
  slotLimiter,
  bookingLimiter,
} from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  publicBookingSchema,
  holdSlotSchema,
} from '../validators/appointmentValidators.js';

const router = Router();

router.get('/professionals', searchLimiter, listProfessionals);
router.get('/:slug', getPublicProfile);
router.get('/:slug/availability', slotLimiter, getPublicAvailability);
router.get('/:slug/slots', slotLimiter, getPublicSlots);
router.post('/:slug/hold', bookingLimiter, validate(holdSlotSchema), holdSlotPublic);
router.post('/:slug/hold/release', bookingLimiter, releaseHoldPublic);
router.post('/:slug/book', bookingLimiter, authenticate, validate(publicBookingSchema), bookPublicAppointment);
router.get('/:slug/ics/:code', downloadIcsCalendar);

export default router;
