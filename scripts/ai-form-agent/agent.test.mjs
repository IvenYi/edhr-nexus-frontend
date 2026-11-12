import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { loadDesigner, hash, save, out } from './common.mjs';
import { loadKnowledge } from './knowledge.mjs';
import { compileLayout, physicalRect } from './layout.mjs';
import { createSession, isSourceReference } from './tools.mjs';

const designer = await loadDesigner();
const sample = { input: { cells: [{ address: 'A1', text: '原因：\n申请人/日期：' }] },
  page: { id: 'page-1', name: '测试', sheet: { rowCount: 1, columnCount: 2, rowHeights: [120], columnWidths: [200, 100] },
    nodes: [], mergedCells: [], cells: { '1:1': { value: '原因：\n申请人/日期：', border: { top: true, bottom: true, left: true, right: true } } } } };
const base = () => ({ name: '测试', questions: [], skipped: [], bindings: [],
  textMoves: [{ source: 'A1', parts: [{ text: '原因：', range: 'A1', box: { x: 0, y: 0, w: 0.3, h: 0.5 } }, { text: '申请人/日期：', range: 'A1', box: { x: 0, y: 0.5, w: 0.5, h: 0.5 } }] }],
  fields: [{ key: 'reason', label: '原因', type: 'text', config: {}, source: 'A1', range: 'A1', box: { x: 0.3, y: 0, w: 0.7, h: 0.5 } },
    { key: 'applicant', label: '申请人', type: 'signature', config: {}, source: 'A1', range: 'A1', box: { x: 0.5, y: 0.5, w: 0.5, h: 0.5 } }] });
test('fractional placements become actual native grid ranges with preserved text and outer borders', () => {
  const result = compileLayout(base(), sample, designer, {}); assert.deepEqual(result.errors, []);
  const p = result.document.canvas.pages[0]; assert.equal(p.sheet.rowCount, 2); assert.equal(p.sheet.columnCount, 4);
  for (const n of p.nodes) {
    const expected = result.geometry.fields.find(x => x.key === n.bindings.fieldId).rect;
    assert.deepEqual(physicalRect(n.style.cellRange, null, p), expected);
  }
  assert.equal(Object.values(p.cells).map(c => c.value ?? '').join(''), '原因：申请人/日期：');
  assert.equal(p.cells['1:1'].border.right, undefined); assert.equal(p.cells['1:3'].border.right, true);
  assert.equal(p.cells['1:1'].border.bottom, undefined); assert.equal(p.cells['2:1'].border.bottom, true);
  assert.ok(p.mergedCells.some(r => r.l === 4 && r.r === 4 && r.t === 1 && r.b === 2), 'untouched blank cell retains original visual extent');
});
test('overlapping controls, labels, truncated source text, and out of range placement are rejected', () => {
  const overlap = base(); overlap.fields[1].box = overlap.fields[0].box;
  assert.ok(compileLayout(overlap, sample, designer, {}).errors.some(x => x.includes('重叠')));
  const lost = base(); lost.textMoves[0].parts.pop();
  assert.ok(compileLayout(lost, sample, designer, {}).errors.some(x => x.includes('完整保留')));
  const outside = base(); outside.fields[0].range = 'C1';
  assert.ok(compileLayout(outside, sample, designer, {}).errors.some(x => x.includes('超出')));
  const label = base(); label.textMoves = [];
  assert.ok(compileLayout(label, sample, designer, {}).errors.some(x => x.includes('原文')));
});
test('knowledge retains open questions, inherited metadata, provenance and explicit graph edges', async () => {
  const k = await loadKnowledge();
  const question = k.get(['question.form-projection-cross-form-event-association'])[0];
  assert.equal(question.status, 'unresolved'); assert.equal(question.visibility, 'internal');
  assert.match(question.fileHash, /^[a-f0-9]{64}$/); assert.match(question.sourceCommit, /^[a-f0-9]{40}$/);
  const statement = k.get(['DEC-0082-15'])[0]; assert.equal(statement.parentId, 'DEC-0082');
  const graph = k.graph('concept.form-template-field', 60);
  assert.ok(graph.edges.some(e => e.kind === 'relation.form-field-associated-trace-item' && e.to === 'concept.form-lookup-item'));
  assert.ok(k.search('引用', 15).length); assert.deepEqual(k.get(['does-not-exist']), [{ id: 'does-not-exist', error: '不存在此知识 ID' }]);
});
test('immutable protocol preserves first evidence when a different rerun is attempted', async () => {
  await mkdir(out, { recursive: true });
  const folder = await mkdtemp(out + '/test-'), name = folder.slice(out.length + 1) + '/protocol.json';
  try {
    await save(name, { value: 1 }, true); const before = hash(await readFile(folder + '/protocol.json', 'utf8'));
    await assert.rejects(save(name, { value: 2 }, true), /拒绝覆盖/);
    assert.equal(hash(await readFile(folder + '/protocol.json', 'utf8')), before);
  } finally { await rm(folder, { recursive: true }); }
});
test('session rejects writes through unknown tools and cannot finish or rename an uncreated target', async () => {
  const folder = 'test-session-' + process.pid;
  const s = createSession({ knowledge: {}, sample, designer, token: null, runId: folder });
  try {
    assert.match((await s.execute('delete_template', {})).error, /不允许/);
    assert.match((await s.execute('finish_task', {})).error, /尚未成功保存/);
    assert.match((await s.execute('rename_field', { key: 'unowned', name: 'x' })).error, /本会话尚未创建/);
    assert.equal(s.state.template, null);
  } finally { await rm(out + '/runs/' + folder, { recursive: true }); }
});
test('source provenance accepts real ranges and qualified sheet names without accepting outside coordinates or unknown knowledge', () => {
  const s = { ...sample, input: { ...sample.input, sheet: 'Sheet1' } };
  assert.equal(isSourceReference('A1:B1', s), true); assert.equal(isSourceReference('Sheet1!A1', s), true);
  assert.equal(isSourceReference('Other!A1', s), false); assert.equal(isSourceReference('A2', s), false);
  assert.equal(isSourceReference('DEC-9999', s), false); assert.equal(isSourceReference('B1:A1', s), false);
});
