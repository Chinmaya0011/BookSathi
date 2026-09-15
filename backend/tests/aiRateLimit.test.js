import assert from 'assert';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { ProfessionalProfile } from '../src/models/ProfessionalProfile.js';
import { ProfessionalSubscription } from '../src/models/ProfessionalSubscription.js';
import { AiChatUsage } from '../src/models/AiChatUsage.js';
import {
  consumeAiQuery,
  checkAiUsage,
  getAiLimitForUser,
  getTodayDateIST,
} from '../src/services/aiRateLimitService.js';

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
  console.log('--- STARTING AI CHATBOT RATE LIMIT & QUOTA TESTS ---');
  await setupTestDb();

  try {
    // ----------------------------------------------------
    // TEST 1: USER role gets 10 queries/day
    // ----------------------------------------------------
    console.log('\n[TEST 1] Verifying User (Customer) 10 queries/day limit...');
    const user = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      password: 'password123',
      role: 'USER',
    });

    const userLimit = await getAiLimitForUser({ user });
    assert.strictEqual(userLimit.limit, 10, 'USER limit should be 10');
    assert.strictEqual(userLimit.isUnlimited, false, 'USER is not unlimited');

    for (let i = 1; i <= 10; i++) {
      const res = await consumeAiQuery({ user });
      assert.strictEqual(res.isAllowed, true, `Query ${i} should be allowed`);
      assert.strictEqual(res.count, i, `Count should be ${i}`);
      assert.strictEqual(res.remaining, 10 - i, `Remaining should be ${10 - i}`);
    }

    // 11th query must be rejected
    const blockedUser = await consumeAiQuery({ user });
    assert.strictEqual(blockedUser.isAllowed, false, '11th query must be blocked');
    assert.strictEqual(blockedUser.remaining, 0, 'Remaining should be 0');
    assert.ok(blockedUser.reason.includes('10 AI queries'), 'Reason should mention 10 queries');
    console.log('✔ PASS: User 10 queries/day limit verified.');

    // ----------------------------------------------------
    // TEST 2: Professional with Free Account gets 5 queries/day
    // ----------------------------------------------------
    console.log('\n[TEST 2] Verifying Professional Free Account 5 queries/day limit...');
    const proFreeUser = await User.create({
      name: 'Dr. Sameer Sen',
      email: 'sameer@example.com',
      password: 'password123',
      role: 'PROFESSIONAL',
    });

    const proFreeProfile = await ProfessionalProfile.create({
      userId: proFreeUser._id,
      name: 'Dr. Sameer Sen',
      email: proFreeUser.email,
      phone: '+91 98765 43211',
      bookingSlug: 'dr-sameer-free',
      plan: 'FREE',
    });

    const proFreeLimit = await getAiLimitForUser({ user: proFreeUser, profile: proFreeProfile });
    assert.strictEqual(proFreeLimit.limit, 5, 'Free Pro limit should be 5');
    assert.strictEqual(proFreeLimit.plan, 'FREE');

    for (let i = 1; i <= 5; i++) {
      const res = await consumeAiQuery({ user: proFreeUser, profile: proFreeProfile });
      assert.strictEqual(res.isAllowed, true, `Free Pro query ${i} should be allowed`);
      assert.strictEqual(res.count, i);
      assert.strictEqual(res.remaining, 5 - i);
    }

    // 6th query must be rejected with Pro upgrade prompt
    const blockedFreePro = await consumeAiQuery({ user: proFreeUser, profile: proFreeProfile });
    assert.strictEqual(blockedFreePro.isAllowed, false, '6th query must be blocked for free pro');
    assert.ok(blockedFreePro.reason.includes('5 AI queries'), 'Reason should mention 5 queries');
    assert.ok(blockedFreePro.reason.includes('BookSaathi Pro'), 'Reason should promote Pro plan');
    console.log('✔ PASS: Professional Free Account 5 queries/day limit verified.');

    // ----------------------------------------------------
    // TEST 3: Professional with Pro Account gets 25 queries/day
    // ----------------------------------------------------
    console.log('\n[TEST 3] Verifying Professional Pro Account 25 queries/day limit...');
    const proPaidUser = await User.create({
      name: 'Dr. Sunita Patel',
      email: 'sunita@example.com',
      password: 'password123',
      role: 'PROFESSIONAL',
    });

    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const proPaidProfile = await ProfessionalProfile.create({
      userId: proPaidUser._id,
      name: 'Dr. Sunita Patel',
      email: proPaidUser.email,
      phone: '+91 98765 43212',
      bookingSlug: 'dr-sunita-pro',
      plan: 'PRO',
      planExpiresAt: nextMonth,
    });

    const proPaidLimit = await getAiLimitForUser({ user: proPaidUser, profile: proPaidProfile });
    assert.strictEqual(proPaidLimit.limit, 25, 'Pro account limit should be 25');
    assert.strictEqual(proPaidLimit.plan, 'PRO');

    for (let i = 1; i <= 25; i++) {
      const res = await consumeAiQuery({ user: proPaidUser, profile: proPaidProfile });
      assert.strictEqual(res.isAllowed, true, `Pro query ${i} should be allowed`);
      assert.strictEqual(res.count, i);
      assert.strictEqual(res.remaining, 25 - i);
    }

    // 26th query must be rejected
    const blockedPro = await consumeAiQuery({ user: proPaidUser, profile: proPaidProfile });
    assert.strictEqual(blockedPro.isAllowed, false, '26th query must be blocked');
    assert.strictEqual(blockedPro.remaining, 0);
    assert.ok(blockedPro.reason.includes('25 AI queries'), 'Reason should mention 25 queries');
    console.log('✔ PASS: Professional Pro Account 25 queries/day limit verified.');

    // ----------------------------------------------------
    // TEST 4: ADMIN role gets Unlimited queries
    // ----------------------------------------------------
    console.log('\n[TEST 4] Verifying Admin Unlimited queries...');
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@booksaathi.com',
      password: 'password123',
      role: 'ADMIN',
    });

    const adminLimit = await getAiLimitForUser({ user: adminUser });
    assert.strictEqual(adminLimit.isUnlimited, true, 'Admin should be unlimited');
    assert.strictEqual(adminLimit.limit, Infinity, 'Admin limit is Infinity');

    // Run 30 consecutive queries without any blocking
    for (let i = 1; i <= 30; i++) {
      const res = await consumeAiQuery({ user: adminUser });
      assert.strictEqual(res.isAllowed, true, `Admin query ${i} should be allowed`);
      assert.strictEqual(res.isUnlimited, true);
      assert.strictEqual(res.remaining, 'Unlimited');
    }

    const check = await checkAiUsage({ user: adminUser });
    assert.strictEqual(check.isUnlimited, true);
    assert.strictEqual(check.remaining, 'Unlimited');
    console.log('✔ PASS: Admin Unlimited queries verified.');

    console.log('\n=============================================');
    console.log('🎉 ALL AI RATE LIMIT & QUOTA TESTS PASSED! 🎉');
    console.log('=============================================\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await teardownTestDb();
  }
}

runTests();
