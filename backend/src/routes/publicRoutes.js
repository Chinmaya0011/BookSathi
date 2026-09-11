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
  lookupAppointments,
  rebookAppointment,
  getBookingChallenge,
  sendBookingOtp,
  verifyBookingOtp,
  cancelPublicBooking,
  requestPublicReschedule,
} from '../controllers/publicController.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  searchLimiter,
  slotLimiter,
  bookingLimiter,
} from '../middleware/rateLimiter.js';
import { optionalAuth } from '../middleware/authMiddleware.js';
import {
  publicBookingSchema,
  holdSlotSchema,
} from '../validators/appointmentValidators.js';

const router = Router();

// Customer Zero-Login Booking Lookup & Re-booking
router.get('/lookup', searchLimiter, lookupAppointments);
router.get('/book-again', searchLimiter, rebookAppointment);

// Public Booking Security & Management Flow
router.get('/booking/:code/challenge', optionalAuth, getBookingChallenge);
router.post('/booking/:code/otp', sendBookingOtp);
router.post('/booking/:code/verify-otp', verifyBookingOtp);
router.post('/booking/:code/cancel', optionalAuth, cancelPublicBooking);
router.post('/booking/:code/reschedule-request', optionalAuth, requestPublicReschedule);

// Public Directory & Profiles
router.get('/professionals', searchLimiter, listProfessionals);
router.get('/:slug', getPublicProfile);
router.get('/:slug/availability', slotLimiter, getPublicAvailability);
router.get('/:slug/slots', slotLimiter, getPublicSlots);
router.post('/:slug/hold', bookingLimiter, validate(holdSlotSchema), holdSlotPublic);
router.post('/:slug/hold/release', bookingLimiter, releaseHoldPublic);
router.post('/:slug/book', bookingLimiter, optionalAuth, validate(publicBookingSchema), bookPublicAppointment);
router.get('/:slug/ics/:code', downloadIcsCalendar);

export default router;

