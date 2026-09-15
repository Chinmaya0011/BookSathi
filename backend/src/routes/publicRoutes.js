import { Router } from 'express';
import {
  listProfessionals,
  getPublicProfile,
  getPublicAvailability,
  getPublicSlots,
  getPublicQueueStatus,
  joinPublicQueue,
  holdSlotPublic,
  releaseHoldPublic,
  bookPublicAppointment,
  downloadIcsCalendar,
  lookupAppointments,
  rebookAppointment,
  getBookingChallenge,
  sendBookingOtp,
  verifyBookingOtp,
  sendPublicEmailOtp,
  verifyPublicEmailOtp,
  cancelPublicBooking,
  requestPublicReschedule,
} from '../controllers/publicController.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  searchLimiter,
  slotLimiter,
  bookingLimiter,
  otpLimiter,
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
router.get('/:slug/queue-status', slotLimiter, getPublicQueueStatus);
router.post('/:slug/queue', bookingLimiter, optionalAuth, joinPublicQueue);
router.post('/:slug/queue/join', bookingLimiter, optionalAuth, joinPublicQueue);
// Pre-Booking Email OTP Verification Flow
router.post('/:slug/send-email-otp', otpLimiter, sendPublicEmailOtp);
router.post('/:slug/verify-email-otp', otpLimiter, verifyPublicEmailOtp);

router.post('/:slug/hold', bookingLimiter, validate(holdSlotSchema), holdSlotPublic);
router.post('/:slug/hold/release', bookingLimiter, releaseHoldPublic);
router.post('/:slug/book', bookingLimiter, optionalAuth, validate(publicBookingSchema), bookPublicAppointment);
router.get('/:slug/ics/:code', downloadIcsCalendar);

export default router;

