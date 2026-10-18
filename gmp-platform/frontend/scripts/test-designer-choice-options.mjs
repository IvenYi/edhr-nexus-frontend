import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const baseline = process.env.W2_BASELINE_COMMIT;
if (baseline && !/^[0-9a-f]{40}$/.test(baseline)) throw new Error('W2_BASELINE_COMMIT must be a full commit SHA');
const built = await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'ts', contents: `
  export { useTemplateDesignerStore } from './src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
  export { createEmptyTemplateDesignerDocument, serializeTemplateDesignerDocument, parseReactTemplateDesignerDocument }
    from './src/pages/master-data/template-designer-react/utils/document';
  export { newSubTableRow } from './src/components/form-renderer/newSubTableRow';
` }, bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external', logLevel: 'silent',
  plugins: [{ name: 'actual-store-boundaries', setup(plugin) {
    plugin.onResolve({ filter: /(?:^@\/api\/client$|^\.\/client$)/ }, () => ({ path: 'client', namespace: 'stub' }));
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default {};', loader: 'js' }));
    if (baseline) plugin.onLoad({ filter: /(?:useTemplateDesignerStore|fieldRegistry)\.ts$/ }, args => ({
      contents: execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/${path.relative(root, args.path)}`], { cwd: root, encoding: 'utf8' }),
      loader: 'ts', resolveDir: path.dirname(args.path),
    }));
  } }] });
const nodeRequire = createRequire(import.meta.url);
const scope = { module: { exports: {} }, require: name => {
  const loaded = nodeRequire(name); return name.startsWith('@mui/icons-material/') ? loaded.default ?? loaded : loaded;
}, console, crypto: globalThis.crypto, structuredClone };
scope.exports = scope.module.exports;
vm.runInNewContext(built.outputFiles[0].text, scope);
const { useTemplateDesignerStore: store, createEmptyTemplateDesignerDocument: createDocument,
  serializeTemplateDesignerDocument: serialize, parseReactTemplateDesignerDocument: parse, newSubTableRow } = scope.module.exports;
const plain = value => JSON.parse(JSON.stringify(value));
const layout = row => ({ range: { t: row, b: row, l: 2, r: 3 }, left: 98, top: (row - 1) * 36, width: 196, height: 36 });
function setup(type = 'singleSelect', child = false) {
  store.getState().setDocument(createDocument({ schema: 'edhr-template-designer-react', version: 1,
    templateId: 'choice-test', versionId: 'v1', templateName: '共享选项', versionLabel: 'V1' }));
  const state = store.getState();
  const table = child ? state.addField('subTable', '检验明细') : null;
  const field = table ? state.addSubTableFields(table.id, [{ name: '检验结果', type }])[0] : state.addField(type, '检验结果');
  if (table) state.addSubTableRegionFromFieldToRange(table.id, { t: 2, b: 6, l: 2, r: 5 }, { left: 98, top: 36, width: 392, height: 180 });
  for (const row of table ? [3, 5] : [3]) {
    if (table) state.addNodeFromSubTableFieldToCell(table.id, field, layout(row));
    else state.addNodeFromFieldToCell(field.id, layout(row));
  }
  const document = structuredClone(store.getState().document);
  if (!table) {
    // Imported documents can contain repeated main-field placements; the ordinary picker hides used fields.
    const repeated = structuredClone(document.canvas.pages[0].nodes[0]);
    repeated.id = 'repeated-main-placement';
    repeated.style = { ...repeated.style, cellRange: layout(5).range, compTop: layout(5).top };
    document.canvas.pages[0].nodes.push(repeated);
  }
  store.getState().setDocument(document);
  store.getState().markSaved();
  return { field, table };
}
const nodes = () => store.getState().document.canvas.pages.flatMap(page => page.nodes).filter(node => node.bindings?.fieldId && !node.bindings.subTableRegion);
const column = target => target.table
  ? store.getState().document.model.fields.find(field => field.id === target.table.id).typeConfig.columns.find(field => field.id === target.field.id)
  : store.getState().document.model.fields.find(field => field.id === target.field.id);
const edit = (node, optionList) => store.getState().updateNodeBindings(node.id, { widgetConfig: { ...node.bindings.widgetConfig, optionList } });

test('new choice fields persist the same two presets already shown by their controls', () => {
  for (const type of ['singleSelect', 'multiSelect']) {
    for (const child of [false, true]) {
      const target = setup(type, child);
      assert.deepEqual(plain(column(target).typeConfig.options.map(({ label, value }) => ({ label, value }))),
        [{ label: '选项1', value: '选项1' }, { label: '选项2', value: '选项2' }]);
    }
    const field = store.getState().addField('text', '主动改类型');
    store.getState().updateField(field.id, { type, typeConfig: { options: [] } });
    assert.equal(store.getState().document.model.fields.find(item => item.id === field.id).typeConfig.options.length, 2);
  }
});

test('reading old choice fields with missing or empty options never creates current write-command presets', () => {
  for (const type of ['singleSelect', 'multiSelect']) for (const child of [false, true]) for (const missing of [false, true]) {
    const target = setup(type, child);
    const document = structuredClone(store.getState().document);
    const field = child ? document.model.fields[0].typeConfig.columns[0] : document.model.fields[0];
    if (missing) delete field.typeConfig.options;
    else field.typeConfig.options = [];
    const reopened = parse({ id: 'choice-test', name: '共享选项' }, { id: 'v1', version: 'V1', ...serialize(document) });
    store.getState().setDocument(reopened);
    // Existing normalization supplies [] for main fields; child config keeps a missing property.
    const expected = child && missing ? undefined : [];
    const actual = () => column(target).typeConfig.options === undefined ? undefined : plain(column(target).typeConfig.options);
    assert.deepEqual(actual(), expected);
    store.getState().updateNodeBindings(nodes()[0].id, { readonly: true });
    assert.deepEqual(actual(), expected);
  }
});

test('ModelTab parent-column creation initializes only new choice columns and preserves an old empty column', () => {
  for (const type of ['singleSelect', 'multiSelect']) {
    const target = setup(type, true);
    const document = structuredClone(store.getState().document);
    const parent = document.model.fields[0];
    parent.typeConfig.columns[0].typeConfig.options = [];
    store.getState().setDocument(document);
    const added = { ...structuredClone(parent.typeConfig.columns[0]), id: 'model-tab-created', name: '新子列', typeConfig: { options: [] } };
    store.getState().updateField(parent.id, { typeConfig: { ...parent.typeConfig, columns: [...parent.typeConfig.columns, added] } });
    const columns = store.getState().document.model.fields[0].typeConfig.columns;
    assert.equal(columns[1].typeConfig.options.length, 2);
    assert.deepEqual(plain(columns[0].typeConfig.options), []);
    assert.equal(columns[1].id, added.id);
    store.getState().updateField(parent.id, { name: '仅改父表名称' });
    assert.deepEqual(plain(store.getState().document.model.fields[0].typeConfig.columns[0].typeConfig.options), []);
  }
});

test('ModelTab parent-column type changes initialize choice definitions and embedded placements in one history step', () => {
  for (const type of ['singleSelect', 'multiSelect']) {
    const target = setup('text', true);
    const before = JSON.stringify(store.getState().document);
    const parent = store.getState().document.model.fields[0];
    const converted = { ...parent.typeConfig.columns[0], type, typeConfig: { options: [] } };
    store.getState().updateField(parent.id, { typeConfig: { ...parent.typeConfig, columns: [converted] } });
    assert.equal(column(target).typeConfig.options.length, 2);
    assert.equal(column(target).id, target.field.id);
    assert.ok(nodes().every(node => node.bindings.subTableField.typeConfig.options.length === 2));
    assert.ok(nodes().every(node => node.bindings.widgetConfig.optionList === '选项1\n选项2'));
    assert.equal(store.getState().undoStack.length, 1);
    store.getState().undoCanvasChange();
    assert.equal(JSON.stringify(store.getState().document), before);
  }
});

test('editing either placement shares single and multi options with the canonical field and other placements', () => {
  for (const type of ['singleSelect', 'multiSelect']) {
    const target = setup(type);
    const before = structuredClone(store.getState().document);
    edit(nodes()[1], '合格:pass\n不合格:fail');
    assert.deepEqual(plain(column(target).typeConfig.options.map(({ label, value }) => ({ label, value }))),
      [{ label: '合格', value: 'pass' }, { label: '不合格', value: 'fail' }]);
    assert.ok(nodes().every(node => node.bindings.widgetConfig.optionList === '合格:pass\n不合格:fail'));
    assert.deepEqual(plain(nodes().map(node => ({ id: node.id, fieldId: node.bindings.fieldId, style: node.style }))),
      plain(before.canvas.pages[0].nodes.map(node => ({ id: node.id, fieldId: node.bindings.fieldId, style: node.style }))));
  }
});

test('subtable options update canonical columns and embedded placements across pages without touching another table', () => {
  const target = setup('singleSelect', true);
  const document = structuredClone(store.getState().document);
  const page = structuredClone(document.canvas.pages[0]); page.id = 'second-page';
  page.nodes = [structuredClone(nodes()[0])]; page.nodes[0].id = 'second-placement';
  document.canvas.pages.push(page);
  const other = structuredClone(document.model.fields[0]); other.id = 'other-table'; document.model.fields.push(other);
  store.getState().setDocument(document);
  const beforeOther = JSON.stringify(other);
  edit(nodes()[0], '合格\n不合格');
  assert.equal(column(target).typeConfig.options[0].value, '合格');
  assert.ok(nodes().every(node => node.bindings.subTableField.typeConfig.options[0].value === '合格'));
  assert.ok(nodes().every(node => node.bindings.widgetConfig.optionList === '合格\n不合格'));
  assert.equal(JSON.stringify(store.getState().document.model.fields.find(field => field.id === 'other-table')), beforeOther);
});

test('model option edits update every placement while preserving compatible widget configuration', () => {
  const target = setup();
  store.getState().updateNodeBindings(nodes()[0].id, { readonly: true, widgetConfig: { optionShape: 'radio', optionList: '旧选项' } });
  store.getState().updateField(target.field.id, { typeConfig: { options: [{ id: 'approved', label: '通过', value: 'ok', sortOrder: 1, status: 'enabled' }] } });
  assert.ok(nodes().every(node => node.bindings.widgetConfig.optionList === '通过:ok'));
  assert.equal(nodes()[0].bindings.widgetConfig.optionShape, 'radio');
  assert.equal(nodes()[0].bindings.readonly, true);
});

test('renaming an option label preserves its existing value identity and former immutable document', () => {
  const target = setup();
  edit(nodes()[0], '合格:pass\n不合格:fail');
  const previous = store.getState().document;
  const firstId = column(target).typeConfig.options[0]?.id;
  assert.ok(firstId);
  edit(nodes()[1], '已通过:pass\n不合格:fail');
  assert.equal(column(target).typeConfig.options[0].id, firstId);
  assert.equal(column(target).typeConfig.options[0].label, '已通过');
  assert.equal(previous.model.fields[0].typeConfig.options[0].label, '合格');
});

test('one choice edit is one complete undo step and round-trips model and canvas consistently', () => {
  const target = setup('singleSelect', true);
  const before = JSON.stringify(store.getState().document);
  edit(nodes()[0], '合格:pass\n不合格:fail');
  const after = JSON.stringify(store.getState().document);
  assert.equal(column(target).typeConfig.options[0]?.value, 'pass');
  assert.equal(store.getState().undoStack.length, 1);
  store.getState().undoCanvasChange(); assert.equal(JSON.stringify(store.getState().document), before);
  assert.equal(store.getState().isDirty(), false);
  store.getState().redoCanvasChange(); assert.equal(JSON.stringify(store.getState().document), after);
  const reopened = parse({ id: 'choice-test', name: '共享选项' }, { id: 'v1', version: 'V1', ...serialize(store.getState().document) });
  const options = reopened.model.fields[0].typeConfig.columns[0].typeConfig.options;
  assert.equal(options[0].value, 'pass');
  assert.deepEqual(plain(reopened.canvas.pages[0].nodes.find(node => node.bindings.subTableField)?.bindings.subTableField.typeConfig.options), plain(options));
});

test('the existing row factory saves a configured single-select default as the actual canonical option value', () => {
  const target = setup('singleSelect', true);
  edit(nodes()[0], '合格:pass\n不合格:fail');
  store.getState().updateNodeBindings(nodes()[0].id, { defaultValue: 'pass' });
  const row = newSubTableRow([column(target)], nodes());
  assert.equal(row[target.field.id], 'pass');
  assert.match(row.__rowId, /^[0-9a-f-]{36}$/);
});

test('unrelated binding and widget edits do not adopt a saved inconsistent placement or reactivate disabled options', () => {
  const target = setup();
  const document = structuredClone(store.getState().document);
  document.model.fields[0].typeConfig.options = [{ id: 'old', label: '停用', value: 'old', status: 'disabled', sortOrder: 1 }];
  document.canvas.pages[0].nodes[0].bindings.widgetConfig.optionList = '旧组件选项';
  store.getState().setDocument(document);
  const beforeOptions = JSON.stringify(column(target).typeConfig.options);
  store.getState().updateNodeBindings(nodes()[0].id, { readonly: true });
  store.getState().updateNodeBindings(nodes()[0].id, { widgetConfig: { ...nodes()[0].bindings.widgetConfig, optionShape: 'select' } });
  assert.equal(JSON.stringify(column(target).typeConfig.options), beforeOptions);
  assert.equal(nodes()[1].bindings.widgetConfig.optionList, document.canvas.pages[0].nodes[1].bindings.widgetConfig.optionList);
});

test('rebinding a compatible choice control takes its new field options without carrying another field option list', () => {
  setup();
  edit(nodes()[0], '旧字段选项');
  const target = store.getState().addField('singleSelect', '另一字段');
  store.getState().updateField(target.id, { typeConfig: { options: [{ id: 'new', label: '新字段', value: 'new', sortOrder: 1, status: 'enabled' }] } });
  const nodeId = nodes()[0].id;
  store.getState().bindFieldToNode(nodeId, target.id);
  const bound = nodes().find(node => node.id === nodeId);
  assert.equal(bound.bindings.fieldId, target.id);
  assert.equal(bound.bindings.widgetConfig.optionList, '新字段:new');
});
