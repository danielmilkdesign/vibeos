const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./security-loader.cjs');

test('normalizeCrmPhone preserves international DDI exactly as normalizePhone does', () => {
  const { normalizeCrmPhone } = load('lib/crm-server.ts', { './prisma': { __esModule: true, default: {} }, './crm-store': load('lib/crm-store.ts') });
  assert.equal(normalizeCrmPhone('+1 202-555-0123'), '+12025550123');
  assert.equal(normalizeCrmPhone('+44 20 7946 0958'), '+442079460958');
  assert.equal(normalizeCrmPhone('+55 (92) 99999-1234'), '+5592999991234');
  assert.equal(normalizeCrmPhone('(92) 99999-1234'), '+5592999991234');
  assert.throws(() => normalizeCrmPhone('xpto'));
});

test('normalizeCrmNicho maps free-text category instead of collapsing to OUTROS', () => {
  const { normalizeCrmNicho } = load('lib/crm-server.ts', { './prisma': { __esModule: true, default: {} }, './crm-store': load('lib/crm-store.ts') });
  assert.equal(normalizeCrmNicho('Clínica odontológica'), 'ODONTOLOGIA');
  assert.equal(normalizeCrmNicho('Personal trainer'), 'PERSONAL_TRAINER');
  assert.equal(normalizeCrmNicho('PERSONAL_TRAINER'), 'PERSONAL_TRAINER');
  assert.equal(normalizeCrmNicho('Qualquer coisa'), 'OUTROS');
});

test('normalizeLead preserves an explicit external id and provides a stable fingerprint otherwise', () => {
  const { normalizeLead } = load('lib/lead-normalization.ts');
  const withId = normalizeLead({ id: 'ext-42', name: 'Empresa X' });
  assert.equal(withId.externalId, 'ext-42');
  const first = normalizeLead({ name: 'Empresa Sem Telefone', address: 'Rua A, 1' });
  const second = normalizeLead({ nome: 'Empresa Sem Telefone', endereco: 'Rua A, 1' });
  assert.ok(first.externalId);
  assert.equal(first.externalId, second.externalId, 'mesma identidade normalizada deve gerar o mesmo fingerprint');
});