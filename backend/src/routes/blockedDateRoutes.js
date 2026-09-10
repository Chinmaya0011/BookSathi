import { Router } from 'express';
import {
  getBlockedDates,
  createBlockedDate,
  deleteBlockedDate,
} from '../controllers/blockedDateController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createBlockedDateSchema } from '../validators/availabilityValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', getBlockedDates);
router.post('/', validate(createBlockedDateSchema), createBlockedDate);
router.delete('/:id', deleteBlockedDate);

export default router;
