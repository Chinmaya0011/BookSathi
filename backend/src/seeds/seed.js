import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { Availability } from '../models/Availability.js';
import { AppointmentType } from '../models/AppointmentType.js';
import { BlockedDate } from '../models/BlockedDate.js';
import { Appointment } from '../models/Appointment.js';
import { Notification } from '../models/Notification.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { getDateString, generateAppointmentCode } from '../utils/dateHelpers.js';

dotenv.config();

export const seedDatabase = async () => {
  console.log('--- Starting BookSaathi Database Seeding ---');

  // Clear existing collections
  await User.deleteMany({});
  await ProfessionalProfile.deleteMany({});
  await Availability.deleteMany({});
  await AppointmentType.deleteMany({});
  await BlockedDate.deleteMany({});
  await Appointment.deleteMany({});
  await Notification.deleteMany({});

  // 1. Create Admin User
  const adminEmail = 'admin@booksaathi.in';
  const adminPassword = 'Admin@12345';

  const admin = await User.create({
    name: 'BookSaathi Super Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'ADMIN',
    isActive: true,
  });
  console.log(` Created Admin Account: ${adminEmail} / ${adminPassword}`);

  // 2. Create Demo Doctor User
  const demoDoctorEmail = 'dr.rajesh@booksaathi.in';
  const demoDoctorPassword = 'Password123';

  const doctorUser = await User.create({
    name: 'Dr. Rajesh Sharma',
    email: demoDoctorEmail,
    password: demoDoctorPassword,
    role: 'PROFESSIONAL',
    phone: '+91 98765 43210',
    isActive: true,
  });

  // 3. Create Demo Customer User
  const demoCustomerEmail = 'rahul.user@booksaathi.in';
  const demoCustomerPassword = 'User@12345';

  const customerUser = await User.create({
    name: 'Rahul Sharma',
    email: demoCustomerEmail,
    password: demoCustomerPassword,
    role: 'USER',
    phone: '+91 98111 22233',
    isActive: true,
    timezone: 'Asia/Kolkata',
  });
  console.log(` Created Demo Customer: ${demoCustomerEmail} / ${demoCustomerPassword}`);

  // 4. Create Professional Profile
  const profile = await ProfessionalProfile.create({
    userId: doctorUser._id,
    name: 'Dr. Rajesh Sharma',
    email: demoDoctorEmail,
    phone: '+91 98765 43210',
    profession: 'Doctor',
    specialization: 'MBBS, MD - General Physician',
    profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop',
    bio: 'Senior General Physician with 10+ years of clinical experience in preventive medicine, lifestyle diseases, and family healthcare.',
    businessName: 'Sharma Health Clinic',
    address: 'Plot No. 104, Saheed Nagar',
    city: 'Bhubaneswar',
    state: 'Odisha',
    country: 'India',
    timezone: 'Asia/Kolkata',
    bookingSlug: 'dr-rajesh',
    consultationFee: 500,
    currency: 'INR',
    languages: ['English', 'Hindi', 'Odia'],
    yearsOfExperience: 10,
    onlineConsultation: true,
    offlineConsultation: true,
    isPublic: true,
    isVerified: true,
    bookingSettings: {
      appointmentDuration: 30,
      bufferTime: 10,
      minNoticeMinutes: 30,
      maxAdvanceDays: 60,
      allowSameDayBooking: true,
    },
  });

  // Create second demo professional for multi-professional browsing
  const caUser = await User.create({
    name: 'CA Priya Agarwal',
    email: 'priya.ca@booksaathi.in',
    password: 'Password123',
    role: 'PROFESSIONAL',
    phone: '+91 98222 55566',
    isActive: true,
  });

  const caProfile = await ProfessionalProfile.create({
    userId: caUser._id,
    name: 'CA Priya Agarwal',
    email: 'priya.ca@booksaathi.in',
    phone: '+91 98222 55566',
    profession: 'CA',
    specialization: 'FCA, Corporate Tax & GST Consultant',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    bio: 'Chartered Accountant specializing in business taxation, GST audits, and personal wealth advisory with 8+ years experience.',
    businessName: 'Agarwal & Associates Financial Advisors',
    address: 'Suite 402, Infocity Road, Patia',
    city: 'Bhubaneswar',
    state: 'Odisha',
    country: 'India',
    timezone: 'Asia/Kolkata',
    bookingSlug: 'ca-priya',
    consultationFee: 800,
    currency: 'INR',
    languages: ['English', 'Hindi'],
    yearsOfExperience: 8,
    onlineConsultation: true,
    offlineConsultation: true,
    isPublic: true,
    isVerified: true,
    bookingSettings: {
      appointmentDuration: 45,
      bufferTime: 15,
      minNoticeMinutes: 60,
      maxAdvanceDays: 30,
      allowSameDayBooking: true,
    },
  });

  // 5. Create Weekly Availability for both
  const availabilityConfigs = [
    { dayOfWeek: 0, enabled: false, timeRanges: [] },
    {
      dayOfWeek: 1,
      enabled: true,
      timeRanges: [
        { startTime: '09:00', endTime: '13:00' },
        { startTime: '17:00', endTime: '20:00' },
      ],
    },
    {
      dayOfWeek: 2,
      enabled: true,
      timeRanges: [
        { startTime: '09:00', endTime: '13:00' },
        { startTime: '17:00', endTime: '20:00' },
      ],
    },
    {
      dayOfWeek: 3,
      enabled: true,
      timeRanges: [
        { startTime: '09:00', endTime: '13:00' },
        { startTime: '17:00', endTime: '20:00' },
      ],
    },
    {
      dayOfWeek: 4,
      enabled: true,
      timeRanges: [
        { startTime: '09:00', endTime: '13:00' },
        { startTime: '17:00', endTime: '20:00' },
      ],
    },
    {
      dayOfWeek: 5,
      enabled: true,
      timeRanges: [
        { startTime: '09:00', endTime: '13:00' },
        { startTime: '17:00', endTime: '20:00' },
      ],
    },
    {
      dayOfWeek: 6,
      enabled: true,
      timeRanges: [{ startTime: '10:00', endTime: '14:00' }],
    },
  ];

  await Availability.insertMany(
    availabilityConfigs.map((a) => ({
      professionalId: profile._id,
      ...a,
    }))
  );

  await Availability.insertMany(
    availabilityConfigs.map((a) => ({
      professionalId: caProfile._id,
      ...a,
    }))
  );

  // 6. Create Appointment Types
  const type1 = await AppointmentType.create({
    professionalId: profile._id,
    name: 'General Consultation',
    description: 'In-depth consultation for fever, cough, blood pressure, or general ailments.',
    duration: 30,
    fee: 500,
    onlineAvailable: true,
    offlineAvailable: true,
    isDefault: true,
    enabled: true,
  });

  const type2 = await AppointmentType.create({
    professionalId: profile._id,
    name: 'Follow-up Consultation',
    description: 'Quick checkup on ongoing treatment or lab report review (within 7 days).',
    duration: 15,
    fee: 300,
    onlineAvailable: true,
    offlineAvailable: true,
    isDefault: false,
    enabled: true,
  });

  const caType1 = await AppointmentType.create({
    professionalId: caProfile._id,
    name: 'Tax Planning & ITR Consultation',
    description: 'Detailed analysis of income tax, capital gains, deductions, and advance tax planning.',
    duration: 45,
    fee: 800,
    onlineAvailable: true,
    offlineAvailable: true,
    isDefault: true,
    enabled: true,
  });

  // 7. Create Sample Appointments
  const todayStr = getDateString(new Date(), 'Asia/Kolkata');
  const [year, month, day] = todayStr.split('-').map(Number);
  const todayDateObj = new Date(Date.UTC(year, month - 1, day));

  const tomorrowObj = new Date(todayDateObj);
  tomorrowObj.setUTCDate(tomorrowObj.getUTCDate() + 1);
  const tomorrowStr = getDateString(tomorrowObj, 'Asia/Kolkata');

  const yesterdayObj = new Date(todayDateObj);
  yesterdayObj.setUTCDate(yesterdayObj.getUTCDate() - 1);
  const yesterdayStr = getDateString(yesterdayObj, 'Asia/Kolkata');

  await Appointment.create([
    {
      appointmentCode: 'BS-10293',
      userId: customerUser._id,
      professionalId: profile._id,
      appointmentTypeId: type1._id,
      appointmentTypeName: type1.name,
      customerName: 'Rahul Sharma',
      customerPhone: '+91 98111 22233',
      customerEmail: demoCustomerEmail,
      reason: 'Routine seasonal checkup and blood pressure check',
      appointmentDate: todayDateObj,
      dateString: todayStr,
      startTime: '10:00',
      endTime: '10:30',
      duration: 30,
      fee: 500,
      status: 'CONFIRMED',
      notes: 'Patient was prescribed multivitamin supplements during last visit.',
    },
    {
      appointmentCode: 'BS-10294',
      userId: customerUser._id,
      professionalId: profile._id,
      appointmentTypeId: type2._id,
      appointmentTypeName: type2.name,
      customerName: 'Rahul Sharma',
      customerPhone: '+91 98111 22233',
      customerEmail: demoCustomerEmail,
      reason: 'Thyroid report review',
      appointmentDate: tomorrowObj,
      dateString: tomorrowStr,
      startTime: '11:30',
      endTime: '11:45',
      duration: 15,
      fee: 300,
      status: 'PENDING',
      notes: 'Check TSH and T3/T4 reports.',
    },
    {
      appointmentCode: 'BS-10295',
      userId: customerUser._id,
      professionalId: caProfile._id,
      appointmentTypeId: caType1._id,
      appointmentTypeName: caType1.name,
      customerName: 'Rahul Sharma',
      customerPhone: '+91 98111 22233',
      customerEmail: demoCustomerEmail,
      reason: 'Annual tax filing and capital gains optimization',
      appointmentDate: yesterdayObj,
      dateString: yesterdayStr,
      startTime: '17:00',
      endTime: '17:45',
      duration: 45,
      fee: 800,
      status: 'COMPLETED',
      notes: 'Filed ITR-3 with LTCG on mutual funds.',
    },
  ]);

  // Seed sample initial notifications
  await Notification.create([
    {
      userId: customerUser._id,
      recipientRole: 'USER',
      type: 'APPOINTMENT_CONFIRMED',
      title: 'Appointment Confirmed',
      message: `Dr. Rajesh Sharma confirmed your consultation for ${todayStr} at 10:00 AM.`,
      link: '/dashboard',
    },
    {
      professionalId: profile._id,
      recipientRole: 'PROFESSIONAL',
      type: 'APPOINTMENT_CREATED',
      title: 'New Appointment Request',
      message: `Rahul Sharma requested an appointment for ${tomorrowStr} at 11:30 AM.`,
      link: '/dashboard',
    },
  ]);

  console.log('✅ BookSaathi Multi-Role Database Seed Completed Successfully!');
  console.log('--------------------------------------------------');
  console.log(`Demo Accounts:`);
  console.log(`  Customer:     ${demoCustomerEmail} / ${demoCustomerPassword}`);
  console.log(`  Doctor (Pro): ${demoDoctorEmail} / ${demoDoctorPassword}`);
  console.log(`  Admin:        ${adminEmail} / ${adminPassword}`);
  console.log('--------------------------------------------------');
};

// If run directly via node src/seeds/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (e) {
      console.error('Seeding error:', e);
      process.exit(1);
    }
  })();
}
