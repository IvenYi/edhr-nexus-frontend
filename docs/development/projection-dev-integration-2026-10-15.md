# 投影分支集成与新本体契约对齐

执行级别：L2。投影来源 `eedc24721d8d5137b29840575867422577386141`；目标 `edhr-dev@3977329d13c4c74bd862e21abac4ae982e5b8f83`。采用独立工作树普通合并，保留双方历史，不使用强制推送。最终候选提交由 Git 合并提交及独立质量结果定位，本文不为未提交工作树编造哈希。

## 交付范围

- 最终产出调研已登记为[TODO](final-output-linkage-todo-2026-10-15.md)，随投影分支 `eedc2472` 先行提交推送。该遗漏项本轮不开发；后续按新契约确认基数、回写时点、完整性及历史补算策略。
- 重新读取目标的 `AGENTS.md`、编码准则、统一交接、本体/质量角色、架构模型及知识基线。新契约保留，知识使用 `0.3.25 / schema 1.2.0`，当前交接记录 `contractBaseline`、`replacementScopes` 和 `knowledgeSync`；并未给历史任务反填新契约读取。
- 投影旧 `DEC-0075` 改为 `DEC-0077`，41项声明逐一映射；目标自定义表单 `DEC-0075` 和治理 `DEC-0076` 保留。当前知识、来源导航和当前决策包同步新标识；历史声明和固定提交的链接保留来源含义。具体映射及局部替代见[集成本体说明](../knowledge/evidence/projection-integration-2026-10-15.md)。
- 三处知识冲突并存双方有效新增内容，保留批次数量下限的待决与 deprecated 旧规则。补齐投影配置、正式事实及保存内容查询的概念、实际来源事实和实现锚点；未将本次结构通过解释为全库语义审计或生产规则引擎已完成。
- 生产执行页冲突同时保留 `formOwner` 的真实所属工序选择、补填原因和文档查看修复，以及 `executionFormValues` 的数字字段序列化。其余自动合并接缝核对快照、表单保存、正式投影、子表行身份、认证与签署。

## 针对性修复

1. `ProductionExecutionIntegrationTest` 的旧 H2 夹具创建了 0109 内容索引，却缺少 0112 的 `value_type`，导致保存链测试报 500。按真实迁移后的列补齐夹具，保留原业务断言。
2. `test-execution-form-selector.mjs` 的 API 隔离桩缺少目标分支公共弹窗新增的删除保护导出，导致测试打包失败。补足桩边界，保留原行为断言。
3. 四类 PostgreSQL 投影测试的显式安全白名单增加 `edhr_projection_integration_test`，保留随机独立 schema 与清理。当前合并在新库测试，不修改 8087 的 `edhr_form_projection` 模拟记录。

## 主智能体实际验证

| 检查 | 实际结果与边界 |
| --- | --- |
| 正式知识入口 | `JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home mvn -f tools/knowledge-model/pom.xml test`；本体角色执行89项通过，0失败/错误/跳过，主读取报告核对。 |
| 后端聚焦回归 | 250项中248项执行通过，0失败/错误；仅 `formRecordsBrowserFixture` 与 `browserEvidenceFixture` 两个条件启动夹具未启用。覆盖生产执行、真实主体、签署、内容索引、正式投影、两向/DHR匹配、目录CRUD/解绑及来源权限。 |
| PostgreSQL | 在新库 `edhr_projection_integration_test` 执行四类实际数据库测试：`FormProjectionPostgresTest`、`FormTraceIndexPostgresTest`、`DhrTraceReportPostgresTest`、`FormLookupCatalogPostgresTest`，各自创建并清理随机schema；不是用H2代替。 |
| 前端聚焦与相邻回归 | 185项投影、执行、文档、引用、签署及身份修复回归通过；另21项公共界面及DHR导航通过。`verify:dhr-template-workspace`通过。 |
| 前端构建 | `npm run build` 的TypeScript与Vite构建通过。 |
| 全量初始化 | 合并候选后端在8097、独立新库启动，Liquibase从零执行143个changeset成功；九项预置正确，追溯日期为date，预置不可删除。未重启或迁移8087。 |
| 真实页面 | Playwright在3017→8097实际登录，检查正向页面、反向默认三项/展开六项及日期、添加入口默认隐藏、更多条件位于按钮左侧；展开后列表仍可见。 |
| 关联配置 | 独立库创建虚构自定义项及表单，通过API保存配置与版式；真实浏览器读取1项关联、预览命中主表字段（DOM高亮数1）、全选并解除至0项。只移除选中追溯来源，良品统计绑定保留；解除审计与数据库结果核对。历史内容保留另由PostgreSQL用例覆盖。 |

后端重现命令（Java21）：

```sh
PROJECTION_TEST_DATABASE_URL=jdbc:postgresql://localhost:5432/edhr_projection_integration_test \
mvn -f gmp-platform/backend/pom.xml -Dtest=ProductionExecutionIntegrationTest,ProductionExecutionEngineTest,ExecutionAccessTest,ExecutionSubjectScopeTest,ProductionExecutionFormValuesTest,FormInstanceRecordStageTest,FormTraceIndexServiceTest,TraceConditionTest,FormProjectionInterpreterTest,FormProjectionAuthorizationTest,TraceReportAuthorizationTest,FormLookupCatalogAuthorizationTest,TemplateProjectionAuthorizationTest,TemplateModelingControllerTest,FormReferenceLookupTest,FormProjectionPostgresTest,FormTraceIndexPostgresTest,DhrTraceReportPostgresTest,FormLookupCatalogPostgresTest test
```

本机原始日志与截图在该集成工作树的 `output/projection-dev-integration-2026-10-15/`、`output/playwright/projection-dev-*.png`，未提交测试数据、运行输出或图片。验收不继承旧分支的历史 `passed`；本轮独立质量检查以实际合并候选为范围，结构化结果另由质量角色记录。远端CI、必需检查与分支保护设置未在本轮核验，不声称已强制启用。

## 门禁与暂缓

[集成决策包](projection-dev-integration-2026-10-15.yaml)记录L2影响、扩展路径及本次适用验收；[本体结果](projection-dev-integration-2026-10-15-ontology.yaml)为 `updated`。独立质量角色负责收尾核对实际候选，发现交付问题由主智能体修复，适用复验通过后推送。

最终产出联动、A12受控修订/作废、其余带入生命周期及历史反向视图仍按各自范围处理。当前原始记录、保存内容索引、正式业务事实、真实归属、DHR证据及审计保持不同所有权和生效时点，不由查询命中或投影成功跨越业务边界。本次没有重跑安速康完整生产到DHR流程，也没有回写旧模拟产出；该完整数量链验收属于上述TODO。
