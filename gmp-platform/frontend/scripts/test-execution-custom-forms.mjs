import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import vm from 'node:vm';

const result = await build({ entryPoints: ['src/pages/production/executionCustomForms.ts'], bundle: true, write: false, format: 'cjs', platform: 'node' });
const context = { module: { exports: {} } }; context.exports = context.module.exports;
vm.runInNewContext(result.outputFiles[0].text, context);
const { executionForms, formOwner, visibleFormCopies } = context.module.exports;
const batch = { id: 'shared', sourceType: 'CUSTOM', scope: 'BATCH' };
const local = { id: 'local', sourceType: 'CUSTOM', scope: 'OPERATION' };
const legacy = { id: 'legacy', sourceType: 'CUSTOM' };
const copies = { instanceIds: ['shared', 'shared:copy:2'], status: 'IN_PROGRESS' };
const view = { snapshot: { operations: [{ id: 'a', forms: [batch, local, legacy] }, { id: 'b', forms: [{ id: 'b-form' }] }] }, availability: { a: { formCopies: { shared: copies } }, b: {} } };

test('batch forms stay visible after changing operation without duplicating local or legacy forms', () => {
  assert.deepEqual(Array.from(executionForms(view, 'b'), f => f.id), ['shared', 'b-form']);
  assert.equal(executionForms(view, 'a').filter(f => f.id === 'shared').length, 1);
  assert.equal(formOwner(view, 'b', 'shared'), 'a');
  assert.equal(formOwner(view, 'b', 'local'), 'b');
});
test('both operations use exactly the same copy controls and identities', () => {
  assert.equal(visibleFormCopies(view, 'a').shared, copies);
  assert.equal(visibleFormCopies(view, 'b').shared, copies);
  assert.deepEqual(Array.from(visibleFormCopies(view, 'b').shared.instanceIds), ['shared', 'shared:copy:2']);
  assert.equal(view.snapshot.operations[1].forms.length, 1);
});
