import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const tempDir = await mkdtemp(path.join(os.tmpdir(), 'projection-panel-'));
const outfile = path.join(tempDir, 'store.cjs');
await build({ entryPoints: [fileURLToPath(new URL('../src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts', import.meta.url))],
  outfile, bundle: true, format: 'cjs', platform: 'node', logLevel: 'silent',
  alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } });
const { useTemplateDesignerStore: store } = createRequire(import.meta.url)(outfile);
await rm(tempDir, { recursive: true, force: true });

function reset() {
  const document = { meta: {}, model: { groups: [], fields: [
    { id: 'lot', name: '物料批号', type: 'text', typeConfig: {} },
    { id: 'table', name: '上料明细', type: 'subTable', typeConfig: { columns: [] } },
  ] }, canvas: { currentPageId: 'page', pages: [{ id: 'page', nodes: [
    { id: 'lot-node', type: 'text', props: {}, bindings: { fieldId: 'lot' }, style: { cellRange: { t: 1, l: 1, b: 1, r: 1 } } },
    { id: 'table-node', type: 'sub-table', props: {}, bindings: { fieldId: 'table' }, style: { cellRange: { t: 3, l: 1, b: 5, r: 3 } } },
  ], cells: {} }] }, workflow: { nodes: [], edges: [], config: {} } };
  store.getState().setDocument(document);
  store.getState().markSaved();
  store.getState().setSelectedCell({ row: 1, col: 1 });
}

test('switching panels preserves the selected source, document, dirty state and undo history', () => {
  reset();
  const before = store.getState();
  store.getState().setActiveCanvasRail('projection');
  store.getState().setActiveCanvasRail('config');
  store.getState().setCanvasSidebarVisible(false);
  store.getState().setActiveCanvasRail('projection');
  const after = store.getState();
  assert.equal(after.selectedNodeId, 'lot-node');
  assert.deepEqual(after.selectedRange, before.selectedRange);
  assert.equal(after.document, before.document);
  assert.equal(after.undoStack, before.undoStack);
  assert.equal(after.isDirty(), false);
  assert.equal(after.isCanvasSidebarVisible, true);
});

test('projection selection follows fields, subtables and empty canvas without switching panels', () => {
  reset();
  store.getState().setActiveCanvasRail('projection');
  store.getState().setSelectedRange({ t: 3, l: 1, b: 5, r: 3 });
  assert.equal(store.getState().selectedNodeId, 'table-node');
  assert.equal(store.getState().activeCanvasRail, 'projection');
  store.getState().setSelectedRange({ t: 1, l: 1, b: 1, r: 1 });
  assert.equal(store.getState().selectedNodeId, 'lot-node');
  assert.equal(store.getState().activeCanvasRail, 'projection');
  store.getState().setSelectedRange(null);
  assert.equal(store.getState().selectedNodeId, null);
  assert.equal(store.getState().activeCanvasRail, 'projection');
  store.getState().setActiveCanvasRail('config');
  store.getState().setSelectedRange({ t: 3, l: 1, b: 5, r: 3 });
  assert.equal(store.getState().activeCanvasRail, 'fields', 'ordinary layout selection keeps its existing behavior');
  store.getState().setSelectedCell({ row: 1, col: 1 });
  assert.equal(store.getState().activeCanvasRail, 'config');
});

test('source edits share the existing save, undo and redo state across panels', () => {
  reset();
  const bindings = [{ id: 'trace', modelId: 'formTrace', enabled: true, sources: { materialLotText: 'lot' } }];
  store.getState().setActiveCanvasRail('projection');
  store.getState().setProjectionBindings(bindings, 'form-projection-v1');
  assert.equal(store.getState().isDirty(), true);
  store.getState().setActiveCanvasRail('config');
  store.getState().setActiveCanvasRail('projection');
  assert.deepEqual(store.getState().document.model.projection.bindings, bindings);
  assert.equal(store.getState().undoStack.length, 1, 'panel navigation must not create document history');
  store.getState().undoCanvasChange();
  assert.equal(store.getState().document.model.projection, undefined);
  assert.equal(store.getState().activeCanvasRail, 'projection');
  store.getState().redoCanvasChange();
  assert.deepEqual(store.getState().document.model.projection.bindings, bindings);
  store.getState().markSaved();
  assert.equal(store.getState().isDirty(), false);
});
