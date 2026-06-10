import { readFileSync } from 'node:fs';

const appLayout = readFileSync(new URL('../src/components/shared/AppLayout.tsx', import.meta.url), 'utf8');
const packageJson = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
const standardDoc = readFileSync(new URL('../../../docs/design-audit/organization-management-ui-standard.md', import.meta.url), 'utf8');
const failures = [];

function mustInclude(token, reason) {
  if (!appLayout.includes(token)) failures.push(`missing ${JSON.stringify(token)} (${reason})`);
}

function mustNotInclude(token, reason) {
  if (appLayout.includes(token)) failures.push(`unexpected ${JSON.stringify(token)} (${reason})`);
}

function mustMatch(pattern, reason) {
  if (!pattern.test(appLayout)) failures.push(`missing ${pattern} (${reason})`);
}

function packageMustInclude(token, reason) {
  if (!packageJson.includes(token)) failures.push(`missing package token ${JSON.stringify(token)} (${reason})`);
}

function docMustInclude(token, reason) {
  if (!standardDoc.includes(token)) failures.push(`missing standard doc token ${JSON.stringify(token)} (${reason})`);
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
mustInclude('getBreadcrumbItems', 'breadcrumb should derive from the active route');
mustInclude('breadcrumbItems.map', 'breadcrumb should render active route levels');
mustInclude('NavigateNextRounded', 'breadcrumb should use compact chevrons');
mustInclude('const initialTabs: AppTab[] = [HOME_TAB];', 'tabs should default to only the home tab');
mustInclude('const [openTabs, setOpenTabs] = useState<AppTab[]>(initialTabs);', 'tabs should be stateful and route-driven');
mustInclude('setOpenTabs((prev) =>', 'route changes should add missing tabs');
mustInclude('openTabs.map((tab)', 'tabs bar should render open tabs instead of static shortcuts');
mustInclude('handleTabClick', 'clicking a tab should navigate to that tab route');
mustInclude('handleCloseTab', 'non-home tabs should be closable');
mustInclude('handleTabContextMenu', 'right-click should open the tab action panel');
mustInclude('tabContextMenu', 'right-click menu state should be tracked');
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
docMustInclude('模块入口高度和最小高度固定为 64px', 'standard should document the module entry height clamp');
docMustInclude('不得在纵向 flex 容器中被拉伸', 'standard should document that module entries must not stretch vertically');

if (failures.length > 0) {
  console.error('App shell verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('App shell verification passed.');
