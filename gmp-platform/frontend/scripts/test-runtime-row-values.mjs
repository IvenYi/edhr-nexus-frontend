import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = await mkdtemp(path.join(os.tmpdir(), 'runtime-row-values-'));
const file = path.join(dir, 'row.cjs');
await build({ entryPoints: [fileURLToPath(new URL('../src/components/form-renderer/newSubTableRow.ts', import.meta.url))], outfile: file, bundle: true, platform: 'node', format: 'cjs', logLevel: 'silent' });
const { newSubTableRow } = createRequire(import.meta.url)(file);
await rm(dir, { recursive: true, force: true });
test('new rows have distinct system identities and persist configured defaults using actual option values', () => {
  const columns = [
    { id: 'qty', type: 'number', typeConfig: { defaultValue: '2.5' } },
    { id: 'unit', type: 'singleSelect', typeConfig: { defaultValue: '件', options: [{ label: '件', value: 'PCS' }] } },
    { id: 'note', type: 'text', typeConfig: {} },
    { id: 'ref', type: 'reference', typeConfig: { defaultValue: '不要猜实体' } },
  ];
  const nodes = [{ bindings: { subTableFieldId: 'note', defaultValue: '新行' } }];
  const first = newSubTableRow(columns, nodes), second = newSubTableRow(columns, nodes);
  assert.match(first.__rowId, /^[0-9a-f-]{36}$/);
  assert.notEqual(first.__rowId, second.__rowId);
  assert.equal(first.qty, 2.5); assert.equal(first.unit, 'PCS'); assert.equal(first.note, '新行');
  assert.equal(first.ref, undefined);
  assert.equal(columns[2].typeConfig.defaultValue, undefined, 'creating values does not rewrite field configuration');
});
test('canvas defaults override model defaults without rewriting them', () => {
  const columns = [{ id: 'unit', type: 'singleSelect', typeConfig: { defaultValue: '旧单位', options: [{ label: '旧单位', value: 'OLD' }, { label: '件', value: 'PCS' }] } }];
  const row = newSubTableRow(columns, [{ bindings: { subTableFieldId: 'unit', defaultValue: '件' } }]);
  assert.equal(row.unit, 'PCS');
  assert.equal(columns[0].typeConfig.defaultValue, '旧单位');
});
