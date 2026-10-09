import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/pages/workflow-center/WorkTemplateEditor.tsx', import.meta.url), 'utf8');
const ast = ts.createSourceFile('WorkTemplateEditor.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let expression;
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'selectedSummary') {
    expression = node.initializer.getText(ast);
  }
  ts.forEachChild(node, visit);
}
visit(ast);
assert.ok(expression);
const select = new Function('versionList', 'selectedVersionId', 'persistedDraftVersion', 'currentVersion', 'draftVersion', `return (${expression});`);
const current = { id: 'published', status: 'PUBLISHED', isCurrent: true };
const draft = { id: 'draft', status: 'DRAFT' };
const history = { id: 'history', status: 'PUBLISHED' };
const virtual = { id: 'transient-draft-test', status: 'DRAFT', virtual: true };

test('configuration defaults to the existing draft before the current publication', () => {
  assert.equal(select([current, draft], null, draft, current, draft), draft);
});
test('explicit historical and current selections retain priority', () => {
  const list = [current, draft, history];
  assert.equal(select(list, history.id, draft, current, draft), history);
  assert.equal(select(list, current.id, draft, current, draft), current);
});
test('without a persisted draft use current publication, otherwise the initial virtual draft', () => {
  assert.equal(select([current], null, null, current, virtual), current);
  assert.equal(select([], null, null, null, virtual), virtual);
  assert.equal(select([], null, null, null, null), null);
});
test('stale selection falls back to the draft', () => {
  assert.equal(select([current, draft], 'removed', draft, current, draft), draft);
});
