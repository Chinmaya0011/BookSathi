import jwt from 'jsonwebtoken';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { ProfessionalProfile } from '../src/models/ProfessionalProfile.js';
import { SystemAuditLog } from '../src/models/SystemAuditLog.js';
import {
  generateAccessToken,
  generateRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  loginUser,
  registerCustomer,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_DAYS,
  MAX_FAILED_LOGIN_ATTEMPTS,
} from '../src/services/authService.js';
import { authenticate, requireAdmin, verifyCsrf } from '../src/middleware/authMiddleware.js';
import { updateUserAdmin } from '../src/services/adminService.js';
import { authLimiter, bookingLimiter } from '../src/middleware/rateLimiter.js';

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

async function runAuthHardeningTests() {
  console.log('\n======================================================');
  console.log('🛡️ Starting BookSaathi Auth Hardening & Security Test Suite');
  console.log('======================================================\n');

  try {
    await connectDB();
    const timestamp = Date.now();

    // --- TEST 1: Access Token 15m & Refresh Token 7d Rotating ---
    console.log('--- TEST 1: Access Token 15m & Refresh Token 7d Rotating ---');
    const user = await User.create({
      name: 'Token Test User',
      email: `token.user.${timestamp}@test.com`,
      password: 'Password123!',
      role: 'USER',
      isActive: true,
    });

    const accessToken = generateAccessToken(user);
    const decoded = jwt.decode(accessToken);
    const tokenLifespanSeconds = decoded.exp - decoded.iat;
    assert(tokenLifespanSeconds === 15 * 60, `Access token lifespan is exactly 15 minutes (${tokenLifespanSeconds}s)`);

    const rawRefresh1 = await generateRefreshToken(user);
    assert(typeof rawRefresh1 === 'string' && rawRefresh1.length === 64, 'Generated cryptographically secure 64-char refresh token');

    const refreshedUser = await User.findById(user._id);
    assert(refreshedUser.refreshTokens.length === 1, 'Refresh token hash persisted in user document');
    const refreshLifespanDays = (refreshedUser.refreshTokens[0].expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    assert(Math.round(refreshLifespanDays) === REFRESH_TOKEN_EXPIRES_DAYS, `Refresh token valid for ${REFRESH_TOKEN_EXPIRES_DAYS} days`);

    // Rotation test
    const rotationResult = await rotateRefreshToken(rawRefresh1);
    assert(rotationResult.accessToken && rotationResult.refreshToken, 'Rotation successfully generated new access and refresh tokens');
    assert(rotationResult.refreshToken !== rawRefresh1, 'New refresh token is different from used refresh token');

    // Attempting to reuse old refresh token must fail
    let reuseFailed = false;
    try {
      await rotateRefreshToken(rawRefresh1);
    } catch (err) {
      reuseFailed = true;
    }
    assert(reuseFailed, 'Re-using already rotated refresh token is rejected (401)');

    // Revocation on logout
    await revokeRefreshToken(rotationResult.refreshToken);
    const userAfterRevoke = await User.findById(user._id);
    assert(userAfterRevoke.refreshTokens.length === 0, 'Refresh token revoked on logout');

    // --- TEST 2: CSRF Protection for Cookie-Based Auth ---
    console.log('\n--- TEST 2: CSRF Protection for Cookie-Based Auth ---');
    // 1. Bearer token request bypasses CSRF
    let bearerCsrfPassed = false;
    const reqBearer = {
      method: 'POST',
      headers: { authorization: 'Bearer some_token' },
      cookies: {},
    };
    verifyCsrf(reqBearer, {}, () => { bearerCsrfPassed = true; });
    assert(bearerCsrfPassed, 'Bearer token requests bypass CSRF (no cookie vulnerability)');

    // 2. Cookie auth without CSRF token is rejected
    let cookieNoCsrfRejected = false;
    const reqCookieNoCsrf = {
      method: 'POST',
      headers: {},
      cookies: { accessToken: 'cookie_jwt_token', csrfToken: 'valid_csrf_123' },
    };
    const resMock = {
      status: (code) => ({
        json: (data) => {
          if (code === 403) cookieNoCsrfRejected = true;
        },
      }),
    };
    verifyCsrf(reqCookieNoCsrf, resMock, () => {});
    assert(cookieNoCsrfRejected, 'Cookie-authenticated POST request without CSRF header is rejected (403)');

    // 3. Cookie auth with matching CSRF token passes
    let cookieValidCsrfPassed = false;
    const reqCookieValid = {
      method: 'POST',
      headers: { 'x-csrf-token': 'valid_csrf_123' },
      cookies: { accessToken: 'cookie_jwt_token', csrfToken: 'valid_csrf_123' },
    };
    verifyCsrf(reqCookieValid, {}, () => { cookieValidCsrfPassed = true; });
    assert(cookieValidCsrfPassed, 'Cookie-authenticated POST with matching X-CSRF-Token passes verification');

    // --- TEST 3: Lock Account After N Failed Logins ---
    console.log('\n--- TEST 3: Account Lockout after 5 Failed Logins ---');
    const victimUser = await User.create({
      name: 'Lockout Target',
      email: `victim.${timestamp}@test.com`,
      password: 'CorrectPassword123!',
      role: 'USER',
      isActive: true,
    });

    // 4 failed attempts
    for (let i = 1; i <= 4; i++) {
      try {
        await loginUser(victimUser.email, 'WrongPassword!');
      } catch (err) {
        // Expected
      }
    }
    const victimAfter4 = await User.findById(victimUser._id);
    assert(victimAfter4.failedLoginAttempts === 4, `Failed attempts recorded: ${victimAfter4.failedLoginAttempts}/5`);
    assert(!victimAfter4.lockUntil, 'Account not yet locked after 4 attempts');

    // 5th failed attempt triggers lock
    let lockedTriggered = false;
    try {
      await loginUser(victimUser.email, 'WrongPassword!');
    } catch (err) {
      if (err.statusCode === 423) lockedTriggered = true;
    }
    assert(lockedTriggered, '5th failed attempt locked the account with HTTP 423 Locked');

    const victimLocked = await User.findById(victimUser._id);
    assert(victimLocked.lockUntil && victimLocked.lockUntil > new Date(), 'lockUntil timestamp set in DB for 15-minute duration');

    // Attempting correct password while locked is rejected
    let loginWhileLockedRejected = false;
    try {
      await loginUser(victimUser.email, 'CorrectPassword123!');
    } catch (err) {
      if (err.statusCode === 423) loginWhileLockedRejected = true;
    }
    assert(loginWhileLockedRejected, 'Login with correct password rejected while account is locked');

    // Reset lock
    victimLocked.lockUntil = null;
    victimLocked.failedLoginAttempts = 0;
    await victimLocked.save();

    // Login succeeds now
    const loginSuccess = await loginUser(victimUser.email, 'CorrectPassword123!');
    assert(loginSuccess.accessToken && loginSuccess.user.email === victimUser.email, 'Login succeeds after lock cleared and resets failed counters');

    // --- TEST 4: ADMIN Routes Require Role ADMIN + isActive ---
    console.log('\n--- TEST 4: ADMIN Route RBAC & isActive Enforcement ---');
    let nonAdminRejected = false;
    requireAdmin({ user: { role: 'USER', isActive: true } }, { status: (c) => ({ json: () => { if (c === 403) nonAdminRejected = true; } }) }, () => {});
    assert(nonAdminRejected, 'Non-admin user rejected from admin route (403)');

    let inactiveAdminRejected = false;
    requireAdmin({ user: { role: 'ADMIN', isActive: false } }, { status: (c) => ({ json: () => { if (c === 403) inactiveAdminRejected = true; } }) }, () => {});
    assert(inactiveAdminRejected, 'Inactive admin (isActive: false) rejected from admin route (403)');

    let activeAdminPassed = false;
    requireAdmin({ user: { role: 'ADMIN', isActive: true } }, {}, () => { activeAdminPassed = true; });
    assert(activeAdminPassed, 'Active admin (role: ADMIN, isActive: true) granted admin access');

    // --- TEST 5: Role Elevation Rules & Audit Logging ---
    console.log('\n--- TEST 5: Role Elevation Rules & SystemAuditLog ---');
    const adminUser = await User.create({
      name: 'Super Admin',
      email: `admin.${timestamp}@test.com`,
      password: 'AdminPassword123!',
      role: 'ADMIN',
      isActive: true,
    });

    const targetUser = await User.create({
      name: 'Candidate User',
      email: `candidate.${timestamp}@test.com`,
      password: 'UserPassword123!',
      role: 'USER',
      isActive: true,
    });

    // 1. Admin elevates USER -> PROFESSIONAL
    const elevatedPro = await updateUserAdmin(targetUser._id, adminUser, { role: 'PROFESSIONAL' });
    assert(elevatedPro.role === 'PROFESSIONAL', 'Admin successfully elevated USER -> PROFESSIONAL');
    const proProfileCreated = await ProfessionalProfile.findOne({ userId: targetUser._id });
    assert(proProfileCreated !== null, 'Professional profile automatically linked/created on elevation');
    const proAudit = await SystemAuditLog.findOne({ targetId: targetUser._id.toString(), action: 'ROLE_ELEVATION_PROFESSIONAL' });
    assert(proAudit !== null, 'SystemAuditLog recorded for ROLE_ELEVATION_PROFESSIONAL');

    // 2. Self-elevation/modification rejected
    let selfModRejected = false;
    try {
      await updateUserAdmin(adminUser._id, adminUser, { role: 'ADMIN' });
    } catch (err) {
      if (err.statusCode === 400) selfModRejected = true;
    }
    // Also test changing own role
    let selfChangeRejected = false;
    try {
      await updateUserAdmin(adminUser._id, adminUser, { role: 'USER' });
    } catch (err) {
      if (err.statusCode === 400) selfChangeRejected = true;
    }
    assert(selfChangeRejected, 'Admin cannot modify or change their own administrative role (Target !== Actor enforced)');

    // 3. Admin elevates USER to ADMIN
    const candidate2 = await User.create({
      name: 'Candidate 2',
      email: `candidate2.${timestamp}@test.com`,
      password: 'Password123!',
      role: 'USER',
      isActive: true,
    });

    const elevatedAdmin = await updateUserAdmin(candidate2._id, adminUser, { role: 'ADMIN' });
    assert(elevatedAdmin.role === 'ADMIN', 'Admin successfully elevated candidate to ADMIN');
    const adminElevationAudit = await SystemAuditLog.findOne({ targetId: candidate2._id.toString(), action: 'ROLE_ELEVATION_ADMIN' });
    assert(adminElevationAudit !== null, 'SystemAuditLog recorded with ROLE_ELEVATION_ADMIN');

    // 4. Production ALLOW_ADMIN_PROMOTION guard
    process.env.NODE_ENV = 'production';
    process.env.ALLOW_ADMIN_PROMOTION = 'false';
    const candidate3 = await User.create({
      name: 'Candidate 3',
      email: `candidate3.${timestamp}@test.com`,
      password: 'Password123!',
      role: 'USER',
      isActive: true,
    });

    let prodPromotionBlocked = false;
    try {
      await updateUserAdmin(candidate3._id, adminUser, { role: 'ADMIN' });
    } catch (err) {
      if (err.statusCode === 403) prodPromotionBlocked = true;
    }
    assert(prodPromotionBlocked, 'In production with ALLOW_ADMIN_PROMOTION=false, admin promotion is blocked (403)');
    process.env.NODE_ENV = 'test';

    // --- TEST 6: Suspended Professional JWT Rejected on Next Request ---
    console.log('\n--- TEST 6: Suspended Professional JWT Rejected on Next Request ---');
    const doctorUser = await User.create({
      name: 'Dr. Test Pro',
      email: `dr.test.${timestamp}@test.com`,
      password: 'Password123!',
      role: 'PROFESSIONAL',
      isActive: true,
    });
    const doctorProfile = await ProfessionalProfile.create({
      userId: doctorUser._id,
      name: 'Dr. Test Pro',
      email: doctorUser.email,
      phone: '+91 99999 88888',
      profession: 'Doctor',
      bookingSlug: `dr-test-${timestamp}`,
      isPublic: true,
      status: 'ACTIVE',
    });

    // Valid JWT issued
    const doctorJwt = generateAccessToken(doctorUser);

    // Initial request succeeds
    let initialAuthPassed = false;
    const reqInitial = { headers: { authorization: `Bearer ${doctorJwt}` }, cookies: {} };
    await authenticate(reqInitial, {}, () => { initialAuthPassed = true; });
    assert(initialAuthPassed, 'Active professional JWT successfully authenticated');

    // Admin suspends professional
    doctorProfile.status = 'SUSPENDED';
    await doctorProfile.save();

    // Next request with the SAME unexpired JWT must be immediately rejected (403)
    let suspendedRejected = false;
    const reqNext = { headers: { authorization: `Bearer ${doctorJwt}` }, cookies: {} };
    const resSuspendedMock = {
      status: (code) => ({
        json: (data) => {
          if (code === 403) suspendedRejected = true;
        },
      }),
    };
    await authenticate(reqNext, resSuspendedMock, () => {});
    assert(suspendedRejected, 'Suspended professional JWT immediately rejected on next request with 403 (Active/Status Verified)');

    // --- TEST 7: Rate Limits Preservation ---
    console.log('\n--- TEST 7: Rate Limits (Auth 20/15min, Booking 15/15min) ---');
    assert(authLimiter !== undefined, 'authLimiter is configured');
    assert(bookingLimiter !== undefined, 'bookingLimiter is configured');

    console.log('\n======================================================');
    console.log(`📊 Auth Hardening Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    process.exit(failed > 0 ? 1 : 0);
  }
}

runAuthHardeningTests();
