# 公共列表表格壳

`ListTableShell` 是所有独立列表页和业务工作列表的公共表格壳，位于
`gmp-platform/frontend/src/components/ListTableShell.tsx`。

它只负责列表表格的公共几何能力：

- 测量可用视口宽度并提供稳定的表格画布宽度；
- 统一横向滚动容器；
- 保证直接承载的列表表格至少铺满可见视口；列被用户缩小时不留下右侧空白，列总宽超过视口时仍保留横向滚动；
- 支持普通列表、RDO 父子/版本列表和表单工作列表共用同一滚动边界；
- 为需要撑满视口的列表提供 `resolveListColumnWidths`，把剩余宽度均衡分配给内容列，同时保持操作列等固定列宽度不变。
- 不改写页面单元格样式；冻结列的公共视觉契约由 `listTableStickyEdgeSx` 和 `listTableStickyEdgeShadow` 提供，页面只传入冻结位置、宽度、层级和背景色。
- 冻结列样式须覆盖行级通用单元格样式的阴影优先级，确保表体每行与表头一样显示左侧阴影，同时保留表体底部分隔线。

页面仍然负责领域列、行渲染、操作按钮、分页、空态和业务行为。独立的填报/审批工作列表仍然使用此组件；弹窗内临时编辑表、设计器画布表格、生产执行工作台中的内嵌明细表不属于独立列表页，不强制使用此组件。

所有列表的首个数据列遵守与普通表体相同的正文基线：`14px`、常规 `400` 字重、`20px` 行高、继承项目正文体和 `#303133` 主文字色。名称、编号、ID、版本和批次号不得仅因处于首列而使用蓝色链接、等宽字体、额外加粗或更大字号。RDO 的展开箭头、复制图标等只能作为独立操作存在，不得改变文字样式。

组件名称中的 `List` 是页面语义，不限定 RDO。不要在普通列表页继续使用 RDO 专用壳，也不要为每个页面复制一套横向滚动和视口测量逻辑。

## 普通列表

普通列表可以直接使用 children：

```tsx
<ListTableShell sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
  <Table stickyHeader size="small" sx={{ minWidth: 960 }}>
    ...
  </Table>
</ListTableShell>
```

如果页面需要根据视口把剩余宽度分配给某一列，可以使用 render callback：

```tsx
<ListTableShell minTableWidth={baseTableWidth} sx={{ flex: 1, overflow: 'auto' }}>
  {(tableWidth) => {
    const widths = resolveListColumnWidths(columns, tableWidth, 'name', ['actions']);
    return <Table sx={{ tableLayout: 'fixed', width: tableWidth, minWidth: tableWidth }}>...</Table>;
  }}
</ListTableShell>
```

`resolveListColumnWidths` 的首个列参数是内容列分配的起始列，第四个参数声明固定列；固定列通常是 `actions`，不能参与剩余宽度分配。剩余宽度会在其他内容列之间均衡分配，避免所有空白都堆到第一列。

## RDO 列表

 RDO 页面用同一个壳包住主表。主表使用壳提供的视口宽度；如果展开的版本子表列更多，可以在同一滚动边界内使用自己的最小宽度，不能反过来把主表撑宽：

```tsx
<ListTableShell minTableWidth={parentBaseWidth} sx={{ flex: 1, overflow: 'auto' }}>
  {(tableWidth) => {
    const parentWidths = resolveListColumnWidths(parentColumns, tableWidth, 'name', ['actions']);
    const versionTableWidth = Math.max(tableWidth, versionBaseWidth);
    const versionWidths = resolveListColumnWidths(versionColumns, versionTableWidth, 'description', ['actions']);
    return <Table sx={{ tableLayout: 'fixed', width: tableWidth, minWidth: tableWidth }}>...</Table>;
  }}
</ListTableShell>
```

主表和子表的 `colgroup`、表头、表体必须使用各自同一份解析后列宽。子表不要再创建独立的横向滚动上下文，统一由公共壳承担；子表更宽时只增加公共滚动区域，不得改变主表的列宽比例。

操作列按同一张表可能同时出现的最大图标数选择 `64/96/128/160px` 档位；父表和子表动作数量不同可以使用不同档位，但每一张表的表头、`colgroup` 和表体必须一致。

冻结列分隔统一使用右侧冻结列左边的公共阴影 `-6px 0 8px -8px rgba(0, 0, 0, 0.35)`，不能用 `border-left` 或各页面自定义的弱阴影替代。连续冻结列只在最左侧冻结列绘制阴影，避免同一冻结区出现多条线或重复阴影。
