# Vue Admin Plus UI First-Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the current React + MUI frontend so its first-pass visual system follows the Vue Admin Plus UI style constraints.

**Architecture:** Keep the existing React, MUI, Vite, routing, auth, and API code. Add a lightweight source-level style verifier, then update global theme tokens, the app shell, login page, and dashboard so existing business pages inherit the new style without page-by-page rewrites.

**Tech Stack:** React 18, TypeScript, Vite 5, MUI 5, Node.js script-based verification, browser visual QA.

---

## File Structure

- Create: `gmp-platform/frontend/scripts/verify-vue-admin-style.mjs`
  - Source-level verifier that asserts critical Vue Admin Plus style tokens are present in the files changed by this pass.
- Modify: `gmp-platform/frontend/src/App.tsx`
  - Global MUI theme tokens and component overrides.
- Modify: `gmp-platform/frontend/src/index.css`
  - Body font, background, text color, scrollbars, and low-motion utilities.
- Modify: `gmp-platform/frontend/src/components/shared/AppLayout.tsx`
  - Fixed 266px dual-column sidebar, 60px top nav, 50px tabs bar, and 20px content padding.
- Modify: `gmp-platform/frontend/src/pages/LoginPage.tsx`
  - Vue Admin Plus-like login composition with cool technical background and right-side login panel.
- Modify: `gmp-platform/frontend/src/pages/dashboard/DashboardPage.tsx`
  - Denser operational dashboard cards and panels.

## Task 1: Theme Tokens And Global CSS

**Files:**
- Create: `gmp-platform/frontend/scripts/verify-vue-admin-style.mjs`
- Modify: `gmp-platform/frontend/src/App.tsx`
- Modify: `gmp-platform/frontend/src/index.css`
- Test: `gmp-platform/frontend/scripts/verify-vue-admin-style.mjs`

- [ ] **Step 1: Write the failing verifier**

Create `gmp-platform/frontend/scripts/verify-vue-admin-style.mjs`:

```js
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const failures = [];

function mustInclude(file, token, reason) {
  const content = read(file);
  if (!content.includes(token)) {
    failures.push(`${file}: missing ${JSON.stringify(token)} (${reason})`);
  }
}

function mustNotInclude(file, token, reason) {
  const content = read(file);
  if (content.includes(token)) {
    failures.push(`${file}: should not include ${JSON.stringify(token)} (${reason})`);
  }
}

mustInclude('src/App.tsx', "main: '#1890ff'", 'Vue Admin Plus primary color');
mustInclude('src/App.tsx', "default: '#f6f8f9'", 'workspace background');
mustInclude('src/App.tsx', "borderRadius: 5", '5px base radius');
mustInclude('src/App.tsx', "'PingFang SC', Arial, 'Microsoft YaHei', sans-serif", 'target Chinese admin font stack');
mustInclude('src/App.tsx', "height: 32", 'compact 32px controls');
mustInclude('src/App.tsx', "boxShadow: 'none'", 'no heavy card/button shadows');
mustInclude('src/App.tsx', "#f5f7fa", 'table header background');
mustInclude('src/App.tsx', "#909399", 'secondary/table header text');
mustInclude('src/index.css', "background-color: #f6f8f9", 'body background');
mustInclude('src/index.css', "color: #515a6e", 'body text color');
mustNotInclude('src/index.css', "Noto Sans SC", 'old font stack should be replaced');

if (failures.length > 0) {
  console.error('Style constraint verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Style constraint verification passed.');
```

- [ ] **Step 2: Run the verifier and confirm it fails**

Run:

```bash
cd gmp-platform/frontend
node scripts/verify-vue-admin-style.mjs
```

Expected: FAIL with messages for missing `#1890ff`, `#f6f8f9`, `borderRadius: 5`, and the target font stack.

- [ ] **Step 3: Update the MUI theme**

In `gmp-platform/frontend/src/App.tsx`, replace the current `createTheme({ ... })` theme with a Vue Admin Plus-aligned theme. Preserve the existing providers and `queryClient`.

Use these exact token values inside the theme:

```ts
const theme = createTheme({
  palette: {
    primary: {
      main: '#1890ff',
      light: '#40a9ff',
      dark: '#096dd9',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#41b584',
      light: '#67c23a',
      dark: '#2f8f68',
      contrastText: '#ffffff',
    },
    success: {
      main: '#13ce66',
      light: '#67c23a',
      dark: '#0c9f4d',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ffba00',
      light: '#ffd666',
      dark: '#d48806',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ff4d4f',
      light: '#ff7875',
      dark: '#cf1322',
      contrastText: '#ffffff',
    },
    info: {
      main: '#909399',
      light: '#c0c4cc',
      dark: '#606266',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f6f8f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#303133',
      secondary: '#606266',
      disabled: '#909399',
    },
    divider: '#e4e7ed',
  },
  typography: {
    fontFamily: "'PingFang SC', Arial, 'Microsoft YaHei', sans-serif",
    fontSize: 14,
    h4: { fontSize: 20, fontWeight: 700, lineHeight: 1.3 },
    h5: { fontSize: 18, fontWeight: 600, lineHeight: 1.35 },
    h6: { fontSize: 16, fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: 14, lineHeight: 1.5 },
    body2: { fontSize: 14, lineHeight: 1.5 },
    caption: { fontSize: 12, lineHeight: 1.4 },
  },
  shape: {
    borderRadius: 5,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f6f8f9',
          color: '#515a6e',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          height: 32,
          padding: '8px 15px',
          borderRadius: 5,
          textTransform: 'none',
          fontSize: 14,
          fontWeight: 500,
          transition: 'all 0.1s ease',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 5,
          boxShadow: 'none',
          border: '1px solid #e4e7ed',
          backgroundImage: 'none',
          overflow: 'hidden',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 20,
          '&:last-child': { paddingBottom: 20 },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#303133',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          borderBottom: 'none',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            height: 63,
            padding: '8px 16px',
            fontWeight: 600,
            fontSize: 14,
            color: '#909399',
            backgroundColor: '#f5f7fa',
            borderBottom: '1px solid #ebeef5',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
          color: '#606266',
          borderBottom: '1px solid #ebeef5',
          fontSize: 14,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          height: 72,
          '&:hover': { backgroundColor: '#f6f8f9' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: 24,
          borderRadius: 5,
          fontSize: 12,
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 5,
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: 32,
            borderRadius: 5,
            backgroundColor: '#ffffff',
          },
          '& .MuiOutlinedInput-input': {
            padding: '7px 11px',
            fontSize: 14,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#dcdfe6',
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        ul: {
          '& .MuiPaginationItem-root': {
            width: 32,
            height: 32,
            margin: '0 4px',
            borderRadius: 2,
            color: '#303133',
            backgroundColor: '#f0f2f5',
            '&.Mui-selected': {
              backgroundColor: '#1890ff',
              color: '#ffffff',
              fontWeight: 700,
            },
          },
        },
      },
    },
  },
});
```

- [ ] **Step 4: Update global CSS**

Replace `gmp-platform/frontend/src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: 'PingFang SC', Arial, 'Microsoft YaHei', sans-serif;
  background-color: #f6f8f9;
  color: #515a6e;
  font-size: 14px;
}

#root {
  min-height: 100vh;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.25s ease-out;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: #c0c4cc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #909399;
}
```

- [ ] **Step 5: Run verifier and build**

Run:

```bash
cd gmp-platform/frontend
node scripts/verify-vue-admin-style.mjs
npm run build
```

Expected: verifier passes, build exits 0.

- [ ] **Step 6: Commit**

```bash
git add gmp-platform/frontend/scripts/verify-vue-admin-style.mjs gmp-platform/frontend/src/App.tsx gmp-platform/frontend/src/index.css
git commit -m "feat: align frontend theme with vue admin plus"
```

## Task 2: App Shell Layout

**Files:**
- Modify: `gmp-platform/frontend/scripts/verify-vue-admin-style.mjs`
- Modify: `gmp-platform/frontend/src/components/shared/AppLayout.tsx`
- Test: `gmp-platform/frontend/scripts/verify-vue-admin-style.mjs`

- [ ] **Step 1: Extend verifier with shell checks**

Add these checks before the final `if (failures.length > 0)` block in `gmp-platform/frontend/scripts/verify-vue-admin-style.mjs`:

```js
mustInclude('src/components/shared/AppLayout.tsx', 'const MODULE_BAR_WIDTH = 64', '64px dark module rail');
mustInclude('src/components/shared/AppLayout.tsx', 'const FUNC_MENU_WIDTH = 202', '266px total sidebar');
mustInclude('src/components/shared/AppLayout.tsx', 'const TOP_NAV_HEIGHT = 60', '60px top nav');
mustInclude('src/components/shared/AppLayout.tsx', 'const TABS_BAR_HEIGHT = 50', '50px tabs bar');
mustInclude('src/components/shared/AppLayout.tsx', 'const HEADER_TOTAL_HEIGHT = TOP_NAV_HEIGHT + TABS_BAR_HEIGHT', '110px fixed header');
mustInclude('src/components/shared/AppLayout.tsx', "bgcolor: '#282c34'", 'dark primary rail');
mustInclude('src/components/shared/AppLayout.tsx', "bgcolor: '#ffffff'", 'white secondary menu/header areas');
mustInclude('src/components/shared/AppLayout.tsx', "ml: `${sidebarTotalWidth}px`", 'content starts after sidebar');
mustInclude('src/components/shared/AppLayout.tsx', "p: '20px'", 'main content padding');
```

- [ ] **Step 2: Run verifier and confirm it fails**

Run:

```bash
cd gmp-platform/frontend
node scripts/verify-vue-admin-style.mjs
```

Expected: FAIL with AppLayout token messages.

- [ ] **Step 3: Update layout constants and colors**

In `gmp-platform/frontend/src/components/shared/AppLayout.tsx`, replace the current `COLORS` and layout constants with:

```ts
const COLORS = {
  primary: '#1890ff',
  primaryLight: '#e8f4ff',
  primaryHover: '#d1e9ff',
  success: '#13ce66',
  warning: '#ffba00',
  error: '#ff4d4f',
  errorBg: '#fff1f0',
  textPrimary: '#303133',
  textSecondary: '#606266',
  textDisabled: '#909399',
  divider: '#e4e7ed',
  sidebarDark: '#282c34',
  sidebarDarkText: 'hsla(0,0%,100%,.95)',
  funcMenuBg: '#ffffff',
  pageBg: '#f6f8f9',
  shadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
};

const MODULE_BAR_WIDTH = 64;
const FUNC_MENU_WIDTH = 202;
const TOP_NAV_HEIGHT = 60;
const TABS_BAR_HEIGHT = 50;
const HEADER_TOTAL_HEIGHT = TOP_NAV_HEIGHT + TABS_BAR_HEIGHT;
```

- [ ] **Step 4: Add current title helper**

Add this helper below `getInitialExpandedMenus`:

```ts
function getCurrentPageTitle(module: SidebarModule, pathname: string): string {
  for (const menu of module.menus) {
    if (menu.path && matchPath(menu.path, pathname)) return menu.label;
    const child = menu.children?.find((item) => matchPath(item.path, pathname));
    if (child) return child.label;
  }
  return module.label;
}
```

- [ ] **Step 5: Replace header, sidebar positioning, tabs, and main content layout**

Adjust the JSX so the sidebar starts at top `0`, the top nav starts at `left: sidebarTotalWidth`, and a tabs strip appears under the top nav. Preserve existing menu data, menu expansion behavior, logout behavior, and navigation behavior.

Key style requirements to apply:

```ts
const currentPageTitle = getCurrentPageTitle(activeModule, location.pathname);
const sidebarTotalWidth = MODULE_BAR_WIDTH + (funcMenuOpen ? FUNC_MENU_WIDTH : 0);
```

Use a top nav container with:

```ts
position: 'fixed',
top: 0,
left: `${sidebarTotalWidth}px`,
right: 0,
height: TOP_NAV_HEIGHT,
bgcolor: '#ffffff',
boxShadow: COLORS.shadow,
zIndex: 1300,
px: '20px',
```

Use a tabs bar with:

```ts
position: 'fixed',
top: TOP_NAV_HEIGHT,
left: `${sidebarTotalWidth}px`,
right: 0,
height: TABS_BAR_HEIGHT,
bgcolor: '#ffffff',
px: '20px',
display: 'flex',
alignItems: 'center',
boxShadow: COLORS.shadow,
zIndex: 1299,
```

Render two tab chips:

```tsx
<Box sx={{ height: 40, px: '20px', display: 'flex', alignItems: 'center', color: COLORS.textSecondary }}>
  首页
</Box>
<Box sx={{ height: 40, px: '30px 20px', display: 'flex', alignItems: 'center', bgcolor: COLORS.primaryLight, color: COLORS.primary, fontWeight: 500, borderRadius: '5px' }}>
  {currentPageTitle}
</Box>
```

Use main content styles:

```ts
ml: `${sidebarTotalWidth}px`,
mt: `${HEADER_TOTAL_HEIGHT}px`,
p: '20px',
minHeight: `calc(100vh - ${HEADER_TOTAL_HEIGHT}px)`,
bgcolor: COLORS.pageBg,
```

- [ ] **Step 6: Run verifier and build**

Run:

```bash
cd gmp-platform/frontend
node scripts/verify-vue-admin-style.mjs
npm run build
```

Expected: verifier passes, build exits 0.

- [ ] **Step 7: Commit**

```bash
git add gmp-platform/frontend/scripts/verify-vue-admin-style.mjs gmp-platform/frontend/src/components/shared/AppLayout.tsx
git commit -m "feat: add vue admin plus app shell"
```

## Task 3: Login Page

**Files:**
- Modify: `gmp-platform/frontend/scripts/verify-vue-admin-style.mjs`
- Modify: `gmp-platform/frontend/src/pages/LoginPage.tsx`
- Test: `gmp-platform/frontend/scripts/verify-vue-admin-style.mjs`

- [ ] **Step 1: Extend verifier with login checks**

Add these checks before the final `if (failures.length > 0)` block:

```js
mustInclude('src/pages/LoginPage.tsx', "backgroundSize: 'cover'", 'login background cover behavior');
mustInclude('src/pages/LoginPage.tsx', "ml: 'auto'", 'right-positioned login panel');
mustInclude('src/pages/LoginPage.tsx', 'width: 349', 'observed login panel width');
mustInclude('src/pages/LoginPage.tsx', 'minHeight: 583', 'observed login panel height');
mustInclude('src/pages/LoginPage.tsx', 'height: 50', '50px login controls');
mustNotInclude('src/pages/LoginPage.tsx', 'radial-gradient(circle', 'old decorative radial circles removed');
mustNotInclude('src/pages/LoginPage.tsx', 'backdropFilter', 'avoid glassmorphism');
```

- [ ] **Step 2: Run verifier and confirm it fails**

Run:

```bash
cd gmp-platform/frontend
node scripts/verify-vue-admin-style.mjs
```

Expected: FAIL with LoginPage token messages.

- [ ] **Step 3: Rework login page JSX**

In `gmp-platform/frontend/src/pages/LoginPage.tsx`, keep state, `handleSubmit`, `client.post('/auth/login', ...)`, localStorage writes, and navigation unchanged.

Replace the returned JSX with a full-screen background and right-side card:

```tsx
return (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
      backgroundColor: '#0f3765',
      backgroundImage: `
        linear-gradient(120deg, rgba(8, 34, 68, 0.92), rgba(24, 144, 255, 0.26)),
        linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
      `,
      backgroundSize: 'cover, 44px 44px, 44px 44px',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      px: { xs: 2, md: '5vw' },
    }}
  >
    <Box
      sx={{
        width: 349,
        minHeight: 583,
        ml: 'auto',
        mt: 'calc(50vh - 277.5px)',
        mb: '5vw',
        p: '4.5vh',
        color: '#ffffff',
      }}
    >
      <Typography sx={{ fontSize: 54, fontWeight: 500, lineHeight: 1.1, color: '#ffffff' }}>
        eDHR
      </Typography>
      <Typography sx={{ mt: '29px', fontSize: 26, fontWeight: 400, color: '#ffffff' }}>
        电子批记录平台
      </Typography>
      <Card
        sx={{
          mt: 5,
          p: 3,
          backgroundColor: 'rgba(255,255,255,0.88)',
          border: '1px solid rgba(255,255,255,0.45)',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '5px' }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            placeholder="用户名"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            sx={{ mb: 2, '& .MuiInputBase-root': { height: 50 } }}
            InputProps={{ startAdornment: <PersonOutline sx={{ mr: 1, color: '#909399' }} /> }}
          />
          <TextField
            placeholder="密码"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 3, '& .MuiInputBase-root': { height: 50 } }}
            InputProps={{ startAdornment: <LockOutlined sx={{ mr: 1, color: '#909399' }} /> }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ width: 220, height: 50, mx: 'auto', display: 'flex', fontSize: 14 }}
          >
            {loading ? '登录中...' : '登 录'}
          </Button>
        </form>
      </Card>
      <Typography sx={{ position: 'fixed', bottom: 20, left: 0, right: 0, textAlign: 'center', color: '#ffffff', fontSize: 12 }}>
        Zencas eDHR Platform
      </Typography>
    </Box>
  </Box>
);
```

- [ ] **Step 4: Remove unused imports**

Remove imports that are no longer used by the reworked page. The final MUI import should be:

```ts
import {
  Box, Card, TextField, Button, Typography, Alert,
} from '@mui/material';
```

The final icon import should be:

```ts
import {
  LockOutlined, PersonOutline,
} from '@mui/icons-material';
```

- [ ] **Step 5: Run verifier and build**

Run:

```bash
cd gmp-platform/frontend
node scripts/verify-vue-admin-style.mjs
npm run build
```

Expected: verifier passes, build exits 0.

- [ ] **Step 6: Commit**

```bash
git add gmp-platform/frontend/scripts/verify-vue-admin-style.mjs gmp-platform/frontend/src/pages/LoginPage.tsx
git commit -m "feat: restyle login page for vue admin plus"
```

## Task 4: Dashboard Density

**Files:**
- Modify: `gmp-platform/frontend/scripts/verify-vue-admin-style.mjs`
- Modify: `gmp-platform/frontend/src/pages/dashboard/DashboardPage.tsx`
- Test: `gmp-platform/frontend/scripts/verify-vue-admin-style.mjs`

- [ ] **Step 1: Extend verifier with dashboard checks**

Add these checks before the final `if (failures.length > 0)` block:

```js
mustInclude('src/pages/dashboard/DashboardPage.tsx', 'cardSx', 'shared dashboard card style');
mustInclude('src/pages/dashboard/DashboardPage.tsx', "border: '1px solid #e4e7ed'", 'dashboard card border');
mustInclude('src/pages/dashboard/DashboardPage.tsx', "boxShadow: 'none'", 'dashboard card shadow removed');
mustInclude('src/pages/dashboard/DashboardPage.tsx', 'width: 40', 'compact shortcut icon size');
mustNotInclude('src/pages/dashboard/DashboardPage.tsx', 'borderRadius: 2.5', 'old oversized icon radius removed');
mustNotInclude('src/pages/dashboard/DashboardPage.tsx', "variant=\"h4\"", 'oversized page title removed');
```

- [ ] **Step 2: Run verifier and confirm it fails**

Run:

```bash
cd gmp-platform/frontend
node scripts/verify-vue-admin-style.mjs
```

Expected: FAIL with DashboardPage token messages.

- [ ] **Step 3: Add shared dashboard card styles**

In `gmp-platform/frontend/src/pages/dashboard/DashboardPage.tsx`, add this constant above `export default function DashboardPage()`:

```ts
const cardSx = {
  border: '1px solid #e4e7ed',
  borderRadius: '5px',
  boxShadow: 'none',
  backgroundColor: '#ffffff',
  '&:hover': {
    borderColor: '#d1e9ff',
  },
};
```

- [ ] **Step 4: Reduce title and card density**

Update the top title from `variant="h4"` to explicit compact typography:

```tsx
<Typography sx={{ mb: 0.5, fontSize: 20, fontWeight: 700, color: '#303133' }}>
  首页工作台
</Typography>
<Typography variant="body2" color="text.secondary" sx={{ mb: '20px' }}>
  欢迎回来，以下是你当前的工作概览
</Typography>
```

Apply `sx={cardSx}` to dashboard `Card` components. For stat card content, use:

```tsx
<CardContent sx={{ p: '20px' }}>
```

For stat icons, use:

```tsx
width: 40,
height: 40,
borderRadius: '5px',
```

For quick entry cards, use:

```tsx
<Card sx={cardSx}>
  <CardActionArea onClick={() => navigate(entry.path)} sx={{ height: 104 }}>
    <CardContent sx={{ textAlign: 'center', p: '16px 12px' }}>
```

- [ ] **Step 5: Run verifier and build**

Run:

```bash
cd gmp-platform/frontend
node scripts/verify-vue-admin-style.mjs
npm run build
```

Expected: verifier passes, build exits 0.

- [ ] **Step 6: Commit**

```bash
git add gmp-platform/frontend/scripts/verify-vue-admin-style.mjs gmp-platform/frontend/src/pages/dashboard/DashboardPage.tsx
git commit -m "feat: tighten dashboard admin styling"
```

## Task 5: Browser Verification And Final Polish

**Files:**
- Modify only if browser verification shows a visible mismatch:
  - `gmp-platform/frontend/src/App.tsx`
  - `gmp-platform/frontend/src/index.css`
  - `gmp-platform/frontend/src/components/shared/AppLayout.tsx`
  - `gmp-platform/frontend/src/pages/LoginPage.tsx`
  - `gmp-platform/frontend/src/pages/dashboard/DashboardPage.tsx`
- Test: `npm run build`, `node scripts/verify-vue-admin-style.mjs`, browser screenshots

- [ ] **Step 1: Run final command verification**

Run:

```bash
cd gmp-platform/frontend
node scripts/verify-vue-admin-style.mjs
npm run build
```

Expected: both commands exit 0.

- [ ] **Step 2: Start or reuse the frontend dev server**

If no frontend server is already running on port `3000`, run:

```bash
cd gmp-platform/frontend
npm run dev
```

Expected: Vite serves `http://localhost:3000`.

- [ ] **Step 3: Browser-check `/login`**

Open:

```text
http://localhost:3000/login
```

Expected visual result:

- cool technical background fills viewport
- login panel sits on the right on desktop
- no left marketing panel
- no decorative radial circles or glassmorphism blur
- inputs and login button are 50px high

- [ ] **Step 4: Browser-check `/`**

If authentication redirects to `/login`, use the existing app flow to log in or seed localStorage only for visual QA:

```js
localStorage.setItem('token', 'visual-qa-token');
localStorage.setItem('user', JSON.stringify({ displayName: '管理员' }));
location.href = '/';
```

Expected visual result:

- sidebar defaults to 266px
- dark module rail is 64px
- top nav is 60px
- tabs bar is 50px
- content starts below 110px header
- dashboard feels dense and operational

- [ ] **Step 5: Browser-check `/master-data/product-families`**

Open:

```text
http://localhost:3000/master-data/product-families
```

Expected visual result:

- page background is `#f6f8f9`
- table panel is white
- table header background is `#f5f7fa`
- table header text is `#909399`
- controls are compact
- no oversized card radius or heavy shadow dominates

- [ ] **Step 6: Fix only visible mismatches**

If browser QA shows a mismatch, adjust only the relevant style file from the allowed list. Keep behavior unchanged.

After any adjustment, run:

```bash
cd gmp-platform/frontend
node scripts/verify-vue-admin-style.mjs
npm run build
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit final polish**

If browser QA required edits:

```bash
git add gmp-platform/frontend/src/App.tsx gmp-platform/frontend/src/index.css gmp-platform/frontend/src/components/shared/AppLayout.tsx gmp-platform/frontend/src/pages/LoginPage.tsx gmp-platform/frontend/src/pages/dashboard/DashboardPage.tsx
git commit -m "fix: polish vue admin plus visual pass"
```

If browser QA required no edits, do not create an empty commit.

## Self-Review Checklist

- Spec coverage: Tasks 1-4 cover theme, global CSS, app shell, login page, and dashboard. Task 5 covers build and browser verification.
- Placeholder scan: This plan contains no incomplete implementation slots.
- Type consistency: New verifier path is consistently `gmp-platform/frontend/scripts/verify-vue-admin-style.mjs`; layout constants are consistently `MODULE_BAR_WIDTH`, `FUNC_MENU_WIDTH`, `TOP_NAV_HEIGHT`, `TABS_BAR_HEIGHT`, and `HEADER_TOTAL_HEIGHT`.
