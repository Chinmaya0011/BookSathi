import { Router } from 'express';
import {
  createOrder,
  getOrderStatus,
  verifyPayment,
  handleWebhook,
  recordManual,
  processRefund,
  getPayments,
  getAnalytics,
  getInvoice,
  simulateWebhook,
} from '../controllers/paymentController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
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
router.get('/:orderId/status', getOrderStatus);
router.get('/order/:orderId/status', getOrderStatus);
router.post('/verify', validate(verifyPaymentSchema), verifyPayment);
router.post('/webhook', handleWebhook);
router.post('/webhook/simulate', simulateWebhook);
router.get('/:id/invoice', optionalAuth, getInvoice);

// --- Protected Doctor / Admin Dashboard Endpoints ---
router.use(authenticate);
router.get('/', getPayments);
router.get('/stats', getAnalytics);
router.post('/record-manual', validate(recordManualPaymentSchema), recordManual);
router.post('/:orderId/refund', validate(refundPaymentSchema), processRefund);
router.post('/:id/refund', validate(refundPaymentSchema), processRefund);

export default router;
