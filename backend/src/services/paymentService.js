import crypto from 'crypto';
import { Payment } from '../models/Payment.js';
import { Appointment } from '../models/Appointment.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { getPaymentGateway } from './payment/index.js';
import { getDateString } from '../utils/dateHelpers.js';
import { hashCancelToken } from './appointmentService.js';
import { otpService } from './otpService.js';
import { escapeRegex } from '../utils/sanitize.js';
import { emitPaymentReceived, emitPaymentRefunded } from '../socket/socketEmitter.js';

export const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `INV-${year}-${randomSuffix}`;
};

export const generatePaymentCode = () => {
  const d = new Date();
  const yyyymmdd = d.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PAY-${yyyymmdd}-${rand}`;
};

/**
 * Initiate a Payment Order for an Appointment
 */
export const createPaymentOrder = async ({
  appointmentId,
  gatewayProvider = process.env.PAYMENT_GATEWAY_DEFAULT || 'CASHFREE',
  paymentMode = 'ONLINE',
}) => {
  const apptIdStr = String(appointmentId || '').trim();
  const query = apptIdStr.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: appointmentId }
    : { appointmentCode: appointmentId };

  const appointment = await Appointment.findOne(query).populate('professionalId');
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  // Prevent duplicate order creation if appointment is already paid
  if (appointment.paymentStatus === 'PAID') {
    const err = new Error('This appointment has already been paid for.');
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  const profile = appointment.professionalId;
  const amount = appointment.fee || 0;
  const currency = appointment.currency || 'INR';

  // Handle Free Consultation
  if (amount === 0) {
    const payment = await Payment.create({
      paymentCode: generatePaymentCode(),
      appointmentId: appointment._id,
      userId: appointment.userId || undefined,
      professionalId: profile._id,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      customerPhone: appointment.customerPhone,
      amount: 0,
      currency,
      status: 'SUCCESS',
      paymentMethod: 'FREE',
      paymentMode: 'FREE',
      gatewayProvider: 'NONE',
      invoiceNumber: generateInvoiceNumber(),
      paidAt: new Date(),
    });

    appointment.paymentStatus = 'NOT_REQUIRED';
    appointment.paymentMode = 'FREE';
    appointment.paymentId = payment._id;
    await appointment.save();

    emitPaymentReceived({ payment, appointment, professional: profile }).catch(() => {});

    return {
      isFree: true,
      payment,
      appointment,
    };
  }

  // Handle Pay at Clinic / Venue
  if (paymentMode === 'PAY_AT_CLINIC') {
    let payment = appointment.paymentId ? await Payment.findById(appointment.paymentId) : null;
    if (payment && payment.status === 'PENDING') {
      payment.amount = amount;
      payment.paymentMode = 'PAY_AT_CLINIC';
      payment.paymentMethod = 'CASH';
      payment.gatewayProvider = 'NONE';
      await payment.save();
    } else {
      payment = await Payment.create({
        paymentCode: generatePaymentCode(),
        appointmentId: appointment._id,
        userId: appointment.userId || undefined,
        professionalId: profile._id,
        customerName: appointment.customerName,
        customerEmail: appointment.customerEmail,
        customerPhone: appointment.customerPhone,
        amount,
        currency,
        status: 'PENDING',
        paymentMethod: 'CASH',
        paymentMode: 'PAY_AT_CLINIC',
        gatewayProvider: 'NONE',
        invoiceNumber: generateInvoiceNumber(),
        notes: 'Payment to be collected in person at consultation.',
      });
    }

    appointment.paymentStatus = 'PAY_AT_CLINIC';
    appointment.paymentMode = 'PAY_AT_CLINIC';
    appointment.paymentId = payment._id;
    await appointment.save();

    return {
      isPayAtClinic: true,
      payment,
      appointment,
    };
  }

  // Online Payment Flow via Cashfree PG (or Cashfree Demo Mode if keys are not configured)
  const gateway = getPaymentGateway('CASHFREE');
  const orderData = await gateway.createOrder({
    amount,
    currency,
    receipt: appointment.appointmentCode,
    customer: {
      id: appointment.userId?.toString() || appointment.customerPhone,
      name: appointment.customerName,
      email: appointment.customerEmail,
      phone: appointment.customerPhone,
    },
    notes: {
      appointmentCode: appointment.appointmentCode,
      professionalName: profile.name,
      appointmentId: appointment._id.toString(),
    },
  });

  const isDemo = Boolean(orderData.isDemo);

  // Reuse existing PENDING payment if already created on this appointment
  let payment = appointment.paymentId ? await Payment.findById(appointment.paymentId) : null;
  if (payment && payment.status === 'PENDING') {
    payment.gatewayProvider = 'CASHFREE';
    payment.isDemo = isDemo;
    payment.gatewayOrderId = orderData.orderId;
    payment.gatewayPaymentId = orderData.cfOrderId || '';
    payment.cashfreeOrderId = orderData.orderId;
    payment.cashfreePaymentId = orderData.cfOrderId || '';
    payment.paymentSessionId = orderData.paymentSessionId || '';
    payment.amount = amount;
    payment.metadata = { orderDetails: orderData };
    await payment.save();
  } else {
    payment = await Payment.create({
      paymentCode: generatePaymentCode(),
      appointmentId: appointment._id,
      userId: appointment.userId || undefined,
      professionalId: profile._id,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      customerPhone: appointment.customerPhone,
      amount,
      currency,
      status: 'PENDING',
      isDemo,
      paymentMethod: isDemo ? 'CASHFREE_DEMO' : 'CASHFREE',
      paymentMode: 'ONLINE',
      gatewayProvider: 'CASHFREE',
      gatewayOrderId: orderData.orderId,
      gatewayPaymentId: orderData.cfOrderId || '',
      cashfreeOrderId: orderData.orderId,
      cashfreePaymentId: orderData.cfOrderId || '',
      paymentSessionId: orderData.paymentSessionId || '',
      invoiceNumber: generateInvoiceNumber(),
      metadata: { orderDetails: orderData },
    });
  }

  appointment.paymentStatus = 'PENDING';
  appointment.paymentMode = 'ONLINE';
  appointment.paymentId = payment._id;
  await appointment.save();

  return {
    isOnline: true,
    payment,
    gatewayOrder: orderData,
    paymentSessionId: orderData.paymentSessionId || null,
    orderId: orderData.orderId,
    environment: orderData.environment || process.env.CASHFREE_ENVIRONMENT || 'SANDBOX',
    appointment,
  };
};

/**
 * Get Payment Transaction & Status by Order ID or Payment ID
 */
export const getPaymentStatusByOrderId = async (orderId) => {
  if (!orderId) {
    const err = new Error('Order identifier is required');
    err.statusCode = 400;
    throw err;
  }

  const cleanId = String(orderId).trim();
  const payment = await Payment.findOne({
    $or: [
      { gatewayOrderId: cleanId },
      { cashfreeOrderId: cleanId },
      { paymentCode: cleanId },
      { invoiceNumber: cleanId },
      ...(cleanId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: cleanId }, { appointmentId: cleanId }] : []),
    ],
  }).populate('appointmentId');

  if (!payment) {
    const err = new Error('Payment not found');
    err.statusCode = 404;
    throw err;
  }

  // If still PENDING, verify latest status with Cashfree
  if (payment.status === 'PENDING' && payment.gatewayProvider === 'CASHFREE') {
    try {
      const gateway = getPaymentGateway('CASHFREE');
      const verifyRes = await gateway.verifyPayment({
        orderId: payment.gatewayOrderId || payment.cashfreeOrderId,
        paymentId: payment.gatewayPaymentId || payment.cashfreePaymentId,
      });

      if (verifyRes.isValid && (verifyRes.status === 'SUCCESS' || verifyRes.status === 'DEMO_SUCCESS')) {
        const isDemo = Boolean(verifyRes.isDemo || payment.isDemo);
        payment.status = isDemo ? 'DEMO_SUCCESS' : 'SUCCESS';
        payment.isDemo = isDemo;
        payment.paidAt = new Date();
        if (verifyRes.paymentId) {
          payment.gatewayPaymentId = verifyRes.paymentId;
          payment.cashfreePaymentId = verifyRes.paymentId;
        }
        payment.paymentMethod = verifyRes.paymentMethod || (isDemo ? 'CASHFREE_DEMO' : 'CASHFREE');
        await payment.save();

        if (payment.appointmentId) {
          const appt = await Appointment.findByIdAndUpdate(payment.appointmentId._id, {
            paymentStatus: isDemo ? 'DEMO_PAID' : 'PAID',
            isDemo,
            status: 'CONFIRMED',
          }, { new: true });
          const proProfile = await ProfessionalProfile.findById(payment.professionalId);
          emitPaymentReceived({ payment, appointment: appt, professional: proProfile }).catch(() => {});
        }
      } else if (verifyRes.status === 'FAILED') {
        const isDemo = Boolean(verifyRes.isDemo || payment.isDemo);
        payment.status = isDemo ? 'DEMO_FAILED' : 'FAILED';
        payment.isDemo = isDemo;
        await payment.save();
        if (payment.appointmentId) {
          await Appointment.findByIdAndUpdate(payment.appointmentId._id, {
            paymentStatus: 'FAILED',
          });
        }
      }
    } catch (err) {
      console.warn('Background payment status check failed:', err.message);
    }
  }

  return {
    paymentId: payment._id,
    paymentCode: payment.paymentCode,
    orderId: payment.gatewayOrderId || payment.cashfreeOrderId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    isPaid: payment.status === 'SUCCESS' || payment.status === 'DEMO_SUCCESS',
    isDemo: Boolean(payment.isDemo),
    paymentMethod: payment.paymentMethod,
    paidAt: payment.paidAt,
    refundStatus: payment.refundStatus,
    appointment: payment.appointmentId,
  };
};

/**
 * Verify and Confirm Payment Completion (Public callback or direct verification)
 */
export const verifyAndConfirmPayment = async ({
  paymentId,
  gatewayOrderId,
  cashfreeOrderId,
  gatewayPaymentId,
  gatewaySignature,
  paymentMethod = 'UPI',
  simulateFailure = false,
  notes = '',
}) => {
  const cleanPayId = paymentId ? String(paymentId).trim() : '';
  const targetOrderId = cashfreeOrderId || gatewayOrderId;
  const filter = cleanPayId
    ? (cleanPayId.match(/^[0-9a-fA-F]{24}$/) ? { _id: cleanPayId } : { paymentCode: cleanPayId })
    : targetOrderId
    ? { $or: [{ gatewayOrderId: targetOrderId }, { cashfreeOrderId: targetOrderId }] }
    : null;

  if (!filter) {
    const err = new Error('Either paymentId or orderId is required for verification');
    err.statusCode = 400;
    throw err;
  }

  const payment = await Payment.findOne(filter);
  if (!payment) {
    const err = new Error('Payment transaction not found');
    err.statusCode = 404;
    throw err;
  }

  // Idempotency: If already marked SUCCESS or DEMO_SUCCESS, return clean result immediately
  if (payment.status === 'SUCCESS' || payment.status === 'DEMO_SUCCESS') {
    const appointment = await Appointment.findById(payment.appointmentId);
    return {
      payment,
      appointment,
      verificationResult: { isValid: true, status: payment.status, isDemo: Boolean(payment.isDemo), alreadyPaid: true },
    };
  }

  const gateway = getPaymentGateway('CASHFREE');
  const verificationResult = await gateway.verifyPayment({
    orderId: targetOrderId || payment.gatewayOrderId || payment.cashfreeOrderId,
    paymentId: gatewayPaymentId || payment.gatewayPaymentId,
    signature: gatewaySignature,
    simulateFailure,
  });

  const isDemo = Boolean(verificationResult.isDemo || payment.isDemo);

  if (!verificationResult.isValid || verificationResult.status === 'FAILED') {
    payment.status = isDemo ? 'DEMO_FAILED' : 'FAILED';
    payment.isDemo = isDemo;
    payment.gatewayPaymentId = gatewayPaymentId || payment.gatewayPaymentId;
    payment.cashfreePaymentId = gatewayPaymentId || payment.cashfreePaymentId;
    payment.gatewayRawResponse = verificationResult.raw;
    if (notes) payment.notes = notes;
    await payment.save();

    await Appointment.findByIdAndUpdate(payment.appointmentId, {
      paymentStatus: 'FAILED',
    });

    const err = new Error(verificationResult.error || 'Payment verification failed');
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  // Payment Succeeded
  payment.status = isDemo ? 'DEMO_SUCCESS' : 'SUCCESS';
  payment.isDemo = isDemo;
  payment.paymentMethod = verificationResult.paymentMethod || (isDemo ? 'CASHFREE_DEMO' : 'CASHFREE');
  payment.gatewayPaymentId = verificationResult.paymentId || gatewayPaymentId || payment.gatewayPaymentId;
  payment.cashfreePaymentId = verificationResult.paymentId || gatewayPaymentId || payment.cashfreePaymentId;
  payment.gatewaySignature = gatewaySignature || '';
  payment.gatewayRawResponse = verificationResult.raw;
  payment.paidAt = new Date();
  if (notes) payment.notes = notes;
  if (isDemo && !payment.notes) payment.notes = 'Verified in Cashfree Demo Mode';
  await payment.save();

  const appointment = await Appointment.findByIdAndUpdate(
    payment.appointmentId,
    {
      paymentStatus: isDemo ? 'DEMO_PAID' : 'PAID',
      isDemo,
      paymentId: payment._id,
      status: 'CONFIRMED',
    },
    { new: true }
  ).populate('professionalId');

  const pro = appointment?.professionalId || await ProfessionalProfile.findById(payment.professionalId);
  emitPaymentReceived({ payment, appointment, professional: pro }).catch(() => {});

  return {
    payment,
    appointment,
    verificationResult,
  };
};

/**
 * Handle Cashfree Webhooks with Signature Verification & Idempotency
 */
export const handleCashfreeWebhook = async ({ rawBody, headers, body }) => {
  const signature = headers['x-webhook-signature'] || headers['X-Webhook-Signature'] || '';
  const timestamp = headers['x-webhook-timestamp'] || headers['X-Webhook-Timestamp'] || '';

  const gateway = getPaymentGateway('CASHFREE');
  const isValidSignature = gateway.verifyWebhookSignature({
    signature,
    rawBody: rawBody || JSON.stringify(body || {}),
    timestamp,
  });

  if (!isValidSignature) {
    const err = new Error('Invalid Cashfree webhook signature');
    err.statusCode = 400;
    throw err;
  }

  const payload = body || {};
  const eventType = payload.type || payload.event || (payload.data?.payment?.payment_status ? 'PAYMENT_EVENT' : 'UNKNOWN');
  const orderData = payload.data?.order || {};
  const paymentData = payload.data?.payment || {};
  const refundData = payload.data?.refund || {};

  const orderId = orderData.order_id || payload.orderId || payload.order_id || '';
  const cfPaymentId = paymentData.cf_payment_id?.toString() || payload.cf_payment_id?.toString() || '';
  const paymentStatus = (paymentData.payment_status || orderData.order_status || '').toUpperCase();

  if (!orderId) {
    return { received: true, processed: false, reason: 'No order_id in webhook payload' };
  }

  // Find payment record
  const payment = await Payment.findOne({
    $or: [{ gatewayOrderId: orderId }, { cashfreeOrderId: orderId }],
  });

  if (!payment) {
    console.warn(`Webhook received for unknown order: ${orderId}`);
    return { received: true, processed: false, reason: 'Order not found in database' };
  }

  // Log event history
  payment.webhookEvents = payment.webhookEvents || [];
  payment.webhookEvents.push({
    event: eventType,
    receivedAt: new Date(),
    payload: {
      orderId,
      cfPaymentId,
      status: paymentStatus,
      type: eventType,
    },
  });

  // Handle PAYMENT SUCCESS
  if (
    eventType === 'PAYMENT_SUCCESS_WEBHOOK' ||
    paymentStatus === 'SUCCESS' ||
    eventType === 'PAYMENT_CAPTURED'
  ) {
    if (payment.status === 'SUCCESS') {
      await payment.save();
      return { received: true, processed: true, idempotent: true, status: 'SUCCESS' };
    }

    // Verify directly with Cashfree server API to avoid spoofing
    const verifyRes = await gateway.verifyPayment({ orderId });
    if (verifyRes.isValid && verifyRes.status === 'SUCCESS') {
      payment.status = 'SUCCESS';
      payment.cashfreePaymentId = cfPaymentId || verifyRes.paymentId || payment.cashfreePaymentId;
      payment.gatewayPaymentId = payment.cashfreePaymentId;
      payment.paidAt = new Date();
      if (verifyRes.paymentMethod) {
        payment.paymentMethod = verifyRes.paymentMethod;
      }
      await payment.save();

      const appt = await Appointment.findByIdAndUpdate(
        payment.appointmentId,
        {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
        },
        { new: true }
      ).populate('professionalId');

      const pro = appt?.professionalId || await ProfessionalProfile.findById(payment.professionalId);
      emitPaymentReceived({ payment, appointment: appt, professional: pro }).catch(() => {});

      return { received: true, processed: true, status: 'SUCCESS', orderId };
    }
  }

  // Handle PAYMENT FAILED / USER DROPPED / CANCELLED
  if (
    eventType === 'PAYMENT_FAILED_WEBHOOK' ||
    eventType === 'PAYMENT_USER_DROPPED_WEBHOOK' ||
    paymentStatus === 'FAILED' ||
    paymentStatus === 'USER_DROPPED' ||
    paymentStatus === 'CANCELLED'
  ) {
    if (payment.status !== 'SUCCESS') {
      payment.status = 'FAILED';
      payment.cashfreePaymentId = cfPaymentId || payment.cashfreePaymentId;
      await payment.save();

      await Appointment.findByIdAndUpdate(payment.appointmentId, {
        paymentStatus: 'FAILED',
      });
    }
    return { received: true, processed: true, status: 'FAILED', orderId };
  }

  // Handle REFUND
  if (eventType === 'REFUND_STATUS_WEBHOOK' || eventType === 'REFUND_SUCCESS') {
    payment.status = 'REFUNDED';
    payment.refundStatus = 'PROCESSED';
    payment.cfRefundId = refundData.cf_refund_id?.toString() || payment.cfRefundId;
    payment.refundAmount = refundData.refund_amount || payment.refundAmount || payment.amount;
    payment.refundedAt = new Date();
    await payment.save();

    const appt = await Appointment.findByIdAndUpdate(payment.appointmentId, {
      paymentStatus: 'REFUNDED',
    }, { new: true });

    const pro = await ProfessionalProfile.findById(payment.professionalId);
    emitPaymentRefunded({ payment, appointment: appt, professional: pro }).catch(() => {});

    return { received: true, processed: true, status: 'REFUNDED', orderId };
  }

  await payment.save();
  return { received: true, processed: true, event: eventType, orderId };
};

/**
 * Record Manual In-Person / Cash Payment (Doctor Dashboard)
 */
export const recordManualPayment = async (professionalId, {
  appointmentId,
  amount,
  paymentMethod = 'CASH',
  notes = 'Collected offline in clinic',
}) => {
  const apptIdStr = String(appointmentId || '').trim();
  const query = apptIdStr.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: appointmentId, professionalId }
    : { appointmentCode: appointmentId, professionalId };

  const appointment = await Appointment.findOne(query).populate('professionalId');
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  let payment;
  if (appointment.paymentId) {
    payment = await Payment.findById(appointment.paymentId);
  }

  const finalAmount = amount !== undefined ? Number(amount) : appointment.fee;

  if (payment) {
    payment.status = 'SUCCESS';
    payment.amount = finalAmount;
    payment.paymentMethod = paymentMethod;
    payment.paymentMode = 'PAY_AT_CLINIC';
    payment.gatewayProvider = 'NONE';
    payment.paidAt = new Date();
    payment.notes = notes;
    await payment.save();
  } else {
    payment = await Payment.create({
      paymentCode: generatePaymentCode(),
      appointmentId: appointment._id,
      userId: appointment.userId || undefined,
      professionalId,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      customerPhone: appointment.customerPhone,
      amount: finalAmount,
      currency: appointment.currency || 'INR',
      status: 'SUCCESS',
      paymentMethod,
      paymentMode: 'PAY_AT_CLINIC',
      gatewayProvider: 'NONE',
      invoiceNumber: generateInvoiceNumber(),
      paidAt: new Date(),
      notes,
    });
  }

  appointment.paymentStatus = 'PAID';
  appointment.paymentMode = 'PAY_AT_CLINIC';
  appointment.paymentId = payment._id;
  if (appointment.status === 'PENDING' || appointment.status === 'HOLD') {
    appointment.status = 'CONFIRMED';
  }
  await appointment.save();

  const pro = appointment.professionalId || await ProfessionalProfile.findById(professionalId);
  emitPaymentReceived({ payment, appointment, professional: pro }).catch(() => {});

  return { payment, appointment };
};

/**
 * Process a Payment Refund (Doctor Dashboard or API)
 */
export const processPaymentRefund = async (professionalId, {
  paymentId,
  orderId,
  amount,
  reason = 'Customer requested refund / appointment cancellation',
}) => {
  const cleanPayId = paymentId ? String(paymentId).trim() : '';
  const cleanOrdId = orderId ? String(orderId).trim() : '';

  const query = professionalId
    ? {
        professionalId,
        $or: [
          ...(cleanPayId ? [
            { paymentCode: cleanPayId },
            ...(cleanPayId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: cleanPayId }] : []),
          ] : []),
          ...(cleanOrdId ? [{ gatewayOrderId: cleanOrdId }, { cashfreeOrderId: cleanOrdId }] : []),
        ],
      }
    : {
        $or: [
          ...(cleanPayId ? [
            { paymentCode: cleanPayId },
            ...(cleanPayId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: cleanPayId }] : []),
          ] : []),
          ...(cleanOrdId ? [{ gatewayOrderId: cleanOrdId }, { cashfreeOrderId: cleanOrdId }] : []),
        ],
      };

  const payment = await Payment.findOne(query);
  if (!payment) {
    const err = new Error('Payment not found or unauthorized');
    err.statusCode = 404;
    throw err;
  }

  if (payment.status !== 'SUCCESS' && payment.status !== 'DEMO_SUCCESS') {
    const err = new Error(`Cannot refund payment with status '${payment.status}'`);
    err.statusCode = 400;
    throw err;
  }

  const refundAmount = amount ? Math.min(Number(amount), payment.amount) : payment.amount;
  const isPartial = refundAmount < payment.amount;

  const gateway = getPaymentGateway(payment.gatewayProvider);
  const refundResult = await gateway.processRefund({
    orderId: payment.gatewayOrderId || payment.cashfreeOrderId,
    paymentId: payment.gatewayPaymentId || payment.cashfreePaymentId || payment.paymentCode,
    amount: refundAmount,
    reason,
  });

  payment.status = isPartial ? 'PARTIALLY_REFUNDED' : 'REFUNDED';
  payment.refundStatus = 'PROCESSED';
  payment.refundAmount = refundAmount;
  payment.refundReason = reason;
  payment.refundId = refundResult.refundId || `rfnd_${Date.now()}`;
  if (refundResult.cfRefundId) {
    payment.cfRefundId = refundResult.cfRefundId;
  }
  payment.refundedAt = new Date();
  await payment.save();

  const appointment = await Appointment.findByIdAndUpdate(payment.appointmentId, {
    paymentStatus: 'REFUNDED',
  }, { new: true });

  const pro = await ProfessionalProfile.findById(payment.professionalId);
  emitPaymentRefunded({ payment, appointment, professional: pro }).catch(() => {});

  return { payment, refundResult };
};

/**
 * Get Professional Payments List with Filters, Search, and Pagination
 */
export const getProfessionalPayments = async (professionalId, query = {}) => {
  const {
    status,
    paymentMode,
    paymentMethod,
    search,
    date,
    page = 1,
    limit = 20,
  } = query;

  const filter = { professionalId };

  if (status) filter.status = status;
  if (paymentMode) filter.paymentMode = paymentMode;
  if (paymentMethod) filter.paymentMethod = paymentMethod;

  if (search && search.trim()) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { customerName: regex },
      { customerPhone: regex },
      { customerEmail: regex },
      { paymentCode: regex },
      { invoiceNumber: regex },
      { gatewayOrderId: regex },
      { gatewayPaymentId: regex },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate('appointmentId', 'appointmentCode dateString startTime endTime appointmentTypeName status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Payment.countDocuments(filter),
  ]);

  return {
    payments,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Get Comprehensive Payment Analytics for Dashboard
 */
export const getPaymentStats = async (professionalId, timezone = 'Asia/Kolkata') => {
  const todayString = getDateString(new Date(), timezone);
  const [year, month] = todayString.split('-');
  const monthPrefix = `${year}-${month}`;

  const allPayments = await Payment.find({ professionalId }).lean();

  // Strictly separate Real Cashfree Collections from Demo Mode Collections
  const totalCollected = allPayments
    .filter((p) => p.status === 'SUCCESS' && !p.isDemo)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const demoCollected = allPayments
    .filter((p) => p.status === 'DEMO_SUCCESS' || p.isDemo)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingAmount = allPayments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const refundedAmount = allPayments
    .filter((p) => p.status === 'REFUNDED' || p.status === 'PARTIALLY_REFUNDED')
    .reduce((sum, p) => sum + (p.refundAmount || p.amount || 0), 0);

  const monthCollected = allPayments
    .filter((p) => p.status === 'SUCCESS' && !p.isDemo && p.createdAt && getDateString(new Date(p.createdAt), timezone).startsWith(monthPrefix))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const methodBreakdown = {
    CASHFREE: 0,
    CASHFREE_DEMO: 0,
    UPI: 0,
    CARD: 0,
    CASH: 0,
    NETBANKING: 0,
    WALLET: 0,
    FREE: 0,
  };

  allPayments.forEach((p) => {
    if ((p.status === 'SUCCESS' || p.status === 'DEMO_SUCCESS') && p.paymentMethod && methodBreakdown[p.paymentMethod] !== undefined) {
      methodBreakdown[p.paymentMethod] += p.amount || 0;
    }
  });

  const statusBreakdown = {
    SUCCESS: allPayments.filter((p) => p.status === 'SUCCESS' && !p.isDemo).length,
    DEMO_SUCCESS: allPayments.filter((p) => p.status === 'DEMO_SUCCESS' || p.isDemo).length,
    PENDING: allPayments.filter((p) => p.status === 'PENDING').length,
    FAILED: allPayments.filter((p) => p.status === 'FAILED' || p.status === 'DEMO_FAILED').length,
    REFUNDED: allPayments.filter((p) => p.status === 'REFUNDED' || p.status === 'PARTIALLY_REFUNDED').length,
  };

  return {
    totalCollected,
    demoCollected,
    monthCollected,
    pendingAmount,
    refundedAmount,
    totalTransactions: allPayments.length,
    statusBreakdown,
    methodBreakdown,
  };
};

/**
 * Get Formatted Invoice / Receipt Payload with Ownership / Token Verification
 */
export const getInvoiceDetails = async (paymentId, { user = null, profile = null, cancelToken = '', sessionToken = '' } = {}) => {
  const cleanId = String(paymentId || '').trim();
  const query = {
    $or: [
      { paymentCode: cleanId },
      { invoiceNumber: cleanId },
      ...(cleanId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: cleanId }, { appointmentId: cleanId }] : []),
    ],
  };

  const payment = await Payment.findOne(query)
    .populate({
      path: 'appointmentId',
      select: '+cancelTokenHash',
    })
    .populate('professionalId');

  if (!payment) {
    const err = new Error('Invoice not found');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  const appointment = payment.appointmentId;
  const proProfile = payment.professionalId || profile;

  // Authorization Check:
  let isAuthorized = false;

  // 1. Doctor / Professional who owns this payment
  if (profile && payment.professionalId && payment.professionalId._id.toString() === profile._id.toString()) {
    isAuthorized = true;
  }

  // 2. User / Admin
  if (user) {
    if (user.role === 'ADMIN') isAuthorized = true;
    if (appointment && appointment.userId && appointment.userId.toString() === user._id.toString()) {
      isAuthorized = true;
    }
    if (payment.customerEmail && user.email && payment.customerEmail.toLowerCase() === user.email.toLowerCase()) {
      isAuthorized = true;
    }
  }

  // 3. Guest access with valid cancelToken or sessionToken
  if (!isAuthorized && appointment) {
    if (cancelToken && appointment.cancelTokenHash && hashCancelToken(cancelToken) === appointment.cancelTokenHash) {
      isAuthorized = true;
    } else if (sessionToken && otpService.verifyManageSessionToken(sessionToken, appointment.appointmentCode)) {
      isAuthorized = true;
    }
  }

  // 4. Safe direct receipt access by exact 24-char paymentId, payment code, or invoice number
  if (!isAuthorized) {
    if (cleanId === payment._id.toString() || cleanId === payment.paymentCode || cleanId === payment.invoiceNumber) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    const err = new Error('Access denied. You do not have permission to view this invoice.');
    err.statusCode = 403;
    err.isOperational = true;
    throw err;
  }

  return {
    invoiceNumber: payment.invoiceNumber,
    paymentCode: payment.paymentCode,
    paymentStatus: payment.status,
    isDemo: Boolean(payment.isDemo),
    demoNotice: payment.isDemo ? 'Demonstration Invoice: Processed in Cashfree Demo Mode. No real financial transaction was executed.' : undefined,
    paymentMethod: payment.paymentMethod,
    paymentMode: payment.paymentMode,
    gatewayProvider: payment.gatewayProvider,
    paidAt: payment.paidAt || payment.createdAt,
    amount: payment.amount,
    currency: payment.currency,
    refundAmount: payment.refundAmount,
    refundStatus: payment.refundStatus,
    customer: {
      name: payment.customerName,
      email: payment.customerEmail,
      phone: payment.customerPhone,
    },
    professional: {
      name: proProfile?.name || profile?.name || 'Practitioner',
      profession: proProfile?.profession || profile?.profession || 'Consultant',
      specialization: proProfile?.specialization || profile?.specialization || 'Specialist',
      businessName: proProfile?.businessName || profile?.businessName || '',
      address: proProfile?.address || profile?.address || '',
      city: proProfile?.city || profile?.city || '',
      state: proProfile?.state || profile?.state || '',
      phone: proProfile?.phone || profile?.phone || '',
      email: proProfile?.email || profile?.email || '',
    },
    appointment: appointment
      ? {
          appointmentCode: appointment.appointmentCode,
          serviceName: appointment.appointmentTypeName,
          dateString: appointment.dateString,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          duration: appointment.duration,
        }
      : null,
  };
};
