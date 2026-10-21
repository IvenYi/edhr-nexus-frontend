import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { resolve } from 'node:path';

const result = await build({ absWorkingDir: resolve(import.meta.dirname, '..'), entryPoints: ['src/components/form-renderer/referenceValidation.ts'], bundle: true, write: false, platform: 'node', format: 'cjs' });
const sandbox = { module: { exports: {} }, require: createRequire(import.meta.url) };
vm.runInNewContext(result.outputFiles[0].text, sandbox);
const { referenceConditionIssue: issue, referenceConfigurationIssues: issues } = sandbox.module.exports;
const field = (id, type = 'text', config = {}) => ({ id, name: id, type, status: 'enabled', typeConfig: config });
const row = { sourceField: 'workOrderNo', operator: 'eq', targetFieldId: 'order' };
const config = { sourceType: 'productionObject', referenceProductionScope: 'all', referenceQueryConditions: [row] };
const doc = (fields, nodes = []) => ({ model: { fields }, canvas: { pages: [{ id: 'p', nodes }] } });

test('switching a source preserves a meaningful rule but rejects incompatible attributes until repair', () => {
  const original = structuredClone(config);
  assert.equal(issue(config, 'ref', [field('order')], row), '');
  assert.match(issue({ ...config, sourceType: 'equipment' }, 'ref', [field('order')], row), /不适用/);
  assert.deepEqual(config, original);
  assert.equal(issue({ sourceType: 'equipment' }, 'ref', [field('order')], { ...row, sourceField: 'code' }), '');
  assert.equal(issue({ sourceType: 'equipment' }, 'ref', [], { sourceField: '', targetFieldId: '', operator: 'eq' }), '');
});
test('all four existing operators survive while invalid, self, missing, disabled and multiple dependencies reject', () => {
  for (const operator of ['eq', 'ne', 'contains', 'notContains']) assert.equal(issue(config, 'ref', [field('order')], { ...row, operator }), '');
  for (const candidates of [[], [field('ref')], [{ ...field('order'), status: 'disabled' }], [field('order', 'subTable')], [field('order', 'reference', { multiple: true })]]) assert.ok(issue(config, 'ref', candidates, row));
  assert.ok(issue(config, 'ref', [field('order')], { ...row, operator: 'sql' }));
  assert.ok(issue(config, 'ref', [field('order')], { ...row, sourceField: '' }));
});
test('combined model/canvas and child row conditions cannot bypass validation', () => {
  const ref = field('ref', 'reference', config);
  assert.equal(issues(doc([ref, field('order')])).length, 0);
  assert.ok(issues(doc([ref, field('order')], [{ id: 'n', bindings: { fieldId: 'ref', widgetConfig: { referenceSourceType: 'equipment' } } }])).length);
  const table = field('table', 'subTable', { columns: [ref, field('order')] });
  assert.equal(issues(doc([table])).length, 0);
  assert.ok(issues(doc([table, field('other', 'subTable', { columns: [field('elsewhere')] })], [{ id: 'n', bindings: { subTableId: 'table', subTableFieldId: 'ref', widgetConfig: { referenceQueryConditions: [{ ...row, targetFieldId: 'elsewhere' }] } } }])).length);
});
test('new material type filters require types and legacy material does not gain new attributes implicitly', () => {
  assert.ok(issues(doc([field('m', 'reference', { sourceType: 'material', referenceMaterialScope: 'types' })])).length);
  assert.equal(issues(doc([field('m', 'reference', { sourceType: 'material' })])).length, 0);
  assert.ok(issue({ sourceType: 'material' }, 'm', [field('type')], { sourceField: 'materialTypeName', targetFieldId: 'type', operator: 'eq' }));
  assert.equal(issue({ sourceType: 'material', referenceMaterialScope: 'all' }, 'm', [field('type')], { sourceField: 'materialTypeName', targetFieldId: 'type', operator: 'eq' }), '');
});
