import { requireAdmin, authenticate } from '../src/middleware/authMiddleware.js';

console.log('\n======================================================');
console.log('🧪 Starting Admin Demo Read-Only Guard Verification');
console.log('======================================================\n');

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

// 1. Development Mode Test (NODE_ENV=development)
process.env.NODE_ENV = 'development';
delete process.env.DEMO_MODE;
delete process.env.ADMIN_READ_ONLY;

const devReq = {
  method: 'POST',
  originalUrl: '/api/admin/settings',
  user: { role: 'ADMIN', isActive: true },
};
let devPassed = false;
const devRes = {
  status: (s) => ({ json: (d) => {} }),
};
requireAdmin(devReq, devRes, () => {
  devPassed = true;
});
assert(devPassed === true, 'In NODE_ENV=development, Admin can perform POST/PUT/PATCH/DELETE');

// 2. Production Mode without DEMO_MODE (Standard Production) - mutations allowed
process.env.NODE_ENV = 'production';
delete process.env.DEMO_MODE;
delete process.env.ADMIN_READ_ONLY;

const prodReq = {
  method: 'POST',
  originalUrl: '/api/admin/users/123',
  user: { role: 'ADMIN', isActive: true },
};
let prodPassed = false;
requireAdmin(prodReq, devRes, () => {
  prodPassed = true;
});
assert(prodPassed === true, 'In NODE_ENV=production without DEMO_MODE, Admin can perform mutating actions');

// 3. DEMO_MODE=true explicit override - mutations blocked, GET allowed
process.env.DEMO_MODE = 'true';
const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
mutatingMethods.forEach((method) => {
  const demoMutateReq = {
    method,
    originalUrl: '/api/admin/users/123',
    user: { role: 'ADMIN', isActive: true },
  };
  let blockedCode = null;
  let blockedMessage = null;
  const mockRes = {
    status: (code) => ({
      json: (body) => {
        blockedCode = code;
        blockedMessage = body?.message;
      },
    }),
  };
  requireAdmin(demoMutateReq, mockRes, () => {});
  assert(
    blockedCode === 403 && blockedMessage?.includes('Demo Mode Active'),
    `When DEMO_MODE=true, Admin ${method} is blocked with 403 Demo Mode notice`
  );
});

// 4. DEMO_MODE=true - GET requests remain allowed
const demoGetReq = {
  method: 'GET',
  originalUrl: '/api/admin/overview',
  user: { role: 'ADMIN', isActive: true },
};
let demoGetPassed = false;
requireAdmin(demoGetReq, devRes, () => {
  demoGetPassed = true;
});
assert(demoGetPassed === true, 'When DEMO_MODE=true, Admin CAN perform GET / view data');

console.log('\n======================================================');
console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
