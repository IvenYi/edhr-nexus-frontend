# 全项目分页与批次审计入口修复

2026-10-27，同一功能切片 L2 续修。用户暂停提交/推送后，追加分页录屏、批次审计截图，并明确要求检查全项目分页。当前 HEAD 为 `a32d8d761293661cc3209342512050e96bba3ba7`（此前界面与本体的本地提交，未推送）；已合入工作树的远端目标为 `2c4b79e1641be4886fd5361b48df076e57abd768`，合并尚未提交。契约无增量；知识 0.3.25。沿用原决策包的 `integrationAndFollowup`，不另建业务政策。

## 原始原因与修复

批次及工单页把切换 queryKey 后暂时缺失的 `data.totalPages` 当作 0，再由 effect 将目标页设回 1。有缓存时数据不消失，因此表现为偶发。用户录屏经本地抽帧核对；真实 React Query/Chromium 延迟 HTTP 回归在修复前两个页面均以 `1 !== 2` 失败，修复后通过。这是 original-evidence，不能把“接口未返回”当作“真实只有一页”。

- 分页请求保留同一业务上下文的上一响应；目标页码由状态控制，不在渲染中被缺失页数夹到 1。
- 原有越界校正只接受成功、非占位、非请求中的响应。请求失败保持目标页；真实成功的页数减少仍可回退。筛选及每页条数变化仍主动回第一页。
- 共用 FormListPagination 显式接收数据就绪状态，保护零起点分页及 DHR 转接；字典父对象、模板、业务类型/视图和图标分组切换不保留异上下文记录。
- 批次审计删除顶部提示，将真实 `processSnapshot` 详情挂在同条 `processReference` 制程行；带首次冻结内容的 UPDATE 保持“修改”类别，另附“开工”次要说明。CREATE/未开工引用没有冻结详情。详情只读取该条历史审计，不请求当前主数据、不重建快照。保留冻结时间及缺独立引用时的原始快照可访问性。

## 全量分页盘点与处置

源码范围为 `gmp-platform/frontend/src`。交叉检索分页 JSX、页码 state/setter、queryKey、totalPages、onPageChange 和自定义上一页/下一页，追踪封装和路由复用。45 个文件直接呈现分页 JSX，加 DhrFillingPage/DhrReviewPage 两个封装入口共 47 文件，另有 3 个自定义服务分页入口。以下为源码覆盖，非逐页运行验收。

| 类别 | 文件/入口（相对 src） | 处置 |
|---|---|---|
| 实际重置：10 页 | production/BatchManagementPage、WorkOrderPage；master-data/DocumentManagementPage、ProductModelingPage、ProductFamilyModelingPage、WorkshopManagementPage、QualityReasonPage；workflow-center/WorkTemplateList、FormProcessList、ReviewTemplateList | 保留分页数据、就绪判断、受控目标页 |
| 共用组件：11 异步入口 | form-management/FormFillingPage、FormReviewPage、FormInstanceListPage；dhr-management/DhrManagementPage、DhrSummaryPage、DhrFillingPage、DhrReviewPage（后两者经 DhrWorklistTable）；reports/DhrTraceReportPage、FormProjectionReportPage；master-data/QualityReasonPage 审计；system/FormLookupItemsPage 审计 | FormListPagination 修正显示及真实越界；所有入口传入数据就绪状态 |
| 按钮/显示收缩：9 文件11查询 | system/IconManagementPage、MenuManagementPage 图标选择器、AuditLogPage、BusinessDictionaryPage 主表及项目；account/PersonalSettingsPage 两类日志；master-data/EquipmentPage、ProcessModelingPage、TemplateModelingPage、template-designer-react/tabs/model/ModelTab 报告 | 保留分页数据，未知页数回退当前页；移除图标显示夹到1；Equipment 加强原越界判断 |
| 没有同类重置：9 页 | master-data/OperationPage、RoutePage、ProductFamilyPage、SopDocumentPage、UnitPage；system/SignatureLogPage、LoginLogPage；workflow-center/BindingRuleList、InstanceList | 保留；请求时仅隐藏分页，前5个旧主数据页当前无路由引用 |
| 完整数据本地分页：8 处 | system/UserPage、RolePage、OrganizationPage、FormLookupItemsPage 主表；components/identity/SubjectSelector、DeletionProtectionDialog、ProductionOutput；workflow-center/InstanceLogs | 翻页不切换请求，不改其业务实现；FormLookupItemsPage 主表为共用控件提供真实就绪状态 |
| 自定义服务分页：3 处 | components/form-renderer/ReferencePickerDialog；pages/dashboard/DashboardTaskList；pages/dhr-management/DhrAuditTrail | 保留目标页、等待时禁用操作，无归零重置路径，保持 |
| 非列表分页 | PDF、画布页、向导步骤、内部 fetch-all 循环 | 已区分，不按列表分页改动 |

复用范围：ProcessModelingPage 覆盖物料/工序/工艺路线，TemplateModelingPage 覆盖表单/DHR模板，EquipmentPage 覆盖类型/设备，QualityReasonPage 覆盖缺陷/报废，报告页覆盖各业务模型。

## 实际验证与证据边界

- `npm run build`：TypeScript/Vite 通过；`git diff --check` 通过。
- `node --test scripts/test-production-audit.mjs scripts/test-production-object-edit.mjs`：10项通过。审计测试覆盖未开工不伪造快照、制程旁详情、相同V1不同配置各自保留、原快照内容不被修改。
- `test-production-pagination-browser.mjs`：实际批次/工单页面通过未缓存、缓存、延迟、乱序响应、503失败、真实页数减少、查询筛选及每页条数场景；批次追加开工事件名称、制程同行详情、旧配置原件以及新增记录无快照入口验证。
- `test-shared-pagination-browser.mjs`：实际 FormListPagination/React Query、图标页、设备页三类场景通过延迟、失败、缓存与适用的成功缩页验证；补充图标组切换延迟/失败、旧组数据消失及跨组排序负例。
- 远端 SN 三列模板与本次布局合并后，适配现有 `test-work-order-template-browser.mjs` 的候选身份夹具及实际控件名称，保留全部业务断言；SN1440、BATCH1440、SN390 三例通过实际 XLSX 下载解析、导入、负例及提交 payload 验证。
- 浏览器脚本使用隔离 HTTP 夹具，不写业务数据库，不能声称这些新脚本验证后端持久化。前序日常服务真实写入/审计证据仍见 ui-repair-verification.md，不能冒称已重跑。
- 本体 `ontology-result-ui-repair-integration.yaml` 解决本轮内联说明与远端 SN 三列修复的知识冲突；`ontology-result-pagination-audit.yaml` 同步审计呈现解释，两者 updated，实际知识检查89项通过。原报告保留原时点，不反填新结果。

原始证据目录 `output/playwright/pagination-audit-followup-20261027/`；本轮导入集成截图在 `output/playwright/batch-ui-repair-integration-20261027/`。全项目源码审查与三类机制代表性运行回归已区分，不声明逐页全系统 CRUD、后端全套测试、远端 CI 或部署。最终独立质量结果单列。

## 独立复核发现与修复

首轮 `quality-result-pagination-audit.yaml` 保留 failed 原始结论。独立 Chromium 复现 QF-PAG-001：从图标组 A 切到 B 等待响应时仍可拖拽 A 的图标，排序请求错误组合 B 的组 ID 和 A 的图标 ID。主侧在图标管理及菜单图标选择器按当前分组限制占位数据，并补充延迟、失败及跨组排序负例。新增回归修复前失败、修复后通过，证据为 `icon-group-red.json`、`shared-pagination-green.json`；全部请求均被隔离夹具拦截，没有真实数据写入。

QF-PAG-002 指出把审计动作直接命名为“开工”违反当前新增/修改分类。主侧恢复“修改”类别，旁边以次要文字展示“开工”；当前规则和证据已同步，快照详情仍取该条历史原件。修改后生产浏览器两例、共享/图标/设备三例和完整前端构建通过。由于包含 high 问题，最终由未参与修复的全新质量实例复验，结果另见 `quality-result-pagination-audit-final.yaml`。

## 提交边界

用户暂停消息到达前已生成一笔本地提交 `a32d8d76`；尚未推送。此后只完成合并工作树、知识冲突消解及本轮修复，没有生成新的提交，也没有推送。后续提交推送等待用户恢复指示。

2026-10-27，用户明确恢复授权，将本次分页、界面及本体修正一起提交并推送，要求提交说明写清楚。提交前重新获取远端，目标仍为 `2c4b79e1641be4886fd5361b48df076e57abd768`；已验证的实现、测试和当前知识保持原候选。沿用上述本体 updated 和全新独立质量 passed 结果，仅追加本段交付记录；提交和远端同步结果以 Git 历史及本次最终交付说明为准。
