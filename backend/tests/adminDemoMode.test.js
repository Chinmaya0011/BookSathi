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

// 2. Production Mode Test (NODE_ENV=production) - GET allowed
process.env.NODE_ENV = 'production';
const prodGetReq = {
  method: 'GET',
  originalUrl: '/api/admin/overview',
  user: { role: 'ADMIN', isActive: true },
};
let prodGetPassed = false;
requireAdmin(prodGetReq, devRes, () => {
  prodGetPassed = true;
});
assert(prodGetPassed === true, 'In NODE_ENV=production, Admin CAN perform GET / view all data');

// 3. Production Mode Test (NODE_ENV=production) - POST/PATCH/DELETE blocked
const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
mutatingMethods.forEach((method) => {
  const prodMutateReq = {
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
  requireAdmin(prodMutateReq, mockRes, () => {});
  assert(
    blockedCode === 403 && blockedMessage?.includes('Demo Mode Active'),
    `In NODE_ENV=production, Admin ${method} is blocked with 403 Demo Mode notice`
  );
});

// 4. DEMO_MODE=true explicit override
process.env.NODE_ENV = 'development';
process.env.DEMO_MODE = 'true';
const demoModeReq = {
  method: 'DELETE',
  originalUrl: '/api/admin/professionals/999',
  user: { role: 'ADMIN', isActive: true },
};
let demoBlockedCode = null;
const demoRes = {
  status: (code) => ({
    json: (body) => {
      demoBlockedCode = code;
    },
  }),
};
requireAdmin(demoModeReq, demoRes, () => {});
assert(
  demoBlockedCode === 403,
  'When DEMO_MODE=true, Admin mutations are blocked even if NODE_ENV=development'
);

console.log('\n======================================================');
console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
