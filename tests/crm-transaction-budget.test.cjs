const test = require('node:test');
const assert = require('node:assert/strict');
const { createHmac } = require('node:crypto');
const { load } = require('./security-loader.cjs');

test('lead and collection transactions have a bounded budget for remote database latency', async () => {
  const calls = [];
  const db = { $transaction: async (_fn, options) => { calls.push(options); return {}; } };
  const server = load('lib/crm-server.ts', { './prisma': { __esModule: true, default: db } });
  await server.persistLead({ nomeEmpresa: 'Synthetic transaction', externalId: 'qa-budget' }, 'ADMINISTRADOR', db);
  await server.writeCrmCollection('vibe_leads', { data: [], version: 0 }, 'ADMINISTRADOR', db);
  assert.equal(calls.length, 2);
  for (const options of calls) {
    assert.equal(options?.timeout, 30000, '5s default expires during multi-table persistence');
    assert.equal(options?.maxWait, 10000);
  }
  assert.equal(calls[0].isolationLevel, 'Serializable');
});

test('webhook outer transaction supplies the same bounded budget', async () => {
  const secret = 'synthetic-webhook-budget-secret'.repeat(2);
  const previous = process.env.LEAD_WEBHOOK_SECRET;
  process.env.LEAD_WEBHOOK_SECRET = secret;
  let options;
  const db = { $transaction: async (_fn, opts) => { options = opts; return { persisted: true }; } };
  const route = load('app/api/webhook/lead/route.ts', { '../../../../lib/prisma': { __esModule: true, default: db } });
  const body = JSON.stringify({ company: 'Synthetic budget' });
  const stamp = String(Math.floor(Date.now() / 1000));
  const id = 'synthetic-budget-event';
  const signature = createHmac('sha256', secret).update(`${stamp}.${id}.${body}`).digest('hex');
  try {
    const response = await route.POST(new Request('https://example.invalid/api/webhook/lead', {
      method: 'POST', body, headers: { 'x-webhook-id': id, 'x-webhook-timestamp': stamp, 'x-webhook-signature': `sha256=${signature}` },
    }));
    assert.equal(response.status, 201);
    assert.equal(options?.timeout, 30000);
    assert.equal(options?.maxWait, 10000);
  } finally {
    if (previous === undefined) delete process.env.LEAD_WEBHOOK_SECRET;
    else process.env.LEAD_WEBHOOK_SECRET = previous;
  }
});
