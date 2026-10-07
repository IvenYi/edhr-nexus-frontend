import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const tempDir = await mkdtemp(path.join(os.tmpdir(), 'projection-source-editor-'));
const outfile = path.join(tempDir, 'editor.cjs');
await build({ stdin: { contents: `
  import React from 'react';
  import { renderToStaticMarkup } from 'react-dom/server';
  import ProjectionSourceEditor from './src/pages/master-data/template-designer-react/components/ProjectionSourceEditor';
  export { acceptsProjectionAttribute } from './src/pages/master-data/template-designer-react/utils/projectionConfiguration';
  import { useTemplateDesignerStore as store } from './src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
  export function renderEditor(model, binding, definition) {
    store.getState().setDocument({ meta: {}, model, canvas: { pages: [] }, workflow: { nodes: [], edges: [], config: {} } });
    // SSR must read the loaded document rather than the store's empty creation snapshot.
    store.getInitialState().document = store.getState().document;
    const changes = [];
    const html = renderToStaticMarkup(React.createElement(ProjectionSourceEditor, { binding, definition, onChange: patch => changes.push(patch), onRemove: () => changes.push('remove') }));
    return { html, changes };
  }
`, resolveDir: fileURLToPath(new URL('..', import.meta.url)), loader: 'tsx' }, outfile, bundle: true, format: 'cjs', platform: 'node', logLevel: 'silent',
  alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } });
const { renderEditor, acceptsProjectionAttribute } = createRequire(import.meta.url)(outfile);
await rm(tempDir, { recursive: true, force: true });

const lot = { id: 'lot', name: '供应商批号输入', type: 'text', typeConfig: {} };
const model = { groups: [], fields: [lot, { id: 'equipment', name: '设备编号输入', type: 'text', typeConfig: {} }] };
const definition = { id: 'formTrace', name: '追溯', attributes: [
  { id: 'supplierLot', name: '供应商批号（外部）', type: 'text' },
  { id: 'equipment', name: '设备编号', type: 'text' },
  { id: 'order', name: '工单编号', type: 'text' },
] };

test('trace source editor shows its assigned meaning without expanding unrelated catalog entries', () => {
  const { html, changes } = renderEditor(model, { id: 'trace', modelId: 'formTrace', enabled: true, sources: { supplierLot: 'lot' } }, definition);
  assert.ok(html.includes('供应商批号（外部）'));
  assert.ok(html.includes('添加追溯项'));
  assert.ok(!html.includes('设备编号'));
  assert.ok(!html.includes('工单编号'));
  assert.deepEqual(changes, [], 'rendering must not rewrite existing mappings');
});

test('a removed trace definition keeps its original source visible and removable', () => {
  const { html, changes } = renderEditor(model, { id: 'trace', modelId: 'formTrace', enabled: false, sources: { removedMeaning: 'lot' } }, definition);
  assert.ok(html.includes('追溯项或业务信息已失效'));
  assert.ok(html.includes('供应商批号输入'));
  assert.ok(html.includes('移除'));
  assert.deepEqual(changes, [], 'an unknown meaning must not be remapped automatically');
});

test('a removed field keeps its assigned meaning and explicit invalid-source warning', () => {
  const { html, changes } = renderEditor(model, { id: 'trace', modelId: 'formTrace', enabled: false, sources: { supplierLot: 'deletedField' } }, definition);
  assert.ok(html.includes('供应商批号（外部）'));
  assert.ok(html.includes('来源已失效，请重新选择'));
  assert.ok(html.includes('存在失效或类型不匹配的来源'));
  assert.deepEqual(changes, []);
});

test('trace editor offers no additional meaning when every compatible source is already used', () => {
  const { html, changes } = renderEditor({ groups: [], fields: [lot] }, { id: 'trace', modelId: 'formTrace', enabled: true, sources: { supplierLot: 'lot' } }, definition);
  assert.ok(!html.includes('添加追溯项'));
  assert.ok(html.includes('供应商批号（外部）'));
  assert.deepEqual(changes, []);
});

test('trace accepts compatible native sources while statistics and unrelated meanings keep their boundaries', () => {
  const batch = { id: 'batch', name: '生产批次选择', type: 'reference', typeConfig: { sourceType: 'productionBatch' } };
  const meaning = { id: 'lookup_production_batch', name: '生产批次号', type: 'text', referenceSources: ['productionBatch'] };
  assert.equal(acceptsProjectionAttribute(batch, meaning), true);
  assert.equal(acceptsProjectionAttribute(lot, meaning), true);
  assert.equal(acceptsProjectionAttribute(batch, { ...meaning, referenceSources: ['material'] }), false);
  assert.equal(acceptsProjectionAttribute(batch, { id: 'custom', type: 'text' }), false);
  assert.equal(acceptsProjectionAttribute(batch, { id: 'quantity', type: 'number' }), false);
  assert.equal(acceptsProjectionAttribute(batch, { id: 'material', type: 'reference' }), false);
  const { html, changes } = renderEditor({ fields: [batch] }, { id: 'trace', modelId: 'formTrace', enabled: true, sources: { lookup_production_batch: 'batch' } }, { id: 'formTrace', attributes: [meaning] });
  assert.ok(html.includes('生产批次选择'));
  assert.ok(!html.includes('类型不匹配'));
  assert.deepEqual(changes, []);
});
