import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'designer-save-state-'));
const baseline = process.env.W2_BASELINE_COMMIT;
if (baseline && !/^[0-9a-f]{40}$/.test(baseline)) throw new Error('W2_BASELINE_COMMIT must be a full commit SHA');
let store, createDocument, serialize, parse;
try {
  const outfile = path.join(temporary, 'store.cjs');
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'ts', contents: `
    export { useTemplateDesignerStore as store } from './src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
    export { createEmptyTemplateDesignerDocument as createDocument, serializeTemplateDesignerDocument as serialize,
      parseReactTemplateDesignerDocument as parse } from './src/pages/master-data/template-designer-react/utils/document';
  ` }, outfile, bundle: true, platform: 'node', format: 'cjs', logLevel: 'silent',
  alias: { '@': path.join(root, 'src') },
  plugins: baseline ? [{ name: 'original-store', setup(plugin) {
    plugin.onLoad({ filter: /useTemplateDesignerStore\.ts$/ }, args => ({
      contents: execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts`], { cwd: root, encoding: 'utf8' }),
      loader: 'ts', resolveDir: path.dirname(args.path),
    }));
  } }] : [] });
  ({ store, createDocument, serialize, parse } = createRequire(import.meta.url)(outfile));
} finally { await rm(temporary, { recursive: true, force: true }); }

function reset(templateId = 'qa-template', versionId = 'qa-version') {
  store.getState().setDocument(createDocument({ schema: 'edhr-template-designer-react', version: 1,
    templateId, versionId, templateName: '保存一致性验收', versionLabel: 'V1.0' }));
  store.getState().markSaved();
}

test('a successful save acknowledges its submitted document, retaining edits made in flight', () => {
  reset();
  store.getState().updateSheetCellValue(1, 1, '已发送A');
  const submitted = store.getState().document;
  const payload = serialize(submitted);
  store.getState().updateSheetCellValue(1, 1, '尚未发送B');
  store.getState().markSaved(submitted);
  assert.equal(JSON.parse(payload.canvasDesignJson).payload.pages[0].cells['1:1'].value, '已发送A');
  assert.equal(store.getState().document.canvas.pages[0].cells['1:1'].value, '尚未发送B');
  assert.equal(store.getState().isDirty(), true, 'B was never submitted and must remain unsaved');
  assert.equal(store.getState().savedSnapshot, JSON.stringify(submitted));
});

test('a save without further edits becomes clean and the next successful save can acknowledge B', () => {
  reset();
  store.getState().updateSheetCellValue(1, 1, 'A');
  const first = store.getState().document;
  store.getState().markSaved(first);
  assert.equal(store.getState().isDirty(), false);
  store.getState().updateSheetCellValue(1, 1, 'B');
  assert.equal(store.getState().isDirty(), true);
  store.getState().markSaved(store.getState().document);
  assert.equal(store.getState().isDirty(), false);
});

test('undo and redo compare with the acknowledged document rather than the latest local edit', () => {
  reset();
  store.getState().updateSheetCellValue(1, 1, 'A');
  const submitted = store.getState().document;
  store.getState().updateSheetCellValue(1, 1, 'B');
  store.getState().markSaved(submitted);
  store.getState().undoCanvasChange();
  assert.equal(store.getState().isDirty(), false, 'undo returned to persisted A');
  store.getState().redoCanvasChange();
  assert.equal(store.getState().isDirty(), true, 'redo restored unpersisted B');
});

test('a late acknowledgement for another template or version cannot replace its saved baseline', () => {
  reset();
  const submitted = store.getState().document;
  for (const [templateId, versionId] of [['other-template', 'qa-version'], ['qa-template', 'other-version']]) {
    reset(templateId, versionId);
    const expectedSavedSnapshot = store.getState().savedSnapshot;
    store.getState().updateSheetCellValue(1, 1, '当前版本未保存');
    store.getState().markSaved(submitted);
    assert.equal(store.getState().savedSnapshot, expectedSavedSnapshot);
    assert.equal(store.getState().isDirty(), true);
  }
});

test('source mappings and layout share one document history and survive serialization', () => {
  reset();
  const field = store.getState().addField('number', '产出数量');
  const bindings = [{ id: 'qa-production', modelId: 'production', enabled: true, sources: { outputQuantity: field.id } }];
  store.getState().setProjectionBindings(bindings);
  const submitted = store.getState().document;
  store.getState().updateSheetCellValue(1, 1, '请求之后的布局修改');
  store.getState().markSaved(submitted);
  store.getState().undoCanvasChange();
  assert.deepEqual(store.getState().document.model.projection.bindings, bindings);
  assert.equal(store.getState().isDirty(), false);
  store.getState().redoCanvasChange();
  assert.deepEqual(store.getState().document.model.projection.bindings, bindings);
  assert.equal(store.getState().isDirty(), true);
  const payload = serialize(store.getState().document);
  const reopened = parse({ id: 'qa-template', name: '保存一致性验收' }, { id: 'qa-version', version: 'V1.0', ...payload });
  assert.equal(reopened.model.fields[0].id, field.id);
  assert.deepEqual(reopened.model.projection.bindings, bindings);
  assert.equal(reopened.canvas.pages[0].cells['1:1'].value, '请求之后的布局修改');
});
