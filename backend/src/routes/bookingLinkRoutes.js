import { Router } from 'express';
import {
  getBookingLinkDetails,
  checkSlugAvailability,
  updateBookingSlug,
} from '../controllers/bookingLinkController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { updateSlugSchema } from '../validators/profileValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', getBookingLinkDetails);
router.get('/check', checkSlugAvailability);
router.patch('/', validate(updateSlugSchema), updateBookingSlug);

export default router;
