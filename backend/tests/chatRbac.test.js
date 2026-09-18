import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { ProfessionalProfile } from '../src/models/ProfessionalProfile.js';
import { Appointment } from '../src/models/Appointment.js';
import { Conversation } from '../src/models/Conversation.js';
import { chatService } from '../src/services/chatService.js';
import { aiChatService } from '../src/services/aiChatService.js';

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

async function runRbacTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting Role-Based Live Chat & AI Bot RBAC Verification');
  console.log('======================================================\n');

  try {
    await connectDB();

    const timestamp = Date.now();

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'Super Administrator',
      email: `admin.rbac.${timestamp}@test.com`,
      password: 'Password123!',
      role: 'ADMIN',
      isActive: true,
    });

    // 2. Create Doctor Rajesh (Professional 1)
    const doctorUser = await User.create({
      name: 'Dr. Rajesh Clinic',
      email: `doctor.rbac.${timestamp}@test.com`,
      password: 'Password123!',
      role: 'PROFESSIONAL',
      isActive: true,
    });
    const doctorProfile = await ProfessionalProfile.create({
      userId: doctorUser._id,
      name: 'Dr. Rajesh Clinic',
      email: doctorUser.email,
      phone: '9876543211',
      profession: 'Doctor',
      businessName: 'Sharma Clinic',
      bookingSlug: `doc-rbac-${timestamp}`,
      isVerified: true,
    });

    // 3. Create Stranger Doctor (Professional 2)
    const strangerDocUser = await User.create({
      name: 'Dr. Priya Skin',
      email: `stranger.doc.${timestamp}@test.com`,
      password: 'Password123!',
      role: 'PROFESSIONAL',
      isActive: true,
    });
    const strangerDocProfile = await ProfessionalProfile.create({
      userId: strangerDocUser._id,
      name: 'Dr. Priya Skin',
      email: strangerDocUser.email,
      phone: '9876543212',
      profession: 'Doctor',
      businessName: 'Priya Clinic',
      bookingSlug: `doc-stranger-${timestamp}`,
      isVerified: true,
    });

    // 4. Create User With Booking (Rahul)
    const bookedUser = await User.create({
      name: 'Rahul Sharma',
      email: `user.booked.${timestamp}@test.com`,
      password: 'Password123!',
      role: 'USER',
      isActive: true,
    });

    // 5. Create Stranger User (Never booked with Dr. Rajesh)
    const strangerUser = await User.create({
      name: 'Amit Stranger',
      email: `user.stranger.${timestamp}@test.com`,
      password: 'Password123!',
      role: 'USER',
      isActive: true,
    });

    // 6. Create booking relationship between Rahul and Dr. Rajesh
    const appointment = await Appointment.create({
      userId: bookedUser._id,
      professionalId: doctorProfile._id,
      appointmentCode: `BK-TEST-${timestamp}`,
      customerName: 'Rahul Sharma',
      customerEmail: bookedUser.email,
      customerPhone: '9876543210',
      appointmentDate: new Date('2026-09-20T10:00:00.000Z'),
      dateString: '2026-09-20',
      startTime: '10:00',
      endTime: '10:30',
      status: 'CONFIRMED',
    });

    console.log('--- Test Suite 1: Contact Discovery Filtering ---');

    // Test 1: Admin Contacts Discovery
    const adminContacts = await chatService.getAuthorizedContacts(adminUser);
    assert(adminContacts.role === 'ADMIN', 'Admin role recognized in contact discovery');
    assert(adminContacts.professionals.length >= 2, 'Admin can see all platform professionals');
    assert(adminContacts.users.length >= 2, 'Admin can see all platform users');

    // Test 2: Professional Contacts Discovery (Strict filtering)
    const proContacts = await chatService.getAuthorizedContacts(doctorUser);
    assert(proContacts.role === 'PROFESSIONAL', 'Professional role recognized in contact discovery');
    assert(proContacts.supportDesk !== null, 'Professional sees BookSaathi Admin Support Desk');
    assert(proContacts.clients.length === 1, 'Professional sees ONLY client with appointment (1 client)');
    assert(proContacts.clients[0].contactId.toString() === bookedUser._id.toString(), 'Professional sees Rahul Sharma');

    // Test 3: User Contacts Discovery (Strict filtering)
    const userContacts = await chatService.getAuthorizedContacts(bookedUser);
    assert(userContacts.role === 'USER', 'User role recognized in contact discovery');
    assert(userContacts.supportDesk !== null, 'User sees BookSaathi Support & Helpdesk');
    assert(userContacts.bookedProfessionals.length === 1, 'User sees ONLY booked professional (Dr. Rajesh)');
    assert(userContacts.bookedProfessionals[0].contactId.toString() === doctorUser._id.toString(), 'User sees Dr. Rajesh contact');

    console.log('\n--- Test Suite 2: Live Chat Permission & Relationship Matrix ---');

    // Test 4: User CAN chat with booked professional
    const userToDocConv = await chatService.getOrCreateConversation(bookedUser, doctorUser._id);
    assert(userToDocConv !== null && userToDocConv._id, 'User can start conversation with booked professional');

    const userMsg = await chatService.sendMessage(bookedUser, userToDocConv._id, 'Hello Dr. Rajesh!');
    assert(userMsg.text === 'Hello Dr. Rajesh!', 'User successfully sent message to booked professional');

    // Test 5: User CANNOT chat with unbooked professional (Dr. Priya)
    let userToStrangerBlocked = false;
    try {
      await chatService.getOrCreateConversation(bookedUser, strangerDocUser._id);
    } catch (err) {
      userToStrangerBlocked = true;
      assert(err.message.includes('booked an appointment'), 'User blocked from chatting with unbooked professional (403)');
    }
    assert(userToStrangerBlocked, 'Strict guard prevents user from chatting with random professional');

    // Test 6: Professional CAN chat with booked client
    const docToUserConv = await chatService.getOrCreateConversation(doctorUser, bookedUser._id);
    assert(docToUserConv._id.toString() === userToDocConv._id.toString(), 'Professional connects to same conversation thread');

    // Test 7: Professional CANNOT chat with random stranger user
    let proToStrangerBlocked = false;
    try {
      await chatService.getOrCreateConversation(doctorUser, strangerUser._id);
    } catch (err) {
      proToStrangerBlocked = true;
      assert(err.message.includes('appointment booking'), 'Professional blocked from chatting with arbitrary user (403)');
    }
    assert(proToStrangerBlocked, 'Strict guard prevents professional from chatting with arbitrary user');

    // Test 8: Admin CAN chat with any professional and any user
    const adminToStrangerConv = await chatService.getOrCreateConversation(adminUser, strangerUser._id);
    assert(adminToStrangerConv !== null && adminToStrangerConv._id, 'Admin can initiate chat with any arbitrary user');

    const adminToDocConv = await chatService.getOrCreateConversation(adminUser, doctorUser._id);
    assert(adminToDocConv !== null && adminToDocConv._id, 'Admin can initiate chat with any professional');

    console.log('\n--- Test Suite 3: Distinct Role-Tailored AI Bot Engines ---');

    // Test 9: User AI Bot
    const userAiRes = await aiChatService.processQuery({
      role: 'USER',
      message: 'Can you help me reschedule my appointment?',
    });
    assert(userAiRes.reply.includes('reschedule'), 'User AI bot returns patient scheduling assistance');

    // Test 10: Professional AI Bot
    const proAiRes = await aiChatService.processQuery({
      role: 'PROFESSIONAL',
      message: 'How can I configure my slot availability?',
    });
    assert(proAiRes.reply.toLowerCase().includes('availability'), 'Professional AI bot returns slot configuration assistance');

    // Test 11: Admin AI Bot
    const adminAiRes = await aiChatService.processQuery({
      role: 'ADMIN',
      message: 'Show platform statistics',
    });
    assert(adminAiRes.reply.includes('Command Center'), 'Admin AI bot returns management command insights');

    // Cleanup
    await User.deleteMany({ _id: { $in: [adminUser._id, doctorUser._id, strangerDocUser._id, bookedUser._id, strangerUser._id] } });
    await ProfessionalProfile.deleteMany({ _id: { $in: [doctorProfile._id, strangerDocProfile._id] } });
    await Appointment.deleteOne({ _id: appointment._id });
    await Conversation.deleteMany({ 'participants.user': { $in: [adminUser._id, doctorUser._id, bookedUser._id, strangerUser._id] } });

    console.log(`\n======================================================`);
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runRbacTests();
