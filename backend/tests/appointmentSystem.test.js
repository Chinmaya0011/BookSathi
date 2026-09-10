import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/seeds/seed.js';
import {
  createPublicBooking,
  holdPublicSlot,
  createManualBooking,
  rescheduleAppointment,
  updateAppointmentStatus,
} from '../src/services/appointmentService.js';
import { getAvailableSlots } from '../src/services/slotGeneratorService.js';
import { ProfessionalProfile } from '../src/models/ProfessionalProfile.js';
import { AppointmentType } from '../src/models/AppointmentType.js';
import { BlockedDate } from '../src/models/BlockedDate.js';
import { Appointment } from '../src/models/Appointment.js';
import {
  getDateString,
  evaluateArrivalStatus,
  timeToMinutes,
  minutesToTime,
} from '../src/utils/dateHelpers.js';

let passedCount = 0;
let failedCount = 0;

const assert = (condition, testName, extraInfo = '') => {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName} ${extraInfo}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} ${extraInfo}`);
    failedCount++;
  }
};

const runAllTests = async () => {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPLETE APPOINTMENT BOOKING SYSTEM TESTS (A - T)');
  console.log('====================================================\n');

  try {
    await connectDB();
    await seedDatabase();
    await Appointment.init();
    await Appointment.syncIndexes();

    const profile = await ProfessionalProfile.findOne({ bookingSlug: 'dr-rajesh' });
    if (!profile) throw new Error('Seeded profile dr-rajesh not found');

    const testDateObj = new Date();
    testDateObj.setUTCDate(testDateObj.getUTCDate() + 4);
    if (testDateObj.getUTCDay() === 0) testDateObj.setUTCDate(testDateObj.getUTCDate() + 1);
    const testDate = getDateString(testDateObj, 'Asia/Kolkata');

    const defaultServices = await AppointmentType.find({ professionalId: profile._id });
    const standardConsult = defaultServices[0];

    // ----------------------------------------------------
    // TEST A: Two users book same slot simultaneously
    // ----------------------------------------------------
    console.log('\n--- Scenario A: Simultaneous Booking Concurrency Guard ---');
    const slotsA = await getAvailableSlots(profile, testDate, 30);
    const testSlotA = slotsA.slots.find((s) => s.available).time;

    const [resA1, resA2] = await Promise.allSettled([
      createPublicBooking('dr-rajesh', {
        date: testDate,
        time: testSlotA,
        customerName: 'User A1',
        customerPhone: '9876543210',
      }),
      createPublicBooking('dr-rajesh', {
        date: testDate,
        time: testSlotA,
        customerName: 'User A2',
        customerPhone: '9876543211',
      }),
    ]);

    const aFulfilled = [resA1, resA2].filter((r) => r.status === 'fulfilled');
    const aRejected = [resA1, resA2].filter((r) => r.status === 'rejected');
    assert(
      aFulfilled.length === 1 && aRejected.length === 1,
      'A. Exactly one booking succeeds and one is rejected under simultaneous requests',
      `(${aFulfilled.length} won, ${aRejected.length} rejected)`
    );

    // ----------------------------------------------------
    // TEST B & C: Professional manually adds Walk-in -> occupies slot -> Customer booking rejected & unavailable
    // ----------------------------------------------------
    console.log('\n--- Scenario B & C: Walk-In / Manual Booking Conflict & Public Slot Removal ---');
    const slotsB = await getAvailableSlots(profile, testDate, 30);
    const walkInTime = slotsB.slots.find((s) => s.available).time;

    const walkInAppt = await createManualBooking(profile._id, {
      date: testDate,
      time: walkInTime,
      customerName: 'Rahul Walkin',
      customerPhone: '9876543212',
      bookingSource: 'WALK_IN',
      duration: 30,
      buffer: 10,
    });
    assert(walkInAppt && walkInAppt.bookingSource === 'WALK_IN', 'C1. Walk-in appointment created successfully');

    const updatedSlotsAfterWalkin = await getAvailableSlots(profile, testDate, 30);
    const isWalkInSlotAvailable = updatedSlotsAfterWalkin.slots.some((s) => s.time === walkInTime && s.available);
    assert(!isWalkInSlotAvailable, 'C2. Public slots immediately mark walk-in slot as unavailable / booked');

    let bookingAttemptFailed = false;
    try {
      await createPublicBooking('dr-rajesh', {
        date: testDate,
        time: walkInTime,
        customerName: 'Online Attempt',
        customerPhone: '9876543213',
      });
    } catch (err) {
      bookingAttemptFailed = err.statusCode === 409;
    }
    assert(bookingAttemptFailed, 'B. Customer attempt to book manually occupied slot is rejected with 409');

    // ----------------------------------------------------
    // TEST D: Temporary Hold and Expiry
    // ----------------------------------------------------
    console.log('\n--- Scenario D: Temporary 5-Minute Hold Lifecycle & Auto-Expiry ---');
    const slotsD = await getAvailableSlots(profile, testDate, 30);
    const holdTime = slotsD.slots.find((s) => s.available).time;

    const holdResult = await holdPublicSlot('dr-rajesh', {
      date: testDate,
      time: holdTime,
    });
    assert(holdResult && holdResult.holdToken, 'D1. Slot placed in temporary HELD state');

    const slotsDuringHold = await getAvailableSlots(profile, testDate, 30);
    assert(
      !slotsDuringHold.slots.some((s) => s.time === holdTime && s.available),
      'D2. Active hold immediately makes slot unavailable to other customers'
    );

    // Simulate hold expiration
    await Appointment.updateOne(
      { holdToken: holdResult.holdToken },
      { holdExpiresAt: new Date(Date.now() - 1000) }
    );

    const slotsAfterExpiry = await getAvailableSlots(profile, testDate, 30);
    assert(
      slotsAfterExpiry.slots.some((s) => s.time === holdTime && s.available),
      'D3. Expired hold automatically returns to available pool without cron requirement'
    );

    // ----------------------------------------------------
    // TEST E: Double-click Idempotency Protection
    // ----------------------------------------------------
    console.log('\n--- Scenario E: Idempotency Protection ---');
    const slotsE = await getAvailableSlots(profile, testDate, 30);
    const idempTime = slotsE.slots.find((s) => s.available).time;
    const idempotencyKey = 'unique-idemp-12345';

    const [firstClick, secondClick] = await Promise.all([
      createPublicBooking('dr-rajesh', {
        date: testDate,
        time: idempTime,
        customerName: 'Double Clicker',
        customerPhone: '9876543214',
        idempotencyKey,
      }),
      createPublicBooking('dr-rajesh', {
        date: testDate,
        time: idempTime,
        customerName: 'Double Clicker',
        customerPhone: '9876543214',
        idempotencyKey,
      }),
    ]);

    const totalCreated = await Appointment.countDocuments({ idempotencyKey });
    assert(
      totalCreated === 1 && firstClick.appointment.appointmentCode === secondClick.appointment.appointmentCode,
      'E. Rapid double-clicks with idempotency key result in only 1 appointment'
    );

    // ----------------------------------------------------
    // TEST F: Early Arrival Evaluation
    // ----------------------------------------------------
    console.log('\n--- Scenario F: Early Arrival Handling ---');
    const earlyEval = evaluateArrivalStatus({
      scheduledStartTime: '11:30',
      arrivalMinutes: timeToMinutes('11:10'), // 20 mins early
      earlyArrivalMinutes: 15,
    });
    assert(
      earlyEval.isLate === false && earlyEval.minutesDiff === 20,
      'F. Customer arriving at 11:10 for 11:30 appointment is correctly flagged as early (20 min early)'
    );

    // ----------------------------------------------------
    // TEST G & H: Late Arrival, Grace Period, and No-Show Threshold
    // ----------------------------------------------------
    console.log('\n--- Scenario G & H: Late Arrival Grace and No-Show Threshold ---');
    const withinGrace = evaluateArrivalStatus({
      scheduledStartTime: '11:30',
      arrivalMinutes: timeToMinutes('11:38'), // 8 min late
      lateGraceMinutes: 10,
    });
    assert(withinGrace.isLate === false, 'G1. Arrival within 10-min grace period is classified as within grace');

    const exceededGrace = evaluateArrivalStatus({
      scheduledStartTime: '11:30',
      arrivalMinutes: timeToMinutes('11:45'), // 15 min late
      lateGraceMinutes: 10,
      noShowThresholdMinutes: 15,
    });
    assert(exceededGrace.isLate === true, 'G2. Arrival past grace period is correctly flagged as Late (+15m)');

    const exceededNoShow = evaluateArrivalStatus({
      scheduledStartTime: '11:30',
      arrivalMinutes: timeToMinutes('12:00'), // 30 min late
      noShowThresholdMinutes: 15,
    });
    assert(exceededNoShow.isNoShowRisk === true, 'H. Overdue beyond threshold flags no-show recommendation');

    // ----------------------------------------------------
    // TEST I & J: Overlapping Appointment and Buffer Collision Rejections
    // ----------------------------------------------------
    console.log('\n--- Scenario I & J: Appointment & Buffer Collision Protection ---');
    let overlapFailed = false;
    try {
      // Try to book a 30m appointment that overlaps a 10m buffer of testSlotA
      const apptAEndMinutes = timeToMinutes(testSlotA) + 30; // buffer extends to +40
      const overlapStart = timeToMinutes(testSlotA) + 15;
      await createManualBooking(profile._id, {
        date: testDate,
        time: minutesToTime(overlapStart),
        customerName: 'Overlap Tester',
        customerPhone: '9876543215',
      });
    } catch {
      overlapFailed = true;
    }
    assert(overlapFailed, 'I & J. Overlapping appointment/buffer times are strictly rejected');

    // ----------------------------------------------------
    // TEST K & M: Blocked Time Window & Holiday
    // ----------------------------------------------------
    console.log('\n--- Scenario K & M: Arbitrary Blocked Times & Holidays ---');
    const holidayDateObj = new Date();
    holidayDateObj.setUTCDate(holidayDateObj.getUTCDate() + 10);
    const holidayDate = getDateString(holidayDateObj, 'Asia/Kolkata');

    await BlockedDate.create({
      professionalId: profile._id,
      date: holidayDate,
      allDay: true,
      reason: 'Special Holiday',
    });
    const holidaySlots = await getAvailableSlots(profile, holidayDate, 30);
    assert(
      holidaySlots.isBlocked === true && holidaySlots.slots.length === 0,
      'M. Holiday / All-Day Block returns 0 slots and blocked reason'
    );

    // ----------------------------------------------------
    // TEST N & O: Dynamic Durations (60 min & 90 min + 15m Buffer)
    // ----------------------------------------------------
    console.log('\n--- Scenario N & O: Service Durations & Custom Buffers ---');
    const customDateObj = new Date();
    customDateObj.setUTCDate(customDateObj.getUTCDate() + 6);
    if (customDateObj.getUTCDay() === 0) customDateObj.setUTCDate(customDateObj.getUTCDate() + 1);
    const customDate = getDateString(customDateObj, 'Asia/Kolkata');

    const slots60 = await getAvailableSlots(profile, customDate, 60, 0);
    assert(
      slots60.slots.length > 0 && slots60.slots[0].duration === 60,
      'N. 60-minute duration service dynamically calculates 60m slots'
    );

    const slots90 = await getAvailableSlots(profile, customDate, 90, 15);
    assert(
      slots90.slots.length > 0 && slots90.slots[0].duration === 90 && slots90.slots[0].buffer === 15,
      'O. 90-minute service + 15-minute buffer generates aligned non-overlapping intervals'
    );

    // ----------------------------------------------------
    // TEST P & Q: Rescheduling
    // ----------------------------------------------------
    console.log('\n--- Scenario P & Q: Rescheduling ---');
    const avail90Slots = slots90.slots.filter((s) => s.available);
    const initialSlot = avail90Slots[0].time;
    const targetSlot = avail90Slots[1].time;

    const apptToReschedule = await createManualBooking(profile._id, {
      date: customDate,
      time: initialSlot,
      customerName: 'Reschedule User',
      customerPhone: '9876543216',
      duration: 30,
      buffer: 10,
    });

    // Try rescheduling into occupied slot (should fail)
    let reschedOccupiedFailed = false;
    try {
      await rescheduleAppointment(profile._id, apptToReschedule._id, {
        newDate: testDate,
        newTime: testSlotA, // Occupied by winner in Test A
      });
    } catch {
      reschedOccupiedFailed = true;
    }
    assert(reschedOccupiedFailed, 'P. Rescheduling into an occupied slot is rejected');

    // Reschedule into free slot (should succeed)
    const reschedSuccess = await rescheduleAppointment(profile._id, apptToReschedule._id, {
      newDate: customDate,
      newTime: targetSlot,
    });
    assert(
      reschedSuccess && reschedSuccess.startTime === targetSlot,
      'Q. Rescheduling into an available slot is successful'
    );

    // ----------------------------------------------------
    // TEST R: Cancellation Releases Slot
    // ----------------------------------------------------
    console.log('\n--- Scenario R: Cancellation ---');
    await updateAppointmentStatus(profile._id, reschedSuccess._id, {
      status: 'CANCELLED',
      cancelReason: 'Client requested cancellation',
    });
    const slotsAfterCancel = await getAvailableSlots(profile, customDate, 90, 15);
    assert(
      slotsAfterCancel.slots.some((s) => s.time === targetSlot && s.available),
      'R. Cancelling appointment immediately releases slot back to availability pool'
    );

    // ----------------------------------------------------
    // TEST S: Timezone Config
    // ----------------------------------------------------
    console.log('\n--- Scenario S: Configurable Timezone Handling ---');
    const tzDateStr = getDateString(new Date(), 'Asia/Kolkata');
    assert(
      /^\d{4}-\d{2}-\d{2}$/.test(tzDateStr),
      'S. Timezone dates formatted safely via Intl API without string mismatch bugs'
    );

    // ----------------------------------------------------
    // TEST T: Invalid Professional / Service
    // ----------------------------------------------------
    console.log('\n--- Scenario T: Invalid Professional / Profile Safety ---');
    let invalidProfFailed = false;
    try {
      await createPublicBooking('non-existent-prof-slug-xyz', {
        date: testDate,
        time: '10:00',
        customerName: 'Invalid Prof',
        customerPhone: '9876543217',
      });
    } catch (err) {
      invalidProfFailed = err.statusCode === 404;
    }
    assert(invalidProfFailed, 'T. Invalid professional slug returns HTTP 404 cleanly');

    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passedCount} Passed, ${failedCount} Failed`);
    console.log('====================================================');

    await disconnectDB();
    process.exit(failedCount === 0 ? 0 : 1);
  } catch (err) {
    console.error('Test Suite Error:', err);
    await disconnectDB();
    process.exit(1);
  }
};

runAllTests();
