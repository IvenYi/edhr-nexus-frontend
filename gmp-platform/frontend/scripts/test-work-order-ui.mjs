import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const result = await build({
  absWorkingDir: resolve(import.meta.dirname, '..'),
  entryPoints: ['src/pages/production/WorkOrderPage.tsx'],
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  plugins: [{ name: 'test-boundaries', setup(plugin) {
    plugin.onResolve({ filter: /(?:^@\/api\/client$|^\.\/client$)/ }, () => ({ path: 'client', namespace: 'stub' }));
    plugin.onResolve({ filter: /^@\/components\/SnackbarProvider$/ }, () => ({ path: 'snackbar', namespace: 'stub' }));
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({
      contents: path === 'client' ? 'export default {};' : 'export const useSnackbar = () => ({ showMessage: globalThis.showMessage });', loader: 'js',
    }));
  } }],
});

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  return node?.props ? [node, ...elements(node.props.children)] : [];
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join('');
  return typeof node === 'string' ? node : node?.props ? text(node.props.children) : '';
}
function page(versions = [], isError = false) {
  const updates = [];
  const opened = [];
  const messages = [];
  const mutations = [];
  let refreshes = 0;
  const form = { orderNo: 'unsaved-order', productId: 'product-1', processVersionId: '', remark: '保留草稿' };
  const react = { ...require('react'), useMemo: (fn) => fn(), useState: (initial) => {
    const value = typeof initial === 'function' ? initial() : initial;
    return [value && typeof value === 'object' && 'orderNo' in value ? { ...value, ...form } : value, (next) => updates.push(next)];
  } };
  const query = { useMutation: (options) => { mutations.push(options); return {}; }, useQueryClient: () => ({}), useQuery: ({ queryKey }) => {
    if (queryKey[0] === 'work-order-process') return { data: { model: { versions } }, isError, refetch: () => { refreshes++; } };
    return {};
  } };
  const sandbox = { module: { exports: {} }, console, Error, showMessage: (...args) => messages.push(args), window: { open: (...args) => opened.push(args) },
    require: (name) => name === 'react' ? react : name === '@tanstack/react-query' ? query : require(name) };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(result.outputFiles[0].text, sandbox);
  const tree = sandbox.module.exports.default();
  const field = elements(tree).find((node) => node.props.label === '制程版本' && node.props.select);
  const options = elements(field.props.children);
  return { field, options, updates, opened, form, messages, mutations, refreshes: () => refreshes };
}

test('save failure displays the API client error reason and preserves the draft', () => {
  const state = page();
  state.mutations[0].onError(new Error('工单编号已存在'));
  assert.deepEqual(state.messages, [['工单编号已存在', 'error']]);
  assert.equal(state.updates.length, 0);
});

test('save failure without an error reason uses the fallback message', () => {
  const state = page();
  state.mutations[0].onError(new Error(''));
  assert.deepEqual(state.messages, [['工单保存失败', 'error']]);
});

test('no active versions shows a disabled empty state and a quick-add action', () => {
  const { options } = page([{ id: 'inactive', status: 'INACTIVE' }]);
  assert.ok(options.some((option) => option.props.disabled && text(option) === '暂无数据'));
  assert.ok(options.some((option) => !option.props.disabled && text(option) === '快速添加'));
  assert.ok(!options.some((option) => option.props.value === 'inactive'));
});

test('loading errors are distinguished from an empty version list', () => {
  const { options } = page([], true);
  assert.ok(options.some((option) => text(option) === '制程版本加载失败'));
  assert.ok(!options.some((option) => text(option) === '暂无数据'));
});

test('quick-add opens the selected product editor without changing the work-order draft', () => {
  const state = page();
  const action = state.options.find((option) => text(option) === '快速添加');
  state.field.props.onChange({ target: { value: action.props.value } });
  assert.deepEqual(state.opened, [['/master-data/products/product-1/modeling?intent=create', '_blank', 'noopener,noreferrer']]);
  assert.equal(state.updates.length, 0);
  state.field.props.SelectProps.onOpen();
  assert.equal(state.refreshes(), 1);
});

test('active version selection keeps the rest of the unsaved form', () => {
  const state = page([{ id: 'active', status: 'ACTIVE' }]);
  assert.ok(state.options.some((option) => option.props.value === 'active'));
  assert.ok(!state.options.some((option) => text(option) === '暂无数据'));
  state.field.props.onChange({ target: { value: 'active' } });
  assert.equal(state.updates[0].processVersionId, 'active');
  assert.equal(state.updates[0].orderNo, state.form.orderNo);
  assert.equal(state.updates[0].remark, state.form.remark);
});
