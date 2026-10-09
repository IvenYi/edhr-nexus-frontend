import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fixedTableDocument, controlsDocument } from './test-dhr-word-preview.mjs';

const result = await build({
  absWorkingDir: resolve(import.meta.dirname, '..'),
  entryPoints: ['src/pages/master-data/template-designer-react/components/form-preview/FormDocumentPreview.tsx'],
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  plugins: [{ name: 'api-boundary', setup(plugin) {
    plugin.onResolve({ filter: /(?:^@\/api\/client$|^\.\/client$)/ }, () => ({ path: 'client', namespace: 'stub' }));
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default {};', loader: 'js' }));
  } }],
});
const nodeRequire = createRequire(import.meta.url);
const sandbox = { module: { exports: {} }, require: specifier => {
  const loaded = nodeRequire(specifier);
  return specifier.startsWith('@mui/icons-material/') ? loaded.default ?? loaded : loaded;
}, console };
sandbox.exports = sandbox.module.exports;
vm.runInNewContext(result.outputFiles[0].text, sandbox);
const { default: FormDocumentPreview, bindFormPreviewField } = sandbox.module.exports;
const render = (document, runtime, fieldPermissions) => renderToStaticMarkup(createElement(FormDocumentPreview, { document, runtime, fieldPermissions }));

test('execution uses the same initial subtable row, serial, placeholders and frame as template preview', () => {
  const document = fixedTableDocument('dynamic');
  const preview = render(document);
  const execution = render(document, { values: {}, disabled: true, onChange() { throw new Error('read-only preview wrote values'); } });
  for (const html of [preview, execution]) {
    assert.equal((html.match(/data-mock-fill-field-cell="true"/g) ?? []).length, 3);
    assert.match(html, /data-cell-display-component="serial-number"/);
    assert.match(html, />1<\/span>/);
    assert.match(html, /placeholder="数量"/);
    assert.match(html, /data-mock-fill-sub-table-frame="true"/);
    assert.match(html, /width:794px/);
    assert.match(html, /min-height:1123px/);
    assert.doesNotMatch(html, /data-mock-fill-sub-table-add-row/);
  }
});

test('runtime renders every persisted record in its template cells, with real values', () => {
  const document = fixedTableDocument('dynamic');
  const html = render(document, { values: { 'inspection-table': [{ quantity: '10', result: 'pass' }, { quantity: '12', result: 'fail' }] }, onChange() {} });
  assert.equal((html.match(/data-mock-fill-field-cell="true"/g) ?? []).length, 6);
  assert.match(html, /value="10"/);
  assert.match(html, /value="12"/);
  assert.match(html, />2<\/span>/);
  assert.match(html, /data-mock-fill-sub-table-add-row/);
  assert.match(html, /data-mock-fill-sub-table-remove-row/);
});

test('readonly table permissions hide row actions and prevent edits', () => {
  const document = fixedTableDocument('dynamic');
  const html = render(document, { values: {}, onChange() {} }, { 'inspection-table': 'READ_ONLY' });
  assert.doesNotMatch(html, /data-mock-fill-sub-table-add-row|data-mock-fill-sub-table-remove-row/);
  assert.match(html, /readonly=""/);
});

test('signature placeholder matches preview while real saved signatures are preserved', () => {
  const document = controlsDocument();
  const empty = render(document, { values: {}, disabled: true, onChange() {} });
  assert.match(empty, /点击签名/);
  assert.match(empty, /border-style:dashed/);
  assert.doesNotMatch(empty, /执行签署动作后自动记录/);
  const saved = render(document, { values: { signature: '操作员甲 · 2026-09-17T10:00:00 · signature-id' }, disabled: true, onChange() {} });
  assert.match(saved, /操作员甲/);
});

test('signature callbacks carry field and row identity while readonly previews stay inert', () => {
  const requests = [];
  const field = { id: 'signature', type: 'signature' };
  const runtime = { values: {}, signaturePermissions: { signature: 'EDIT', rows: 'EDIT' }, onChange() { throw Error('signature must not write values'); }, onSignatureRequest: target => requests.push(target) };
  const main = bindFormPreviewField(runtime, { bindings: {} }, field, 0, { signature: 'READ_ONLY' });
  main.onSignatureRequest();
  const row = bindFormPreviewField(runtime, { bindings: { subTableId: 'rows' } }, field, 2, { rows: 'EDIT' });
  row.onSignatureRequest();
  assert.equal(JSON.stringify(requests), JSON.stringify([{ fieldId: 'signature' }, { fieldId: 'signature', tableId: 'rows', rowIndex: 2 }]));
  main.onChange('signature', 'forged');
  assert.equal(bindFormPreviewField({ ...runtime, disabled: true }, { bindings: {} }, field, 0).onSignatureRequest, undefined);
  assert.equal(bindFormPreviewField(runtime, { bindings: { readonly: true } }, field, 0).onSignatureRequest, undefined);
  const html = render(controlsDocument(), { ...runtime, values: { signature: 'Old signed name' }, signaturesInvalidated: true });
  assert.doesNotMatch(html, /Old signed name/);
  assert.match(html, /点击签名/);
});

test('runtime keeps references as records and shows their names in the paper controls', () => {
  const document = controlsDocument();
  document.model.fields[0].type = 'reference';
  document.model.fields[0].name = '物料名称';
  const value = { id: 'material-1', name: '无菌导管' };
  const readonly = render(document, { values: { text: value }, disabled: true, onChange() {} });
  assert.match(readonly, /value="无菌导管"/);
  assert.match(readonly, /placeholder="物料名称"/);
  assert.doesNotMatch(readonly, /\[object Object\]/);
  const editable = render(document, { values: { text: value }, onChange() {}, references: async () => [] });
  assert.match(editable, /role="combobox"/);
  assert.match(editable, /placeholder="物料名称"/);
  assert.equal(bindFormPreviewField({ values: { text: value }, onChange() {} }, document.canvas.pages[0].nodes[0], document.model.fields[0], 0).values.text, value);
});

test('production does not seed simulation defaults or enable disabled choices', () => {
  const document = controlsDocument();
  const field = document.model.fields.find(field => field.id === 'multiSelect');
  field.typeConfig.options = [{ value: 'active', label: '可用选项' }, { value: 'inactive', label: '停用选项', status: 'disabled' }];
  const html = render(document, { values: {}, onChange() {} });
  assert.doesNotMatch(html, /value="预填值"|停用选项/);
  assert.match(html, /可用选项/);
  field.typeConfig.options = [];
  assert.doesNotMatch(render(document, { values: {}, onChange() {} }), /选项1|选项2/);
});

test('field binding updates only the chosen record and preserves other values', () => {
  const writes = [];
  const values = { title: '原值', rows: [{ quantity: '10', other: '保留' }, { quantity: '12' }] };
  const runtime = { values, onChange: (id, value) => writes.push({ id, value }) };
  const field = { id: 'quantity', type: 'number' };
  const node = { bindings: { subTableId: 'rows' } };
  bindFormPreviewField(runtime, node, field, 1).onChange('quantity', '22');
  assert.equal(JSON.stringify(writes), JSON.stringify([{ id: 'rows', value: [{ quantity: '10', other: '保留' }, { quantity: '22' }] }]));
  assert.equal(values.rows[1].quantity, '12');
  bindFormPreviewField(runtime, { bindings: {} }, { id: 'title', type: 'text' }, 0).onChange('title', '新值');
  assert.deepEqual(writes[1], { id: 'title', value: '新值' });
});

test('readonly, disabled, parent-table permissions and signatures never write values', () => {
  const runtime = { values: {}, onChange() { throw new Error('unauthorized write'); } };
  const field = { id: 'quantity', type: 'number' };
  const node = { bindings: { subTableId: 'rows' } };
  bindFormPreviewField(runtime, node, field, 0, { rows: 'READ_ONLY' }).onChange(field.id, '10');
  bindFormPreviewField(runtime, node, field, 0, { quantity: 'READ_ONLY' }).onChange(field.id, '10');
  bindFormPreviewField({ ...runtime, disabled: true }, node, field, 0).onChange(field.id, '10');
  bindFormPreviewField(runtime, { bindings: { readonly: true } }, field, 0).onChange(field.id, '10');
  bindFormPreviewField(runtime, node, { id: 'signature', type: 'signature' }, 0).onChange('signature', '伪造签名');
});
