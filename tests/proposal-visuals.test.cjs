const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('./security-loader.cjs');

function generator() {
  assert.ok(fs.existsSync(path.resolve(__dirname, '../lib/proposal-visuals.ts')), 'proposal visual generator must exist');
  return load('lib/proposal-visuals.ts').generateProposalVisuals;
}

test('site proposal is a deterministic illustrated hero with a contact CTA', () => {
  const generate = generator();
  const input = { clientName: 'Ateliê Aurora', serviceType: 'SITE_INSTITUCIONAL', offerTitle: 'Uma presença para o ateliê', scopeText: 'Coleções, processo criativo e contato.' };
  const result = generate(input);
  assert.equal(result.length, 1);
  const visual = result[0];
  assert.equal(visual.type, 'site');
  assert.ok(visual.id);
  assert.ok(visual.title);
  assert.equal(visual.width, 1200);
  assert.equal(visual.height, 800);
  assert.match(visual.svg, /<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(visual.svg, /viewBox="0 0 1200 800"/);
  for (const copy of ['Ateliê Aurora', 'Uma presença para o ateliê', 'Coleções, processo criativo e contato.', 'Fale com a equipe', 'Conceito ilustrativo']) {
    assert.ok(visual.svg.includes(copy), `SVG includes: ${copy}`);
  }
  assert.doesNotMatch(visual.svg, /R\$|garantid|100%|aumente|triplique|depoimentos|avaliações/i);
  assert.deepEqual(generate(input), result);
});

test('each service produces its own explicitly provisional concept, not a generic website', () => {
  const generate = generator();
  const cases = [
    ['LANDING_PAGE', 'site', 1, ['LANDING PAGE', 'Fale pelo WhatsApp']],
    ['AUTOMACAO_VENDAS', 'automacao', 1, ['Entrada', 'Consentimento', 'Triagem', 'Equipe', 'Retorno', 'Fluxo proposto']],
    ['GESTAO_REDES_SOCIAIS', 'redes', 3, ['POST', 'Pauta proposta']],
    ['IDENTIDADE_VISUAL', 'logo', 1, ['Estudo de identidade', 'Marca provisória']],
  ];
  const all = [];
  for (const [serviceType, type, count, copy] of cases) {
    const result = generate({ clientName: 'Ateliê Aurora', serviceType, offerTitle: 'Direção para Aurora', scopeText: 'Escopo para validação.' });
    assert.equal(result.length, count, serviceType);
    assert.equal(new Set(result.map(v => v.id)).size, count, 'IDs unique in each collection');
    for (const visual of result) {
      assert.equal(visual.type, type, serviceType);
      for (const phrase of ['Conceito ilustrativo', 'Ateliê Aurora', 'Direção para Aurora', 'Escopo para validação.', ...copy]) {
        assert.ok(visual.svg.includes(phrase), `${serviceType}: ${phrase}`);
      }
      assert.doesNotMatch(visual.svg, /R\$|garantid|100%|aumente|triplique|depoimentos|avaliações/i);
      assert.ok(visual.width >= 800 && visual.height >= 800);
      all.push(visual.svg);
    }
    if (type === 'redes') {
      assert.equal(new Set(result.map(v => v.svg)).size, 3, 'three distinct social posts');
      assert.equal(new Set(result.map(v => v.title)).size, 3, 'individually named posts');
    }
  }
  assert.equal(new Set(all).size, all.length);
  assert.deepEqual(generate({ clientName: 'Aurora', serviceType: 'UNKNOWN' }), []);
  assert.deepEqual(generate({ clientName: 'Aurora', serviceType: 'toString' }), []);
});

test('long copy stays in its text column without invading artwork or navigation', () => {
  const generate = generator();
  const long = 'W'.repeat(600);
  for (const serviceType of ['SITE_INSTITUCIONAL', 'LANDING_PAGE', 'AUTOMACAO_VENDAS', 'GESTAO_REDES_SOCIAIS', 'IDENTIDADE_VISUAL']) {
    for (const { svg } of generate({ clientName: long, serviceType, offerTitle: long, scopeText: long })) {
      const right = serviceType === 'SITE_INSTITUCIONAL' || serviceType === 'LANDING_PAGE' ? 698 : serviceType === 'GESTAO_REDES_SOCIAIS' ? 1032 : 1152;
      for (const [, attrs, copy] of svg.matchAll(/<text\s+([^>]+)>([^<]*)<\/text>/g)) {
        if (!copy.startsWith('WWW')) continue;
        const attr = name => Number(attrs.match(new RegExp(`${name}="([0-9.]+)"`))?.[1]);
        assert.ok(copy.length <= 92, 'visible copy must be truncated, not merely squeezed');
        const textWidth = attr('textLength') || copy.length * attr('font-size');
        assert.ok(attr('x') + textWidth <= right, `text exceeds its column: ${attrs}`);
      }
      assert.match(svg, /…/);
    }
  }
});

test('identity stays a bounded provisional monogram, never an inferred real logo', () => {
  const generate = generator();
  const input = { clientName: 'ß ß', serviceType: 'IDENTIDADE_VISUAL' };
  const [visual] = generate(input);
  const monogram = visual.svg.match(/<text[^>]+text-anchor="middle"[^>]*>([^<]*)<\/text>/)?.[1];
  assert.ok(monogram);
  assert.ok(Array.from(monogram).length <= 2, 'case expansion cannot overflow the monogram');
  assert.match(visual.svg, /Marca provisória/);
  assert.deepEqual(generate({ ...input, brand: { primary: 'red\" onload=\"alert(1)', logoDataUrl: 'data:image/svg+xml,<svg onload="alert(1)"/>' } }), [visual]);
  assert.doesNotMatch(visual.svg, /<image|onload=|href=/);
});

test('untrusted proposal copy is XML-safe and remains URI-encodable', () => {
  const generate = generator();
  const payload = `A & B <script>alert("x")</script> 'logo'\u0000\u000b\ud800`;
  for (const serviceType of ['SITE_INSTITUCIONAL', 'LANDING_PAGE', 'AUTOMACAO_VENDAS', 'GESTAO_REDES_SOCIAIS', 'IDENTIDADE_VISUAL']) {
    for (const { svg } of generate({ clientName: payload, serviceType, offerTitle: payload, scopeText: payload })) {
      assert.doesNotMatch(svg, /<script|\u0000|\u000b/);
      assert.match(svg, /&amp;/);
      assert.match(svg, /&lt;script&gt;/);
      assert.match(svg, /&quot;/);
      assert.match(svg, /&apos;/);
      assert.doesNotThrow(() => encodeURIComponent(svg));
      assert.doesNotMatch(svg, /<image|<foreignObject|https:\/\//);
    }
  }
});
