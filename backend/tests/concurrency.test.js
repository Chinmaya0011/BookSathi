import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { ProfessionalProfile } from '../src/models/ProfessionalProfile.js';
import { Appointment } from '../src/models/Appointment.js';
import { AppointmentType } from '../src/models/AppointmentType.js';
import { Availability } from '../src/models/Availability.js';
import { createPublicBooking, holdPublicSlot } from '../src/services/appointmentService.js';
import { checkBookingSpamRules } from '../src/services/abuseProtectionService.js';

let mongod;

async function runConcurrencyTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting Concurrency, Anti-Double Booking & Abuse Guard Tests');
  console.log('======================================================\n');

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log('✓ Connected to In-Memory MongoDB');

  // Build indexes in MongoDB
  await Appointment.init();
  await ProfessionalProfile.init();
  console.log('✓ MongoDB partial unique indexes verified & initialized');

  // 1. Create Professional Profile & Working Availability
  const user = await User.create({
    email: 'testpro@example.com',
    password: 'Password123!',
    phone: '9999999999',
    role: 'PROFESSIONAL',
  });

  const profile = await ProfessionalProfile.create({
    userId: user._id,
    name: 'Dr. Test Specialist',
    email: 'testpro@example.com',
    phone: '9999999999',
    profession: 'Doctor',
    bookingSlug: 'dr-specialist',
    consultationFee: 500,
    isPublic: true,
    bookingSettings: {
      appointmentDuration: 30,
      bufferTime: 0,
    },
  });

  // Setup availability for all days 09:00 - 18:00
  const days = [0, 1, 2, 3, 4, 5, 6];
  for (const day of days) {
    await Availability.create({
      professionalId: profile._id,
      dayOfWeek: day,
      isAvailable: true,
      timeSlots: [{ startTime: '09:00', endTime: '18:00' }],
    });
  }
  console.log('✓ Test professional and weekly availability initialized');

  // ============================================================
  // TEST 1: Simultaneous Double Booking Race Condition
  // ============================================================
  console.log('\n--- [TEST 1] Simultaneous Concurrent Booking Race (10 Competitors) ---');
  const targetDate = '2026-11-20';
  const targetTime = '10:00';
  const competitorsCount = 10;

  const results = await Promise.allSettled(
    Array.from({ length: competitorsCount }, (_, idx) =>
      createPublicBooking('dr-specialist', {
        date: targetDate,
        startTime: targetTime,
        customerName: `Competitor ${idx + 1}`,
        customerPhone: `987650000${idx}`,
        customerEmail: `competitor${idx + 1}@example.com`,
        reason: `Race slot test ${idx + 1}`,
      })
    )
  );

  const successes = results.filter((r) => r.status === 'fulfilled');
  const failures = results.filter((r) => r.status === 'rejected');

  console.log(`Success count: ${successes.length} (Expected: 1)`);
  console.log(`Failure count: ${failures.length} (Expected: ${competitorsCount - 1})`);

  if (successes.length !== 1) {
    throw new Error(`CRITICAL DOUBLE BOOKING DETECTED! Expected 1 success, got ${successes.length}`);
  }

  // Check that failed requests received the correct error code
  for (const f of failures) {
    const err = f.reason;
    if (err.code !== 'SLOT_ALREADY_BOOKED' && err.statusCode !== 409) {
      throw new Error(`Unexpected error code on rejected booking: ${err.code || err.message}`);
    }
  }

  const dbCount = await Appointment.countDocuments({
    professionalId: profile._id,
    dateString: targetDate,
    startTime: targetTime,
    status: { $in: ['CONFIRMED', 'PENDING', 'ARRIVED', 'WAITING', 'IN_PROGRESS', 'HELD'] },
  });

  if (dbCount !== 1) {
    throw new Error(`Database state error: Found ${dbCount} active records for the same slot!`);
  }
  console.log('✓ TEST 1 PASSED: Exactly 1 user acquired the slot, all others received SLOT_ALREADY_BOOKED (409 Conflict).');

  // ============================================================
  // TEST 2: Idempotent Appointment Creation (Double-Clicks & Retries)
  // ============================================================
  console.log('\n--- [TEST 2] Idempotency Key Handling (3 Duplicate Requests) ---');
  const testIdempotencyKey = 'idemp_key_safe_test_999';
  const slotDate = '2026-11-20';
  const slotTime = '11:00';

  const [req1, req2, req3] = await Promise.all([
    createPublicBooking('dr-specialist', {
      date: slotDate,
      startTime: slotTime,
      customerName: 'Ananya Sharma',
      customerPhone: '9123456780',
      customerEmail: 'ananya@example.com',
      idempotencyKey: testIdempotencyKey,
    }),
    createPublicBooking('dr-specialist', {
      date: slotDate,
      startTime: slotTime,
      customerName: 'Ananya Sharma',
      customerPhone: '9123456780',
      customerEmail: 'ananya@example.com',
      idempotencyKey: testIdempotencyKey,
    }),
    createPublicBooking('dr-specialist', {
      date: slotDate,
      startTime: slotTime,
      customerName: 'Ananya Sharma',
      customerPhone: '9123456780',
      customerEmail: 'ananya@example.com',
      idempotencyKey: testIdempotencyKey,
    }),
  ]);

  const apptCode1 = req1.appointment.appointmentCode;
  const apptCode2 = req2.appointment.appointmentCode;
  const apptCode3 = req3.appointment.appointmentCode;

  if (apptCode1 !== apptCode2 || apptCode2 !== apptCode3) {
    throw new Error('Idempotency failure: Different appointment codes generated for same idempotency key!');
  }

  const idempotencyDbCount = await Appointment.countDocuments({
    professionalId: profile._id,
    idempotencyKey: testIdempotencyKey,
  });

  if (idempotencyDbCount !== 1) {
    throw new Error(`Idempotency DB error: Found ${idempotencyDbCount} records instead of exactly 1!`);
  }
  console.log('✓ TEST 2 PASSED: 3 identical requests with same Idempotency-Key safely returned the same appointment.');

  // ============================================================
  // TEST 3: Duplicate Slot Booking by Same Customer Blocked
  // ============================================================
  console.log('\n--- [TEST 3] Duplicate Appointment Prevention for Same Customer ---');
  let duplicateBlocked = false;
  try {
    await createPublicBooking('dr-specialist', {
      date: '2026-11-20',
      startTime: '11:00', // Ananya already has this slot
      customerName: 'Ananya Sharma',
      customerPhone: '9123456780',
      customerEmail: 'ananya@example.com',
    });
  } catch (err) {
    if (err.code === 'DUPLICATE_APPOINTMENT_PREVENTED' || err.statusCode === 409) {
      duplicateBlocked = true;
    }
  }

  if (!duplicateBlocked) {
    throw new Error('Duplicate appointment was not blocked for the same customer phone!');
  }
  console.log('✓ TEST 3 PASSED: Duplicate booking on identical slot was prevented with DUPLICATE_APPOINTMENT_PREVENTED.');

  // ============================================================
  // TEST 4: Max Active Appointments with Same Professional
  // ============================================================
  console.log('\n--- [TEST 4] Max Active Bookings per Professional (Limit: 3) ---');
  // Ananya already has 1 booking (11:00). Let's book 2 more (12:00, 14:00)
  await createPublicBooking('dr-specialist', {
    date: '2026-11-20',
    startTime: '12:00',
    customerName: 'Ananya Sharma',
    customerPhone: '9123456780',
    customerEmail: 'ananya@example.com',
  });

  await createPublicBooking('dr-specialist', {
    date: '2026-11-20',
    startTime: '14:00',
    customerName: 'Ananya Sharma',
    customerPhone: '9123456780',
    customerEmail: 'ananya@example.com',
  });

  // Attempting 4th booking should be rejected by anti-spam guard
  let spamLimitBlocked = false;
  try {
    await createPublicBooking('dr-specialist', {
      date: '2026-11-20',
      startTime: '15:00',
      customerName: 'Ananya Sharma',
      customerPhone: '9123456780',
      customerEmail: 'ananya@example.com',
    });
  } catch (err) {
    if (err.code === 'MAX_ACTIVE_PER_PROFESSIONAL_EXCEEDED' && err.statusCode === 429) {
      spamLimitBlocked = true;
    }
  }

  if (!spamLimitBlocked) {
    throw new Error('Customer was able to exceed the maximum active appointments limit with the same professional!');
  }
  console.log('✓ TEST 4 PASSED: Anti-spam guard enforced MAX_ACTIVE_PER_PROFESSIONAL_EXCEEDED limit.');

  // ============================================================
  // TEST 5: Slot Hold & Atomic Confirmation
  // ============================================================
  console.log('\n--- [TEST 5] Temporary Slot Hold & Atomic Confirmation ---');
  const holdResult = await holdPublicSlot('dr-specialist', {
    date: '2026-11-21',
    startTime: '09:30',
  });

  if (!holdResult.holdToken || !holdResult.holdExpiresAt) {
    throw new Error('Hold token was not generated properly!');
  }

  // Confirm booking using hold token
  const confirmedBooking = await createPublicBooking('dr-specialist', {
    date: '2026-11-21',
    startTime: '09:30',
    customerName: 'Kavita Iyer',
    customerPhone: '9888877777',
    customerEmail: 'kavita@example.com',
    holdToken: holdResult.holdToken,
  });

  if (confirmedBooking.appointment.status !== 'CONFIRMED') {
    throw new Error(`Expected status CONFIRMED, got ${confirmedBooking.appointment.status}`);
  }
  console.log('✓ TEST 5 PASSED: Slot successfully held and atomically confirmed.');

  console.log('\n======================================================');
  console.log('🎉 ALL CONCURRENCY, IDEMPOTENCY & ANTI-SPAM TESTS PASSED!');
  console.log('======================================================\n');

  await mongoose.disconnect();
  await mongod.stop();
  process.exit(0);
}

runConcurrencyTests().catch(async (err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  if (mongod) await mongod.stop();
  process.exit(1);
});
