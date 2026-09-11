import { Router } from 'express';
import {
  getBookingLinkDetails,
  checkSlugAvailability,
  updateBookingSlug,
} from '../controllers/bookingLinkController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { updateSlugSchema } from '../validators/profileValidators.js';

const router = Router();

// Public check for signup / onboarding
router.get('/check', optionalAuth, checkSlugAvailability);

// Authenticated routes
router.use(authenticate);
router.get('/', getBookingLinkDetails);
router.patch('/', validate(updateSlugSchema), updateBookingSlug);

export default router;
