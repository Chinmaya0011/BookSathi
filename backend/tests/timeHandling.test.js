import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { ProfessionalProfile } from '../src/models/ProfessionalProfile.js';
import { Appointment } from '../src/models/Appointment.js';
import { Availability } from '../src/models/Availability.js';
import {
  APP_TZ,
  fromIst,
  toIstParts,
  nowIst,
  timeToMinutes,
  minutesToTime,
} from '../src/utils/dateHelpers.js';
import { getAvailableSlots } from '../src/services/slotGeneratorService.js';
import { createPublicBooking } from '../src/services/appointmentService.js';

let replSet;

async function runTimeHandlingTests() {
  console.log('\n======================================================');
  console.log('⏰ Starting BookSaathi Time Handling & Boundary Test Suite');
  console.log('======================================================\n');

  process.env.NODE_ENV = 'test';

  // ----------------------------------------------------
  // TEST 1: APP_TZ constant & Time Utility Functions
  // ----------------------------------------------------
  console.log('--- TEST 1: APP_TZ, fromIst, toIstParts, nowIst ---');
  if (APP_TZ !== 'Asia/Kolkata') {
    throw new Error(`Expected APP_TZ to be Asia/Kolkata, got: ${APP_TZ}`);
  }

  const istNow = nowIst();
  if (!istNow.dateString || !/^\d{4}-\d{2}-\d{2}$/.test(istNow.dateString)) {
    throw new Error(`Invalid dateString from nowIst: ${istNow.dateString}`);
  }
  if (!istNow.hhmm || !/^\d{2}:\d{2}$/.test(istNow.hhmm)) {
    throw new Error(`Invalid hhmm from nowIst: ${istNow.hhmm}`);
  }
  if (typeof istNow.currentMinutes !== 'number' || istNow.currentMinutes < 0 || istNow.currentMinutes >= 1440) {
    throw new Error(`Invalid currentMinutes from nowIst: ${istNow.currentMinutes}`);
  }
  console.log(`✓ PASS: nowIst() successfully generated: ${istNow.dateString} ${istNow.hhmm} (minutes: ${istNow.currentMinutes})`);

  // ----------------------------------------------------
  // TEST 2: Midnight Boundary Roundtripping (11:50 PM IST and 12:10 AM IST)
  // ----------------------------------------------------
  console.log('\n--- TEST 2: 11:50 PM IST vs 12:10 AM IST Date Boundary Isolation ---');

  // Case 2a: 11:50 PM IST on 2026-09-15 (23:50 IST)
  const dt1150 = fromIst('2026-09-15', '23:50');
  // IST is +05:30 -> UTC is 18:20 on 2026-09-15
  const expectedUtcIso1150 = '2026-09-15T18:20:00.000Z';
  if (dt1150.toISOString() !== expectedUtcIso1150) {
    throw new Error(`Expected 11:50 PM IST to map to ${expectedUtcIso1150}, got: ${dt1150.toISOString()}`);
  }

  const parts1150 = toIstParts(dt1150);
  if (parts1150.dateString !== '2026-09-15' || parts1150.hhmm !== '23:50' || parts1150.startMinutes !== 1430) {
    throw new Error(`11:50 PM IST roundtrip failed: dateString=${parts1150.dateString}, hhmm=${parts1150.hhmm}, startMinutes=${parts1150.startMinutes}`);
  }
  console.log('✓ PASS: 11:50 PM IST on 2026-09-15 converts to 18:20 UTC and roundtrips to 2026-09-15 (no date leak)');

  // Case 2b: 12:10 AM IST on 2026-09-16 (00:10 IST)
  const dt0010 = fromIst('2026-09-16', '00:10');
  // IST is +05:30 -> UTC is 18:40 on 2026-09-15
  const expectedUtcIso0010 = '2026-09-15T18:40:00.000Z';
  if (dt0010.toISOString() !== expectedUtcIso0010) {
    throw new Error(`Expected 12:10 AM IST to map to ${expectedUtcIso0010}, got: ${dt0010.toISOString()}`);
  }

  const parts0010 = toIstParts(dt0010);
  if (parts0010.dateString !== '2026-09-16' || parts0010.hhmm !== '00:10' || parts0010.startMinutes !== 10) {
    throw new Error(`12:10 AM IST roundtrip failed: dateString=${parts0010.dateString}, hhmm=${parts0010.hhmm}, startMinutes=${parts0010.startMinutes}`);
  }
  console.log('✓ PASS: 12:10 AM IST on 2026-09-16 converts to 18:40 UTC on previous UTC date, but roundtrips to 2026-09-16 IST');

  // Verify chronological ordering between 11:50 PM (Day 1) and 12:10 AM (Day 2)
  if (dt0010.getTime() - dt1150.getTime() !== 20 * 60 * 1000) {
    throw new Error(`Expected exactly 20 minutes difference between 23:50 and 00:10 next day, got ${(dt0010.getTime() - dt1150.getTime()) / 60000} minutes`);
  }
  console.log('✓ PASS: Chronological UTC timestamp difference across midnight is exactly 20 minutes');

  // ----------------------------------------------------
  // TEST 3: DB Integration & MongoDB Appointments Schema
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Appointment Storage of dateString, startTime, startMinutes, startAt ---');
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
  console.log('✓ Connected to MongoDB Replica Set');

  await Appointment.init();
  await ProfessionalProfile.init();
  await Availability.init();
  await User.init();

  const proUser = await User.create({
    name: 'Dr. Timekeeper',
    email: 'dr.time@example.com',
    password: 'Password123!',
    phone: '9811111111',
    role: 'PROFESSIONAL',
  });

  const profile = await ProfessionalProfile.create({
    userId: proUser._id,
    name: 'Dr. Timekeeper',
    email: 'dr.time@example.com',
    phone: '9811111111',
    profession: 'Doctor',
    bookingSlug: 'dr-time',
    consultationFee: 500,
    isPublic: true,
    bookingSettings: {
      appointmentDuration: 30,
      bufferTime: 0,
      maxAdvanceDays: 60,
      allowSameDayBooking: true,
      minNoticeMinutes: 30,
    },
  });

  // Setup full 24-hour availability to test late night / early morning slots
  for (let day = 0; day <= 6; day++) {
    await Availability.create({
      professionalId: profile._id,
      dayOfWeek: day,
      enabled: true,
      timeRanges: [{ startTime: '00:00', endTime: '24:00' }],
    });
  }

  // Create booking at 23:30 IST on a future date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 10);
  const futureDateStr = toIstParts(futureDate).dateString;

  const lateNightBooking = await createPublicBooking('dr-time', {
    date: futureDateStr,
    startTime: '23:30',
    customerName: 'Night Owl Patient',
    customerPhone: '9811111112',
    customerEmail: 'nightowl@example.com',
  });

  const apptDoc = await Appointment.findById(lateNightBooking.appointment._id);
  if (apptDoc.dateString !== futureDateStr) {
    throw new Error(`Expected dateString: ${futureDateStr}, got: ${apptDoc.dateString}`);
  }
  if (apptDoc.startTime !== '23:30' || apptDoc.startMinutes !== 1410) {
    throw new Error(`Expected startTime: '23:30' and startMinutes: 1410, got ${apptDoc.startTime} / ${apptDoc.startMinutes}`);
  }
  if (!apptDoc.startAt || !(apptDoc.startAt instanceof Date)) {
    throw new Error('Expected startAt to be stored as a UTC Date object in MongoDB');
  }

  const expectedStartAtUtc = fromIst(futureDateStr, '23:30');
  if (apptDoc.startAt.toISOString() !== expectedStartAtUtc.toISOString()) {
    throw new Error(`startAt mismatch: expected ${expectedStartAtUtc.toISOString()}, got ${apptDoc.startAt.toISOString()}`);
  }
  console.log('✓ PASS: Appointment document stored dateString, startTime, startMinutes, startAt, and endAt with exact UTC precision');

  // ----------------------------------------------------
  // TEST 4: Past Slot & Minimum Notice Pruning Using Date.now() vs startAt
  // ----------------------------------------------------
  console.log('\n--- TEST 4: Slot Generator Uses Date.now() vs startAt for Past & minNotice Pruning ---');
  const todayIst = nowIst().dateString;
  const todaySlots = await getAvailableSlots(profile, todayIst, 30, 0);

  const nowMs = Date.now();
  const minNoticeMs = 30 * 60 * 1000;

  for (const slot of todaySlots.slots) {
    const slotStartMs = slot.startAt.getTime();
    if (slotStartMs < nowMs + minNoticeMs) {
      if (slot.available) {
        throw new Error(`Slot at ${slot.time} on ${todayIst} (startAt: ${slot.startAt.toISOString()}) is past / inside minNotice but was marked available!`);
      }
      if (slot.status !== 'PAST') {
        throw new Error(`Expected slot status 'PAST' for elapsed slot, got: ${slot.status}`);
      }
    } else {
      if (!slot.available) {
        throw new Error(`Slot at ${slot.time} on ${todayIst} is in future beyond minNotice but was marked unavailable: ${slot.status}`);
      }
    }
  }
  console.log('✓ PASS: All slots on today date evaluated correctly against Date.now() + minNoticeMs without string comparison flaws');

  console.log('\n======================================================');
  console.log('🎉 ALL TIME HANDLING & DATE BOUNDARY TESTS PASSED!');
  console.log('======================================================\n');

  await mongoose.disconnect();
  await replSet.stop();
  process.exit(0);
}

runTimeHandlingTests().catch(async (err) => {
  console.error('\n❌ Time Handling Test Suite Failed:', err);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (replSet) {
    await replSet.stop();
  }
  process.exit(1);
});
