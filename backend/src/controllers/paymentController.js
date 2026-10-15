import {
  createPaymentOrder,
  verifyAndConfirmPayment,
  getPaymentStatusByOrderId,
  handleCashfreeWebhook,
  recordManualPayment,
  processPaymentRefund,
  getProfessionalPayments,
  getPaymentStats,
  getInvoiceDetails,
} from '../services/paymentService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Create Payment Order (Public or Authenticated)
 * Returns non-sensitive checkout information (paymentSessionId, orderId, amount, currency)
 */
export const createOrder = async (req, res, next) => {
  try {
    const { appointmentId, gatewayProvider, paymentMode } = req.body;
    const result = await createPaymentOrder({ appointmentId, gatewayProvider, paymentMode });
    return successResponse(res, 201, 'Payment order created successfully', result);
  } catch (err) {
    next(err);
  }
};

/**
 * Get Payment / Order Status by Order ID or Payment ID
 */
export const getOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.orderId || req.params.id;
    const result = await getPaymentStatusByOrderId(orderId);
    return successResponse(res, 200, 'Payment status retrieved successfully', result);
  } catch (err) {
    next(err);
  }
};

/**
 * Verify & Confirm Payment (Public checkout callback / modal completion)
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      paymentId,
      orderId,
      gatewayOrderId,
      cashfreeOrderId,
      gatewayPaymentId,
      gatewaySignature,
      paymentMethod,
      simulateFailure,
      notes,
    } = req.body;

    const result = await verifyAndConfirmPayment({
      paymentId,
      gatewayOrderId: gatewayOrderId || orderId,
      cashfreeOrderId: cashfreeOrderId || orderId,
      gatewayPaymentId,
      gatewaySignature,
      paymentMethod,
      simulateFailure,
      notes,
    });

    return successResponse(res, 200, 'Payment verified and appointment updated', result);
  } catch (err) {
    next(err);
  }
};

/**
 * Official Cashfree Webhook Handler (HMAC-SHA256 signature verified)
 */
export const handleWebhook = async (req, res, next) => {
  try {
    const result = await handleCashfreeWebhook({
      rawBody: req.rawBody,
      headers: req.headers,
      body: req.body,
    });
    return successResponse(res, 200, 'Cashfree webhook processed successfully', result);
  } catch (err) {
    next(err);
  }
};

/**
 * Record Manual Offline / Cash Payment (Doctor Dashboard)
 */
export const recordManual = async (req, res, next) => {
  try {
    const { appointmentId, amount, paymentMethod, notes } = req.body;
    const proId = req.profile?._id || req.user?._id;
    if (!proId) {
      return errorResponse(res, 403, 'Professional profile required to record manual payment');
    }
    const result = await recordManualPayment(proId, {
      appointmentId,
      amount,
      paymentMethod,
      notes,
    });
    return successResponse(res, 200, 'Manual payment recorded successfully', result);
  } catch (err) {
    next(err);
  }
};

/**
 * Process Refund (Doctor Dashboard or Authorized Admin)
 */
export const processRefund = async (req, res, next) => {
  try {
    const id = req.params.orderId || req.params.id;
    const { amount, reason } = req.body;
    const result = await processPaymentRefund(req.profile?._id, {
      paymentId: id,
      orderId: id,
      amount,
      reason,
    });
    return successResponse(res, 200, 'Refund processed successfully', result);
  } catch (err) {
    next(err);
  }
};

/**
 * List Payments (Doctor Dashboard)
 */
export const getPayments = async (req, res, next) => {
  try {
    if (!req.profile) {
      return successResponse(res, 200, 'Payments retrieved successfully', {
        payments: [],
        pagination: { total: 0, page: 1, limit: 50, totalPages: 0 },
      });
    }
    const result = await getProfessionalPayments(req.profile._id, req.query);
    return successResponse(res, 200, 'Payments retrieved successfully', result);
  } catch (err) {
    next(err);
  }
};

/**
 * Payment Financial Statistics (Doctor Dashboard)
 */
export const getAnalytics = async (req, res, next) => {
  try {
    if (!req.profile) {
      return successResponse(res, 200, 'Payment stats retrieved', {
        totalRevenue: 0,
        monthlyRevenue: 0,
        onlineCount: 0,
        cashCount: 0,
        refundedAmount: 0,
        recentPayments: [],
      });
    }
    const result = await getPaymentStats(req.profile._id, req.profile.timezone || 'Asia/Kolkata');
    return successResponse(res, 200, 'Payment stats retrieved', result);
  } catch (err) {
    next(err);
  }
};

/**
 * Get Invoice / Receipt Details (Public / Doctor)
 */
export const getInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cancelToken = req.query.token || req.headers['x-cancel-token'] || '';
    const sessionToken = req.query.sessionToken || req.headers['x-session-token'] || '';
    const result = await getInvoiceDetails(id, {
      user: req.user,
      profile: req.profile,
      cancelToken,
      sessionToken,
    });
    return successResponse(res, 200, 'Invoice details retrieved', result);
  } catch (err) {
    next(err);
  }
};

/**
 * Webhook Simulation for testing external async webhooks in Sandbox
 */
export const simulateWebhook = async (req, res, next) => {
  try {
    const { event, payload } = req.body;
    if (event === 'payment.captured' && payload?.paymentId) {
      const result = await verifyAndConfirmPayment({
        paymentId: payload.paymentId,
        gatewayPaymentId: payload.gatewayPaymentId,
        paymentMethod: payload.paymentMethod || 'UPI',
        notes: 'Verified via simulated webhook',
      });
      return successResponse(res, 200, 'Webhook processed: Payment captured', result);
    }

    return successResponse(res, 200, 'Webhook received', { received: true, event });
  } catch (err) {
    next(err);
  }
};
