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
mustInclude('src/components/shared/AppLayout.tsx', 'renderManagedIcon', 'layout should render uploaded icon assets selected from icon management');
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
mustNotInclude('src/pages/system/MenuManagementPage.tsx', 'label="模块编码"', 'module code should not be displayed on the menu management page');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'data-menu-management-page', 'menu management page should expose a full-height page container');
mustInclude('src/pages/system/MenuManagementPage.tsx', "height: '100%'", 'menu management page should fill the routed content height');
mustInclude('src/pages/system/MenuManagementPage.tsx', "overflow: 'hidden'", 'menu management page should prevent page-level scrolling');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'data-menu-management-menu-scroll', 'module menu list should own the vertical scrollbar');
mustInclude('src/pages/system/MenuManagementPage.tsx', "overflow: 'auto'", 'module menu list should scroll inside its container');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'IconSelectorField', 'module and menu icon fields should use an icon picker');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'getIconPage', 'icon picker should read icon management data');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'getIconGroups', 'icon picker should read icon management groups');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'menu-icon-picker', 'icon picker query should have an isolated cache key');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'menu-icon-picker-groups', 'icon picker group query should have an isolated cache key');
mustInclude('src/pages/system/MenuManagementPage.tsx', "selectedIconGroupId, iconKeyword", 'icon picker cache should include selected category');
mustInclude('src/pages/system/MenuManagementPage.tsx', "getIconPage({ groupId: selectedIconGroupId, keyword: iconKeyword.trim(), page: iconPickerPage, size: iconPickerPageSize })", 'icon picker should query icons by selected category and keyword');
mustInclude('src/pages/system/MenuManagementPage.tsx', '<DialogTitle sx={{ p: 0 }}>', 'icon picker should use a custom title row');
mustInclude('src/pages/system/MenuManagementPage.tsx', '<Typography sx={{ fontWeight: 600, color: \'#303133\' }}>图标选择</Typography>', 'icon picker dialog title should be 图标选择');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'aria-label="关闭图标选择"', 'icon picker should expose a top-right close button');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'label="分类"', 'icon picker should show a category selector before search');
mustInclude('src/pages/system/MenuManagementPage.tsx', '<MenuItem value="ALL">全部</MenuItem>', 'icon picker category selector should default to all');
mustInclude('src/pages/system/MenuManagementPage.tsx', '按图标名称模糊查询', 'icon picker should support fuzzy search by name');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'toIconAssetValue', 'uploaded icon selections should persist as asset references');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'data-menu-icon-picker-option', 'icon picker options should be exposed for QA');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'ICON_PICKER_PAGE_SIZE_OPTIONS = [20, 50, 100, 200]', 'icon picker should follow the standard page-size options');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'Pagination', 'icon picker should support paging through all icons');
mustInclude('src/pages/system/MenuManagementPage.tsx', '共 {totalElements} 条数据', 'icon picker pagination should use the standard total text');
mustInclude('src/pages/system/MenuManagementPage.tsx', 'startAdornment: <InputAdornment position="start" sx={{ mr: 0 }}>每页</InputAdornment>', 'icon picker page-size selector should match the standard pagination control');
mustNotInclude('src/pages/system/MenuManagementPage.tsx', 'DialogActions', 'icon picker should not keep a bottom close action area');
mustNotInclude('src/pages/system/MenuManagementPage.tsx', '当前选择：', 'icon picker should not show current selection below search');
mustNotInclude('src/pages/system/MenuManagementPage.tsx', '{label}选择器', 'icon picker dialog title should not use old selector wording');
mustInclude('src/pages/system/MenuManagementPage.tsx', "key={`root-menu-${rootIndex}`}", 'root menu row key should not depend on editable menu name');
mustInclude('src/pages/system/MenuManagementPage.tsx', "key={`child-menu-${rootIndex}-${childIndex}`}", 'child menu row key should not depend on editable menu name');
mustNotInclude('src/pages/system/MenuManagementPage.tsx', 'key={`${menu.label}-${rootIndex}`}', 'editing a root menu name should not remount the row and blur the input');
mustNotInclude('src/pages/system/MenuManagementPage.tsx', 'key={`${child.label}-${childIndex}`}', 'editing a child menu name should not remount the row and blur the input');
mustNotInclude('src/pages/system/MenuManagementPage.tsx', 'label="模块图标" value={selectedModule.icon}', 'module icon should no longer be a plain text field');
mustNotInclude('src/pages/system/MenuManagementPage.tsx', 'label="图标" value={menu.icon', 'menu icon should no longer be a plain text field');

if (failures.length > 0) {
  console.error('Menu management verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Menu management verification passed.');
