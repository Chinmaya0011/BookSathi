import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { ProfessionalProfile } from '../src/models/ProfessionalProfile.js';
import { Appointment } from '../src/models/Appointment.js';
import { Availability } from '../src/models/Availability.js';
import { SystemAuditLog } from '../src/models/SystemAuditLog.js';
import {
  toPublicAppointment,
  toUserAppointment,
  toProfessionalAppointment,
  toAdminAppointment,
} from '../src/serializers/appointmentSerializer.js';
import {
  createPublicBooking,
  updateAppointmentNotes,
} from '../src/services/appointmentService.js';
import {
  getAppointmentDetailsAdmin,
  updateAppointmentNotesAdmin,
} from '../src/services/adminService.js';
import { getDateString } from '../src/utils/dateHelpers.js';

let replSet;

async function runNotesSecurityTests() {
  console.log('\n======================================================');
  console.log('🩺 Starting BookSaathi Notes Security & DPDP Compliance Test Suite');
  console.log('======================================================\n');

  process.env.NODE_ENV = 'test';

  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
  console.log('✓ Connected to MongoDB Replica Set');

  await Appointment.init();
  await ProfessionalProfile.init();
  await Availability.init();
  await User.init();
  await SystemAuditLog.init();
  console.log('✓ MongoDB indexes verified & initialized');

  // Setup Admin, Professional, and Customer accounts
  const adminUser = await User.create({
    name: 'Super Admin',
    email: 'admin.notes@booksaathi.in',
    password: 'Password123!',
    phone: '9800000001',
    role: 'ADMIN',
  });

  const proUser = await User.create({
    name: 'Dr. Clinician',
    email: 'dr.clinician@example.com',
    password: 'Password123!',
    phone: '9800000002',
    role: 'PROFESSIONAL',
  });

  const profile = await ProfessionalProfile.create({
    userId: proUser._id,
    name: 'Dr. Clinician',
    email: 'dr.clinician@example.com',
    phone: '9800000002',
    profession: 'Doctor',
    bookingSlug: 'dr-clinician',
    consultationFee: 750,
    isPublic: true,
    bookingSettings: {
      appointmentDuration: 30,
      bufferTime: 0,
      maxAdvanceDays: 60,
      allowSameDayBooking: true,
    },
  });

  for (let day = 0; day <= 6; day++) {
    await Availability.create({
      professionalId: profile._id,
      dayOfWeek: day,
      enabled: true,
      timeRanges: [{ startTime: '08:00', endTime: '20:00' }],
    });
  }

  const patientUser = await User.create({
    name: 'Sameer Sen',
    email: 'sameer.sen@example.com',
    password: 'Password123!',
    phone: '9800000003',
    role: 'USER',
  });

  const testDate = new Date();
  testDate.setDate(testDate.getDate() + 3);
  const testDateStr = getDateString(testDate, 'Asia/Kolkata');

  // ----------------------------------------------------
  // TEST 1: Booking Creation Stores reason, Notes Hidden by Default
  // ----------------------------------------------------
  console.log('\n--- TEST 1: Creation with Patient Reason and Schema Field Isolation ---');
  const booking = await createPublicBooking('dr-clinician', {
    date: testDateStr,
    startTime: '10:00',
    customerName: 'Sameer Sen',
    customerPhone: '9800000003',
    customerEmail: 'sameer.sen@example.com',
    userId: patientUser._id,
    reason: 'Severe back pain radiating to left leg (Sciatica suspect)',
  });

  const apptId = booking.appointment._id;

  // Default query must NOT return notes or cancelTokenHash
  const defaultFetch = await Appointment.findById(apptId);
  if (defaultFetch.notes !== undefined && defaultFetch.notes !== '') {
    throw new Error('Default findById query should not return notes (must be select: false)');
  }
  if (defaultFetch.reason !== 'Severe back pain radiating to left leg (Sciatica suspect)') {
    throw new Error('Patient reason should be properly saved and visible');
  }
  console.log('✓ PASS: Booking created with patient reason; notes field is select: false by default');

  // ----------------------------------------------------
  // TEST 2: Professional Writes Private Consultation Notes
  // ----------------------------------------------------
  console.log('\n--- TEST 2: Professional Updates Consultation Notes ---');
  const clinicalNotes = 'Observed L4-L5 tenderness. Prescribed Pregabalin 75mg once daily. Advised MRI spine.';
  const updatedByPro = await updateAppointmentNotes(profile._id, apptId, clinicalNotes, 'PROFESSIONAL');

  if (updatedByPro.notes !== clinicalNotes) {
    throw new Error('Notes failed to update for professional');
  }
  if (updatedByPro.notesUpdatedBy !== 'PROFESSIONAL') {
    throw new Error(`Expected notesUpdatedBy: 'PROFESSIONAL', got: ${updatedByPro.notesUpdatedBy}`);
  }
  if (!updatedByPro.notesUpdatedAt) {
    throw new Error('Expected notesUpdatedAt timestamp to be set');
  }
  console.log('✓ PASS: Professional successfully recorded private clinical notes with timestamp & metadata');

  // ----------------------------------------------------
  // TEST 3: Serializer Enforcement
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Role-Based Serializers Sanitization ---');
  const rawDbDocWithNotes = await Appointment.findById(apptId).select('+notes +notesUpdatedAt +notesUpdatedBy');

  // 3a. toPublicAppointment
  const publicObj = toPublicAppointment(rawDbDocWithNotes);
  if (publicObj.notes !== undefined || publicObj.notesUpdatedAt !== undefined || publicObj.cancelTokenHash !== undefined) {
    throw new Error('SECURITY VIOLATION: toPublicAppointment leaked notes or sensitive hashes!');
  }
  if (!publicObj.reason) {
    throw new Error('Public serializer should retain reason');
  }

  // 3b. toUserAppointment
  const userObj = toUserAppointment(rawDbDocWithNotes);
  if (userObj.notes !== undefined || userObj.notesUpdatedAt !== undefined || userObj.notesUpdatedBy !== undefined) {
    throw new Error('SECURITY VIOLATION: toUserAppointment leaked clinical notes to patient!');
  }
  if (userObj.reason !== 'Severe back pain radiating to left leg (Sciatica suspect)') {
    throw new Error('User serializer should retain patient reason');
  }

  // 3c. toProfessionalAppointment
  const proObj = toProfessionalAppointment(rawDbDocWithNotes);
  if (proObj.notes !== clinicalNotes || proObj.notesUpdatedBy !== 'PROFESSIONAL') {
    throw new Error('toProfessionalAppointment must include consultation notes');
  }
  if (proObj.cancelTokenHash !== undefined) {
    throw new Error('Professional serializer must not leak cancelTokenHash');
  }

  // 3d. toAdminAppointment
  const adminObj = toAdminAppointment(rawDbDocWithNotes, { auditLogged: true });
  if (adminObj.notes !== clinicalNotes || !adminObj._auditLogged || !adminObj.hasAdminAudit) {
    throw new Error('toAdminAppointment must include notes and audit metadata flag');
  }
  console.log('✓ PASS: All 4 serializers (toPublicAppointment, toUserAppointment, toProfessionalAppointment, toAdminAppointment) enforce role boundaries');

  // ----------------------------------------------------
  // TEST 4: Admin Access to Notes Generates SystemAuditLog
  // ----------------------------------------------------
  console.log('\n--- TEST 4: Admin Read Notes Generates SystemAuditLog ---');
  const auditLogsBefore = await SystemAuditLog.countDocuments({ action: 'READ_APPOINTMENT_NOTES' });

  const adminReadRes = await getAppointmentDetailsAdmin(apptId, adminUser, '192.168.1.100');
  if (adminReadRes.notes !== clinicalNotes || !adminReadRes.hasAdminAudit) {
    throw new Error('Admin details read failed');
  }

  const auditLogsAfterRead = await SystemAuditLog.find({
    action: 'READ_APPOINTMENT_NOTES',
    targetId: apptId.toString(),
  });

  if (auditLogsAfterRead.length !== auditLogsBefore + 1) {
    throw new Error('Expected SystemAuditLog entry created on admin notes read');
  }

  const readLog = auditLogsAfterRead[auditLogsAfterRead.length - 1];
  if (readLog.adminEmail !== adminUser.email || readLog.targetType !== 'APPOINTMENT') {
    throw new Error(`Audit log mismatch: ${JSON.stringify(readLog)}`);
  }
  console.log('✓ PASS: Admin reading appointment notes generated a verified SystemAuditLog record');

  // ----------------------------------------------------
  // TEST 5: Admin Update Notes Generates SystemAuditLog & Sets notesUpdatedBy: ADMIN
  // ----------------------------------------------------
  console.log('\n--- TEST 5: Admin Update Notes Generates SystemAuditLog ---');
  const adminModifiedNotes = `${clinicalNotes} [Admin Note: Patient medical history verified via platform]`;
  const adminUpdateRes = await updateAppointmentNotesAdmin(apptId, adminUser, adminModifiedNotes, '192.168.1.100');

  if (adminUpdateRes.notes !== adminModifiedNotes) {
    throw new Error('Admin update notes failed');
  }

  const updatedDbDoc = await Appointment.findById(apptId).select('+notes +notesUpdatedBy');
  if (updatedDbDoc.notesUpdatedBy !== 'ADMIN') {
    throw new Error(`Expected notesUpdatedBy: 'ADMIN', got: ${updatedDbDoc.notesUpdatedBy}`);
  }

  const auditUpdateLog = await SystemAuditLog.findOne({
    action: 'UPDATE_APPOINTMENT_NOTES',
    targetId: apptId.toString(),
  });

  if (!auditUpdateLog || auditUpdateLog.adminEmail !== adminUser.email) {
    throw new Error('Expected SystemAuditLog entry created on admin notes update');
  }
  console.log('✓ PASS: Admin updating appointment notes recorded notesUpdatedBy: ADMIN and generated SystemAuditLog');

  // ----------------------------------------------------
  // TEST 6: User Query Isolation (.select() Excludes Notes)
  // ----------------------------------------------------
  console.log('\n--- TEST 6: User Query Select Isolation ---');
  const userQueryAppointments = await Appointment.find({ userId: patientUser._id })
    .select('-notes -notesUpdatedAt -notesUpdatedBy -cancelTokenHash')
    .lean();

  if (userQueryAppointments.length === 0) {
    throw new Error('User appointments not found');
  }

  const sanitizedUserAppts = userQueryAppointments.map(toUserAppointment);
  for (const appt of sanitizedUserAppts) {
    if (appt.notes !== undefined || appt.notesUpdatedAt !== undefined || appt.notesUpdatedBy !== undefined) {
      throw new Error('SECURITY VIOLATION: User query leaked private clinical notes!');
    }
  }
  console.log('✓ PASS: User query select isolation verified (zero clinical notes returned)');

  console.log('\n======================================================');
  console.log('🎉 ALL NOTES SECURITY & DPDP COMPLIANCE TESTS PASSED!');
  console.log('======================================================\n');

  await mongoose.disconnect();
  await replSet.stop();
  process.exit(0);
}

runNotesSecurityTests().catch(async (err) => {
  console.error('\n❌ Notes Security Test Suite Failed:', err);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (replSet) {
    await replSet.stop();
  }
  process.exit(1);
});
