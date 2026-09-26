import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const result = await build({ entryPoints: ['src/pages/production/ExecutionFormSelector.tsx'], bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external',
  plugins: [{ name: 'api-boundary', setup(plugin) { plugin.onResolve({ filter: /^@\/api/ }, () => ({ path: 'api', namespace: 'stub' })); plugin.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const getExecutionTemplates=()=>Promise.resolve([])' })); } }] });
const context = { module: { exports: {} }, require }; context.exports = context.module.exports;
vm.runInNewContext(result.outputFiles[0].text, context);
const { formSource, selectableForms, workFormStages, workFormGroups } = context.module.exports;
const { EditorAvatars } = context.module.exports;
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const renderEditors = users => renderToStaticMarkup(React.createElement(EditorAvatars, { users, onClick() {} }));
test('no editor indicator is rendered for zero or unknown active editors', () => {
  assert.equal(renderEditors([]), '');
  assert.equal(renderEditors(null), '');
});
test('editor avatars show photos, fall back to names and keep the full count when capped', () => {
  const users = Array.from({ length: 6 }, (_, index) => ({ userId: String(index), name: `王${index}`, sequences: [1], avatarUrl: index === 0 ? '/api/v1/files/123/public-preview' : undefined }));
  const markup = renderEditors(users);
  assert.match(markup, /当前 6 人填写中/);
  assert.match(markup, /src="\/api\/v1\/files\/123\/public-preview"/);
  assert.equal((markup.match(/>王<\/div>/g) ?? []).length, 3);
  assert.match(markup, /execution-form-editor-more/);
  assert.doesNotMatch(renderEditors(users.slice(0, 4)), /execution-form-editor-more/);
});
test('sources distinguish runtime attachment even when template version matches a configured form', () => {
  assert.equal(formSource({ id: 'f1', versionId: 'v' }), 'configured');
  assert.equal(formSource({ id: 'c1', versionId: 'v', sourceType: 'CUSTOM' }), 'custom');
  assert.equal(formSource({ id: 'w1', versionId: 'v', workId: 'w' }), 'work');
});
test('planned work forms remain selectable as previews before the workflow reaches them', () => {
  const direct = { id: 'f1' }, custom = { id: 'c1', sourceType: 'CUSTOM' }, work = { id: 'w1', workId: 'w' };
  const forms = [direct, custom, work, { id: 'future', workId: 'w' }, { id: 'alias', fulfilledBy: 'w1' }];
  const actual = selectableForms(forms, { w1: { instanceIds: ['w1'], status: 'COMPLETED' }, future: { instanceIds: [] } });
  assert.deepEqual(Array.from(actual, f => f.id), ['f1', 'c1', 'w1', 'future', 'alias']);
});
test('work form stages follow graph edges rather than canvas node array order', () => {
  const nodes = [
    { id: 'second', data: { kind: 'FORM' } }, { id: 'end', data: { kind: 'END' } },
    { id: 'start', data: { kind: 'START' } }, { id: 'first', data: { kind: 'FORM' } },
  ];
  assert.deepEqual({ ...workFormStages({ nodes, edges: [
    { source: 'start', target: 'first' }, { source: 'first', target: 'second' }, { source: 'second', target: 'end' },
  ] }) }, { second: 2, first: 1 });
});
test('alternative branch forms share a stage instead of implying a serial dependency', () => {
  const nodes = [
    { id: 'start', data: { kind: 'START' } }, { id: 'condition', data: { kind: 'CONDITION' } },
    { id: 'left', data: { kind: 'FORM' } }, { id: 'right', data: { kind: 'FORM' } }, { id: 'end', data: { kind: 'END' } },
  ];
  assert.deepEqual({ ...workFormStages({ nodes, edges: [
    { source: 'start', target: 'condition' }, { source: 'condition', target: 'left' }, { source: 'condition', target: 'right' },
    { source: 'left', target: 'end' }, { source: 'right', target: 'end' },
  ] }) }, { left: 1, right: 1 });
});

const work = {
  id: 'work', name: '组装作业', version: '2',
  nodes: ['first', 'second', 'third'].map(id => ({ id, data: { kind: 'FORM', label: id } })),
  edges: [{ source: 'first', target: 'second' }, { source: 'second', target: 'third' }],
};
const workForms = work.nodes.map((node, index) => ({ id: `f${index + 1}`, workId: work.id, workNodeId: node.id, name: `表单${index + 1}`, code: `F${index + 1}` }));
const running = { work: { status: 'RUNNING', active: ['second'] } };
test('current work summary follows the runtime node rather than first or incomplete form', () => {
  const [group] = workFormGroups([work], workForms, { f2: { instances: { copy: { canAct: true, nodeKind: 'START' } } } }, running);
  assert.equal(group.current.id, 'f2');
  assert.equal(group.status, '可填报');
  assert.equal(group.instanceId, 'copy');
  assert.equal(group.stages[group.current.workNodeId], 2);
});
test('summary distinguishes approval, other-user processing and read-only access', () => {
  for (const [control, expected] of [
    [{ canAct: true, nodeKind: 'APPROVAL' }, '待审批'],
    [{ canAct: false, nodeKind: 'APPROVAL' }, '审批中'],
    [{ canAct: false, nodeKind: 'START' }, '仅查看'],
  ]) {
    const [group] = workFormGroups([work], workForms, { f2: { instances: { copy: control } } }, running);
    assert.equal(group.status, expected);
    assert.equal(group.canAct, control.canAct);
  }
});
test('work not started or completed never promotes a planned form to current', () => {
  for (const states of [{}, { work: { status: 'COMPLETED', active: [] } }]) {
    const [group] = workFormGroups([work], workForms, {}, states);
    assert.equal(group.current, undefined);
    assert.equal(group.canAct, false);
    assert.equal(group.allForms.length, 3);
  }
});
test('confirmation node does not make the next form look actionable', () => {
  const confirmation = { ...work, nodes: [...work.nodes, { id: 'confirm', data: { kind: 'CONFIRMATION', label: '设备检查' } }] };
  const [group] = workFormGroups([confirmation], workForms, {}, { work: { status: 'RUNNING', active: ['confirm'] } });
  assert.equal(group.current, undefined);
  assert.equal(group.status, '待作业确认');
  assert.equal(group.waitingLabel, '设备检查');
});
test('searching a future form expands matching steps without replacing the current summary', () => {
  const [group] = workFormGroups([work], workForms, {}, running, 'F3');
  assert.equal(group.current.id, 'f2');
  assert.equal(group.searchExpanded, true);
  assert.deepEqual(Array.from(group.matches, form => form.id), ['f3']);
  assert.equal(group.stages[group.matches[0].workNodeId], 3);
  assert.equal(workFormGroups([work], workForms, {}, running, '组装')[0].searchExpanded, false);
});
test('ten works retain separate summaries and only expose their own current form', () => {
  const works = Array.from({ length: 10 }, (_, index) => ({ ...work, id: `w${index}`, name: `作业${index}` }));
  const forms = works.flatMap(item => workForms.map(form => ({ ...form, id: `${item.id}-${form.id}`, workId: item.id })));
  const states = Object.fromEntries(works.map(item => [item.id, { status: 'RUNNING', active: ['second'] }]));
  const groups = workFormGroups(works, forms, {}, states);
  assert.equal(groups.length, 10);
  assert.equal(groups.reduce((total, group) => total + group.allForms.length, 0), 30);
  groups.forEach(group => assert.equal(group.current.workId, group.work.id));
});
test('summary opens an actionable filling copy ahead of read-only and approval copies', () => {
  const [group] = workFormGroups([work], workForms, { f2: { instances: {
    readonly: { canAct: false, nodeKind: 'START' }, approval: { canAct: true, nodeKind: 'APPROVAL' }, fill: { canAct: true, nodeKind: 'START' },
  } } }, running);
  assert.equal(group.instanceId, 'fill');
  assert.equal(group.status, '可填报');
});
