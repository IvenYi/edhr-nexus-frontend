import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const baseline = process.env.W2_BASELINE_COMMIT;
if (baseline && !/^[0-9a-f]{40}$/.test(baseline)) throw new Error('W2_BASELINE_COMMIT must be a full commit SHA');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'designer-columns-'));
let store, createDocument, serialize, parse;
try {
  const outfile = path.join(temporary, 'store.cjs');
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'ts', contents: `
    export { useTemplateDesignerStore } from './src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
    export { createEmptyTemplateDesignerDocument, serializeTemplateDesignerDocument, parseReactTemplateDesignerDocument }
      from './src/pages/master-data/template-designer-react/utils/document';
  ` }, outfile, bundle: true, format: 'cjs', platform: 'node', logLevel: 'silent',
  plugins: baseline ? [{ name: 'baseline-store', setup(plugin) {
    plugin.onLoad({ filter: /useTemplateDesignerStore\.ts$/ }, args => ({
      contents: execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/${path.relative(root, args.path)}`], { cwd: root, encoding: 'utf8' }),
      loader: 'ts', resolveDir: path.dirname(args.path),
    }));
  } }] : [] });
  const loaded = createRequire(import.meta.url)(outfile);
  store = loaded.useTemplateDesignerStore;
  createDocument = loaded.createEmptyTemplateDesignerDocument;
  serialize = loaded.serializeTemplateDesignerDocument;
  parse = loaded.parseReactTemplateDesignerDocument;
} finally { await rm(temporary, { recursive: true, force: true }); }

function reset() {
  const document = createDocument({ schema: 'edhr-template-designer-react', version: 1,
    templateId: 'test', versionId: 'version', templateName: '列插入验证', versionLabel: 'V1' });
  const page = document.canvas.pages[0];
  page.sheet = { ...page.sheet, rowCount: 10, columnCount: 8, defaultColumnWidth: 80,
    columnWidths: [50, 100, 70, 120, 90, 80, 80, 80], rowHeights: Array(10).fill(30), defaultRowHeight: 30 };
  document.canvas.pages.push({ ...structuredClone(page), id: 'other-page', name: '其他页' });
  store.getState().setDocument(document);
  const field = store.getState().addField('text', '设备编号');
  store.getState().addNodeFromFieldToCell(field.id, { range: { t: 2, b: 2, l: 3, r: 3 }, left: 150, top: 30, width: 70, height: 30 });
  store.getState().updateSheetCellValue(2, 3, '设备标签');
  store.getState().setProjectionBindings([{ id: 'trace', modelId: 'formTrace', enabled: true, sources: { equipmentText: field.id } }]);
  return field;
}

function freezeSetup() {
  store.getState().setDocument(store.getState().document);
  store.getState().markSaved();
  return structuredClone(store.getState().document);
}

function currentPage() { return store.getState().document.canvas.pages[0]; }
function fieldNode(field) { return currentPage().nodes.find(node => node.bindings?.fieldId === field.id); }

test('inserting before a bound field shifts the same source with its cell, preserves other pages and round-trips undo/redo', () => {
  const field = reset();
  const before = freezeSetup();
  store.getState().insertSheetColumns(3, 2);
  const after = structuredClone(store.getState().document);
  assert.deepEqual(fieldNode(field).style.cellRange, { t: 2, b: 2, l: 5, r: 5 });
  assert.equal(fieldNode(field).style.compLeft, before.canvas.pages[0].nodes[0].style.compLeft + 160);
  assert.equal(fieldNode(field).id, before.canvas.pages[0].nodes[0].id);
  assert.equal(currentPage().cells['2:5'].value, '设备标签');
  assert.equal(currentPage().cells['2:3'], undefined);
  assert.deepEqual(after.model, before.model, 'field IDs and projection source IDs do not change');
  assert.deepEqual(after.canvas.pages[1], before.canvas.pages[1]);
  assert.equal(store.getState().undoStack.length, 1);
  assert.equal(store.getState().isDirty(), true);
  store.getState().undoCanvasChange();
  assert.deepEqual(store.getState().document, before);
  assert.equal(store.getState().isDirty(), false);
  store.getState().redoCanvasChange();
  assert.deepEqual(store.getState().document, after);
  const payload = serialize(after);
  const reopened = parse({ id: 'test', name: '列插入验证' }, { id: 'version', version: 'V1', ...payload });
  assert.deepEqual(reopened.model.projection, after.model.projection);
  assert.deepEqual(reopened.canvas.pages[0].nodes, after.canvas.pages[0].nodes);
});

test('inserting inside a merged field expands it, while insertion after its right edge leaves it unchanged', () => {
  const field = reset();
  const node = fieldNode(field);
  store.getState().updateNodeStyle(node.id, { cellRange: { t: 2, b: 2, l: 2, r: 4 }, compLeft: 50, compWidth: 290 });
  store.getState().updateCurrentPage({ mergedCells: [{ t: 2, b: 2, l: 2, r: 4 }] });
  const before = freezeSetup();
  store.getState().insertSheetColumns(3, 2);
  assert.deepEqual(fieldNode(field).style.cellRange, { t: 2, b: 2, l: 2, r: 6 });
  assert.equal(fieldNode(field).style.compWidth, 450);
  assert.equal(fieldNode(field).style.compLeft, 50);
  assert.deepEqual(currentPage().mergedCells, [{ t: 2, b: 2, l: 2, r: 6 }]);
  store.getState().undoCanvasChange();
  assert.deepEqual(store.getState().document, before);
  store.getState().insertSheetColumns(5, 1);
  assert.deepEqual(fieldNode(field), before.canvas.pages[0].nodes[0]);
  assert.equal(store.getState().canRedoCanvasChange(), false, 'a new command clears the former redo branch');
});

for (const [name, at, count, left, right, anchor, offset] of [
  ['before', 2, 1, 3, 6, 3, 2],
  ['inside', 4, 2, 2, 7, 2, 4],
]) test(`inserting ${name} a subtable keeps its region, record group and actual field offsets aligned`, () => {
  reset();
  const table = store.getState().addField('subTable', '报工明细');
  const [quantity] = store.getState().addSubTableFields(table.id, [{ name: '数量', type: 'number' }]);
  const range = { t: 4, b: 6, l: 2, r: 5 };
  store.getState().addSubTableRegionFromFieldToRange(table.id, range, { left: 50, top: 90, width: 380, height: 90 });
  const tableNode = fieldNode(table);
  store.getState().setSubTableRecordTemplateFromRange(tableNode.id, { t: 4, b: 4, l: 2, r: 5 });
  store.getState().addNodeFromSubTableFieldToCell(table.id, quantity, { range: { t: 4, b: 4, l: 4, r: 4 }, left: 220, top: 90, width: 120, height: 30 });
  store.getState().setProjectionBindings([{ id: 'detail', modelId: 'production', enabled: true, tableId: table.id, sources: { goodQuantity: quantity.id } }]);
  const before = freezeSetup();
  store.getState().insertSheetColumns(at, count);
  const after = structuredClone(store.getState().document);
  const region = fieldNode(table).bindings.subTableRegion;
  assert.deepEqual(fieldNode(table).style.cellRange, { t: 4, b: 6, l: left, r: right });
  assert.deepEqual(region.ranges[0].range, { t: 4, b: 6, l: left, r: right });
  assert.deepEqual(region.recordTemplate.groupRange, { t: 4, b: 4, l: left, r: right });
  assert.equal(region.recordTemplate.anchor.col, anchor);
  assert.equal(region.recordTemplate.fields.find(item => item.fieldId === quantity.id).colOffset, offset);
  assert.deepEqual(after.model, before.model);
  assert.equal(store.getState().undoStack.length, 1);
  store.getState().undoCanvasChange();
  assert.deepEqual(store.getState().document, before);
  store.getState().redoCanvasChange();
  assert.deepEqual(store.getState().document, after);
});

test('nested bound nodes move recursively and free components without a cell anchor keep their position', () => {
  const field = reset();
  const child = structuredClone(fieldNode(field));
  store.getState().removeNode(child.id);
  store.getState().insertNode(null, { id: 'container', type: 'container', props: {}, bindings: {}, style: { compLeft: 12 }, children: [child] });
  store.getState().insertNode(null, { id: 'free', type: 'static-text', props: {}, bindings: {}, style: { compLeft: 75, compWidth: 90 }, children: [] });
  const before = freezeSetup();
  store.getState().insertSheetColumns(1, 1);
  const [container, free] = currentPage().nodes;
  assert.equal(container.style.compLeft, 12);
  assert.deepEqual(container.children[0].style.cellRange, { t: 2, b: 2, l: 4, r: 4 });
  assert.equal(container.children[0].style.compLeft, child.style.compLeft + 80);
  assert.deepEqual(free, before.canvas.pages[0].nodes[1]);
});
