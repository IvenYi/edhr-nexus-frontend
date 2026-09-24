import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/components/form-fill-settings/permissionSummary.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { permissionSummary, signatureBindingSummary } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const subject = { id: 'start:a', defaultPermission: 'EDIT' };
test('unconfigured fields inherit the node default', () => {
  assert.equal(permissionSummary(subject, undefined, []).text, '默认可编辑 · 无例外字段');
});
test('binding default and appropriate exceptions override node default', () => {
  const summary = permissionSummary(subject, { 'start:a': { defaultPermission: 'READ_ONLY', editableFieldIds: ['x'], readOnlyFieldIds: ['y'] } }, [{ id: 'x', name: '温度' }]);
  assert.equal(summary.text, '默认只读 · 1 个可编辑例外字段');
  assert.deepEqual(summary.names, ['温度']);
});
test('duplicate exceptions count once and missing fields keep IDs', () => {
  const permissions = { 'start:a': { readOnlyFieldIds: ['x', 'x', 'gone'] } };
  const before = JSON.stringify(permissions);
  const summary = permissionSummary(subject, permissions, [{ id: 'x', name: '压力' }]);
  assert.deepEqual(summary.names, ['压力', '字段 #gone']);
  assert.equal(JSON.stringify(permissions), before);
});
test('no signature field events do not create a pending requirement', () => {
  assert.deepEqual(signatureBindingSummary([], undefined), { pending: 0, bound: 0 });
});
test('only required event bindings count, including empty binding values', () => {
  const events = [{ key: 'entry:a' }, { key: 'entry:b' }, { key: 'entry:c' }];
  const bindings = { 'entry:a': { fieldId: 'signature' }, 'entry:b': { fieldId: ' ' }, obsolete: { fieldId: 'old' } };
  const before = JSON.stringify(bindings);
  assert.deepEqual(signatureBindingSummary(events, bindings), { pending: 2, bound: 1 });
  assert.equal(JSON.stringify(bindings), before);
});
