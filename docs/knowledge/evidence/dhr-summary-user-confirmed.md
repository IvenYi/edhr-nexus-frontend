# DHR 汇总与审批设计确认

知识基线：`0.3.24`；修订日期：2026-09-25；成熟度：`specified/internal`。
统一交接：`docs/development/dhr-summary-decision-package.yaml`（DEC-PACKAGE-20260919-DHR-SUMMARY）。
现行设计：`docs/dhr-management-product-research-and-roadmap.md` 第 6～11 节；第 2/4/5 节保留首版时点。

## user-confirmed

用户明确授权原位修订 DEC-0063/0068/0071/0072 及关联规则、事实与证据，不新增重复迭代方案。旧手选和完成状态纳入政策不再是现行需求，历史实现保留于 implementationDiscrepancies 与 Git。

- 按生产对象持续自动归集目录、作业、自定义实际实例及受控附件，不以手选或完成状态决定可见；普通汇总整理/提交仍限生产正常完成，已终止对象政策不变。
- 未完成、待审批、失败、作废、替代与处置历史保留，不冒充合格完成。COMPLETED 是流程状态，不等于检验合格；质量结果及处置另行核查。
- 空来源不造证据；应有记录、数量、签署、质量结果及异常处置按冻结配置和适用规则检查。必填目录只是其中一项，普通选填不自动豁免或一律阻断，既有未完成补录阻断保留。
- 证据范围与展示目录解耦，全部证据有默认位置。目录、别名、排序和组/单份整理不改变身份、内容或生产归属；取消自定义位置恢复默认位置。DIRECTORY 保持基础归属，自定义根目录和子目录属于展示层。
- 作业/工序表单由执行上下文绑定生产对象，不设计为人工选择归属；填错另一批次的值是内容错误，自定义选错上下文和附件误关联分别处理，不虚构自动归属事故或开放跨批次移表。
- 手工附件及纸质扫描核验来源、对象及内容关系；保存文件版本、来源/核验、上传信息及原件追溯，区分原记录形成时间和扫描时间。替换/解除关联受权限、审计及版本影响控制，旧冻结版本仍可追溯。
- 提交重新核查完整集合及来源版本（含新增实例/附件），陈旧提交阻断。冻结全部证据、检查结果（规则依据/版本、时间、问题、处置及确认）、目录展示、附件和审批绑定。
- 提交人必须逐项人工确认质量结果与异常处置、来源审批签署、完整证据范围，并填写核查说明；三项确认、确认人、确认时间和说明随 `checkResult` 冻结。系统不自动判读任意表单质量结论，人工确认也不表示系统已自动证明合格或签署有效。
- REQUIRED 使用开工冻结的 DHR_SUMMARY 流程版本，任务绑定完整冻结证据及检查结果。NONE 不另启本系统汇总审批，不免法定审核、源签署或放行；无虚构批准和自动放行。
- 审批任务专属附件下载必须经过任务级授权，且只能下载本任务绑定冻结版本包含的附件；通用 DHR 查看权和其他任务资格不扩展此范围。
- 来源生效变化自动检测、提示并阻断过时批准；人工退回或发起新版本重审，旧批准与快照不覆写。申请待审不等于生效，来源资格及变更作废仍归记录控制域。
- 实例操作日志负责填报、签署、变更作废及历史内容定位；DHR 数据审计负责目录、附件关系、核查、提交、审批及导出，分层关联而非替代。
- ZIP 支持整份冻结版本和选定范围，包含对应来源生产执行审计与签名，并保持 DHR 审计及审批签署可追溯；部分包明确标识，不能缩减审批对象或冒充完整 DHR；完整包不静默漏项。暂不打印，具体文件布局/序列化仍为工程建议。
- 旧汇总历史数据不做兼容、回填、清理或主动删除；保留已经发生的运行事实与 Git 历史，不把旧错误方案继续投影为现行规则。

## original-evidence 与实现差异

2026-09-25 静态复核；Git HEAD：`ea2036027124c1fc9b9fb9aa2ddbb959478a1a81`；`sourceRevision: working-tree`。

- `DhrInstanceService.detail` 按 object_id 查询实际生产表单；`DhrSummaryService.candidates` 收集三类来源，`validatePlacements` 先给全部实际实例默认位置再叠加展示设置，不以 COMPLETED 过滤，`submit` 逐实例写入冻结证据。草稿和提交重新核对实例及附件范围，旧手选行为只由 Git 历史解释。
- `DhrSummaryService.submit` 已调用 createDhrSummaryInstance；`DhrReviewService.act` 已有任务、签署、批准、人工退回及新草稿路径，不能继续说审批运行时整体不存在。
- `DhrEvidenceImpactService.changes` 已比较冻结表单、新增关联记录与受控附件，并被批准动作调用；读取比较不能冒充记录控制生效事件、主动通知或质量检查结果变化的完整闭环。
- `summarySourceGroups.ts` 的来源键为 originKind/operationId/formId；空目标过滤自定义 placements，`DhrSummaryPage.effectivePlacements` 补回默认位置，不再把移出展示当成排除证据。
- `submit` 已校验三项人工确认和非空说明，并在 `checkResult.manualReview` 冻结确认人、时间和说明；`DhrSummaryPersistenceTest` 有缺确认阻断测试，但未见逐项/说明边界和冻结字段的完整断言。`DhrReviewController.attachment` 先调用任务详情授权，再以版本号调用 `DhrAttachmentService.downloadableFile` 校验附件快照成员及摘要；权限测试覆盖无菜单权和任务拒绝路径，尚非完整真实任务端到端验证。
- `DhrArchiveService` 已把提交时点前的生产执行审计与签名写入 ZIP manifest；`sourceSignatures` 与 `reviewSignatures` 均导出签署 payload 并校验 SHA-256，摘要不一致即阻断导出。`DhrAttachmentAndArchiveTest` 直接断言两类签名 payload，且将审批签名 snapshot_hash 改错后验证 FULL ZIP 阻断、恢复摘要后继续原测试；附件测试仅直接证明冻结包含附件的正向读取，尚缺跨版本拒绝断言。源码和聚焦测试文件存在不等于真实数据库 ZIP、外部记录控制审计全集或发布验收。任意质量结果/异常处置和源签署有效性并无通用自动判读；人工确认不能被写成自动合格结论。

详细剩余差异分别见 DEC-0063/0068/0071/0072；本体角色只读新业务源码及测试文件，未运行 DHR 业务、浏览器、数据库或导出测试。旧报告只作 secondary-reference，不能作为本次新能力验收。

## inference 与 evidenceGaps

ZIP 内部文件格式和清单布局、影响事件传输及锁方案属于工程实现选择。国外 US/EU 仅为工程建议基线，未确认客户市场；器械分类、签署/留存 SOP 与全部法规适用性为 evidenceGap，不阻塞通用文档修订。中国只采用 2025 新版设计基线；法规原文核验与功能映射以主设计第 7 节为来源，不宣称全集合规。

交接中的 `concept.form-instance-record` 未在当前本体注册，关系复用既有 `concept.form-instance`；`one-to-many` 按 schema 的零下界词汇记为 `one-to-zero-or-many`，避免为空来源制造必有实例。受控附件语义保留在同一决策与完整证据事实中，不扩展未确认的数据接口或全局表单来源枚举。

## 本轮知识校验（original-evidence）

- 环境：项目 pom 要求 Java 21；实际 Homebrew OpenJDK 21.0.11、Maven 3.9.16。macOS java_home 注册查询失败，但 PATH 的 java 与 Maven 均使用上述有效 Java 21。
- 在 gmp-platform/backend 执行 `mvn -Dtest=BusinessKnowledgeModelTest test`：BUILD SUCCESS，59 项、0 失败、0 错误、0 跳过。报告为 `gmp-platform/backend/target/surefire-reports/com.zencas.edhr.knowledge.BusinessKnowledgeModelTest.txt`，验证 schema、引用、事实、provenance 与投影等正式契约。
- Ruby 只读定向检查：177 份知识 YAML 可解析且统一 0.3.24；四项决策及声明均 specified/internal 且保留实现差异；冻结字段含完整范围/检查/附件/状态/版本。完整证据范围、必填目录适用资格与有效变化事实均为 not-available，不冒充当前运行数据；旧 COMPLETED 实现事实与现行合格资格事实分开。
- `git diff --check -- docs/knowledge docs/architecture/business-knowledge-model.md docs/architecture/transaction-traceability-dhr-business-rules.md` 通过。未修改代码、测试、迁移、PRD、主交接资产或 output/；未运行 DHR 业务/浏览器/数据库/法规全集验收。
- 本结果只完成本体更新与知识校验；独立 QA 由主智能体随后派发。本轮新能力实现缺口不阻塞已授权的文档验收，不代表运行功能交付。

## 同切片补充收尾复核（2026-09-25）

- 用户本次直接确认三项人工核查、说明与确认人/时间冻结、审批任务专属附件下载、ZIP 来源生产执行审计/签名，以及历史数据不兼容、不回填、不处理、不主动删除；这些是原 DEC-0063/0068 的增量修正，不是新的 DEC 或新迭代。`inferred` 的境外具体适用性仍未升格。
- 再次执行 `mvn -Dtest=BusinessKnowledgeModelTest test`：59 项通过、0 失败、0 错误、0 跳过。Ruby 解析 177 份知识 YAML；决策包仍为 0.3.24、concept/rule 为 specified、unresolved 为空；`git diff --check` 通过。只读核对了当前控制器、服务和聚焦测试源码，未由本体角色执行 DHR 业务、真实下载或 ZIP 端到端测试。
- 交接 `docs/dhr-management-handoff.md` 的“用户允许必要时清理旧数据”应由主智能体按最新“不主动删除”口径核对；`docs/development/dhr-summary-decision-package.yaml` 格式及既有 confirmed/unresolved 无冲突，但尚未载入本次用户补充的三项确认、任务附件和 ZIP 来源追溯条目，本角色无该文件写权。
- 最后 ZIP 补充复核：`DhrArchiveService.signaturesFor` 将 `reviewSignatures.snapshotData` 写入清单并按 SHA-256 校验，与 `sourceSignatures` 同样失配阻断；测试已覆盖审批签署 payload 和 snapshot_hash 错误时 FULL ZIP 阻断，恢复摘要后继续原测试。真实数据库 ZIP 导出验收仍缺。
