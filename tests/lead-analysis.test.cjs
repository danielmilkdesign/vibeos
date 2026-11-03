const test=require('node:test');
const assert=require('node:assert/strict');
const {load}=require('./lead-normalization.test.cjs');
test('analysis separates supplied channel facts from unverified hypotheses and unknown metrics',()=>{
 const {analyzeLead}=load('lib/lead-analysis.ts');
 const result=analyzeLead({nomeEmpresa:'Synthetic',website:'https://www.instagram.com/synthetic',phoneWhatsapp:'(92) 99999-0000',rating:4.5,ratingCount:0,source:'synthetic-fixture',observedAt:'2026-01-01T00:00:00.000Z'});
 assert.equal(result.facts.websiteKind,'social');
 assert.equal(result.facts.hasOwnWebsite,null);
 assert.equal(result.facts.phone,'5592999990000');
 assert.equal(result.facts.ratingCount,0);
 for(const key of ['authorityScore','trafegoOrganico','palavrasChave','percentSocial','roi']) assert.equal(result.facts[key],null);
 assert.equal(result.observedAt,'2026-01-01T00:00:00.000Z');
 assert.ok(result.sources.length); assert.ok(result.pending.length); assert.ok(result.hypotheses.length);
 assert.deepEqual(result.recommendedServices,['SITE_INSTITUCIONAL','AUTOMACAO_VENDAS','GESTAO_REDES_SOCIAIS']);
 const absent=analyzeLead({});
 assert.equal(absent.facts.websiteUrl,null); assert.equal(absent.facts.hasOwnWebsite,null);
 assert.deepEqual(absent.recommendedServices,[]);
 const own=analyzeLead({website:'https://synthetic.example/path?x=1'});
 assert.equal(own.facts.websiteKind,'website');
 assert.equal(own.facts.hasOwnWebsite,null); // URL alone does not prove ownership or liveness
 assert.deepEqual(own.recommendedServices,['LANDING_PAGE']);
 for(const url of ['javascript:alert(1)','https://instagram.com.evil.example','https://evil.example/?x=instagram.com']) {
   const a=analyzeLead({website:url}); assert.notEqual(a.facts.websiteKind,'social');
 }
});
