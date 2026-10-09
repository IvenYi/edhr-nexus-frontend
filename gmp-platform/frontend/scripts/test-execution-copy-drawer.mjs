import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';

const compiled = await build({
  entryPoints: [fileURLToPath(new URL('../src/pages/production/ExecutionCopyDrawer.tsx', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  plugins: [{ name: 'drawer-boundaries', setup(plugin) {
    const stubs = {
      react: 'export const useState=v=>hooks.state(v), useRef=v=>hooks.ref(v), useEffect=(f,d)=>hooks.effect(f,d);',
      '@mui/material': 'export const Box="Box", Button="Button", ButtonBase="ButtonBase", Drawer="Drawer", IconButton="IconButton", Popover="Popover", TextField="TextField", Tooltip="Tooltip", Typography="Typography";',
      '@mui/icons-material': 'export const AddRounded="Add", CheckCircleRounded="Check", CloseRounded="Close", ContentCopyOutlined="Copy", DescriptionOutlined="Document", EditOutlined="Edit";',
    };
    plugin.onResolve({ filter: /.*/ }, ({ path }) => path in stubs ? { path, namespace: 'stub' } : undefined);
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({ contents: stubs[path], loader: 'js' }));
  } }],
});

function fixture(overrides = {}) {
  let index = 0, tree;
  const slots = [], effects = [], added = [], selected = [], copied = [], messages = [], edited = [];
  const hooks = {
    state(value) { const i = index++; if (!(i in slots)) slots[i] = value; return [slots[i], value => { slots[i] = value; }]; },
    ref(value) { return slots[index++] ??= { current: value }; },
    effect(callback, deps) { const i = index++; if (!slots[i] || deps.some((v, j) => v !== slots[i][j])) { slots[i] = deps; effects.push(callback); } },
  };
  const sandbox = { module: { exports: {} }, require: createRequire(import.meta.url), hooks, requestAnimationFrame: callback => { callback(); return 1; }, cancelAnimationFrame() {},
    navigator: { clipboard: { writeText: async value => copied.push(value) } } };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(compiled.outputFiles[0].text, sandbox);
  const props = { open: true, container: () => null, formName: '成品检验报告', instanceIds: ['first', 'second'],
    forms: { first: { status: 'COMPLETED', values: {}, instanceNo: 'FR-001', remark: '首检', createdByName: '操作员', createdAt: '2026-09-21T10:00:00' }, second: { status: 'ACTIVE', values: {} } },
    selectedId: 'second', busy: false, canAdd: true, canEditRemark: true, onEditRemark: async (id, remark) => { edited.push({ id, remark }); return true; }, onClose() {}, beforeAdd: open => open(), onSelect: id => selected.push(id),
    onAdd: async remark => { added.push(remark); return true; }, onCopyResult: value => messages.push(value), ...overrides };
  function render() { index = 0; tree = sandbox.module.exports.default(props); effects.splice(0).forEach(callback => callback()); }
  function nodes(node = tree) { if (!node || typeof node !== 'object') return []; if (Array.isArray(node)) return node.flatMap(child => nodes(child)); return [node, ...nodes(node.props?.children ?? null)]; }
  function find(type, predicate = () => true) { return nodes().find(node => node.type === type && predicate(node.props)); }
  const button = label => find('Button', props => props.children === label);
  function start() { button('新增一份').props.onClick(); render(); }
  function input(value) { find('TextField').props.onChange({ target: { value } }); render(); }
  async function submit() { find('Box', props => props.component === 'form').props.onSubmit({ preventDefault() {} }); await new Promise(resolve => setImmediate(resolve)); render(); }
  render();
  function edit(sequence) { find('IconButton', p => p['aria-label'] === `修改第 ${sequence} 份备注`).props.onClick({ currentTarget: {} }); render(); }
  return { props, render, find, nodes, button, start, edit, edited, input, submit, added, selected, copied, messages };
}

test('completed and active copies can edit without selecting a copy', async () => {
  for (const [sequence, id] of [[1, 'first'], [2, 'second']]) {
    const f = fixture(); f.edit(sequence); f.input('  复检备注  '); await f.submit();
    assert.deepEqual(f.edited, [{ id, remark: '复检备注' }]); assert.deepEqual(f.selected, []);
    assert.equal(f.find('Popover').props.open, false);
  }
});
test('remark cancellation, validation and failed save retain existing data', async () => {
  const f = fixture({ onEditRemark: async () => false }); f.edit(1); assert.equal(f.find('TextField').props.value, '首检');
  f.input(' '); await f.submit(); assert.equal(f.find('TextField').props.error, true);
  f.input('保存失败仍保留'); await f.submit(); assert.equal(f.find('TextField').props.value, '保存失败仍保留');
  f.button('取消').props.onClick(); f.render(); f.edit(1); assert.equal(f.find('TextField').props.value, '首检');
  assert.deepEqual(f.selected, []);
});
test('remark controls enforce capability and disable pending requests', () => {
  assert.equal(fixture({ canEditRemark: false }).find('IconButton', p => p['aria-label']?.startsWith('修改')), undefined);
  assert.equal(fixture({ busy: true }).find('IconButton', p => p['aria-label'] === '修改第 1 份备注').props.disabled, true);
  const f = fixture();
  for (const node of f.nodes().filter(n => n.type === 'ButtonBase')) assert.equal(node.props.children, undefined);
});

test('opening and cancelling add does not create a copy', () => {
  const f = fixture(); f.start(); f.input('取消的备注'); f.button('取消').props.onClick(); f.render();
  assert.deepEqual(f.added, []); assert.ok(f.button('新增一份'));
  f.start(); assert.equal(f.find('TextField').props.value, '');
});
test('blank remarks are rejected; valid remarks are trimmed and submitted', async () => {
  const f = fixture(); f.start(); f.input(' \n '); await f.submit();
  assert.deepEqual(f.added, []); assert.equal(f.find('TextField').props.error, true);
  f.input('  第三次抽检  '); await f.submit(); assert.deepEqual(f.added, ['第三次抽检']); assert.ok(f.button('新增一份'));
});
test('failed creation retains remark and permits retry', async () => {
  let succeeds = false;
  const f = fixture({ onAdd: async () => succeeds }); f.start(); f.input('保留备注'); await f.submit();
  assert.equal(f.find('TextField').props.value, '保留备注'); succeeds = true; await f.submit(); assert.ok(f.button('新增一份'));
});
test('double submission only creates once while the request is pending', async () => {
  let resolve, requests = 0;
  const f = fixture({ onAdd: () => { requests++; return new Promise(done => { resolve = done; }); } }); f.start(); f.input('追加检验');
  await f.submit(); await f.submit(); assert.equal(requests, 1); resolve(true); await new Promise(done => setImmediate(done));
});
test('copying an instance number does not select another copy', async () => {
  const f = fixture(); await f.find('IconButton', p => p['aria-label'] === '复制第 1 份表单实例号').props.onClick();
  assert.deepEqual(f.copied, ['FR-001']); assert.deepEqual(f.selected, []); assert.deepEqual(f.messages, [true]);
  assert.equal(f.find('IconButton', p => p['aria-label'] === '复制第 2 份表单实例号').props.disabled, true);
  const current = f.find('ButtonBase', p => p['aria-current'] === 'true'); assert.match(current.props['aria-label'], /第 2 份/);
});
test('busy or unauthorized state blocks add, and dirty guard controls opening', () => {
  for (const props of [{ busy: true }, { canAdd: false }]) assert.equal(fixture(props).button('新增一份').props.disabled, true);
  const f = fixture({ beforeAdd: () => {} }); f.start(); assert.equal(f.find('TextField'), undefined);
});
