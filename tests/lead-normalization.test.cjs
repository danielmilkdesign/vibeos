const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file, mocks = {}) {
 const filename = path.resolve(__dirname, '..', file);
 const module = { exports: {} };
 const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const req = id => mocks[id] ?? (id.startsWith('.') || id.startsWith('@/') ? load(path.relative(path.resolve(__dirname,'..'), id.startsWith('@/') ? path.resolve(__dirname,'..',id.slice(2)) : path.resolve(path.dirname(filename),id)) + '.ts',mocks) : require(id));
 new Function('require','module','exports',code)(req,module,module.exports);
 return module.exports;
}
module.exports = {load};
if (require.main === module) {
test('normalizes Unicode aliases, enum niche and rejects missing names', () => {
 const {normalizeLead, normalizeNicho} = load('lib/lead-normalization.ts');
 const lead = normalizeLead({'Nome da Empresa':' Empresa Sintética ', 'Telefone / WhatsApp':'+55 (92) 99999-0000', 'Qtde Avaliações':'1.234', 'Avaliação':'4,8', 'Categoria':'Clínica odontológica', 'Endereço':'Rua Teste'});
 assert.equal(lead.nomeEmpresa,'Empresa Sintética');
 assert.equal(lead.phone_digits,'5592999990000');
 assert.equal(lead.nicho,'ODONTOLOGIA');
 assert.equal(lead.rating,4.8);
 assert.equal(lead.rating_count,1234);
 assert.equal(lead.endereco,'Rua Teste');
 assert.equal(normalizeLead({'Company Name':'English Synthetic'}).nome,'English Synthetic');
 assert.equal(normalizeLead({'categoria':null,'nicho':'ESTETICA',nome:'Synthetic'}).nicho,'ESTETICA');
 assert.equal(normalizeLead({'Telefone':'92999990000'}),null);
 assert.equal(normalizeLead({'nome':'  '}),null);
 assert.equal(normalizeLead(null),null);
 for (const [value,expected] of [['ESTETICA','ESTETICA'],['personal trainer','PERSONAL_TRAINER'],['Clínica médica','MEDICINA'],['Advocacia','ADVOCACIA'],['Unknown','OUTROS']]) assert.equal(normalizeNicho(value),expected);
 assert.equal(normalizeLead({nome:'Teste', rating:'99',ratingCount:-2}).rating,null);
 assert.equal(normalizeLead({nome:'Teste', rating:'99',ratingCount:-2}).rating_count,null);
});
test('normalizePhone preserves country code and adds Brazil only to national input', () => {
 const {normalizePhone} = load('lib/lead-normalization.ts');
 for (const [input, expected] of [['+55 (92) 99999-0000','5592999990000'], ['(92) 99999-0000','5592999990000'], ['55 11 3333-4444','551133334444'], ['(55) 3333-4444','555533334444'], ['+1 202-555-0123','12025550123'], ['0055 92 99999-0000','5592999990000'], ['',null], ['123',null], ['call me 92999990000',null], [null,null]]) assert.equal(normalizePhone(input),expected,String(input));
});
}
