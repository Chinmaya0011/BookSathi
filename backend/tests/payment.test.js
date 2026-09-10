import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { ProfessionalProfile } from '../src/models/ProfessionalProfile.js';
import { Appointment } from '../src/models/Appointment.js';
import { Payment } from '../src/models/Payment.js';
import {
  createPaymentOrder,
  verifyAndConfirmPayment,
  recordManualPayment,
  processPaymentRefund,
  getProfessionalPayments,
  getPaymentStats,
  getInvoiceDetails,
} from '../src/services/paymentService.js';

let mongod;

async function runPaymentTests() {
  console.log('--- Starting Payment Logic Subsystem Tests ---');
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log(' Connected to In-Memory MongoDB');

  // 1. Create Test User and Professional Profile
  const user = await User.create({
    email: 'doctor@example.com',
    password: 'Password123!',
    phone: '9876543210',
    role: 'PROFESSIONAL',
  });

  const profile = await ProfessionalProfile.create({
    userId: user._id,
    name: 'Dr. Aarav Mehta',
    email: 'doctor@example.com',
    phone: '9876543210',
    profession: 'Doctor',
    specialization: 'Cardiologist',
    bookingSlug: 'dr-aarav-test',
    consultationFee: 750,
  });

  // 2. Create Test Appointments
  const appt1 = await Appointment.create({
    appointmentCode: 'BK-TEST-001',
    professionalId: profile._id,
    customerName: 'Rahul Verma',
    customerPhone: '+91 9876543210',
    customerEmail: 'rahul@example.com',
    appointmentDate: new Date(),
    dateString: '2026-09-10',
    startTime: '10:00',
    endTime: '10:30',
    duration: 30,
    fee: 750,
    status: 'CONFIRMED',
    paymentStatus: 'PENDING',
    paymentMode: 'ONLINE',
  });

  const appt2 = await Appointment.create({
    appointmentCode: 'BK-TEST-002',
    professionalId: profile._id,
    customerName: 'Priya Sharma',
    customerPhone: '+91 9876543211',
    customerEmail: 'priya@example.com',
    appointmentDate: new Date(),
    dateString: '2026-09-10',
    startTime: '11:00',
    endTime: '11:30',
    duration: 30,
    fee: 500,
    status: 'CONFIRMED',
    paymentStatus: 'PAY_AT_CLINIC',
    paymentMode: 'PAY_AT_CLINIC',
  });

  console.log(' Test profile & appointments created successfully');

  // TEST 1: Create Online Payment Order (Adapter Gateway)
  console.log('\n--- Test 1: createPaymentOrder (Online Simulation) ---');
  const orderResult = await createPaymentOrder({
    appointmentId: appt1._id,
    paymentMode: 'ONLINE',
    gatewayProvider: 'SIMULATED',
  });

  if (!orderResult.payment || !orderResult.gatewayOrder?.orderId) {
    throw new Error('Test 1 Failed: Order or payment record missing');
  }
  console.log(` Order Created: ${orderResult.gatewayOrder.orderId} for Payment: ${orderResult.payment.paymentCode}`);

  // TEST 2: Verify and Confirm Payment
  console.log('\n--- Test 2: verifyAndConfirmPayment ---');
  const confirmResult = await verifyAndConfirmPayment({
    paymentId: orderResult.payment._id,
    gatewayOrderId: orderResult.gatewayOrder.orderId,
    paymentMethod: 'UPI',
  });

  if (confirmResult.payment.status !== 'SUCCESS') {
    throw new Error(`Test 2 Failed: Status is ${confirmResult.payment.status}, expected SUCCESS`);
  }

  const updatedAppt1 = await Appointment.findById(appt1._id);
  if (updatedAppt1.paymentStatus !== 'PAID') {
    throw new Error(`Test 2 Failed: Appointment paymentStatus is ${updatedAppt1.paymentStatus}, expected PAID`);
  }
  console.log(` Payment Verified and Appointment marked as ${updatedAppt1.paymentStatus}`);

  // TEST 3: Record Manual In-Person Payment
  console.log('\n--- Test 3: recordManualPayment (In-Clinic Cash) ---');
  const manualResult = await recordManualPayment(profile._id, {
    appointmentId: appt2._id,
    amount: 500,
    paymentMethod: 'CASH',
    notes: 'Collected at clinic desk',
  });

  if (manualResult.payment.status !== 'SUCCESS' || manualResult.payment.paymentMethod !== 'CASH') {
    throw new Error('Test 3 Failed: Manual payment recording failed');
  }
  console.log(` Manual Payment recorded: ${manualResult.payment.invoiceNumber} with status ${manualResult.payment.status}`);

  // TEST 4: Issue Payment Refund
  console.log('\n--- Test 4: processPaymentRefund ---');
  const refundResult = await processPaymentRefund(profile._id, {
    paymentId: confirmResult.payment._id,
    amount: 750,
    reason: 'Patient requested reschedule',
  });

  if (refundResult.payment.status !== 'REFUNDED') {
    throw new Error(`Test 4 Failed: Payment status is ${refundResult.payment.status}, expected REFUNDED`);
  }
  console.log(` Refund Processed: ${refundResult.refundResult.refundId} for amount ₹${refundResult.payment.refundAmount}`);

  // TEST 5: Get Payments Query & Stats
  console.log('\n--- Test 5: getProfessionalPayments & getPaymentStats ---');
  const listResult = await getProfessionalPayments(profile._id, {});
  if (listResult.payments.length < 2) {
    throw new Error(`Test 5 Failed: Expected at least 2 payments, got ${listResult.payments.length}`);
  }

  const stats = await getPaymentStats(profile._id);
  console.log(` Stats: Total Collected: ₹${stats.totalCollected}, Total Refunded: ₹${stats.refundedAmount}`);

  // TEST 6: Get Invoice Details
  console.log('\n--- Test 6: getInvoiceDetails ---');
  const invoice = await getInvoiceDetails(manualResult.payment._id);
  if (!invoice.invoiceNumber || !invoice.customer?.name) {
    throw new Error('Test 6 Failed: Invoice details incomplete');
  }
  console.log(` Invoice Data verified: ${invoice.invoiceNumber} for ${invoice.customer.name}`);

  console.log('\n ALL PAYMENT SYSTEM TESTS PASSED SUCCESSFULLY! \n');
  await mongoose.disconnect();
  await mongod.stop();
  process.exit(0);
}

runPaymentTests().catch(async (err) => {
  console.error(' Payment Test Failed:', err);
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  if (mongod) await mongod.stop();
  process.exit(1);
});
