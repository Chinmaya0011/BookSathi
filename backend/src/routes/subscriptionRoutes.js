import { Router } from 'express';
import {
  getPlans,
  getMySubscription,
  selectPlan,
} from '../controllers/subscriptionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Authenticated plans query
router.get('/plans', getPlans);

// Authenticated doctor subscription endpoints
router.use(authenticate);
router.get('/my-subscription', getMySubscription);
router.post('/select-plan', selectPlan);

export default router;
