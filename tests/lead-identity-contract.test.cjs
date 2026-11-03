const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./security-loader.cjs');
const normalization = load('lib/lead-normalization.ts');
const server = load('lib/crm-server.ts', { './prisma': { __esModule: true, default: {} } });

test('telefones mantêm + canônico no transporte e dígitos apenas para wa.me', () => {
  for (const [raw, canonical] of [
    ['+1 (202) 555-0123', '+12025550123'],
    ['+44 20 7946 0958', '+442079460958'],
    ['0044 20 7946 0958', '+442079460958'],
    ['(92) 99999-0000', '+5592999990000'],
    ['55 11 3333-4444', '+551133334444'],
    // Sem marcador internacional, conserva o contrato nacional BR; não infere EUA.
    ['12025550123', '+5512025550123'],
  ]) {
    const lead = normalization.normalizeLead({ nome: 'Empresa sintética', phone: raw });
    assert.equal(lead.phoneWhatsapp, canonical);
    assert.equal(lead.normalizedPhone, canonical);
    assert.equal(lead.phone, canonical);
    assert.equal(lead.phone_digits, canonical.slice(1));
    assert.equal(normalization.canonicalizePhone(raw), canonical);
    assert.equal(normalization.canonicalizePhone(canonical), canonical);
    assert.equal(normalization.normalizePhone(canonical), canonical.slice(1));
    assert.equal(server.normalizeCrmPhone(raw), canonical);
    assert.equal(server.normalizeCrmPhone(lead.phoneWhatsapp), canonical);
    assert.deepEqual(normalization.normalizeLead(lead), lead);
  }
  for (const raw of ['call +1 2025550123', '+0123456789', '123', '442079460958']) {
    assert.equal(normalization.canonicalizePhone(raw), null);
    assert.throws(() => server.normalizeCrmPhone(raw), error => error.status === 400);
  }
  assert.equal(normalization.canonicalizePhone(null), null);
  assert.equal(server.normalizeCrmPhone(null), null);
});