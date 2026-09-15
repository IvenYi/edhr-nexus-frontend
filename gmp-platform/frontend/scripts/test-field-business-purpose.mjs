import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
async function load(path) {
  const compiled = await build({ entryPoints: [fileURLToPath(new URL(path, import.meta.url))], bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external' });
  const sandbox = { module: { exports: {} }, require, console, setTimeout, clearTimeout };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(compiled.outputFiles[0].text, sandbox);
  return sandbox.module.exports;
}
const { withFieldBusinessPurpose, fieldBusinessPurposeOptions } = await load('../src/pages/master-data/template-designer-react/utils/fieldBusinessPurpose.ts');
const { parseReactTemplateDesignerDocument, serializeTemplateDesignerDocument } = await load('../src/pages/master-data/template-designer-react/utils/document.ts');
const { useTemplateDesignerStore } = await load('../src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts');
const field = { id: 'g', code: 'good', name: '良品', type: 'number', status: 'enabled', sortOrder: 1, typeConfig: { precision: 2 } };
const parse = fields => parseReactTemplateDesignerDocument({ id: '1', name: '产出表单' }, { id: '2', version: 'V1', modelDesignJson: JSON.stringify({ schema: 'edhr-template-designer-react', version: 1, payload: { fields } }) });

test('purpose changes preserve numeric configuration and ordinary selection clears old semantics', () => {
  const mapped = withFieldBusinessPurpose('number', field.typeConfig, 'PRODUCTION_GOOD');
  assert.equal(mapped.precision, 2); assert.equal(mapped.businessPurpose, 'PRODUCTION_GOOD');
  assert.equal(withFieldBusinessPurpose('number', mapped, '').businessPurpose, '');
  assert.equal(withFieldBusinessPurpose('text', mapped, 'PRODUCTION_GOOD').businessPurpose, '');
  assert.equal(fieldBusinessPurposeOptions.length, 4);
});
test('top-level and subtable mappings survive save and reload with stable field ids', () => {
  const good = { ...field, typeConfig: withFieldBusinessPurpose('number', field.typeConfig, 'PRODUCTION_GOOD') };
  const table = { ...field, id: 'table', name: '明细', type: 'subTable', typeConfig: { columns: [{ ...good, id: 'ng', typeConfig: withFieldBusinessPurpose('number', {}, 'PRODUCTION_NG') }] } };
  const serialized = serializeTemplateDesignerDocument(parse([good, table]));
  const restored = parseReactTemplateDesignerDocument({ id: '1', name: '产出表单' }, { id: '2', version: 'V1', ...serialized });
  assert.equal(restored.model.fields[0].id, 'g');
  assert.equal(restored.model.fields[0].typeConfig.businessPurpose, 'PRODUCTION_GOOD');
  assert.equal(restored.model.fields[1].typeConfig.columns[0].typeConfig.businessPurpose, 'PRODUCTION_NG');
});
test('store merging cannot retain a cleared or changed-type business purpose', () => {
  useTemplateDesignerStore.setState({ document: parse([{ ...field, typeConfig: { businessPurpose: 'PRODUCTION_GOOD' } }]) });
  useTemplateDesignerStore.getState().updateField('g', { typeConfig: withFieldBusinessPurpose('number', {}, '') });
  assert.equal(useTemplateDesignerStore.getState().document.model.fields[0].typeConfig.businessPurpose, '');
  useTemplateDesignerStore.getState().updateField('g', { type: 'text', typeConfig: withFieldBusinessPurpose('text', {}, 'PRODUCTION_GOOD') });
  assert.equal(useTemplateDesignerStore.getState().document.model.fields[0].typeConfig.businessPurpose, '');
});
test('legacy fields keep their names and do not acquire inferred purposes', () => {
  const restored = parse([field]);
  assert.equal(restored.model.fields[0].name, '良品');
  assert.equal(restored.model.fields[0].typeConfig.businessPurpose, undefined);
});
