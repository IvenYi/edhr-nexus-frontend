# eDHR 智能体统一交接契约

本契约定义主智能体向专业智能体提供的业务决策包，以及专业智能体返回本体结果和质量结果时使用的统一 YAML 格式。

下列内容是格式示例。示例 ID、版本、提交哈希和数组内容不代表真实项目结论；每次实际任务均由主智能体根据已确认的业务讨论自动生成，用户不填写决策包、结果表或知识文件。

## `decisionPackage`

主智能体在派发本体建模任务前生成 `decisionPackage`。`confirmed` 只包含用户已确认或现有权威资产已明确规定的结论；合理推断放入 `inferred`；仍需业务判断的内容放入 `unresolved`。

```yaml
decisionPackage:
  id: DEC-PACKAGE-20260808-001
  scope: product-process
  knowledgeBaselineVersion: 0.3.0
  summary: 为产品制程版本补充已确认的业务关系
  confirmed:
    concepts: []
    relationships: []
    rules: []
    executionContracts: []
  inferred: []
  unresolved: []
  affectedFiles: []
  acceptanceScenarios: []
```

字段约束：

- `id`：本次决策包的唯一标识，不复用历史标识。
- `scope`：本次交付的业务边界。
- `knowledgeBaselineVersion`：生成决策包时读取的知识基线版本。
- `summary`：已确认变更的简要说明。
- `confirmed`：可以进入权威知识模型的概念、关系、规则和执行契约。
- `inferred`：便于分析的候选推断，不得直接写成正式规则。
- `unresolved`：必须由用户确认的问题，不得由智能体自行补全。
- `affectedFiles`：预计受影响的知识、代码、数据库、接口、界面和测试文件。
- `acceptanceScenarios`：可独立验证的业务验收场景。

## `ontologyResult`

业务知识本体建模智能体必须返回以下结构，`result` 只能是 `updated`、`not-applicable`、`blocked-by-question` 或 `conflict`。

```yaml
ontologyResult:
  result: updated
  baselineBefore: 0.3.0
  baselineAfter: 0.3.1
  reason: 已确认关系已写入知识基线
  changedArtifacts: []
  conflicts: []
  questions: []
  validationEvidence: []
```

字段约束：

- `baselineBefore`：角色开始工作时实际读取的知识基线版本。
- `baselineAfter`：工作完成后的版本；未更新时与 `baselineBefore` 相同。
- `reason`：返回该结果的具体依据；`not-applicable` 时必须说明为什么不影响业务语义。
- `changedArtifacts`：本次实际修改的知识资产；未修改时为空。
- `conflicts`：与现有知识或已确认决策的冲突；仅记录，不得静默覆盖。
- `questions`：需要用户判断的问题，必须可直接回答。
- `validationEvidence`：结构校验、引用校验、状态投影校验及实现核对证据。

结果语义：

- `updated`：知识资产已更新并通过适用校验。
- `not-applicable`：变更不影响业务语义，且 `reason` 已说明依据。
- `blocked-by-question`：存在必须由用户确认的业务问题。
- `conflict`：已确认输入与当前知识模型冲突，无法安全合并。

## `qualityResult`

质量验证智能体必须返回以下结构，`result` 只能是 `passed`、`failed` 或 `blocked`。

```yaml
qualityResult:
  result: passed
  reviewedCommit: 0000000000000000000000000000000000000000
  knowledgeBaselineVersion: 0.3.1
  checks: []
  findings: []
  residualRisks: []
  blockingConditions: []
```

每个发现使用以下格式：

```yaml
findings:
  - id: QF-001
    severity: high
    scope: product-process
    summary: 示例问题标题
    reproductionSteps: []
    expectedResult: 示例期望结果
    actualResult: 示例实际结果
    evidence: []
```

字段约束：

- `reviewedCommit`：实际接受审查的提交哈希；未提交变更必须使用可明确定位的工作树说明，不能填写伪造哈希。
- `knowledgeBaselineVersion`：验证需求和业务规则时实际读取的知识基线版本。
- `checks`：执行过的审查、测试、迁移、浏览器或证据核对项及结果。
- `findings`：可复现问题列表；每项必须包含严重程度、复现步骤、期望结果、实际结果和证据。
- `residualRisks`：已验证范围之外仍需披露的风险。
- `blockingConditions`：环境、数据或依赖阻塞；无阻塞时为空。

结果语义：

- `passed`：所需证据完整，适用检查通过，且不存在影响交付的发现。
- `failed`：存在需要主智能体修复的可复现问题。
- `blocked`：环境、数据或依赖不足，无法形成有效验证结论。
