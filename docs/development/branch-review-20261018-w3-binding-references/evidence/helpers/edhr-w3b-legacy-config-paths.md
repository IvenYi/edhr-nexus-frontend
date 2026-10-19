# W3B H009/H010 只读源码映射（非质量结果）

- contractBaseline / sourceCommit: `ca98ab2897990eba30bf1433134aa8560578f562`（PR16 已合并）。
- 知识基线 `0.3.25 / schema 1.2.0`。读取 AGENTS.md、codeplzreadme.md、业务知识模型、知识 README、open-questions 相关作业条件项，以及 DEC-0009/0010/0011、transaction-runtime 证据与规则。
- 本实例仅源码/规则辅助，未参与实现、未执行应用测试、构建、浏览器、数据库或 API 请求。没有生成 ontologyResult 或 qualityResult。原始文件和报告 SHA 见相邻 metadata。
- 本报告不重开 AUD-H003，不触及 A12、历史数据恢复、读取解释、迁移、清理或条件运行政策。

## 结论与证据等级

1. **H009：当前代码具备明确的不支持字段写入边界缺口，当前纯新建 UI 没有该字段生成入口。** FORM config 的 `completionCondition` 在完整图写接口中没有保留字拒绝；已有旧值或 API 带入该字段时会被原样写入。不能把这一点报告成“用户新建正常表单配置必现”，也不能把任意其他未知 JSON 字段自动扩大为同类业务缺陷。此字段有 DEC-0010-02 的具体禁止写入依据。
2. **H010：保存与发布确有不同字段形状门禁。** canonical `conditionBranches` 和 `conditionDefaultBranch` 同时存在时，旧顶层四字段可以经当前 API 保存；随后发布以 `hasLegacyConditionConfiguration` 拒绝。当前新建 UI 不产生旧字段，载入含旧字段的 CONDITION 时甚至直接过滤该节点，所以没有证明正常新建 UI 会主动产生混合字段。
3. 两者与“不完整草稿可保存”并不冲突：DEC-0009 允许缺少当前必填内容/未配置 AST/不连通，不代表支持已明确废弃的字段格式。最小整改应是**写入前字段形状拒绝**，不能直接把发布 AST、字段目录、表单生效或全图连通性校验移到草稿保存。
4. 以上为 `original-evidence` 源码结论和可执行反例设计；没有执行反例，不能作为运行验证通过。历史去重文档只作 `secondary-reference`。

## 已确认业务规定及原始依据限制

| 权威资产 | 具体含义 | 本次判断 |
|---|---|---|
| DEC-0010-02（decision 文件 15 行附近）及 acceptance `scenario.completion-condition-not-supported` | 当前 FORM 配置不支持 completionCondition；不读取、不迁移、不清理历史字段，后续不写入。 | 有明确不支持字段写入契约；拒绝当前写命令中的保留字段不需要解析其业务值，也不要求改写存量记录。 |
| DEC-0010-03 | 不改表单版本 API、引用、已发布边、数据库结构、审计或执行能力。 | 不宜通过重建历史图、清库或变更运行条件解决。 |
| DEC-0011-05 + acceptance `scenario.production-work-condition-canonical-configuration` | 使用 canonical 分支条件；保存或发布时拒绝旧字段和固定出口，不归一化兼容。 | 当前 saveGraph 顶层旧字段缺 guard，与验收定义不同；AST 完整性仍在发布。 |
| DEC-0011-02 | 唯一默认分支只表示否则，不保存 AST、目录版本或快照。 | 保存默认分支额外字段与发布 size==2 校验的差别是相邻边界线索，需另选范围后单独验证，不在本报告直接扩大 H010。 |
| DEC-0009-01/05 | 草稿可不完整；可执行基础数据格式/引用/出口检查；发布版本只读、发布完整性严格。 | 未配置 conditionRule:null 与保留旧 conditionRule 顶层字段不是同一情形。 |
| open-questions 的 source-snapshot/evaluation/branch-model 三项 | 完整来源、异常、运行结果/审计契约继续未决。 | 不应借配置写入修复宣告条件引擎已闭环、升级成熟度或制定运行政策。 |

`evidence.production-work-condition-branch-model`（`docs/knowledge/evidence/transaction-runtime.yaml:73`）明确声明自己是 user-confirmed 知识投影，路径回指 DEC-0011，并非逐字对话、冠骋原始页面或当前运行证据。DEC-0010 的证据主要指当前源码和测试。本次未找到另外保存的原始用户逐字聊天/录屏；保留这一来源限制，不能把现行决策投影说成新一次用户确认。现有条款之间未发现必须再问用户的冲突。

## 当前 UI → API → 持久化/快照映射

| 位置（基线行号） | 核对内容 |
|---|---|
| `WorkTemplateEditor.tsx:366 persistentFlowGraph` | 仅剥除 selected/dragging，保留 node.data/config，未过滤 completionCondition。 |
| `:412 conditionBranchesForConfig` / `:429 normalizedConditionConfig` | 生成当前分支形状；当前默认分支和空 AST 草稿合法。 |
| `:655 normalizeFlowGraph` | CONDITION 若含 conditionRule/conditionFieldCatalogVersion/conditionFieldSnapshot/conditionExpression 或 branch.rule 会被过滤；FORM config 在 :705 浅拷贝，保留任意原键。无 completionCondition 特定语义消费者。 |
| `:1697 / :2519` | 初始载入/版本切换均使用 normalizeFlowGraph。 |
| `:2440 / :2786`（以及新增节点相关路径） | 新 FORM 为 config:{}，新 CONDITION 使用 normalizedConditionConfig({})；未找到正常 UI 设置 completionCondition 或旧条件顶层四键的入口。 |
| `:2634 graph` | 返回当前 nodes/edges；完整 config 随图提供给保存流程。 |
| `:4509 saveGraph / :4721 saveDraft` | 已有草稿点击保存，经 persistentFlowGraph 后 PUT 图。 |
| `:4573 saveTransientDraft` | 首次临时草稿先 POST 创建草稿，再 PUT 图。不是单事务；本报告不改版本创建生命周期。 |
| `:4552 publish / :4606 publishTransientDraft / :4750 confirm` | UI 先运行发布校验，再 PUT 当前图再 POST publish；发布按钮不能替代独立 API 写门禁。 |
| `frontend/src/api/workflow-work.ts:43/52/57` | 保存 PUT `/workflow/work-templates/{id}/versions/{versionId}/graph`；发布 POST `.../publish`；复制 POST `.../copy-to-draft`。 |
| `WorkTemplateController.java:181 saveGraph` | 事务、锁定 WORK、仅 DRAFT；:194 valueToTree nodes，FORM 只校验配置形状/已提供 fillMode；:204 序列化全部节点；:205/207 基础图边界/出边；:208 写 nodesJson；:213 仓储保存；:214 引用投影；:215 UPDATE 审计。未检查 FORM completionCondition、CONDITION 顶层旧字段。 |
| `:446 validateOrdinaryNodeOutgoingEdges / :507 conditionHandlesForNode` | 动态分支、默认出口、每出口最多一线、无固定出口；分支 rule 已被拒绝；顶层旧四键未查。基础草稿格式和发布完整性是分层的。 |
| `:238 publishVersion` | :242 边界、:243 出口、:244 条件完整性、:245 表单引用、:246 填报完整性、:247 连通性；都在状态切换/保存/审计之前。 |
| `:549 validatePublishableConditionRules / :618 hasLegacyConditionConfiguration` | 发布拒绝顶层旧四键，逐分支验证 AST/目录/字段快照，拒 branch.rule；默认分支 :605 要求恰好两个键。 |
| `WorkflowDefinitionVersion.java:21/24` | nodesJson / edgesJson 作为 jsonb 存储；实体不提供字段白名单。 |
| `FormProcessReferenceService.java:27 rebuildForWorkVersion` | 读取完整 nodesJson、仅提取 FORM 引用投影；不净化原图、不解释这两类旧条件字段。 |
| `ExecutionSnapshotBuilder.java:114-132` | 选择当前 PUBLISHED WORK 版本，将整个 nodes_json/edges_json 解析进入 work.nodes/work.edges 快照；FORM 配置用于填报快照。没有 completionCondition 的业务读取语义，但原始 work 图能够携带它。 |
| `ProductionExecutionEngine.java:752 advanceWork / :776 conditionOutlet` | 运行冻结 work.nodes，CONDITION 只消费 config.conditionBranches[].conditionRule 和唯一默认出口；本报告不改变运行求值或旧快照。 |

## 旧源复制/新建继承路径不能漏报

- `createDraftVersion:221-232` 调 `newDraft:402`，直接继承 previous.nodesJson/edgesJson；新流程无 previous 时才用 INITIAL_FLOW_NODES。
- `copyPublishedVersionToDraft:272-315` 两路径：已有草稿直接 `draft.setNodesJson(source.getNodesJson())`（292）；无草稿则 newDraft(source)（310）；都不经过 saveGraph 校验。
- 正常 publish 成功后 `:264 newDraft(saved)` 也直接继承，但其 source 应已通过全部发布检查。
- 因此若后续修 H009，**只加 saveGraph guard 不能承诺所有新写命令均不会重写已存在旧源字段**。复制/继承具有“既存不支持来源”的前提；本次没有数据库实测或证据证明当前真实库中有该源。可选择对新写命令做同一个纯结构 guard，并在命令失败时保留原源不变；不建议读取旧值赋予语义、移除键后保存或批量迁移。
- 若仅交付“当前图更新 API 拒绝旧字段”，应明确暂不覆盖复制/继承，不将 discrepancy 全面关闭。本轮 H004 可独立推进，这些路径不会要求扩大权限切换修复。

## 最小反例设计（尚未运行）

### H009：当前 API 的具体不支持保留字

前置：真实 WORK 模板101，有可编辑 DRAFT201。以 START、FORM、END 三节点、edges:[] 作为符合 DEC-0009 的不完整草稿；FORM config 显式 fillMode:DIRECT（隔离已解决 H003），可同时选择 formTemplateVersionId:702。仅增加已明确取消的 `completionCondition:null` 或 `completionCondition:"任意旧值"`。

调用当前受支持的 PUT 图接口。源码预测：200，原键进入 nodesJson、引用重建和 UPDATE 审计；预期修后：WF_002 类型拒绝，原草稿 nodesJson/edgesJson、不变，仓储保存/投影重建/审计均不发生。仅因 presence 已明确禁止，null 也不应被当作兼容空值悄悄保存。具体 error 文案属工程选择。

对照：完全移除 completionCondition 后相同不完整草稿可保存；不得把 formTemplateVersionId 必填、连通性或全权限完整性前移到此反例。若做 UI 透传回归，应明确 fixture 是旧/外部带入源，证明载入后一次合法编辑/保存的透传，不能声称正常新建 UI 生成该字段。

### H010：canonical + 一个旧顶层字段，隔离形状和完成度

前置：真实 WORK DRAFT，START→CONDITION→END。CONDITION 为一个 current `conditionBranches:[{id:"condition-1",name:"条件 1",conditionRule:null}]`，`conditionDefaultBranch:{id:"condition-default",name:"否则"}`；进入线使用 condition-input，出线分别 condition-1/condition-default。仅添加一个 `config.conditionRule:null`，其余三个旧键逐个同测。

调用 PUT 图：源码预测可保存；随后 POST publish：源码预测在 :557 拒绝“不支持的旧配置字段”，而非因 null 分支 AST 拒绝。修复目标是 PUT 同样先拒保留旧键、无写入/投影/审计。**对照**移除旧顶层键，空分支 AST 草稿仍应保存，而发布依然以“尚未配置结构化条件规则”拒绝。这样能证明规则格式与草稿完整性没有混为一谈。

另加完整合法 AST/目录快照及全出口同测，证明即便旧值是对象、字符串或 null，旧字段存在时不能由 canonical 正常值“覆盖”而通过。不要把枝干未知任意键列为全新业务禁止项。

## 建议最小 guard 与必要回归

1. 在后端保存图遍历的 :194-203，或可被其他新写命令复用的局部纯结构检查里，按 node.kind 拒绝明确不支持的保留字段。复用已有 hasLegacyConditionConfiguration 检查顶层四键，不执行 AST 求值/目录校验。FORM 仅禁止 completionCondition 的键存在，不解读值。
2. 若本切片承诺所有新写入，将同一 guard 放到 copy/createDraftVersion/newDraft 的写命令入口，在 setter/仓储保存前检查；禁止通过剥除旧字段、自动兼容归一化或重写历史记录绕过。
3. 发布检查可复用同一形状 guard，保持现有分支精确诊断。前端可提示保存错误，但后端 guard 是实际持久化边界；不需要设计新的历史数据兼容 UI。
4. controller 聚焦测试：四旧键各存在/null/有值、completionCondition presence、拒绝后 nodes/edges 原值、save/rebuild/audit 均无调用；合法 incomplete draft 正向；完整 canonical 保存发布与原有错误诊断回归。原字节持久化与事务回滚如需证明，必须用真实集成测试，Mockito 源码映射不能替代。
5. 若加前端反例，用实际 normalizeFlowGraph/persistentFlowGraph 和已知外部/旧源 fixture；不以 DOM 截图或自造成功响应替代后端写入拒绝验证。

## 已有测试夹具与尚缺覆盖

- `savesDraftGraphAndRecordsTheUpdatedSnapshot:1044`：图写回与 UPDATE 审计。
- `savesAnIncompleteDraftWithoutPublishValidation:1071`：FORM 无引用、无连线可草稿保存；必须保留。
- `allowsConditionNodeToHaveMultipleConfiguredBranchEdges:1195`：两个未配置 AST 的 canonical 分支可保存；这是草稿边界重要正向。
- `keepsAnUnconfiguredConditionNodeInDraftButRejectsPublishingIt:686`：实际上只调用 publish，证明空 AST 发布拒绝，不证明 PUT 保存行为。
- `publishesOrderedDynamicConditionBranchesAndTheirDefaultBranch:600`：完整合法 canonical 分支发布。
- `rejectsMalformedConditionBranchesInsteadOfFallingBackToLegacyRule:643`：旧例同时有畸形 branches 和固定 condition-true 出口，实际断言是“流程连线数据格式不正确”，不能证明 canonical+旧字段保存或发布特定 guard。
- `rejectsLegacyFreeTextConditionAsTheOnlyPublishFact:787`：仅发布旧表达式反例；未覆盖保存不对称。
- `copiesPublishedHistoryOverTheCurrentDraft:958` 与 `createsTheNextDraftWhenCopyingPublishedFlowWithoutAnEditableDraft:983`：只证明旧字符串被复制；夹具甚至不是完整有效流程，勿用它们代替新写命令的真实保留字段覆盖。
- 未在当前 WorkTemplateControllerTest 找到 completionCondition 专项或 canonical+单旧字段的 PUT 拒绝测试。没有运行现有测试，所以本报告不统计 pass/fail。

## 大模块拆分方向（仅具体后续方案，本轮不做）

`WorkTemplateController` 当前混合版本写编排、格式/图约束、发布语义和表单绑定。可先把无仓储副作用的图基础/保留字段检查提取为 `WorkFlowGraphValidator`，由 save/publish/copy/create 的写编排明确调用同一层；发布完整性仍独立方法，控制器保留锁、仓储、投影和审计事务。先用同载荷 save/publish 对照固定边界，再按纯提取增量提交，避免在 H004 或两保留字段修复里整体改造。
