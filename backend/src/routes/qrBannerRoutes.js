import { Router } from 'express';
import {
  getPlans,
  getMyOrder,
  createOrder,
  verifyPayment,
} from '../controllers/qrBannerController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Authenticated plans query
router.get('/plans', getPlans);

// Authenticated doctor routes
router.use(authenticate);
router.get('/my-order', getMyOrder);
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

export default router;
