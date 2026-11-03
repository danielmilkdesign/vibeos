const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./security-loader.cjs');

test('missingServiceTypes deduplicates against the lead without inventing services', () => {
  const { missingServiceTypes, TIPOS_SERVICO } = load('lib/gerador-propostas.ts');
  assert.equal(missingServiceTypes('TODOS', []).length, TIPOS_SERVICO.length);
  const partial = missingServiceTypes('TODOS', ['SITE_INSTITUCIONAL', undefined, 'GESTAO_REDES_SOCIAIS']);
  assert.ok(!partial.includes('SITE_INSTITUCIONAL'));
  assert.ok(!partial.includes('GESTAO_REDES_SOCIAIS'));
  assert.equal(partial.length, TIPOS_SERVICO.length - 2);
  assert.deepEqual(missingServiceTypes('SITE_INSTITUCIONAL', ['SITE_INSTITUCIONAL']), []);
  assert.deepEqual(missingServiceTypes('SITE_INSTITUCIONAL', []), ['SITE_INSTITUCIONAL']);
});

test('acceptance within validity can be registered after expiry; acceptance after validity is still rejected', () => {
  const { createProposalDraft, editProposal, approveProposalInternally, recordProposalSent, acceptProposal } = load('lib/proposal-domain.ts');
  const now1 = '2026-10-01T10:00:00.000Z';
  let p = createProposalDraft({ clientName: 'Sintético', offerTitle: 'Oferta', scopeText: 'Escopo', setupValue: 100, recurringValue: 0, billingPeriod: 'UNICO', paymentTerms: 'Único', deliveryTimeline: '10 dias', exclusions: 'Exclusões', acceptanceCriteria: 'Critérios', responsibilities: 'Responsabilidades', thirdPartyCosts: 'Nenhum' }, now1);
  p = editProposal(p, { validUntil: '2026-10-31' }, now1);
  p.confirmedTerms = true; p.pricingStatus = 'CONFIRMADO';
  p = approveProposalInternally(p, now1);
  p = recordProposalSent(p, 'Envio sintético registrado', now1);
  const late = '2026-11-20T10:00:00.000Z';
  const accepted = acceptProposal(p, { evidence: 'Aceite ocorrido dentro da validade', acceptedAt: '2026-10-30T12:00:00.000Z', version: 2 }, late);
  assert.equal(accepted.status, 'APROVADA');
  assert.equal(accepted.acceptance.acceptedAt, '2026-10-30T12:00:00.000Z');
  assert.throws(() => acceptProposal(p, { evidence: 'x', acceptedAt: '2026-11-15T10:00:00.000Z', version: 2 }, late), /validade/i);
  assert.throws(() => acceptProposal(p, { evidence: 'x', acceptedAt: '2026-09-30T09:00:00.000Z', version: 2 }, late), /evidência, data válida/);
});