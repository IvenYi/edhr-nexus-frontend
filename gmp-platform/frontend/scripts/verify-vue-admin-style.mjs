import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const failures = [];

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

mustInclude('src/App.tsx', /main:\s*'#1890ff'/, 'Vue Admin Plus primary color');
mustInclude('src/App.tsx', /default:\s*'#f6f8f9'/, 'workspace background');
mustInclude('src/App.tsx', /borderRadius:\s*5/, '5px base radius');
mustInclude('src/App.tsx', /'PingFang SC',\s*Arial,\s*'Microsoft YaHei',\s*sans-serif/, 'target Chinese admin font stack');
mustInclude('src/App.tsx', /sizeSmall:\s*{[\s\S]*?height:\s*32/, 'compact 32px controls');
mustInclude('src/App.tsx', /boxShadow:\s*'none'/, 'no heavy card/button shadows');
mustInclude('src/App.tsx', /#f5f7fa/, 'table header background');
mustInclude('src/App.tsx', /#909399/, 'secondary/table header text');
mustInclude('src/index.css', /background-color:\s*#f6f8f9/, 'body background');
mustInclude('src/index.css', /color:\s*#515a6e/, 'body text color');
mustNotInclude('src/index.css', "Noto Sans SC", 'old font stack should be replaced');
mustNotInclude('src/App.tsx', /root:\s*{\s*height:\s*32,\s*padding:\s*'8px 15px'/, 'button root should not force fixed height');
mustInclude('src/App.tsx', /MuiTextField:\s*{[\s\S]*?defaultProps:\s*{[\s\S]*?size:\s*'small'/, 'text fields should default to small size');
mustInclude('src/App.tsx', /& \.MuiOutlinedInput-root:not\(\.MuiInputBase-multiline\)/, 'compact text field sizing should skip multiline inputs');
mustNotInclude('src/App.tsx', /MuiTableRow:\s*{[\s\S]*?root:\s*{\s*height:\s*72/, 'table rows should not force fixed height');

mustInclude('src/components/shared/AppLayout.tsx', /const MODULE_BAR_WIDTH\s*=\s*64\b/, 'Vue Admin Plus dark module rail width');
mustInclude('src/components/shared/AppLayout.tsx', /const FUNC_MENU_WIDTH\s*=\s*202\b/, 'Vue Admin Plus function menu width');
mustInclude('src/components/shared/AppLayout.tsx', /sidebarDark:\s*'#282c34'/, 'dark module rail background');
mustInclude('src/components/shared/AppLayout.tsx', /funcMenuBg:\s*'#ffffff'/, 'white secondary menu and header areas');
mustInclude('src/components/shared/AppLayout.tsx', 'eDHR 系统', 'function menu should carry the app brand like the reference shell');
mustInclude('src/components/shared/AppLayout.tsx', 'activeModule.label', 'function menu heading should switch with the active module');
mustInclude('src/components/shared/AppLayout.tsx', 'flattenModuleMenus', 'function menu should flatten module children into a two-level module/menu model');
mustInclude('src/components/shared/AppLayout.tsx', 'renderedMenus', 'function menu should render the flattened active module menu list');
mustInclude('src/components/shared/AppLayout.tsx', /borderBottom:\s*`1px solid \$\{COLORS\.divider\}`/, 'active module title should sit under a divider like the reference');
mustInclude('src/components/shared/AppLayout.tsx', /useMediaQuery/, 'shell should detect mobile breakpoints');
mustInclude('src/components/shared/AppLayout.tsx', /const effectiveSidebarWidth\s*=\s*isMobile\s*\?\s*0\s*:\s*sidebarTotalWidth\b/, 'mobile content should not be pushed by the sidebar');
mustInclude('src/components/shared/AppLayout.tsx', /ml:\s*`\$\{effectiveSidebarWidth\}px`/, 'content should offset by effective sidebar width');
mustInclude('src/components/shared/AppLayout.tsx', /display:\s*isMobile\s*&&\s*!funcMenuOpen\s*\?\s*'none'\s*:\s*'flex'/, 'mobile module rail should be hidden unless overlay is open');
mustInclude('src/components/shared/AppLayout.tsx', /display:\s*isMobile\s*&&\s*!funcMenuOpen\s*\?\s*'none'\s*:\s*'block'/, 'mobile function menu should be hidden unless overlay is open');
mustInclude('src/components/shared/AppLayout.tsx', /isMobile\s*&&\s*funcMenuOpen\s*&&\s*\(/, 'mobile overlay close affordance should render only when the overlay is open');
mustInclude('src/components/shared/AppLayout.tsx', /data-mobile-sidebar-backdrop/, 'mobile sidebar should have an outside-click backdrop close path');
mustInclude('src/components/shared/AppLayout.tsx', /onClick=\{\(\)\s*=>\s*setFuncMenuOpen\(false\)\}/, 'mobile sidebar close affordance should close the overlay');
mustInclude('src/components/shared/AppLayout.tsx', /(?:p|padding):\s*['"]20px['"]/, 'main content should use 20px padding');
mustNotInclude('src/components/shared/AppLayout.tsx', 'AppBar', 'reference shell should not keep a top app bar');
mustNotInclude('src/components/shared/AppLayout.tsx', 'Toolbar', 'reference shell should not keep a top toolbar');
mustNotInclude('src/components/shared/AppLayout.tsx', 'Collapse', 'function menu should not render a third expandable level');
mustNotInclude('src/components/shared/AppLayout.tsx', 'ExpandLess', 'function menu should not render expand controls');
mustNotInclude('src/components/shared/AppLayout.tsx', 'ExpandMore', 'function menu should not render expand controls');

mustInclude('src/pages/LoginPage.tsx', /flex:\s*'0 0 480px'/, 'restored login desktop brand panel width');
mustInclude('src/pages/LoginPage.tsx', /display:\s*\{\s*xs:\s*'none',\s*md:\s*'flex'\s*\}/, 'restored login should hide brand panel on mobile');
mustInclude('src/pages/LoginPage.tsx', 'eDHR 系统', 'restored login brand title');
mustInclude('src/pages/LoginPage.tsx', '21 CFR Part 11', 'restored login compliance standard');
mustInclude('src/pages/LoginPage.tsx', '登录 eDHR', 'restored login form title');
mustInclude('src/pages/LoginPage.tsx', /minWidth:\s*0/, 'mobile login flex item should be allowed to shrink');
mustInclude('src/pages/LoginPage.tsx', /boxSizing:\s*'border-box'/, 'mobile login card width should include padding');

mustInclude('src/pages/dashboard/DashboardPage.tsx', 'cardSx', 'shared dashboard card style');
mustInclude('src/pages/dashboard/DashboardPage.tsx', "border: '1px solid #e4e7ed'", 'dashboard card border');
mustInclude('src/pages/dashboard/DashboardPage.tsx', "boxShadow: 'none'", 'dashboard card shadow removed');
mustInclude('src/pages/dashboard/DashboardPage.tsx', 'width: 40', 'compact shortcut icon size');
mustNotInclude('src/pages/dashboard/DashboardPage.tsx', 'borderRadius: 2.5', 'old oversized icon radius removed');
mustNotInclude('src/pages/dashboard/DashboardPage.tsx', "variant=\"h4\"", 'oversized page title removed');
mustInclude(
  'src/pages/dashboard/DashboardPage.tsx',
  /CardContent\s+sx=\{\{[\s\S]*?p:\s*'16px 12px'[\s\S]*?'&:last-child':\s*\{\s*pb:\s*'16px'\s*\}/,
  'quick-entry last-child padding override',
);

if (failures.length > 0) {
  console.error('Style constraint verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Style constraint verification passed.');
