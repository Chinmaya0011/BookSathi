import http from 'http';
import { io as Client } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { ProfessionalProfile } from '../src/models/ProfessionalProfile.js';
import { Appointment } from '../src/models/Appointment.js';
import { Conversation } from '../src/models/Conversation.js';
import { initSocket } from '../src/socket/index.js';
import {
  emitAppointmentCreated,
  emitAppointmentConfirmed,
  emitAppointmentCancelled,
  emitAppointmentStatusChanged,
  sendAndPersistNotification,
} from '../src/socket/socketEmitter.js';
import { chatService } from '../src/services/chatService.js';
import { hashCancelToken } from '../src/services/appointmentService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'booksaathi_jwt_super_secret_key_2026_indian_professionals';

const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runSocketIsolationTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting Socket.IO Room Isolation & Anti-Leak Verification');
  console.log('======================================================\n');

  let server;
  let clientUserA, clientUserB, clientPro, clientAdmin;

  try {
    await connectDB();

    const timestamp = Date.now();

    // 1. Create Test Users
    const userA = await User.create({
      name: 'Patient A',
      email: `user.a.${timestamp}@test.com`,
      password: 'Password123!',
      role: 'USER',
      phone: '+91 9876543210',
      isActive: true,
    });

    const userB = await User.create({
      name: 'Patient B (Stranger)',
      email: `user.b.${timestamp}@test.com`,
      password: 'Password123!',
      role: 'USER',
      phone: '+91 9123456780',
      isActive: true,
    });

    const proUser = await User.create({
      name: 'Dr. Sharma Pro',
      email: `pro.${timestamp}@test.com`,
      password: 'Password123!',
      role: 'PROFESSIONAL',
      phone: '+91 9998887776',
      isActive: true,
    });

    const proProfile = await ProfessionalProfile.create({
      userId: proUser._id,
      name: 'Dr. Sharma Pro',
      email: proUser.email,
      phone: '9998887776',
      profession: 'Doctor',
      businessName: 'Sharma Health',
      bookingSlug: `pro-socket-${timestamp}`,
      isVerified: true,
    });

    const adminUser = await User.create({
      name: 'Admin Ops',
      email: `admin.${timestamp}@test.com`,
      password: 'Password123!',
      role: 'ADMIN',
      phone: '+91 9800000000',
      isActive: true,
    });

    // 2. Start Test HTTP Server with Socket.IO
    server = http.createServer();
    const io = initSocket(server);

    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const serverUrl = `http://localhost:${port}`;

    console.log(`[Test Server] Socket.IO running on port ${port}`);

    // 3. Connect Sockets with JWT Auth
    const tokenA = createToken(userA);
    const tokenB = createToken(userB);
    const tokenPro = createToken(proUser);
    const tokenAdmin = createToken(adminUser);

    clientUserA = Client(serverUrl, { auth: { token: tokenA }, forceNew: true });
    clientUserB = Client(serverUrl, { auth: { token: tokenB }, forceNew: true });
    clientPro = Client(serverUrl, { auth: { token: tokenPro }, forceNew: true });
    clientAdmin = Client(serverUrl, { auth: { token: tokenAdmin }, forceNew: true });

    await Promise.all([
      new Promise((res) => clientUserA.on('connect', res)),
      new Promise((res) => clientUserB.on('connect', res)),
      new Promise((res) => clientPro.on('connect', res)),
      new Promise((res) => clientAdmin.on('connect', res)),
    ]);

    assert(clientUserA.connected && clientUserB.connected && clientPro.connected && clientAdmin.connected, 'All client sockets authenticated and connected successfully');

    // 4. Test 1: Event Isolation on Appointment Creation
    console.log('\n--- 1. Appointment Creation Room Isolation ---');
    const rawCancelToken = 'a'.repeat(64);
    const appointmentA = await Appointment.create({
      appointmentCode: `BS-A${timestamp.toString().slice(-4)}`,
      professionalId: proProfile._id,
      userId: userA._id,
      customerName: userA.name,
      customerEmail: userA.email,
      customerPhone: '+91 9876543210',
      appointmentTypeName: 'General Consultation',
      dateString: '2026-09-15',
      startTime: '10:00',
      endTime: '10:30',
      startMinutes: 600,
      endMinutes: 630,
      startAt: new Date('2026-09-15T04:30:00.000Z'),
      endAt: new Date('2026-09-15T05:00:00.000Z'),
      fee: 500,
      reason: 'Frequent headaches',
      notes: 'Patient exhibits high blood pressure. Confidential clinical note.',
      cancelTokenHash: hashCancelToken(rawCancelToken),
      status: 'CONFIRMED',
    });

    let userAReceivedCreate = null;
    let userBReceivedCreate = null;
    let proReceivedCreate = null;
    let adminReceivedCreate = null;

    clientUserA.on('appointment:created', (data) => { userAReceivedCreate = data; });
    clientUserB.on('appointment:created', (data) => { userBReceivedCreate = data; });
    clientPro.on('appointment:created', (data) => { proReceivedCreate = data; });
    clientAdmin.on('appointment:created', (data) => { adminReceivedCreate = data; });

    await emitAppointmentCreated(appointmentA, proProfile, userA);
    await wait(100);

    assert(userAReceivedCreate !== null, 'User A received appointment:created for their booking');
    assert(proReceivedCreate !== null, 'Professional received appointment:created for their booking');
    assert(adminReceivedCreate !== null, 'Admin received appointment:created in admin channel');
    assert(userBReceivedCreate === null, 'User B DID NOT receive User A\'s appointment:created event (Anti-leak Verified)');

    // 5. Test 2: Payload Sanitization (No Notes, Masked Phone, No cancelToken)
    console.log('\n--- 2. Socket Payload Privacy & Sanitization ---');
    const aptInPayload = userAReceivedCreate?.appointment;
    assert(aptInPayload !== undefined, 'Payload includes sanitized appointment object');
    assert(aptInPayload.notes === undefined, 'Payload NEVER includes private clinical notes');
    assert(aptInPayload.cancelToken === undefined && aptInPayload.cancelTokenHash === undefined, 'Payload NEVER includes cancelToken or hash');
    assert(aptInPayload.customerPhone === '+91 ******3210', `Payload customerPhone is masked (${aptInPayload.customerPhone}), full phone is NOT leaked`);
    assert(aptInPayload.reason === 'Frequent headaches', 'Patient-visible reason is included');

    // 6. Test 3: Patient Status Events Scoping
    console.log('\n--- 3. Patient Status Events Scoping ---');
    let userAReceivedStatus = null;
    let userBReceivedStatus = null;

    clientUserA.on('appointment:status_changed', (data) => { userAReceivedStatus = data; });
    clientUserB.on('appointment:status_changed', (data) => { userBReceivedStatus = data; });

    await emitAppointmentConfirmed(appointmentA, proProfile, userA);
    await wait(100);

    assert(userAReceivedStatus !== null, 'User A received appointment:status_changed');
    assert(userAReceivedStatus?.status === 'CONFIRMED', 'Status changed to CONFIRMED');
    assert(userBReceivedStatus === null, 'User B DID NOT receive User A\'s status change event');

    // 7. Test 4: Dynamic Appointment Room Membership Authorization
    console.log('\n--- 4. Appointment Room Membership Security ---');
    // User A should be allowed
    const userAJoin = await new Promise((res) => {
      clientUserA.emit('join:appointment', appointmentA._id.toString(), (resp) => res(resp));
    });
    assert(userAJoin?.success === true, 'User A (appointment owner) permitted to join appointment room');

    // User B (unauthorized stranger) should be rejected
    let userBJoinError = null;
    clientUserB.once('join:appointment_error', (err) => { userBJoinError = err; });
    const userBJoin = await new Promise((res) => {
      clientUserB.emit('join:appointment', appointmentA._id.toString(), (resp) => res(resp));
      setTimeout(() => res(null), 150);
    });

    assert(userBJoin?.success !== true, 'User B rejected from joining User A\'s appointment room');
    assert(userBJoinError !== null, 'User B received join:appointment_error unauthorized message');

    // 8. Test 5: Guest Booking Room Token Authorization
    console.log('\n--- 5. Guest Booking Room Token Authorization ---');
    // Invalid token rejected
    let guestError = null;
    clientUserB.once('join:booking_error', (err) => { guestError = err; });
    const invalidJoin = await new Promise((res) => {
      clientUserB.emit('join:booking', {
        appointmentCode: appointmentA.appointmentCode,
        cancelToken: 'invalid_wrong_token_123',
      }, (resp) => res(resp));
      setTimeout(() => res(null), 150);
    });
    assert(invalidJoin?.success !== true, 'Join booking rejected with invalid token');
    assert(guestError !== null, 'Received join:booking_error on invalid token');

    // Valid cancelToken accepted
    const validJoin = await new Promise((res) => {
      clientUserB.emit('join:booking', {
        appointmentCode: appointmentA.appointmentCode,
        cancelToken: rawCancelToken,
      }, (resp) => res(resp));
    });
    assert(validJoin?.success === true, 'Join booking allowed with valid cancelToken');

    // 9. Test 6: Chat Message Isolation
    console.log('\n--- 6. Chat Message Isolation ---');
    // Conversation between User A and Pro
    const conversation = await Conversation.create({
      participants: [
        { user: userA._id, role: 'USER' },
        { user: proUser._id, role: 'PROFESSIONAL' },
      ],
      type: 'DIRECT',
      professionalProfileId: proProfile._id,
      unreadCounts: new Map([
        [userA._id.toString(), 0],
        [proUser._id.toString(), 0],
      ]),
    });

    // User B attempts to join conversation room -> should be rejected
    let convJoinError = null;
    clientUserB.once('join:conversation_error', (err) => { convJoinError = err; });
    const bConvJoin = await new Promise((res) => {
      clientUserB.emit('join:conversation', conversation._id.toString(), (resp) => res(resp));
      setTimeout(() => res(null), 150);
    });
    assert(bConvJoin?.success !== true, 'User B rejected from joining uninvited conversation');
    assert(convJoinError !== null, 'User B received join:conversation_error');

    // User A sends message to Pro
    let proReceivedMsg = null;
    let userBReceivedMsg = null;

    clientPro.on('chat:message', (msg) => { proReceivedMsg = msg; });
    clientPro.on('chat:receive_message', (msg) => { proReceivedMsg = msg; });
    clientUserB.on('chat:message', (msg) => { userBReceivedMsg = msg; });
    clientUserB.on('chat:receive_message', (msg) => { userBReceivedMsg = msg; });

    await chatService.sendMessage(userA, conversation._id, 'Hello Dr. Sharma, see you soon!');
    await wait(100);

    assert(proReceivedMsg !== null, 'Professional received chat:receive_message / chat:message');
    assert(proReceivedMsg?.text === 'Hello Dr. Sharma, see you soon!', 'Chat message text matches');
    assert(userBReceivedMsg === null, 'User B DID NOT receive message from User A to Pro (Chat Isolation Verified)');

    // 10. Test 7: Notification Isolation
    console.log('\n--- 7. Notification Isolation ---');
    let userANotif = null;
    let userBNotif = null;

    clientUserA.on('notification:new', (n) => { userANotif = n; });
    clientUserB.on('notification:new', (n) => { userBNotif = n; });

    await sendAndPersistNotification({
      userId: userA._id,
      recipientRole: 'USER',
      type: 'SYSTEM_ALERT',
      title: 'Confidential Alert',
      message: 'Private message for User A',
    });
    await wait(100);

    assert(userANotif !== null && userANotif.title === 'Confidential Alert', 'User A received their notification');
    assert(userBNotif === null, 'User B DID NOT receive User A\'s notification');

    console.log('\n======================================================');
    console.log(`📊 Socket.IO Isolation Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    if (clientUserA) clientUserA.disconnect();
    if (clientUserB) clientUserB.disconnect();
    if (clientPro) clientPro.disconnect();
    if (clientAdmin) clientAdmin.disconnect();
    if (server) server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runSocketIsolationTests();
