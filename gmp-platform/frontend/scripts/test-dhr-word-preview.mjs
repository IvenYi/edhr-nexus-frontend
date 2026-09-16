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
const nodeRequire = createRequire(import.meta.url);
const sandbox = { module: { exports: {} }, require: (specifier) => {
  const loaded = nodeRequire(specifier);
  return specifier.startsWith('@mui/icons-material/') ? loaded.default ?? loaded : loaded;
}, console };
sandbox.exports = sandbox.module.exports;
vm.runInNewContext(result.outputFiles[0].text, sandbox);
const { FormCanvasPreview, DeferredFormPreview } = sandbox.module.exports;

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
  const { fields = [], ...previewProps } = props;
  const document = { canvas: { pages: [canvasPage], currentPageId: canvasPage.id }, model: { fields, groups: [] } };
  return renderToStaticMarkup(createElement(FormCanvasPreview, { document, ...previewProps }));
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


test('full-page sheet preview keeps portrait paper and configured margins around the grid', () => {
  const html = render(page({ cells: { '1:1': { value: '物料领用单' } } }), { fullPage: true });
  assert.match(html, /data-form-preview-paper="word"/);
  assert.match(html, /width:794px/);
  assert.match(html, /min-height:1123px/);
  assert.match(html, /padding-left:57px/);
  assert.match(html, /grid-template-columns:650px/);
});

test('full-page landscape preview retains narrow columns and short rows from the designer', () => {
  const html = render(page({
    sheet: { ...page().sheet, paperOrientation: 'landscape', columnCount: 2, columnWidths: [18, 650], rowHeights: [18] },
    cells: { '1:1': { value: '序号' } },
  }), { fullPage: true });
  assert.match(html, /width:1123px/);
  assert.match(html, /min-height:794px/);
  assert.match(html, /grid-template-columns:18px 650px/);
  assert.match(html, /grid-template-rows:18px/);
});

test('full-page paper grows with oversized content and preserves fields and images', () => {
  const html = render(page({
    sheet: { ...page().sheet, columnWidths: [1200], rowHeights: [1300] },
    cells: { '1:1': { value: '表单内容' } },
    nodes: [{ id: 'field', type: 'input', props: { placeholder: '填写备注' }, bindings: { fieldId: 'note' }, children: [],
      style: { position: 'absolute', cellRange: { t: 1, l: 1, b: 1, r: 1 } } }],
    medias: [{ id: 'image', src: '/sample-logo.png' }],
    images: [{ id: 'logo', mediaId: 'image', layout: { left: 10, top: 20, width: 40, height: 30 } }],
  }), { fullPage: true, fields: [{ id: 'note', name: '备注', type: 'text', typeConfig: {} }] });
  assert.match(html, /width:1314px/);
  assert.match(html, /min-height:1414px/);
  assert.match(html, /src="\/sample-logo.png"/);
  assert.match(html, /填写备注/);
});

function previewCellStyle(html, key) {
  const tag = html.match(new RegExp(`<div[^>]*data-form-preview-cell="${key}"[^>]*>`))?.[0];
  const className = tag?.match(/class="([^"]+)"/)?.[1].split(' ').find((name) => name.startsWith('css-'));
  assert.ok(className, `preview cell ${key} must render`);
  return html.match(new RegExp(`\\.${className}\\{([^}]+)\\}`))?.[1] ?? '';
}

function borderedSheet(overrides = {}) {
  return page({
    sheet: { ...page().sheet, rowCount: 2, columnCount: 2, columnWidths: [100, 100], rowHeights: [30, 30], showGridLines: true },
    cells: Object.fromEntries(['1:1', '1:2', '2:1', '2:2'].map((key) => [key, { value: key, border: { top: true, right: true, bottom: true, left: true, color: '#000000' } }])),
    ...overrides,
  });
}

test('sheet preview draws shared horizontal and vertical borders only once', () => {
  const html = render(borderedSheet(), { fullPage: true });
  const first = previewCellStyle(html, '1:1');
  assert.doesNotMatch(first, /border-(right|bottom):1px solid #000000/);
  assert.match(first, /border-left:1px solid #000000/);
  assert.match(first, /border-top:1px solid #000000/);
  assert.match(previewCellStyle(html, '1:2'), /border-left:1px solid #000000/);
  assert.match(previewCellStyle(html, '2:1'), /border-top:1px solid #000000/);
  assert.match(previewCellStyle(html, '2:2'), /border-right:1px solid #000000/);
  assert.match(previewCellStyle(html, '2:2'), /border-bottom:1px solid #000000/);
});

test('merged-cell borders use visible neighbor anchors and retain uncovered edges', () => {
  const merged = borderedSheet({ mergedCells: [{ t: 1, l: 2, b: 2, r: 2 }] });
  delete merged.cells['2:2'];
  const html = render(merged, { fullPage: true });
  assert.doesNotMatch(previewCellStyle(html, '2:1'), /border-right:1px solid #000000/);
  assert.doesNotMatch(html, /data-form-preview-cell="2:2"/);
  merged.cells['1:2'].border.left = false;
  const oneSided = render(merged, { fullPage: true });
  assert.match(previewCellStyle(oneSided, '1:1'), /border-right:1px solid #000000/);
  assert.match(previewCellStyle(oneSided, '2:1'), /border-right:1px solid #000000/);
});

test('sheet preview keeps explicit borders when background grid lines are hidden', () => {
  const fixture = borderedSheet();
  fixture.sheet.showGridLines = false;
  const html = render(fixture);
  assert.match(previewCellStyle(html, '1:1'), /border-right:1px solid transparent/);
  assert.match(previewCellStyle(html, '1:2'), /border-left:1px solid #000000/);
});


export function fixedTableDocument(repeat = 'fixed') {
  const quantity = { id: 'quantity', name: '数量', type: 'number', typeConfig: {} };
  const result = { id: 'result', name: '单项判定', type: 'singleSelect', typeConfig: { options: '符合:pass\n不符合:fail' } };
  const canvasPage = page({ id: 'inspection', name: '检验表',
    sheet: { ...page().sheet, rowCount: 3, columnCount: 3, rowHeights: [30, 30, 30], columnWidths: [70, 180, 240], defaultRowHeight: 30, defaultColumnWidth: 100, showGridLines: true },
    cells: Object.fromEntries(Array.from({ length: 3 }, (_, row) => Array.from({ length: 3 }, (_, col) => [`${row + 1}:${col + 1}`, { value: row ? '旧占位文字' : '', border: { top: true, right: true, bottom: true, left: true, color: '#000000' } }])).flat()),
  });
  const range = { t: 1, l: 1, b: repeat === 'fixed' ? 3 : 1, r: 3 };
  const groupRange = { t: 1, l: 1, b: 1, r: 3 };
  const node = (id, col, bindings, props = {}, type = 'input') => ({ id, type, props, bindings, children: [], style: { position: 'absolute', cellRange: { t: 1, l: col, b: 1, r: col } } });
  canvasPage.nodes = [
    { id: 'fixed-table', type: 'sub-table', props: {}, children: [], style: { cellRange: range }, bindings: { fieldId: 'inspection-table', subTableRegion: {
      id: 'region', fieldId: 'inspection-table', mode: 'record', ranges: [{ pageId: canvasPage.id, range, order: 1 }],
      repeat: { type: repeat, count: 3, stride: 1 },
      recordTemplate: { direction: 'row', anchor: { row: 1, col: 1 }, groupRange, fields: [] },
      presentation: { showHeader: false, showIndex: false, emptyText: '暂无数据', addEntry: 'bottom' },
    } } },
    node('serial', 1, { subTableId: 'inspection-table' }, { commonComponentId: 'serial-number', text: '1.' }, 'static-text'),
    node('quantity', 2, { subTableId: 'inspection-table', subTableFieldId: quantity.id, subTableField: quantity }),
    node('result', 3, { subTableId: 'inspection-table', subTableFieldId: result.id, subTableField: result }),
  ];
  return { meta: { templateName: '固定表验证', versionLabel: 'V1.0' }, canvas: { pages: [canvasPage], currentPageId: canvasPage.id }, model: { fields: [{ id: 'inspection-table', name: '检验明细', type: 'subTable', typeConfig: {} }], groups: [] } };
}

export function controlsDocument() {
  const types = ['text', 'number', 'datetime', 'singleSelect', 'multiSelect', 'signature', 'attachment', 'image'];
  const fields = types.map((type) => ({ id: type, name: type, type, typeConfig: { options: '符合:pass\n不符合:fail' } }));
  const canvasPage = page({ id: 'controls', name: '控件', sheet: { ...page().sheet, rowCount: types.length, rowHeights: types.map(() => 40), columnWidths: [650], defaultRowHeight: 40, defaultColumnWidth: 650 },
    cells: {}, nodes: types.map((type, index) => ({ id: type, type: 'input', props: {}, children: [], style: { position: 'absolute', cellRange: { t: index + 1, l: 1, b: index + 1, r: 1 } }, bindings: { fieldId: type, defaultValue: type === 'text' ? '预填值' : '', widgetConfig: type === 'multiSelect' ? { optionShape: 'checkbox' } : {} } })) });
  return { meta: { templateName: '控件验证', versionLabel: 'V1.0' }, canvas: { pages: [canvasPage], currentPageId: canvasPage.id }, model: { fields, groups: [] } };
}

function renderDocument(document) {
  return renderToStaticMarkup(createElement(FormCanvasPreview, { document, fullPage: true }));
}

test('full-page preview repeats every fixed-table field and serial number, clearing stale placeholders', () => {
  const html = renderDocument(fixedTableDocument());
  assert.equal((html.match(/data-mock-fill-field-cell="true"/g) ?? []).length, 9);
  assert.equal((html.match(/role="combobox"/g) ?? []).length, 3);
  assert.equal((html.match(/data-cell-display-component="serial-number"/g) ?? []).length, 3);
  assert.match(html, />3<\/span>/);
  assert.doesNotMatch(html, /旧占位文字/);
  assert.match(html, /data-mock-fill-sub-table-frame="true"/);
});

test('dynamic tables show the same initial record without preview row-edit actions', () => {
  const html = renderDocument(fixedTableDocument('dynamic'));
  assert.equal((html.match(/data-mock-fill-field-cell="true"/g) ?? []).length, 3);
  assert.doesNotMatch(html, /data-mock-fill-sub-table-add-row|data-mock-fill-sub-table-remove-row/);
});

test('preview renders real controls and default values without file inputs or signing dialog', () => {
  const html = renderDocument(controlsDocument());
  assert.match(html, /value="预填值"/);
  assert.match(html, /type="datetime-local"/);
  assert.match(html, /role="combobox"/);
  assert.match(html, /type="checkbox"/);
  assert.match(html, /点击签名/);
  assert.match(html, /点击上传/);
  assert.match(html, /readonly=""/);
  assert.doesNotMatch(html, /type="file"|data-mock-fill-signature-dialog/);
});

test('full-page preview stacks every sheet and preserves Word content in mixed documents', () => {
  const document = fixedTableDocument();
  document.canvas.pages.push(controlsDocument().canvas.pages[0], page({ wordDocument: word([paragraph]) }));
  const html = renderDocument(document);
  assert.equal((html.match(/data-form-preview-paper=/g) ?? []).length, 2);
  assert.match(html, /内毒素检验记录/);
  assert.doesNotMatch(html, /role="tab"/);
});


test('full-page preview retains field-list fallback for a template without canvas content', () => {
  const html = render(page(), { fullPage: true, fields: [{ id: 'fallback', status: 'enabled', groupId: 'default-group', name: '未排版字段', type: 'text', typeConfig: {} }] });
  assert.match(html, /未排版字段/);
});


test('cached form first renders a loading state before any document parsing', () => {
  const version = { id: 'cached', version: 'V1.0', get canvasDesignJson() { throw new Error('parsed before loading could paint'); } };
  const html = renderToStaticMarkup(createElement(DeferredFormPreview, { evidence: { id: 'form', formCode: 'F', formName: '表单' }, version }));
  assert.match(html, /正在加载表单…/);
  assert.match(html, /aria-busy="true"/);
  assert.doesNotMatch(html, /data-form-document-preview/);
});
