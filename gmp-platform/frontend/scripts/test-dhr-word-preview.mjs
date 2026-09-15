import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = resolve(import.meta.dirname, '..');
const result = await build({
  absWorkingDir: root,
  entryPoints: ['src/pages/master-data/DhrTemplateWorkspaceDialog.tsx'],
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  plugins: [{ name: 'api-boundary', setup(plugin) {
    plugin.onResolve({ filter: /(?:^@\/api\/client$|^\.\/client$)/ }, () => ({ path: 'client', namespace: 'stub' }));
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default {};', loader: 'js' }));
  } }],
});
const sandbox = { module: { exports: {} }, require: createRequire(import.meta.url), console };
sandbox.exports = sandbox.module.exports;
vm.runInNewContext(result.outputFiles[0].text, sandbox);
const { FormCanvasPreview } = sandbox.module.exports;

function page(overrides = {}) {
  return {
    id: 'word', name: 'Word 表单', nodes: [], cells: {}, mergedCells: [], medias: [], images: [],
    sheet: { rowCount: 1, columnCount: 1, rowHeights: [32], columnWidths: [650],
      canvasMode: 'paper', paperMode: 'free', paperOrientation: 'portrait',
      paperMarginTopMm: 15, paperMarginRightMm: 15, paperMarginBottomMm: 15, paperMarginLeftMm: 15 },
    ...overrides,
  };
}
function render(canvasPage, props = {}) {
  const document = { canvas: { pages: [canvasPage], currentPageId: canvasPage.id }, model: { fields: [], groups: [] } };
  return renderToStaticMarkup(createElement(FormCanvasPreview, { document, ...props }));
}
const paragraph = { id: 'paragraph', type: 'paragraph', text: '内毒素检验记录', layout: { top: 0, left: 0, width: 650, height: 30 } };
const table = { id: 'table', type: 'table', borderEncodingVersion: 2,
  layout: { top: 40, left: 0, width: 650, height: 60 }, columnWidths: [300, 350], rowHeights: [30, 30],
  cells: [{ id: 'cell', row: 1, col: 1, rowSpan: 2, colSpan: 2, text: '检验项目及结果' }] };
function word(blocks) { return { source: 'docx', contentWidth: 650, contentHeight: 100, blocks }; }

test('Word-only content renders paragraphs and merged table cells without sheet nodes', () => {
  const html = render(page({ wordDocument: word([paragraph, table]) }));
  assert.match(html, /内毒素检验记录/);
  assert.match(html, /检验项目及结果/);
  assert.match(html, /grid-column:1\s*\/\s*span 2/);
  assert.match(html, /grid-row:1\s*\/\s*span 2/);
});

test('imported native Word text and images render at saved dimensions without duplicate paragraphs', () => {
  const html = render(page({ wordDocument: word([paragraph, table]), nodes: [
    { id: 'title', type: 'static-text', children: [], props: { text: '内毒素检验记录' }, bindings: {},
      style: { position: 'absolute', compLeft: 12, compTop: 0, compWidth: 450, compHeight: 30 } },
    { id: 'image', type: 'static-image', children: [], props: { src: '/word-image.png' }, bindings: {},
      style: { position: 'absolute', compLeft: 0, compTop: 110, compWidth: 120, compHeight: 60 } },
  ] }));
  assert.equal(html.split('内毒素检验记录').length - 1, 1);
  assert.match(html, /检验项目及结果/);
  assert.match(html, /src="\/word-image.png"/);
  assert.match(html, /width:450px/);
});

test('Word table field markers render inline and do not leak internal marker text', () => {
  const html = render(page({ wordDocument: word([{ ...table, cells: [{ ...table.cells[0], text: '结果：\uE000field:result\uE001' }] }]), nodes: [
    { id: 'result', type: 'input', children: [], props: { placeholder: '填写结果' }, bindings: {},
      style: { position: 'absolute', wordTableCell: { blockId: 'table', cellId: 'cell' }, compWidth: 100, compHeight: 24 } },
  ] }));
  assert.match(html, /结果：/);
  assert.match(html, /填写结果/);
  assert.doesNotMatch(html, /\uE000|\uE001/);
});

test('legacy DOC and Excel grid previews still render their stored cells', () => {
  for (const name of ['legacy.doc', 'sheet.xls', 'sheet.xlsx']) {
    const html = render(page({ name, sheet: { ...page().sheet, paperMode: 'grid' }, cells: { '1:1': { value: name } } }));
    assert.ok(html.includes(name));
  }
});

test('explicit field-list layout remains available for Word documents', () => {
  const html = render(page({ wordDocument: word([paragraph]) }), { layout: 'fields' });
  assert.doesNotMatch(html, /内毒素检验记录/);
});
