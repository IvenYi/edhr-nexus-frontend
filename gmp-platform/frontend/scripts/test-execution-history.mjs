import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/pages/production/executionHistory.ts', import.meta.url))], bundle: true, write: false, platform: 'node', format: 'esm' });
const { executionHistoryGroups, executionFormReceipt } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
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

const formEvent = (actionCode, at, overrides = {}) => ({ ...entry('a', '', at), actionCode, formId: 'form-1', copyId: 'copy-1', ...overrides });
test('submission replaces draft receipt and uses submission event time for the selected copy', () => {
  const history = [formEvent('SAVE', 'draft-time'), formEvent('SUBMIT', 'submit-time'),
    formEvent('SAVE', 'other-copy-time', { copyId: 'copy-2' }),
    formEvent('SAVE', 'other-operation-time', { operationId: 'b' }),
    formEvent('SAVE', 'other-form-time', { formId: 'form-2' })];
  assert.deepEqual(executionFormReceipt(history, 'a', 'form-1', 'copy-1', 'saved-time'), { label: '已提交', at: 'submit-time' });
  assert.deepEqual(executionFormReceipt(history, 'a', 'form-1', 'copy-2'), { label: '已暂存', at: 'other-copy-time' });
});
test('return and later draft save replace the previous submission receipt', () => {
  const history = [formEvent('SUBMIT', 'submit-time'), formEvent('RETURN', 'return-time')];
  assert.deepEqual(executionFormReceipt(history, 'a', 'form-1', 'copy-1'), { label: '已退回', at: 'return-time' });
  history.push(formEvent('SAVE', 'new-save-time'));
  assert.deepEqual(executionFormReceipt(history, 'a', 'form-1', 'copy-1'), { label: '已暂存', at: 'new-save-time' });
});
test('signature and review are not mislabeled as drafts; transfer does not replace the receipt', () => {
  for (const [action, label] of [['SIGN_FIELD', '已签名'], ['APPROVE', '已审批']]) {
    assert.deepEqual(executionFormReceipt([formEvent(action, 'event-time'), formEvent('TRANSFER', 'transfer-time')], 'a', 'form-1', 'copy-1'), { label, at: 'event-time' });
  }
});
test('unmatched historical events do not fabricate a submission or a timestamp', () => {
  const history = [entry('a', '提交表单', 'unknown-copy-time')];
  assert.equal(executionFormReceipt(history, 'a', 'form-1', 'copy-1'), null);
  assert.deepEqual(executionFormReceipt(history, 'a', 'form-1', 'copy-1', 'persisted-time'), { label: '已保存', at: 'persisted-time' });
});
