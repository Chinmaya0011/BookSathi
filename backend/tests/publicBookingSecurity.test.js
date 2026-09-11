import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { ProfessionalProfile } from '../src/models/ProfessionalProfile.js';
import { Appointment } from '../src/models/Appointment.js';
import { Availability } from '../src/models/Availability.js';
import {
  createPublicBooking,
  getBookingChallengeService,
  cancelPublicBookingService,
  requestPublicRescheduleService,
  hashCancelToken,
} from '../src/services/appointmentService.js';
import { otpService } from '../src/services/otpService.js';
import { getDateString } from '../src/utils/dateHelpers.js';

let replSet;

async function runSecurityTests() {
  console.log('\n======================================================');
  console.log('🔒 Starting BookSaathi Public Booking Security Test Suite');
  console.log('======================================================\n');

  process.env.NODE_ENV = 'test';
  process.env.TEST_FIXED_OTP = '458921';

  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
  console.log('✓ Connected to MongoDB Replica Set');

  await Appointment.init();
  await ProfessionalProfile.init();
  await Availability.init();
  await User.init();
  console.log('✓ MongoDB indexes verified & initialized');

  // 1. Create Test Professional
  const profUser = await User.create({
    email: 'dr.security@example.com',
    password: 'Password123!',
    phone: '9876543210',
    role: 'PROFESSIONAL',
  });

  const profile = await ProfessionalProfile.create({
    userId: profUser._id,
    name: 'Dr. Security Specialist',
    email: 'dr.security@example.com',
    phone: '9876543210',
    profession: 'Doctor',
    bookingSlug: 'dr-security',
    consultationFee: 500,
    isPublic: true,
    bookingSettings: {
      appointmentDuration: 30,
      bufferTime: 0,
      maxAdvanceDays: 60,
      allowSameDayBooking: true,
      minNoticeMinutes: 120, // 2 hours notice required for cancellations
    },
  });

  for (let day = 0; day <= 6; day++) {
    await Availability.create({
      professionalId: profile._id,
      dayOfWeek: day,
      enabled: true,
      timeRanges: [{ startTime: '08:00', endTime: '22:00' }],
    });
  }
  console.log('✓ Test professional created with 2-hour minNoticeMinutes');

  // Determine future test date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 5);
  const futureDateStr = getDateString(futureDate, 'Asia/Kolkata');

  // ----------------------------------------------------
  // TEST 1: Creation generates appointmentCode, raw cancelToken & hash
  // ----------------------------------------------------
  console.log('\n--- TEST 1: Public Booking Creation Security Tokens ---');
  const booking1 = await createPublicBooking('dr-security', {
    date: futureDateStr,
    startTime: '10:00',
    customerName: 'Aarav Sharma',
    customerPhone: '9876543211',
    customerEmail: 'aarav@example.com',
  });

  if (!booking1.appointment.appointmentCode || !booking1.appointment.appointmentCode.startsWith('BS-')) {
    throw new Error(`Expected appointmentCode starting with BS-, got: ${booking1.appointment.appointmentCode}`);
  }
  if (!booking1.cancelToken || booking1.cancelToken.length < 32) {
    throw new Error(`Expected raw cancelToken in booking response, got: ${booking1.cancelToken}`);
  }
  if (!booking1.manageUrl || !booking1.manageUrl.includes(booking1.cancelToken)) {
    throw new Error(`Expected manageUrl containing cancelToken, got: ${booking1.manageUrl}`);
  }

  // Verify DB record has hash and raw token is NOT in DB
  const rawDbAppt = await Appointment.findById(booking1.appointment._id).select('+cancelTokenHash');
  if (!rawDbAppt.cancelTokenHash) {
    throw new Error('Expected cancelTokenHash stored in database');
  }
  if (rawDbAppt.cancelTokenHash === booking1.cancelToken) {
    throw new Error('Raw cancelToken should NEVER be stored in DB in plaintext! Must be hashed.');
  }
  if (rawDbAppt.cancelTokenHash !== hashCancelToken(booking1.cancelToken)) {
    throw new Error('Stored hash does not match sha256 of raw token');
  }

  // Verify list query hides cancelTokenHash by default
  const queryListAppt = await Appointment.findById(booking1.appointment._id);
  if (queryListAppt.cancelTokenHash) {
    throw new Error('cancelTokenHash leaked in default query selection! Must be select: false.');
  }
  console.log('✓ PASS: appointmentCode generated, raw cancelToken returned once, hash stored securely, hidden from standard queries');

  // ----------------------------------------------------
  // TEST 2: Guessing Attack Protection (Appointment Code Alone Rejection)
  // ----------------------------------------------------
  console.log('\n--- TEST 2: Guessing Protection with visible Appointment Code ---');
  let guessedRejected = false;
  try {
    await cancelPublicBookingService({
      appointmentCode: booking1.appointment.appointmentCode,
      // No token, no OTP, no session
    });
  } catch (err) {
    if (err.statusCode === 401) {
      guessedRejected = true;
    } else {
      throw new Error(`Expected 401 Unauthorized for guessing attempt, got: ${err.statusCode} - ${err.message}`);
    }
  }
  if (!guessedRejected) {
    throw new Error('SECURITY VULNERABILITY: Booking cancelled with visible appointment code alone!');
  }

  // Also test with wrong token
  let wrongTokenRejected = false;
  try {
    await cancelPublicBookingService({
      appointmentCode: booking1.appointment.appointmentCode,
      cancelToken: 'invalid-guess-token-1234567890abcdef',
    });
  } catch (err) {
    if (err.statusCode === 401) {
      wrongTokenRejected = true;
    }
  }
  if (!wrongTokenRejected) {
    throw new Error('SECURITY VULNERABILITY: Booking cancelled with invalid token!');
  }
  console.log('✓ PASS: Public cancel rejected (401) when attempting with appointment code alone or invalid token');

  // ----------------------------------------------------
  // TEST 3: Successful Cancel via Valid Raw cancelToken
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Cancel via Valid cancelToken ---');
  const cancelResult1 = await cancelPublicBookingService({
    appointmentCode: booking1.appointment.appointmentCode,
    cancelToken: booking1.cancelToken,
    reason: 'Change of travel plans',
  });

  if (!cancelResult1.success || cancelResult1.appointment.status !== 'CANCELLED') {
    throw new Error('Expected appointment to be CANCELLED');
  }

  const cancelledApptDb = await Appointment.findById(booking1.appointment._id);
  if (cancelledApptDb.status !== 'CANCELLED' || cancelledApptDb.cancelledBy !== 'CUSTOMER') {
    throw new Error(`Db state mismatch: status=${cancelledApptDb.status}, cancelledBy=${cancelledApptDb.cancelledBy}`);
  }
  console.log('✓ PASS: Booking successfully cancelled using valid raw cancelToken');

  // ----------------------------------------------------
  // TEST 4: Phone OTP Flow (Zero-Login / Public Manage)
  // ----------------------------------------------------
  console.log('\n--- TEST 4: Phone OTP Verification Flow ---');
  const booking2 = await createPublicBooking('dr-security', {
    date: futureDateStr,
    startTime: '11:00',
    customerName: 'Priya Patel',
    customerPhone: '9876543212',
    customerEmail: 'priya@example.com',
  });

  // 4a. Challenge endpoint (unauthenticated gives masked phone)
  const challengeUnauth = await getBookingChallengeService({
    appointmentCode: booking2.appointment.appointmentCode,
  });
  if (challengeUnauth.authenticated || !challengeUnauth.appointment.maskedPhone.includes('****')) {
    throw new Error('Unauthenticated challenge should return masked details and authenticated: false');
  }

  // 4b. Request OTP
  const otpRes = await otpService.sendBookingOtp({
    appointmentCode: booking2.appointment.appointmentCode,
    customerPhone: '9876543212',
  });
  if (!otpRes.success || !otpRes.maskedPhone.includes('3212')) {
    throw new Error('Expected OTP dispatch response with masked phone');
  }

  // 4c. Verify invalid OTP fails
  let wrongOtpRejected = false;
  try {
    await otpService.verifyBookingOtp({
      appointmentCode: booking2.appointment.appointmentCode,
      otp: '000000',
    });
  } catch (err) {
    if (err.statusCode === 401) wrongOtpRejected = true;
  }
  if (!wrongOtpRejected) {
    throw new Error('Expected wrong OTP to fail with 401');
  }

  // 4d. Verify valid OTP returns short-lived manageSessionToken
  const verifyRes = await otpService.verifyBookingOtp({
    appointmentCode: booking2.appointment.appointmentCode,
    otp: '458921',
  });
  if (!verifyRes.manageSessionToken) {
    throw new Error('Expected manageSessionToken from valid OTP verification');
  }

  // 4e. Challenge with manageSessionToken gives full access
  const challengeAuth = await getBookingChallengeService({
    appointmentCode: booking2.appointment.appointmentCode,
    manageSessionToken: verifyRes.manageSessionToken,
  });
  if (!challengeAuth.authenticated || !challengeAuth.appointment.canCancel) {
    throw new Error('Authenticated challenge should have authenticated: true and canCancel: true');
  }

  // 4f. Test reschedule request using manageSessionToken
  const rescheduleRes = await requestPublicRescheduleService({
    appointmentCode: booking2.appointment.appointmentCode,
    manageSessionToken: verifyRes.manageSessionToken,
    newDate: futureDateStr,
    newTime: '16:00',
    reason: 'Doctor consultation timing adjustment',
  });
  if (!rescheduleRes.success || rescheduleRes.appointment.status !== 'RESCHEDULE_REQUESTED') {
    throw new Error('Failed to submit reschedule request with manageSessionToken');
  }

  // 4g. Cancel using manageSessionToken
  const cancelWithSessionRes = await cancelPublicBookingService({
    appointmentCode: booking2.appointment.appointmentCode,
    manageSessionToken: verifyRes.manageSessionToken,
    reason: 'Cancelled via OTP verified session',
  });
  if (!cancelWithSessionRes.success || cancelWithSessionRes.appointment.status !== 'CANCELLED') {
    throw new Error('Failed to cancel appointment with valid manageSessionToken');
  }
  console.log('✓ PASS: Full OTP cycle verified (dispatch -> invalid attempt blocked -> valid OTP session -> reschedule request -> cancel success)');

  // ----------------------------------------------------
  // TEST 5: Notice Period Enforcement (minNoticeMinutes)
  // ----------------------------------------------------
  console.log('\n--- TEST 5: Cancellation Notice Window Enforcement ---');
  // Create an appointment scheduled 30 minutes from now (inside the 120-minute minNotice window)
  const now = new Date();
  const tightAppt = await Appointment.create({
    professionalId: profile._id,
    appointmentCode: 'BS-TIGHT01',
    dateString: getDateString(now, 'Asia/Kolkata'),
    startTime: '14:00',
    endTime: '14:30',
    startMinutes: 840,
    endMinutes: 870,
    startAt: new Date(now.getTime() + 30 * 60 * 1000), // 30 mins in future (< 120 mins required)
    endAt: new Date(now.getTime() + 60 * 60 * 1000),
    status: 'CONFIRMED',
    customerName: 'Urgent Guest',
    customerPhone: '9876543213',
    cancelTokenHash: hashCancelToken('valid-raw-tight-token-1234567890'),
  });

  let noticeRejected = false;
  try {
    await cancelPublicBookingService({
      appointmentCode: tightAppt.appointmentCode,
      cancelToken: 'valid-raw-tight-token-1234567890',
    });
  } catch (err) {
    if (err.statusCode === 400 && err.message.includes('120 minutes')) {
      noticeRejected = true;
    } else {
      throw new Error(`Expected notice window error, got: ${err.message}`);
    }
  }
  if (!noticeRejected) {
    throw new Error('Expected cancellation to be rejected due to minNoticeMinutes notice window violation!');
  }
  console.log('✓ PASS: Cancellation within minNoticeMinutes correctly rejected (400)');

  // ----------------------------------------------------
  // TEST 6: Rate Limiting (Max 5 Cancel Attempts / 24h per Phone)
  // ----------------------------------------------------
  console.log('\n--- TEST 6: Rate Limiting on Cancel Attempts ---');
  const ratePhone = '9876543299';
  otpService._clearForTests();

  // Make 5 failed attempts on ratePhone
  for (let i = 0; i < 5; i++) {
    otpService.recordCancelAttempt(ratePhone);
  }

  let rateLimitExceeded = false;
  try {
    otpService.checkCancelRateLimit(ratePhone);
  } catch (err) {
    if (err.statusCode === 429) {
      rateLimitExceeded = true;
    }
  }
  if (!rateLimitExceeded) {
    throw new Error('Expected 429 Rate Limit Exceeded after 5 failed cancel attempts');
  }
  console.log('✓ PASS: 5 cancel attempts in 24h per phone enforced (429 Rate Limit)');

  // ----------------------------------------------------
  // TEST 7: Logged-in User Cancellation
  // ----------------------------------------------------
  console.log('\n--- TEST 7: Logged-in User Cancellation ---');
  const loggedInCustomer = await User.create({
    name: 'Rohan Verma',
    email: 'rohan@example.com',
    password: 'Password123!',
    phone: '9876543214',
    role: 'USER',
  });

  const userBooking = await createPublicBooking('dr-security', {
    date: futureDateStr,
    startTime: '15:00',
    customerName: 'Rohan Verma',
    customerPhone: '9876543214',
    customerEmail: 'rohan@example.com',
    userId: loggedInCustomer._id,
  });

  // User cancels their own appointment without needing guest token
  const userCancelRes = await cancelPublicBookingService({
    appointmentCode: userBooking.appointment.appointmentCode,
    user: loggedInCustomer,
    reason: 'Work meeting rescheduled',
  });

  if (!userCancelRes.success || userCancelRes.appointment.status !== 'CANCELLED') {
    throw new Error('Logged-in user failed to cancel their own appointment');
  }

  const userApptDb = await Appointment.findById(userBooking.appointment._id);
  if (userApptDb.cancelledBy !== 'USER') {
    throw new Error(`Expected cancelledBy: 'USER', got: ${userApptDb.cancelledBy}`);
  }
  console.log('✓ PASS: Logged-in user cancellation succeeds and tags cancelledBy: USER');

  console.log('\n======================================================');
  console.log('🎉 ALL PUBLIC BOOKING SECURITY TESTS PASSED PERFECTLY!');
  console.log('======================================================\n');

  await mongoose.disconnect();
  await replSet.stop();
  process.exit(0);
}

runSecurityTests().catch(async (err) => {
  console.error('\n❌ Security Test Suite Failed:', err);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (replSet) {
    await replSet.stop();
  }
  process.exit(1);
});
