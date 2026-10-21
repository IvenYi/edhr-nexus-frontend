import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const result = await build({ absWorkingDir: root, entryPoints: ['src/components/form-renderer/referencePresentation.ts'], bundle: true, write: false, platform: 'node', format: 'cjs' });
const sandbox = { module: { exports: {} }, require: createRequire(import.meta.url) };
vm.runInNewContext(result.outputFiles[0].text, sandbox);
const { referenceDisplayText, referenceDefaultSearchFields, contextReferenceSources, supportsReferenceContext, referenceFields, referenceEditorSource, referenceMaterialScope, referenceProductionScope } = sandbox.module.exports;

test('ordered model fields form readable labels without mutating reference identity', () => {
  const value = { id: '7', sourceType: 'equipment', code: 'EQ01', name: '清洗机', model: 'UC-200' };
  assert.equal(referenceDisplayText(value, { referenceDisplayFields: ['code', 'name', 'model'] }), 'EQ01[清洗机][UC-200]');
  assert.equal(referenceDisplayText(value, { referenceDisplayFields: ['name', 'code'] }), '清洗机[EQ01]');
  assert.equal(referenceDisplayText(value, { referenceDisplayFields: ['code'] }), 'EQ01');
  assert.deepEqual(value, { id: '7', sourceType: 'equipment', code: 'EQ01', name: '清洗机', model: 'UC-200' });
});
test('empty attributes never produce empty brackets while zero and false remain visible', () => {
  assert.equal(referenceDisplayText({ id: '1', name: '', code: '', quantity: 0, enabled: false, other: null }, { referenceDisplayFields: ['code', 'other', 'quantity', 'enabled'] }), '0[false]');
  assert.equal(referenceDisplayText({ id: '1', name: '旧快照名称' }, { referenceDisplayFields: ['model'] }), '旧快照名称');
});
test('legacy display and independent search preserve field context without enabling equipment prefill', () => {
  assert.equal(referenceDisplayText({ id: '1', name: '原始展示', code: 'M01' }, { referenceField: 'code' }), 'M01');
  assert.deepEqual(Array.from(referenceDefaultSearchFields('equipment')), ['code', 'name']);
  for (const source of ['productionBatch', 'serialNumber', 'workOrder', 'product', 'operation']) assert.ok(contextReferenceSources.includes(source));
  for (const source of ['equipment', 'material', 'user', 'defectReason', 'scrapReason']) assert.ok(!contextReferenceSources.includes(source));
});
test('unified editor groups legacy entrances without changing the original identity or offering unsafe context', () => {
  assert.equal(referenceEditorSource('product'), 'material');
  assert.equal(referenceMaterialScope({ sourceType: 'product' }), 'product');
  assert.equal(referenceEditorSource('productionBatch'), 'productionObject');
  assert.equal(referenceProductionScope({ sourceType: 'productionBatch' }), 'batch');
  assert.equal(referenceProductionScope({ sourceType: 'serialNumber' }), 'sn');
  assert.ok(supportsReferenceContext({ sourceType: 'productionObject' }));
  assert.ok(supportsReferenceContext({ sourceType: 'material', referenceMaterialScope: 'product' }));
  assert.equal(supportsReferenceContext({ sourceType: 'material', referenceMaterialScope: 'types' }), false);
  assert.ok(referenceFields({ sourceType: 'productionObject' }).some(field => field.value === 'objectTypeName'));
  assert.equal(referenceFields({ sourceType: 'material' }).some(field => field.value === 'materialTypeName'), false);
  assert.ok(referenceFields({ sourceType: 'material', referenceMaterialScope: 'all' }).some(field => field.value === 'materialTypeName'));
});
