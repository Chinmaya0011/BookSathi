import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getStats,
  getSetupStatus,
  checkModeSwitch,
} from '../controllers/professionalController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { updateProfileSchema } from '../validators/profileValidators.js';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.get('/stats', getStats);
router.get('/setup-status', getSetupStatus);
router.get('/switch-check', checkModeSwitch);

export default router;
