import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { ProfessionalProfile } from '../src/models/ProfessionalProfile.js';
import { Appointment } from '../src/models/Appointment.js';
import { Availability } from '../src/models/Availability.js';
import { AppointmentType } from '../src/models/AppointmentType.js';
import { aiChatService } from '../src/services/aiChatService.js';
import { retrieveDatabaseDataForQuery } from '../src/services/aiDataRetriever.js';
import { getDateString } from '../src/utils/dateHelpers.js';

let mongoServer;

async function setupTestDb() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}

async function teardownTestDb() {
  await mongoose.disconnect();
  await mongoServer.stop();
}

async function runTests() {
  console.log('--- STARTING AI CHATBOT & DATABASE INTEGRATION TESTS ---');
  await setupTestDb();

  try {
    const todayStr = getDateString(new Date(), 'Asia/Kolkata');
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tomorrowStr = getDateString(tomorrow, 'Asia/Kolkata');

    // 1. Create Test Users
    const userA = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan@example.com',
      phone: '+91 98765 43210',
      role: 'USER',
      password: 'password123',
    });

    const userB = await User.create({
      name: 'Pooja Verma',
      email: 'pooja@example.com',
      phone: '+91 98765 43211',
      role: 'USER',
      password: 'password123',
    });

    const proUser = await User.create({
      name: 'Dr. Ananya Sen',
      email: 'ananya@example.com',
      phone: '+91 98765 43212',
      role: 'PROFESSIONAL',
      password: 'password123',
    });

    const adminUser = await User.create({
      name: 'Admin Chief',
      email: 'admin@booksaathi.in',
      phone: '+91 98765 43213',
      role: 'ADMIN',
      password: 'password123',
    });

    // 2. Create Professional Profile
    const proProfile = await ProfessionalProfile.create({
      userId: proUser._id,
      name: 'Dr. Ananya Sen',
      email: proUser.email,
      phone: proUser.phone,
      profession: 'Doctor',
      specialization: 'Cardiologist',
      bookingSlug: 'dr-ananya-sen',
      consultationFee: 700,
      city: 'Bhubaneswar',
      isPublic: true,
      status: 'ACTIVE',
    });

    // 3. Create Service and Availability
    await AppointmentType.create({
      professionalId: proProfile._id,
      name: 'Heart Consultation',
      duration: 30,
      fee: 700,
      enabled: true,
    });

    await Availability.create({
      professionalId: proProfile._id,
      dayOfWeek: 1,
      enabled: true,
      timeRanges: [{ startTime: '09:00', endTime: '13:00' }],
    });

    // 4. Create Appointments for User A
    const aptA1 = await Appointment.create({
      appointmentCode: 'BK-ROH-01',
      userId: userA._id,
      professionalId: proProfile._id,
      customerName: userA.name,
      customerPhone: userA.phone,
      customerEmail: userA.email,
      appointmentDate: new Date(),
      dateString: tomorrowStr,
      startTime: '10:30',
      endTime: '11:00',
      fee: 700,
      status: 'CONFIRMED',
      bookingType: 'TIME_SLOT',
    });

    const aptA2 = await Appointment.create({
      appointmentCode: 'BK-ROH-02',
      userId: userA._id,
      professionalId: proProfile._id,
      customerName: userA.name,
      customerPhone: userA.phone,
      customerEmail: userA.email,
      appointmentDate: new Date(),
      dateString: todayStr,
      startTime: '14:00',
      endTime: '14:30',
      fee: 700,
      status: 'BOOKED',
      bookingType: 'TIME_SLOT',
    });

    // Create Appointment for User B (Private to User B)
    const aptB1 = await Appointment.create({
      appointmentCode: 'BK-POO-01',
      userId: userB._id,
      professionalId: proProfile._id,
      customerName: userB.name,
      customerPhone: userB.phone,
      customerEmail: userB.email,
      appointmentDate: new Date(),
      dateString: tomorrowStr,
      startTime: '16:00',
      endTime: '16:30',
      fee: 700,
      status: 'CONFIRMED',
      bookingType: 'TIME_SLOT',
    });

    console.log('✓ Test fixtures successfully seeded.');

    // ----------------------------------------------------
    // TEST 1: User Role Queries
    // ----------------------------------------------------
    console.log('\n--- TEST 1: User Queries ---');
    const userQ1 = await retrieveDatabaseDataForQuery({
      user: userA,
      role: 'USER',
      message: 'What appointments do I have tomorrow?',
    });
    console.log('User Q1 DB Context:', userQ1.contextText);
    if (userQ1.contextText.includes('BK-ROH-01') && !userQ1.contextText.includes('BK-POO-01')) {
      console.log('✓ PASS: User A retrieves their own tomorrow appointment and NOT User B appointment.');
    } else {
      throw new Error('FAIL: User query returned incorrect appointments.');
    }

    const userQ2 = await retrieveDatabaseDataForQuery({
      user: userA,
      role: 'USER',
      message: 'How many appointments do I have this month?',
    });
    console.log('User Q2 DB Context:', userQ2.contextText);
    if (userQ2.contextText.includes('2 matching appointment(s)')) {
      console.log('✓ PASS: User A month count accurately calculated.');
    } else {
      throw new Error('FAIL: User month count incorrect.');
    }

    // ----------------------------------------------------
    // TEST 2: Professional Role Queries
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Professional Queries ---');
    const proQ1 = await retrieveDatabaseDataForQuery({
      user: proUser,
      profile: proProfile,
      role: 'PROFESSIONAL',
      message: 'How many bookings do I have today?',
    });
    console.log('Pro Q1 DB Context:', proQ1.contextText);
    if (proQ1.contextText.includes("Today's Bookings Count")) {
      console.log('✓ PASS: Professional today bookings count retrieved.');
    } else {
      throw new Error('FAIL: Professional bookings count failed.');
    }

    const proQ2 = await retrieveDatabaseDataForQuery({
      user: proUser,
      profile: proProfile,
      role: 'PROFESSIONAL',
      message: 'What is my weekly availability?',
    });
    console.log('Pro Q2 DB Context:', proQ2.contextText);
    if (proQ2.contextText.includes('Monday: Enabled (09:00 - 13:00)')) {
      console.log('✓ PASS: Professional weekly availability schedule retrieved accurately.');
    } else {
      throw new Error('FAIL: Professional availability retrieval failed.');
    }

    // ----------------------------------------------------
    // TEST 3: Admin Role Queries
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Admin Queries ---');
    const adminQ1 = await retrieveDatabaseDataForQuery({
      user: adminUser,
      role: 'ADMIN',
      message: 'How many users are registered and give me platform summary?',
    });
    console.log('Admin Q1 DB Context:', adminQ1.contextText);
    if (
      adminQ1.contextText.includes('Total Registered Users') &&
      adminQ1.contextText.includes('Total Active Verified Professionals')
    ) {
      console.log('✓ PASS: Admin platform metrics retrieved.');
    } else {
      throw new Error('FAIL: Admin metrics failed.');
    }

    // ----------------------------------------------------
    // TEST 4: Security Isolation Guard
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Security & Privacy Isolation ---');
    const securityCheckUser = await retrieveDatabaseDataForQuery({
      user: userA,
      role: 'USER',
      message: 'Show me all users and total platform revenue',
    });
    if (securityCheckUser.isUnauthorized) {
      console.log('✓ PASS: Normal User blocked from accessing admin/global statistics.');
    } else {
      throw new Error('FAIL: Normal user was not blocked from global stats.');
    }

    // ----------------------------------------------------
    // TEST 5: Full End-to-End aiChatService ProcessQuery
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Full aiChatService Pipeline ---');
    const fullRes = await aiChatService.processQuery({
      user: userA,
      role: 'USER',
      message: 'What appointments do I have tomorrow?',
    });
    console.log('AI Response:\n', fullRes.reply);
    if (fullRes.reply && fullRes.quickPrompts && fullRes.quickPrompts.length > 0) {
      console.log('✓ PASS: End-to-end AI response generated in Markdown with dynamic prompts.');
    } else {
      throw new Error('FAIL: Full AI processQuery failed.');
    }

    console.log('\n========================================');
    console.log('🎉 ALL AI CHATBOT INTEGRATION TESTS PASSED!');
    console.log('========================================');
  } finally {
    await teardownTestDb();
  }
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
