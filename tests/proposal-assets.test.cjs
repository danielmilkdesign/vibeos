const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { load } = require('./security-loader.cjs');

function component(mocks = {}) {
  const filename = path.resolve(__dirname, '../components/CRM/ProposalAssets.tsx');
  assert.ok(fs.existsSync(filename), 'proposal preview component must exist');
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  const req = id => mocks[id] ?? (id.startsWith('../../lib/') ? load(id.replace('../../', '') + '.ts') : require(id));
  new Function('require', 'module', 'exports', code)(req, module, module.exports);
  return module.exports.default;
}

const proposal = { id: 'p1', clientName: 'Aurora', serviceType: 'GESTAO_REDES_SOCIAIS', offerTitle: 'Direção editorial', scopeText: 'Conteúdo a validar.' };

test('component previews all draft concepts but gates each PNG download by canExport', () => {
  const ProposalAssets = component();
  for (const canExport of [false, true]) {
    const html = renderToStaticMarkup(React.createElement(ProposalAssets, { proposal, canExport }));
    const expected = load('lib/proposal-visuals.ts').generateProposalVisuals(proposal);
    const sources = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1].replace(/&amp;/g, '&').replace(/&#x27;/g, "'"));
    assert.equal(sources.length, 3);
    for (const [index, source] of sources.entries()) {
      assert.ok(source.startsWith('data:image/svg+xml;charset=utf-8,'));
      assert.equal(decodeURIComponent(source.split(',')[1]), expected[index].svg);
    }
    const buttons = [...html.matchAll(/<button([^>]*)>(.*?)<\/button>/g)].filter(match => match[2].includes('Baixar PNG'));
    assert.equal(buttons.length, 3);
    for (const [, attrs] of buttons) assert.equal(/\sdisabled(?:=|\s|$)/.test(attrs), !canExport);
    assert.match(html, /Conceito ilustrativo/);
    assert.match(html, /não verificada/);
    assert.doesNotMatch(html, /wa\.me|whatsapp\.com|enviada com sucesso/i);
  }
  const unsupported = renderToStaticMarkup(React.createElement(ProposalAssets, { proposal: { ...proposal, serviceType: undefined }, canExport: true }));
  assert.match(unsupported, /Sem conceito visual/);
  assert.doesNotMatch(unsupported, /<img|Baixar PNG/);
});

function mount(overrides = {}) {
  const slots = [];
  let cursor = 0;
  const cleanups = [];
  const hooks = {
    ...React,
    useMemo: fn => fn(),
    useEffect: fn => { const cleanup = fn(); if (cleanup) cleanups.push(cleanup); },
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
  };
  const Component = component({ react: hooks, ...overrides });
  const render = props => { cursor = 0; return Component(props); };
  render.unmount = () => cleanups.forEach(fn => fn());
  return render;
}

function elements(tree, type) {
  const result = [];
  function walk(node) {
    if (!React.isValidElement(node)) return;
    if (node.type === type) result.push(node);
    React.Children.forEach(node.props.children, walk);
  }
  walk(tree);
  return result;
}

test('download button creates the selected PNG and reports only download initiation', async t => {
  const { seen } = browser(t);
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const render = mount();
  const props = { proposal, canExport: true };
  const buttons = elements(render(props), 'button');
  assert.equal(typeof buttons[1].props.onClick, 'function', 'download button must be wired');
  await buttons[1].props.onClick();
  assert.equal(seen.clicks.length, 1);
  assert.equal(seen.clicks[0].download, 'proposta-p1-redes-post-2.png');
  const html = renderToStaticMarkup(render(props));
  assert.match(html, /Download do PNG iniciado/);
  assert.doesNotMatch(html, /enviada|WhatsApp/);
  t.mock.timers.tick(1000);
  assert.equal(seen.revoked.length, 2);
});

test('download handler cannot bypass canExport even if invoked directly', async t => {
  const { seen } = browser(t);
  const render = mount();
  const button = elements(render({ proposal, canExport: false }), 'button')[0];
  assert.equal(typeof button.props.onClick, 'function');
  await button.props.onClick();
  assert.equal(seen.created.length, 0);
});

for (const update of [{ canExport: false }, { proposal: { ...proposal, scopeText: 'Novo escopo' } }, { proposal: { ...proposal, id: 'p2' } }]) {
  test(`does not download a stale concept after proposal/permission changes: ${JSON.stringify(update)}`, async () => {
    let finish;
    let downloads = 0;
    const render = mount({ '../../lib/proposal-assets': {
      proposalVisualToPng: () => new Promise(resolve => { finish = resolve; }),
      downloadProposalPng: () => downloads++,
    } });
    const props = { proposal, canExport: true };
    const pending = elements(render(props), 'button')[0].props.onClick();
    const changed = { ...props, ...update };
    render(changed);
    finish(new Blob(['png'], { type: 'image/png' }));
    await pending;
    assert.equal(downloads, 0);
    assert.doesNotMatch(renderToStaticMarkup(render(changed)), /Download do PNG iniciado/);
  });
}

test('unmounting prevents an in-flight conversion from initiating a download', async () => {
  let finish;
  let downloads = 0;
  const render = mount({ '../../lib/proposal-assets': {
    proposalVisualToPng: () => new Promise(resolve => { finish = resolve; }),
    downloadProposalPng: () => downloads++,
  } });
  const pending = elements(render({ proposal, canExport: true }), 'button')[0].props.onClick();
  render.unmount();
  finish(new Blob(['png'], { type: 'image/png' }));
  await pending;
  assert.equal(downloads, 0);
});

test('download errors are visible and controls recover for a retry', async () => {
  const render = mount({ '../../lib/proposal-assets': {
    proposalVisualToPng: async () => { throw new Error('Não foi possível gerar o PNG.'); },
    downloadProposalPng: () => assert.fail('must not download on conversion failure'),
  } });
  const props = { proposal, canExport: true };
  const button = elements(render(props), 'button')[0];
  assert.equal(typeof button.props.onClick, 'function');
  await button.props.onClick();
  const tree = render(props);
  assert.match(renderToStaticMarkup(tree), /role="alert"[^>]*>Não foi possível gerar o PNG\./);
  assert.ok(elements(tree, 'button').every(node => !node.props.disabled));
});

function assets() {
  assert.ok(fs.existsSync(path.resolve(__dirname, '../lib/proposal-assets.ts')), 'PNG export helper must exist');
  return load('lib/proposal-assets.ts');
}

const visual = load('lib/proposal-visuals.ts').generateProposalVisuals({
  clientName: 'Ateliê Aurora', serviceType: 'SITE_INSTITUCIONAL',
})[0];

// Native image/canvas APIs are not available in Node: fake only that browser boundary.
function browser(t, mode = 'ok') {
  const seen = { created: [], revoked: [], draws: [], clicks: [], removed: 0 };
  const png = new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], { type: 'image/png' });
  const canvas = {
    width: 0, height: 0,
    getContext() { return mode === 'context-null' ? null : { drawImage: (...args) => { if (mode === 'draw-error') throw new Error('canvas failure'); seen.draws.push(args); } }; },
    toBlob(callback, type) { seen.mime = type; if (mode === 'blob-error') throw new Error('encoding failure'); callback(mode === 'blob-null' ? null : png); },
  };
  class Image {
    set src(value) { seen.src = value; queueMicrotask(() => mode === 'image-error' ? this.onerror?.() : this.onload?.()); }
  }
  const document = {
    createElement(tag) {
      if (tag === 'canvas') return canvas;
      assert.equal(tag, 'a');
      return { click() { seen.clicks.push({ href: this.href, download: this.download }); if (mode === 'click-error') throw new Error('download failure'); }, remove() { seen.removed++; } };
    },
    body: { appendChild() {} },
  };
  for (const [name, value] of Object.entries({ Image, document })) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => descriptor ? Object.defineProperty(globalThis, name, descriptor) : delete globalThis[name]);
  }
  t.mock.method(URL, 'createObjectURL', blob => { const url = `blob:test-${seen.created.length}`; seen.created.push({ url, blob }); return url; });
  t.mock.method(URL, 'revokeObjectURL', url => seen.revoked.push(url));
  return { seen, canvas, png };
}

for (const [mode, message] of [['image-error', /carregar/i], ['context-null', /canvas/i], ['blob-null', /PNG/i], ['draw-error', /canvas failure/], ['blob-error', /encoding failure/]]) {
  test(`rejects ${mode} with feedback and always revokes the SVG URL`, async t => {
    const { seen } = browser(t, mode);
    const result = await Promise.race([
      assets().proposalVisualToPng(visual, true).then(value => ({ value }), error => ({ error })),
      new Promise(resolve => setTimeout(() => resolve({ pending: true }), 200)),
    ]);
    assert.ok(result.error instanceof Error, `must reject instead of succeeding or hanging: ${mode}`);
    assert.match(result.error.message, message);
    assert.deepEqual(seen.revoked, seen.created.map(entry => entry.url));
  });
}

test('PNG creation requires explicit permission before touching browser APIs', async t => {
  const { seen } = browser(t);
  for (const permission of [false, undefined, 'true']) {
    await assert.rejects(assets().proposalVisualToPng(visual, permission), /aprova|export/i);
  }
  assert.equal(seen.created.length, 0);
});

test('downloads only an approved PNG with a safe bounded filename and releases its URL', t => {
  const { seen, png } = browser(t);
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { downloadProposalPng } = assets();
  assert.equal(typeof downloadProposalPng, 'function', 'download helper must exist');
  assert.throws(() => downloadProposalPng(png, 'p1', 'site', false), /export/i);
  assert.equal(seen.created.length, 0);
  downloadProposalPng(png, '../../Própósta\\:<>\u0000/' + 'x'.repeat(160), 'site/../"', true);
  assert.equal(seen.clicks.length, 1);
  assert.match(seen.clicks[0].download, /^proposta-[a-zA-Z0-9-]+-[a-zA-Z0-9-]+\.png$/);
  assert.ok(seen.clicks[0].download.length <= 110);
  assert.equal(seen.removed, 1);
  t.mock.timers.tick(1000);
  assert.deepEqual(seen.revoked, seen.created.map(entry => entry.url));
});

test('converts a generated SVG Blob to PNG at the declared size and releases its URL', async t => {
  const { seen, canvas, png } = browser(t);
  const { proposalVisualToPng } = assets();
  const result = await proposalVisualToPng(visual, true);
  assert.equal(result, png);
  assert.equal(result.type, 'image/png');
  assert.equal(canvas.width, visual.width);
  assert.equal(canvas.height, visual.height);
  assert.equal(seen.created[0].blob.type, 'image/svg+xml;charset=utf-8');
  assert.equal(await seen.created[0].blob.text(), visual.svg);
  assert.deepEqual(seen.draws[0].slice(1), [0, 0, visual.width, visual.height]);
  assert.equal(seen.mime, 'image/png');
  assert.deepEqual(seen.revoked, [seen.created[0].url]);
});
