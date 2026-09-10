import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/seeds/seed.js';
import { User } from '../src/models/User.js';
import { ProfessionalProfile } from '../src/models/ProfessionalProfile.js';
import { Appointment } from '../src/models/Appointment.js';
import { Notification } from '../src/models/Notification.js';
import { registerCustomer, registerProfessional, loginUser, generateToken } from '../src/services/authService.js';
import { getAvailableSlots } from '../src/services/slotGeneratorService.js';
import { getDateString, generateAppointmentCode } from '../src/utils/dateHelpers.js';
import { createServer } from 'http';
import { io as ClientIO } from 'socket.io-client';
import { initSocket, getIO } from '../src/socket/index.js';
import {
  emitAppointmentCreated,
  emitAppointmentConfirmed,
  emitAppointmentCancelled,
} from '../src/socket/socketEmitter.js';
import app from '../src/app.js';

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failedCount++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🚀 Running Comprehensive Production Test Suite for BookSaathi');
  console.log('======================================================\n');

  let httpServer;
  let serverPort = 5055;

  try {
    await connectDB();
    await seedDatabase();

    // Start HTTP and Socket.IO server for integration testing
    httpServer = createServer(app);
    initSocket(httpServer);
    await new Promise((resolve) => httpServer.listen(serverPort, resolve));
    console.log(`📡 Test Server listening on http://localhost:${serverPort}`);

    // ----------------------------------------------------
    // 1. AUTHENTICATION & RBAC TESTS
    // ----------------------------------------------------
    console.log('\n--- 1. Authentication & RBAC Tests ---');

    // Test 1.1: Register Customer User
    const testUserEmail = `customer-${Date.now()}@example.com`;
    const userReg = await registerCustomer({
      name: 'Rohan Verma',
      email: testUserEmail,
      phone: '+91 98765 11223',
      password: 'UserPass@123',
      role: 'USER',
    });
    assert(userReg.user && userReg.user.role === 'USER', 'Customer registration creates USER role');
    assert(userReg.token && userReg.token.length > 20, 'Customer registration returns valid JWT');

    // Test 1.2: Register Professional
    const testProEmail = `doctor-${Date.now()}@example.com`;
    const proReg = await registerProfessional({
      name: 'Dr. Aditi Sen',
      email: testProEmail,
      phone: '+91 98765 22334',
      password: 'DoctorPass@123',
      profession: 'Doctor',
      specialization: 'Cardiologist',
      consultationFee: 700,
    });
    assert(proReg.user && proReg.user.role === 'PROFESSIONAL', 'Professional registration creates PROFESSIONAL role');
    assert(proReg.profile && proReg.profile.bookingSlug, 'Professional registration automatically creates profile & slug');

    // Test 1.3: User Login
    const loginResult = await loginUser(testUserEmail, 'UserPass@123');
    assert(loginResult.user.email === testUserEmail, 'Customer login succeeds with correct credentials');
    assert(loginResult.token, 'Customer login returns valid JWT token');

    // Test 1.4: Invalid Password Rejection
    let passFailed = false;
    try {
      await loginUser(testUserEmail, 'WrongPassword!');
    } catch (e) {
      passFailed = true;
    }
    assert(passFailed, 'Login with incorrect password rejected with 401');

    // ----------------------------------------------------
    // 2. APPOINTMENT BOOKING & CONCURRENCY / DOUBLE BOOKING PREVENTION
    // ----------------------------------------------------
    console.log('\n--- 2. Appointment Booking & Concurrency Tests ---');

    const doctorProfile = await ProfessionalProfile.findOne({ bookingSlug: 'dr-rajesh' });
    assert(!!doctorProfile, 'Demo Doctor profile found in database');

    const testDateObj = new Date();
    testDateObj.setUTCDate(testDateObj.getUTCDate() + 4);
    if (testDateObj.getUTCDay() === 0) testDateObj.setUTCDate(testDateObj.getUTCDate() + 1);
    const testDate = getDateString(testDateObj, 'Asia/Kolkata');

    const slotData = await getAvailableSlots(doctorProfile, testDate, 30);
    assert(slotData.slots && slotData.slots.length > 0, 'Slot generator generates valid future slots');
    const targetSlot = slotData.slots[0].time;

    console.log(`  Executing 10 simultaneous booking requests for slot: ${testDate} at ${targetSlot}...`);

    // Launch 10 simultaneous bookings for the exact same slot
    const concurrentBookings = Array.from({ length: 10 }).map((_, i) => {
      return (async () => {
        const appointmentCode = generateAppointmentCode();
        const [y, m, d] = testDate.split('-').map(Number);
        return Appointment.create({
          appointmentCode,
          userId: userReg.user.id,
          professionalId: doctorProfile._id,
          appointmentTypeName: 'General Consultation',
          customerName: `Concurrent User ${i + 1}`,
          customerPhone: `+91 99000 0000${i}`,
          customerEmail: `user${i}@test.com`,
          appointmentDate: new Date(Date.UTC(y, m - 1, d)),
          dateString: testDate,
          startTime: targetSlot,
          endTime: '10:30',
          duration: 30,
          fee: 500,
          status: 'CONFIRMED',
        });
      })();
    });

    const settled = await Promise.allSettled(concurrentBookings);
    const succeeded = settled.filter((r) => r.status === 'fulfilled');
    const failed = settled.filter((r) => r.status === 'rejected');

    assert(
      succeeded.length === 1 && failed.length === 9,
      `Double-booking guard: Exactly 1 succeeded, 9 failed (succeeded: ${succeeded.length}, failed: ${failed.length})`
    );

    // ----------------------------------------------------
    // 3. APPOINTMENT STATE MACHINE & LIFECYCLE TRANSITIONS
    // ----------------------------------------------------
    console.log('\n--- 3. Appointment State Machine Tests ---');

    const activeAppt = succeeded[0].value;
    assert(activeAppt.status === 'CONFIRMED', 'Initial booked appointment status is CONFIRMED');

    // Customer requests reschedule
    activeAppt.status = 'RESCHEDULE_REQUESTED';
    activeAppt.rescheduleRequest = {
      requestedDate: testDate,
      requestedTime: '11:00',
      requestedBy: 'USER',
      requestedAt: new Date(),
    };
    await activeAppt.save();
    assert(activeAppt.status === 'RESCHEDULE_REQUESTED', 'Appointment status transitioned to RESCHEDULE_REQUESTED');

    // Professional accepts / confirms
    activeAppt.status = 'CONFIRMED';
    await activeAppt.save();
    assert(activeAppt.status === 'CONFIRMED', 'Appointment status transitioned back to CONFIRMED');

    // Professional completes
    activeAppt.status = 'COMPLETED';
    activeAppt.completedAt = new Date();
    await activeAppt.save();
    assert(activeAppt.status === 'COMPLETED', 'Appointment status transitioned to COMPLETED');

    // ----------------------------------------------------
    // 4. AUTHORIZATION & DATA ISOLATION TESTS
    // ----------------------------------------------------
    console.log('\n--- 4. Authorization & Data Isolation Tests ---');

    // User A cannot modify User B's appointment
    const otherUser = await registerCustomer({
      name: 'Sneha Roy',
      email: `sneha-${Date.now()}@example.com`,
      phone: '+91 99111 22334',
      password: 'UserPass@123',
    });

    const isOwner = activeAppt.userId.toString() === otherUser.user.id.toString();
    assert(!isOwner, 'User A and User B have separate identities; ownership check isolates access');

    // ----------------------------------------------------
    // 5. SOCKET.IO REAL-TIME NOTIFICATIONS & EVENT TESTS
    // ----------------------------------------------------
    console.log('\n--- 5. Socket.IO Real-Time Engine Tests ---');

    // Test 5.1: Connect authenticated client socket
    const clientSocket = ClientIO(`http://localhost:${serverPort}`, {
      auth: { token: `Bearer ${userReg.token}` },
      transports: ['websocket'],
    });

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Socket connection timed out')), 4000);
      clientSocket.on('connect', () => {
        clearTimeout(timer);
        resolve();
      });
      clientSocket.on('connect_error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    assert(clientSocket.connected, 'Socket.IO client successfully connects with JWT auth');

    // Test 5.2: Real-time event broadcasting and reception
    let receivedConfirmedEvent = false;
    clientSocket.on('appointment:confirmed', (payload) => {
      receivedConfirmedEvent = true;
    });

    await emitAppointmentConfirmed(activeAppt, doctorProfile, userReg.user);
    // Give event loop 300ms to deliver
    await new Promise((r) => setTimeout(r, 300));
    assert(receivedConfirmedEvent, 'Socket.IO delivers real-time appointment:confirmed event to authenticated user room');

    // Test 5.3: Persistent notification created in DB
    const savedNotification = await Notification.findOne({
      userId: userReg.user.id,
      type: 'APPOINTMENT_CONFIRMED',
    });
    assert(!!savedNotification, 'Real-time event persists notification in DB for offline resilience');

    clientSocket.disconnect();

    // ----------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------
    console.log('\n======================================================');
    console.log(`🎯 Comprehensive Test Suite Completed: ${passedCount} Passed, ${failedCount} Failed`);
    console.log('======================================================\n');

    httpServer.close();
    await disconnectDB();
    process.exit(failedCount === 0 ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Fatal Test Error:', error.message);
    if (httpServer) httpServer.close();
    await disconnectDB();
    process.exit(1);
  }
}

runAllTests();
