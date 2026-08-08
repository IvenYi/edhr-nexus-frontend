# eDHR 长期智能体协作实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 建立主开发智能体、本体建模智能体和质量验证智能体的长期协作机制，并把当前产品制程配置知识迁移为可校验的结构化知识基线。

**架构：** 采用“固定角色契约 + 子智能体驱动执行”。角色连续性由仓库中的 `AGENTS.md`、角色契约和 Git 版本化知识资产保证；运行时由主智能体逐任务实例化和派发专业子智能体，并审核、集成结果。结构化知识使用 YAML 保存，后端 JUnit 测试通过 SnakeYAML 校验标识唯一性、引用完整性、状态投影和证据路径；业务代码仍由主智能体实现，专业子智能体分别承担知识沉淀和独立验证。

**技术栈：** Markdown、YAML、Java 21、Spring Boot 3.3、SnakeYAML、JUnit 5、Maven、Git、Codex multi-agent。

**实施状态：** 已于 2026-08-09 完成首次实施和独立质量验收。正式证据见 `docs/agents/persistent-agent-collaboration-acceptance.md`，验收提交为 `8481b6a9`，知识基线为 `0.3.0`。

---

## 文件职责

| 文件 | 职责 |
|---|---|
| `AGENTS.md` | 项目级智能体触发规则、交接顺序和完成门禁 |
| `docs/agents/agent-handoff-contract.md` | 决策包、本体结果和质量结果的统一格式 |
| `docs/agents/business-knowledge-modeler.md` | 本体建模固定角色契约 |
| `docs/agents/quality-verifier.md` | 质量验证固定角色契约 |
| `docs/knowledge/README.md` | 知识目录、状态和维护方式说明 |
| `docs/knowledge/glossary.yaml` | 领域术语及稳定标识 |
| `docs/knowledge/ontology.yaml` | 概念和关系注册表 |
| `docs/knowledge/rules/product-process.yaml` | 产品制程已确认及规划规则 |
| `docs/knowledge/decisions/DEC-0001-product-process-modeling.yaml` | 产品制程业务决策及背景 |
| `docs/knowledge/evidence/product-process.yaml` | 产品制程代码、数据库、界面和测试证据 |
| `docs/knowledge/open-questions.yaml` | 尚未确认且不得自行推断的问题 |
| `gmp-platform/backend/src/test/java/com/zencas/edhr/knowledge/BusinessKnowledgeModelTest.java` | 知识模型结构和语义完整性校验 |
| `docs/architecture/business-knowledge-model.md` | 面向人员阅读的知识模型总览 |
| `docs/architecture/technology-stack-and-ai-development.md` | AI 开发分工原则和新增专业角色规则 |

### 任务 1：建立项目级角色调度契约

**文件：**
- 创建：`AGENTS.md`
- 创建：`docs/agents/agent-handoff-contract.md`
- 创建：`docs/agents/business-knowledge-modeler.md`
- 创建：`docs/agents/quality-verifier.md`
- 重命名：`docs/superpowers/specs/2026-08-08-persistent-agent-collaboration-design.md` -> `docs/superpowers/specs/edhr-persistent-agent-collaboration-design.md`

- [x] **步骤 1：验证角色契约尚不存在**

运行：

```bash
test ! -f AGENTS.md
test ! -f docs/agents/business-knowledge-modeler.md
test ! -f docs/agents/quality-verifier.md
```

预期：命令成功，证明后续新增的是项目正式契约，而不是覆盖未知规则。

- [x] **步骤 2：创建根目录调度规则**

`AGENTS.md` 必须包含以下可执行规则：

```markdown
# eDHR 智能体协作规则

## 强制启动流程

修改业务概念、关系、生命周期状态、规则、流程、审计语义、执行契约或客户解释前，必须读取：

- `docs/architecture/business-knowledge-model.md`
- `docs/knowledge/README.md`
- `docs/knowledge/open-questions.yaml`
- `docs/knowledge/` 下与当前任务相关的文件

## 长期固定角色

- 主开发智能体：需求确认、业务实现、单元测试和集成测试。
- 业务知识本体建模智能体：本体、规则、决策、证据和执行契约。
- 质量验证智能体：独立审查以及 CRUD、E2E、视觉、审计、迁移和回归验证。

## 强制门禁

- 业务语义发生变化时，必须派发本体建模智能体，并取得 `updated`、
  `not-applicable`、`blocked-by-question` 或 `conflict`。
- 代码、数据库、接口、交互或客户可见行为发生变化时，必须派发质量验证智能体，
  并取得 `passed`、`failed` 或 `blocked`。
- 只有本体结果为 `updated` 或 `not-applicable`、质量结果为 `passed`，并且不存在
  影响当前交付范围的未决问题时，才可以宣告完成。

## 用户责任

用户只确认真正的业务歧义。主智能体自动提取并整理业务决策，不得要求用户手工维护本体 YAML 或交接表。

## 主动提出专业分工

当重复工作具有稳定职责、清晰所有权、可独立验收的产物、后续会反复出现，并且专业化能够明显提升质量或效率时，主智能体必须主动提出新增长期专业智能体。增加前必须取得用户确认。
```

- [x] **步骤 3：创建统一交接契约**

`docs/agents/agent-handoff-contract.md` 定义以下决策包：

```yaml
decisionPackage:
  id: DEC-PACKAGE-20260808-001
  scope: product-process
  knowledgeBaselineVersion: 0.3.0
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

同一文件定义两种返回格式：

```yaml
ontologyResult:
  result: updated
  baselineBefore: 0.3.0
  baselineAfter: 0.3.1
  changedArtifacts: []
  conflicts: []
  questions: []
  validationEvidence: []

qualityResult:
  result: passed
  reviewedCommit: 0000000000000000000000000000000000000000
  checks: []
  findings: []
  residualRisks: []
```

文档必须说明示例 ID 只演示格式，实际任务由主智能体自动生成，用户不填写。

- [x] **步骤 4：创建本体建模角色契约**

`docs/agents/business-knowledge-modeler.md` 必须规定：

```markdown
# 业务知识本体建模智能体

## 必读资料

1. `AGENTS.md`
2. `docs/agents/agent-handoff-contract.md`
3. `docs/architecture/business-knowledge-model.md`
4. `docs/knowledge/README.md`
5. `docs/knowledge/open-questions.yaml`
6. 当前决策包涉及的知识、代码、数据库和测试文件

## 文件所有权

可修改 `docs/knowledge/**` 和与知识结构直接相关的架构说明；不得修改业务运行代码。

## 工作规则

- 只把 `confirmed` 内容写入权威知识模型。
- `inferred` 只能作为候选说明，不能成为规则。
- `unresolved` 必须返回 `blocked-by-question`。
- 规划能力只进入内部投影。
- `verified` 必须同时存在实现证据、测试证据和执行契约。
- 发现冲突返回 `conflict`，不得覆盖旧决策。

## 返回结果

只返回 `updated`、`not-applicable`、`blocked-by-question` 或 `conflict`，并遵守统一交接契约。
```

- [x] **步骤 5：创建质量验证角色契约**

`docs/agents/quality-verifier.md` 必须规定：

```markdown
# 质量验证智能体

## 必读资料

1. `AGENTS.md`
2. `docs/agents/agent-handoff-contract.md`
3. 已确认需求和相关本体规则
4. 当前变更及其测试、迁移和审计证据

## 独立性

默认只报告问题，不修改业务实现。主智能体修复后重新验证。

## 检查范围

- 需求和本体一致性
- CRUD、父子版本、状态、权限和审计
- 异常、重复提交、并发和边界数据
- 数据库迁移及初始化资产
- RDO 页面规范、E2E、视觉和响应式布局
- 自动化测试和回归风险

## 返回结果

只返回 `passed`、`failed` 或 `blocked`。每个失败项必须包含复现步骤、期望结果、实际结果、证据和严重程度。
```

- [x] **步骤 6：验证角色契约关键门禁**

运行：

```bash
rg -n "blocked-by-question|not-applicable|passed|主动提出专业分工" AGENTS.md docs/agents
rg -n "不得修改业务运行代码|默认只报告问题" docs/agents
```

预期：两条命令均找到对应规则。

- [x] **步骤 7：提交角色契约**

```bash
git add AGENTS.md docs/agents docs/superpowers/specs/edhr-persistent-agent-collaboration-design.md
git commit -m "docs: establish persistent agent roles"
```

### 任务 2：建立产品制程知识基线

**文件：**
- 创建：`docs/knowledge/README.md`
- 创建：`docs/knowledge/glossary.yaml`
- 创建：`docs/knowledge/ontology.yaml`
- 创建：`docs/knowledge/rules/product-process.yaml`
- 创建：`docs/knowledge/decisions/DEC-0001-product-process-modeling.yaml`
- 创建：`docs/knowledge/evidence/product-process.yaml`
- 创建：`docs/knowledge/open-questions.yaml`

- [x] **步骤 1：创建知识目录说明**

`docs/knowledge/README.md` 必须说明：

```markdown
# eDHR 结构化业务知识基线

该目录是业务概念、关系、规则、决策和证据的机器可读权威来源。
用户不手工维护这些文件；主智能体从已确认讨论生成决策包，本体建模智能体负责更新。

状态：`planned`、`specified`、`implemented`、`verified`、`deprecated`。
只有 `verified` 且具备执行契约的规则可以进入客户和运行时投影。
`planned`、`specified` 和 `implemented` 只进入内部投影。

所有标识一经引用不得复用。业务变化通过新决策的 `supersedes` 关联旧决策，不删除历史。
运行校验：`cd gmp-platform/backend && mvn -Dtest=BusinessKnowledgeModelTest test`。
```

- [x] **步骤 2：写入领域词典**

`docs/knowledge/glossary.yaml` 使用 `knowledgeModelVersion: 0.3.0`，并为以下术语建立唯一 ID、中文名称、定义、别名和状态：

```yaml
terms:
  - id: term.material
    name: 物料
    definition: 物料管理维护的主数据；类型为产品或半成品时可以派生为产品。
    aliases: [物料主数据]
    status: implemented
  - id: term.product
    name: 产品
    definition: 从产品或半成品物料派生的生产对象，不独立维护重复主数据。
    aliases: [父产品]
    status: implemented
  - id: term.product-process-version
    name: 产品制程版本
    definition: 产品下可并行存在并在生产执行时被显式选择的具体制程配置。
    aliases: [制程配置版本]
    status: implemented
```

同一文件还必须完整登记：工艺路线版本、工序、DHR 模板版本、DHR 目录项、表单模板版本、文档版本、工序绑定、生产批次和执行快照。

- [x] **步骤 3：写入概念与关系**

`docs/knowledge/ontology.yaml` 至少包含以下关系，并为每项记录 `id`、`source`、`target`、`cardinality`、`status` 和 `evidenceIds`：

```yaml
relations:
  - id: relation.material-derives-product
    source: concept.material
    target: concept.product
    cardinality: one-to-zero-or-one
    status: implemented
    evidenceIds: [evidence.product-source-entity]
  - id: relation.product-has-process-versions
    source: concept.product
    target: concept.product-process-version
    cardinality: one-to-many
    status: implemented
    evidenceIds: [evidence.product-process-schema]
  - id: relation.process-version-binds-route-version
    source: concept.product-process-version
    target: concept.route-version
    cardinality: many-to-one
    status: implemented
    evidenceIds: [evidence.product-process-version-entity]
  - id: relation.process-version-binds-dhr-version
    source: concept.product-process-version
    target: concept.dhr-template-version
    cardinality: many-to-one
    status: implemented
    evidenceIds: [evidence.product-process-version-entity]
```

同时完整登记路线包含工序、工序引用 DHR 目录表单、DHR 目录项指向表单版本、工序引用多个文档、产品制程版本被工单或批次显式选择、批次冻结执行快照等关系。尚未接入生产执行的关系使用 `specified`，不得标记为 `verified`。

- [x] **步骤 4：写入产品制程规则**

`docs/knowledge/rules/product-process.yaml` 对每条规则记录 `id`、`name`、`status`、`visibility`、`trigger`、`scope`、`condition`、`result`、`explanation` 和 `evidenceIds`。

首批规则包括：

```yaml
rules:
  - id: rule.product.source-from-material
    name: 产品来源于产品或半成品物料
    status: implemented
    visibility: internal
    trigger: material.query-as-product
    scope: product
    condition:
      material.type: [PRODUCT, SEMI_FINISHED]
    result:
      type: include
    explanation: 产品管理读取物料管理中类型为产品或半成品的数据。
    evidenceIds: [evidence.product-source-controller]
  - id: rule.product-process.multiple-parallel-versions
    name: 同一父产品允许存在多个制程版本
    status: implemented
    visibility: internal
    trigger: product-process.version.create
    scope: product
    condition:
      version.labelUniqueWithinProduct: true
    result:
      type: allow
    explanation: 父产品不指定唯一当前版本，生产执行时显式选择具体版本。
    evidenceIds: [evidence.product-process-controller-test]
```

已确认但尚未接入运行的“工单拆分批次时显式选择制程版本”记录为 `specified/internal`。表单完工前完成、表单共享、字段权限、事务触发、最终产出和物料齐套记录为 `planned/internal`。

- [x] **步骤 5：写入决策、证据和未决问题**

`DEC-0001-product-process-modeling.yaml` 记录以下已确认决策：

- 产品数据来源于产品或半成品物料；
- 一个父产品可拥有多个并行制程版本；
- 不设父产品的唯一“当前版本”；
- 生产执行阶段显式选择具体制程版本；
- 一个制程版本绑定一个工艺路线版本和一个 DHR 模板版本；
- 工序可绑定 DHR 目录中的多个表单和多个文档；
- PDF 文档引用可以配置起始页和结束页。

`evidence/product-process.yaml` 为上述决策关联现有实体、控制器、迁移、前端页面和 `ProductProcessControllerTest` 的真实仓库路径。`open-questions.yaml` 初始使用：

```yaml
knowledgeModelVersion: 0.3.0
questions: []
```

- [x] **步骤 6：提交知识基线**

```bash
git add docs/knowledge
git commit -m "docs: add product process knowledge baseline"
```

### 任务 3：用测试校验知识模型

**文件：**
- 创建：`gmp-platform/backend/src/test/java/com/zencas/edhr/knowledge/BusinessKnowledgeModelTest.java`

- [x] **步骤 1：先编写会因缺少校验辅助方法而失败的测试骨架**

测试类先声明五个场景：

```java
class BusinessKnowledgeModelTest {
    @Test void loadsEveryKnowledgeYamlFile() {}
    @Test void keepsIdentifiersUniqueAndReferencesResolvable() {}
    @Test void keepsUnverifiedRulesOutOfCustomerAndRuntimeProjections() {}
    @Test void requiresImplementationAndTestEvidenceForVerifiedRules() {}
    @Test void pointsEvidenceToExistingRepositoryFiles() {}
}
```

将第一个测试改为调用尚未实现的 `loadKnowledgeDocuments()`，使编译失败。

- [x] **步骤 2：运行测试并确认失败**

运行：

```bash
cd gmp-platform/backend
mvn -Dtest=BusinessKnowledgeModelTest test
```

预期：编译失败并提示 `loadKnowledgeDocuments` 不存在。

- [x] **步骤 3：实现 YAML 加载和仓库根目录定位**

使用 `org.yaml.snakeyaml.Yaml`，从 `System.getProperty("user.dir")` 向父目录查找同时包含 `docs/knowledge` 和 `gmp-platform` 的目录。递归读取 `docs/knowledge/**/*.yaml`，并断言每个文件解析为非空 `Map<String, Object>`。

核心方法签名固定为：

```java
private Path findRepositoryRoot()
private Map<String, Object> loadYaml(Path path)
private List<Path> knowledgeYamlFiles()
private List<Map<String, Object>> mapList(Map<String, Object> document, String key)
private Set<String> collectIds(List<Map<String, Object>> records, String source)
```

- [x] **步骤 4：实现标识和引用完整性校验**

测试收集术语、概念、关系、规则、决策和证据 ID，验证：

- 每个集合内部 ID 唯一；
- 概念的 `termId` 指向已登记术语；
- 关系的 `source` 和 `target` 指向已登记概念；
- `evidenceIds` 指向已登记证据；
- 状态只允许 `planned`、`specified`、`implemented`、`verified`、`deprecated`。

- [x] **步骤 5：实现投影和证据校验**

测试必须断言：

```java
if (!"verified".equals(status)) {
    assertEquals("internal", visibility,
            () -> id + " is not verified and must remain internal");
}
if ("verified".equals(status)) {
    assertFalse(evidenceIds.isEmpty(), id + " requires evidence");
    assertTrue(record.containsKey("executionContractId"),
            id + " requires an execution contract");
}
```

证据类型为 `code`、`database`、`test` 或 `document` 时，将 `path` 解析到仓库根目录并断言文件真实存在。

- [x] **步骤 6：运行知识模型测试**

运行：

```bash
cd gmp-platform/backend
mvn -Dtest=BusinessKnowledgeModelTest test
```

预期：`BUILD SUCCESS`，五个测试全部通过。

- [x] **步骤 7：提交校验测试**

```bash
git add gmp-platform/backend/src/test/java/com/zencas/edhr/knowledge/BusinessKnowledgeModelTest.java
git commit -m "test: validate business knowledge model"
```

### 任务 4：将协作规则接入现有架构文档

**文件：**
- 修改：`docs/architecture/business-knowledge-model.md`
- 修改：`docs/architecture/technology-stack-and-ai-development.md`

- [x] **步骤 1：更新本体模型维护方式**

在 `business-knowledge-model.md` 的“维护方式”后增加“智能体协作”章节，明确：

- 主智能体自动生成决策包，用户不录入 YAML；
- 本体建模智能体维护 `docs/knowledge/`；
- 质量验证智能体独立验证实现；
- 结构化基线是权威来源，当前文档是人员阅读投影；
- 业务变更必须取得本体结果和质量结果后才能完成。

- [x] **步骤 2：增加主动提出智能体分工规则**

在 `technology-stack-and-ai-development.md` 的 AI 开发质量门槛后增加：

```markdown
### 专业智能体分工

主智能体负责业务沟通、实现和基础测试；业务知识本体建模智能体负责结构化知识沉淀；质量验证智能体负责独立审查和验证。

当重复工作同时具备稳定长期职责、清晰所有权、可独立验收、后续会反复出现，并且专业化能明显提升质量或效率时，主智能体必须主动向用户提出新增长期专业智能体。未经用户确认不得增加固定角色。
```

- [x] **步骤 3：验证文档互相引用**

运行：

```bash
rg -n "docs/knowledge|本体建模智能体|质量验证智能体" docs/architecture
rg -n "主动向用户提出新增长期专业智能体" docs/architecture/technology-stack-and-ai-development.md
```

预期：命中知识基线、两个固定角色和新增角色规则。

- [x] **步骤 4：提交架构文档更新**

```bash
git add docs/architecture/business-knowledge-model.md docs/architecture/technology-stack-and-ai-development.md
git commit -m "docs: integrate agent gates into development guidance"
```

### 任务 5：执行本体建模智能体试运行

**执行结果：** 已完成。产品制程知识在前序校正后与实现证据一致，正式复核返回 `not-applicable`，无需创建空提交；证据已固化到首次实施验收记录。

**文件：**
- 可能修改：`docs/knowledge/**`
- 可能修改：`docs/architecture/business-knowledge-model.md`

- [x] **步骤 1：派发固定本体角色**

使用 Codex 子智能体，要求它先读取 `docs/agents/business-knowledge-modeler.md`，然后审查 `DEC-0001`、产品制程知识基线及以下实现证据：

```text
gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/ProductProcessController.java
gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/ProductProcessVersion.java
gmp-platform/backend/src/main/resources/db/changelog/0044-product-process-modeling.sql
gmp-platform/backend/src/main/resources/db/changelog/0049-product-process-dhr-item-binding.sql
gmp-platform/backend/src/main/resources/db/changelog/0052-product-process-document-pages.sql
gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/controller/ProductProcessControllerTest.java
```

要求返回符合统一契约的 `updated`、`not-applicable`、`blocked-by-question` 或 `conflict`。

- [x] **步骤 2：处理试运行结果**

若返回 `updated`，审查并保留其知识文件修正；若返回 `blocked-by-question` 或 `conflict`，主智能体核对是否来自已确认规则，无法从现有决策解决时再向用户提问。

- [x] **步骤 3：重新运行知识模型测试**

```bash
cd gmp-platform/backend
mvn -Dtest=BusinessKnowledgeModelTest test
```

预期：`BUILD SUCCESS`。

- [x] **步骤 4：提交试运行修正**

```bash
git add docs/knowledge docs/architecture/business-knowledge-model.md
git diff --cached --quiet || git commit -m "docs: reconcile product process ontology evidence"
```

### 任务 6：执行质量验证智能体试运行

**执行结果：** 已完成。初次审查发现的 schema 校验缺口已修复，规格复审通过，未参与修复的全新质量实例最终返回 `passed`。

**文件：**
- 默认不修改业务代码

- [x] **步骤 1：运行主智能体基础测试**

```bash
cd gmp-platform/backend
mvn -Dtest=BusinessKnowledgeModelTest,ProductProcessControllerTest test
cd ../frontend
npm run verify:process-modeling
npm run build
```

预期：Maven `BUILD SUCCESS`，前端结构校验通过，Vite 构建成功。

- [x] **步骤 2：派发固定质量验证角色**

要求子智能体先读取 `docs/agents/quality-verifier.md`，然后独立审查本轮提交，重点验证：

- 角色触发和完成门禁没有绕过路径；
- 本体规则状态不会把规划能力暴露到客户或运行时；
- 产品制程证据路径与当前代码一致；
- 知识校验测试能发现重复 ID、悬空引用、非法状态和不存在的证据路径；
- 本次只增加开发治理资产，不改变生产业务行为或数据库结构。

要求返回 `passed`、`failed` 或 `blocked`，失败必须可复现。

- [x] **步骤 3：修复并回归**

质量验证返回 `failed` 时，由主智能体修复问题并重新执行步骤 1 和步骤 2；质量智能体不得自行修改业务实现。只有结果为 `passed` 才能进入最终验收。

### 任务 7：最终验收

**执行结果：** 已完成。知识模型与产品制程后端测试共 65 项通过，前端制程校验和生产构建通过，`edhr-dev` 已推送至 `8481b6a9`。

**文件：**
- 检查：本计划涉及的全部文件

- [x] **步骤 1：运行完整知识与产品制程验证**

```bash
cd gmp-platform/backend
mvn -Dtest=BusinessKnowledgeModelTest,ProductProcessControllerTest test
cd ../frontend
npm run verify:process-modeling
npm run build
```

预期：全部通过。

- [x] **步骤 2：检查正式文件和工作区范围**

```bash
git diff --check
git status --short
test -f AGENTS.md
test -f docs/agents/business-knowledge-modeler.md
test -f docs/agents/quality-verifier.md
test -f docs/knowledge/ontology.yaml
```

预期：不存在空白错误；正式文件全部存在；`.superpowers/` 临时目录仍不纳入提交。

- [x] **步骤 3：记录最终门禁结果**

最终答复明确报告：

```text
ontology = updated
quality = passed
knowledge baseline = 0.3.0
```

并列出自动化测试命令、提交记录和仍明确暂缓的运行引擎、客户问答及本体编辑器范围。
