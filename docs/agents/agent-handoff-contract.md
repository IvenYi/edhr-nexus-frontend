# eDHR 智能体统一交接契约

本契约定义主智能体向专业智能体提供的业务决策包，以及专业智能体返回本体结果和质量结果时使用的统一 YAML 格式。字段名统一使用 camelCase。

下列内容是格式示例。示例 ID、版本、提交哈希和数组内容不代表真实项目结论；每次实际任务均由主智能体根据已确认的业务讨论自动生成，用户不填写决策包、结果表或知识文件。所有未发生的列表字段也必须保留并使用空列表 `[]`，不得省略。

## 契约基线

`decisionPackage`、`ontologyResult` 和 `qualityResult` 共用 `contractBaseline`，记录各自实际读取和核对的版本：

- `sourceCommit`：本次功能分支或工作树的 HEAD，使用完整 Git 提交哈希。
- `targetBranch`、`targetCommit`：拟集成分支及最近一次获取并核对的完整提交哈希；无跨分支集成时可与来源基线相同。
- `contractReadCommit`：实际读取项目、角色和交接契约时采用的完整提交哈希，不能因为执行了 fetch 就填写为最新值。
- `uncommittedContractPaths`：在上述契约提交之外，实际读取的未提交契约修改路径；没有则使用 `[]`。不得为工作树编造提交哈希，结果证据应能定位对应差异。

知识版本相同不证明两分支契约、决策或内容相同。开始、恢复和集成时先核对目标契约增量，再在安全检查点重新加载适用契约，并在原交接中更新基线和受影响范围。角色发现基线变化时增量重放已确认结论，只有真实且无法消解的业务冲突才阻断依赖范围。

本交接格式由主智能体和专业角色核对；`docs/knowledge/schema.yaml` 及知识 CI 不自动验证这些工作流字段、自然语言替代范围或智能体是否重读了契约。声明机器门禁时必须给出实际校验入口和证据。

## `decisionPackage`

主智能体在派发本体建模任务前生成 `decisionPackage`。`confirmed` 只包含用户已确认或现有权威资产已明确规定的结论；合理推断放入 `inferred`；仍需业务判断的内容放入 `unresolved`。

```yaml
decisionPackage:
  id: DEC-PACKAGE-20260808-001
  scope: product-process
  knowledgeBaselineVersion: 0.3.0
  contractBaseline:
    sourceCommit: "1111111111111111111111111111111111111111"
    targetBranch: edhr-dev
    targetCommit: "0000000000000000000000000000000000000000"
    contractReadCommit: "0000000000000000000000000000000000000000"
    uncommittedContractPaths: []
  summary: 为产品制程版本补充已确认的业务关系
  confirmed:
    concepts:
      - id: concept.product-process-version
        name: 产品制程版本
        definition: 产品下可被生产任务显式选择的具体制程配置
        status: implemented
        sourceReferences:
          - docs/architecture/business-knowledge-model.md
    relationships:
      - id: relation.product-has-process-versions
        sourceId: concept.product
        targetId: concept.product-process-version
        cardinality: one-to-many
        description: 一个产品可以拥有多个并行制程版本
        sourceReferences:
          - docs/architecture/business-knowledge-model.md
    rules:
      - id: rule.process-version-explicit-selection
        name: 显式选择产品制程版本
        status: implemented
        trigger: production-order.configure
        condition:
          all:
            - fact: product.availableProcessVersionCount
              operator: greater-than-or-equal
              value: 1
        result:
          type: persist-reference
          target: productionOrder.productProcessVersionId
          valueFrom: selectedProductProcessVersion.id
        sourceReferences:
          - docs/architecture/business-knowledge-model.md
    executionContracts:
      - id: execution.process-version-selection
        ruleId: rule.process-version-explicit-selection
        action: 保存并读取生产任务选择的产品制程版本
        implementationReferences:
          - gmp-platform/backend/src/main
        evidenceIds:
          - evidence.process-version-selection
  inferred:
    - id: inference.process-version-api-impact
      statement: 该规则可能影响生产任务配置接口
      rationale: 规则结果需要持久化制程版本引用
      relatedIds:
        - rule.process-version-explicit-selection
  unresolved: []
  replacementScopes: []
  impactAnalysis:
    level: L1
    directImpacts:
      - area: product-process
        change: 生产任务配置需要保存显式选择的产品制程版本
        evidenceReferences:
          - docs/knowledge/rules/product-process.yaml
    transitiveImpacts: []
    potentialImpacts:
      - area: production-order
        concern: 生产任务接口可能需要增加制程版本引用
        evidenceReferences: []
    unaffectedAreas: []
    compatibilityAndMigration: []
    snapshotImpacts: []
    auditImpacts: []
    permissionImpacts: []
    testImpacts:
      - scope: production-order
        scenarios: [保存选择、重新读取、历史快照]
        evidenceReferences: []
    evidenceGaps:
      - 生产任务模块尚未实现，后续开发时核对持久化和快照契约
  extensionStrategy:
    selectedPaths: [product-core]
    rationale: 显式保存制程版本属于可复用的标准生产能力，不应作为客户项目条件分支实现
    ownershipBoundaries:
      - owner: production-order
        responsibility: 保存生产任务选择的制程版本并形成后续执行引用
  affectedFiles:
    - path: docs/knowledge/rules/product-process.yaml
      changeType: update
      reason: 记录已确认的制程版本选择规则
  acceptanceScenarios:
    - id: scenario.explicit-process-version-selection
      given: 产品存在两个可用制程版本
      when: 用户创建生产任务并选择其中一个版本
      then: 生产任务保存且后续读取同一版本标识
      evidenceRequirements:
        - 集成测试结果
        - 持久化数据记录
```

顶层字段：

- `id`：本次决策包的唯一标识，不复用历史标识。
- `scope`：本次交付的业务边界。
- `knowledgeBaselineVersion`：生成决策包时读取的知识基线版本。
- `contractBaseline`：来源、目标和实际读取契约的 Git 基线，格式见“契约基线”。
- `summary`：已确认变更的简要说明。
- `confirmed`：可以进入权威知识模型的概念、关系、规则和执行契约。
- `inferred`：便于分析的候选推断，不得直接写成正式规则。
- `unresolved`：必须由用户确认的问题，不得由智能体自行补全。
- `replacementScopes`：本次需要落实的已确认声明级替代；没有则为空。记录错误按已有证据纠正，不为纠错伪造新政策。
- `impactAnalysis`：按 L1 或 L2 深度记录直接、传递、潜在、不受影响、兼容迁移和证据缺口；它是当前证据下的影响判断，不代表自动完整依赖图。
- `extensionStrategy`：记录配置、事务编排、标准动作、项目插件或产品内核等选定路径、依据和所有权边界。
- `affectedFiles`：预计受影响的知识、代码、数据库、接口、界面和测试文件。
- `acceptanceScenarios`：可独立验证的业务验收场景。

列表项字段：

- `concepts[]`：`id`、`name`、`definition`、`status`、`sourceReferences`。
- `relationships[]`：`id`、`sourceId`、`targetId`、`cardinality`、`description`、`sourceReferences`。
- `rules[]`：`id`、`name`、`status`、`trigger`、`condition`、`result`、`sourceReferences`；`condition` 和 `result` 必须是结构化对象，不得使用自然语言字符串替代整个对象。
- `executionContracts[]`：`id`、`ruleId`、`action`、`implementationReferences`、`evidenceIds`。
- `inferred[]`：`id`、`statement`、`rationale`、`relatedIds`。
- `unresolved[]`：`id`、`question`、`context`、`options`、`impact`。
- `replacementScopes[]`：`decisionStatementId`、`supersededStatementIds`、`scope`、`retainedScope`、`sourceReferences`；分别定位已确认的新声明、被替代的旧声明、精确适用范围、仍保留的旧范围和确认来源。决策级 `supersedes` 不表示整份旧决策全部失效。
- `impactAnalysis.level`：只能是 `L1` 或 `L2`；L0 不生成正式决策包影响分析。
- `impactAnalysis.directImpacts[]`：已确认直接受影响的领域、行为和证据。
- `impactAnalysis.transitiveImpacts[]`：通过关系、事件、调用、快照或下游读取产生的传递影响。
- `impactAnalysis.potentialImpacts[]`：证据不足但可能受影响的范围，不得伪装成已确认事实。
- `impactAnalysis.unaffectedAreas[]`：经核对可以排除且对方案边界有价值的相邻范围。
- `impactAnalysis.compatibilityAndMigration[]`：历史数据、存量实例、版本快照、迁移和回滚影响。
- `impactAnalysis.snapshotImpacts[]`：生产对象、规则、事务和配置快照影响。
- `impactAnalysis.auditImpacts[]`：审计事件、字段、追溯和证据链影响。
- `impactAnalysis.permissionImpacts[]`：角色、权限、签名和数据访问影响。
- `impactAnalysis.testImpacts[]`：需要新增或回归的单元、集成、API、E2E、视觉、迁移和审计场景。
- `impactAnalysis.evidenceGaps[]`：仍缺少的实现证据及后续查证条件。
- `extensionStrategy.selectedPaths[]`：只能使用 `configuration`、`transaction-orchestration`、`standard-action`、`project-plugin`、`product-core`。
- `extensionStrategy.rationale`：选择当前扩展路径的业务和工程依据。
- `extensionStrategy.ownershipBoundaries[]`：代码、配置、规则或插件的明确所有者和责任边界。
- `affectedFiles[]`：`path`、`changeType`、`reason`；`changeType` 只能是 `create`、`update`、`delete` 或 `read-only`。
- `acceptanceScenarios[]`：`id`、`given`、`when`、`then`、`evidenceRequirements`。

### 本体升级阶段字段

涉及知识模型基础设施、本体能力或影响分析机制的 `decisionPackage` 必须额外包含：

```yaml
ontologyRoadmap:
  currentStage: P0
  targetOutcome: 让规则事实和实现证据可解析、可追溯并支持可复核影响分析
  entryCriteria:
    - 当前阶段开始依据
  exitCriteria:
    - 当前阶段完成条件
  explicitNonGoals:
    - 本阶段不引入 OWL/RDF 推理器
  nextStage: P1
```

阶段含义固定如下：

- `P0`：事实目录、实现锚点、最小 provenance、正式校验和一个稳定领域试点。
- `P1`：关系 domain/range、反向关系、查询投影、结构化影响路径和冲突检查。
- `P2`：知识发布 manifest、时间版本、历史解释和审计回放。
- `P3`：JSON-LD/RDF/OWL/SHACL 映射、标准互操作和受控推理。

P1 的整体实现收敛以 P0 退出证据为前提；P2 由真实的历史解释、审计回放或跨版本运行需求触发；P3 由真实的外部互操作或推理需求触发。有明确用途的稳定 ID 映射、JSON-LD/SHACL 小范围试点或其他后续准备可以在 P0/P1 提前实施，交接中须写明依赖、验证、所有权、回滚方式和剩余缺口，不能据此升级整个阶段状态。

可执行的通用业务规则层可作为独立交付切片并行推进；生产使用前必须闭环确定性的类型/操作符/异常与执行契约，以及不可变规则、配置、目录版本和必要事实依据。最小版本保障按生产需求从 P2 提前落实；RDF/OWL 映射完成不等于运行引擎完成。阶段目标不要求同一功能切片完成所有阶段。

示例中的 `inferred` 不表示可以写入权威模型。主示例的 `unresolved` 为空，因此可以在没有其他冲突时对应后文的 `ontologyResult.result: updated`。

### 由主智能体维护的试点引导

主智能体在相关开发任务中主动判断试点适用性。无需试点时，在任务说明中简述理由即可，不要求普通功能额外生成计划或表格。发现有具体价值的候选时，在同一 `ontologyRoadmap` 中增加 `pilotPlan`；由智能体维护，用户不手工填写：

```yaml
pilotPlan:
  kind: standards-validation
  status: candidate
  businessScope: 一个已明确业务边界的标准映射或约束校验切片
  relatedKnowledgeIds: []
  dependencies: []
  steps:
    - id: pilot-step-1
      action: 核实该切片当前定义、实例样本和预期约束
      exitEvidence: 能定位到已确认语义及正反例；缺口逐项列明
      status: planned
      evidence: []
  rollback: 试点输出作为派生资产，可撤回而不改写权威业务事实
  nextAction: 读取相关当前定义和原始样本，说明哪些约束已有依据
```

- `kind`：`semantic-foundation | relationship-query | historical-explanation | standards-validation | rule-execution`。分别对应语义基础、关系查询、历史解释、标准映射/约束验证和通用规则执行，不得混用其通过结论。
- `status`：`candidate | active | deferred | completed | blocked`；`candidate` 表示方案候选，不自动新增一项用户审批。
- `businessScope`、`relatedKnowledgeIds`：本次功能边界和实际受影响的知识；具体价值写入现有 `targetOutcome`，验收写入 `exitCriteria` / `acceptanceScenarios`，不另造重复报告。
- `dependencies`：必要前置项及当前缺口；不得以试点输出绕过依赖。
- `steps[]`：`id`、`action`、`exitEvidence`、`status`、`evidence`；步骤状态为 `planned | in-progress | completed | deferred | blocked`，`evidence` 只填写实际获得的命令结果、来源或产物。
- `rollback`、`nextAction`：撤回方式及当前可以继续执行的具体工作。

在现有授权范围内，主智能体给出计划后连续推进并更新证据；仅对真正业务歧义、产品取舍或新增重大范围询问用户，不能把“逐步引导”变成每一步重复批准。复用同一功能切片及同一个计划，基线变化时增量更新。收尾以 `ontologyResult.knowledgeSync` 和 `qualityResult.checks` 承接对应知识与验证结果，不为试点新增长期角色。

标准试点的最小验收是映射含义明确、正反例及差异可解释；规则执行试点还须验证事实读取、确定性求值、动作/权限/事务边界及不可变执行依据，按实际风险执行相应门禁。任一局部试点完成均不自动表示 P0/P1/P2/P3 整阶段完成。

### 存量知识全量审计范围与进度

全量审计任务沿用 `decisionPackage` 和 `contractBaseline`，在 `scope` 中明确分支、提交、资产范围及历史处理原则。使用单独清单固定覆盖分母，并与 schema 的顶层、嵌套记录映射核对；术语、概念、关系、事实、规则、执行契约、决策声明、验收场景、实现差异、证据、实现锚点和开放问题均须可追踪。Markdown 证据和说明按文件单独登记，不因没有 ID 而忽略。并行分支及其合并候选使用独立基线；不能用一个分支的清单证明另一个分支已审计。

每个审计记录至少保留：`id`、`recordType`、`sourcePath`、`sourceLocator`、原资产成熟度、审计范围分类、语义核对状态、结论及原始证据引用。清单生成时必须为待审状态，不得从 `implemented`、`reviewed`、文件存在或 schema 通过自动生成“一致”。每条完成的语义核对还应说明核对了哪些当前决策、对应实现和相邻关系；运行验证范围单独记录。

审计结论：

| 值 | 含义 |
|---|---|
| `pending` | 已进入清单，尚未完成逐条语义核对 |
| `consistent` | 在明确范围内，当前定义、已确认决策及实际核对的证据一致 |
| `needs-fix` | 已确认记录错误或实现差异；列出具体问题和修复依据 |
| `superseded` | 明确为历史或已被替代；保留原文与来源，并定位当前适用定义 |
| `needs-decision` | 真实业务含义仍需用户决定，不由 AI 推测补齐 |
| `evidence-gap` | 定义可理解，但所需实现、测试或来源证据不足 |

语义核对使用 `pending | reviewed`；`reviewed` 不等于 `consistent`。整改使用独立的问题状态及修复提交/证据，不能用“已发现问题”代替“已修复”。汇总分别列出全量盘点数、已语义核对数、待审数、各结论数量、待修数量及实际运行验证范围；当前有效、历史和支撑资产分别统计。未完成或证据不足不得计入一致通过，不能对覆盖率不明的工作声称“全盘已对齐”。

这是一项明确授权的专项范围，不取代普通功能按改动增量维护的规则。审计可分域分批交付，但全部清单未核对前只能说明相应批次完成。更新基线后保留已获得的有效证据，对变更及关联影响重新核对，不覆盖或伪造旧结果。审计清单属于研发交付记录，不自动获得业务规则的 `verified` 或运行资格；当前知识 CI 不自动验证这些审计记录的全部语义。

### 影响分析深度与效率约束

- L1 只要求精简摘要：直接影响、主要相邻风险、证据缺口、测试影响和扩展路径。其余列表无实际内容时使用 `[]`，不得为了填满结构扩大分析范围。
- L2 才要求完整覆盖直接、传递、潜在、不受影响、兼容迁移、快照、审计、权限和测试影响。
- 同一功能切片连续调试时更新同一个 `decisionPackage`，不得为每次微调重新生成一份。
- 影响分析不得成为无依赖编码的前置等待项；主智能体先完成足以决定边界和风险的最小分析，后续随实现证据增量收敛。
- `affectedFiles` 是准备修改或核对的具体文件，`impactAnalysis` 是业务与系统影响判断，两者不能相互替代。

### 独立阻断示例

以下示例独立于主示例，展示未决问题影响本次交付时的结果。默认选择规则属于依赖范围，不能写入权威模型，`ontologyResult.result` 必须为 `blocked-by-question`。无依赖的已确认知识仍可同步，但不得因此宣称包含该未决范围的整个任务完成。

```yaml
blockingExample:
  unresolved:
    - id: question.process-version-default
      question: 存在多个制程版本时是否允许默认选择
      context: 默认选择会影响生产任务配置行为
      options:
        - 必须由用户显式选择
        - 允许按已批准规则默认选择
      impact: 未确认前不得建立默认选择规则
  requiredOntologyResult:
    result: blocked-by-question
```

## `ontologyResult`

业务知识本体建模智能体必须返回以下结构，`ontologyResult.result` 只能是 `updated`、`not-applicable`、`blocked-by-question` 或 `conflict`。

```yaml
ontologyResult:
  result: updated
  baselineBefore: 0.3.0
  baselineAfter: 0.3.1
  contractBaseline:
    sourceCommit: "1111111111111111111111111111111111111111"
    targetBranch: edhr-dev
    targetCommit: "0000000000000000000000000000000000000000"
    contractReadCommit: "0000000000000000000000000000000000000000"
    uncommittedContractPaths: []
  reason: 已确认关系已写入知识基线
  changedArtifacts:
    - path: docs/knowledge/ontology.yaml
      changeType: update
      ids:
        - relation.product-has-process-versions
  knowledgeSync:
    - id: relation.product-has-process-versions
      disposition: updated
      scope: 当前关系明确产品可拥有多个并行制程版本
      sourceReferences:
        - docs/architecture/business-knowledge-model.md
  conflicts: []
  questions: []
  validationEvidence:
    - id: validation.yaml-parse
      checkType: schema
      command: ruby scripts/validate-knowledge.rb
      outcome: passed
      evidence:
        - 命令退出码为 0
  roadmapProgress:
    stage: P0
    status: in-progress
    exitCriteriaEvidence: []
    deferredStages: [P1, P2, P3]
```

顶层字段：

- `baselineBefore`：角色开始工作时实际读取的知识基线版本。
- `baselineAfter`：工作完成后的版本；未更新时与 `baselineBefore` 相同。
- `contractBaseline`：本角色实际使用的契约和提交基线；不能直接复制未经核对的决策包值。
- `reason`：返回该结果的具体依据；`not-applicable` 时必须说明为什么不影响业务语义。
- `changedArtifacts`：本次实际修改的知识资产；未修改时为空。
- `knowledgeSync`：按受影响 ID 记录当前定义的同步处置及依据；不影响知识时为空，已确认局部替代须对应 `replacementScopes`。
- `conflicts`：无法消解的语义或适用范围冲突；记录证据和依赖范围。已明确确认的替代按其范围落实，不需要再次批准。
- `questions`：需要用户判断的问题，必须可直接回答。
- `validationEvidence`：结构校验、引用校验、状态投影校验及实现核对证据。
- `roadmapProgress`：本次本体任务对应的阶段进度；包含 `stage`、`status`、`exitCriteriaEvidence` 和暂缓阶段。没有退出证据时不得把阶段标记为 `verified`。

列表项字段：

- `changedArtifacts[]`：`path`、`changeType`、`ids`。
- `knowledgeSync[]`：`id`、`disposition`、`scope`、`sourceReferences`；`disposition` 只能是 `updated | retained | historical | deferred`。`scope` 说明更新或保留的具体含义、局部替代边界；暂缓时说明原因、依赖与交付影响，ID 重分配时保留旧到新映射。无差异且无影响的 ID 不必逐条罗列。
- `conflicts[]`：`id`、`incomingStatement`、`existingStatement`、`evidence`、`requiredResolution`。
- `questions[]`：`id`、`question`、`context`、`options`、`impact`；字段含义与 `unresolved[]` 一致。
- `validationEvidence[]`：`id`、`checkType`、`command`、`outcome`、`evidence`。

`validationEvidence` 枚举与结果约束：

- `validationEvidence[].checkType` 只能是 `schema | reference | status-transition | projection | evidence-path`。
- `validationEvidence[].outcome` 只能是 `passed | failed | blocked`。
- `roadmapProgress.stage` 只能是 `P0 | P1 | P2 | P3`。
- `roadmapProgress.status` 只能是 `planned | in-progress | verified | blocked`。
- 当 `ontologyResult.result` 为 `updated` 时，`validationEvidence` 必须非空，且每个 `validationEvidence[].outcome` 都必须为 `passed`。
- 当 `roadmapProgress.status` 为 `verified` 时，`exitCriteriaEvidence` 必须非空，并且必须逐项对应当前阶段的退出条件；没有这些证据时只能使用 `in-progress` 或 `blocked`。

`conflicts` 和 `questions` 的非空项格式如下：

```yaml
conflicts:
  - id: conflict.process-version-cardinality
    incomingStatement: 产品只能拥有一个制程版本
    existingStatement: 产品可以拥有多个并行制程版本
    evidence:
      - docs/architecture/business-knowledge-model.md
    requiredResolution: 由用户确认适用关系并决定是否替代历史决策
questions:
  - id: question.process-version-default
    question: 存在多个制程版本时是否允许默认选择
    context: 默认选择会影响生产任务配置行为
    options:
      - 必须由用户显式选择
      - 允许按已批准规则默认选择
    impact: 未确认前不得建立默认选择规则
```

结果语义：

- `updated`：知识资产已更新并通过适用校验。
- `not-applicable`：变更不影响业务语义，且 `reason` 已说明依据。
- `blocked-by-question`：存在必须由用户确认的业务问题。
- `conflict`：已确认输入与当前知识模型存在无法消解的语义或适用范围冲突，无法安全合并。

## `qualityResult`

质量验证智能体必须返回以下结构，`qualityResult.result` 只能是 `passed`、`failed` 或 `blocked`。`baseCommit` 和 `headCommit` 定义提交区间，`workingTreeState` 定义该区间之外是否还包含工作树变更。

```yaml
qualityResult:
  result: passed
  baseCommit: "0000000000000000000000000000000000000000"
  headCommit: "1111111111111111111111111111111111111111"
  contractBaseline:
    sourceCommit: "1111111111111111111111111111111111111111"
    targetBranch: edhr-dev
    targetCommit: "0000000000000000000000000000000000000000"
    contractReadCommit: "0000000000000000000000000000000000000000"
    uncommittedContractPaths: []
  workingTreeState:
    status: clean
    includedPaths: []
    excludedPaths: []
    untrackedPaths: []
  knowledgeBaselineVersion: 0.3.1
  checks:
    - id: check.contract-keywords
      required: true
      category: documentation
      description: 检查强制状态和质量独立性规则
      method: command
      command: rg -n "blocked-by-question|passed" AGENTS.md docs/agents
      outcome: passed
      evidence:
        - 命令退出码为 0
  findings: []
  residualRisks: []
  blockingConditions: []
```

顶层字段：

- `baseCommit`：审查范围起点提交，使用完整 Git 哈希，不包含该提交本身。
- `headCommit`：审查范围终点提交，使用完整 Git 哈希并包含该提交。
- `contractBaseline`：质量角色独立核对的来源、目标和实际读取契约提交；知识版本号相同不免除契约差异核对。
- `workingTreeState`：包含 `status`、`includedPaths`、`excludedPaths` 和 `untrackedPaths`；`status` 只能是 `clean` 或 `dirty`。若为 `dirty`，必须明确哪些工作树路径在审查范围内。
- `knowledgeBaselineVersion`：验证需求和业务规则时实际读取的知识基线版本。
- `checks`：执行过的审查、测试、迁移、浏览器或证据核对项及结果。
- `findings`：可复现问题列表。
- `residualRisks`：已验证范围之外仍需披露的风险。
- `blockingConditions`：环境、数据或依赖阻塞；无阻塞时为空。

合并验收必须在相关 `checks[].evidence` 中记录实际目标 base、功能 head 和被测试的合并候选提交；若候选含未提交内容，同时用 `workingTreeState` 与差异证据标明范围。检查合并后知识 ID、引用、类型和已确认替代的一致性；目标或功能提交更新后，重新评估影响并重跑适用检查。评估不受影响的人工结论可以说明依据后复用，旧提交的 CI 通过不能代替当前候选的必需检查。

列表项字段：

- `checks[]`：`id`、`required`、`category`、`description`、`method`、`command`、`outcome`、`evidence`。
- `findings[]`：`id`、`severity`、`scope`、`summary`、`reproductionSteps`、`expectedResult`、`actualResult`、`evidence`、`resolutionStatus`、`resolutionEvidence`。
- `resolutionEvidence[]`：`type`、`reference`。
- `residualRisks[]`：`id`、`description`、`impact`、`mitigation`。
- `blockingConditions[]`：`id`、`condition`、`impact`、`requiredAction`、`owner`。

`checks` 枚举与结果约束：

- `checks[].category` 只能是 `requirements | ontology | unit | integration | api | database | audit | security | e2e | visual | regression | documentation`。
- `checks[].method` 只能是 `command | inspection | browser | query | automated-test`。
- `checks[].outcome` 只能是 `passed | failed | blocked`。
- `checks[].required` 必须是 YAML 布尔值 `true | false`。

每个发现使用以下格式：

```yaml
findings:
  - id: QF-001
    severity: high
    scope: product-process
    summary: 保存后未持久化所选制程版本
    reproductionSteps:
      - 创建包含两个制程版本的产品
      - 创建生产任务并选择第二个制程版本
      - 保存后重新打开生产任务
    expectedResult: 页面和接口返回第二个制程版本
    actualResult: 页面和接口返回第一个制程版本
    evidence:
      - artifacts/QF-001-response.json
    resolutionStatus: resolved
    resolutionEvidence:
      - type: commit
        reference: "2222222222222222222222222222222222222222"
```

`finding.severity` 只能是：

- `critical`：造成患者安全、法规合规、数据完整性或核心生产流程不可接受风险，必须立即阻断交付。
- `high`：主要业务流程错误、重要数据或权限错误，没有可接受规避方式，必须在交付前修复。
- `medium`：局部行为或非核心流程不符合要求，存在可控规避方式，但仍需排期修复并明确交付影响。
- `low`：轻微一致性、可用性或维护性问题，不阻断当前交付，但必须记录处置决定。

`finding` 解决字段约束：

- `findings[].resolutionStatus` 只能是 `open | resolved`。
- `findings[].resolutionEvidence[].type` 只能是 `commit | command | screenshot | audit-record | document`。
- `findings[].resolutionEvidence[].reference` 必须是非空的提交哈希、命令输出定位、截图路径、审计记录标识或文档路径。
- `resolutionStatus` 为 `open` 时，`resolutionEvidence` 可以为空；为 `resolved` 时，必须提供足以定位修复和复核结果的证据。

阻塞条件使用以下格式：

```yaml
blockingConditions:
  - id: block.test-database-unavailable
    condition: 测试数据库不可用
    impact: 无法执行数据库迁移和持久化回归
    requiredAction: 恢复测试数据库并重新运行检查
    owner: environment-maintainer
```

## 质量结果不变量

- 当 `qualityResult.result` 为 `passed` 时：`checks` 必须非空；至少一个 `checks[].required` 为 `true`；所有 `required: true` 的 `checks[].outcome` 都必须为 `passed`；`blockingConditions` 必须为空；`findings` 中不得存在 `resolutionStatus: open` 的 `critical` 或 `high` 项；已标记为 `resolved` 的 `critical` 或 `high` 项必须有非空 `resolutionEvidence`，并由未参与修复的全新质量验证实例复核相关 `checks[].outcome` 为 `passed`。
- 当 `qualityResult.result` 为 `failed` 时，必须至少有一个 `checks[].outcome` 为 `failed`，或至少有一个 `findings[].resolutionStatus` 为 `open`。
- 当 `qualityResult.result` 为 `blocked` 时，`blockingConditions` 必须非空，且至少有一个 `checks[].outcome` 为 `blocked`。

结果语义：

- `passed`：所需证据完整，适用检查通过，且不存在影响交付的发现。
- `failed`：存在需要主智能体或独立实现子智能体修复的可复现问题。
- `blocked`：环境、数据或依赖不足，无法形成有效验证结论。
