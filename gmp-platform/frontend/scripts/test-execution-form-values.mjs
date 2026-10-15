import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = await mkdtemp(path.join(os.tmpdir(), 'execution-values-'));
const outfile = path.join(dir, 'values.cjs');
await build({ entryPoints: [fileURLToPath(new URL('../src/pages/production/executionFormValues.ts', import.meta.url))], outfile, bundle: true, format: 'cjs', platform: 'node', logLevel: 'silent' });
const { executionFormValues } = createRequire(import.meta.url)(outfile);
await rm(dir, { recursive: true, force: true });
const fields = [{ id: 'quantity', type: 'number', typeConfig: {} }, { id: 'code', type: 'text', typeConfig: {} },
  { id: 'rows', type: 'subTable', typeConfig: { columns: [{ id: 'quantity', type: 'number', typeConfig: {} }] } }];

test('main and actual subtable quantities reach persistence as numbers without changing source identities', () => {
  const values = { quantity: '58', code: '001', rows: [{ __rowId: 'row-a', quantity: '2.50' }], material: { id: '7', name: '标签' } };
  const original = JSON.stringify(values);
  assert.deepEqual(executionFormValues(fields, values), { ...values, quantity: 58, rows: [{ __rowId: 'row-a', quantity: 2.5 }] });
  assert.equal(JSON.stringify(values), original);
});

test('blank and invalid numeric input remains available to server validation, while zero and negative numbers retain their meaning', () => {
  for (const value of ['', ' ', '-', 'NaN', 'Infinity', '12件', '0x10', true, { value: 12 }]) assert.equal(executionFormValues(fields, { quantity: value }).quantity, value);
  assert.equal(executionFormValues(fields, { quantity: '0' }).quantity, 0);
  assert.equal(executionFormValues(fields, { quantity: '-1.25' }).quantity, -1.25);
});
