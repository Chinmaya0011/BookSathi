import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  recordManual,
  processRefund,
  getPayments,
  getAnalytics,
  getInvoice,
  simulateWebhook,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  createOrderSchema,
  verifyPaymentSchema,
  recordManualPaymentSchema,
  refundPaymentSchema,
} from '../validators/paymentValidators.js';

const router = Router();

// --- Public / Checkout Endpoints ---
router.post('/create-order', validate(createOrderSchema), createOrder);
router.post('/verify', validate(verifyPaymentSchema), verifyPayment);
router.get('/:id/invoice', getInvoice);
router.post('/webhook/simulate', simulateWebhook);

// --- Protected Doctor Dashboard Endpoints ---
router.use(authenticate);
router.get('/', getPayments);
router.get('/stats', getAnalytics);
router.post('/record-manual', validate(recordManualPaymentSchema), recordManual);
router.post('/:id/refund', validate(refundPaymentSchema), processRefund);

export default router;
