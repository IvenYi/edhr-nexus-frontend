# 本体基础修复与多人分支集成

日期：2026-10-12。修复目标分支：`edhr-dev`；核对的目标提交：`ea5d1a65b7390c7f89964980364866583c5fd018`。修复分支：`fix/ontology-foundation-contracts`。本切片按 L1 知识基础设施和治理修复执行；生产运行逻辑、数据库及投影功能实现不在本次修改范围。

## 1. 四项问题的修复结果

| 问题 | 本次处理 | 可复核文件 |
| --- | --- | --- |
| 事实声明类型与比较值不一致，校验器未检查操作数类型 | 校准 82 个事实：66 boolean、14 integer、2 decimal；受控类型、枚举取值、操作符输入、字面量与 RHS 事实引用进入正式校验 | `docs/knowledge/schema.yaml`、`docs/knowledge/facts/`、`BusinessKnowledgeModelValidator.java` |
| 审计快照关系把动作分类当成具体事件 | 新增审计事件术语和概念；快照由事件持有，分类通过独立关系表达 | `docs/knowledge/glossary.yaml`、`docs/knowledge/ontology.yaml` |
| 自定义表单旧词条与 DEC-0075 不一致 | 同步工序或批次归属、有效模板、显式版本及完整执行快照，删除旧词条里的模板 PUBLISHED 要求；保留流程发布与资料齐套边界 | `term.execution-custom-form`、相关概念与证据 |
| 知识 CI 在打印前端构建阶段失败，未运行知识测试 | 新增独立 Maven 测试模块，复用原知识 Java 测试；所有 PR 检查合并候选，保留真实测试报告 | `tools/knowledge-model/pom.xml`、`.github/workflows/knowledge-model.yml` |

知识模型由 `0.3.24` 统一为 `0.3.25`，schema 由 `1.1.0` 升为 `1.2.0`。186 个知识 YAML 的版本头统一调整；绝大多数文件只改版本头，业务内容变更集中于上表所列资产。所有原有事实和规则的成熟度、可见范围及可用阶段未提升；类型检查不构成业务发布认证。

类型校准的逐项来源、保留的旧别名、谓词期望值与实际值类型的区别，以及未解决差异，见 [事实类型核对说明](../knowledge/evidence/ontology-foundation-fact-types.md)。schema 1.2.0 的操作数约定和兼容边界见 [知识 README](../knowledge/README.md#事实与操作数类型)。

## 2. 已运行验证及覆盖边界

主任务在整合工作树中使用 Java 21 运行正式入口：

```bash
mvn --batch-mode --no-transfer-progress --file tools/knowledge-model/pom.xml clean test
```

该次运行结果为 **89 tests，0 failures，0 errors，0 skipped**。包括原有结构、ID、引用、证据路径、成熟度和执行契约检查，以及新增的类型错配、枚举、数组成员、数值、显式 RHS 引用、别名与事实 ID 碰撞等回归。未知操作符现在先由 AST schema 检查，错误定位包含具体条件路径；对应旧测试断言按更精确的诊断更新，没有放宽未知操作符限制。

独立模块只编译后端知识测试包的 5 个 Java 源文件，不触发生产主代码编译或打印资源构建。此结果不代表完整后端、浏览器、数据库、生产流程或投影分支的测试通过。独立质量结果及远端 PR CI 应以本次最终交接、PR 状态和实际提交为准，不能从这份文档继承到后续变更。

补充 YAML/引用扫描核对了 186 份知识文件、2276 个全局记录 ID、254 个事实、358 条当前条件和 32 个来源链接；该扫描是补充证据，正式入口仍为 Java/JUnit。知识 CI 不自动判断所有自然语言冲突，也不能证明某位协作者的 Agent 已重读契约。

## 3. 契约如何避免继续漂移

本次在项目契约、本体角色、质量角色和统一交接中增加了三个具体责任：

1. 已确认决策生效时，在同一切片同步受影响术语、概念、关系、事实和规则；记录哪些 ID 更新、保留、作为历史保留或暂缓。部分替代明确到声明及适用范围，旧决策其他内容继续有效。
2. 交接记录知识版本，以及来源、目标、实际读取契约的 Git 提交。未提交的契约差异按路径如实记录，不为工作树编造版本。
3. 验收检查实际合并候选；目标或功能分支变化后重评影响并重跑适用检查，旧提交的通过不能直接代替新结果。

有原始证据的建模错误可以修正；已经明确确认的业务替代可以直接落实，无须再次批准。代码与规则不一致时，代码证明实际行为，已确认决策确定规范要求，二者的差异需保留并处理。真正影响方案的歧义只暂停依赖范围，无依赖的已确认工作继续。

`contractBaseline`、`replacementScopes` 和 `knowledgeSync` 是人工/Agent 交接责任，本次没有将这些自然语言流程字段伪装成自动校验能力。具体格式见 [统一交接契约](../agents/agent-handoff-contract.md)。

## 4. 朋友和旧功能分支的日常流程

朋友在尚未拉取新契约时已经写出的代码，不需要全部推翻。推荐在开始新任务、恢复长任务或切换工作阶段时，先保存当前工作，再获取目标分支并核对契约增量：

```bash
git fetch origin
git diff HEAD...origin/edhr-dev -- AGENTS.md docs/agents docs/architecture/business-knowledge-model.md
git show origin/edhr-dev:AGENTS.md
```

这里的三点 diff 展示目标分支自共同祖先以来的改动，用于初步发现契约增量；实际交接还应按上次记录的 `contractReadCommit` 比较，并核对功能分支自己修改的契约。`fetch` 不会修改工作文件，也不会刷新正在运行的 Agent 上下文。需要显式让 Agent 读取更新后的适用文件，再增量核对当前任务。

朋友可以持续向自己的功能分支推送在途代码；新契约影响哪些部分，就补齐那些部分。知识 CI 当前在 PR 和主干推送上运行，仅推送尚无 PR 的功能分支不保证触发该工作流。提早建立草稿 PR 可以在开发阶段看到合并候选的检查结果。

共享分支同步目标分支时，优先普通 merge；另一种方式是建立独立集成分支/工作树，在其中处理冲突并生成可审查的候选。不要为了更新契约强行 rebase/force-push 朋友正在使用的共享历史。所有合并命令都应在已保存工作的工作树内执行。

合并前核对受影响知识定义、全局 ID、事实别名、关系端点、规则类型、替代范围和业务回归。对投影或执行链路改动，还要验证原始表单记录、工作数据、业务投影、追溯关系、DHR 证据及审计历史各自的所有权和版本边界。合并后做必要回归，但不能把第一次审计推迟到正式主干合并之后。

## 5. 投影分支已确认的真实集成风险

本次只读核对：

| 对象 | 固定提交 |
| --- | --- |
| `edhr-dev` | `ea5d1a65b7390c7f89964980364866583c5fd018` |
| `form-traceability-projection` | `156a0d4116693292f077d5a4189ae93f740c3f35` |
| 共同祖先 | `f2710af9ea717e760fef456cad09d6304c7f4e55` |

两个分支都使用知识版本 `0.3.24`，但独立新增了同一个决策 ID `DEC-0075` 及 `DEC-0075-01` 至 `DEC-0075-08`，共 **9 个 ID 碰撞**：

- [目标分支 DEC-0075](https://github.com/IvenYi/edhr-nexus-frontend/blob/ea5d1a65b7390c7f89964980364866583c5fd018/docs/knowledge/decisions/DEC-0075-custom-form-scope-and-record-completeness.yaml) 讲自定义表单归属和资料齐套。
- [投影分支 DEC-0075](https://github.com/IvenYi/edhr-nexus-frontend/blob/156a0d4116693292f077d5a4189ae93f740c3f35/docs/knowledge/decisions/DEC-0075-form-traceability-projection-ownership.yaml) 讲表单追溯和业务投影所有权。

文件路径不同，Git 可能不对这两份文件报告文本冲突；全局知识 ID 仍然冲突。现有校验器本来已有重复 ID 检查，本修复保证它能够真正运行于 PR 合并候选，并补齐类型与别名检查。

建议在独立投影集成切片中保留已进入目标分支的决策 ID，为投影决策选择候选树中未占用的 ID，并按原分支和语义逐项更新其声明及引用，保存旧到新映射。**不能全仓替换 DEC-0075**；当前这个字符串在两边代表不同含义，原始确认证据中的历史标识还需要保留来源提交说明。

双方共同修改了 11 个路径，包括知识 README/词表/本体/生产表单份规则，以及执行快照、表单记录服务、执行引擎、执行集成测试和相关前端界面。这些路径是集成审计的优先范围，不等于全部存在冲突。投影分支已有 14 个相关后端测试文件新增或修改；本轮未运行它们，也未完成投影功能审计。本次修复没有修改或合并该分支。

## 6. 让门禁对所有协作者生效

2026-10-12 的 GitHub 只读查询显示：`edhr-dev` 的 `protected` 为 `false`、必需检查关闭，仓库 `rulesets` 返回空列表。本切片没有改变这些管理员设置。

建议在本 PR 的 `validate` 首次实际通过并可供选择后，对 `edhr-dev` 配置：

| 设置 | 目的 |
| --- | --- |
| Require a pull request before merging | 通过 PR 集成目标分支，避免直接推送跳过审查 |
| Require status checks to pass before merging：选择本工作流实际 `validate` 检查，来源限定 GitHub Actions | 失败或缺失的知识检查不能直接合并 |
| Require branches to be up to date before merging | 目标分支更新后，基于最新组合重新检查 |
| 核对 bypass 列表及管理员适用范围 | 防止日常协作身份无意绕过上述要求 |

这组设置不要求朋友每次小改都做全系统验证，也不自动证明自然语言语义一致；本体与质量角色仍按本次影响范围复核。GitHub 的严格检查说明见 [分支保护文档](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)。

合并队列是团队并发更高且仓库支持时的另一种方案。本工作流当前没有 `merge_group` 触发器；启用合并队列前必须配套添加该事件，并验证队列候选的检查结果，详见 [GitHub 合并队列文档](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue)。不能把普通 PR 的检查当成队列检查已完成。

## 7. 后续本体建设的优先顺序

1. **先完成投影分支集成审计。** 处理 ID 碰撞，核对共同修改的链路，运行投影和执行相关测试，避免旧契约或旧语义重新进入目标分支。
2. **确认两个小数数量阈值。** `split.targetQuantity` 与 `split.quantityPerBatch` 的知识条件为 `>= 1`，实现为 `> 0`。DEC-0012/0014 未明确 BATCH 的 `(0,1)` 区间；本次保留差异，确认政策后单独改规则或实现并补边界测试。
3. **在稳定领域试点可执行规则层。** 明确类型化事实读取、取值时点、标准和自定义操作符、缺失/空值/异常、规则结果及执行契约，建立纯求值与动作执行的边界；进入生产前冻结规则、配置、事实目录及必要事实依据。
4. **按具体用途引入标准映射。** P0/P1 可以提前明确稳定 ID 到 IRI 的映射、关系类型和基数含义，并做小范围 JSON-LD/SHACL 导出与验证。完整 RDF/OWL 推理平台由实际互操作或推理需求决定。格式转换可以渐进进行，但语义清理、版本与执行边界不能靠转换器自动补齐。

本切片完成的是已确认基础缺陷和协作契约的修复，不表示整个知识模型已经成为标准 OWL 本体或生产通用规则引擎。阶段进度保持 P0 `in-progress`，既有业务规则的发布资格仍按各自证据判断。
