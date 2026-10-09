import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const result = await build({ absWorkingDir: root, entryPoints: ['src/components/form-renderer/referenceConfig.ts'], bundle: true, write: false, platform: 'node', format: 'cjs' });
const sandbox = { module: { exports: {} }, require: createRequire(import.meta.url) };
vm.runInNewContext(result.outputFiles[0].text, sandbox);
const { resolveReferenceField, syncReferenceConfig, mockReferenceValues, referenceDependencyValues, updateMockFieldValue } = sandbox.module.exports;
const plain = value => JSON.parse(JSON.stringify(value));
const ref = { id: 'ref', type: 'reference', typeConfig: { sourceType: 'dictionary' } };

test('legacy widget settings override fallback model configuration', () => {
  const node = { bindings: { widgetConfig: { referenceSourceType: 'material', referenceField: 'code' } } };
  const resolved = resolveReferenceField(ref, node);
  assert.equal(resolved.typeConfig.sourceType, 'material');
  assert.equal(resolved.typeConfig.referenceField, 'code');
  assert.equal(ref.typeConfig.sourceType, 'dictionary');
});

test('updating a main reference synchronizes repeated placements without touching other fields', () => {
  const document = { model: { fields: [ref, { id: 'text', type: 'text' }] }, canvas: { pages: [{ id: 'p', nodes: [
    { id: 'one', bindings: { fieldId: 'ref', widgetConfig: { referenceSourceType: 'material', referenceField: 'name' } } },
    { id: 'two', bindings: { fieldId: 'ref' } },
  ] }] } };
  const updated = syncReferenceConfig(document, 'one');
  assert.equal(updated.model.fields[0].typeConfig.sourceType, 'material');
  assert.equal(updated.canvas.pages[0].nodes[1].bindings.widgetConfig.referenceSourceType, 'material');
  assert.equal(document.model.fields[0].typeConfig.sourceType, 'dictionary');
  assert.equal(updated.model.fields[1], document.model.fields[1]);
});

test('subtable config synchronizes columns and embedded fields, keeping row conditions', () => {
  const conditions = [{ sourceField: 'code', targetFieldId: 'code', operator: 'eq' }];
  const document = { model: { fields: [{ id: 'table', type: 'subTable', typeConfig: { columns: [ref] } }] }, canvas: { pages: [{ id: 'p', nodes: [
    { id: 'cell', bindings: { subTableId: 'table', subTableFieldId: 'ref', subTableField: ref, widgetConfig: { referenceSourceType: 'material', referenceQueryConditions: conditions } } },
  ] }] } };
  const updated = syncReferenceConfig(document, 'cell');
  assert.equal(updated.model.fields[0].typeConfig.columns[0].typeConfig.sourceType, 'material');
  assert.deepEqual(plain(updated.canvas.pages[0].nodes[0].bindings.subTableField.typeConfig.referenceQueryConditions), conditions);
});

test('mock reference context combines main fields with only the current record', () => {
  const document = { model: { fields: [{ id: 'table', typeConfig: { columns: [{ id: 'code' }, ref] } }] }, canvas: { pages: [{ id: 'p', nodes: [{ id: 'main-node', bindings: { fieldId: 'main' } }] }] } };
  const node = { bindings: { subTableId: 'table', subTableFieldId: 'ref' } };
  const values = { 'p:main-node': 'root', 'p:t:record-0:code': 'M01', 'p:t:record-1:code': 'M02' };
  const context = mockReferenceValues(document, values, node, 'p:t:record-1:ref');
  assert.deepEqual(plain(context), { main: 'root', code: 'M02', ref: '' });
  assert.deepEqual(plain(referenceDependencyValues({ ...ref, typeConfig: { referenceQueryConditions: [{ targetFieldId: 'code' }, { targetFieldId: 'main' }] } }, context)), { code: 'M02', main: 'root' });
});

test('editing and clearing any main-field placement synchronizes reference dependencies across pages', () => {
  const document = { model: { fields: [] }, canvas: { pages: [
    { id: 'p', nodes: [{ id: 'first', bindings: { fieldId: 'code' } }, { id: 'second', bindings: { fieldId: 'code' } }] },
    { id: 'other', nodes: [{ id: 'third', bindings: { fieldId: 'code' } }] },
  ] } };
  const original = { 'p:first': '', 'p:second': '', 'other:third': '', 'p:t:record-0:code': 'row-unchanged' };
  const updated = updateMockFieldValue(document, original, 'p:first', 'M01');
  assert.deepEqual(plain(mockReferenceValues(document, updated, {}, 'p:ref')), { code: 'M01' });
  assert.equal(updated['p:second'], 'M01');
  assert.equal(updated['other:third'], 'M01');
  assert.equal(updated['p:t:record-0:code'], 'row-unchanged');
  const cleared = updateMockFieldValue(document, updated, 'other:third', '');
  assert.deepEqual(plain(mockReferenceValues(document, cleared, {}, 'p:ref')), { code: '' });
  assert.equal(original['p:first'], '');
});
