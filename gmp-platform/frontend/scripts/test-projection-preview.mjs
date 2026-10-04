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
const { buildProjectionPreviewValues, previewSampleKey } = createRequire(import.meta.url)(outfile);
await rm(tempDir, { recursive: true, force: true });

const fields = [{ id: 'lot', type: 'text' }, { id: 'qty', type: 'number' }, { id: 'material', type: 'reference' }];
const model = { fields: [...fields, { id: 'table', type: 'subTable', typeConfig: { columns: [...fields, { id: 'key', type: 'text' }] } }],
  projection: { version: 'form-projection-v1', bindings: [
    { id: 'main', enabled: true, modelId: 'consumption', sources: { materialLotText: 'lot', quantity: 'qty', material: 'material' } },
    { id: 'table', enabled: true, modelId: 'consumption', tableId: 'table', rowKeyFieldId: 'key', sources: { materialLotText: 'lot', quantity: 'qty' } },
    { id: 'table-trace', enabled: true, modelId: 'formTrace', tableId: 'table', rowKeyFieldId: 'key', sources: { materialLotText: 'lot' } },
    { id: 'draft', enabled: false, modelId: 'formTrace', sources: { equipmentText: 'draft-only' } },
  ] } };
const sample = (region, row, field, value) => [previewSampleKey(region, row, field), value];

test('subtable rows and the main form keep independent values, even when several uses share a column', () => {
  const before = JSON.stringify(model);
  const samples = Object.fromEntries([sample('', 0, 'lot', 'MAIN'), sample('', 0, 'qty', '15'), sample('', 0, 'material', 'm1'),
    sample('table', 0, 'key', 'A'), sample('table', 0, 'lot', 'LOT-A'), sample('table', 0, 'qty', '2.5'),
    sample('table', 1, 'key', 'B'), sample('table', 1, 'lot', 'LOT-B'), sample('table', 1, 'qty', '3')]);
  const values = buildProjectionPreviewValues(model, samples, {}, [{ id: 'm1', name: '虚构物料' }]);
  assert.deepEqual(values, { lot: 'MAIN', qty: 15, material: { id: 'm1', name: '虚构物料' }, table: [
    { lot: 'LOT-A', qty: 2.5, key: 'A' }, { lot: 'LOT-B', qty: 3, key: 'B' },
  ] });
  assert.equal(JSON.stringify(model), before, 'preview must not alter stored mappings');
});

test('missing quantities stay null and drafts do not contribute preview values', () => {
  const values = buildProjectionPreviewValues(model, {}, { table: 1 }, []);
  assert.equal(values.qty, null);
  assert.equal(values.material, null);
  assert.equal(values.table.length, 1);
  assert.equal(values.table[0].qty, null);
  assert.ok(!Object.hasOwn(values, 'draft-only'));
});

test('changing the simulated row count does not merge, duplicate or erase another row', () => {
  const samples = Object.fromEntries([sample('table', 0, 'lot', 'A'), sample('table', 1, 'lot', 'B'), sample('table', 2, 'lot', 'C')]);
  assert.deepEqual(buildProjectionPreviewValues(model, samples, { table: 3 }, []).table.map(row => row.lot), ['A', 'B', 'C']);
  assert.deepEqual(buildProjectionPreviewValues(model, samples, { table: 1 }, []).table.map(row => row.lot), ['A']);
});
