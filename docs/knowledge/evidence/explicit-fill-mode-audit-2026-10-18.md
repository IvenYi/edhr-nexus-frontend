# 显式填写模式审查的业务依据与实现边界

本批为 `AUD-H003` 确定性整改，决策包为 `docs/development/branch-review-20261018-w3-explicit-fill-mode/decision-package.yaml`。知识基线保持 `0.3.25 / schema 1.2.0`，实际读取的来源、目标和项目/本体/交接契约均为 `edhr-dev@4b25dc7f29c27cfb39c0f570b547869aa0c2f289`。本批只同步该问题影响的知识，不重开 PR5/PR6，也不声明 W2/W3 或全分支审查完成。

## 既有确认与适用范围

`user-confirmed` 来源仍为 [原始填报设置确认](form-fill-settings-confirmed.md) 和 `DEC-0067-01/02/03/04/05`：作业表单节点和产品/产品簇工序绑定均显式选择 `DIRECT` 或 `PROCESS`；当前 MVP 不按旧流程引用推导缺失模式，不为旧数据保留开放默认，不回填或自动迁移旧数据。直接模式仍执行绑定的权限、字段例外、按钮和签署；按流程模式沿用所选已发布流程。新配置贯通保存重读、发布与执行快照，新执行快照不可变。原始九月确认和当时源码记录保持原文，不补造新的用户问答。

`DEC-0009-01/05` 同时保留：作业草稿允许配置不完整；发布才要求完整，草稿保存不改变当前发布版本。因此，草稿未配置模式不是第三种模式，也不能被解释成直接填报。该边界与显式模式要求没有冲突，不需要重复询问已确认政策。

本批没有新增或整体替代 DEC；`DEC-0036-01A` 的既有局部替代范围不扩大。表单版本生效资格、流程版本治理、权限签署及已有冻结消费边界继续适用。`AUD-H004/H009/H010`、A12 和两项旧 DHR high 不由本批关闭。

## 原始源码问题

`original-evidence`，以下均直接核对上述基线的源码和测试，并非以旧行为授权新政策，也不是运行通过证明：

- `gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/service/FormFillSettingsService.java::usesProcess` 把缺失模式当作非流程；`serialize` 自动补 `DIRECT`；`validate` 对整体 null/missing 设置直接返回。这使严格绑定写入和新快照构建可以获得开放默认，而未要求显式模式。
- `gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/controller/WorkTemplateController.java::saveGraph` 对 FORM 配置缺失/null 模式补 `DIRECT`，改变了本可保存为未配置的草稿；`validatePublishableFormProcessReferences` 只在存在 `fillMode` 或 `directFillConfig` 时调用填报设置校验，旧式缺失模式节点存在发布旁路。
- 同一 Controller 的 `formProcessReferenceStatuses` 对草稿直接调用上述宽松解析；将解析收紧时必须保持 GET 可读取未完成草稿，仅消费显式 PROCESS 引用，不能把严格发布门槛搬到读取入口。
- `gmp-platform/frontend/src/components/form-fill-settings/types.ts::fillMode` 把缺失模式返回为 `DIRECT`；共用按钮打开和应用也会写入推导值。`FormFillSettings.tsx` 和 `WorkTemplateEditor.tsx` 因此把未配置展示成直接填报，而非保持待配置。
- 既有 `WorkTemplateControllerTest` 的 `saveGraphPersistsExplicitDirectModeWithoutInferringDormantProcess` 输入缺失模式却断言保存 `DIRECT`，固定了错误默认；整改需要保留其余草稿、权限、签署、引用及连通性断言，以显式配置替换依赖错误默认的夹具。

沿用 `discrepancy.form-fill-settings-missing-mode-default-and-validation-bypass` 和审查台账 `AUD-H003`，不另造第二条同根问题。原全量审查记录保留其提交时点与状态。

## 工程落实与不受影响范围

以下是将已有确认落实到当前入口的工程方案，属于 `inference`，不伪装成新增逐字用户确认：

- 严格配置解析只接受对象内文本枚举 `DIRECT` 或 `PROCESS`；工序绑定持久化/复制、作业发布和新执行快照不得补值或跳过缺失设置。每个 FORM 都经过适用配置的完整校验。
- 作业草稿保留缺失/null 的未配置状态；已提供的非法模式按基础格式拒绝。未完成草稿仍可保存、GET 和继续编辑，不因缺少模式或流程/表单引用提前触发发布级校验。
- GET 流程引用状态只解释显式 PROCESS；存在休眠流程引用本身不决定模式。前端共用设置、按钮和节点文案显示待配置，打开或点击应用不自动补模式，明确选择后才保存所选模式。既有工序新增命令显式创建 DIRECT 配置与读取旧缺失对象推导是两件事，不在本批另增“所有创建入口都必须额外点击”的业务政策。
- 不修改既有冻结执行，不恢复或重造历史数据，不加兼容推导、运行选项并集或新规则引擎。CUSTOM 挂载入口不通过当前配置模式入口，不能据本批把它扩成必须提供模式。既有活动模式隔离、事务、审计、权限和签署门槛保留。

## 本轮实现与验证时点

本体初次同步时主侧源码和测试仍在进行，当时未预写差异解决或测试通过。源码稳定后，本体角色实际读取严格解析、草稿保存/GET和发布两分支源码：DIRECT经过完整设置校验，PROCESS保留原节点/按钮精确诊断后同样执行完整校验，缺失/null/空/空白流程ID明确拒绝。严格共享解析贯通原产品/产品簇保存与复制、以及`ExecutionSnapshotBuilder::attachFillSettings`；既有冻结消费者和CUSTOM入口没有本批生产修改。前端实际helper不再推导模式，配置组件、按钮打开/应用和节点标题明确区分待配置。

本体只读当前Surefire XML的suite/case元数据核对主侧最终结果：10个suite合计296项，293实跑通过，0失败/错误，3项既有条件跳过。`BusinessKnowledgeModelTest` 89、`ProductProcessControllerTest` 14、`ProductProcessOwnerServiceTest` 7、`ProductionExecutionIntegrationTest` 71（68实跑/3跳过）、`FormFillSnapshotTest` 3、`ProductionExecutionEngineTest` 22、`ProductionExecutionFormValuesTest` 8、`FormFillSettingsControllerTest` 2、`WorkTemplateControllerTest` 69和`FormFillSettingsServiceTest` 11。跳过为`formRecordsBrowserFixture`、`firstStartFreezesOneCommittedConfigurationDuringProcessRebinding`、`browserEvidenceFixture`；不将跳过算通过。后端集成默认使用H2 PostgreSQL兼容模式、MockMvc/JPA/JDBC和事务，不是本轮原生PostgreSQL或全认证浏览器HTTP E2E。

本轮新增的严格边界反例覆盖缺失设置、空模式、非法类型/枚举、休眠引用不推导和新快照不生成开放entry；Controller场景保留未配置草稿保存/重读、拒绝无模式发布及PROCESS缺失/null/空/空白引用，并断言失败不保存版本或审计。发布PROCESS空引用问题在把完整校验移动到原精确诊断之后时曾因旧continue漏检，主侧新增反例真实失败后修复；不把该中间失败伪装成测试环境故障。首轮广回归的三个失败来自`seedConfirmationWork`缺失模式的旧夹具，改成明确DIRECT后重跑通过；原事务/legacy投影断言保持，不新增旧数据兼容分支。

本体实际读取`/tmp/edhr-w3-browser/browser-results.json`：真实Chromium共5场景passed，包括共用inline及dialog在1440/390宽度各一场，及真实WorkTemplateEditor在1440的发布阻断、草稿保存重读。各场page errors和console errors为空，组件场景横溢出检查为false。浏览器使用受控API，Work场景实际观察到一次graph PUT；不能据此宣称浏览器已认证连接真实数据库、产品/产品簇整页或全站移动端已验收。主会另报告当前Node 13项通过；其最终安全统计和原始产物摘要按本批台账归档，本体不冒称亲自执行这些测试。

`discrepancy.form-fill-settings-missing-mode-default-and-validation-bypass` 据当前源码及上述主侧实际回归更新为resolved，仅关闭AUD-H003同根实现差异。原固定提交的审查记录、原用户确认及九月初始实现说明不改写；本体结果不是独立qualityResult，最终质量仍须由未参与修复的新实例实际完成。构建、lint和官方UI扫描按本批最终台账记录实际结果，本体不据旧批次或工具可用性推断通过。

本次定义和规则继续为 `specified/internal`，不新增执行契约，不改变 `0.3.25`、schema 或 P0/in-progress，不新增试点，也不将 YAML/ID/路径诊断解释为全库语义审计或发布级门禁。
