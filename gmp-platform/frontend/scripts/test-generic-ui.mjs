import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '..');

async function bundle(entry, stubs) {
  const result = await build({
    absWorkingDir: root, entryPoints: [entry], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external',
    plugins: [{ name: 'test-boundaries', setup(plugin) {
      plugin.onResolve({ filter: /.*/ }, ({ path }) => path in stubs ? { path, namespace: 'stub' } : undefined);
      plugin.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({ contents: stubs[path], loader: 'js' }));
    } }],
  });
  return result.outputFiles[0].text;
}

const menuCode = await bundle('src/utils/menuManagement.ts', {
  '@/api/system': 'export const getManagedSidebarModules = () => globalThis.api.get(); export const updateManagedSidebarModules = (modules) => globalThis.api.put(modules);',
});
const loginCode = await bundle('src/pages/LoginPage.tsx', {
  '@/api/client': 'export default {};',
  'react-router-dom': 'export const useNavigate = () => () => {};',
  '@/hooks/useSystemBranding': 'export const DEFAULT_SYSTEM_BRANDING = {}; export const useSystemBranding = (options) => { globalThis.brandingOptions = options; return globalThis.brandingState; };',
});

const clone = (value) => JSON.parse(JSON.stringify(value));
function modules(icon = 'Storage') {
  return [{ id: 'data', label: '数据', icon: 'Storage', menus: [{ label: '工艺建模', icon, children: [{ label: '物料管理', path: '/master-data/materials' }] }] }];
}
function iconOf(value) { return value.find((module) => module.id === 'data').menus.find((menu) => menu.label === '工艺建模').icon; }

function context(code, extra = {}) {
  const storage = new Map();
  const window = new EventTarget();
  window.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const sandbox = { module: { exports: {} }, require, console, window, CustomEvent: Event, ...extra };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(code, sandbox);
  return { api: sandbox.module.exports, sandbox, storage, window };
}

test('legacy menus remain a draft until explicitly saved, including selected icons', async () => {
  let writes = 0;
  const { api, storage } = context(menuCode, { api: { get: async () => ({ configured: false, modules: [] }), put: async (value) => { writes++; return { configured: true, modules: value }; } } });
  storage.set(api.MENU_MANAGEMENT_STORAGE_KEY, JSON.stringify(modules('asset:123')));
  const loaded = await api.refreshManagedSidebarModules();
  assert.equal(iconOf(loaded), 'asset:123');
  assert.equal(writes, 0);
  await api.saveManagedSidebarModules(loaded);
  assert.equal(writes, 1);
});

test('server configuration replaces an older browser cache', async () => {
  const { api, storage } = context(menuCode, { api: { get: async () => ({ configured: true, modules: modules('Home') }) } });
  storage.set(api.MENU_MANAGEMENT_STORAGE_KEY, JSON.stringify(modules('Storage')));
  assert.equal(iconOf(await api.refreshManagedSidebarModules()), 'Home');
  assert.equal(iconOf(api.loadManagedSidebarModules()), 'Home');
});

test('failed save preserves the last saved state and the editable input', async () => {
  const { api } = context(menuCode, { api: { get: async () => ({ configured: true, modules: modules('Home') }), put: async () => { throw new Error('save failed'); } } });
  await api.refreshManagedSidebarModules();
  const draft = modules('asset:123');
  await assert.rejects(api.saveManagedSidebarModules(draft), /save failed/);
  assert.equal(iconOf(api.loadManagedSidebarModules()), 'Home');
  assert.equal(iconOf(draft), 'asset:123');
});

test('save uses the server response and still refreshes the shell when localStorage is unavailable', async () => {
  const { api, window } = context(menuCode, { api: { put: async () => ({ configured: true, modules: modules('Home') }) } });
  window.localStorage.setItem = () => { throw new Error('quota'); };
  let changes = 0;
  window.addEventListener(api.MENU_MANAGEMENT_EVENT, () => changes++);
  const result = await api.saveManagedSidebarModules(modules('Storage'));
  assert.equal(iconOf(result), 'Home');
  assert.equal(iconOf(api.loadManagedSidebarModules()), 'Home');
  assert.equal(changes, 1);
});

test('a delayed read cannot overwrite a completed save', async () => {
  let finishRead;
  const { api } = context(menuCode, { api: { get: () => new Promise((resolve) => { finishRead = resolve; }), put: async (value) => ({ configured: true, modules: value }) } });
  const pending = api.refreshManagedSidebarModules();
  await api.saveManagedSidebarModules(modules('Home'));
  finishRead({ configured: true, modules: modules('Storage') });
  assert.equal(iconOf(await pending), 'Home');
});

test('reset persists target defaults and retains target production and workshop routes', async () => {
  let saved;
  const { api } = context(menuCode, { api: { put: async (value) => { saved = clone(value); return { configured: true, modules: value }; } } });
  await api.resetManagedSidebarModules();
  const paths = JSON.stringify(saved);
  for (const path of ['/master-data/workshops', '/workflow/form-processes', '/production/work-orders', '/production/batches']) assert.ok(paths.includes(path), path);
  assert.ok(!paths.includes('/inventory/'));
});

test('normalization preserves configured module and required-menu icons on repeated saves', () => {
  const { api } = context(menuCode);
  const initial = api.normalizeManagedSidebarModules(modules('asset:123'));
  for (const module of initial) {
    module.icon = 'asset:456';
    for (const menu of module.menus) menu.icon = 'asset:789';
  }
  const normalized = api.normalizeManagedSidebarModules(initial);
  for (const module of normalized) {
    assert.equal(module.icon, 'asset:456');
    for (const menu of module.menus) assert.equal(menu.icon, 'asset:789');
  }
  assert.deepEqual(clone(api.normalizeManagedSidebarModules(normalized)), clone(normalized));
});

test('equipment modeling restores saved menus and removes legacy duplicate equipment entries', () => {
  const { api } = context(menuCode);
  const input = modules();
  input[0].menus.push(
    { label: '旧设备', path: '/master-data/equipment' },
    { label: '旧目录', children: [{ label: '旧类型', path: '/master-data/equipment-types' }] },
    { label: '自定义', children: [{ label: '保留页面', path: '/custom/page' }] },
  );
  const result = api.normalizeManagedSidebarModules(input);
  const menus = result.find((module) => module.id === 'data').menus;
  const equipment = menus.find((menu) => menu.label === '设备建模');
  assert.deepEqual(clone(equipment.children), [
    { label: '设备类型', path: '/master-data/equipment-types' },
    { label: '设备列表', path: '/master-data/equipment' },
  ]);
  const paths = menus.flatMap((menu) => menu.children?.map((child) => child.path) ?? [menu.path]);
  assert.equal(paths.filter((path) => path === '/master-data/equipment').length, 1);
  assert.equal(paths.filter((path) => path === '/master-data/equipment-types').length, 1);
  assert.ok(paths.includes('/custom/page'));
  assert.deepEqual(clone(api.normalizeManagedSidebarModules(result)), clone(result));
  assert.equal(api.inferPermissionCode('/master-data/equipment-types'), 'master-data.equipment');
  assert.equal(api.inferPermissionCode('/master-data/equipment'), 'master-data.equipment');
});

test('equipment modeling exists in default menus and survives save and server reload', async () => {
  let saved;
  const { api } = context(menuCode, { api: {
    put: async (value) => { saved = clone(value); return { configured: true, modules: value }; },
    get: async () => ({ configured: true, modules: saved }),
  } });
  await api.resetManagedSidebarModules();
  const reloaded = await api.refreshManagedSidebarModules();
  assert.ok(reloaded.find((module) => module.id === 'data').menus.find((menu) => menu.label === '设备建模'));
});

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
for (const state of ['loading', 'error', 'retrying', 'ready']) {
  test(`login rendering: ${state}`, () => {
    const { api, sandbox } = context(loginCode, { brandingState: {
      branding: { systemName: '旧品牌测试', loginComplianceItems: '' },
      isLoading: state === 'loading', isBrandingUnavailable: state === 'error' || state === 'retrying',
      isFetching: state === 'retrying', retryBranding: () => {},
    } });
    const html = renderToStaticMarkup(React.createElement(api.default));
    assert.equal(sandbox.brandingOptions.verifyOnMount, true);
    if (state === 'ready') {
      assert.ok(html.includes('<form'));
      assert.ok(html.includes('旧品牌测试'));
    } else {
      assert.ok(!html.includes('<form'));
      assert.ok(!html.includes('旧品牌测试'));
      assert.ok(html.includes(state === 'loading' ? '正在连接系统服务' : '系统服务暂不可用'));
      if (state === 'retrying') assert.match(html, /<button[^>]+disabled=""/);
    }
  });
}
