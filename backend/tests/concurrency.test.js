process.env.NODE_ENV = 'test';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { ProfessionalProfile } from '../src/models/ProfessionalProfile.js';
import { Appointment } from '../src/models/Appointment.js';
import { AppointmentType } from '../src/models/AppointmentType.js';
import { Availability } from '../src/models/Availability.js';
import {
  createPublicBooking,
  holdPublicSlot,
  createManualBooking,
  sweepExpiredHolds,
  reserveSlotAtomically,
} from '../src/services/appointmentService.js';

let replSet;

async function runConcurrencyTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting Booking Lock & Concurrency Tests');
  console.log('======================================================\n');

  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
  console.log('✓ Connected to MongoDB Replica Set (Transactions Enabled)');

  // Build indexes in MongoDB
  await Appointment.init();
  await ProfessionalProfile.init();
  await Availability.init();
  console.log('✓ MongoDB indexes verified & initialized');

  // Create Professional Profile & Working Availability
  const user = await User.create({
    email: 'dr.lock@example.com',
    password: 'Password123!',
    phone: '9999999999',
    role: 'PROFESSIONAL',
  });

  const profile = await ProfessionalProfile.create({
    userId: user._id,
    name: 'Dr. Concurrency Specialist',
    email: 'dr.lock@example.com',
    phone: '9999999999',
    profession: 'Doctor',
    bookingSlug: 'dr-lock',
    consultationFee: 500,
    isPublic: true,
    bookingSettings: {
      appointmentDuration: 30,
      bufferTime: 0,
      maxAdvanceDays: 60,
      allowSameDayBooking: true,
    },
  });

  // Setup availability for all days 08:00 - 20:00
  const days = [0, 1, 2, 3, 4, 5, 6];
  for (const day of days) {
    await Availability.create({
      professionalId: profile._id,
      dayOfWeek: day,
      enabled: true,
      timeRanges: [{ startTime: '08:00', endTime: '20:00' }],
    });
  }
  console.log('✓ Test professional & full day availability initialized');

  // ============================================================
  // TEST 1: 20 Parallel Requests for Exact Same Window
  // ============================================================
  console.log('\n--- [TEST 1] 20 Parallel Concurrent Booking Requests for Same Slot (10:00 - 10:30) ---');
  const targetDate = '2026-09-25';
  const targetTime = '10:00';
  const competitorsCount = 20;

  const results = await Promise.allSettled(
    Array.from({ length: competitorsCount }, (_, idx) =>
      createPublicBooking('dr-lock', {
        date: targetDate,
        startTime: targetTime,
        customerName: `Competitor ${idx + 1}`,
        customerPhone: `98765000${String(idx).padStart(2, '0')}`,
        customerEmail: `competitor${idx + 1}@example.com`,
        reason: `Race slot test ${idx + 1}`,
      })
    )
  );

  const successes = results.filter((r) => r.status === 'fulfilled');
  const failures = results.filter((r) => r.status === 'rejected');

  console.log(`Success count: ${successes.length} (Expected: 1)`);
  console.log(`Failure count: ${failures.length} (Expected: 19)`);

  if (successes.length !== 1) {
    throw new Error(`CRITICAL DOUBLE BOOKING DETECTED! Expected 1 success, got ${successes.length}`);
  }

  if (failures.length !== 19) {
    throw new Error(`Expected 19 rejections, got ${failures.length}`);
  }

  // Check that all 19 failed requests received 409
  for (const f of failures) {
    const err = f.reason;
    if (err.statusCode !== 409) {
      throw new Error(`Expected 409 status code on rejected booking, got: ${err.statusCode} - ${err.message}`);
    }
  }

  const dbCount = await Appointment.countDocuments({
    professionalId: profile._id,
    dateString: targetDate,
    startTime: targetTime,
    status: { $in: ['CONFIRMED', 'PENDING', 'BOOKED', 'HOLD', 'HELD', 'IN_PROGRESS'] },
  });

  if (dbCount !== 1) {
    throw new Error(`Database state error: Found ${dbCount} active records for the same slot!`);
  }
  console.log('✓ TEST 1 PASSED: Exactly 1 success and 19 rejected with 409 (Conflict).');

  // ============================================================
  // TEST 2: Overlapping Slots with Different Durations / Offsets
  // (09:00 - 09:30 vs 09:15 - 09:45 vs 08:45 - 09:15 vs 09:30 - 10:00)
  // ============================================================
  console.log('\n--- [TEST 2] Overlapping Slots with Different Durations & Offset Bounds ---');
  const overlapDate = '2026-09-26';

  // 1. First appointment: 09:00 - 09:30 (startMinutes: 540, endMinutes: 570)
  const firstAppt = await createPublicBooking('dr-lock', {
    date: overlapDate,
    startTime: '09:00',
    customerName: 'First Booked Client',
    customerPhone: '9111111111',
  });
  console.log(`✓ Initial appointment created: ${firstAppt.appointment.startTime} - ${firstAppt.appointment.endTime}`);

  // 2. Overlapping appointment: 09:15 - 09:45 (startMinutes: 555, endMinutes: 585) -> MUST FAIL (409)
  let overlapRejected1 = false;
  try {
    await createPublicBooking('dr-lock', {
      date: overlapDate,
      startTime: '09:15',
      customerName: 'Overlapping 09:15 Client',
      customerPhone: '9222222222',
    });
  } catch (err) {
    if (err.statusCode === 409) {
      overlapRejected1 = true;
    }
  }

  if (!overlapRejected1) {
    throw new Error('Overlapping slot 09:15 - 09:45 was NOT rejected!');
  }
  console.log('✓ Overlap 09:15 - 09:45 correctly rejected with 409.');

  // 3. Overlapping appointment: 08:45 - 09:15 (startMinutes: 525, endMinutes: 555) -> MUST FAIL (409)
  let overlapRejected2 = false;
  try {
    await createPublicBooking('dr-lock', {
      date: overlapDate,
      startTime: '08:45',
      customerName: 'Overlapping 08:45 Client',
      customerPhone: '9333333333',
    });
  } catch (err) {
    if (err.statusCode === 409) {
      overlapRejected2 = true;
    }
  }

  if (!overlapRejected2) {
    throw new Error('Overlapping slot 08:45 - 09:15 was NOT rejected!');
  }
  console.log('✓ Overlap 08:45 - 09:15 correctly rejected with 409.');

  // 4. Non-overlapping adjacent slot: 09:30 - 10:00 (startMinutes: 570, endMinutes: 600) -> MUST SUCCEED
  const adjacentAppt = await createPublicBooking('dr-lock', {
    date: overlapDate,
    startTime: '09:30',
    customerName: 'Adjacent Client',
    customerPhone: '9444444444',
  });

  if (!adjacentAppt || adjacentAppt.appointment.startTime !== '09:30') {
    throw new Error('Adjacent non-overlapping slot 09:30 failed to book!');
  }
  console.log('✓ Adjacent non-overlapping slot 09:30 - 10:00 successfully booked.');
  console.log('✓ TEST 2 PASSED: Overlap boundaries verified with integer minutes calculations.');

  // ============================================================
  // TEST 3: Slot HOLD Expiry & Reclamation
  // ============================================================
  console.log('\n--- [TEST 3] Slot HOLD Expiry and Slot Reclamation ---');
  const holdDate = '2026-09-27';
  const holdTime = '11:00';

  // 1. Create a HOLD slot
  const holdRes = await holdPublicSlot('dr-lock', {
    date: holdDate,
    startTime: holdTime,
  });

  console.log(`✓ Slot ${holdTime} placed on HOLD with token: ${holdRes.holdToken}`);

  // 2. While HOLD is active, another user tries to book -> MUST FAIL (409)
  let holdBlocked = false;
  try {
    await createPublicBooking('dr-lock', {
      date: holdDate,
      startTime: holdTime,
      customerName: 'Competitor while on Hold',
      customerPhone: '9555555555',
    });
  } catch (err) {
    if (err.statusCode === 409) {
      holdBlocked = true;
    }
  }

  if (!holdBlocked) {
    throw new Error('Active HOLD did not block competing booking request!');
  }
  console.log('✓ Active HOLD successfully prevented competing booking (409 Conflict).');

  // 3. Simulate hold expiration by setting holdExpiresAt to the past
  await Appointment.updateOne(
    { holdToken: holdRes.holdToken },
    { $set: { holdExpiresAt: new Date(Date.now() - 10000) } }
  );

  // 4. Run sweeper
  const sweptCount = await sweepExpiredHolds();
  console.log(`✓ Sweeper executed, expired holds updated: ${sweptCount}`);

  // 5. Now, the slot should become bookable again!
  const reclaimedBooking = await createPublicBooking('dr-lock', {
    date: holdDate,
    startTime: holdTime,
    customerName: 'New Client After Expiry',
    customerPhone: '9666666666',
  });

  if (!reclaimedBooking || reclaimedBooking.appointment.startTime !== holdTime) {
    throw new Error('Slot was not bookable after hold expired!');
  }
  console.log('✓ Slot became bookable again after HOLD expired and was successfully booked.');
  console.log('✓ TEST 3 PASSED: HOLD expiry and slot reclamation verified.');

  // ============================================================
  // TEST 4: Walk-in / Manual Booking Uses Same Atomic Lock
  // ============================================================
  console.log('\n--- [TEST 4] Walk-in / Manual Booking Uses Unified Transaction Lock ---');
  const manualDate = '2026-09-28';
  const manualTime = '14:00';

  // Create manual walk-in booking
  const manualAppt = await createManualBooking(profile._id, {
    date: manualDate,
    time: manualTime,
    customerName: 'Walk-in Patient',
    customerPhone: '9777777777',
    bookingSource: 'WALK_IN',
  });

  if (!manualAppt || manualAppt.startMinutes !== 840) {
    throw new Error('Manual booking failed to create properly with integer minutes!');
  }

  // Attempting to book overlapping online slot 14:15 -> MUST FAIL (409)
  let manualConflictBlocked = false;
  try {
    await createPublicBooking('dr-lock', {
      date: manualDate,
      startTime: '14:15',
      customerName: 'Online Patient Colliding with Walk-in',
      customerPhone: '9888888888',
    });
  } catch (err) {
    if (err.statusCode === 409) {
      manualConflictBlocked = true;
    }
  }

  if (!manualConflictBlocked) {
    throw new Error('Online booking failed to detect collision with manual walk-in appointment!');
  }
  console.log('✓ Manual booking atomic lock verified. Online overlap correctly rejected (409).');
  console.log('✓ TEST 4 PASSED: Unified transaction path confirmed for all booking channels.');

  console.log('\n======================================================');
  console.log('🎉 ALL CONCURRENCY & BOOKING LOCK TESTS PASSED!');
  console.log('======================================================\n');

  await mongoose.disconnect();
  await replSet.stop();
  process.exit(0);
}

runConcurrencyTests().catch(async (err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  if (replSet) await replSet.stop();
  process.exit(1);
});
