import crypto from 'crypto';
import { Payment } from '../models/Payment.js';
import { Appointment } from '../models/Appointment.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { getPaymentGateway } from './payment/index.js';
import { getDateString } from '../utils/dateHelpers.js';

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
  gatewayProvider = 'SIMULATED',
  paymentMode = 'ONLINE',
}) => {
  const appointment = await Appointment.findById(appointmentId).populate('professionalId');
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
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

    return {
      isFree: true,
      payment,
      appointment,
    };
  }

  // Handle Pay at Clinic / Venue
  if (paymentMode === 'PAY_AT_CLINIC') {
    const payment = await Payment.create({
      paymentCode: generatePaymentCode(),
      appointmentId: appointment._id,
      professionalId: profile._id,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      customerPhone: appointment.customerPhone,
      amount,
      currency,
      status: 'PENDING',
      paymentMethod: 'CASH',
      paymentMode: 'PAY_AT_CLINIC',
      gatewayProvider: 'MANUAL_CASH',
      invoiceNumber: generateInvoiceNumber(),
      notes: 'Payment to be collected in person at consultation.',
    });

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

  // Online Payment Flow via Gateway Adapter
  const gateway = getPaymentGateway(gatewayProvider);
  const orderData = await gateway.createOrder({
    amount,
    currency,
    receipt: appointment.appointmentCode,
    customer: {
      name: appointment.customerName,
      email: appointment.customerEmail,
      phone: appointment.customerPhone,
    },
    notes: {
      appointmentCode: appointment.appointmentCode,
      professionalName: profile.name,
    },
  });

  const payment = await Payment.create({
    paymentCode: generatePaymentCode(),
    appointmentId: appointment._id,
    professionalId: profile._id,
    customerName: appointment.customerName,
    customerEmail: appointment.customerEmail,
    customerPhone: appointment.customerPhone,
    amount,
    currency,
    status: 'PENDING',
    paymentMethod: 'GATEWAY',
    paymentMode: 'ONLINE',
    gatewayProvider: gateway.name,
    gatewayOrderId: orderData.orderId,
    invoiceNumber: generateInvoiceNumber(),
    metadata: { orderDetails: orderData },
  });

  appointment.paymentStatus = 'PENDING';
  appointment.paymentMode = 'ONLINE';
  appointment.paymentId = payment._id;
  await appointment.save();

  return {
    isOnline: true,
    payment,
    gatewayOrder: orderData,
    appointment,
  };
};

/**
 * Verify and Confirm Payment Completion
 */
export const verifyAndConfirmPayment = async ({
  paymentId,
  gatewayOrderId,
  gatewayPaymentId,
  gatewaySignature,
  paymentMethod = 'UPI',
  simulateFailure = false,
  notes = '',
}) => {
  const filter = paymentId ? { _id: paymentId } : { gatewayOrderId };
  const payment = await Payment.findOne(filter);

  if (!payment) {
    const err = new Error('Payment transaction not found');
    err.statusCode = 404;
    throw err;
  }

  const gateway = getPaymentGateway(payment.gatewayProvider);
  const verificationResult = await gateway.verifyPayment({
    orderId: gatewayOrderId || payment.gatewayOrderId,
    paymentId: gatewayPaymentId,
    signature: gatewaySignature,
    simulateFailure,
  });

  if (!verificationResult.isValid || verificationResult.status === 'FAILED') {
    payment.status = 'FAILED';
    payment.gatewayPaymentId = gatewayPaymentId || payment.gatewayPaymentId;
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
  payment.status = 'SUCCESS';
  payment.paymentMethod = paymentMethod;
  payment.gatewayPaymentId = verificationResult.paymentId || gatewayPaymentId;
  payment.gatewaySignature = gatewaySignature || '';
  payment.gatewayRawResponse = verificationResult.raw;
  payment.paidAt = new Date();
  if (notes) payment.notes = notes;
  await payment.save();

  const appointment = await Appointment.findByIdAndUpdate(
    payment.appointmentId,
    {
      paymentStatus: 'PAID',
      paymentId: payment._id,
    },
    { new: true }
  );

  return {
    payment,
    appointment,
    verificationResult,
  };
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
  const appointment = await Appointment.findOne({ _id: appointmentId, professionalId });
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
    payment.gatewayProvider = 'MANUAL_CASH';
    payment.paidAt = new Date();
    payment.notes = notes;
    await payment.save();
  } else {
    payment = await Payment.create({
      paymentCode: generatePaymentCode(),
      appointmentId: appointment._id,
      professionalId,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      customerPhone: appointment.customerPhone,
      amount: finalAmount,
      currency: appointment.currency || 'INR',
      status: 'SUCCESS',
      paymentMethod,
      paymentMode: 'PAY_AT_CLINIC',
      gatewayProvider: 'MANUAL_CASH',
      invoiceNumber: generateInvoiceNumber(),
      paidAt: new Date(),
      notes,
    });
  }

  appointment.paymentStatus = 'PAID';
  appointment.paymentMode = 'PAY_AT_CLINIC';
  appointment.paymentId = payment._id;
  await appointment.save();

  return { payment, appointment };
};

/**
 * Process a Payment Refund (Doctor Dashboard)
 */
export const processPaymentRefund = async (professionalId, {
  paymentId,
  amount,
  reason = 'Customer requested refund / appointment cancellation',
}) => {
  const payment = await Payment.findOne({ _id: paymentId, professionalId });
  if (!payment) {
    const err = new Error('Payment not found');
    err.statusCode = 404;
    throw err;
  }

  if (payment.status !== 'SUCCESS') {
    const err = new Error(`Cannot refund payment with status '${payment.status}'`);
    err.statusCode = 400;
    throw err;
  }

  const refundAmount = amount ? Math.min(Number(amount), payment.amount) : payment.amount;
  const isPartial = refundAmount < payment.amount;

  const gateway = getPaymentGateway(payment.gatewayProvider);
  const refundResult = await gateway.processRefund({
    paymentId: payment.gatewayPaymentId || payment.paymentCode,
    amount: refundAmount,
    reason,
  });

  payment.status = isPartial ? 'PARTIALLY_REFUNDED' : 'REFUNDED';
  payment.refundStatus = 'PROCESSED';
  payment.refundAmount = refundAmount;
  payment.refundReason = reason;
  payment.refundId = refundResult.refundId || `rfnd_${Date.now()}`;
  payment.refundedAt = new Date();
  await payment.save();

  await Appointment.findByIdAndUpdate(payment.appointmentId, {
    paymentStatus: 'REFUNDED',
  });

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

  if (search) {
    const regex = new RegExp(search, 'i');
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

  const totalCollected = allPayments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingAmount = allPayments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const refundedAmount = allPayments
    .filter((p) => p.status === 'REFUNDED' || p.status === 'PARTIALLY_REFUNDED')
    .reduce((sum, p) => sum + (p.refundAmount || p.amount || 0), 0);

  const monthCollected = allPayments
    .filter((p) => p.status === 'SUCCESS' && p.createdAt && new Date(p.createdAt).toISOString().startsWith(monthPrefix))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const methodBreakdown = {
    UPI: 0,
    CARD: 0,
    CASH: 0,
    NETBANKING: 0,
    WALLET: 0,
    SIMULATED: 0,
    FREE: 0,
  };

  allPayments.forEach((p) => {
    if (p.status === 'SUCCESS' && p.paymentMethod && methodBreakdown[p.paymentMethod] !== undefined) {
      methodBreakdown[p.paymentMethod] += p.amount || 0;
    }
  });

  const statusBreakdown = {
    SUCCESS: allPayments.filter((p) => p.status === 'SUCCESS').length,
    PENDING: allPayments.filter((p) => p.status === 'PENDING').length,
    FAILED: allPayments.filter((p) => p.status === 'FAILED').length,
    REFUNDED: allPayments.filter((p) => p.status === 'REFUNDED' || p.status === 'PARTIALLY_REFUNDED').length,
  };

  return {
    totalCollected,
    monthCollected,
    pendingAmount,
    refundedAmount,
    totalTransactions: allPayments.length,
    statusBreakdown,
    methodBreakdown,
  };
};

/**
 * Get Formatted Invoice / Receipt Payload
 */
export const getInvoiceDetails = async (paymentId) => {
  const payment = await Payment.findById(paymentId)
    .populate('appointmentId')
    .populate('professionalId');

  if (!payment) {
    const err = new Error('Invoice not found');
    err.statusCode = 404;
    throw err;
  }

  const appointment = payment.appointmentId;
  const profile = payment.professionalId;

  return {
    invoiceNumber: payment.invoiceNumber,
    paymentCode: payment.paymentCode,
    paymentStatus: payment.status,
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
      name: profile?.name,
      profession: profile?.profession,
      specialization: profile?.specialization,
      businessName: profile?.businessName,
      address: profile?.address,
      city: profile?.city,
      state: profile?.state,
      phone: profile?.phone,
      email: profile?.email,
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
