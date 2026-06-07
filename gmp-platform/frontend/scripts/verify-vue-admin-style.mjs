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
mustInclude('src/components/shared/AppLayout.tsx', /const TOP_NAV_HEIGHT\s*=\s*60\b/, 'Vue Admin Plus top nav height');
mustInclude('src/components/shared/AppLayout.tsx', /const TABS_BAR_HEIGHT\s*=\s*50\b/, 'Vue Admin Plus tabs bar height');
mustInclude('src/components/shared/AppLayout.tsx', /const HEADER_TOTAL_HEIGHT\s*=\s*TOP_NAV_HEIGHT\s*\+\s*TABS_BAR_HEIGHT\b/, 'combined header height should derive from top nav and tabs bar');
mustInclude('src/components/shared/AppLayout.tsx', /sidebarDark:\s*'#282c34'/, 'dark module rail background');
mustInclude('src/components/shared/AppLayout.tsx', /funcMenuBg:\s*'#ffffff'/, 'white secondary menu and header areas');
mustInclude('src/components/shared/AppLayout.tsx', /useMediaQuery/, 'shell should detect mobile breakpoints');
mustInclude('src/components/shared/AppLayout.tsx', /const effectiveSidebarWidth\s*=\s*isMobile\s*\?\s*0\s*:\s*sidebarTotalWidth\b/, 'mobile content should not be pushed by the sidebar');
mustInclude('src/components/shared/AppLayout.tsx', /left:\s*`\$\{effectiveSidebarWidth\}px`/, 'header and tabs should offset by effective sidebar width');
mustInclude('src/components/shared/AppLayout.tsx', /ml:\s*`\$\{effectiveSidebarWidth\}px`/, 'content should offset by effective sidebar width');
mustInclude('src/components/shared/AppLayout.tsx', /display:\s*isMobile\s*&&\s*!funcMenuOpen\s*\?\s*'none'\s*:\s*'flex'/, 'mobile module rail should be hidden unless overlay is open');
mustInclude('src/components/shared/AppLayout.tsx', /display:\s*isMobile\s*&&\s*!funcMenuOpen\s*\?\s*'none'\s*:\s*'block'/, 'mobile function menu should be hidden unless overlay is open');
mustInclude('src/components/shared/AppLayout.tsx', /isMobile\s*&&\s*funcMenuOpen\s*&&\s*\(/, 'mobile overlay close affordance should render only when the overlay is open');
mustInclude('src/components/shared/AppLayout.tsx', /data-mobile-sidebar-backdrop/, 'mobile sidebar should have an outside-click backdrop close path');
mustInclude('src/components/shared/AppLayout.tsx', /onClick=\{\(\)\s*=>\s*setFuncMenuOpen\(false\)\}/, 'mobile sidebar close affordance should close the overlay');
mustInclude('src/components/shared/AppLayout.tsx', /(?:p|padding):\s*['"]20px['"]/, 'main content should use 20px padding');

if (failures.length > 0) {
  console.error('Style constraint verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Style constraint verification passed.');
