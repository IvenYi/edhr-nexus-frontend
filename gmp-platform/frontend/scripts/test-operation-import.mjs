import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '..');
const mui = ['Button', 'DialogActions', 'DialogContent', 'DialogTitle', 'Stack', 'Table', 'TableBody', 'TableCell', 'TableContainer', 'TableHead', 'TableRow', 'Typography'];
const stubs = {
  react: 'export const useRef = () => globalThis.ref; export const useState = (initial) => globalThis.state(initial);',
  '@tanstack/react-query': 'export const useQueryClient = () => globalThis.client; export const useMutation = (config) => { globalThis.mutationConfig = config; return globalThis.mutation; };',
  '@mui/material': mui.map((name) => `export const ${name} = '${name}';`).join('\n'),
  '@/components/AppDialog': 'export default "AppDialog";',
  '@/api/master-data': 'export const importOperations = file => globalThis.api.upload(file); export const downloadOperationImportTemplate = () => globalThis.api.download();',
};
const result = await build({
  absWorkingDir: root, entryPoints: ['src/pages/master-data/components/OperationImportActions.tsx'],
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  plugins: [{ name: 'test-boundaries', setup(plugin) {
    plugin.onResolve({ filter: /.*/ }, ({ path }) => path in stubs ? { path, namespace: 'stub' } : undefined);
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({ contents: stubs[path], loader: 'js' }));
  } }],
});

function harness() {
  const slots = [], notifications = [], invalidated = [], uploads = [], links = [];
  let index = 0;
  const sandbox = {
    module: { exports: {} }, require, console, Blob,
    ref: { current: { click() {} } },
    state(initial) { const slot = index++; if (!(slot in slots)) slots[slot] = initial; return [slots[slot], (value) => { slots[slot] = value; }]; },
    client: { invalidateQueries: async ({ queryKey }) => { invalidated.push(queryKey[0]); } },
    mutation: { isPending: false, mutate: (file) => uploads.push(file) },
    api: { upload: (file) => uploads.push(file), download: async () => ({ data: new Blob(['xlsx']) }) },
    URL: { createObjectURL: () => 'blob:template', revokeObjectURL() {} },
    document: { createElement: () => { const link = { click() { links.push({ href: this.href, download: this.download }); } }; return link; } },
  };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(result.outputFiles[0].text, sandbox);
  return {
    sandbox, notifications, invalidated, uploads, links,
    render() { index = 0; return sandbox.module.exports.default({ notify: (...args) => notifications.push(args) }); },
  };
}

function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
function text(tree) {
  if (tree == null || typeof tree === 'boolean') return '';
  if (Array.isArray(tree)) return tree.map(text).join('');
  return typeof tree === 'object' ? text(tree.props?.children) : String(tree);
}

test('selection validates extension, clears input, and permits choosing the same file again', () => {
  const h = harness();
  const input = nodes(h.render()).find((node) => node.type === 'input');
  const wrong = { target: { files: [{ name: 'a.csv' }], value: 'a.csv' } };
  input.props.onChange(wrong);
  assert.equal(wrong.target.value, '');
  assert.equal(h.uploads.length, 0);
  assert.match(h.notifications[0][0], /仅支持/);
  const valid = { name: '工序.XLSX' };
  for (let i = 0; i < 2; i++) {
    const event = { target: { files: [valid], value: valid.name } };
    input.props.onChange(event);
    assert.equal(event.target.value, '');
  }
  assert.equal(h.uploads.length, 2);
  h.sandbox.mutation.isPending = true;
  assert.equal(nodes(h.render()).find((node) => node.type === 'Button' && text(node) === '导入中...').props.disabled, true);
});

test('successful mixed result refreshes data and renders row reasons in worksheet order', async () => {
  const h = harness();
  h.render();
  await h.sandbox.mutationConfig.onSuccess({ data: { data: {
    successCount: 1, skippedCount: 1, failedCount: 1,
    skippedRows: [{ rowNumber: 4, code: 'DUP', name: '重复', reason: '编码重复' }],
    failedRows: [{ rowNumber: 3, code: 'BAD', name: '', reason: '名称不能为空' }],
  } } });
  assert.deepEqual(h.invalidated.sort(), ['process-modeling-operation-audit', 'process-modeling-operation-categories', 'process-modeling-operations'].sort());
  const tree = h.render();
  assert.equal(nodes(tree).find((node) => node.type === 'AppDialog').props.open, true);
  const rendered = text(tree);
  assert.match(rendered, /成功导入 1 条，跳过 1 条，失败 1 条/);
  assert.ok(rendered.indexOf('名称不能为空') < rendered.indexOf('编码重复'));
  nodes(tree).find((node) => node.type === 'Button' && text(node) === '关闭').props.onClick();
  assert.equal(nodes(h.render()).find((node) => node.type === 'AppDialog').props.open, false);
});

test('download uses xlsx filename and surfaces blob API errors', async () => {
  const h = harness();
  nodes(h.render()).find((node) => node.type === 'Button' && text(node) === '下载模板').props.onClick();
  await new Promise(setImmediate);
  assert.equal(h.links[0].download, '工序导入模板.xlsx');
  h.sandbox.api.download = async () => { throw { response: { data: new Blob(['{"message":"登录已过期"}']) } }; };
  nodes(h.render()).find((node) => node.type === 'Button' && text(node) === '下载模板').props.onClick();
  await new Promise(setImmediate);
  assert.equal(h.notifications.at(-1)[0], '登录已过期');
  await h.sandbox.mutationConfig.onError({ response: { data: { message: '模板表头不正确' } } });
  assert.equal(h.notifications.at(-1)[0], '模板表头不正确');
});
