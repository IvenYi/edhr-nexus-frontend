import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { test } from 'node:test';
import { build } from 'esbuild';

// Exercise the real dialog's response handling and save eligibility without a database.
const compiled = await build({
  entryPoints: [fileURLToPath(new URL('../src/components/ProductionObjectEditDialog.tsx', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  plugins: [{ name: 'edit-boundaries', setup(plugin) {
    const stubs = {
      react: 'export const useState = value => hooks.state(value);',
      '@tanstack/react-query': 'export const useQuery = args => hooks.query(args), useMutation = args => hooks.mutation(args), useQueryClient = () => ({ invalidateQueries: async () => {} });',
      '@mui/material': ['Alert', 'Button', 'DialogActions', 'DialogContent', 'DialogTitle', 'MenuItem', 'Stack', 'TextField', 'Typography'].map(name => `export const ${name}="${name}";`).join(''),
      './FormDialog': 'export default "FormDialog";',
      './FormDialogSection': 'export default "FormDialogSection";',
      './FormDialogFieldGrid': 'export default "FormDialogFieldGrid";',
      '@/api/work-orders': 'export const getWorkOrder=()=>{}, listProcessOptions=()=>{}, updateProductionObject=(...args)=>hooks.writes.push(args);',
    };
    plugin.onResolve({ filter: /.*/ }, ({ path }) => path in stubs ? { path, namespace: 'stub' } : undefined);
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({ contents: stubs[path] }));
  } }],
});

function fixture({ order = { plannedQuantity: 20, allocatedQuantity: 15 }, options = [{ id: 'v1', version: 'V1', processReference: { ownerName: '精密导管', ownerType: 'PRODUCT' } }], orderState = {}, optionsState = {}, objectType = 'BATCH' } = {}) {
  let state, tree;
  const hooks = {
    writes: [],
    state(value) { state ??= value; return [state, next => { state = next; }]; },
    query({ queryKey }) { return { isSuccess: true, isFetching: false, isError: false, refetch() {}, ...(queryKey[0] === 'work-order' ? { data: order, ...orderState } : { data: options, ...optionsState }) }; },
    mutation(args) { return { isPending: false, mutate: () => args.mutationFn() }; },
  };
  const sandbox = { module: { exports: {} }, require: createRequire(import.meta.url), hooks };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(compiled.outputFiles[0].text, sandbox);
  const flatten = node => !node || typeof node !== 'object' ? [] : Array.isArray(node) ? node.flatMap(flatten) : [node, ...flatten(node.props?.children)];
  const render = () => { tree = sandbox.module.exports.default({ object: { id: 'batch1', objectNo: 'B-001', objectType, processVersionId: 'v1', processVersion: 'V1', targetQuantity: objectType === 'SN' ? 1 : 4, workOrderId: 'order1' }, onClose() {} }); };
  render();
  return { hooks, render, nodes: () => flatten(tree),
    save: () => flatten(tree).find(node => node.type === 'Button' && node.props.variant === 'contained'),
    quantity: () => flatten(tree).find(node => node.type === 'TextField' && node.props.label === '目标数量'),
  };
}

test('missing allocation never renders NaN or enables a save', () => {
  const f = fixture({ order: { plannedQuantity: 20 } });
  assert.equal(f.save().props.disabled, true);
  assert.equal(f.quantity().props.helperText, '可分配数量暂不可用');
  assert.equal(JSON.stringify(f.nodes()).includes('NaN'), false);
});

test('quantity growth is bounded by remaining allocation plus this batch', () => {
  const f = fixture();
  assert.match(f.quantity().props.helperText, /最多可调整为 9/);
  f.quantity().props.onChange({ target: { value: '9.0001' } }); f.render();
  assert.equal(f.save().props.disabled, true);
  f.quantity().props.onChange({ target: { value: '0.5' } }); f.render();
  assert.equal(f.save().props.disabled, false);
  f.save().props.onClick();
  assert.equal(f.hooks.writes[0][1].targetQuantity, 0.5);
});

test('pending or failed refresh does not submit using stale quantities', () => {
  for (const orderState of [{ isFetching: true }, { isSuccess: false, isError: true }]) {
    assert.equal(fixture({ orderState }).save().props.disabled, true);
  }
  assert.equal(fixture({ optionsState: { isSuccess: false, isError: true } }).save().props.disabled, true);
});

test('missing process identity is explicit and blocks save', () => {
  const f = fixture({ options: [{ id: 'v1', version: 'V1' }] });
  assert.equal(f.save().props.disabled, true);
  assert(f.nodes().some(node => node.type === 'Alert' && node.props.severity === 'error'));
});

test('process choice shows version and owner; an existing reference remains selectable', () => {
  const f = fixture();
  assert(f.nodes().some(node => node.type === 'MenuItem' && node.props.children[0] === 'V1 · 精密导管'));
  const old = fixture({ options: [] });
  assert(old.nodes().some(node => node.type === 'MenuItem' && node.props.value === 'v1'));
  assert.equal(old.save().props.disabled, false);
});

test('SN quantity stays fixed and invalid batch numbers are rejected', () => {
  assert.equal(fixture({ objectType: 'SN' }).quantity().props.disabled, true);
  for (const value of ['', '0', '-1', 'not-a-number']) {
    const f = fixture(); f.quantity().props.onChange({ target: { value } }); f.render();
    assert.equal(f.save().props.disabled, true);
  }
});
