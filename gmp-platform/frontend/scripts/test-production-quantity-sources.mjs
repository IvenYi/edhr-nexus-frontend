import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import vm from 'node:vm';

const module = { exports: {} };
const source = readFileSync(new URL('../src/components/productionQuantitySources.ts', import.meta.url), 'utf8');
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { module, exports: module.exports });
const { quantitySourceRows, quantitySourceStatus, quantityText } = module.exports;
const entry = (copyId, quantity, rest = {}) => ({ copyId, instanceId: copyId, bindingId: 'p', tableId: '', rowKey: 'form', fieldId: 'q', quantity, unit: '件', included: true, ...rest });
const summary = (quantity, sources) => ({ quantity, unit: '件', status: 'READY', sources });

test('30 effective + 20 saved only: two sources, unchanged independent totals', () => {
  const effective = summary('30', [entry('f1', '30', { instanceId: '24', projectionStatus: 'SUCCEEDED' })]);
  const saved = summary('50', [entry('f1', '30'), entry('f2', '20')]);
  const rows = quantitySourceRows(effective, saved);
  assert.equal(rows.length, 2);
  assert.equal(quantitySourceStatus(rows[0]), '已生效');
  assert.equal(quantitySourceStatus(rows[1]), '未生效');
  assert.equal(quantityText(effective), '30 件');
  assert.equal(quantityText(saved), '50 件');
});
test('same labels and amounts never merge different copies, rows, or bindings', () => {
  const effective = summary('30', [entry('f1', '30')]);
  const saved = summary('90', [entry('f2', '30'), entry('f1', '30', { rowKey: 'row-2' }), entry('f1', '30', { bindingId: 'other' })]);
  assert.equal(quantitySourceRows(effective, saved).length, 4);
  assert.equal(quantitySourceRows(summary(null, [entry('', '30')]), summary(null, [entry('', '30')])).length, 2);
});
test('completed form is not sufficient for effective status; unit review remains visible', () => {
  for (const [projectionStatus, expected] of [['FAILED', '处理失败'], ['PENDING', '待处理'], ['SUCCEEDED', '待核对']]) {
    const rows = quantitySourceRows(summary(null, [entry('f1', '2', { formStatus: 'COMPLETED', projectionStatus, included: false, unit: '' })]), summary(null, [entry('f1', '2', { unit: '', included: false })]));
    assert.equal(rows.length, 1);
    assert.equal(quantitySourceStatus(rows[0]), expected);
    assert.equal(rows[0].saved.quantity, '2');
  }
});
test('zero, absent, and heterogeneous units remain distinct; discrepant values retained', () => {
  assert.equal(quantityText(summary('0', [])), '0 件');
  assert.equal(quantityText(summary(null, [])), '—');
  assert.equal(quantityText({ quantity: null, groups: [{ quantity: '2', unit: '件' }, { quantity: '3', unit: 'kg' }] }), '2 组（分物料/单位）');
  const rows = quantitySourceRows(summary('30', [entry('f1', '30')]), summary('31', [entry('f1', '31')]));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].saved.quantity, '31');
  assert.equal(rows[0].effective.quantity, '30');
});
