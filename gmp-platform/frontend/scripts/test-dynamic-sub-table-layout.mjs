import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const result = await build({ entryPoints: [fileURLToPath(new URL('../src/pages/master-data/template-designer-react/utils/dynamicSubTableLayout.ts', import.meta.url))], bundle: true, write: false, platform: 'node', format: 'cjs' });
const scope = { module: { exports: {} } }; scope.exports = scope.module.exports;
vm.runInNewContext(result.outputFiles[0].text, scope);
const { buildDynamicSubTablePage } = scope.module.exports;
const json = (value) => JSON.parse(JSON.stringify(value));
function region(id, range) {
  return { id, type: 'sub-table', props: {}, children: [], style: { cellRange: range }, bindings: { fieldId: id, subTableRegion: { ranges: [{ pageId: 'p', range, order: 1 }], repeat: { type: 'dynamic' }, recordTemplate: { anchor: { row: range.t, col: range.l }, direction: 'row', fields: [] } } } };
}
function fixture() {
  const cells = {};
  for (let row = 1; row <= 6; row++) for (let col = 1; col <= 4; col++) cells[`${row}:${col}`] = { style: { backgroundColor: row === 3 ? '#eee' : '#fff' }, border: { left: true, bottom: true, right: true, color: '#123456' } };
  cells['5:1'].value = '领料人/日期';
  return { id: 'p', sheet: { rowCount: 6, columnCount: 4, rowHeights: [30, 36, 26, 42, 50, 32], columnWidths: [50, 100, 100, 80], defaultRowHeight: 32 }, cells,
    mergedCells: [{ t: 3, b: 4, l: 2, r: 3 }, { t: 5, b: 5, l: 1, r: 2 }],
    nodes: [region('details', { t: 3, b: 4, l: 1, r: 4 }), { id: 'serial', type: 'static-text', props: { commonComponentId: 'serial-number' }, style: { cellRange: { t: 3, b: 4, l: 1, r: 1 } }, bindings: { subTableId: 'details' }, children: [] }, { id: 'signature', type: 'signature', props: {}, style: { cellRange: { t: 5, b: 5, l: 3, r: 4 } }, bindings: { fieldId: 'signature' }, children: [] }],
    images: [{ id: 'image', mediaId: 'm', layout: { left: 0, top: 134, width: 50, height: 20 } }], medias: [],
  };
}
test('new records inherit multi-row heights, colors, borders and merged cells; footer and signature move together', () => {
  const page = fixture(); const before = JSON.stringify(page);
  const next = buildDynamicSubTablePage(page, { details: 3 });
  assert.equal(next.sheet.rowCount, 10);
  assert.deepEqual(json(next.sheet.rowHeights), [30, 36, 26, 42, 26, 42, 26, 42, 50, 32]);
  assert.equal(next.cells['9:1'].value, '领料人/日期');
  for (const row of [3, 5, 7]) {
    assert.equal(next.cells[`${row}:1`].style.backgroundColor, '#eee');
    assert.equal(next.cells[`${row}:1`].border.bottom, true);
    assert.equal(next.cells[`${row}:1`].border.color, '#123456');
    assert.ok(next.mergedCells.some((range) => range.t === row && range.b === row + 1 && range.l === 2 && range.r === 3));
  }
  assert.equal(next.nodes.find((node) => node.id === 'signature').style.cellRange.t, 9);
  assert.equal(next.images[0].layout.top, 270);
  assert.equal(next.nodes[0].bindings.subTableRegion.ranges[0].range.b, 4, 'record template must not grow with the runtime table');
  assert.equal(JSON.stringify(page), before);
});
test('deleting or resetting records shrinks the layout without modifying the template', () => {
  const page = fixture();
  assert.equal(buildDynamicSubTablePage(page, { details: 2 }).nodes[2].style.cellRange.t, 7);
  assert.equal(buildDynamicSubTablePage(page, { details: 1 }), page);
});
test('legacy text beneath a bound component is not repeated over the control', () => {
  const page = fixture();
  page.cells['3:1'].value = '旧序号文字';
  const next = buildDynamicSubTablePage(page, { details: 3 });
  for (const row of [3, 5, 7]) assert.equal(next.cells[`${row}:1`].value, undefined);
  assert.equal(page.cells['3:1'].value, '旧序号文字');
});
test('a boundary stored on the following row is inherited by every added record', () => {
  const page = fixture();
  page.cells['4:1'].border.bottom = false;
  page.cells['5:1'].border.top = true;
  const next = buildDynamicSubTablePage(page, { details: 3 });
  for (const row of [4, 6, 8]) assert.equal(next.cells[`${row}:1`].border.bottom, true);
});
test('multiple dynamic tables shift cumulatively, including their anchors and child nodes', () => {
  const page = fixture();
  page.nodes.push(region('second', { t: 6, b: 6, l: 1, r: 4 }));
  const next = buildDynamicSubTablePage(page, { details: 3, second: 2 });
  const second = next.nodes.at(-1);
  assert.equal(second.style.cellRange.t, 10);
  assert.equal(second.bindings.subTableRegion.recordTemplate.anchor.row, 10);
  assert.equal(next.sheet.rowCount, 11);
});
test('side-by-side dynamic tables share the added sheet rows', () => {
  const page = fixture();
  page.nodes = [region('left', { t: 3, b: 4, l: 1, r: 2 }), region('right', { t: 3, b: 4, l: 3, r: 4 })];
  page.mergedCells = [];
  const next = buildDynamicSubTablePage(page, { left: 2, right: 3 });
  assert.equal(next.sheet.rowCount, 10);
  assert.equal(next.cells['9:1'].value, '领料人/日期');
});
