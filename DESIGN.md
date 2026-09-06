# DESIGN.md

> 把 eDHR 的业务知识变成可查询、可解释、可追溯的工作台，而不是一套装饰性的图谱页面。

## 1. Visual Theme & Atmosphere

**Style**: 受控业务知识工作台
**Keywords**: operational, precise, traceable, dense, calm, semantic, evidence-led
**Tone**: 面向产品、研发、实施和质量人员的专业工具 — NOT marketing, playful, decorative
**Feel**: 像一间安静的控制室，用户总能看见当前关系、规则和证据落在哪里。

**Interaction Tier**: L1 精致静态
**Dependencies**: CSS transitions + existing graph/canvas component

页面第一屏直接进入知识探索，不使用 landing page、hero 或营销式介绍。视觉重点是关系可读性、状态可辨识性和证据可追溯性。

## 2. Color Palette & Roles

```css
:root {
  --bg: #f4f6f8;
  --surface: #ffffff;
  --surface-alt: #eef2f4;
  --surface-hover: #f7faf9;

  --border: #d8e0e5;
  --border-hover: #9fb3bd;

  --text: #1f2d34;
  --text-secondary: #52636b;
  --text-tertiary: #7b8a91;

  --accent: #0f766e;
  --accent-hover: #0b5f59;
  --accent-soft: #d9f0ec;

  --bg-rgb: 244, 246, 248;
  --accent-rgb: 15, 118, 110;

  --success: #2f855a;
  --success-soft: #e5f4ea;
  --warning: #b7791f;
  --warning-soft: #fff3d6;
  --error: #c53030;
  --error-soft: #fde8e8;
  --info: #3b6ea8;
  --info-soft: #e8f0fa;
  --planned: #6b7280;
  --planned-soft: #eef0f2;
}
```

**Color Rules:**

- 页面底色使用浅灰，内容区域使用白色，避免把整页做成一张浮动卡片。
- teal 只表示选中、关系入口和主要操作；状态标签使用独立的语义色。
- “已实现”“规划中”“未验证”必须同时使用颜色和文字，不能只靠颜色区分。
- 图谱边使用低饱和中性线条，当前选中路径才使用强调色。
- 所有实现颜色通过 CSS 变量引用，组件中禁止直接写 hex。

## 3. Typography Rules

**Font Stack:**

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap');

:root {
  --font-sans: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
}
```

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Page title | Sans | 20px | 600 | 28px | 0 |
| Section title | Sans | 16px | 600 | 24px | 0 |
| Node title | Sans | 14px | 600 | 22px | 0 |
| Body | Sans | 14px | 400 | 22px | 0 |
| Label | Sans | 12px | 500 | 18px | 0 |
| Code / identifier | Mono | 12px | 400 | 18px | 0 |

**Typography Rules:**

- 页面标题只承担当前上下文，不使用超大标题。
- 业务名称和技术标识分层显示；标识使用等宽字体并允许复制。
- 中文正文保持 14px，表格和图谱标签不得小于 12px。
- **NEVER use**: display-serif, handwritten fonts, gradient text, large text shadow。

**Text Decoration:**

- 不使用渐变文字或投影。
- 链接和可点击关系使用颜色变化与底线，不使用发光效果。

## 4. Component Stylings

### Buttons

```css
.kb-button {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--text);
  transition: border-color 140ms ease, background 140ms ease, color 140ms ease;
}

.kb-button:hover { border-color: var(--accent); color: var(--accent); }
.kb-button:active { background: var(--accent-soft); }
.kb-button:focus-visible { outline: 2px solid rgba(var(--accent-rgb), .35); outline-offset: 2px; }
.kb-button:disabled { cursor: not-allowed; opacity: .45; }
.kb-button--primary { border-color: var(--accent); background: var(--accent); color: #fff; }
```

### Panels

```css
.kb-panel {
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
}

.kb-panel:hover { border-color: var(--border-hover); }
.kb-panel:focus-within { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(var(--accent-rgb), .12); }
```

Panels frame tools and inspectors only. Page sections remain unframed layouts; no cards inside cards.

### Navigation

The knowledge center uses a stable left navigation with domain groups: 基础主数据、模板与 DHR、工艺与制程、生产执行、质量与追溯、规划能力。 Selected items use a 3px accent bar and soft accent background. Hover changes background only.

### Links

Links use `var(--accent)` and underline on hover. Relation labels in the graph are text links with a visible focus state.

### Tags / Badges

```css
.kb-status {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 7px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}

.kb-status--implemented { color: var(--success); background: var(--success-soft); }
.kb-status--planned { color: var(--planned); background: var(--planned-soft); }
.kb-status--unverified { color: var(--warning); background: var(--warning-soft); }
.kb-status--deprecated { color: var(--error); background: var(--error-soft); }
```

### Knowledge Workbench

- Desktop layout: `domain tree | relation canvas | detail inspector`.
- The canvas has a compact toolbar for `关系图 / 业务流程 / 规则` and zoom controls as icon buttons with tooltips.
- The inspector has tabs `概念信息 / 关系 / 规则 / 证据 / 影响范围`.
- The bottom evidence drawer is collapsed by default and expands without replacing the selected object.
- The customer Q&A screen uses `question history | answer and explanation | evidence path`, with the evidence path always visible below the answer. It only reads the released customer knowledge view; internal roadmap items are never shown.
- The internal maintenance screen may show implementation status and planned capabilities to authorized product and engineering users, but it is a separate surface from customer Q&A.

## 5. Layout Principles

**Container:**

- Max width: full viewport minus 24px outer padding; the workbench is application-first, not a centered marketing page.
- Header height: 52px.
- Left domain tree: 248px fixed on desktop.
- Right inspector: 360px fixed on desktop.
- Center canvas: remaining width, minimum 520px.
- Evidence drawer: 220px when expanded.

**Spacing Scale:**

- Page padding: 12px.
- Panel gap: 12px.
- Toolbar gap: 8px.
- Inspector section padding: 16px.
- Dense table row height: 40px; graph node minimum height: 48px.

**Grid:**

```css
.kb-workbench {
  display: grid;
  grid-template-columns: 248px minmax(520px, 1fr) 360px;
  grid-template-rows: 52px minmax(0, 1fr) auto;
  min-height: calc(100vh - 48px);
}

.kb-workbench__header { grid-column: 1 / -1; }
.kb-workbench__tree { grid-column: 1; grid-row: 2 / 4; }
.kb-workbench__canvas { grid-column: 2; grid-row: 2; min-width: 0; }
.kb-workbench__inspector { grid-column: 3; grid-row: 2; min-width: 0; }
.kb-workbench__evidence { grid-column: 2 / 4; grid-row: 3; }
```

The empty state keeps the same columns and toolbars. It shows a focused explanation in the canvas, never a broken full-page blank state.

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | no shadow, 1px border | graph canvas, page bands, tables |
| Subtle | `0 1px 3px rgba(31,45,52,.08)` | floating menus, inspector overlay |
| Elevated | `0 8px 24px rgba(31,45,52,.12)` | modal, command palette, Q&A evidence popover |

Avoid layered floating cards. The graph itself is a flat working surface; only selected nodes receive a thin accent outline.

## 7. Animation & Interaction

**Motion Philosophy**: 用短、可预测的状态变化帮助定位，不用连续装饰动画。
**Tier**: L1

### Entrance Animation

```css
@keyframes kb-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.kb-enter { animation: kb-fade-in 160ms ease-out both; }
```

### Hover & Focus States

- Hover only changes border, background or text color.
- Selecting a graph node outlines it and highlights the shortest explanation path.
- Expanding evidence preserves scroll position and selected node.
- Q&A answer sections reveal one at a time only when the user expands explanation details.

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 8. Do's and Don'ts

### Do

- Do make implementation status explicit on internal maintenance views.
- Do show the selected relationship path and its evidence.
- Do keep identifiers, version numbers and timestamps easy to copy.
- Do preserve the same tree, table and graph selection state when opening details.
- Do provide customer answers with rule ID, source module and applicable release when those details are customer-safe.
- Do use the existing application shell and icon library.

### Don't

- Do not expose planned capabilities in customer pages or customer Q&A.
- Do not allow the Q&A model to issue production mutations.
- Do not use a decorative globe or a graph with hundreds of unlabeled edges as the home screen.
- Do not hide business rules only inside tooltips or a modal.
- Do not encode status using color alone.
- Do not put cards inside cards.
- Do not use gradient backgrounds, oversized hero type or ornamental blobs.
- Do not make the customer-facing page an ontology authoring console.

## 9. Responsive Behavior

**Breakpoints:**

| Name | Width | Key Changes |
|------|-------|-------------|
| Desktop | > 1200px | Three-column workbench; evidence drawer may remain open |
| Tablet | 768-1200px | Inspector becomes a right drawer; tree narrows to 216px |
| Mobile | < 768px | Single-column drill-down: tree -> canvas -> inspector; Q&A evidence becomes an accordion |

**Touch Targets:** minimum 40px for icon buttons and 44px for primary actions.
**Collapsing Strategy:** keep the selected object in a sticky context bar; move tree and inspector into drawers; never squeeze graph labels into unreadable columns.

```css
@media (max-width: 1200px) {
  .kb-workbench { grid-template-columns: 216px minmax(0, 1fr); }
  .kb-workbench__inspector { position: fixed; inset: 52px 0 0 auto; width: min(360px, 88vw); transform: translateX(100%); }
  .kb-workbench__inspector[data-open='true'] { transform: translateX(0); }
  .kb-workbench__evidence { grid-column: 2; }
}

@media (max-width: 768px) {
  .kb-workbench { display: block; min-height: 100dvh; }
  .kb-workbench__tree, .kb-workbench__inspector { display: none; }
  .kb-workbench__canvas { min-height: calc(100dvh - 104px); }
  .kb-workbench__evidence { margin: 0 12px 12px; }
}
```

## 10. 列表页补充规范

列表类页面以 `docs/frontend/list-page-guidelines.md` 为权威规范；本文件只补充知识工作台的视觉基线，不得覆盖或弱化列表规范。两份文档出现交集时，优先采用列表规范中的页面骨架、色彩 token、表格密度、操作列、弹窗和详情交互。

所有普通列表、RDO 列表和带分类列表必须使用“查询面板 + 白色列表面板 + 工具栏 + 表格 + 分页底栏”的结构。表格必须放在 `TableContainer` 内，表头固定为 `48px` 高、背景 `#f5f7fa`，普通数据行固定为 `40px` 高并使用 `#ebeef5` 底边；表头、行高、空态、加载态和操作列保持稳定，状态徽标和辅助信息不得通过纵向堆叠撑高数据行。操作列使用 MUI 图标按钮、Tooltip、`aria-label` 和固定宽度，可能横向滚动时固定在右侧。

列表行如果承载查看详情，必须绑定右侧详情 `Drawer`，桌面宽度 `560px`、移动端 `100vw`，覆盖完整视口高度；详情抽屉顶部使用标题和关闭图标，下方固定提供“数据信息 / 数据审计”页签，内容区使用 `#f7f9fc`、`16px` 内边距并独立滚动。此时操作列不得重复提供“查看/详情”图标，只保留编辑、删除等独立业务动作。审计快照必须通过业务字段映射展示中文名称和业务枚举，不得直接暴露原始 JSON 或内部字段 key。

新增、编辑、预览和确认等集中任务使用 `AppDialog`；查看详情不得使用居中 `Dialog`。新建/编辑弹窗必须使用 `DialogTitle`、`DialogContent`、`DialogActions`，取消在左、主操作在右；删除、取消、关闭等危险动作使用 `ConfirmDialog`。列表页不得自行增加大标题、营销式首屏、第二套表格样式或与当前业务无关的说明区块。
