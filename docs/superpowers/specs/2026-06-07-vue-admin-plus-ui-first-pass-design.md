# Vue Admin Plus UI First-Pass Design

## Goal

Modify the existing React + MUI frontend to visually follow the Vue Admin Plus style constraints before considering any Vue / Element Plus replacement.

The first pass is a visual-layer change only. It must not change API behavior, routes, auth logic, data fetching, backend code, or business state.

## Source Constraint

Primary constraint document:

- `docs/design-audit/vue-admin-plus-ui-style-constraints.md`

Target visual language:

- Chinese enterprise admin dashboard
- Dense middle/back-office layout
- Vue Admin Plus style approximation through MUI theme and layout overrides
- Primary color `#1890ff`
- Page background `#f6f8f9`
- White panels with `1px` light borders
- Base radius `5px`
- Subtle or no shadows
- No marketing hero sections, decorative blobs, glassmorphism, oversized rounded corners, or purple-heavy styling

## Strategy

Stage 1 uses the current React + MUI stack and recreates the constrained visual style through:

- global MUI theme tokens
- global CSS
- application shell layout changes
- focused login page and dashboard adjustments
- inherited table/form/button/card styling for existing pages

Stage 2 is only a fallback. If Stage 1 looks materially worse than the target, evaluate a full frontend replacement with Vue / Element Plus as a separate decision and implementation effort.

Stage 1 failure criteria:

- sidebar, top navigation, or tabs do not resemble the target layout
- page density remains too loose
- MUI material feel remains dominant
- login page cannot approach the target composition
- tables and forms do not feel close to Element Plus / Vue Admin Plus

## Files To Modify

### `gmp-platform/frontend/src/App.tsx`

Update the MUI theme to match the constraint tokens:

- palette primary `#1890ff`
- page background `#f6f8f9`
- text colors from the constraint document
- border colors `#dcdfe6`, `#e4e7ed`, `#ebeef5`
- shape radius `5`
- component style overrides for Button, Card, AppBar, Table, TableCell, TableRow, Chip, Dialog, TextField, Select, Pagination, and related controls

### `gmp-platform/frontend/src/index.css`

Align global CSS:

- font family `"PingFang SC", Arial, "Microsoft YaHei", sans-serif`
- body background `#f6f8f9`
- body text `#515a6e`
- stable scrollbar styling
- subtle, fast transitions only

### `gmp-platform/frontend/src/components/shared/AppLayout.tsx`

Update app shell:

- fixed total sidebar width `266px`
- dark first-level module rail `64px`
- white second-level menu area around `202px` total remaining width, with menu behavior tuned to the current React implementation
- top navigation height `60px`
- tabs bar height `50px`
- main content starts below fixed `110px` header area
- main content uses `padding: 20px`
- subtle header/sidebar shadow `0 1px 4px rgba(0, 21, 41, 0.08)`
- remove current large-header-only structure by adding a tabs strip under the top bar

### `gmp-platform/frontend/src/pages/LoginPage.tsx`

Rework login page:

- full viewport cool blue / pale tech background
- right-positioned login panel
- translucent blue-tinted panel treatment without heavy blur or glassmorphism
- title scale close to target, but adapted to this product name
- 50px login inputs and submit button
- remove current left marketing panel, decorative radial circles, large icon tile, and heavy card shadow

### `gmp-platform/frontend/src/pages/dashboard/DashboardPage.tsx`

Rework dashboard first-screen density:

- reduce oversized cards and icon radii
- align card borders, radius, spacing, and shadows with the constraint document
- keep existing business content and navigation targets
- make quick entries and recent activity feel like operational panels, not marketing cards

## Components And Data Flow

This change does not introduce new data flow.

Existing API clients, React Query usage, auth localStorage behavior, routes, and page components remain as-is. The only intended data-impacting behavior is none.

The global theme should allow current table/list/form pages to inherit the first-pass styling without requiring page-by-page rewrites.

## Error Handling

No new runtime error paths are introduced.

Visual changes must avoid:

- changing login submit behavior
- changing token storage
- changing route protection
- changing API endpoints or proxy behavior
- hiding existing alerts, loading states, or empty states

If a layout becomes cramped on smaller screens, keep content accessible with existing responsive behavior rather than hiding functional controls.

## Verification

Run:

```bash
cd gmp-platform/frontend
npm run build
```

Then run the frontend dev server:

```bash
cd gmp-platform/frontend
npm run dev
```

Browser-check these pages:

- `/login`
- `/`
- `/master-data/product-families`

Check against the constraint document:

- body background is `#f6f8f9`
- sidebar is `266px`
- top nav is `60px`
- tabs bar is `50px`
- content padding is `20px`
- cards are white with `1px #e4e7ed` border, `5px` radius, no heavy shadow
- buttons are close to `32px` height and `5px` radius
- inputs/selects use compact `32px` styling where page forms inherit the theme
- table header is `#f5f7fa`, header text `#909399`, body text `#606266`
- no decorative blobs, glassmorphism, large hero layout, heavy shadow, or oversized radii remain in the first-pass app shell

## Out Of Scope

- Replacing React with Vue
- Introducing Element Plus
- Rebuilding every business page one by one
- Changing backend, API contracts, auth, routing, or data models
- Adding new product features
