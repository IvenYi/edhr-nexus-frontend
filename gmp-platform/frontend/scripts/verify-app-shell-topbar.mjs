import { readFileSync } from 'node:fs';

const appLayout = readFileSync(new URL('../src/components/shared/AppLayout.tsx', import.meta.url), 'utf8');
const authApi = readFileSync(new URL('../src/api/auth.ts', import.meta.url), 'utf8');
const packageJson = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
const standardDoc = readFileSync(new URL('../../../docs/design-audit/organization-management-ui-standard.md', import.meta.url), 'utf8');
const failures = [];

function mustInclude(token, reason) {
  if (!appLayout.includes(token)) failures.push(`missing ${JSON.stringify(token)} (${reason})`);
}

function mustNotInclude(token, reason) {
  if (appLayout.includes(token)) failures.push(`unexpected ${JSON.stringify(token)} (${reason})`);
}

function extractBlock(startToken, endToken, reason) {
  const start = appLayout.indexOf(startToken);
  const end = start === -1 ? -1 : appLayout.indexOf(endToken, start);
  if (start === -1 || end === -1) {
    failures.push(`missing block ${JSON.stringify(startToken)}..${JSON.stringify(endToken)} (${reason})`);
    return '';
  }
  return appLayout.slice(start, end);
}

function mustMatch(pattern, reason) {
  if (!pattern.test(appLayout)) failures.push(`missing ${pattern} (${reason})`);
}

function packageMustInclude(token, reason) {
  if (!packageJson.includes(token)) failures.push(`missing package token ${JSON.stringify(token)} (${reason})`);
}

function authApiMustInclude(token, reason) {
  if (!authApi.includes(token)) failures.push(`missing auth api token ${JSON.stringify(token)} (${reason})`);
}

function docMustInclude(token, reason) {
  if (!standardDoc.includes(token)) failures.push(`missing standard doc token ${JSON.stringify(token)} (${reason})`);
}

const routeTabsBlock = extractBlock('const renderRouteTab =', '<Tooltip title="标签操作"', 'route tab style checks should be scoped to the tabs bar');

function routeTabMustInclude(token, reason) {
  if (!routeTabsBlock.includes(token)) failures.push(`missing route tab token ${JSON.stringify(token)} (${reason})`);
}

function routeTabMustNotInclude(token, reason) {
  if (routeTabsBlock.includes(token)) failures.push(`unexpected route tab token ${JSON.stringify(token)} (${reason})`);
}

mustInclude('const MODULE_BAR_WIDTH = 64;', 'module rail should match the narrow reference rail');
mustInclude('const MODULE_ITEM_HEIGHT = 64;', 'module entries should use a fixed 64px height');
mustInclude('const FUNC_MENU_WIDTH = 202;', 'function menu should match the reference width');
mustInclude('const TOP_NAV_HEIGHT = 52;', 'top breadcrumb/name bar should match the reference height');
mustInclude('const TABS_BAR_HEIGHT = 50;', 'tabs bar should match the reference height');
mustInclude('const HEADER_TOTAL_HEIGHT = TOP_NAV_HEIGHT + TABS_BAR_HEIGHT;', 'shell should reserve both header rows');
mustInclude('data-app-shell-header', 'shell header should expose a QA selector');
mustInclude('data-app-top-breadcrumb-bar', 'top breadcrumb bar should expose a QA selector');
mustInclude('data-app-tabs-bar', 'tabs bar should expose a QA selector');
mustInclude('data-app-function-menu-toggle', 'function menu toggle should expose a QA selector');
mustInclude('FunctionMenuToggleIcon', 'function menu toggle should use the requested menu-line arrow icon');
mustInclude("direction={funcMenuOpen ? 'collapse' : 'expand'}", 'function menu toggle should switch icon direction with menu state');
mustInclude("bgcolor: 'transparent'", 'function menu toggle should not have a default filled background');
mustNotInclude('KeyboardDoubleArrowLeftRounded', 'function menu toggle should not use the old double-arrow collapse icon');
mustNotInclude('KeyboardDoubleArrowRightRounded', 'function menu toggle should not use the old double-arrow expand icon');
mustNotInclude('border: `1px solid ${funcMenuOpen ? COLORS.primaryHover : COLORS.divider}`', 'function menu toggle should not have a default border');
mustNotInclude('MenuRounded', 'function menu toggle should not use a generic hamburger icon');
mustInclude('getBreadcrumbItems', 'breadcrumb should derive from the active route');
mustInclude('breadcrumbItems.map', 'breadcrumb should render active route levels');
mustInclude('NavigateNextRounded', 'breadcrumb should use compact chevrons');
mustInclude('AUTH_USER_CHANGE_EVENT', 'app shell should listen for current-user permission refresh events');
mustInclude("import { getMe, logout } from '@/api/auth';", 'app shell should be able to refresh the current user permission snapshot');
mustInclude('refreshCurrentUserFromServer', 'app shell should refresh cached user permissions from /auth/me after migrations or role authorization changes');
mustInclude('getMe()', 'app shell should call the backend current-user API to avoid stale localStorage permissions hiding newly mapped menus');
mustInclude("localStorage.setItem('user', JSON.stringify(refreshedUser));", 'app shell should persist refreshed current-user permissions');
mustInclude("window.dispatchEvent(new CustomEvent(AUTH_USER_CHANGE_EVENT));", 'app shell should notify itself and sibling components after refreshing current-user permissions');
authApiMustInclude("client.get('/auth/me', { skipAuthRedirect: true })", 'silent permission refresh should not clear token or redirect on a transient /auth/me failure');
mustInclude('EMPTY_SIDEBAR_MODULE', 'app shell should not fall back to real menus when no module is authorized');
mustInclude('const [user, setUser] = useState<StoredUser>(() => readStoredUser());', 'app shell should keep current user in state instead of a one-time memo');
mustInclude('setUser(readStoredUser())', 'app shell should refresh current user permissions from localStorage');
mustInclude("window.addEventListener(AUTH_USER_CHANGE_EVENT, refreshStoredUser);", 'app shell should react to same-tab permission changes');
mustInclude("if (event.key === 'user') refreshStoredUser();", 'app shell should react to cross-tab user storage changes');
mustInclude('const hasPermissionSnapshot = Array.isArray(user.permissions);', 'app shell should distinguish missing permission snapshots from explicit empty permissions');
mustInclude('filterModulesByPermissions(sidebarModules, permissionSet)', 'app shell should filter menus whenever current user has an explicit permission list');
mustInclude('if (!permissionSet) return modules;', 'app shell should only show all menus when no permission snapshot exists');
mustInclude('return Boolean(permissionCode && permissionSet.has(permissionCode));', 'unmapped or unauthorized routes should not remain visible under permission filtering');
mustNotInclude('if (permissionSet.size === 0) return modules;', 'empty permission lists should not show every menu');
mustInclude('const initialTabs: AppTab[] = [HOME_TAB];', 'tabs should default to only the home tab');
mustInclude('const [openTabs, setOpenTabs] = useState<AppTab[]>(initialTabs);', 'tabs should be stateful and route-driven');
mustInclude('setOpenTabs((prev) =>', 'route changes should add missing tabs');
mustInclude('const homeTab = openTabs.find((tab) => tab.path === HOME_TAB.path) || HOME_TAB;', 'home tab should remain available even after tab operations');
mustInclude('const scrollableTabs = openTabs.filter((tab) => tab.path !== HOME_TAB.path);', 'non-home tabs should be separated into the scrollable strip');
mustInclude('activeScrollableTabRef', 'active non-home tab should expose a scroll anchor');
mustInclude('requestAnimationFrame', 'active tab scrolling should wait for layout to settle');
mustInclude('scrollIntoView({', 'newly opened or selected tabs should scroll into view');
mustInclude("inline: 'nearest'", 'active tab scrolling should keep movement minimal');
mustInclude('{showIcon && getIcon(tab.iconName)}', 'route tab icons should be opt-in instead of always shown');
routeTabMustInclude('renderRouteTab(homeTab, true)', 'home tab should render outside the scrollable strip and keep its icon');
mustInclude('data-app-home-tab', 'home tab should expose a QA selector');
routeTabMustInclude('data-app-tabs-scroll-area', 'scrollable non-home tabs should expose a QA selector');
routeTabMustInclude('scrollableTabs.map((tab) => renderRouteTab(tab))', 'only non-home tabs should render in the scrollable strip');
mustInclude('data-app-active-tab-anchor', 'active non-home tab should expose an anchor selector');
routeTabMustNotInclude('{getIcon(tab.iconName)}', 'non-home route tabs should not render menu icons unconditionally');
mustInclude('handleTabClick', 'clicking a tab should navigate to that tab route');
mustInclude('handleCloseTab', 'non-home tabs should be closable');
mustInclude('handleTabContextMenu', 'right-click should open the tab action panel');
mustInclude('tabContextMenu', 'right-click menu state should be tracked');
routeTabMustInclude('height: 40', 'all route tabs should use the same fixed height');
routeTabMustInclude('minHeight: 40', 'route tabs should not shrink below the fixed height');
routeTabMustInclude("px: '18px'", 'all route tabs should use the same horizontal padding');
routeTabMustInclude("mr: '10px'", 'all route tabs should use the same right spacing');
routeTabMustInclude('boxSizing: \'border-box\'', 'route tab sizing should include padding without changing total height');
routeTabMustInclude('fontWeight: 500', 'route tabs should not change weight when active');
routeTabMustInclude("bgcolor: isActive ? COLORS.primaryLight : 'transparent'", 'active route tab should own the blue selected background');
routeTabMustInclude("bgcolor: isActive ? COLORS.primaryLight : '#f5f7fa'", 'hover route tab should use gray background unless already active');
routeTabMustNotInclude('height: isActive ?', 'route tabs should not change height when selected');
routeTabMustNotInclude('px: isActive ?', 'route tabs should not change padding when selected');
routeTabMustNotInclude('mr: isActive ?', 'route tabs should not change spacing when selected');
routeTabMustNotInclude('fontWeight: isActive ?', 'route tabs should not change weight when selected');
mustInclude('刷新', 'right-click panel should include refresh');
mustInclude('关闭其他', 'right-click panel should include close others');
mustInclude('关闭左侧', 'right-click panel should include close left');
mustInclude('关闭右侧', 'right-click panel should include close right');
mustInclude('关闭全部', 'right-click panel should include close all');
mustInclude('CloseRounded', 'closable tabs should show a close icon');
mustInclude('AppsRounded', 'tabs bar should keep the right action icon');
mustInclude('LockOutlined', 'top utility area should include lock icon');
mustInclude('SearchRounded', 'top utility area should include search icon');
mustInclude('FullscreenRounded', 'top utility area should include fullscreen icon');
mustInclude('TranslateRounded', 'top utility area should include language icon');
mustInclude('ColorLensOutlined', 'top utility area should include theme icon');
mustInclude('RefreshRounded', 'top utility area should include refresh icon');
mustInclude('KeyboardArrowDownRounded', 'user name should include a dropdown arrow');
mustInclude('badgeContent={4}', 'notification badge should match the visible reference count');
mustInclude('data-app-module-rail', 'module rail should expose a QA selector');
mustInclude('data-app-function-menu', 'function menu should expose a QA selector');
mustInclude('height: MODULE_ITEM_HEIGHT', 'module entries should clamp height to 64px');
mustInclude('minHeight: MODULE_ITEM_HEIGHT', 'module entries should clamp minimum height to 64px');
mustMatch(
  /width:\s*54,\n\s*height:\s*MODULE_ITEM_HEIGHT,\n\s*minHeight:\s*MODULE_ITEM_HEIGHT,\n\s*flex:\s*'0 0 auto'/,
  'module entry style should clamp height and disable flex growth in the same block',
);
mustInclude('height: \'100vh\'', 'left navigation columns should fill the viewport height');
mustInclude('left: `${effectiveSidebarWidth}px`', 'top shell should start to the right of the active sidebar');
mustInclude('width: `calc(100vw - ${effectiveSidebarWidth}px)`', 'top shell width should shrink by the active sidebar width');
mustInclude("mt: `${HEADER_TOTAL_HEIGHT}px`", 'main content should start below the two-row shell header');
mustMatch(/ml:\s*`\$\{effectiveSidebarWidth\}px`/, 'main content should still be offset by the sidebar width');

mustNotInclude('headerShortcutTabs', 'tabs should not be a static shortcut list');
mustNotInclude("width: '100vw'", 'top shell should not cover the full viewport over the left navigation');
mustNotInclude('top: HEADER_TOTAL_HEIGHT', 'left navigation should not start below the top shell');

packageMustInclude('"verify:app-shell"', 'package script should expose the app shell verifier');
docMustInclude('默认只保留“首页”标签', 'standard should document the default tab behavior');
docMustInclude('右键标签时显示操作面板', 'standard should document the context menu behavior');
docMustInclude('标签项尺寸必须一致', 'standard should document consistent tab sizing');
docMustInclude('标签 hover 和选中样式必须区分', 'standard should document different hover and selected states');
docMustInclude('首页标签必须固定显示', 'standard should document the fixed home tab');
docMustInclude('除“首页”以外的标签不展示菜单图标', 'standard should document non-home tabs without menu icons');
docMustInclude('新打开或切换到的菜单标签必须自动滚动到可视区域', 'standard should document active tab scroll anchoring');
docMustInclude('模块入口高度和最小高度固定为 64px', 'standard should document the module entry height clamp');
docMustInclude('不得在纵向 flex 容器中被拉伸', 'standard should document that module entries must not stretch vertically');

if (failures.length > 0) {
  console.error('App shell verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('App shell verification passed.');
