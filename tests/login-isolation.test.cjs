const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./security-loader.cjs');

test('invalid requests and one saturated account do not block unrelated logins', async () => {
  const old = process.env.NEXTAUTH_SECRET;
  process.env.NEXTAUTH_SECRET = 'synthetic-login-isolation-secret'.repeat(2);
  let queries = 0;
  const route = load('app/api/auth/login/route.ts', {
    '../../../../lib/prisma': { __esModule: true, default: { user: { findUnique: async () => { queries++; return null; } } } },
    '../../../../lib/server-auth': { authJson: (data, status = 200) => Response.json(data, {status}), sameOrigin: () => true, verifyPassword: async () => false, hashPassword: async () => 'synthetic', readRequestText: request => request.text() },
  });
  const req = (email, type = 'application/json') => new Request('https://example.invalid/api/auth/login', { method: 'POST', headers: {'content-type': type, origin: 'https://example.invalid'}, body: JSON.stringify({email,password:'synthetic'}) });
  try {
    for(let i=0;i<35;i++) assert.equal((await route.POST(req('bad@example.invalid','text/plain'))).status,415);
    assert.equal((await route.POST(req('other@example.invalid'))).status,401);
    for(let i=0;i<35;i++) await route.POST(req('limited@example.invalid'));
    assert.equal((await route.POST(req('limited@example.invalid'))).status,429);
    const before = queries;
    assert.equal((await route.POST(req('fresh@example.invalid'))).status,401);
    assert.equal(queries,before+1);
  } finally { if(old===undefined)delete process.env.NEXTAUTH_SECRET;else process.env.NEXTAUTH_SECRET=old; }
});
