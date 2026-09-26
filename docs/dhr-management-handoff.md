# DHR 管理设计与开发交接

更新日期：2026-09-25。现行设计以 [汇总核查与审批设计](dhr-management-product-research-and-roadmap.md) 为主，重点阅读第 6～10 节。本文直接修订原交接，不再沿用“作业/自定义未手选即不纳入 DHR”的错误方案。

## 1. 当前任务边界

本次已在原设计和知识之上实现自动归集、展示目录与证据范围解耦、受控附件、冻结版本及 ZIP 导出，并执行 0102/0103 开发库迁移与后端重启。尚未 Git 提交或推送。通用业务设计仍标为 specified/internal；实现和测试结果不等于整系统合规认证。

- 保留 DHR填报、DHR汇总、DHR审批、DHR列表菜单。
- 汇总的主线变为自动归集、完整性检查和人工核查；人工目录整理只是辅助。
- 中国法规按 2025 新版医疗器械 GMP 设计，不考虑旧版；海外先核对美国/欧盟，具体客户适用范围未确认。
- 暂不做打印；设计完整 DHR 版本 ZIP 与选定范围 ZIP，部分输出不能冒充完整档案。
- 不新增跨批次移表、不自动放行、不恢复终止生产、不改朋友负责的表单变更/作废流程。

## 2. 环境与安全边界

- 仓库：`/Users/ivenwang/Documents/edhr-nexus`。
- 既有协作分支：`edhr-dev`，实际操作前用 `git status -sb` 和 `git branch --show-current` 核对，不假定远程已同步。
- 使用当前本地项目；不要求新建上下文或切换 Worktree。
- 用户原有未跟踪 `output/` 必须保留，不重置或覆盖其他开发者改动。
- 本地开发环境使用后端 8081、前端 3000；本轮已在开发 PostgreSQL 应用 0102/0103，并通过浏览器读取已有 DHR 数据审计。后续使用时仍须重新检查服务状态。
- 历史记录的“DHR 数量为 0”“尚无审批运行时”“尚未提交推送”和既往测试数量，不是当前环境事实，不能据此继续开发。

## 3. 开始实施前必读

1. `AGENTS.md`、`codeplzreadme.md`。
2. `docs/dhr-management-product-research-and-roadmap.md`。
3. `docs/development/dhr-summary-decision-package.yaml`。
4. `docs/architecture/business-knowledge-model.md`、`docs/knowledge/README.md`、`docs/knowledge/open-questions.yaml`。
5. `DEC-0063`、`DEC-0068`、`DEC-0069`、`DEC-0070`、`DEC-0071`、`DEC-0072` 及对应规则/事实/证据。
6. 当前共享组件规范与源记录控制模块契约。

知识基线为 0.3.24。相同功能切片维护一个决策包；用户负责真实业务决策，智能体负责同步知识和验证。新业务实施属于 L2，不能因是 UI 改版而跳过来源、并发、权限、审计和快照检查。

## 4. 必须一致的业务规则

| 事项 | 现行设计 |
| --- | --- |
| DHR 形成 | 继续以生产对象为锚点，首次合法开工自动创建；不要求手工组装目录才形成 DHR |
| 证据范围 | 生产关联的目录/作业/自定义实际实例自动归集，附件受控关联；状态不决定记录是否可追溯 |
| 缺项与未完成 | 应有记录按冻结配置及适用规则核查；零实例不造证据，失败/作废/替代不能静默消失 |
| 人工目录 | 别名、顺序、展示位置可调整，不改变来源归属、内容或证据成员；取消自定义位置恢复默认 |
| 分组 | 按具体作业节点或自定义创建项，不按相同模板混组；组和单份均可整理/查看 |
| 审批 | 冻结完整证据及检查结果，按既定 NONE/REQUIRED 执行；NONE 不绕过适用签署、质量审核或放行 |
| 来源变化 | 自动识别、提示并阻断过时批准；人工退回/发起新版本，保留旧结论与旧快照 |
| 详情 | 正式版本默认展示汇总目录，可切来源视图但仍读同一版本；实时记录必须显式区分 |
| 审计 | 实例日志查看源填报/签署/变更；DHR 详情数据审计查看目录/附件/提交/审批/导出等 |
| 附件 | 保留原始文件、版本、来源与核验；扫描/上传时间不冒充原记录形成时间 |
| 导出 | 完整与部分 ZIP 明确标识，不修改证据范围，不能静默缺件或混用版本 |
| 终止 | DEC-0069 的终止只读留证政策不变；本轮不补终止后追加/异常结案 |

自动工序/作业表单绑定当前执行对象，自定义创建也绑定当前上下文，不是自由选择表单归属。“在 A 页录入 B 的值”属于内容错误；“附件误关联”属于关系错误。不得将这两者混写为正常自动归属会串批，也不通过 DHR 拖拽改 objectId。

## 5. 原始实现与本轮改造核对

2026-09-25 读取以下源码：

- `ProductionExecutionService`：按生产对象锁定执行上下文；`ATTACH_FORM` 在该对象/工序内追加自定义定义，保存时传递同一 objectId。
- `FormInstanceRecordService.saved`：从执行快照查找工序/表单，按 objectId、operationId、copyId 保存唯一来源记录。
- 原 `DhrSummaryService.submit/validatePlacements` 由 placements 决定正式证据行，是本轮已替换的旧语义；现行提交按生产对象实际来源记录生成完整证据集合，placements 只保存展示位置。
- `DhrReviewService`：已有个人审批任务查询、动作、流程结果与审计路径。不能再称“审批运行时完全不存在”；新证据范围下的审批正确性仍须重新验证。
- `DhrManagementPage` 的正式版本详情现使用 `DhrSummaryPage` 的冻结版本视图；生产中实时详情仍由 `DhrInstanceService.detail` 提供，不能冒充冻结版本。
- 新增 `DhrAttachmentService`、`DhrArchiveService` 和对应控制器，0102/0103 迁移分别支持完整证据版本与受控附件。
- 现有来源分组、目录顺序、全来源别名和实例面板可复用，不重建第二套 UI。

已在真实开发 PostgreSQL 执行迁移并通过浏览器打开旧版 DHR 的冻结详情及 DHR 数据审计；新版待汇总对象的端到端页面操作因当前库无测试对象，尚未实测。附件/ZIP、并发和审批变化通过聚焦集成测试验证。提交前需逐项人工确认质量与异常、源审批签署及证据范围，并填写说明后随版本冻结；系统当前不能通用解释任意表单的质量结论，不能把这一确认称为自动判定合格。签署全链路、企业备份恢复、恶意文件扫描及全部记录控制接口未在本轮完成验证。

## 6. 实施顺序与成功标准

1. **证据范围与展示目录解耦**：先定义实例身份、状态与完整范围及缺项核查；验收“不拖拽也完整、恢复默认不删证据”。
2. **审批/详情一致性**：完整证据版本、源变化检测、签署与权限；验收列表/审批/汇总读同版，新增来源与并发变化不漏检。
3. **附件与审计入口**：受控文件关系、来源核验、旧版本可查；验收误关联处理不破坏其他引用，实例日志与 DHR 审计可达。
4. **ZIP**：固定版本、完整/部分标识、原件与索引、权限和失败策略；验收不漏项、不重复、不混版。
5. **可选目录/UI**：保留已确认的整组/单份整理、顺序、别名、hover/focus行操作、独立实例与来源面板；按现有公共组件对齐。

详细场景以主设计 AC-01～AC-12 为准。客户市场、器械类别、企业签署/保存 SOP、恶意文件扫描和监管可接受的电子副本格式仍需专项确认，不冒称通用实现覆盖所有客户法规。

## 7. 数据与历史保护

- 本轮已执行 0102/0103 数据结构迁移；不做旧汇总数据回填、旧逻辑兼容或历史清理。用户允许必要时清理旧数据，但本轮没有实施删除。
- 新提交版本使用完整证据语义；旧版本只保留现有历史读取，不因新设计补入证据或重写已发生的审批事实。
- 首次开工冻结生产上下文及审批绑定；后续配置发布不能静默改变在途对象。
- 新版本可引用原来源记录但必须保存可靠内容版本及签署/状态依据，不能只保存指向实时变化对象的 ID。
- 表单变更/作废由来源记录控制域负责，DHR 消费真实生效事件；活动记录作废资格沿用该域未决边界，不在这里补全。

## 8. 关键文件

后端：

- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrInstanceService.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrSummaryService.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrReviewService.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrEvidenceImpactService.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ProductionExecutionService.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/FormInstanceRecordService.java`

前端：

- `gmp-platform/frontend/src/pages/dhr-management/DhrManagementPage.tsx`
- `gmp-platform/frontend/src/pages/dhr-management/DhrSummaryPage.tsx`
- `gmp-platform/frontend/src/pages/dhr-management/summarySourceGroups.ts`

本轮新增并已在开发库应用 0102 完整证据版本、0103 受控附件迁移；0089、0092、0093、0101 为此前基础。

## 9. 验证与交付

本轮已运行后端全量测试、前端类型检查及真实 PostgreSQL 迁移；独立质量门禁和最终验证结果以当前任务交付记录为准。新版提交、上传及 ZIP 的完整浏览器闭环、备份恢复、文件恶意内容检查和电子签署专项验证仍是交付前的待办，不得以单元测试替代。

本文件是设计/工程交接，不替代企业质量负责人、法规适用性评估或系统验证。
