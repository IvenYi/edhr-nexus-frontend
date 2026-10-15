import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
const { outputFiles } = await build({ entryPoints: ['src/pages/reports/projectionReportColumns.ts'], bundle: true, format: 'esm', platform: 'node', write: false });
const { businessRecordColumns, businessRecordValues, businessFilters, businessTotalColumns, isReportDateFilter } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
test('business records expose their actual attributes rather than a shared values blob', () => {
  const production = businessRecordColumns('production').map(c => c.id);
  for (const id of ['workHours', 'reporter', 'reportStartTime', 'reportEndTime', 'productionDate', 'workOrderNo', 'productName']) assert.ok(production.includes(id));
  assert.ok(!production.includes('materialName'));
  for (const model of ['scrap', 'consumption']) {
    const columns = businessRecordColumns(model).map(c => c.id);
    for (const id of ['category', 'reason', 'materialCode', 'materialName', 'materialLotText', 'quantity']) assert.ok(columns.includes(id));
    assert.ok(!columns.includes('workHours'));
  }
  assert.ok(!businessTotalColumns('scrap').some(c => c.id === 'reason'), 'a merged quantity must not be labelled with one cause');
});
test('display uses frozen names and explicit hours while unknown data remains absent', () => {
  const row = businessRecordValues({context: {productName: '冻结产品'}, attributes: {workHours: 3, reportStartTime: '2026-10-12T00:00', reportEndTime: '2026-10-13T00:00', reason: 'r1', reasonLabel: '划伤', material: {code: 'M1', name: '螺丝'}}});
  assert.equal(row.workHours, 3); assert.equal(row.productName, '冻结产品'); assert.equal(row.reason, '划伤（r1）');
  assert.equal(row.materialCode, 'M1'); assert.equal(row.unit, '单位未填写');
  const missing = businessRecordValues({attributes: {}});
  assert.equal(missing.workHours, undefined); assert.equal(missing.reporter, undefined); assert.equal(missing.productionDate, undefined);
});
test('production date ranges are available only for reports with that business meaning', () => {
  assert.ok(businessFilters('production').some(([id]) => id === 'productionDateFrom'));
  assert.ok(!businessFilters('scrap').some(([id]) => id === 'productionDateFrom'));
  assert.equal(isReportDateFilter('productionDateTo'), true);
  assert.equal(isReportDateFilter('reporter'), false);
});
