# 追溯页面 UI 规范修复 · 2026-10-07

接续同一 `DEC-PACKAGE-20260929-FORM-PROJECTION`。基点为 `5dacb5859e95724e98f932544f0fd4f46c30db38`，分支 `form-traceability-projection`，知识基线0.3.24。本轮为 L1 前端交互修复，用户要求核对并按已有规范修复查询区域、行点击详情及详情样式；截图实际为追溯项管理，两页均核对。

## 依据与范围

- [列表页规范](../frontend/list-page-guidelines.md)5.1/5.1.1：40px输入、三列布局、收起时第三列操作组、展开后高级筛选与底部操作组、回车与查询同逻辑、重置重新查询。
- 同文件第6节：点击行打开右侧全高560px Drawer，移动端100vw；数据信息/数据审计、16px内容内边距、浅灰背景、两列分组及折叠审计。详情不是普通新建/编辑居中弹窗。
- 对照业务字典与工艺建模原始页面的 DetailSection/DetailField、审计折叠样式；复用既有 FormDialogSection 视觉分组和公共列表控件。

最小修改范围为 `FormLookupItemsPage.tsx`、`FormProjectionReportPage.tsx` 及本轮验证记录。追溯项管理原520px/单列字段/平铺审计改为规范形态；两页行点击与键盘Enter/Space打开详情，编辑阻止冒泡，纯查看报表去掉重复操作列。报表展开时生产对象放首行第三列，其他条件在高级网格；收起不留零高度网格占位，切换保留输入且不触发查询。重复查询及重置重新读取，分页仍保持已提交条件。

## 影响分析与验证计划

```yaml
impactAnalysis:
  level: L1
  directImpacts:
    - 两页查询交互、列表行打开详情、编辑事件隔离、详情响应式布局及审计折叠展示
  transitiveImpacts:
    - 查询和重置重复操作会重新发起原查询接口请求，API参数及语义不变
  potentialImpacts: []
  unaffectedAreas:
    - 数据库、权限、审计证据原文、统计分组、来源快照、最终完成与重试规则
  evidenceGaps: []
  testImpacts:
    - TypeScript/Vite构建及既有6项交互回归
    - 实际浏览器查询/回车/重置/展开/收起、行点击及编辑不冒泡
    - 560px详情、两列/移动单列、审计折叠、多个命中短窗口滚动和来源预览
extensionStrategy:
  selectedPaths: [product-core]
  rationale: 两页直接复用现有标准列表、字段网格和视觉分组，不增加客户分支或新业务配置
  ownershipBoundaries:
    - 前端两页负责查询及详情展示，后端业务契约不变
ontologyResult:
  result: not-applicable
  reason: 只落实已确认UI规范和展示交互，不改变业务含义、状态、权限、审计证据或执行契约
```

成功标准为规范要求与实际页面一致，原有查询/来源数据正确、编辑不会同时打开详情、短窗口内容不重叠。主开发完成基础检查后派发独立质量实例；本文件在取得结果后补录实际证据，不以“已修改”代替验证。

## 主开发实际验证

- `npm run build` 通过；`node --test scripts/test-projection-preview.mjs scripts/test-projection-panel.mjs` 的6项检查全部通过；`git diff --check` 通过。
- 在 `localhost:3007` / `localhost:8087` 和既有隔离库 `edhr_form_projection` 实际验证，只读取演示数据，未提交任何编辑。
- 追溯项管理：点击行打开560px详情；编辑不冒泡打开详情；回车及重置分别等待实际目录GET请求完成。
- 追溯与统计：`DEMO-L1` 查询4条，重复相同条件发起新POST；展开/收起保留生产对象输入，重置发起POST；六命中来源详情分组、滚动及560px宽度实测正确。
- 截图保存在未纳入Git的 `output/playwright/projection-ui-main-catalog-detail.png`、`projection-ui-main-query-expanded.png`、`projection-ui-main-multiple-hits.png`。
- 独立质量检查指出详情关闭图标的Tooltip缺口，两页已统一为“关闭”且向左显示；不修改共享弹窗组件。

未运行后端测试或数据库迁移：本轮未改动对应代码、结构或数据。编辑弹窗中既有共享 `FormDialogFieldGrid` 的 Emotion SSR `nth-child` 提示由质量实例核对为原HEAD已有，列为残余提示，不扩大本轮修复范围。

来源预览按可解析的新演示来源核验为只读；旧样例 `FR-20260929-000001` 的既有来源设计解析为空画布，预览和解析代码本轮未修改，该历史样例兼容问题保留在质量记录，不能据此声称所有历史表单预览已验证。

## 最终门禁

`ontologyResult.result: not-applicable`；`qualityResult.result: passed`。独立实例 `projection_ui_conformance_quality_20261007` 已返回结构化最终结果，详情见[质量记录](form-projection-ui-conformance-quality-2026-10-07.yaml)。发现的低风险关闭Tooltip问题已修复并由同一未参与修复的实例复验。独立验证覆盖两页实际请求、已提交分页条件、两种屏宽、短窗口六命中、真实审计折叠、三个预设统计视图及只读来源预览；该实例仅发查询请求，无业务或数据库写入，浏览器会话已关闭。

数据不足20条，未实测翻到第二页；已实测每页条数调整保留提交条件，并核对页码使用相同request路径。未重新执行生产事务、权限矩阵及全系统回归。本次通过只覆盖L1页面规范修复，不替代完整MVP验收。
