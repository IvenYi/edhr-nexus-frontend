# eDHR 智能体统一交接契约

本契约定义主智能体向专业智能体提供的业务决策包，以及专业智能体返回本体结果和质量结果时使用的统一 YAML 格式。字段名统一使用 camelCase。

下列内容是格式示例。示例 ID、版本、提交哈希和数组内容不代表真实项目结论；每次实际任务均由主智能体根据已确认的业务讨论自动生成，用户不填写决策包、结果表或知识文件。所有未发生的列表字段也必须保留并使用空列表 `[]`，不得省略。

## `decisionPackage`

主智能体在派发本体建模任务前生成 `decisionPackage`。`confirmed` 只包含用户已确认或现有权威资产已明确规定的结论；合理推断放入 `inferred`；仍需业务判断的内容放入 `unresolved`。

```yaml
decisionPackage:
  id: DEC-PACKAGE-20260808-001
  scope: product-process
  knowledgeBaselineVersion: 0.3.0
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
- `summary`：已确认变更的简要说明。
- `confirmed`：可以进入权威知识模型的概念、关系、规则和执行契约。
- `inferred`：便于分析的候选推断，不得直接写成正式规则。
- `unresolved`：必须由用户确认的问题，不得由智能体自行补全。
- `affectedFiles`：预计受影响的知识、代码、数据库、接口、界面和测试文件。
- `acceptanceScenarios`：可独立验证的业务验收场景。

列表项字段：

- `concepts[]`：`id`、`name`、`definition`、`status`、`sourceReferences`。
- `relationships[]`：`id`、`sourceId`、`targetId`、`cardinality`、`description`、`sourceReferences`。
- `rules[]`：`id`、`name`、`status`、`trigger`、`condition`、`result`、`sourceReferences`；`condition` 和 `result` 必须是结构化对象，不得使用自然语言字符串替代整个对象。
- `executionContracts[]`：`id`、`ruleId`、`action`、`implementationReferences`、`evidenceIds`。
- `inferred[]`：`id`、`statement`、`rationale`、`relatedIds`。
- `unresolved[]`：`id`、`question`、`context`、`options`、`impact`。
- `affectedFiles[]`：`path`、`changeType`、`reason`；`changeType` 只能是 `create`、`update`、`delete` 或 `read-only`。
- `acceptanceScenarios[]`：`id`、`given`、`when`、`then`、`evidenceRequirements`。

示例中的 `inferred` 不表示可以写入权威模型。主示例的 `unresolved` 为空，因此可以在没有其他冲突时对应后文的 `ontologyResult.result: updated`。

### 独立阻断示例

以下示例独立于主示例，仅展示 `unresolved` 非空时的强制结果。此时不得更新权威知识模型，`ontologyResult.result` 必须为 `blocked-by-question`。

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
  reason: 已确认关系已写入知识基线
  changedArtifacts:
    - path: docs/knowledge/ontology.yaml
      changeType: update
      ids:
        - relation.product-has-process-versions
  conflicts: []
  questions: []
  validationEvidence:
    - id: validation.yaml-parse
      checkType: schema
      command: ruby scripts/validate-knowledge.rb
      outcome: passed
      evidence:
        - 命令退出码为 0
```

顶层字段：

- `baselineBefore`：角色开始工作时实际读取的知识基线版本。
- `baselineAfter`：工作完成后的版本；未更新时与 `baselineBefore` 相同。
- `reason`：返回该结果的具体依据；`not-applicable` 时必须说明为什么不影响业务语义。
- `changedArtifacts`：本次实际修改的知识资产；未修改时为空。
- `conflicts`：与现有知识或已确认决策的冲突；仅记录，不得静默覆盖。
- `questions`：需要用户判断的问题，必须可直接回答。
- `validationEvidence`：结构校验、引用校验、状态投影校验及实现核对证据。

列表项字段：

- `changedArtifacts[]`：`path`、`changeType`、`ids`。
- `conflicts[]`：`id`、`incomingStatement`、`existingStatement`、`evidence`、`requiredResolution`。
- `questions[]`：`id`、`question`、`context`、`options`、`impact`；字段含义与 `unresolved[]` 一致。
- `validationEvidence[]`：`id`、`checkType`、`command`、`outcome`、`evidence`。

`validationEvidence` 枚举与结果约束：

- `validationEvidence[].checkType` 只能是 `schema | reference | status-transition | projection | evidence-path`。
- `validationEvidence[].outcome` 只能是 `passed | failed | blocked`。
- 当 `ontologyResult.result` 为 `updated` 时，`validationEvidence` 必须非空，且每个 `validationEvidence[].outcome` 都必须为 `passed`。

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
- `conflict`：已确认输入与当前知识模型冲突，无法安全合并。

## `qualityResult`

质量验证智能体必须返回以下结构，`qualityResult.result` 只能是 `passed`、`failed` 或 `blocked`。`baseCommit` 和 `headCommit` 定义提交区间，`workingTreeState` 定义该区间之外是否还包含工作树变更。

```yaml
qualityResult:
  result: passed
  baseCommit: "0000000000000000000000000000000000000000"
  headCommit: "1111111111111111111111111111111111111111"
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
- `workingTreeState`：包含 `status`、`includedPaths`、`excludedPaths` 和 `untrackedPaths`；`status` 只能是 `clean` 或 `dirty`。若为 `dirty`，必须明确哪些工作树路径在审查范围内。
- `knowledgeBaselineVersion`：验证需求和业务规则时实际读取的知识基线版本。
- `checks`：执行过的审查、测试、迁移、浏览器或证据核对项及结果。
- `findings`：可复现问题列表。
- `residualRisks`：已验证范围之外仍需披露的风险。
- `blockingConditions`：环境、数据或依赖阻塞；无阻塞时为空。

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
