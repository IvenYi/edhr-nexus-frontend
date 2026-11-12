import test from 'node:test';
import assert from 'node:assert/strict';
import { loadKnowledge } from '../knowledge.mjs';
import { applyLocalPatch } from './editing.mjs';
import { checkSemantics, sourceRequirements } from './semantics.mjs';
import { applicableKnowledge } from './knowledge.mjs';
import { loadDesigner } from '../common.mjs';
import { compileLayout } from '../layout.mjs';
import { checkReferences } from './tools.mjs';

test('reference runtime checks reject unsupported config, group repeated fields and accept empty candidates', async () => {
  const fields = ['a', 'b'].map(key => ({ key, type: 'reference', config: { sourceType: 'user', referenceField: 'name' } }));
  fields.push({ key: 'c', type: 'reference', config: { sourceType: 'user', referenceField: 'displayName' } });
  let calls = 0;
  const errors = await checkReferences({ fields }, null, async (_route, _token, _method, body) => {
    calls++; if (body.config.referenceField === 'name') throw new Error('unsupported name'); return [];
  });
  assert.equal(calls, 2); assert.deepEqual(errors.map(e => e.affectedFields), [['a', 'b']]);
});

const field = (key, source, type = 'text') => ({ key, label: key, type, source, range: 'B1', config: {} });
const sample = { input: { cells: [{ address: 'A1', text: '申请人/日期：' }, { address: 'A2', text: '处理人/日期： 财务确认/日期：' }, { address: 'A3', text: '质量控制点/结果/签字/日期' }, { address: 'A4', text: '实施日期' }, { address: 'A5', text: '批号' }, { address: 'A6', text: '打印人' }] } };
test('source dates distinguish concrete positions from table headings and static history', () => {
  assert.deepEqual(sourceRequirements(sample).map(r => r.minimumDates), [1, 2]);
  const d = { fields: [field('signed', 'A1', 'signature')], bindings: [] };
  assert.equal(checkSemantics(d, sample).errors.filter(e => e.code === 'missing-explicit-date').length, 2);
  d.fields.push(field('date1', 'A1', 'datetime'), field('date2', 'A2', 'datetime'), field('date3', 'A2', 'datetime'));
  assert.equal(checkSemantics(d, sample).errors.filter(e => e.code === 'missing-explicit-date').length, 0);
});
test('trace item reuse across fields is allowed, multiple mappings of one field rejected', () => {
  const s = { input: { cells: [] } }, d = { fields: [field('a', 'A1'), field('b', 'A1')], bindings: ['a', 'b'].map(k => ({ modelId: 'formTrace', sources: { lookup_material_code: k } })) };
  assert.deepEqual(checkSemantics(d, s).errors, []);
  d.bindings.push({ modelId: 'formTrace', sources: { equipmentText: 'a' } });
  assert.equal(checkSemantics(d, s).errors[0].code, 'multiple-trace-items');
});
test('unknown policy blocks dependent uses while allowing unrelated trace roles', () => {
  const d = { fields: [field('lot', 'A5'), field('person', 'A6', 'signature')], bindings: [{ modelId: 'scrap', sources: { materialLotText: 'lot' } }], questions: [{ question: '批号体系？', affectedFields: ['lot'], blockedUses: [{ modelId: 'scrap', roles: ['materialLotText'] }] }] };
  const codes = checkSemantics(d, { input: { cells: sample.input.cells.slice(4) } }).errors.map(e => e.code);
  for (const c of ['formal-source-unknown', 'lot-meaning-unknown', 'unconfirmed-signature', 'question-already-bound']) assert.ok(codes.includes(c));
  const q = { question: '是否正式统计？', affectedFields: ['lot'], blockedUses: [{ modelId: 'scrap' }] };
  assert.ok(!checkSemantics({ fields: [field('lot', 'A1')], bindings: [{ modelId: 'formTrace', sources: { lookup_material_code: 'lot' } }], questions: [q] }, { input: { cells: [] } }).errors.some(e => e.code === 'question-already-bound'));
});
test('local patches preserve unrelated data and cannot silently delete used fields', () => {
  const d = { fields: [field('a', 'A1'), field('b', 'A2')], textMoves: [{ source: 'A1', parts: [] }], bindings: [{ modelId: 'formTrace', sources: { lookup_material_code: 'b' } }], questions: [], skipped: [] };
  const before = structuredClone(d), result = applyLocalPatch(d, { fields: [{ key: 'a', label: '新名称' }] }).draft;
  result.fields[0].label = 'a'; assert.deepEqual(result, before); assert.deepEqual(d, before);
  assert.throws(() => applyLocalPatch(d, { removeFields: ['b'] }), /解除用途/);
});
test('applicable query returns source-backed rules and relation evidence, not sample answers', async () => {
  const k = await loadKnowledge(), r = applicableKnowledge(k, '追溯 字段', ['concept.form-template-field']);
  assert.ok(r.records.some(x => x.id === 'rule.form-projection.trace-field-single-binding'));
  assert.ok(r.relationships.length); assert.ok(r.records.every(x => x.fileHash && x.sourceCommit && x.locator));
  assert.match(r.scope, /internal-research-only/);
});
test('grid adjustment changes native placement while preserving original source geometry', async () => {
  const designer = await loadDesigner(), s = { input: { cells: [{ address: 'A1', text: '备注' }] }, page: { id: 'page-1', name: '测试', sheet: { rowCount: 1, columnCount: 2, rowHeights: [30], columnWidths: [100, 100] }, cells: { '1:1': { value: '备注' } }, nodes: [], mergedCells: [] } };
  const d = { name: '测试', fields: [field('note', 'A1')], bindings: [], textMoves: [], gridAdjustments: { rows: { 1: 80 } } };
  const c = compileLayout(d, s, designer, {}); assert.deepEqual(c.errors, []); assert.equal(c.geometry.fields[0].rect.h, 80); assert.equal(s.page.sheet.rowHeights[0], 30);
  d.gridAdjustments.rows[1] = -1; assert.ok(compileLayout(d, s, designer, {}).errors.length);
});
