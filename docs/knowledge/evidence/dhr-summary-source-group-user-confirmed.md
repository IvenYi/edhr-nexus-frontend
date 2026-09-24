# DHR 汇总来源定义分组确认

知识基线：`0.3.24`；确认日期：2026-09-24；证据等级：`user-confirmed`。

本次用户确认：“好的，那就按你的这样改；有关此部分本体直接修改之前本体与事实”。本轮直接修订现有 `DEC-0072` 与对应资产，不新建决策或重复迭代历史，基线版本保持不变。

`user-confirmed`：右侧候选仍按来源定义展示一张卡片，分组键为 `originKind + operationId + formId`；作业来源区分工序与填报节点，自定义来源区分每次创建项，同模板不同来源不得合组，缺失来源键时按实例独立。默认整组拖拽或选择，也可展开明确选择已完成实例；部分纳入显示 `x/y`。组内有未完成实例时，整组操作须明确反馈，不能静默跳过后伪称已整组纳入；用户可展开选择已完成实例，未完成实例仍不可纳入。

`user-confirmed`：来源分组不构成全有或全无、同目录或连续位置的业务硬约束。草稿和 `readOnly` 冻结目录均按真实位置与顺序展示部分、分散或交错归档，仅相邻同源实例可折叠。例如 `A1、B1、A2` 不得合并为 `A1、A2、B1`。每份实例可查看，草稿可逐份移出；移出仅解除本次汇总关联，不删除或修改源表单，也不开放冻结版本编辑。

`user-confirmed`：同一切片补充可收起的汇总概览、右侧独立来源入口，以及全部已归档来源的显示名重命名，包括 DIRECTORY、WORK、CUSTOM。组行重命名作用于当前范围全部已归档实例，可选来源相邻同源折叠行仍只作用当前相邻段，单份行仅作用一份。别名在草稿保存重开、提交冻结和后续重新整理中保持，包括 DIRECTORY 别名继承；冻结版本只读，旧版空别名回退原名。显示名仅属于逐实例汇总关联，来源表单名称、内容、实例号和基础目录快照不变；DIRECTORY 自动归位、固定归属、不可移除和逐实例唯一位置规则继续适用，不能借别名请求覆盖目标或排序。

`user-confirmed`：目录表单行去掉独立份数数字，单实例也显示实例列表按钮；点击表单行默认预览第一份，拖拽只显示一个落点。右侧候选部分纳入的 x/y 反馈不受目录份数呈现调整影响。

`user-confirmed`：候选与底层冻结仍按单实例处理，完整候选范围、实例关联、顺序、来源快照及哈希继续冻结，空来源不生成证据。此前来源分组修订不变更 schema 或 API 形状；本轮别名仍须保持原草稿可编辑、冻结历史不可回写。既有保存/提交审计与 edit/submit 权限、不可变基础目录、生产完工、审批/签署/表单作废和变更边界保持。本次只纠正全组硬约束，保留既有证据纳入政策、源业务校验、必填目录和未完成补录阻断，不新增“选填即可任意遗漏记录”等豁免规则。

先前 `DEC-0063-02`、`DEC-0071-01` 与 `dhr-summary-order-user-confirmed.md` 中“同模板多实例分别作为候选”的表述保留为历史记录；现行汇总候选交互由 `DEC-0072` 局部替代。逐实例证据关系及其他页面按实例识别不受替代。

`original-evidence`：`summarySourceGroups.ts` 的 `summarySourceKey` 提供来源键，`placeSummarySourceGroup` 将批量操作展开为逐实例关联；`DhrSummaryService.validatePlacements` 继续校验候选存在、目标目录、`COMPLETED`、同级锚点、排序与实例唯一归档。已移除 `sourceGroupIsContiguous` 和 `ensureSourceGroupsPlacedTogether` 的全组硬约束。

`original-evidence`：冠骋原始前端 `layout-data.vue` 以 `isCollapse` 控制统计区收起，`table-drawer.vue` 提供右侧来源栏；`tree-node.vue` 的 DOC 节点有重命名入口，`wiki-modal.vue` 在插入时可自定义文档名。源码位于 `/Users/ivenwang/Documents/iven space/paas-main-front/src/projects/web-render/src/views/edhr-application/render/edhr-summary/components/`。插入时命名与本产品的后置重命名仅属相关交互，不是同一业务动作；冠骋源码不证明本产品的冻结或审计规则。

`original-evidence`：当前 eDHR 工作树的 `DhrSummaryService` 对草稿 placements 中 `displayName` 校验非空、首尾空格和 120 字长度，保存草稿前后审计快照；提交时将 placements 纳入版本指纹，并把别名写入 `dhr_summary_evidence.display_name`。重新整理复制旧版别名；`DhrSummaryPage.tsx` 的折叠行重命名传入本段实例 ID，单份行传入单实例 ID，目录名称读取空别名时用来源标题。`DhrSummaryController` 的草稿保存入口需 `records.dhr-summary` 与 `dhr.summaries.edit`。这些是工作树源码核对，不代表独立质量或发布验证通过。

`original-evidence`：`DhrSummaryPersistenceTest` 已包含别名草稿重开、冻结、来源候选不变、重新整理和异常名称测试；`DhrSummaryDisplayNameMigrationTest` 以 H2 检查可空字段及既有证据保留。此处仅核对测试源码存在，正式执行结果以本任务实际命令为准；真实 PostgreSQL 与越权交互仍需主智能体验证。

`original-evidence`：2026-09-24 主智能体执行 `test-dhr-summary-directory-browser.mjs` 通过，覆盖整组默认、逐份拖拽/选择/移出、部分重开、来源隔离、混合状态及冻结只读交错顺序；该浏览器测试拦截 API，不修改真实业务数据。`DhrSummaryServiceTest`、`DhrSummaryPersistenceTest`、`DhrSummaryOrderMigrationTest` 共 20 项通过，覆盖部分/分目录/交错保存与提交冻结、候选完整快照、状态变化及未完成补录阻断。持久化测试使用 H2，不声称完成真实 PostgreSQL 端到端提交或发布验证；独立质量审查另行收尾。原全组同目录测试记录不再作为新方案证据。修订规则与交互锚点保持 `implemented/internal`，不进入客户或运行时投影。

`original-evidence`：2026-09-24 收尾独立质量结果为 `passed`。首轮发现规则说明缩进错误（QF-DEC72-001）后，主智能体修复；全新且未参与修复的质量实例独立重跑上述 20 项业务测试、59 项 `BusinessKnowledgeModelTest` 及隔离浏览器回归全部通过，并核对 YAML 层级及开合布局。主智能体最终前端构建通过，真实 Chrome 汇总读取与布局核对通过，后端已重启；真实业务数据未保存或提交。不将此聚焦结果等同于全系统或发布验收。

`secondary-reference`：以上主智能体及独立质量的通过记录属于此前来源分组范围，本角色没有重跑这些业务测试；不覆盖本次 DIRECTORY 别名、单例列表和单落点增量。冠骋原始源码本次未重新读取，既有描述仅作交互索引。

`original-evidence`：本次读取工作树 DhrSummaryService.validatePlacements，DIRECTORY 分支按自动归属校验 targetNodeKey，拒绝 beforeNodeKey/displayOrder 覆盖，复用 applyDisplayName；prepareNextDraft 查询保留带 display_name 的 DIRECTORY。0101 仍为可空 VARCHAR(120)，本增量不需新迁移。前端已通过 formRowActions 提供全来源已有证据重命名、常显单例列表按钮和固定槽位；只由 insertionSlot 绘制落点，表单行不再重复绘制边框。主智能体本轮运行 DhrSummaryPersistenceTest（15）、DhrSummaryServiceTest（8）、DhrReviewLifecycleIntegrationTest（2）共25项通过；test-dhr-summary-directory-browser.mjs 验证单落点、单例列表、对齐、目录别名重开和冻结只读通过，npm run build 通过。保持 implemented/internal，非发布级验证。

`inference`：行尾固定等宽槽；实例列表按钮展开或收起左侧实例列表。零实例项视为无证据模板占位，展示空实例列表，不创建虚构证据或 placement alias。这些是交接中的工程推断，不提升为用户确认的规则。

同一决策包 `DEC-PACKAGE-20260924-DHR-SUMMARY-ORDER` 的 L2 影响摘要：直接影响 DhrSummaryPage 全来源重命名及单例列表、validatePlacements 固定归属别名校验、prepareNextDraft 继承；传递影响冻结证据、readOnly/审核显示名、placements hash 和草稿前后审计快照。潜在影响为空；源表单、生产生命周期、基础目录、审批权限不改。沿用 0101 与空别名回退，只在新提交版本冻结显示名，不回写历史；edit 权限及 readOnly 约束不变。扩展路径为 product-core，前端持有呈现，后端持有标准逐实例汇总关联。本轮聚焦服务测试覆盖 DIRECTORY 保存/冻结/重整、固定归属与重复/非法名称阻断、哈希及历史不变；隔离浏览器覆盖保存重开、冻结只读、单例按钮/对齐/单落点，既有工作台浏览器回归通过。尚未向真实生产数据库写入提交/审批测试记录；独立质量结果由本轮收尾另行报告。
