const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const filename = path.join(__dirname, '../lib/commercial-domain.ts');
function load() {
  assert.ok(fs.existsSync(filename), 'O domínio comercial precisa existir para centralizar etapas e métricas');
  const m = { exports: {} };
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('exports', 'require', 'module', js)(m.exports, require, m);
  return m.exports;
}
test('funil aberto exclui ganhos e perdas e normaliza etapas antigas', () => {
  const { commercialMetrics, canonicalStage } = load();
  assert.equal(canonicalStage('REUNIAO_AGENDADA'), 'ANALISE_AGENDADA');
  assert.equal(canonicalStage('FECHADO'), 'FECHADO_GANHO');
  const metrics = commercialMetrics([
    { stage: 'QUALIFICADO', estimatedValue: 1000, probability: 30 },
    { stage: 'FECHADO', estimatedValue: 4000, probability: 100 },
    { stage: 'PERDIDO', estimatedValue: 9000, probability: 0 },
  ], []);
  assert.equal(metrics.openValue, 1000);
  assert.equal(metrics.weightedValue, 300);
  assert.equal(metrics.wonCount, 1);
  assert.equal(metrics.lostCount, 1);
  assert.equal(metrics.conversionRate, 50);
  assert.equal(metrics.averageClosingDays, null);
});
test('MRR normaliza periodicidade sem tratar anual como mensal', () => {
  const { commercialMetrics } = load();
  const metrics = commercialMetrics([], [{status:'ATIVO', recurringValue:1200, billingPeriod:'ANUAL'}, {status:'RASCUNHO',recurringValue:500,billingPeriod:'MENSAL'}]);
  assert.equal(metrics.mrr,100);
  assert.equal(metrics.conversionRate,null);
});
test('filtro de nicho e busca são aplicados juntos', () => {
  const { filterOpportunities } = load();
  assert.equal(typeof filterOpportunities,'function');
  const items=[{companyName:'Alpha',title:'Site',nicho:'ESTETICA'},{companyName:'Alpha Odonto',title:'LP',nicho:'ODONTOLOGIA'}];
  assert.deepEqual(filterOpportunities(items,'alpha','ODONTOLOGIA').map(x=>x.companyName),['Alpha Odonto']);
});
