import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const base = 'src/pages/master-data/template-designer-react';
const result = await build({
  stdin: { contents: `export * from './${base}/store/useTemplateDesignerStore'; export * from './${base}/registry/commonComponentRegistry'; export { MockFillPage } from './${base}/components/mock-fill/MockFillDialog'; export * from './src/components/form-renderer/FormRuntimeField';`, resolveDir: fileURLToPath(new URL('..', import.meta.url)), loader: 'tsx' },
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', external: ['@mui/icons-material'], logLevel: 'silent',
  plugins: [{ name: 'presentation-test', setup(plugin) {
    plugin.onResolve({ filter: /^@mui\/icons-material\// }, ({ path }) => ({ path: path.split('/').at(-1), namespace: 'icon' }));
    plugin.onLoad({ filter: /.*/, namespace: 'icon' }, ({ path }) => ({ contents: `export { ${path} as default } from '@mui/icons-material';` }));
    plugin.onLoad({ filter: /MockFillDialog\.tsx$/ }, async ({ path }) => ({ contents: `${await readFile(path, 'utf8')}\nexport { MockFillPage };`, loader: 'tsx' }));
    plugin.onResolve({ filter: /^@\/api\/(files|identity)$/ }, () => ({ path: 'api', namespace: 'stub' }));
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const getFilePreviewBlob = () => {}; export const verifyCurrentUserSignaturePassword = () => {};' }));
  } }],
});
const sandbox = { module: { exports: {} }, require: createRequire(import.meta.url), console, structuredClone };
sandbox.exports = sandbox.module.exports;
vm.runInNewContext(result.outputFiles[0].text, sandbox);
const { useTemplateDesignerStore: store, cellDisplayComponentIds, isCellDisplayComponent, MockFillPage, FormRuntimeField, FormRuntimeContext, SubTableDisplayNodesContext } = sandbox.module.exports;
const layout = (range) => ({ left: 0, top: 30, width: 50, height: 30, range });
const cell = { t: 2, b: 2, l: 1, r: 1 };
function reset() {
  store.getState().setDocument({
    meta: { schema: 'edhr-template-designer-react', version: 1, templateId: 'test', versionId: 'test', templateName: 'test', versionLabel: 'V1' },
    model: { fields: [{ id: 'details', name: '明细', type: 'subTable', status: 'enabled', typeConfig: { columns: [{ id: 'item', name: '物料', type: 'text', status: 'enabled', typeConfig: {} }] } }], groups: [] },
    canvas: { currentPageId: 'page', pages: [{ id: 'page', name: '测试', sheet: { canvasMode: 'sheet', rowCount: 5, columnCount: 3, rowHeights: Array(5).fill(30), columnWidths: [50, 150, 150], showGridLines: true }, images: [], medias: [], mergedCells: [], cells: { '2:1': { value: '旧文字', border: { bottom: true } } }, nodes: [{ id: 'region', type: 'sub-table', children: [], props: {}, style: { position: 'absolute', cellRange: { t: 2, b: 2, l: 1, r: 3 } }, bindings: { fieldId: 'details', subTableRegion: { fieldId: 'details', ranges: [{ pageId: 'page', order: 1, range: { t: 2, b: 2, l: 1, r: 3 } }], repeat: { type: 'dynamic' }, recordTemplate: { direction: 'row', anchor: { row: 2, col: 1 }, fields: [] }, presentation: {} } } }] }] },
    workflow: { nodes: [], edges: [], config: {} },
  });
}
const documentNow = () => store.getState().document;
const serials = (html) => Array.from(html.matchAll(/data-cell-display-component="serial-number"[^]*?<span[^>]*>(\d+)<\/span>/g), (match) => Number(match[1]));

test('catalogue only opens supported cell components', () => {
  assert.deepEqual(Array.from(cellDisplayComponentIds), ['text', 'image', 'header-columns', 'superscript', 'line', 'serial-number']);
  for (const id of ['table', 'page-number', 'barcode', 'qr-code', 'time-difference']) assert.equal(isCellDisplayComponent(id), false);
});

test('placing each component binds it to the sub-table without adding business fields; undo restores text', () => {
  for (const id of cellDisplayComponentIds) {
    reset();
    const before = JSON.stringify(documentNow());
    store.getState().addCommonComponentToCell(id, layout(cell));
    const after = JSON.stringify(documentNow());
    const page = documentNow().canvas.pages[0];
    assert.equal(page.nodes.at(-1).bindings.subTableId, 'details');
    assert.equal(page.cells['2:1'].value, undefined);
    assert.equal(page.cells['2:1'].border.bottom, true);
    assert.equal(documentNow().model.fields.length, 1);
    assert.equal(documentNow().model.fields[0].typeConfig.columns.length, 1);
    store.getState().undoCanvasChange();
    assert.equal(JSON.stringify(documentNow()), before);
    store.getState().redoCanvasChange();
    assert.equal(JSON.stringify(documentNow()), after);
  }
});

test('replacing a component does not stack nodes, and crossing the sub-table boundary is rejected', () => {
  reset();
  store.getState().addCommonComponentToCell('serial-number', layout(cell));
  store.getState().addCommonComponentToCell('text', layout(cell));
  assert.equal(documentNow().canvas.pages[0].nodes.length, 2);
  const before = JSON.stringify(documentNow());
  assert.throws(() => store.getState().addCommonComponentToCell('serial-number', layout({ ...cell, b: 3 })), /子表边界/);
  assert.equal(JSON.stringify(documentNow()), before);
});

test('ordinary cells keep display components after document serialization and reload', () => {
  reset();
  store.getState().addCommonComponentToCell('text', layout({ t: 5, b: 5, l: 1, r: 2 }));
  const node = documentNow().canvas.pages[0].nodes.at(-1);
  store.getState().updateNodeProps(node.id, { text: '领料说明' });
  const saved = JSON.stringify(documentNow());
  store.getState().setDocument(JSON.parse(saved));
  const restored = documentNow().canvas.pages[0].nodes.at(-1);
  assert.equal(restored.props.text, '领料说明');
  assert.equal(restored.props.commonComponentId, 'text');
  assert.equal(restored.bindings.subTableId, undefined);
  assert.equal(JSON.stringify(documentNow()), saved);
});

test('mock dynamic rows render contiguous serials after adding and deleting records', () => {
  reset();
  store.getState().addCommonComponentToCell('serial-number', layout(cell));
  for (const count of [1, 3, 2]) {
    const doc = documentNow();
    const html = renderToStaticMarkup(React.createElement(MockFillPage, { page: doc.canvas.pages[0], document: doc, values: {}, subTableRecordCounts: { region: count }, onValueChange() {}, onSignatureRequest() {}, onAddSubTableRecord() {}, onRemoveSubTableRecord() {} }));
    assert.deepEqual(serials(html), Array.from({ length: count }, (_, index) => index + 1));
  }
});

test('actual runtime rows render derived serials without writing serial values into records', () => {
  reset();
  store.getState().addCommonComponentToCell('serial-number', layout(cell));
  const doc = documentNow();
  for (const rows of [[{ item: 'A' }, { item: 'B' }, { item: 'C' }], [{ item: 'A' }, { item: 'C' }]]) {
    const html = renderToStaticMarkup(React.createElement(SubTableDisplayNodesContext.Provider, { value: doc.canvas.pages[0].nodes },
      React.createElement(FormRuntimeContext.Provider, { value: { values: { details: rows }, onChange() { assert.fail('presentation must not write values'); } } },
        React.createElement(FormRuntimeField, { field: doc.model.fields[0] }))));
    assert.deepEqual(serials(html), rows.map((_, index) => index + 1));
    assert.ok(rows.every((row) => Object.keys(row).length === 1));
  }
});
