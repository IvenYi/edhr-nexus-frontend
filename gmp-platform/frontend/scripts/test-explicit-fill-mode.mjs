import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const baseline = process.env.W3_BASELINE_COMMIT;
if (baseline && !/^[0-9a-f]{40}$/.test(baseline)) throw new Error('W3_BASELINE_COMMIT must be a full SHA');
const read = relative => baseline
  ? execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/${relative}`], { cwd: root, encoding: 'utf8' })
  : readFileSync(path.join(root, relative), 'utf8');
const types = ts.transpileModule(read('src/components/form-fill-settings/types.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exports = {};
new Function('exports', types)(exports);
const { fillMode } = exports;
const source = read('src/pages/workflow-center/WorkTemplateEditor.tsx');
const ast = ts.createSourceFile('WorkTemplateEditor.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const declarations = new Map(ast.statements.filter(node => ts.isFunctionDeclaration(node) && node.name).map(node => [node.name.text, node.getText(ast)]));
const names = ['validateFlowGraphForPublish', 'nodeCaption', 'persistentFlowGraph', 'conditionBranchesForConfig', 'conditionHandleForBranch'];
const script = ts.transpileModule(names.map(name => { assert.ok(declarations.has(name), name); return declarations.get(name); }).join('\n'), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const actual = new Function('fillMode', `${script};return { validateFlowGraphForPublish, nodeCaption, persistentFlowGraph };`)(fillMode);
const graph = config => ({ nodes: ['START', 'FORM', 'END'].map((kind, index) => ({ id: ['start', 'form', 'end'][index], data: { kind, ...(kind === 'FORM' ? { config } : {}) } })),
  edges: [{ id: 'a', source: 'start', target: 'form' }, { id: 'b', source: 'form', target: 'end' }] });

test('missing, null and invalid modes stay unconfigured rather than becoming direct mode', () => {
  for (const value of [{}, { fillMode: null }, { fillMode: '' }, { fillMode: 'BAD' }, { fillMode: false }, { formProcessVersionId: '2' }]) assert.equal(fillMode(value), undefined);
  assert.equal(fillMode({ fillMode: 'DIRECT', formProcessVersionId: '2' }), 'DIRECT');
  assert.equal(fillMode({ fillMode: 'PROCESS', directFillConfig: {} }), 'PROCESS');
});

test('actual publish validator rejects an unconfigured mode and accepts explicit direct and configured process', () => {
  const value = { formTemplateVersionId: '702' };
  assert.match(actual.validateFlowGraphForPublish(graph(value)).nodeErrors.form, /填报方式/);
  assert.equal(actual.validateFlowGraphForPublish(graph({ ...value, fillMode: 'DIRECT' })).valid, true);
  assert.equal(actual.validateFlowGraphForPublish(graph({ ...value, fillMode: 'PROCESS', formProcessVersionId: '901' })).valid, true);
  assert.match(actual.validateFlowGraphForPublish(graph({ ...value, fillMode: 'PROCESS' })).nodeErrors.form, /表单流程/);
});

test('actual draft serializer preserves the unconfigured state without modifying its source', () => {
  const value = graph({ formTemplateVersionId: '702' });
  const before = JSON.stringify(value);
  const saved = actual.persistentFlowGraph(value);
  assert.equal(saved.nodes[1].data.config.fillMode, undefined);
  assert.equal(JSON.stringify(value), before);
});

test('actual node caption distinguishes unconfigured, direct and process modes', () => {
  assert.match(actual.nodeCaption({ kind: 'FORM', config: { formTemplateName: '检验表' } }), /未配置|待配置|待选择/);
  assert.match(actual.nodeCaption({ kind: 'FORM', config: { fillMode: 'DIRECT' } }), /直接填报/);
  assert.match(actual.nodeCaption({ kind: 'FORM', config: { fillMode: 'PROCESS', formProcessName: '审批' } }), /审批/);
});
