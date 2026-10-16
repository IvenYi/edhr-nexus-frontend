import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const temp = await mkdtemp(path.join(os.tmpdir(), 'production-output-'));
const outfile = path.join(temp, 'output.cjs');
await build({ stdin: { contents: `
  import React from 'react';
  import { renderToStaticMarkup } from 'react-dom/server';
  import { ProductionOutputValue, ProductionOutputDetails } from './src/components/ProductionOutput';
  export const value = output => renderToStaticMarkup(React.createElement(ProductionOutputValue, {output}));
  export const detail = output => renderToStaticMarkup(React.createElement(ProductionOutputDetails, {output}));
`, resolveDir: fileURLToPath(new URL('..', import.meta.url)), loader: 'tsx' }, outfile, bundle: true, format: 'cjs', platform: 'node', logLevel: 'silent' });
const { value, detail } = createRequire(import.meta.url)(outfile);
await rm(temp, { recursive: true, force: true });

test('actual zero remains visible; missing data is not presented as zero', () => {
  assert.ok(value({quantity: '0', unit: '件', status: 'READY', message: ''}).includes('0 件'));
  assert.ok(value({quantity: null, unit: null, status: 'NO_DATA', message: ''}).includes('暂无数据'));
  assert.ok(!value({quantity: null, unit: null, status: 'NO_DATA', message: ''}).includes('0 件'));
});
test('partial quantities and unit problems carry visible status text', () => {
  for (const [status, label] of [['PARTIAL', '部分汇总'], ['UNIT_REVIEW', '待核对'], ['LEGACY', '未配置（历史）']])
    assert.ok(value({quantity: '10', unit: '件', status, message: ''}).includes(label));
});
test('ordinary-operation unit groups stay separate', () => {
  const html = value({quantity: null, status: 'READY', message: '', groups: [{quantity: '10', unit: '根'}, {quantity: '12', unit: '件'}]});
  // DEC-0079-06 summarizes distinct groups; their values remain in the source popover.
  assert.ok(html.includes('2 组（分物料/单位）'));
  assert.ok(!html.includes('22'));
});
test('batch details explain excluded source records', () => {
  const html = detail({quantity: '0', unit: '件', status: 'UNIT_REVIEW', message: '待核对', operationName: '包装', sources: [
    {recordId: '1', instanceNo: 'FR-1', tableId: '', rowKey: 'form', quantity: '10', unit: 'kg', included: false, message: '单位不一致，未计入'}]});
  assert.ok(html.includes('FR-1')); assert.ok(html.includes('包装')); assert.ok(html.includes('单位不一致，未计入'));
});
