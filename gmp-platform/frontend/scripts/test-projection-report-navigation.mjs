import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';

const result = await build({ entryPoints: ['src/utils/menuManagement.ts'], bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  plugins: [{ name: 'menu-api-boundary', setup(plugin) {
    plugin.onResolve({ filter: /^@\/api\/system$/ }, () => ({ path: 'system', namespace: 'stub' }));
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const getManagedSidebarModules = () => {}; export const updateManagedSidebarModules = () => {};', loader: 'js' }));
  } }],
});
const sandbox = { module: { exports: {} }, require: createRequire(import.meta.url), console };
sandbox.exports = sandbox.module.exports;
vm.runInNewContext(result.outputFiles[0].text, sandbox);
const { PROJECTION_REPORT_PAGES, normalizeManagedSidebarModules, inferPermissionCode, isProjectionReportPath } = sandbox.module.exports;

test('legacy saved menus normalize to independent reports including DHR trace without duplicating pages or losing custom reports', () => {
  const input = [{ id: 'records', label: '记录', menus: [{ label: '报表', children: [{ label: '追溯与统计', path: '/reports/form-projections' }, { label: '客户报表', path: '/reports/custom' }] }] }];
  const once = normalizeManagedSidebarModules(input);
  const twice = normalizeManagedSidebarModules(once);
  assert.equal(JSON.stringify(once), JSON.stringify(twice));
  const children = twice.find(module => module.id === 'records').menus.find(menu => menu.label === '报表').children;
  assert.equal(children.filter(child => child.path === '/reports/custom').length, 1);
  assert.equal(children.some(child => child.path === '/reports/form-projections'), false);
  for (const page of PROJECTION_REPORT_PAGES) assert.equal(children.filter(child => child.path === page.path && child.label === page.label).length, 1);
});

test('all five pages and the legacy URL remain within the report permission boundary', () => {
  assert.equal(PROJECTION_REPORT_PAGES.length, 5);
  for (const path of [...PROJECTION_REPORT_PAGES.map(page => page.path), '/reports/form-projections']) {
    assert.equal(inferPermissionCode(path), 'form-instances.view');
    assert.equal(isProjectionReportPath(path), true);
  }
  assert.equal(isProjectionReportPath('/reports/custom'), false);
});

const highlightBundle = await build({ entryPoints: ['src/pages/reports/projectionSourceHighlight.ts'], bundle: true, write: false, platform: 'node', format: 'esm' });
const { sourceHighlight } = await import(`data:text/javascript;base64,${Buffer.from(highlightBundle.outputFiles[0].text).toString('base64')}`);

test('source location uses stable identity after reordering, not a matching value or stale index', () => {
  const hits = [{ bindingId: 'consume', tableId: 'rows', rowKey: 'second', rowIndex: 0, sources: { material: 'material', quantity: 'qty' } }];
  const values = { rows: [{ __rowId: 'first', material: 'M1', qty: 100 }, { __rowId: 'second', material: 'M1', qty: 50 }] };
  const highlight = sourceHighlight(hits, values);
  assert.deepEqual(highlight.rows, [{ tableId: 'rows', rowIndex: 1 }]);
  assert.equal(highlight.isFieldHighlighted('qty', 'rows', 0), false);
  assert.equal(highlight.isFieldHighlighted('remark', 'rows', 1), true, 'the actual row includes its other recorded fields');
  assert.equal(highlight.isFieldHighlighted('qty', 'other-table', 1), false);
});

test('missing or duplicate identities never highlight a guessed row; main groups highlight only their own sources', () => {
  const row = { bindingId: 'consume', tableId: 'rows', rowKey: 'unknown', sources: { quantity: 'qty' } };
  assert.equal(sourceHighlight([row], { rows: [{ __rowId: 'first' }] }).rows.length, 0);
  assert.equal(sourceHighlight([{ ...row, rowKey: 'same' }], { rows: [{ __rowId: 'same' }, { __rowId: 'same' }] }).rows.length, 0);
  const main = sourceHighlight([{ bindingId: 'main-2', rowKey: 'main', sources: { quantity: 'qty2', material: 'material2' } }], {});
  assert.equal(main.isFieldHighlighted('qty2', undefined, 0), true);
  assert.equal(main.isFieldHighlighted('qty1', undefined, 0), false);
  assert.equal(main.isFieldHighlighted('qty2', 'rows', 0), false);
  const legacy = sourceHighlight([{ ...row, rowKey: '02' }], { rows: [{ lineNo: '01' }, { lineNo: '02' }] }, [{ id: 'consume', rowKeyFieldId: 'lineNo' }]);
  assert.equal(legacy.isFieldHighlighted('qty', 'rows', 1), true);
});
