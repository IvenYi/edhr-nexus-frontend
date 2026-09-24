# DHR 填报与审核设计确认及证据边界

知识基线：`0.3.24`；日期：2026-09-23；切片：`dhr-filling-review`；执行级别：L2。
决策包：`DEC-PACKAGE-20260923-DHR-FILLING-REVIEW`；落地决策：`DEC-0068`。
成熟度：`specified`；可见性：`internal`。实现仍在进行，本记录不构成功能验收、客户能力或运行时契约。

## user-confirmed：本次输入

来源为本次用户消息及随附决策包；下面是可追溯摘录，不声称重新读取了其他对话全文。

- 四个菜单为 DHR填报、DHR汇总、DHR审核、DHR列表。DHR审核是针对不可变汇总版本的个人待办/已办。
- 三类实例来源沿用目录直接绑定、作业表单节点、生产执行自定义表单。来源分类不等同于全局实例的业务承载域枚举；不据此新增全局来源值。
- 补录属于低频受控操作，不凸显；追加创建新表单实例，不修改旧实例或手工创建 DHR。
- 朋友负责表单变更和作废；DHR 消费实际生效结果。申请待审不代表源证据已改变。
- 审核中受影响由系统自动标识、提示并阻断过时批准，退回整理由人执行；退回后创建新草稿/汇总版本，保留历史。
- 已批准版本不自动退回、不擦除旧批准或快照；由人发起新版本重审。
- 完工补录不自动重开生产；上述处理不自动影响产品放行，不回填历史。
- 审核使用冻结的 DHR_SUMMARY 定义/版本及本次不可变汇总版本；通用流程入口不能绕过域校验。
- 页面遵守新版共享组件规范，DHR 开发不接管朋友的变更作废模块。

“新增实例”在本切片指表单实例；“新版本”指同一 DHR 下新的汇总版本。两者都不改变每个生产对象唯一 DHR 的既有约束。

## 历史决策承接（secondary-reference）

既有知识仅用于确认现行模型和定位来源，不当成本切片新功能的实现证据。

| 既有资产 | 本次承接或局部替代 |
| --- | --- |
| DEC-0062 | 保留首次合法开工自动创建唯一 DHR、冻结生产上下文和完工语义；只承接并局部替代 08 中本切片填报补充、汇总审核/退回的延期范围，不扩展 DHR 作废、发布或归档。 |
| DEC-0063 | 保留三类候选、实例级归档、基础目录不可变、提交冻结、NONE/REQUIRED 和不回填；仅替代 07 的审核延期范围。本次是设计授权，不追认其历史切片已实现审核。 |
| DEC-0056 | 最新任务明确指定 DHR审核。本切片仅替代 01 中 DHR 菜单展示名；流程中心“审批流程”、表单审批及稳定技术标识保持原契约，不全面撤销术语规则。 |
| DEC-0067 | 共享填报设置是相邻进行中切片；不将其代码或知识状态升级，不把其“不兼容旧数据”扩大为允许删除本切片历史证据。 |
| open-questions.yaml | 活动表单作废资格、重新分配签名等问题仍归原领域；本切片不替其作产品决定，也不清除未决问题。 |

原有 DEC-0062/63 和 README 的阶段性“后续开发”文字按其历史切片解释。本次只新增资产，通过新决策 supersedes 和此处局部范围保留追溯，不修改已有 dirty 文件。

## original-evidence：只读核对范围

`sourceRevision: working-tree`；基点 HEAD：`7ad18e464cd918f3c5ac256e6525f2f87c7a9cd1`；`capturedAt: 2026-09-23`。
复核方式为源码/规范静态读取，不是运行验证。并行实现继续变化时，以下观察不代表后续最终源码。

| 原始路径与定位 | 本次可支持的观察 |
| --- | --- |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrSummaryService.java`：`candidates`、`submit`、`version`、`lockedCompletedDhr` | 读取时三类候选来自 directory/work/custom；submit 冻结目录、候选、关联、哈希和流程引用，REQUIRED 使用 PENDING_REVIEW；既有写门禁阻断对已提交汇总的直接修改。只能作为新切片接入基点，不能证明审核、新版重审及影响检测已完成。 |
| `gmp-platform/backend/src/main/resources/db/changelog/0092-dhr-summary-workspace.sql`：汇总版本/证据表及状态约束 | 存在 DHR_SUMMARY 分类、汇总版本和实例证据关联结构，来源值为 DIRECTORY/WORK/CUSTOM；读取迁移不等于执行迁移，新状态兼容需由实现验证。 |
| `gmp-platform/frontend/src/pages/dhr-management/DhrSummaryPage.tsx`：imports | 当前汇总页引用 ListTableShell、TableStateCell、ConfirmDialog 和共享列表样式；引用存在不等于新页面及交互已验收。 |
| `docs/frontend/list-page-guidelines.md`、`docs/frontend/list-table-shell.md`、`docs/frontend/dialog-guidelines.md` | 当前共享规范来源：独立列表共用表格壳、表头/正文/固定列/列宽样式、TableStateCell；首列继承普通正文，不另设蓝色链接或特殊字重；普通表单使用 FormDialog、FormDialogSection、FormDialogFieldGrid；预览、确认、签名及内嵌明细按各自适用边界。 |
| `gmp-platform/backend/src/test/java/com/zencas/edhr/knowledge/BusinessKnowledgeModelTest.java`：`currentKnowledgeModelIsValid`、基线和负向测试 | 正式知识校验入口，可验证 schema、标识、引用及投影约束；不能验证 DHR 业务运行、页面或真实变更作废集成。 |

未使用竞品调研摘要证明本产品规则，未重新调研外部法规，也不将旧切片测试或质量结果复用为本切片结果。

## impactAnalysis：L2 设计范围

| 维度 | 确认范围与边界 |
| --- | --- |
| directImpacts | DHR 填报/审核菜单、受控追加、冻结版本审核及证据影响；源码接入基点为上表服务和页面。 |
| transitiveImpacts | 显式冻结 DHR_SUMMARY 绑定、个人任务/已办、通用入口防绕过；真实运行证据待实现。 |
| potentialImpacts | 朋友的变更/作废生效接口及修订标识尚未暴露；待审申请不当成生效。此项是集成依赖，不是已完成能力。 |
| unaffectedAreas | 产品放行、手工 DHR 创建、历史回填、生产自动重开均不在授权范围；表单变更作废实现仍归朋友。 |
| compatibilityAndMigration | 按包采用增量 schema/菜单权限，保留旧快照；不自动回填历史审核绑定，迁移与状态约束验证由主开发负责。 |
| snapshotImpacts | 已提交版本的内容、来源证据和冻结绑定不被后续操作覆盖；重新整理产生新版本。 |
| auditImpacts | 区分系统检测、人工退回、重新汇总及新版本审核，保留原批准、原来源和退回历史。 |
| permissionImpacts | 专用菜单/动作权限及冻结流程候选资格分别核验，个人待办与已办不能构成越权通道。 |
| testImpacts | 授权、并发、冻结绑定、通用入口防绕过、有效变化阻断、人工退回、新版重审、历史保留、共享组件交互；具体场景见 DEC-0068，均为待交付证据要求。 |

`extensionStrategy.selectedPaths: [product-core, transaction-orchestration]`。
DHR 域编排既有表单与流程引擎，不散落客户条件分支。主开发拥有 DHR 代码/测试，朋友拥有表单变更作废模块；本角色仅新增当前切片决策与证据。

## inference、缺口与暂缓

- inference：影响检测采用事件、查询时校验或其他机制，事务锁/幂等策略和补录入口具体控件均属实现选择，本记录不将其确认为业务规则。补录映射到哪一类来源须用实际实例证据核对，不凭本记录发明第四类。
- evidenceGaps：实际变更作废生效接口、有效修订定位及联调证据尚未提供。其缺失不阻塞记录已经确认的设计，但阻塞宣称该集成已实现。
- evidenceGaps：新填报/审核页面、任务、签署、并发批准阻断、新版重审和迁移的最终实现及测试证据仍待提供。不能以旧汇总服务或旧质量报告补齐。
- 决策包 `inferred` 与 `unresolved` 均为空；上述工程缺口不新增用户业务问卷，也不清空基线已有问题。
- 输入包的 `condition: {all: []}` 及 `block-stale-approval-and-notify`、`new-record-preserve-history` 不能直接成为当前 schema 的正式规则。本次将 `concept.dhr-review-workbench` 语义保存在 DEC-0068-01，将 `rule.dhr-human-return-on-impact`、`rule.dhr-supplement-not-reopen` 语义分别保存在 DEC-0068-05 和 03/08；这些输入标识未注册为概念或可执行规则，不伪造事实条件或执行契约。
- P0 仅沿用现有结构，未证明阶段退出；P1/P2/P3、schema/词典/本体/事实目录扩展、运行时和客户投影均暂缓。
- 质量门禁由主开发在功能切片收尾统一安排。本体结果仅说明这次知识资产更新及适用校验，不宣布 DHR 功能完成。

## 本次知识校验结果（original-evidence）

- `mvn -Dtest=BusinessKnowledgeModelTest test` 在测试编译阶段失败：并行工作树中的 DhrSummaryService 已增加 WorkflowEngine 构造参数，DhrSummaryPersistenceTest:165 与 DhrSummaryServiceTest:27 尚未同步；未修改这些业务测试，也不声称完整 Maven 生命周期通过。
- 该次编译已生成本次时间戳（2026-09-23 01:15，Asia/Shanghai）的五份知识校验源码对应 class，随后在 backend 目录执行 `mvn -Dtest=BusinessKnowledgeModelTest surefire:test`：59 项，0 失败、0 错误、0 跳过，退出码 0。该命令独立运行正式 JUnit 知识校验器，通过 schema、引用、路径与成熟度/投影等检查；不是旧报告复用，也不代表前述业务测试编译缺口已修复。
- Ruby 定向检查通过：新增 YAML 基线均为 0.3.24，决策及十条声明均为 specified/internal，证据路径存在且可见性为 internal，supersedes 指向本次列明的三项历史决策。
- `git diff --check` 通过；本角色仅新增 DEC-0068 及本切片两份证据文件，没有修改既有文件。未执行 DHR 业务集成、浏览器、真实数据库迁移或独立质量验证。
