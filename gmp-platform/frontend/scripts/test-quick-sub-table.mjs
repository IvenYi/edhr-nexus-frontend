import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const tempDir = await mkdtemp(path.join(os.tmpdir(), 'quick-sub-table-'));
const outfile = path.join(tempDir, 'store.cjs');
await build({
  entryPoints: [fileURLToPath(new URL('../src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts', import.meta.url))],
  outfile, bundle: true, platform: 'node', format: 'cjs', logLevel: 'silent',
});
const { useTemplateDesignerStore: store } = createRequire(import.meta.url)(outfile);
await rm(tempDir, { recursive: true, force: true });

const range = { t: 2, l: 2, b: 4, r: 4 };
const layout = { left: 100, top: 30, width: 300, height: 90 };
function reset() {
  const page = {
    id: 'page', name: '测试页', nodes: [], images: [], medias: [],
    sheet: { rowCount: 10, columnCount: 6, rowHeights: Array(10).fill(30), columnWidths: Array(6).fill(100) },
    cells: { '2:2': { value: '检验内容', style: { fontWeight: 'bold' } } },
    mergedCells: [{ t: 2, l: 2, b: 2, r: 3 }],
  };
  store.getState().setDocument({
    meta: { schema: 'edhr-template-designer-react', version: 1, templateId: 'test', versionId: 'test', templateName: 'test', versionLabel: 'V1' },
    model: { groups: [], fields: [] },
    canvas: { currentPageId: page.id, pages: [page] },
    workflow: { nodes: [], edges: [], config: {} },
  });
  return structuredClone(store.getState().document);
}

test('creates a named sub-table and binds the selected region in one undoable operation', () => {
  const before = reset();
  const field = store.getState().createSubTableFromRange('  过程检验  ', range, layout);
  assert.equal(field.name, '过程检验');
  assert.equal(field.type, 'subTable');
  assert.deepEqual(field.typeConfig.columns, []);
  const after = store.getState().document;
  const page = after.canvas.pages[0];
  assert.equal(page.nodes.length, 1);
  assert.equal(page.nodes[0].bindings.fieldId, field.id);
  assert.deepEqual(page.nodes[0].style.cellRange, range);
  assert.deepEqual(page.nodes[0].bindings.subTableRegion.ranges[0].range, range);
  assert.deepEqual(page.cells, { '2:2': { style: { fontWeight: 'bold' } } });
  assert.deepEqual(page.mergedCells, before.canvas.pages[0].mergedCells);
  assert.equal(store.getState().undoStack.length, 1);
  store.getState().undoCanvasChange();
  assert.deepEqual(store.getState().document, before);
  store.getState().redoCanvasChange();
  assert.deepEqual(store.getState().document, after);
});

test('empty names and a single-cell selection do not create fields or history', () => {
  const before = reset();
  assert.equal(store.getState().createSubTableFromRange('  ', range, layout), null);
  assert.equal(store.getState().createSubTableFromRange('单元格', { t: 2, b: 2, l: 2, r: 2 }, layout), null);
  assert.deepEqual(store.getState().document, before);
  assert.equal(store.getState().undoStack.length, 0);
});

test('duplicate names and overlapping regions do not leave an orphan sub-table field', () => {
  reset();
  store.getState().createSubTableFromRange('检验明细', range, layout);
  const before = store.getState().document;
  assert.equal(store.getState().createSubTableFromRange('检验明细', { t: 6, b: 7, l: 2, r: 4 }, layout), null);
  assert.equal(store.getState().createSubTableFromRange('重复区域', { t: 3, b: 5, l: 3, r: 5 }, layout), null);
  assert.equal(store.getState().document, before);
  assert.equal(store.getState().undoStack.length, 1);
});
