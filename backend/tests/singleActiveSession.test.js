import jwt from 'jsonwebtoken';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { LoginActivity } from '../src/models/LoginActivity.js';
import {
  loginUser,
  registerCustomer,
  registerProfessional,
  generateAccessToken,
  logoutUser,
} from '../src/services/authService.js';
import { authenticate, requireAdmin } from '../src/middleware/authMiddleware.js';
import { getMyLoginActivity, getAdminLoginActivity } from '../src/services/loginActivityService.js';

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

// Mock Express req/res helpers
function createMockReq(headers = {}, cookies = {}) {
  return {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'x-forwarded-for': '203.0.113.195',
      ...headers,
    },
    cookies,
    ip: '203.0.113.195',
    method: 'GET',
    url: '/api/auth/me',
  };
}

function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

async function runSingleActiveSessionTests() {
  console.log('\n======================================================');
  console.log('🔒 BookSaathi Single Active Session & Login Activity Tests');
  console.log('======================================================\n');

  try {
    await connectDB();
    const timestamp = Date.now();

    // ----------------------------------------------------
    // TEST 1: User Login from Device A establishes active session
    // ----------------------------------------------------
    console.log('--- TEST 1: Device A Login establishes ACTIVE Session ---');
    const userEmail = `singlesession.${timestamp}@test.com`;
    const password = 'Password123!';

    const regRes = await registerCustomer({
      name: 'Single Session User',
      email: userEmail,
      password,
      phone: '+91 9876543210',
    }, { userAgent: 'Device-A-Chrome', ipAddress: '198.51.100.1' });

    assert(Boolean(regRes.sessionId), 'Registration generated a unique active sessionId');
    assert(Boolean(regRes.accessToken), 'Registration returned access token');

    const decodedReg = jwt.decode(regRes.accessToken);
    assert(decodedReg.sessionId === regRes.sessionId, 'JWT payload contains sessionId matching activeSessionId');

    const userDoc1 = await User.findById(regRes.user.id);
    assert(userDoc1.activeSessionId === regRes.sessionId, 'User document persisted activeSessionId');

    // ----------------------------------------------------
    // TEST 2: Device B Login replaces Device A Session
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Device B Login REPLACES Device A Session ---');
    const deviceBRes = await loginUser(userEmail, password, {
      userAgent: 'Device-B-Firefox',
      ipAddress: '203.0.113.42',
    });

    assert(deviceBRes.sessionId !== regRes.sessionId, 'Device B received a new unique sessionId');
    
    const userDoc2 = await User.findById(regRes.user.id);
    assert(userDoc2.activeSessionId === deviceBRes.sessionId, 'User activeSessionId updated to Device B session');

    // Check LoginActivity logs
    const replacedLog = await LoginActivity.findOne({
      userId: regRes.user.id,
      eventType: 'SESSION_REPLACED',
      sessionId: regRes.sessionId,
    });
    assert(Boolean(replacedLog), 'SESSION_REPLACED audit log recorded for Device A session');
    assert(replacedLog.status === 'revoked', 'SESSION_REPLACED status marked as revoked');

    const newLoginLog = await LoginActivity.findOne({
      userId: regRes.user.id,
      eventType: 'LOGIN_SUCCESS',
      sessionId: deviceBRes.sessionId,
    });
    assert(Boolean(newLoginLog), 'LOGIN_SUCCESS audit log recorded for Device B session');

    // ----------------------------------------------------
    // TEST 3: Device A Token is Rejected with 401 SESSION_REVOKED
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Device A Token Authenticated Request Rejected with SESSION_REVOKED ---');
    const reqA = createMockReq({ authorization: `Bearer ${regRes.accessToken}` });
    const resA = createMockRes();
    let nextCalledA = false;

    await authenticate(reqA, resA, () => { nextCalledA = true; });

    assert(!nextCalledA, 'Device A request blocked by authenticate middleware');
    assert(resA.statusCode === 401, 'Device A received HTTP 401 Unauthorized');
    assert(resA.body?.code === 'SESSION_REVOKED', `Error response code is SESSION_REVOKED (received: ${resA.body?.code})`);

    // ----------------------------------------------------
    // TEST 4: Device B Token is Accepted (200 OK)
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Device B Token Authenticated Request Succeeds ---');
    const reqB = createMockReq({ authorization: `Bearer ${deviceBRes.accessToken}` });
    const resB = createMockRes();
    let nextCalledB = false;

    await authenticate(reqB, resB, () => { nextCalledB = true; });

    assert(nextCalledB, 'Device B request passed authenticate middleware');
    assert(reqB.sessionId === deviceBRes.sessionId, 'req.sessionId populated with Device B session');
    assert(String(reqB.user._id) === String(regRes.user.id), 'req.user populated with authenticated user');

    // ----------------------------------------------------
    // TEST 5: Multi-Tab Handling within Same Active Session
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Multi-Tab Requests in Active Session Remain Valid ---');
    const reqTab2 = createMockReq({ authorization: `Bearer ${deviceBRes.accessToken}` });
    const resTab2 = createMockRes();
    let tab2Passed = false;

    await authenticate(reqTab2, resTab2, () => { tab2Passed = true; });
    assert(tab2Passed, 'Secondary tab in same session successfully authenticates');

    // ----------------------------------------------------
    // TEST 6: User Isolation (User A does not affect User B)
    // ----------------------------------------------------
    console.log('\n--- TEST 6: User Isolation (User A & User B Sessions Independent) ---');
    const userEmail2 = `second.user.${timestamp}@test.com`;
    const userBRes = await registerCustomer({
      name: 'Second Test User',
      email: userEmail2,
      password,
    }, { userAgent: 'User-B-Mobile', ipAddress: '198.51.100.99' });

    // Verify User A (Device B) still active
    const reqACheck = createMockReq({ authorization: `Bearer ${deviceBRes.accessToken}` });
    const resACheck = createMockRes();
    let aStillValid = false;
    await authenticate(reqACheck, resACheck, () => { aStillValid = true; });
    assert(aStillValid, 'User A active session completely unaffected by User B login');

    // ----------------------------------------------------
    // TEST 7: Professional & Admin Session Replacement
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Professional & Admin Session Replacement ---');
    const proEmail = `pro.session.${timestamp}@test.com`;
    const proReg = await registerProfessional({
      name: 'Dr. Single Session',
      email: proEmail,
      password,
      phone: '+91 9999988888',
      profession: 'Doctor',
    }, { userAgent: 'Pro-Desktop', ipAddress: '1.2.3.4' });

    const proLogin2 = await loginUser(proEmail, password, { userAgent: 'Pro-Mobile', ipAddress: '5.6.7.8' });
    assert(proLogin2.sessionId !== proReg.sessionId, 'Professional second login created new sessionId');

    // Test Pro Device 1 rejected
    const reqPro1 = createMockReq({ authorization: `Bearer ${proReg.accessToken}` });
    const resPro1 = createMockRes();
    let pro1Passed = false;
    await authenticate(reqPro1, resPro1, () => { pro1Passed = true; });
    assert(!pro1Passed && resPro1.body?.code === 'SESSION_REVOKED', 'Old professional session revoked on new login');

    // ----------------------------------------------------
    // TEST 8: Failed Login Audit Logging without Leaking Passwords
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Failed Login Audit Logging ---');
    try {
      await loginUser(userEmail, 'WrongPassword123!', {
        userAgent: 'Hacker-Bot',
        ipAddress: '192.0.2.1',
      });
    } catch (err) {
      assert(err.statusCode === 401, 'Failed login rejected with HTTP 401');
    }

    const failedLog = await LoginActivity.findOne({
      userEmail,
      eventType: 'LOGIN_FAILED',
    }).sort({ createdAt: -1 });

    assert(Boolean(failedLog), 'LOGIN_FAILED recorded in LoginActivity');
    assert(failedLog.status === 'failed', 'Status marked as failed');
    assert(!failedLog.details.password && !JSON.stringify(failedLog).includes('WrongPassword123!'), 'No raw password stored in audit logs');

    // ----------------------------------------------------
    // TEST 9: Normal Logout Invalidation & Audit Log
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Logout Invalidates Session and Records Log ---');
    const userDocBeforeLogout = await User.findById(regRes.user.id);
    await logoutUser(userDocBeforeLogout, null, {
      userAgent: 'Device-B-Firefox',
      ipAddress: '203.0.113.42',
      sessionId: deviceBRes.sessionId,
    });

    const userDocAfterLogout = await User.findById(regRes.user.id);
    assert(userDocAfterLogout.activeSessionId === null, 'User activeSessionId cleared on logout');

    const logoutLog = await LoginActivity.findOne({
      userId: regRes.user.id,
      eventType: 'LOGOUT',
    }).sort({ createdAt: -1 });
    assert(Boolean(logoutLog), 'LOGOUT event recorded in LoginActivity');

    // Subsequent request with logged out token rejected
    const reqAfterLogout = createMockReq({ authorization: `Bearer ${deviceBRes.accessToken}` });
    const resAfterLogout = createMockRes();
    let logoutRequestPassed = false;
    await authenticate(reqAfterLogout, resAfterLogout, () => { logoutRequestPassed = true; });
    assert(!logoutRequestPassed, 'Logged out session token rejected by authenticate middleware');

    // ----------------------------------------------------
    // TEST 10: User Login Activity API Data & Masking
    // ----------------------------------------------------
    console.log('\n--- TEST 10: getMyLoginActivity Returns Safe Masked Data ---');
    // Log user back in to generate fresh session
    const freshLogin = await loginUser(userEmail, password, {
      userAgent: 'Chrome-Windows',
      ipAddress: '49.36.120.88',
    });

    const userDocFresh = await User.findById(regRes.user.id);
    const myActivity = await getMyLoginActivity(userDocFresh, freshLogin.sessionId, { page: 1, limit: 10 });

    assert(Boolean(myActivity.currentSession), 'Returns currentSession metadata');
    assert(myActivity.currentSession.isActive === true, 'Current session marked active');
    assert(myActivity.logs.length > 0, 'Returns list of user activity logs');
    assert(myActivity.logs[0].ipAddress.includes('***'), `IP is masked for privacy: ${myActivity.logs[0].ipAddress}`);

    // Verify current session flag on the newest LOGIN_SUCCESS
    const activeLogItem = myActivity.logs.find((l) => l.sessionId === freshLogin.sessionId && l.eventType === 'LOGIN_SUCCESS');
    assert(Boolean(activeLogItem && activeLogItem.isCurrentSession), 'Matching login record flagged with isCurrentSession: true');

    // ----------------------------------------------------
    // TEST 11: Admin Platform-Wide Security Monitoring & RBAC
    // ----------------------------------------------------
    console.log('\n--- TEST 11: Admin Security Activity & RBAC ---');
    const adminUser = await User.create({
      name: 'Security Admin',
      email: `admin.security.${timestamp}@test.com`,
      password,
      role: 'ADMIN',
      isActive: true,
    });

    // Test non-admin rejected by requireAdmin
    const nonAdminReq = { user: userDocFresh };
    const nonAdminRes = createMockRes();
    let nonAdminPassed = false;
    requireAdmin(nonAdminReq, nonAdminRes, () => { nonAdminPassed = true; });
    assert(!nonAdminPassed && nonAdminRes.statusCode === 403, 'Non-admin rejected from admin security routes (403)');

    // Test admin query
    const adminLogsResult = await getAdminLoginActivity({ page: 1, limit: 10 });
    assert(Array.isArray(adminLogsResult.logs), 'Admin retrieved platform-wide security logs');
    assert(Boolean(adminLogsResult.kpis), 'Admin retrieved security KPIs (success/failed/replaced 24h)');
    assert(adminLogsResult.pagination.total >= 3, 'Pagination metadata returned correctly');

    console.log('\n======================================================');
    console.log(`📊 Single Active Session Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Test run failed unexpectedly:', err);
    failed++;
  } finally {
    await disconnectDB();
  }
}

runSingleActiveSessionTests();
