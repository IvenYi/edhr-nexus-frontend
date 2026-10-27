import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';
const result = await build({ entryPoints: ['src/utils/productionAudit.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
const { toProductionAuditFields } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
const ref = { ownerType: 'PRODUCT', ownerName: '历史产品', ownerId: '1', processVersionId: '2', processVersion: 'V1.0' };
test('unstarted audit references do not invent a frozen configuration', () => {
  const fields = toProductionAuditFields({ processReference: ref, processVersion: 'V1.0' });
  assert.equal(fields.find(field => field.key === 'processReference').details, undefined);
  assert(!fields.some(field => field.details != null));
});
test('frozen details belong to the process reference, without a duplicate row', () => {
  const snapshot = { processReference: ref, operations: [{ name: '开工时配置' }] };
  const record = { processReference: ref, processSnapshot: snapshot, processFrozenAt: '2026-10-27T10:00:00' };
  const fields = toProductionAuditFields(JSON.stringify(record));
  assert.deepEqual(fields.find(field => field.key === 'processReference').details, snapshot);
  assert(fields.find(field => field.key === 'processFrozenAt'));
  assert(!fields.some(field => field.key === 'processSnapshot'));
});
test('identical version labels retain each audit record’s different configuration', () => {
  const first = { processReference: ref, processSnapshot: { setting: 10 } };
  const second = { processReference: ref, processSnapshot: { setting: 20 } };
  const old = toProductionAuditFields(first).find(field => field.key === 'processReference');
  const recent = toProductionAuditFields(second).find(field => field.key === 'processReference');
  assert.equal(old.value, recent.value);
  assert.deepEqual(old.details, { setting: 10 });
  assert.deepEqual(recent.details, { setting: 20 });
  assert.deepEqual(first.processSnapshot, { setting: 10 });
});
test('an available snapshot remains accessible when its separate reference is missing', () => {
  const snapshot = { operations: [{ id: '1' }] };
  const fields = toProductionAuditFields({ processSnapshot: snapshot });
  assert.deepEqual(fields.find(field => field.key === 'processSnapshot').details, snapshot);
  assert.deepEqual(toProductionAuditFields('invalid JSON'), []);
});
