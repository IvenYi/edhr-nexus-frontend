import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const server = await createServer({
  configFile: false,
  resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
  appType: 'custom',
});

try {
  const { SIDEBAR_MODULES } = await server.ssrLoadModule('/src/utils/constants.ts');
  const { ensureRequiredMenus, inferPermissionCode, normalizeManagedSidebarModules } = await server.ssrLoadModule('/src/utils/menuManagement.ts');

  test('default navigation has one canonical records module with all menu groups', () => {
    const records = SIDEBAR_MODULES.filter((module) => module.id === 'records');
    assert.equal(records.length, 1);
    assert.equal(records[0].icon, 'FactCheck');
    assert.deepEqual(records[0].menus.map((menu) => menu.label), ['表单管理', 'DHR管理', '变更管理']);
  });

  test('saved records modules retain custom entries and all canonical groups exactly once', () => {
    const oldChangeModule = {
      id: 'records', label: '记录', icon: 'Article',
      menus: [
        { label: '变更管理', icon: 'Article', children: [{ label: '记录变更', path: '/records/change' }] },
        { label: '自定义入口', path: '/records/custom' },
      ],
    };
    const oldFormModule = {
      id: 'records', label: '自定义记录', icon: 'Settings',
      menus: [
        { label: '表单管理', icon: 'Settings', children: [{ label: '自定义表单', path: '/form-management/list' }] },
        { label: '其他自定义入口', path: '/records/retained' },
      ],
    };
    const productionModule = { id: 'production', label: '生产', icon: 'PrecisionManufacturing', menus: [{ label: '自定义生产入口', path: '/production/custom' }] };
    const modules = normalizeManagedSidebarModules([oldChangeModule, productionModule, oldFormModule]);
    const records = modules.filter((module) => module.id === 'records');
    assert.equal(records.length, 1);
    assert.equal(records[0].icon, 'FactCheck');
    assert.deepEqual(records[0].menus.slice(0, 4).map(menu => menu.label), ['表单管理', 'DHR管理', '变更管理', '报表']);
    assert.ok(records[0].menus.some(menu => menu.path === '/records/custom'));
    assert.ok(records[0].menus.some(menu => menu.path === '/records/retained'));
    assert.equal(modules.findIndex((module) => module.id === 'records'), modules.findIndex((module) => module.id === 'production') + 1);
    assert.ok(modules.find((module) => module.id === 'production')?.menus.some((menu) => menu.path === '/production/custom'));
    assert.deepEqual(ensureRequiredMenus(modules), modules);
  });

  test('configuration containing only the obsolete records module uses the current default', () => {
    const modules = normalizeManagedSidebarModules([{
      id: 'records', label: '记录', icon: 'Article',
      menus: [{ label: '变更管理', children: [{ label: '记录变更', path: '/records/change' }] }],
    }]);
    const records = modules.filter((module) => module.id === 'records');
    assert.equal(records.length, 1);
    assert.equal(records[0].icon, 'FactCheck');
    assert.deepEqual(records[0].menus.map(menu => menu.label), ['表单管理', 'DHR管理', '变更管理', '报表']);
  });

  test('change pages retain distinct menu permission codes', () => {
    for (const path of ['/records/change', '/records/mine', '/records/approvals', '/records/history']) {
      assert.equal(inferPermissionCode(path), path.slice(1).replace('/', '.'));
    }
  });

  test('every record-change navigation target has an application route', async () => {
    const routerSource = await readFile(fileURLToPath(new URL('../src/router/index.tsx', import.meta.url)), 'utf8');
    assert.match(routerSource, /<Route path="records">/);
    for (const route of ['change', 'mine', 'approvals', 'history', 'requests/:requestId']) {
      assert.match(routerSource, new RegExp(`<Route path="${route.replace('/', '\\/')}"`));
    }
  });
} finally {
  await server.close();
}
