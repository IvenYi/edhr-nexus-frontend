import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const result = await build({
  absWorkingDir: fileURLToPath(new URL('..', import.meta.url)),
  entryPoints: ['src/api/master-data.ts'], bundle: true, write: false, platform: 'node', format: 'cjs',
  plugins: [{ name: 'mock-client', setup(plugin) {
    plugin.onResolve({ filter: /^\.\/client$/ }, () => ({ path: 'client', namespace: 'stub' }));
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default globalThis.client;', loader: 'js' }));
  } }],
});

function apiWith(client) {
  const sandbox = { module: { exports: {} }, client };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(result.outputFiles[0].text, sandbox);
  return sandbox.module.exports;
}

test('equipment type options load every page and preserve string IDs', async () => {
  const calls = [];
  const api = apiWith({ get: async (url, { params }) => {
    calls.push({ url, ...params });
    return { data: { data: { content: [{ id: `900719925474099${params.page}`, name: `Type ${params.page}` }], totalPages: 3 } } };
  } });
  const options = await api.getAllEquipmentTypes();
  assert.equal(options.length, 3);
  assert.equal(options[2].id, '9007199254740993');
  assert.deepEqual(calls.map((call) => call.page), [1, 2, 3]);
  assert.ok(calls.every((call) => call.url === '/master-data/equipment/types'));
});

test('type and individual equipment writes target distinct endpoints', async () => {
  const calls = [];
  const api = apiWith({ put: async (url) => calls.push(url), post: async (url) => calls.push(url) });
  await api.createEquipmentType({ name: '注塑机', categoryId: '1' });
  await api.createEquipment({ name: '注塑机001', equipmentTypeId: '2' });
  await api.updateEquipmentType('9007199254740993', {});
  await api.updateEquipment('9007199254740994', {});
  assert.deepEqual(calls, ['/master-data/equipment/types', '/master-data/equipment', '/master-data/equipment/types/9007199254740993', '/master-data/equipment/9007199254740994']);
});

test('failed option page fails the whole lookup instead of returning an incomplete selector', async () => {
  const api = apiWith({ get: async (_, { params }) => {
    if (params.page === 2) throw new Error('request failed');
    return { data: { data: { content: [{ id: '1' }], totalPages: 2 } } };
  } });
  await assert.rejects(api.getAllEquipmentTypes(), /request failed/);
});

const pageBundle = await build({
  absWorkingDir: fileURLToPath(new URL('..', import.meta.url)),
  entryPoints: ['src/pages/master-data/EquipmentPage.tsx'], bundle: true, write: false, platform: 'node', format: 'cjs',
  plugins: [{ name: 'editor-boundaries', setup(plugin) {
    plugin.onResolve({ filter: /.*/ }, ({ path, kind }) => kind === 'entry-point' ? undefined : { path, external: true });
  } }],
});
const pageSandbox = { module: { exports: {} }, require: () => ({}) };
pageSandbox.exports = pageSandbox.module.exports;
vm.runInNewContext(pageBundle.outputFiles[0].text, pageSandbox);
const { equipmentEditorForm } = pageSandbox.module.exports;
const { normalizeEquipmentColumns, resolveEquipmentColumnWidths } = pageSandbox.module.exports;
const { equipmentSystemColumns, formatEquipmentDateTime } = pageSandbox.module.exports;
const { equipmentPurchaseDateError } = pageSandbox.module.exports;
const testColumns = [{ id: 'name', width: 220 }, { id: 'code', width: 180 }, { id: 'actions', width: 96 }];

test('equipment descriptions populate both editors and default safely for older rows', () => {
  assert.equal(equipmentEditorForm({ code: 'T1', name: '类型', categoryId: '1', description: '类型描述' }, true).description, '类型描述');
  assert.equal(equipmentEditorForm({ code: 'E1', name: '设备', equipmentTypeId: '2', status: 'ACTIVE', description: '设备描述' }, false).description, '设备描述');
  assert.equal(equipmentEditorForm({ code: 'T2', name: '旧类型' }, true).description, '');
});

test('purchase date accepts today past and empty but blocks future dates across month and year boundaries', () => {
  for (const [today, tomorrow] of [['2026-09-10', '2026-09-11'], ['2026-09-30', '2026-10-01'], ['2026-12-31', '2027-01-01']]) {
    assert.equal(equipmentPurchaseDateError('', today), '');
    assert.equal(equipmentPurchaseDateError(today, today), '');
    assert.equal(equipmentPurchaseDateError('2024-02-29', today), '');
    assert.equal(equipmentPurchaseDateError(tomorrow, today), '采购时间不能晚于今天');
  }
  assert.ok(formatEquipmentDateTime(new Date(2026, 8, 10, 0, 1).toISOString()).startsWith('2026-09-10'));
});

test('existing personal layouts gain all four system fields without losing order hidden fields or widths', () => {
  const columns = [...testColumns.slice(0, -1), ...equipmentSystemColumns, testColumns.at(-1)];
  const prefs = normalizeEquipmentColumns(columns, { order: ['code', 'name'], hidden: ['code'], widths: { name: 300 } });
  assert.deepEqual(Array.from(prefs.order), ['code', 'name', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']);
  assert.deepEqual(Array.from(prefs.hidden), ['code']);
  assert.equal(prefs.widths.name, 300);
  const hidden = normalizeEquipmentColumns(columns, { ...prefs, hidden: [...prefs.hidden, 'createdAt'] });
  assert.ok(hidden.hidden.includes('createdAt'));
  assert.deepEqual(Array.from(equipmentSystemColumns, (column) => column.width), [140, 160, 140, 160]);
});

test('system dates follow the modeling page format and missing historical values remain empty markers', () => {
  assert.equal(formatEquipmentDateTime('2026-09-09T09:05:32'), '2026-09-09 09:05');
  assert.equal(formatEquipmentDateTime(null), '-');
  assert.equal(formatEquipmentDateTime(undefined), '-');
  assert.equal(formatEquipmentDateTime('invalid'), 'invalid');
});

test('column preferences discard stale fields and invalid widths while keeping one data column visible', () => {
  const result = normalizeEquipmentColumns(testColumns, { order: ['code', 'obsolete', 'code'], hidden: ['code', 'name', 'actions', 'code'], widths: { name: -10, code: 'broken', actions: 500 } });
  assert.deepEqual(Array.from(result.order), ['name', 'code']);
  assert.equal(result.hidden.length, 1);
  assert.equal(result.widths.name, 80);
  assert.equal(result.widths.code, undefined);
  assert.equal(result.widths.actions, undefined);
  assert.doesNotThrow(() => normalizeEquipmentColumns(testColumns, { order: {}, hidden: 'invalid' }));
});

test('column preferences survive serialization with independent order visibility and widths', () => {
  const prefs = normalizeEquipmentColumns(testColumns, { order: ['code', 'name'], hidden: ['name'], widths: { code: 320 } });
  const restored = normalizeEquipmentColumns(testColumns, JSON.parse(JSON.stringify(prefs)));
  assert.equal(JSON.stringify(restored), JSON.stringify(prefs));
});

test('column sizing fills wide containers while preserving the fixed action column and horizontal overflow', () => {
  const wide = resolveEquipmentColumnWidths(testColumns, {}, 1000);
  assert.equal(wide.actions, 96);
  assert.equal(Object.values(wide).reduce((sum, value) => sum + value, 0), 1000);
  const narrow = resolveEquipmentColumnWidths(testColumns, { name: 400 }, 300);
  assert.equal(narrow.name, 400);
  assert.equal(narrow.actions, 96);
  assert.ok(Object.values(narrow).reduce((sum, value) => sum + value, 0) > 300);
});

test('legacy equipment types edit correctly when the server omits null category fields', () => {
  for (const categoryFields of [{}, { categoryId: null }, { categoryId: '9007199254740993' }]) {
    const form = equipmentEditorForm({ id: '1', code: 'LEGACY', name: '历史注塑机', ...categoryFields }, true);
    assert.equal(form.code, 'LEGACY');
    assert.equal(form.name, '历史注塑机');
    assert.equal(form.categoryId, categoryFields.categoryId ?? '');
    assert.equal(form.status, 'ACTIVE');
    assert.equal(form.equipmentTypeId, '');
  }
});

test('individual equipment edits retain type and status while accepting omitted optional fields', () => {
  const form = equipmentEditorForm({ id: '1', code: 'EQ001', name: '注塑机001', equipmentTypeId: '9007199254740993', status: 'INACTIVE' }, false);
  assert.equal(form.equipmentTypeId, '9007199254740993');
  assert.equal(form.status, 'INACTIVE');
  assert.equal(form.model, '');
  assert.equal(form.serialNumber, '');
  assert.equal(form.brand, '');
  assert.equal(form.purchaseDate, '');
});

test('equipment purchase fields edit losslessly and remain optional for legacy records', () => {
  const form = equipmentEditorForm({ id: '1', code: 'E1', name: '设备', equipmentTypeId: '2', brand: '海天', model: 'M100', purchaseDate: '2024-02-29', status: 'ACTIVE' }, false);
  assert.equal(form.brand, '海天');
  assert.equal(form.purchaseDate, '2024-02-29');
  assert.equal(form.model, 'M100');
});

test('new brand and purchase date columns enter existing layouts at their default neighboring fields', () => {
  const columns = ['name', 'code', 'brand', 'model', 'serialNumber', 'purchaseDate', 'status', 'actions'].map((id) => ({ id, width: 160 }));
  const old = { order: ['code', 'name', 'model', 'serialNumber', 'status'], hidden: ['model'], widths: { model: 300 } };
  const prefs = normalizeEquipmentColumns(columns, old);
  assert.deepEqual(Array.from(prefs.order), ['code', 'name', 'brand', 'model', 'serialNumber', 'purchaseDate', 'status']);
  assert.deepEqual(Array.from(prefs.hidden), ['model']);
  assert.equal(prefs.widths.model, 300);
  assert.equal(JSON.stringify(normalizeEquipmentColumns(columns, prefs)), JSON.stringify(prefs));
});
