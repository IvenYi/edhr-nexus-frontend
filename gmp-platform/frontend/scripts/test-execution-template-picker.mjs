import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const compiled = await build({ entryPoints: ['src/pages/production/ExecutionFormSelector.tsx'], bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external',
  plugins: [{ name: 'picker-boundaries', setup(plugin) {
    const stubs = {
      react: 'export const useState=v=>hooks.state(v), useEffect=(f,d)=>hooks.effect(f,d);',
      '@mui/material': ['Alert','Avatar','Box','Button','DialogActions','DialogContent','DialogTitle','Drawer','FormControlLabel','IconButton','List','ListItemButton','Popover','Radio','Switch','Tab','Tabs','TextField','Tooltip','Typography'].map(x => `export const ${x}="${x}";`).join(''),
      '@mui/icons-material': ['AddRounded','ArrowBackRounded','ArrowForwardRounded','CheckRounded','ChevronRightRounded','CloseRounded','DescriptionOutlined','ExpandMoreRounded','LockOutlined','MoreHorizRounded','SearchRounded'].map(x => `export const ${x}="${x}";`).join(''),
      '@/components/AppDialog': 'export default "Dialog";',
      '@/api/production-execution': 'export const getExecutionTemplates=keyword=>fetchTemplates(keyword);',
    };
    plugin.onResolve({ filter: /.*/ }, ({ path }) => path in stubs ? { path, namespace: 'stub' } : undefined);
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({ contents: stubs[path] }));
  } }] });
const template = { templateId: 't1', versionId: 'v1', name: '巡检表', code: 'CHECK', version: 'V1.0', categoryName: '检验记录' };
function fixture(success = true, options = [template]) {
  let index = 0, tree, closed = 0;
  const slots = [], effects = [], calls = [], searches = [];
  const hooks = {
    state(value) { const i = index++; if (!(i in slots)) slots[i] = value; return [slots[i], value => { slots[i] = value; }]; },
    effect(callback, deps) { const i = index++; if (!slots[i] || deps.some((v, j) => v !== slots[i][j])) { slots[i] = deps; effects.push(callback); } },
  };
  const sandbox = { module: { exports: {} }, require: createRequire(import.meta.url), hooks,
    fetchTemplates: async keyword => { searches.push(keyword); return options; }, window: { setTimeout: f => { f(); return 1; }, clearTimeout() {} } };
  sandbox.exports = sandbox.module.exports; vm.runInNewContext(compiled.outputFiles[0].text, sandbox);
  const props = { open: true, container: () => null, forms: [], works: [], copies: {}, selectedId: '', busy: false, canAttach: true, editors: null,
    onClose: () => { closed++; }, onSelect() {}, onAttach: async (...args) => { calls.push(args); return success; } };
  function render() { index = 0; tree = sandbox.module.exports.default(props); effects.splice(0).forEach(f => f()); }
  function nodes(n = tree) { return !n || typeof n !== 'object' ? [] : Array.isArray(n) ? n.flatMap(nodes) : [n, ...nodes(n.props?.children ?? null)]; }
  const find = (type, match) => nodes().find(n => n.type === type && match(n.props));
  const button = label => find('Button', p => p.children === label);
  const click = node => { node.props.onClick(); render(); };
  render(); render(); find('Tabs', () => true).props.onChange(null, 'custom'); render(); click(button('新增表单'));
  const picker = async () => { click(button('选择表单模板') ?? button('更换')); await new Promise(resolve => setImmediate(resolve)); render(); };
  const choose = () => { click(find('ListItemButton', p => p['aria-label']?.startsWith('选择表单 '))); click(button('确认选择')); };
  return { find, nodes, button, click, render, picker, choose, calls, searches, closed: () => closed };
}
test('template selection opens separately and only confirmed selections populate the drawer', async () => {
  const f = fixture(); assert.deepEqual(f.searches, []);
  await f.picker(); assert.deepEqual(f.searches, ['']);
  f.click(f.find('ListItemButton', p => p['aria-label']?.startsWith('选择表单 '))); f.click(f.button('取消'));
  assert.equal(f.find('Box', p => p.className === 'execution-selected-template'), undefined);
  await f.picker(); f.choose();
  assert.ok(f.find('Box', p => p.className === 'execution-selected-template'));
  assert.equal(f.find('Dialog', () => true).props.open, false);
});
test('categories count templates once and search stays within the chosen category', async () => {
  const f = fixture(true, [template, { ...template, versionId: 'v2', version: 'V2' }, { ...template, templateId: 't2', versionId: 'v3', name: '物料记录', code: 'MAT', categoryName: '' }]);
  await f.picker();
  const category = f.find('button', p => p.title === '检验记录');
  assert.equal(category.props.children[1].props.children, 1);
  f.click(category);
  assert.equal(f.nodes().filter(n => n.type === 'ListItemButton').length, 1);
  f.find('TextField', p => p.inputProps?.['aria-label'] === '搜索可选表单模板').props.onChange({ target: { value: ' MAT ' } }); f.render();
  assert.equal(f.nodes().filter(n => n.type === 'ListItemButton').length, 0);
  f.click(f.find('button', p => p.title === '未分类'));
  assert.equal(f.nodes().filter(n => n.type === 'ListItemButton').length, 1);
  assert.deepEqual(f.searches, ['']);
});
test('multiple versions default to the first version and preserve a manually confirmed choice', async () => {
  const f = fixture(false, [template, { ...template, versionId: 'v2', version: 'V2.0' }]);
  await f.picker();
  f.click(f.find('ListItemButton', p => p['aria-label']?.startsWith('选择表单 ')));
  assert.equal(f.button('确认选择').props.disabled, false);
  assert.equal(f.find('button', p => p['aria-label'] === '选择版本 V1.0').props['aria-pressed'], true);
  f.click(f.find('button', p => p['aria-label'] === '选择版本 V2.0'));
  assert.equal(f.button('确认选择').props.disabled, false);
  f.click(f.button('确认选择'));
  await f.picker();
  assert.equal(f.find('button', p => p['aria-label'] === '选择版本 V2.0').props['aria-pressed'], true);
  f.click(f.find('button', p => p['aria-label'] === '选择版本 V1.0'));
  f.click(f.button('取消'));
  f.find('TextField', p => p.label === '添加原因').props.onChange({ target: { value: '追加检验' } }); f.render();
  await f.find('Button', p => Array.isArray(p.children) && p.children[0] === '添加到').props.onClick();
  assert.equal(f.calls[0][0], 'v2');
});
test('switching to a different multi-version template selects and submits its first version', async () => {
  const f = fixture(true, [template, { ...template, templateId: 't2', versionId: 'v2' }, { ...template, templateId: 't2', versionId: 'v3', version: 'V3' }]);
  await f.picker();
  let entries = f.nodes().filter(n => n.type === 'ListItemButton');
  f.click(entries[0]);
  assert.equal(f.button('确认选择').props.disabled, false);
  entries = f.nodes().filter(n => n.type === 'ListItemButton');
  f.click(entries[1]);
  assert.equal(f.button('确认选择').props.disabled, false);
  assert.equal(f.find('button', p => p['aria-label'] === '选择版本 V1.0').props['aria-pressed'], true);
  f.click(f.button('确认选择'));
  f.find('TextField', p => p.label === '添加原因').props.onChange({ target: { value: '追加检验' } }); f.render();
  await f.find('Button', p => Array.isArray(p.children) && p.children[0] === '添加到').props.onClick();
  assert.equal(f.calls[0][0], 'v2');
});
test('removing a selected template disables adding without changing the reason', async () => {
  const f = fixture(); await f.picker(); f.choose();
  f.find('TextField', p => p.label === '添加原因').props.onChange({ target: { value: '复检' } }); f.render();
  f.click(f.find('IconButton', p => p['aria-label'] === '移除模板 巡检表'));
  assert.equal(f.find('Button', p => Array.isArray(p.children) && p.children[0] === '添加到').props.disabled, true);
  assert.equal(f.find('TextField', p => p.label === '添加原因').props.value, '复检');
});
test('attachment keeps the existing single-template contract and preserves selection on failure', async () => {
  const f = fixture(false); await f.picker(); f.choose();
  f.find('TextField', p => p.label === '添加原因').props.onChange({ target: { value: ' 复检 ' } }); f.render();
  await f.find('Button', p => Array.isArray(p.children) && p.children[0] === '添加到').props.onClick(); f.render();
  assert.deepEqual(f.calls, [['v1', 'OPERATION', true, '复检']]);
  assert.equal(f.closed(), 0); assert.ok(f.find('Box', p => p.className === 'execution-selected-template'));
});
