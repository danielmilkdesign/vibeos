const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');

// Run real page handlers; substitute only React scheduling and CRM persistence.
function mount(collections) {
  const slots = [];
  let cursor = 0;
  const writes = [];
  const hooks = { ...React,
    useEffect: () => {},
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
  };
  const cache = {};
  function load(file) {
    if (cache[file]) return cache[file];
    const module = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    new Function('require', 'module', 'exports', code)(id => {
      if (id === 'react') return hooks;
      if (id.endsWith('crm-client')) return { useCrmCollection: (key, fallback) => [collections[key] ?? fallback, async value => { collections[key] = value; writes.push(key); }, { loading: false, error: null }] };
      if (id.startsWith('.')) {
        const base = path.resolve(path.dirname(file), id);
        return load(fs.existsSync(base + '.ts') ? base + '.ts' : base + '.tsx');
      }
      return require(id);
    }, module, module.exports);
    return cache[file] = module.exports;
  }
  const Page = load(path.resolve(__dirname, '../app/propostas/page.tsx')).default;
  return { render: () => { cursor = 0; return Page(); }, writes };
}
function elements(tree, type) {
  const result = [];
  const walk = node => {
    if (!React.isValidElement(node)) return;
    if (node.type === type) result.push(node);
    React.Children.forEach(node.props.children, walk);
  };
  walk(tree);
  return result;
}
function button(tree, label) {
  return elements(tree, 'button').find(node => React.Children.toArray(node.props.children).filter(child => typeof child === 'string').join('').includes(label));
}
const lead = { id: 'lead-1', nomeEmpresa: 'Aurora', companyId: 'company-1', phoneWhatsapp: '+5592992027059' };

test('normal generator reuses drafts for a lead and never overwrites a commercial edit or adds history on repeat', async () => {
  const collections = { vibe_leads: [lead] };
  const page = mount(collections);
  elements(page.render(), 'select')[0].props.onChange({ target: { value: lead.id } });
  await button(page.render(), 'Gerar 5 rascunhos').props.onClick();
  assert.equal(collections.vibe_proposals.length, 5);
  assert.equal(collections.vibe_proposal_versions.length, 5);
  const edited = { ...collections.vibe_proposals[0], version: 2, scopeText: 'Escopo negociado', setupValue: 1500 };
  collections.vibe_proposals[0] = edited;
  const history = structuredClone(collections.vibe_proposal_versions);
  const writes = page.writes.length;
  await button(page.render(), 'Gerar 5 rascunhos').props.onClick();
  assert.equal(collections.vibe_proposals.length, 5, 'same lead/service must not create five more proposals');
  assert.equal(collections.vibe_proposals.find(p => p.id === edited.id), edited);
  assert.deepEqual(collections.vibe_proposal_versions, history);
  assert.equal(page.writes.length, writes, 'no-op generation must not write collections');
});

module.exports = { mount, elements, button, lead };
