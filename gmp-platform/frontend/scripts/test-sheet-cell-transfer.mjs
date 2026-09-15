import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const tempDir = await mkdtemp(path.join(os.tmpdir(), 'sheet-cell-transfer-'));
const require = createRequire(import.meta.url);
async function load(relativePath, name) {
  const outfile = path.join(tempDir, `${name}.cjs`);
  await build({ entryPoints: [fileURLToPath(new URL(relativePath, import.meta.url))], outfile, bundle: true, platform: 'node', format: 'cjs', logLevel: 'silent' });
  return require(outfile);
}
const { applySheetCells, captureSheetCells, getSheetFillRange } = await load('../src/pages/master-data/template-designer-react/utils/sheetCellTransfer.ts', 'transfer');
const { useTemplateDesignerStore: store } = await load('../src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts', 'store');
await rm(tempDir, { recursive: true, force: true });

const source = { t: 1, l: 2, b: 1, r: 3 };
const createPage = () => ({
  id: 'page', name: 'test', nodes: [],
  sheet: { rowCount: 8, columnCount: 5, rowHeights: Array(8).fill(30), columnWidths: Array(5).fill(100) },
  cells: {
    '1:2': { value: '源文字', style: { fontWeight: 'bold', color: '#ff0000', backgroundColor: '#eee' }, border: { bottom: true, color: '#000' } },
    '1:3': { border: { right: true, color: '#000' } },
    '2:2': { value: '目标甲', style: { fontSize: 20 } },
    '2:3': { value: '目标乙' },
    '7:5': { value: '范围外' },
  },
  mergedCells: [source], images: [], medias: [],
});
const createDocument = (page) => ({
  meta: { schema: 'edhr-template-designer-react', version: 1, templateId: 'test', versionId: 'test', templateName: 'test', versionLabel: 'V1' },
  model: { groups: [], fields: [] },
  canvas: { currentPageId: page.id, pages: [page] },
  workflow: { nodes: [], edges: [], config: {} },
});

test('copy/paste preserves merged cells, text, styles and borders as an independent snapshot', () => {
  const page = createPage();
  const snapshot = captureSheetCells(page, source);
  page.cells['1:2'].value = '修改后的源文字';
  page.cells['1:2'].style.color = '#00f';
  const result = applySheetCells(page, snapshot, { t: 3, l: 2, b: 3, r: 3 });
  assert.deepEqual(result.mergedCells, [source, { t: 3, l: 2, b: 3, r: 3 }]);
  assert.equal(result.cells['3:2'].value, '源文字');
  assert.equal(result.cells['3:2'].style.color, '#ff0000');
  assert.deepEqual(result.cells['3:3'].border, page.cells['1:3'].border);
  assert.equal(page.cells['3:2'], undefined);
});

test('empty merged cells still paste their structure', () => {
  const page = createPage();
  page.cells = {};
  const result = applySheetCells(page, captureSheetCells(page, source), { t: 2, l: 2, b: 2, r: 3 });
  assert.deepEqual(result.mergedCells[1], { t: 2, l: 2, b: 2, r: 3 });
});

test('fill repeats format and horizontal merges, preserves target text and does not mutate the source', () => {
  const page = createPage();
  const before = structuredClone(page);
  const result = applySheetCells(page, captureSheetCells(page, source), getSheetFillRange(source, 4, 8), true);
  assert.equal(result.mergedCells.length, 4);
  assert.deepEqual(result.cells['2:2'].style, page.cells['1:2'].style);
  assert.equal(result.cells['2:2'].value, '目标甲\n目标乙');
  assert.equal(result.cells['2:3'].value, undefined);
  assert.equal(result.cells['3:2'].value, undefined);
  assert.deepEqual(result.cells['7:5'], page.cells['7:5']);
  assert.deepEqual(page, before);
});

test('vertical merge patterns fill complete blocks and never exceed the last row', () => {
  const page = createPage();
  const vertical = { t: 1, l: 2, b: 2, r: 3 };
  page.mergedCells = [vertical];
  const target = getSheetFillRange(vertical, 5, 7);
  assert.deepEqual(target, { t: 3, l: 2, b: 6, r: 3 });
  const result = applySheetCells(page, captureSheetCells(page, vertical), target, true);
  assert.deepEqual(result.mergedCells, [vertical, { t: 3, l: 2, b: 4, r: 3 }, { t: 5, l: 2, b: 6, r: 3 }]);
  assert.equal(getSheetFillRange(vertical, 2, 8), null);
  assert.equal(getSheetFillRange({ t: 7, l: 2, b: 8, r: 3 }, 9, 8), null);
});

test('unmerged source removes target merges and obsolete formatting', () => {
  const page = createPage();
  const snapshot = captureSheetCells(page, { t: 3, l: 2, b: 3, r: 3 });
  const result = applySheetCells(page, snapshot, source, true);
  assert.deepEqual(result.mergedCells, []);
  assert.deepEqual(result.cells['1:2'], { value: '源文字' });
});

test('partial source/target merges and out-of-bounds paste reject atomically', () => {
  const page = createPage();
  const before = structuredClone(page);
  assert.throws(() => captureSheetCells(page, { t: 1, l: 2, b: 1, r: 2 }), /完整选中/);
  const snapshot = captureSheetCells(page, source);
  page.mergedCells.push({ t: 2, l: 1, b: 2, r: 3 });
  assert.throws(() => applySheetCells(page, snapshot, { t: 2, l: 2, b: 2, r: 3 }), /跨越/);
  assert.throws(() => applySheetCells(page, snapshot, { t: 8, l: 5, b: 8, r: 6 }), /边界/);
  assert.deepEqual(page.cells, before.cells);
});

test('merge changes do not hide or delete bound fields', () => {
  const page = createPage();
  page.nodes = [{ id: 'field', type: 'input', style: { cellRange: { t: 2, l: 3, b: 2, r: 3 } }, props: {}, bindings: { fieldId: 'field' } }];
  const before = structuredClone(page);
  assert.throws(() => applySheetCells(page, captureSheetCells(page, source), { t: 2, l: 2, b: 2, r: 3 }, true), /已有字段/);
  assert.deepEqual(page, before);
});

test('paste and drag each create one undo step; redo restores the whole operation', () => {
  store.getState().setDocument(createDocument(createPage()));
  const before = structuredClone(store.getState().document);
  store.getState().fillSheetCellStyles(source, 4);
  const filled = structuredClone(store.getState().document);
  assert.equal(store.getState().undoStack.length, 1);
  assert.equal(store.getState().getCurrentPage().mergedCells.length, 4);
  store.getState().undoCanvasChange();
  assert.deepEqual(store.getState().document, before);
  store.getState().redoCanvasChange();
  assert.deepEqual(store.getState().document, filled);
  store.getState().pasteSheetCells(captureSheetCells(createPage(), source), 6, 2);
  assert.equal(store.getState().undoStack.length, 2);
  store.getState().undoCanvasChange();
  assert.deepEqual(store.getState().document, filled);
});

test('external plain text paste keeps its existing TSV behavior', () => {
  store.getState().setDocument(createDocument(createPage()));
  store.getState().pasteCellsFromText(4, 2, '外部\t数据\n第二行\t值');
  const page = store.getState().getCurrentPage();
  assert.equal(page.cells['4:2'].value, '外部');
  assert.equal(page.cells['5:3'].value, '值');
  assert.deepEqual(page.mergedCells, [source]);
});
