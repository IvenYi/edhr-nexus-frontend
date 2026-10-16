import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = path.resolve(import.meta.dirname, '..');
const baseline = process.env.W2_BASELINE_COMMIT;
if (baseline && !/^[0-9a-f]{40}$/.test(baseline)) throw new Error('W2_BASELINE_COMMIT must be a full commit SHA');
const result = await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
  export { useTemplateDesignerStore } from './src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
  export { createEmptyTemplateDesignerDocument, serializeTemplateDesignerDocument, parseReactTemplateDesignerDocument }
    from './src/pages/master-data/template-designer-react/utils/document';
  export { MockFillPreviewPage } from './src/pages/master-data/template-designer-react/components/mock-fill/MockFillDialog';
  export { default as FormDocumentPreview } from './src/pages/master-data/template-designer-react/components/form-preview/FormDocumentPreview';
  export { FormRuntimeField, FormRuntimeContext } from './src/components/form-renderer/FormRuntimeField';
` }, bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external', logLevel: 'silent',
plugins: [{ name: 'test-boundaries', setup(plugin) {
  plugin.onResolve({ filter: /(?:^@\/api\/client$|^\.\/client$)/ }, () => ({ path: 'client', namespace: 'stub' }));
  plugin.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default {};', loader: 'js' }));
  if (baseline) plugin.onLoad({ filter: /useTemplateDesignerStore\.ts$/ }, args => ({
    contents: execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/${path.relative(root, args.path)}`], { cwd: root, encoding: 'utf8' }),
    loader: 'ts', resolveDir: path.dirname(args.path),
  }));
} }] });
const nodeRequire = createRequire(import.meta.url);
const sandbox = { module: { exports: {} }, require: specifier => {
  const loaded = nodeRequire(specifier);
  return specifier.startsWith('@mui/icons-material/') ? loaded.default ?? loaded : loaded;
}, console, crypto: globalThis.crypto, structuredClone };
sandbox.exports = sandbox.module.exports;
vm.runInNewContext(result.outputFiles[0].text, sandbox);
const { useTemplateDesignerStore: store, createEmptyTemplateDesignerDocument: createDocument,
  serializeTemplateDesignerDocument: serialize, parseReactTemplateDesignerDocument: parse,
  MockFillPreviewPage, FormDocumentPreview, FormRuntimeField, FormRuntimeContext } = sandbox.module.exports;

function setup() {
  store.getState().setDocument(createDocument({ schema: 'edhr-template-designer-react', version: 1,
    templateId: 'test', versionId: 'version', templateName: '子列同步验证', versionLabel: 'V1' }));
  const trace = store.getState().addField('text', '追溯编号');
  store.getState().addNodeFromFieldToCell(trace.id, { range: { t: 7, b: 7, l: 2, r: 3 }, left: 98, top: 216, width: 196, height: 36 });
  const table = store.getState().addField('subTable', '检验明细');
  const [field] = store.getState().addSubTableFields(table.id, [{ name: '旧编号', type: 'text' }]);
  store.getState().addSubTableRegionFromFieldToRange(table.id, { t: 2, b: 5, l: 2, r: 5 }, { left: 98, top: 36, width: 392, height: 144 });
  store.getState().addNodeFromSubTableFieldToCell(table.id, field, { range: { t: 3, b: 3, l: 3, r: 4 }, left: 196, top: 72, width: 196, height: 36 });
  store.getState().setProjectionBindings([{ id: 'trace', modelId: 'formTrace', enabled: true, sources: { equipmentText: trace.id } }]);
  const document = store.getState().document;
  store.getState().setDocument(document);
  store.getState().markSaved();
  return { table, field };
}

function edit({ table, field }, patch) {
  const current = store.getState().document.model.fields.find(item => item.id === table.id);
  store.getState().updateField(table.id, { typeConfig: { ...current.typeConfig,
    columns: current.typeConfig.columns.map(item => item.id === field.id ? { ...item, ...patch } : item) } });
}
function child(document = store.getState().document) { return document.canvas.pages[0].nodes.find(node => node.bindings?.subTableFieldId); }
function column({ table, field }) { return store.getState().document.model.fields.find(item => item.id === table.id).typeConfig.columns.find(item => item.id === field.id); }

test('renaming or disabling the same model column updates its placed definition without changing identity or inventing visibility policy', () => {
  const target = setup();
  const before = structuredClone(store.getState().document);
  edit(target, { name: '新编号', description: '已更新说明', status: 'disabled' });
  const node = child();
  assert.equal(node.bindings.subTableField.name, '新编号');
  assert.equal(node.bindings.subTableField.status, 'disabled');
  assert.equal(node.bindings.subTableField.description, '已更新说明');
  assert.equal(node.props.label, '新编号');
  assert.equal(node.id, child(before).id);
  assert.equal(node.bindings.fieldId, target.field.id);
  assert.equal(node.bindings.subTableId, target.table.id);
  assert.equal(node.bindings.subTableFieldId, target.field.id);
  assert.equal(node.bindings.hidden, child(before).bindings.hidden, 'status synchronization does not add a hide rule');
  assert.equal(JSON.stringify(store.getState().document.model.projection), JSON.stringify(before.model.projection));
});

test('a changed column type uses the compatible component and clears only incompatible widget overrides', () => {
  const target = setup();
  store.getState().updateNodeBindings(child().id, { readonly: true, required: true, widgetConfig: { textMode: 'long' } });
  const before = structuredClone(child());
  edit(target, { name: '新数量', type: 'number', typeConfig: { numberMode: 'decimal', precision: 3, unit: '件' } });
  const node = child();
  assert.equal(node.type, 'inputdouble');
  assert.equal(node.bindings.subTableField.type, 'number');
  assert.equal(JSON.stringify(node.bindings.subTableField.typeConfig), JSON.stringify(column(target).typeConfig));
  assert.equal(JSON.stringify(node.bindings.widgetConfig), '{}');
  assert.equal(node.bindings.readonly, true);
  assert.equal(node.bindings.required, true);
  assert.equal(JSON.stringify(node.style), JSON.stringify(before.style));
});

test('compatible column edits retain explicit widget overrides and preserve the previous immutable definition', () => {
  const target = setup();
  store.getState().updateNodeBindings(child().id, { widgetConfig: { placeholder: '画布提示', autoWrap: true } });
  const previous = child();
  edit(target, { name: '新编号', typeConfig: { textMode: 'long' } });
  assert.equal(child().bindings.subTableField.typeConfig.textMode, 'long');
  assert.equal(JSON.stringify(child().bindings.widgetConfig), JSON.stringify(previous.bindings.widgetConfig));
  assert.equal(previous.bindings.subTableField.name, '旧编号');
  assert.equal(previous.props.label, '旧编号');
});

test('the same parent column updates on other pages and nested nodes without changing unrelated fields', () => {
  const target = setup();
  const document = structuredClone(store.getState().document);
  const otherPage = structuredClone(document.canvas.pages[0]);
  otherPage.id = 'other-page';
  const nested = { ...child(document), id: 'nested-column' };
  otherPage.nodes = [{ id: 'container', type: 'container', props: {}, bindings: {}, style: {}, children: [nested] }];
  document.canvas.pages.push(otherPage);
  store.getState().setDocument(document);
  const unrelated = store.getState().addField('text', '独立字段');
  store.getState().addNodeFromFieldToCell(unrelated.id, { range: { t: 8, b: 8, l: 2, r: 3 }, left: 98, top: 252, width: 196, height: 36 });
  const before = structuredClone(store.getState().document.canvas.pages[0].nodes.at(-1));
  edit(target, { name: '新编号' });
  assert.equal(child().bindings.subTableField.name, '新编号');
  assert.equal(store.getState().document.canvas.pages[1].nodes[0].children[0].bindings.subTableField.name, '新编号');
  assert.equal(JSON.stringify(store.getState().document.canvas.pages[0].nodes.at(-1)), JSON.stringify(before));
});

test('column edit is one complete undo step and serializes consistently without rewriting the former document', () => {
  const target = setup();
  const before = structuredClone(store.getState().document);
  edit(target, { name: '新数量', type: 'number', typeConfig: { numberMode: 'decimal', precision: 2 } });
  const after = structuredClone(store.getState().document);
  assert.equal(child(after).bindings.subTableField.type, 'number');
  assert.equal(store.getState().undoStack.length, 1);
  store.getState().undoCanvasChange();
  assert.equal(JSON.stringify(store.getState().document), JSON.stringify(before));
  assert.equal(store.getState().isDirty(), false);
  store.getState().redoCanvasChange();
  assert.equal(JSON.stringify(store.getState().document), JSON.stringify(after));
  const reopened = parse({ id: 'test', name: '子列同步验证' }, { id: 'version', version: 'V1', ...serialize(after) });
  assert.equal(child(reopened).bindings.subTableField.name, '新数量');
  assert.equal(child(before).bindings.subTableField.name, '旧编号');
});

test('mock paper and full runtime paper both render the edited column definition', () => {
  const target = setup();
  edit(target, { name: '新数量', type: 'number', typeConfig: { numberMode: 'decimal', precision: 2 } });
  const document = store.getState().document;
  const runtime = { values: { [target.table.id]: [{ [target.field.id]: 42 }] }, onChange() { assert.fail('render must not write'); } };
  for (const view of [createElement(MockFillPreviewPage, { document, page: document.canvas.pages[0] }), createElement(FormDocumentPreview, { document, runtime })]) {
    const html = renderToStaticMarkup(view);
    assert.ok(html.includes('placeholder="新数量"'), 'paper uses the edited column name');
    assert.ok(html.includes('inputMode="decimal"'), 'paper uses the edited numeric control');
    assert.ok(!html.includes('placeholder="旧编号"'), 'paper cannot keep the former column name');
  }
});

test('generic table renderer already reads canonical model columns and remains a separate positive control', () => {
  const target = setup();
  edit(target, { name: '新数量', type: 'number', typeConfig: { numberMode: 'decimal', precision: 2 } });
  const table = store.getState().document.model.fields.find(item => item.id === target.table.id);
  const html = renderToStaticMarkup(createElement(FormRuntimeContext.Provider, { value: {
    values: { [target.table.id]: [{ [target.field.id]: 42 }] }, onChange() { assert.fail('render must not write'); },
  } }, createElement(FormRuntimeField, { field: table })));
  assert.match(html, /新数量/);
  assert.match(html, /type="number"/);
  assert.match(html, /value="42"/);
});
