process.env.NODE_ENV = 'test';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { ProfessionalProfile } from '../src/models/ProfessionalProfile.js';
import { Appointment } from '../src/models/Appointment.js';
import { Payment } from '../src/models/Payment.js';
import {
  createPaymentOrder,
  getPaymentStatusByOrderId,
  handleCashfreeWebhook,
  processPaymentRefund,
} from '../src/services/paymentService.js';
import { CashfreePaymentGateway } from '../src/services/payment/cashfreeGateway.js';

let mongod;

async function runCashfreeIntegrationTests() {
  console.log('=== Starting Cashfree Payment Gateway Integration Tests ===\n');
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log(' Connected to In-Memory MongoDB');

  // 1. Setup Doctor Profile and Appointment
  const user = await User.create({
    email: 'dr.sharma@booksaathi.in',
    password: 'Password123!',
    phone: '9811122233',
    role: 'PROFESSIONAL',
  });

  const profile = await ProfessionalProfile.create({
    userId: user._id,
    name: 'Dr. Neha Sharma',
    email: 'dr.sharma@booksaathi.in',
    phone: '9811122233',
    profession: 'Physician',
    specialization: 'Internal Medicine',
    bookingSlug: 'dr-neha-sharma',
    consultationFee: 600,
  });

  const appointment = await Appointment.create({
    appointmentCode: 'BK-CF-101',
    professionalId: profile._id,
    userId: user._id,
    customerName: 'Amit Patel',
    customerPhone: '9876501234',
    customerEmail: 'amit.patel@example.com',
    appointmentDate: new Date(),
    dateString: '2026-10-15',
    startTime: '14:00',
    endTime: '14:30',
    duration: 30,
    fee: 600,
    status: 'BOOKED',
    paymentStatus: 'PENDING',
    paymentMode: 'ONLINE',
  });

  // TEST 1: Create Cashfree Payment Order
  console.log('--- Test 1: createPaymentOrder with CASHFREE provider ---');
  const orderRes = await createPaymentOrder({
    appointmentId: appointment._id,
    gatewayProvider: 'CASHFREE',
    paymentMode: 'ONLINE',
  });

  if (!orderRes.payment || !orderRes.orderId || !orderRes.paymentSessionId) {
    throw new Error('Test 1 Failed: Cashfree orderId or paymentSessionId missing');
  }

  const orderId = orderRes.orderId;
  const paymentSessionId = orderRes.paymentSessionId;
  console.log(` Created Cashfree Order: ${orderId}`);
  console.log(` Generated Payment Session ID: ${paymentSessionId}`);
  console.log(` Amount: ₹${orderRes.payment.amount}, Status: ${orderRes.payment.status}`);

  // TEST 2: Check Payment Status by Order ID
  console.log('\n--- Test 2: getPaymentStatusByOrderId ---');
  const statusRes = await getPaymentStatusByOrderId(orderId);
  if (statusRes.orderId !== orderId) {
    throw new Error(`Test 2 Failed: Expected orderId ${orderId}, got ${statusRes.orderId}`);
  }
  console.log(` Order Status retrieved: ${statusRes.status} for Order ID: ${statusRes.orderId}`);

  // TEST 3: Cashfree Webhook Signature Verification (HMAC-SHA256)
  console.log('\n--- Test 3: Cashfree HMAC-SHA256 Webhook Verification ---');
  const gateway = new CashfreePaymentGateway();
  const testSecret = 'cf_secret_key_test_12345';
  gateway.secretKey = testSecret;

  const sampleTimestamp = `${Date.now()}`;
  const sampleRawBody = JSON.stringify({
    data: {
      order: {
        order_id: orderId,
        order_amount: 600.0,
        order_currency: 'INR',
      },
      payment: {
        cf_payment_id: '12345678',
        payment_status: 'SUCCESS',
        payment_amount: 600.0,
        payment_currency: 'INR',
        payment_method: { upi: { channel: 'collect', upi_id: 'amit@okhdfcbank' } },
        payment_group: 'upi',
      },
    },
    event: 'PAYMENT_SUCCESS_WEBHOOK',
  });

  const validSignature = crypto
    .createHmac('sha256', testSecret)
    .update(`${sampleTimestamp}${sampleRawBody}`)
    .digest('base64');

  const isSigValid = gateway.verifyWebhookSignature({
    signature: validSignature,
    rawBody: sampleRawBody,
    timestamp: sampleTimestamp,
  });

  if (!isSigValid) {
    throw new Error('Test 3 Failed: Valid signature was rejected');
  }

  const isFakeSigValid = gateway.verifyWebhookSignature({
    signature: 'invalid_tampered_signature==',
    rawBody: sampleRawBody,
    timestamp: sampleTimestamp,
  });

  if (isFakeSigValid) {
    throw new Error('Test 3 Failed: Invalid signature was accepted');
  }
  console.log(' Webhook signature verification confirmed secure against tampering');

  // TEST 4: Handle Webhook Execution & Database State Updates
  console.log('\n--- Test 4: Webhook Processing (PAYMENT_SUCCESS_WEBHOOK) ---');
  const webhookRes = await handleCashfreeWebhook({
    rawBody: sampleRawBody,
    headers: {
      'x-webhook-signature': validSignature,
      'x-webhook-timestamp': sampleTimestamp,
    },
    body: JSON.parse(sampleRawBody),
  });

  if (!webhookRes.processed || webhookRes.status !== 'SUCCESS') {
    throw new Error(`Test 4 Failed: Webhook processing failed: ${JSON.stringify(webhookRes)}`);
  }

  const updatedPayment = await Payment.findOne({ gatewayOrderId: orderId });
  const updatedAppointment = await Appointment.findById(appointment._id);

  if (updatedPayment.status !== 'SUCCESS') {
    throw new Error(`Test 4 Failed: Payment status is ${updatedPayment.status}, expected SUCCESS`);
  }
  if (updatedAppointment.paymentStatus !== 'PAID') {
    throw new Error(`Test 4 Failed: Appointment paymentStatus is ${updatedAppointment.paymentStatus}, expected PAID`);
  }
  console.log(` Payment & Appointment successfully updated to PAID via Webhook`);

  // TEST 5: Idempotency (Duplicate Webhook Delivery)
  console.log('\n--- Test 5: Idempotent Duplicate Webhook Delivery ---');
  const dupWebhookRes = await handleCashfreeWebhook({
    rawBody: sampleRawBody,
    headers: {
      'x-webhook-signature': validSignature,
      'x-webhook-timestamp': sampleTimestamp,
    },
    body: JSON.parse(sampleRawBody),
  });

  if (!dupWebhookRes.idempotent && dupWebhookRes.status !== 'SUCCESS') {
    throw new Error('Test 5 Failed: Duplicate webhook handling failed');
  }
  console.log(' Duplicate webhook handled safely and idempotently without errors');

  // TEST 6: Prevent Double Orders for Already-Paid Appointment
  console.log('\n--- Test 6: Prevent Order Creation on Paid Booking ---');
  let duplicatePrevented = false;
  try {
    await createPaymentOrder({
      appointmentId: appointment._id,
      gatewayProvider: 'CASHFREE',
    });
  } catch (err) {
    duplicatePrevented = true;
    console.log(` Expected rejection: ${err.message}`);
  }

  if (!duplicatePrevented) {
    throw new Error('Test 6 Failed: Re-creating order on already-paid booking was not rejected');
  }

  // TEST 7: Process Cashfree Refund
  console.log('\n--- Test 7: Cashfree Refund Flow ---');
  const refundRes = await processPaymentRefund(profile._id, {
    orderId,
    amount: 600,
    reason: 'Customer cancelled booking',
  });

  if (refundRes.payment.status !== 'REFUNDED' || refundRes.payment.refundStatus !== 'PROCESSED') {
    throw new Error(`Test 7 Failed: Refund status ${refundRes.payment.status}`);
  }

  const refundedAppt = await Appointment.findById(appointment._id);
  if (refundedAppt.paymentStatus !== 'REFUNDED') {
    throw new Error(`Test 7 Failed: Appointment paymentStatus ${refundedAppt.paymentStatus}`);
  }
  console.log(` Refund successfully processed: Refund ID ${refundRes.refundResult.refundId}`);

  console.log('\n======================================================');
  console.log(' ALL CASHFREE PAYMENT GATEWAY TESTS PASSED (7/7)!');
  console.log('======================================================\n');

  await mongoose.disconnect();
  await mongod.stop();
  process.exit(0);
}

runCashfreeIntegrationTests().catch(async (err) => {
  console.error(' Cashfree Test Failed:', err);
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  if (mongod) await mongod.stop();
  process.exit(1);
});
