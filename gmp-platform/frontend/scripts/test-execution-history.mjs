import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/pages/production/executionHistory.ts', import.meta.url))], bundle: true, write: false, platform: 'node', format: 'esm' });
const { executionHistoryGroups } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const entry = (operationId, action, at = '') => ({ operationId, action, at, operationName: '装配', operator: '操作员', detail: '' });

test('records are scoped by operation ID, then grouped without altering source history', () => {
  const history = [entry('a', '工序开工'), entry('b', '工序开工'), entry('a', '保存表单', '1'), entry('a', '作业确认'), entry('a', '提交表单', '2')];
  const original = JSON.stringify(history);
  const groups = executionHistoryGroups(history, 'a');
  assert.deepEqual(groups.map(group => [group.id, group.entries.length]), [['operation', 1], ['work', 1], ['form', 2]]);
  assert.deepEqual(groups[2].entries.map(item => item.at), ['2', '1']);
  assert.equal(JSON.stringify(history), original);
});
test('empty record types remain available and unknown actions are not lost or mislabeled', () => {
  const groups = executionHistoryGroups([entry('a', '新增事件'), entry('b', '保存表单')], 'a');
  assert.deepEqual(groups.map(group => [group.label, group.entries.length]), [['操作记录', 0], ['作业记录', 0], ['填报记录', 0], ['其他记录', 1]]);
  assert.equal(executionHistoryGroups([], 'a').length, 3);
});
test('form review and return stay in form records, completion stays in operation records', () => {
  const groups = executionHistoryGroups(['审批表单', '退回表单', '工序完工'].map(action => entry('a', action)), 'a');
  assert.deepEqual(groups[0].entries.map(item => item.action), ['工序完工']);
  assert.deepEqual(groups[2].entries.map(item => item.action), ['退回表单', '审批表单']);
});
