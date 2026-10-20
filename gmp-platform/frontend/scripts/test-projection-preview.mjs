import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const tempDir = await mkdtemp(path.join(os.tmpdir(), 'projection-preview-'));
const outfile = path.join(tempDir, 'preview.cjs');
await build({ entryPoints: [fileURLToPath(new URL('../src/pages/master-data/template-designer-react/utils/projectionPreview.ts', import.meta.url))],
  outfile, bundle: true, format: 'cjs', platform: 'node', logLevel: 'silent' });
const { buildProjectionPreviewValues, previewSampleKey, projectionPreviewFieldIds } = createRequire(import.meta.url)(outfile);
await rm(tempDir, { recursive: true, force: true });

const fields = [{ id: 'lot', type: 'text', typeConfig: {} }, { id: 'qty', type: 'number', typeConfig: {} }, { id: 'material', type: 'reference', typeConfig: { sourceType: 'material' } }];
const model = { fields: [...fields, { id: 'table', type: 'subTable', typeConfig: { columns: [...fields, { id: 'key', type: 'text' }] } }],
  projection: { version: 'form-projection-v1', bindings: [
    { id: 'main', enabled: true, modelId: 'consumption', sources: { materialLotText: 'lot', quantity: 'qty', material: 'material' } },
    { id: 'table', enabled: true, modelId: 'consumption', tableId: 'table', rowKeyFieldId: 'key', sources: { materialLotText: 'lot', quantity: 'qty' } },
    { id: 'table-trace', enabled: true, modelId: 'formTrace', tableId: 'table', rowKeyFieldId: 'key', sources: { materialLotText: 'lot' } },
    { id: 'draft', enabled: false, modelId: 'formTrace', sources: { equipmentText: 'draft-only' } },
  ] } };
const sample = (region, row, field, value) => [previewSampleKey(region, row, field), value];

test('legal blank main regions produce root samples and preserve the original binding identity', () => {
  for (const tableId of [undefined, '', ' ', '\t', '\u001c', '\u3000', ' \t\u2000\u3000']) {
    const model = { fields, projection: { bindings: [
      { id: 'trace', enabled: true, modelId: 'formTrace', tableId, sources: { materialLotText: 'lot' } },
    ] } };
    const before = JSON.stringify(model);
    assert.deepEqual([...projectionPreviewFieldIds(model).keys()], ['']);
    assert.equal(previewSampleKey(tableId, 0, 'lot'), previewSampleKey('', 0, 'lot'));
    assert.deepEqual(buildProjectionPreviewValues(model, { [previewSampleKey('', 0, 'lot')]: 'MAIN' }, {}), { lot: 'MAIN' });
    assert.equal(JSON.stringify(model), before, 'simulation must preserve frozen/stored region spelling');
  }
});

test('nonblank padded table identities and nonbreaking-space IDs are not trimmed or merged', () => {
  const ids = ['table', ' table ', '\u00a0'];
  const model = { fields: [{ id: 'lot', type: 'text' }, ...ids.map(id => ({ id, type: 'subTable', typeConfig: { columns: fields } }))],
    projection: { bindings: [{ enabled: true, sources: { materialLotText: 'lot' } },
      ...ids.map(tableId => ({ enabled: true, tableId, sources: { materialLotText: 'lot' } }))] } };
  const samples = Object.fromEntries([sample('', 0, 'lot', 'MAIN'), ...ids.map((id, index) => sample(id, 0, 'lot', `ROW-${index}`))]);
  const values = buildProjectionPreviewValues(model, samples, Object.fromEntries(ids.map(id => [id, 1])));
  assert.equal(values.lot, 'MAIN');
  ids.forEach((id, index) => assert.equal(values[id][0].lot, `ROW-${index}`));
});

test('subtable rows and the main form keep independent values, even when several uses share a column', () => {
  const before = JSON.stringify(model);
  const samples = Object.fromEntries([sample('', 0, 'lot', 'MAIN'), sample('', 0, 'qty', '15'), sample('', 0, 'material', { id: 'm1', name: '虚构物料' }),
    sample('table', 0, 'key', 'A'), sample('table', 0, 'lot', 'LOT-A'), sample('table', 0, 'qty', '2.5'),
    sample('table', 1, 'key', 'B'), sample('table', 1, 'lot', 'LOT-B'), sample('table', 1, 'qty', '3')]);
  const values = buildProjectionPreviewValues(model, samples, {});
  assert.deepEqual(values, { lot: 'MAIN', qty: 15, material: { id: 'm1', name: '虚构物料' }, table: [
    { __rowId: '00000000-0000-4000-8000-000000000001', lot: 'LOT-A', qty: 2.5, key: 'A' },
    { __rowId: '00000000-0000-4000-8000-000000000002', lot: 'LOT-B', qty: 3, key: 'B' },
  ] });
  assert.equal(JSON.stringify(model), before, 'preview must not alter stored mappings');
});

test('missing quantities stay null and drafts do not contribute preview values', () => {
  const values = buildProjectionPreviewValues(model, {}, { table: 1 });
  assert.equal(values.qty, null);
  assert.equal(values.material, null);
  assert.equal(values.table.length, 1);
  assert.equal(values.table[0].qty, null);
  assert.ok(!Object.hasOwn(values, 'draft-only'));
});

test('changing the simulated row count does not merge, duplicate or erase another row', () => {
  const samples = Object.fromEntries([sample('table', 0, 'lot', 'A'), sample('table', 1, 'lot', 'B'), sample('table', 2, 'lot', 'C')]);
  assert.deepEqual(buildProjectionPreviewValues(model, samples, { table: 3 }).table.map(row => row.lot), ['A', 'B', 'C']);
  assert.deepEqual(buildProjectionPreviewValues(model, samples, { table: 1 }).table.map(row => row.lot), ['A']);
});

test('native reference samples retain identity, code and row-local conditions without treating every reference as material', () => {
  const reference = { id: 'ref', type: 'reference', typeConfig: { sourceType: 'productionBatch', referenceQueryConditions: [{ targetFieldId: 'order', sourceField: 'workOrderNo', operator: 'eq' }] } };
  const localModel = { fields: [{ id: 'order', type: 'text' }, reference, { id: 'table', type: 'subTable', typeConfig: { columns: [reference, { id: 'order', type: 'text' }, { id: 'key', type: 'text' }] } }],
    projection: { bindings: [{ enabled: true, sources: { batch: 'ref' } }, { enabled: true, tableId: 'table', rowKeyFieldId: 'key', sources: { batch: 'ref' } }] } };
  const mainRef = { id: '1', sourceType: 'productionBatch', code: 'B-MAIN', name: 'WO-MAIN' };
  const rowRef = { id: '2', sourceType: 'productionBatch', code: 'B-ROW', name: 'WO-ROW' };
  const values = buildProjectionPreviewValues(localModel, Object.fromEntries([sample('', 0, 'ref', mainRef), sample('', 0, 'order', 'WO-MAIN'), sample('table', 0, 'ref', rowRef), sample('table', 0, 'order', 'WO-ROW')]), { table: 1 });
  assert.deepEqual(values.ref, mainRef);
  assert.deepEqual(values.table[0].ref, rowRef);
  assert.equal(values.order, 'WO-MAIN');
  assert.equal(values.table[0].order, 'WO-ROW');
});
