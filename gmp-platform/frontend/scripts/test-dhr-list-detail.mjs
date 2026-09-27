import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

async function load(entry) {
  const result = await build({ entryPoints: [entry], bundle: true, write: false, platform: 'node', format: 'esm' });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}
const audit = await load('src/pages/dhr-management/dhrAuditPresentation.ts');
const list = await load('src/pages/dhr-management/dhrListPresentation.ts');

test('snapshot projection localizes system fields without modifying user content', () => {
  const snapshot = JSON.stringify({ status: 'FORMALIZED', opinion: 'APPROVED', placements: [{ recordId: '11', targetNodeKey: 'source-work', displayName: 'UPDATE' }], active: false });
  const fields = audit.dhrAuditFields(snapshot);
  assert.deepEqual(fields.map(f => f.value), ['已定稿', 'APPROVED', '11', '作业表单', 'UPDATE', '否']);
  assert.equal(fields[2].label, '目录展示位置 1 / 表单实例标识');
  assert.equal(new Set(fields.map(f => f.key)).size, fields.length);
  assert.equal(JSON.parse(snapshot).status, 'FORMALIZED');
});
test('empty, legacy text and timestamps remain readable', () => {
  assert.deepEqual(audit.dhrAuditFields(null), []);
  assert.deepEqual(audit.dhrAuditFields('null'), []);
  assert.equal(audit.dhrAuditFields('原始说明')[0].value, '原始说明');
  assert.equal(audit.dhrAuditFields('{"overlayDirectories":[]}')[0].value, '无');
  assert.equal(audit.dhrDateTime('2026-09-27T12:34:56.123'), '2026-09-27 12:34:56');
  assert.equal(audit.dhrDateTime(null), '—');
});
test('audit event names retain business actions', () => {
  assert.equal(audit.dhrAuditActionLabel({ entityType: 'DHR_INSTANCE', action: 'MIGRATE' }), '数据迁移');
  assert.deepEqual(audit.dhrAuditFields('{"summaryStatus":"DRAFT","requiresFreshCheck":true}').map(f => [f.label, f.value]), [['汇总状态', '汇总中'], ['需要重新核查', '是']]);
  assert.equal(audit.dhrAuditActionLabel({ entityType: 'DHR_ATTACHMENT', action: 'UNLINK' }), '解除附件关联');
  assert.equal(audit.dhrAuditActionLabel({ entityType: 'DHR_SUMMARY_VERSION', action: 'CREATE', functionName: '提交汇总' }), '提交汇总');
});
test('row detail supports pointer and keyboard without intercepting child buttons', () => {
  const row = { dhrNo: 'DHR-QA' }, opened = [];
  const props = list.dhrRowDetailProps(row, value => opened.push(value));
  const target = {}, child = {};
  let prevented = 0;
  props.onClick();
  for (const key of ['Enter', ' ', 'Escape']) props.onKeyDown({ key, target, currentTarget: target, preventDefault: () => prevented++ });
  props.onKeyDown({ key: 'Enter', target: child, currentTarget: target, preventDefault: () => prevented++ });
  assert.deepEqual(opened, [row, row, row]);
  assert.equal(prevented, 2);
  assert.equal(props.tabIndex, 0);
});
