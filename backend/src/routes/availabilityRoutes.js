import { Router } from 'express';
import {
  getWeeklyAvailability,
  updateWeeklyAvailability,
  copyMondaySchedule,
} from '../controllers/availabilityController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { updateWeeklyAvailabilitySchema } from '../validators/availabilityValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', getWeeklyAvailability);
router.put('/', validate(updateWeeklyAvailabilitySchema), updateWeeklyAvailability);
router.post('/copy-monday', copyMondaySchedule);

export default router;
