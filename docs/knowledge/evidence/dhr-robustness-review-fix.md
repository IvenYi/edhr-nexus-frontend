# DHR 健壮性 review 修复证据

knowledgeModelVersion: `0.3.24`

决策包：`DEC-PACKAGE-20260923-DHR-ROBUSTNESS`；范围：`dhr-summary-robustness`；执行级别：L2。

采集日期：2026-09-23。工作区：Local `/Users/ivenwang/Documents/edhr-nexus`，分支 `edhr-dev`。起始 HEAD：`7ad18e464cd918f3c5ac256e6525f2f87c7a9cd1`；源码核对对象为并行修复中的 `working-tree`，不代表部署版本。

本记录仅补充 DEC-0062/DEC-0063 既有范围内的缺陷修复证据。所有条目限内部阅读，不新增概念、规则、生命周期、权限或执行契约，不推进知识版本或 `verified` 状态。用户确认修复方向不等于修复已实现或已验收。

## 用户确认（user-confirmed）

原始用户指令：“好的，修复上述问题，没问题的话继续”。确认的是先修复、通过后继续冠骋填报/审核调研及开发的顺序。本轮证据仅覆盖修复阶段，不将主智能体的工程方案称为用户逐条确认。

以下为主智能体依据该授权制定的修复目标与工程边界（inference），不是新的用户产品决策：

- 修复 DHR ID 传输、草稿恢复和审计缺陷；ID 字符串传输、初始化与明确重载边界、保存后缓存同步、保存成功立即更新 revision、保存/提交互斥均为本轮修复目标。
- 草稿保存应原子记录完整目录、placements、revision 和 dhrId 的前后内容；具体复用 AuditEvent 字段的实现选择仍单列为 inference。
- 新目录快照的 ID 存为字符串；历史 numeric 目录仅在响应时投影，不改写已持久化冻结内容或哈希。不新增迁移，不回填历史数据。
- 保留服务端权限和版本冲突校验、提交版本不可变及三类来源边界；不开发 DHR 审批运行时，不改变生产生命周期。
- 用户既有 `fill_settings_json` 变更仅作为相邻依赖；如需同步 H2 fixture，不据此宣称填报设置全域已验证。

决策包的 `confirmed.concepts/relationships/rules/executionContracts` 与 `unresolved` 均为空；上述记录是修复授权和验收目标，不扩充权威业务规则。

## 历史依据（secondary-reference）

- `docs/knowledge/decisions/DEC-0062-dhr-instance-management-phase1.yaml`：首次开工唯一实例、冻结上下文、生产完成同步、查看权限边界。
- `docs/knowledge/decisions/DEC-0063-dhr-summary-and-review-configuration.yaml`：三类来源、不可变基础目录、覆盖目录、实例唯一归档、提交冻结和审批延期。
- `docs/knowledge/rules/dhr-summary.yaml` 与 `docs/knowledge/rules/dhr-instance-management.yaml`：既有规则索引，不作为本轮修复已完成的证据。

上轮 review 原始报告未随本轮输入提供；问题范围来自用户交接，不推造问题编号、严重级别或历史复验结果。DEC-0063 的既有 `implemented/internal` 状态不证明新增修复完成，原有空 parentKey 差异记录不在本次修改范围。

## 工程选择（inference）

- `inference.dhr-draft-audit-before-after`：复用现有 AuditEvent 的 `contentBefore/contentAfter` 保存完整草稿前后快照，是决策包提供的工程推断；不作为新增用户业务规则。
- `extensionStrategy: product-core`：标准 DHR API/UI 健壮性修复，不添加客户分支。`production/dhr` 负责目录响应与汇总事务审计；`frontend/dhr-management` 负责编辑状态与查询缓存。

## 实现观察（original-evidence）

以下为工作树静态观察；“已见源码”不等于测试通过、部署完成或 `verified`。定位以方法名及 SHA-256 为准，行号仅为本次核对提示。

| 修复目标 | 当前观察及源码定位 | 证据边界 |
| --- | --- | --- |
| 新建目录快照 ID 字符串 | `DhrInstanceService.createDirectorySnapshot`（约 199 行）将目录 id/parentId、条目 id/directoryId/formTemplateId/formTemplateVersionId 写为字符串，空 parentId 保持 null。 | 已见源码；长 ID 端到端测试待提供。 |
| 历史目录响应投影 | `DhrInstanceService.directoryForResponse`（约 288 行）先 deepCopy 再转换上述 ID；detailRow 调用该投影。`DhrSummaryService.version`（约 82 行）仅对返回的 baseDirectory 调用同一投影，snapshotHash 仍读存量值。 | 这些读取方法未见历史快照 UPDATE；不推断全系统历史数据迁移或哈希重算已测试。 |
| 草稿前后审计 | `DhrSummaryService.saveDraft`（约 101 行）在事务方法中锁定并读取旧目录、placements、revision，更新前形成 before，更新后调用 writeAudit；`draftAuditSnapshot`（约 348 行）包含字符串 dhrId、revision、overlayDirectories、placements，writeAudit 写入 contentBefore/contentAfter。首次创建 before 为 null，后续更新保存完整旧内容。 | 已见源码及下述 H2 事务测试报告；这里的“完整目录”指完整可编辑 overlayDirectories，基础目录仍由 DHR 冻结快照关联，不声称审计 payload 包含 baseDirectory。AuditEventRepository 在测试中为 mock，实际审计仓储落库仍未被该测试证明。 |
| 初次/明确重载初始化 | `DhrSummaryPage.SummaryWorkspace` 的 effect（约 255 行）以 initializedKey/workspaceKey 限定初始化；草稿初次获取完成后才载入，后台刷新同一 key 不覆盖本地草稿。查询设置 refetchOnMount 为 always；确认重新载入在 refetch 成功后清除 initializedKey。 | 末次核对已见源码，取代初次读取时的旧观察；重开、后台刷新与明确重载交互仍待测试。 |
| 保存后缓存与提交重试 | `persistDraft`（约 384 行）在保存返回后立即 setRevision，并 setQueryData 同步 dhr-summary-workspace 的 draft 和 DRAFT 状态；saveMutation 与 submitMutation 共用此方法，submit 在其后执行。异常时 refreshAfterError 重新查询；远端 revision 不同则提示并等待明确重载。 | 已见源码；保存成功/提交失败、响应丢失与重试的实际结果仍待验证，不声称自动合并或所有异常可无损重试。 |
| 双动作互斥 | `write`（约 395 行）以 writeInFlight 同步 guard 和 isWriting 包住保存/提交，先取消工作区查询，finally 释放；两按钮共享 isWriting/remoteDraftChanged 禁用条件，目录和归档写函数检查 writeInFlight。 | 已见源码；双击、交叉点击及请求竞态仍待真实交互复验。 |
| 相邻 H2 fixture | `ProductionExecutionIntegrationTest.setup`（约 119、157 行）增加 fill_settings_json TEXT，并给种子绑定提供 fillMode 为 DIRECT 的配置；seedSignedWork（约 785 行）的流程表单种子补充 fillMode 为 PROCESS；相邻 `ExecutionSnapshotBuilder` 约 83 行读取 fill_settings_json。 | 只说明测试夹具已出现对应调整，不证明填报设置全域正确，也不把相邻 dirty 实现归属本轮。 |

继续保留的源码约束：`DhrSummaryService.lockedCompletedDhr` 阻断非 COMPLETED 及已提交的 DHR；`nextRevision`/`requireExpectedRevision` 校验保存与提交修订号；`DhrSummaryController` 保留汇总菜单、编辑、提交权限检查。前端 `api/dhr-instances.ts` 的 DHR/目录/草稿/版本 ID 类型为 string。以上仅说明指定源码中存在约束，不替代真实权限或并发验收。

源码定位清单（均相对仓库根；`sourceRevision: working-tree`，`reviewStatus: reviewed` 仅表示静态核对）：

| 文件 | SHA-256 |
| --- | --- |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrInstanceService.java` | `8570e28d7df1af21278867f098b6353f0cfe2f368282f5adf67646ee462b3eea` |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrSummaryService.java` | `6c84924b79ce4dbb8094c338bfdf336273faf54f718d64492f47e6ff64ee2e0a` |
| `gmp-platform/frontend/src/pages/dhr-management/DhrSummaryPage.tsx` | `9235b71f4360e3ffab542edf3a419dc187c2f6a5f204bee4be1b575a2d5afbe8` |
| `gmp-platform/frontend/src/api/dhr-instances.ts` | `afa503ca0beed8398c2b12d68d15e1bb58b9833ef490509168b632d37adcee9f` |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/DhrSummaryController.java` | `531412b7f87a4c3a72681f7d19bedfaeccae46350152b162ba178865ae9223de` |
| `gmp-platform/backend/src/test/java/com/zencas/edhr/production/controller/ProductionExecutionIntegrationTest.java` | `61b542454d4633685ef71ed14f88953e102df5d5f48caca4e4c1c020c6387f93` |
| `gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/DhrSummaryPersistenceTest.java` | `bfbe2ee5ac32e9a15b6407ad5140f6031ec27824e05a35ea25ce85ca888828aa` |

并行修复后若文件摘要变化，本表不是新源码的复核证明；应重新核对相应条目，不用旧观察替代最终实现和质量结论。

## 主智能体测试交接与报告核对

主智能体进度交接（secondary-reference）：运行实现已完成第一轮，DhrSummaryPersistenceTest 五项通过，生产集成测试 47 项、0 失败、2 跳过；正式知识测试稍后执行。这是实现及测试进度交接，不是用户业务决策。

本体角色随后只读核对原始 Surefire 文本报告（original-evidence），未自行运行 Maven。两份本地报告修改时间均为 `2026-09-23T00:20:01+0800`，与交接数量一致：

- `gmp-platform/backend/target/surefire-reports/com.zencas.edhr.production.service.DhrSummaryPersistenceTest.txt`：Tests run 5，Failures 0，Errors 0，Skipped 0；SHA-256 `7197792fafadfc75cf8106908be420dd5803522b50bd1c65453e74a5dd4d83cc`。
- `gmp-platform/backend/target/surefire-reports/com.zencas.edhr.production.controller.ProductionExecutionIntegrationTest.txt`：Tests run 47，Failures 0，Errors 0，Skipped 2；SHA-256 `02e3a56ecd9ab566559c1b7c6886960df489bbf13d90d654e5dcaedfaadc732b`。47 是报告总数，包含 2 个跳过，不写成 47 项全部执行通过。

测试源码 `DhrSummaryPersistenceTest` 已完整读取：五项分别覆盖长目录 ID 响应精度/原快照不变、草稿前后内容及陈旧 revision、保存审计异常回滚、提交失败保留草稿并在重试后冻结候选/关联/哈希、提交审计异常回滚版本/关联/草稿删除。配置使用 H2 PostgreSQL mode、真实 JdbcTemplate 和 DataSourceTransactionManager；DhrInstanceService 与 AuditEventRepository 为 mock。因此该证据支持汇总服务 JDBC 事务与审计 payload/异常回滚场景，不证明真实 PostgreSQL、实际审计仓储持久化、新建 DHR 快照全链路或前端交互验收。

报告位于可清理的 target 目录，以上保留读取时摘要及数量，不把它作为稳定知识路径或已发布版本凭证；后续重跑结果需重新核对。尚未收到 BusinessKnowledgeModelTest 和新质量实例最终结果。

## 验证与交接边界

- 本轮 Ruby 只读定向诊断已通过：9 条 evidence 的 schema 必填字段/字段类型/枚举、全知识目录同 ID 定义唯一性、仓库内相对路径、DEC-0062/63 基线一致性、internal 投影、四类 provenance 和上述 7 份源码 SHA-256。诊断期间捕获并重新核对了并行 fixture 更新；本结果仅针对最终登记的源码摘要。
- 本体角色仅核对源码和本次两个证据文件的结构、路径、标识及内部投影，不改运行代码或既有 dirty 知识文件。
- 按主智能体分工安排，本体实例不运行 Maven 以避免并行构建争用。正式 `BusinessKnowledgeModelTest` 由主智能体执行并提供证据；未收到结果前不宣称正式知识校验通过。
- 长 ID 契约、save/submit 异常重试、重开缓存与后台刷新、草稿前后审计、提交不可变与冲突均需主智能体的聚焦测试及全新质量实例独立复验。本记录不替代运行验收或质量门禁。
- 暂缓：正式知识测试结果接收、前端交互复验、独立质量结论、部署/发布确认、填报设置全域验证和 P1/P2/P3 本体建设。

## 主开发最终修复验证（2026-09-23，original-evidence）

此节更新上文采集阶段的“待验证”状态；上文源码摘要仅对应当时观察，不作为本节最终源码指纹。

- `mvn -q -Dtest=DhrSummaryPersistenceTest,DhrSummaryServiceTest,DhrSummaryMigrationTest,DhrInstanceMigrationTest,ProductionControllerAuthorizationTest,ProductionExecutionIntegrationTest,BusinessKnowledgeModelTest test`：124 项，0 失败、0 错误、2 跳过（原有按系统属性启用的人工浏览器夹具）；日志 `/tmp/edhr-dhr-fix-final-tests.log`。
- 其中生产执行集成测试新增首次开工 + DHR 详情真实接口大 ID 回归，现为 48 项；知识校验 59 项；汇总持久化 5 项。测试未对开发业务库执行迁移或写入。
- 前端 `npm run build` 通过，日志 `/tmp/edhr-dhr-fix-build.log`。
- `/tmp/edhr-dhr-browser-venv/bin/python gmp-platform/frontend/scripts/test-dhr-summary-browser.py`：真实无头 Chrome + 当前前端，全部业务 HTTP 请求隔离模拟；保存后立即重开、大 ID 归档目标、后台刷新保留本地编辑/确认重载、请求期间互斥、提交失败重试、立即查看冻结版本均通过。没有未捕获页面错误；日志 `/tmp/edhr-dhr-browser.log`。这不等于前后端真实端到端或线上验证。
- `git diff --check` 通过。
- 本体实例已返回 `ontologyResult: updated`；全新独立质量实例 `01a0c9f0-1951-7130-af84-c8b9bc1bcef2` 已返回 `qualityResult: passed`，无阻断项。末次复验重新运行浏览器脚本，5 组检查通过，并核对后端文件摘要未变化；确认弹窗关闭 X 和默认取消焦点为源码核对，未单独执行键盘可访问性测试。该结论仅覆盖本轮修复及直接相邻路径，不代表完整生产/审批或发布验收。实例已关闭。

后续阶段仅在质量通过后继续：冠骋 DHR 填报、审核原始源码调研及本产品落地。此前“审批运行时延期”描述是修复阶段边界，不否定用户已授权质量通过后继续研发。
