import { existsSync, readFileSync } from 'node:fs';

const failures = [];

function read(path) {
  const url = new URL(`../${path}`, import.meta.url);
  if (!existsSync(url)) {
    failures.push(`${path}: missing file`);
    return '';
  }
  return readFileSync(url, 'utf8');
}

function matchesToken(content, token) {
  return token instanceof RegExp ? token.test(content) : content.includes(token);
}

function formatToken(token) {
  return token instanceof RegExp ? token.toString() : JSON.stringify(token);
}

function mustInclude(file, token, reason) {
  const content = read(file);
  if (!matchesToken(content, token)) {
    failures.push(`${file}: missing ${formatToken(token)} (${reason})`);
  }
}

function mustNotInclude(file, token, reason) {
  const content = read(file);
  if (matchesToken(content, token)) {
    failures.push(`${file}: should not include ${formatToken(token)} (${reason})`);
  }
}

mustInclude('package.json', '"verify:menu-management": "node scripts/verify-menu-management.mjs"', 'menu management verification should be runnable from npm');

mustInclude('src/utils/constants.ts', "{ label: '菜单管理', path: '/system/menu-management' }", 'system module should expose menu management in the left navigation');
mustInclude('src/router/index.tsx', "const MenuManagementPage = lazy(() => import('@/pages/system/MenuManagementPage'))", 'router should lazy load menu management page');
mustInclude('src/router/index.tsx', '<Route path="menu-management" element={<Suspense fallback={<Loading />}><MenuManagementPage /></Suspense>} />', 'router should register system menu management route');

mustInclude('src/utils/menuManagement.ts', 'MENU_MANAGEMENT_STORAGE_KEY', 'managed menu config should have a dedicated storage key');
mustInclude('src/utils/menuManagement.ts', 'MENU_MANAGEMENT_EVENT', 'layout should be able to listen for menu changes');
mustInclude('src/utils/menuManagement.ts', 'loadManagedSidebarModules', 'managed menu config should load current sidebar modules');
mustInclude('src/utils/menuManagement.ts', 'saveManagedSidebarModules', 'managed menu config should persist edited sidebar modules');
mustInclude('src/utils/menuManagement.ts', 'resetManagedSidebarModules', 'managed menu config should support restoring defaults');
mustInclude('src/utils/menuManagement.ts', 'useManagedSidebarModules', 'layout should subscribe to managed sidebar modules');
mustInclude('src/utils/menuManagement.ts', 'normalizeManagedSidebarModules', 'menu config should normalize module/menu data before rendering');
mustInclude('src/utils/menuManagement.ts', 'MAX_MENU_CHILDREN_DEPTH = 2', 'module menu management should document the two-level menu model');
mustInclude('src/utils/menuManagement.ts', 'normalizeSidebarSubMenu', 'module menu management should normalize child menus without allowing deeper nesting');
mustInclude('src/utils/menuManagement.ts', 'window.dispatchEvent(new CustomEvent(MENU_MANAGEMENT_EVENT))', 'saving menus should refresh the active app shell immediately');

mustInclude('src/components/shared/AppLayout.tsx', 'useManagedSidebarModules', 'layout should consume editable menu modules');
mustInclude('src/components/shared/AppLayout.tsx', 'const sidebarModules = useManagedSidebarModules()', 'layout should read managed modules instead of only static constants');
mustInclude('src/components/shared/AppLayout.tsx', 'filterModulesByPermissions(sidebarModules, permissionSet)', 'layout permission filtering should run against managed modules');
mustInclude('src/components/shared/AppLayout.tsx', "if (path === '/system/menu-management') return 'system.edit';", 'menu management should be visible to administrators who can edit system configuration');
mustInclude('src/components/shared/AppLayout.tsx', "type: 'group'", 'left function menu should keep module menu group rows for two-level menus');
mustInclude('src/components/shared/AppLayout.tsx', 'depth: 2', 'left function menu should render child menus as second-level rows');
mustInclude('src/components/shared/AppLayout.tsx', 'data-sidebar-menu-level', 'left function menu rows should expose their rendered level for QA');
mustNotInclude('src/components/shared/AppLayout.tsx', 'filterModulesByPermissions(SIDEBAR_MODULES, permissionSet)', 'layout should not be locked to the static menu constant');

mustInclude('src/pages/system/MenuManagementPage.tsx', 'export default function MenuManagementPage()', 'menu management page should exist');
mustInclude('src/pages/system/MenuManagementPage.tsx', '菜单管理', 'page should use menu management wording');
mustInclude('src/pages/system/MenuManagementPage.tsx', '系统模块', 'page should expose module selection');
mustInclude('src/pages/system/MenuManagementPage.tsx', '模块菜单', 'page should expose menus under the selected module');
mustInclude('src/pages/system/MenuManagementPage.tsx', '二级菜单', 'page should explicitly support child menus');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'selectedModuleId', 'page should keep selected module state');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'addRootMenu', 'page should support adding module-level menus');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'addChildMenu', 'page should support adding second-level child menus');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'updateRootMenu', 'page should support editing module-level menus');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'updateChildMenu', 'page should support editing child menus');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'deleteRootMenu', 'page should support deleting module-level menus');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'deleteChildMenu', 'page should support deleting child menus');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'saveManagedSidebarModules(modules)', 'page should persist edits and trigger layout refresh');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'resetManagedSidebarModules()', 'page should restore default sidebar menus');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'MAX_MENU_CHILDREN_DEPTH', 'page should surface the two-level menu limit');
mustInclude('src/pages/system/MenuManagementPage.tsx', '不能超过 2 级', 'page should communicate the two-level menu limit');

if (failures.length > 0) {
  console.error('Menu management verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Menu management verification passed.');
