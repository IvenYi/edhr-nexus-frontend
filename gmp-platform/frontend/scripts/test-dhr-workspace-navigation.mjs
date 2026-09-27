import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

async function load(entry) {
  const result = await build({ entryPoints: [`src/pages/dhr-management/${entry}.ts`], bundle: true, write: false, platform: 'node', format: 'esm' });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}
const { archiveNavigation, evidenceNavigation } = await load('dhrSourceNavigation');
const { exportSelectionNodes } = await load('dhrExportSelection');
const { groupSummarySources, placeSummarySourceGroup } = await load('summarySourceGroups');
const record = (id, originKind, formId) => ({ id, originKind, formId, operationId: 'op', operationName: '包装', templateId: 'same-template', templateName: '记录', instanceNo: `FR-${id}`, status: 'COMPLETED', snapshot: {} });

test('export tree keeps ancestor chain, grouped instance identity and folder search scope', () => {
  const rows = [record('1', 'WORK', 'a'), record('2', 'WORK', 'a'), record('3', 'CUSTOM', 'c')];
  const dirs = [{ id: '10', name: '生产记录', items: [] }, { id: '11', parentId: '10', name: '包装', items: [] }];
  const placements = [{ recordId: '1', targetNodeKey: 'base-dir-11' }, { recordId: '2', targetNodeKey: 'base-dir-11' }];
  const nodes = archiveNavigation(dirs, rows, [], placements);
  const all = exportSelectionNodes(nodes, rows, '');
  assert.deepEqual(all.find(n => n.key === 'base-dir-10').recordIds, ['1', '2']);
  assert.deepEqual(all.find(n => n.key === 'record-1').ancestorKeys, ['base-dir-10', 'base-dir-11']);
  const filtered = exportSelectionNodes(nodes, rows, 'FR-2');
  assert.deepEqual(filtered.map(n => n.recordIds), [['2'], ['2'], ['2']]);
  assert.deepEqual(exportSelectionNodes(nodes, rows, '生产记录').at(-1).recordIds, ['1', '2']);
  assert.deepEqual(exportSelectionNodes(nodes, rows, '不存在'), []);
});

test('source groups use node/creation identity, not template; instances have stable order', () => {
  const rows = [record('2', 'WORK', 'node-a'), record('1', 'WORK', 'node-a'), record('3', 'WORK', 'node-b'), record('4', 'CUSTOM', 'creation-a'), record('5', 'CUSTOM', 'creation-b')];
  assert.deepEqual(evidenceNavigation('WORK', [], rows).map(n => n.recordIds), [['1', '2'], ['3']]);
  assert.deepEqual(evidenceNavigation('CUSTOM', [], rows).map(n => n.recordIds), [['4'], ['5']]);
});
test('directory placement never changes source membership or duplicates evidence', () => {
  const rows = [record('1', 'WORK', 'node-a'), record('2', 'WORK', 'node-a')];
  const before = JSON.stringify(rows);
  const group = groupSummarySources(rows)[0];
  let placements = placeSummarySourceGroup([], group, 'base-1');
  placements = placeSummarySourceGroup(placements, group, 'base-2');
  assert.equal(placements.length, 2);
  assert.ok(placements.every(p => p.targetNodeKey === 'base-2'));
  assert.deepEqual(evidenceNavigation('WORK', [], rows)[0].recordIds, ['1', '2']);
  assert.equal(JSON.stringify(rows), before);
});
test('directory tree preserves hierarchy and empty definitions without inventing instances', () => {
  const rows = [record('1', 'DIRECTORY', 'f')];
  rows[0].snapshot.dhrItemId = 'item';
  const directories = [{ id: 'child', parentId: 'root', name: '子目录', items: [{ id: 'item', formName: '记录', records: [] }] }, { id: 'root', parentId: null, name: '生产', items: [{ id: 'empty', formName: '空项', records: [] }] }];
  const nodes = evidenceNavigation('DIRECTORY', directories, rows);
  assert.deepEqual(nodes.map(n => [n.label, n.depth, n.recordIds]), [['生产', 0, []], ['空项', 1, []], ['子目录', 1, []], ['记录', 2, ['1']]]);
});

test('archive shows placements and aliases while source identity and counts remain unchanged', () => {
  const rows = [record('1', 'WORK', 'a'), record('2', 'WORK', 'a'), record('3', 'CUSTOM', 'b')];
  const dirs = [{ id: '10', parentId: null, name: '生产记录', items: [] }];
  const placements = [{ recordId: '2', targetNodeKey: 'base-dir-10', displayName: '包装记录' }, { recordId: '1', targetNodeKey: 'base-dir-10', displayName: '包装记录' }];
  const nodes = archiveNavigation(dirs, rows, [], placements);
  assert.deepEqual(nodes.filter(n => !n.folder).map(n => [n.label, n.recordIds]), [['包装记录', ['2', '1']], ['记录', ['3']]]);
  assert.equal(nodes.find(n => n.key === 'source-work').label, '作业表单（0）');
  assert.ok(nodes.find(n => n.key === 'source-work').emptyMessage);
  assert.deepEqual(evidenceNavigation('WORK', dirs, rows)[0].recordIds, ['1', '2']);
  assert.equal(new Set(nodes.flatMap(n => n.recordIds)).size, rows.length);
});
test('frozen source navigation resolves definition-only items from frozen candidates', () => {
  const frozen = record('frozen', 'DIRECTORY', 'f');
  frozen.snapshot.dhrItemId = 'item';
  const definitions = [{ id: 'root', parentId: null, name: '生产', items: [{ id: 'item', formName: '记录' }, { id: 'empty', formName: '无实例', records: null }] }];
  const nodes = evidenceNavigation('DIRECTORY', definitions, [frozen]);
  assert.deepEqual(nodes.map(n => n.recordIds), [[], ['frozen'], []]);
});
test('archive preserves split placement, interleaved order, and empty default sections', () => {
  const rows = [record('1', 'WORK', 'a'), record('2', 'WORK', 'a'), record('3', 'WORK', 'b')];
  const dirs = [{ id: '10', parentId: null, name: '生产', items: [{ id: '20', formName: '模板项', records: [] }] }];
  const placements = [
    { recordId: '2', targetNodeKey: 'base-dir-10', beforeNodeKey: 'base-item-20', displayOrder: 0 },
    { recordId: '3', targetNodeKey: 'base-dir-10', displayOrder: 1 },
    { recordId: '1', targetNodeKey: 'base-dir-10', displayOrder: 2 },
  ];
  const nodes = archiveNavigation(dirs, rows, [], placements);
  assert.deepEqual(nodes.filter(n => !n.folder).map(n => n.recordIds), [['2'], [], ['3'], ['1']]);
  assert.equal(nodes.find(n => n.key === 'source-custom').label, '自定义表单（0）');
  assert.equal(nodes.find(n => n.key === 'source-custom').emptyMessage, '暂无记录');
});
