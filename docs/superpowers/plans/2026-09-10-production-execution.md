# 生产执行工作台

执行级别 L2；用户已明确启用本体与质量门禁。范围为生产菜单与 `/production/execution`、批次/SN 扫码、执行上下文、工序及作业流程、表单/SOP、完工校验、持久化和审计。保留当前设备建模及其他未提交修改；不提交、推送或部署。

## 实现与验证顺序

1. 核对产品配置、路线图、eDHR 表单和作业适用规则的真实结构；冻结执行依据，新增执行持久化与权限迁移。验证快照完整性和旧数据边界。
2. 实现后端扫码、状态查询和执行操作。服务端判定工序可执行性，使用锁与修订号避免重复及覆盖提交。验证顺序/并行前置、终态阻断、表单与作业完工约束。
3. 实现单屏工作台，整合菜单与路由。扫码后定位当前工序；保护未保存内容；表单、SOP、条件和下一步同屏。执行类型检查、构建和交互验证。
4. 本体智能体同步已确认契约；主智能体完成聚焦单元/集成验证后，质量智能体独立审查并返回结构化结果。发现问题由主智能体修复，L2 高风险问题使用新质量实例复验。

## 验收场景

- 扫码批次和 SN 均关联正确工单、产品、配置、路线与 eDHR 版本；未知条码不展示旧对象为新结果。
- 仅满足前置关系的工序允许开工；并行分支独立执行，汇合等待前置完成。
- 表单按稳定字段 ID 保存，刷新后保留；必填、只读、签名/审批要求不能由客户端绕过。
- 作业按适用规则匹配，已开始实例不随模板编辑变化；未完成作业阻断工序完工。
- 完工校验展示具体缺项，最后工序完成才正常结束生产对象；取消、提前结束和历史无执行记录不伪造已完成工序。
- 并发与重复请求不重复推进；审计可关联对象、工序、动作和操作者。

## 当前证据边界

现有 ProductionService 仅提供对象级开工/完成，未提供工序、表单运行记录。现有通用 WorkflowEngine 不能直接替代作业模板 JSON 图及其冻结契约。FormCanvasPreview 是只读预览，不能当作已有运行时填报能力。已有运行时条件来源问题需在本次按真实来源闭环，不能将缺少来源的条件默认判为满足。

## decisionPackage

```yaml
decisionPackage:
  id: DP-20260910-production-execution
  scope: 生产执行工作台及批次和SN执行闭环
  knowledgeBaselineVersion: 0.3.12
  summary: 用户确认新增扫码执行工作台并为本功能启用L2本体和质量门禁
  confirmed:
    concepts:
      - id: concept.production-execution-workspace
        name: 生产执行工作台
        definition: 在一个页面识别生产对象并查看关联配置、工序、条件、表单、SOP和执行动作
        status: specified
        sourceReferences: [用户本任务原始需求及确认]
    relationships: []
    rules:
      - id: rule.production-execution-context
        name: 批次和SN执行上下文
        status: specified
        trigger: 扫描生产对象条码
        condition: {fact: productionObject.exists, operator: equals, value: true}
        result: {action: display, target: 工单产品配置路线eDHR及工序执行状态}
        sourceReferences: [用户本任务原始需求]
      - id: rule.production-execution-completion-check
        name: 工序完工条件校验
        status: specified
        trigger: 用户申请完工
        condition: {fact: operation.completionConditionsSatisfied, operator: equals, value: true}
        result: {action: allow, target: 当前工序完工}
        sourceReferences: [用户本任务原始需求]
    executionContracts: []
  inferred:
    - id: inference.production-runtime-storage
      statement: 对象级冻结配置及版本化运行状态并发控制
      rationale: 实现既有DEC-0007执行快照及防重复提交要求
      relatedIds: [DEC-0007]
  unresolved: []
  impactAnalysis:
    level: L2
    directImpacts: [生产扫码入口和单屏操作, 工序状态及条件校验, 表单与SOP及适用作业]
    transitiveImpacts: [生产对象和工单正常完成投影, 提前结束后禁止继续执行]
    potentialImpacts: [历史已开工但无工序执行记录的数据兼容]
    unaffectedAreas: [设备主数据建模, 工单初始拆分数量规则, 其他系统管理页面]
    compatibilityAndMigration: [新增production_execution表和production.execution权限, 不伪造历史执行记录]
    snapshotImpacts: [冻结对象产品配置路线表单及适用作业依据]
    auditImpacts: [执行动作关联对象工序表单操作者及前后记录]
    permissionImpacts: [新增页面权限, 保留表单填报审批及电子签名约束]
    testImpacts: [批次和SN, 顺序及并行, 前置阻断, 表单保存, 完工, 并发, 终态, 权限, 快照, 审计, 迁移, UI]
    evidenceGaps: [具体运行时条件来源仍依据open-questions核对, 必须由实现和测试证明闭环后才推进成熟度]
  extensionStrategy:
    selectedPaths: [configuration, transaction-orchestration, product-core]
    rationale: 消费现有产品路线与作业配置并补齐生产运行时
    ownershipBoundaries: [production负责快照及执行编排, 主数据与模板保留原有配置所有权, identity提供主体解析]
  affectedFiles:
    - {path: gmp-platform/backend/src/main/java/com/zencas/edhr/production, changeType: update, reason: 执行闭环}
    - {path: gmp-platform/frontend/src/pages/production/ProductionExecutionPage.tsx, changeType: create, reason: 单屏执行工作台}
    - {path: gmp-platform/backend/src/main/resources/db/changelog/0076-production-execution.sql, changeType: create, reason: 执行持久化及权限}
  acceptanceScenarios:
    - id: scenario.production-execution-batch-sn
      given: 批次和SN分别关联有效工单与产品配置
      when: 扫码并完成工序表单和作业
      then: 显示正确上下文且仅条件满足才能完工并持久化执行证据
      evidenceRequirements: [集成测试, 真实页面交互, 审计及数据库记录]
```

以上决策包只覆盖已确认的工作台与条件校验目标；不将候选的具体条件来源写成已确认业务事实。适用作业的历史契约复用 DEC-0006、DEC-0007、DEC-0023、DEC-0025、DEC-0028、DEC-0029 和 DEC-0033。

## 本体收尾核对

本体增量核对了 ExecutionSnapshotBuilder、ExecutionAccess、ProductionExecutionEngine、ProductionExecutionService 及对应测试源码：对象执行依据冻结、修订号、防重复动作、顺序/并行工序前置、必填 eDHR 实际完成记录、适用作业 FORM/确认/条件 AST、真实主体解析和审批名单冻结、账户密码签名、通用签名/附件 CRUD 保护、工单/对象终态加锁与审计事务均已具有当前工作树实现证据。FileController 的 PDFBox 逐页 PNG 为同屏 SOP 阅读提供不依赖浏览器内嵌 PDF 的路径，页面复用统一 FormCanvasPreview 运行接口。

当前仅将本次两条生产执行规则和 DEC-0038 推进为 implemented/internal，不建立 verified 执行契约。OPERATION_START 条件来源与节点取值时点属于局部实现选择，不提升为用户确认的通用业务事实，也不关闭泛领域 open-questions。通知尚无投递服务、原始路线连线条件、返工入口、未知目录/操作符和缺少可靠来源等情况继续明确阻断；不能把局部实现描述成所有配置都能运行。旧决策的历史成熟度保留，本切片实现证据在独立 production-execution 文件中追溯。

本体自行执行 Java 21 正式 BusinessKnowledgeModelTest，53 项通过，无失败、错误或跳过，日志位于 `/tmp/production-execution-ontology-final.log`。核对主智能体生成的当前 JUnit 报告，PostgreSQL 执行集成 10 项中 9 项通过、浏览器夹具 1 项默认跳过，ExecutionAccess 7 项通过；这些结果不替代独立质量门禁或浏览器验收。本体不声明 qualityResult 为 passed。

```yaml
ontologyResult:
  result: updated
  baselineBefore: 0.3.12
  baselineAfter: 0.3.12
  reason: 本次生产执行局部实现已补充源码和测试证据，规则与决策保持implemented/internal，未关闭泛领域未决问题或提前声明verified。
  changedArtifacts:
    - path: docs/knowledge/rules/production-execution.yaml
      changeType: update
      ids: [rule.production-execution-context, rule.production-execution-completion-check]
    - path: docs/knowledge/decisions/DEC-0045-production-execution-workspace.yaml
      changeType: update
      ids: [DEC-0045]
    - path: docs/knowledge/evidence/production-execution.yaml
      changeType: update
      ids: [evidence.production-execution-runtime-condition-gaps, evidence.production-execution-snapshot-builder-source, evidence.production-execution-engine-source, evidence.production-execution-service-source, evidence.production-execution-access-source, evidence.production-execution-signature-protection-source, evidence.production-execution-file-preview-protection-source, evidence.production-execution-page-source, evidence.production-execution-engine-tests, evidence.production-execution-access-tests, evidence.production-execution-integration-tests, evidence.production-execution-migration-tests]
  conflicts: []
  questions: []
  validationEvidence:
    - id: validation.production-execution-final-knowledge
      checkType: schema
      command: cd gmp-platform/backend && JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home mvn -Dtest=BusinessKnowledgeModelTest -Dsurefire.reportsDirectory=/tmp/production-execution-ontology-reports test
      outcome: passed
      evidence:
        - /tmp/production-execution-ontology-final.log
        - 'Tests run: 53, Failures: 0, Errors: 0, Skipped: 0; BUILD SUCCESS'
    - id: validation.production-execution-final-projection
      checkType: projection
      command: BusinessKnowledgeModelTest.currentKnowledgeModelIsValid
      outcome: passed
      evidence:
        - 新增实现规则保持internal，未生成verified或runtime契约
        - 正式知识测试覆盖ID引用、证据路径与投影约束
```

## 最终质量门禁与交付验证

全新独立质量实例 `execution_final_quality` 在源码冻结后返回 `qualityResult.result: passed`，无阻断项。该实例未参与实现或修复。首轮 QF-EXEC-001（必填 eDHR 被条件分支绕过）、QF-EXEC-002（整数及精度约束）、QF-EXEC-003（超过前 100 条的引用选择和验证）均已修复，并由独立实例重跑原探针及回归确认 resolved。本次结果覆盖 HEAD `cb3cfc13ea70951b6d70af55f66dfdfd6e5234a7` 之上的生产执行工作树增量，排除既有设备改动及其他无关内容。

| 验证范围 | 最终结果与证据 |
| --- | --- |
| 执行引擎、身份、集成、迁移及生产对象回归 | 46 项通过：Engine 14、Access 7、Integration 10、Migration 1、ProductionService 14；驻留浏览器夹具默认跳过 1。独立报告位于 `/tmp/execution-final-quality-reports/`，最后冻结源码复验日志 `/tmp/execution-final-quality-final-regression.log`。 |
| 本体及知识资产 | 53 项通过；保持局部 implemented/internal，不关闭泛领域未决问题。 |
| 前端 | TypeScript 检查、完整构建通过，通用 UI 回归 13 项通过；日志 `/tmp/production-execution-build.log`、`/tmp/execution-final-quality-ui-regression.log`。 |
| PostgreSQL | 在专用测试库验证 0076 首次及重复迁移、约束、真实身份和事务执行链；日志 `/tmp/production-execution-pg-migration.log`、`/tmp/production-execution-pg-runtime.log`。最后新增的分阶段必填和旧文本子表兼容案例仅在 H2 集成回归验证，不扩大为 PostgreSQL 复验声明。 |
| 真实页面交互 | 主实例完成 SN01、独立实例完成 B01：扫码、前置阻断、草稿保存刷新恢复、站内导航未保存保护、填报、复核、错误密码拒绝、账户签署和两道工序完工。浏览器连接隔离服务；实际主体解析和签名持久化生效。 |
| 单屏布局与 SOP | 1280×720 下三栏和底部动作无重叠，实际 PDF 转页图像在表单旁显示；未将其扩展为所有 Office 文件及浏览器兼容证明。 |

当前 8081 原服务及用户开发数据库未替换或迁移；新增后端和权限迁移需要后续加载才会在该服务生效。未提交、推送或部署。通知投递、原始路线表达式、返工入口及缺少可靠引用源继续明确阻断；历史已开工但缺少执行记录的对象只读，不能补造执行事实。

## 2026-09-13 已确认视觉方案实现

用户确认独立 UX/UI 设计角色评审的交互稿后开始实现。本轮为 L1 界面交互切片，沿用本功能已开启的质量门禁；本体结果为 `not-applicable`：没有调整生产概念、工序状态、前置规则、权限、签名验证、审计或执行快照。

精简影响分析：直接影响扫码待机、对象信息层级、工序条件浮层、表单与 SOP 对照、动作位置、签署上下文及未保存确认焦点。相邻风险为站内导航保护、字段/版式切换保值、公共确认框默认行为和窗口缩小时填写区被挤占。扩展路径为 `product-core`，布局由生产执行页面及其专用 CSS 拥有；复用公共表单渲染器与原有执行 API。没有数据库或后端改动。

实现范围：ProductionExecutionPage.tsx、ProductionExecutionPage.css、ConfirmDialog.tsx 可选 initialFocus（其他调用仍默认 confirm），以及隔离 UI 验收入口对 `?shell=1` 的支持。其他设备、工单和模板改动不属于此轮。

- 扫码待机去除巨大空白卡片；已载入对象固定显示工单、产品配置、路线和 eDHR。
- 当前工序的条件摘要可展开查看真实原因；浮层展开不压缩填写区。SOP 常驻右侧，支持翻页及独立放大阅读。
- 表单保存/提交与工序开工/完工分区；签署显示对象、工序、表单与具体动作。未保存切换默认聚焦“返回表单”。
- 按页面实际可用高度启用紧凑排布，保留填写区与底部动作；成功提示不挤占工作区。窄屏转纵向滚动。

主实例验证：TypeScript 与完整 Vite 构建通过（`/tmp/production-execution-redesign-build.log`），13 项通用 UI 回归通过（`/tmp/production-execution-redesign-ui.log`），`git diff --check` 通过。使用独立 H2 后端及真实身份/签名链完成 B01 扫码、开工、温度 26 草稿保存、未保存返回保值、SOP 阅读、提交、账户审批签署、两道工序完工。使用导航占位验收 1280×720、1440×900、1920×1080，检查填写区和底部动作；390 宽度截图确认纵向布局，该尺寸 DOM 几何测量超时，不声称完成几何断言。未更换 8081 服务，未写入开发数据库。

独立质量实例 `execution_redesign_quality` 返回 `qualityResult.result: passed`，无阻断项；独立通过 13 项通用 UI 回归，并完成 SN01 扫码、前置阻断、温度 27 保存刷新、版式切换、SOP 展开关闭、站内未保存保护默认返回、错误密码拒绝、正确签署、两道工序完工及扫描下一个。低风险发现 QF-REDESIGN-001（单道工序完工后的误导提示）已修复并复核。该实例独立确认 390×844 下 scrollWidth=390、填写容器 193px；1024×768 保留导航占位时填写容器 67px，内容可滚动、底部动作可见，但舒适度受限，可使用全屏入口。最终页面 SHA-256 为 `00aaaea4880e51cfc53f4897bcd67b6b4a4d14640de4c773c2fefbcaf298705d`。

隔离测试服务 18081/13000 和临时验收页面已关闭。原前端 3000、后端 8081 进程保持不变；本轮未提交、推送或部署，未重跑不受本轮修改影响的后端完整门禁。

## 2026-09-14 顶部对齐与路线关系展示

沿用本功能切片，按用户截图执行 L1 展示投影优化：标题保留纯文字，批次号使用普通字段标签，对象状态与工序完工进度放在同一区域。顶部输入与三个按钮显式统一为 42px，间距为 8px，覆盖正式主题尺寸；进度复用原有非返工工序完成比例，不代表产量完成率。历史缺少执行记录时不展示推测进度。

精简影响分析：直接影响生产执行工具栏、对象摘要和工序导航；新增前端路线展示函数从冻结的 routeEdges/routeNodes 解析最近前置工序，透传非工序节点，并展示分支与汇合前置。相邻风险为网关、重复边、循环、返工与历史缺边，聚焦测试覆盖这些场景。仅在前端接口类型补充服务端已返回的可选 routeNodes，不修改接口负载、业务状态、availability、权限、签署、审计或数据库。扩展路径为 product-core，修改范围限于生产执行前端；ontologyResult 为 not-applicable，既有知识基线为 0.3.12，无新增业务语义和未决规则。

主验证：6 项路线关系测试通过（`/tmp/execution-route-tests.log`），TypeScript/Vite 构建通过（`/tmp/execution-route-build.log`）。采用从 App.tsx 读取的正式主题及 index.css，在只读样例服务中核对 1440×900 与 1024×768（含导航占位）的所有顶部控件高度均为 42px，同排顶部坐标一致且间距 8px；390×844 自动换行，无横向页面溢出。样例路线一分二再汇合显示双前置，1/4 完工对应 25%；可查看汇合工序且开工按钮继续服从 availability 禁用。样例无生产写接口，不替代真实数据库或执行引擎验收。

独立质量实例 execution_route_quality 返回 qualityResult: passed，无发现和阻断项。独立重跑 6 项关系测试并核对服务端已有契约、主题样例与真实主题一致性、差异及构建证据；未重复浏览器或真实数据库验收。导航是路线关系展示，不是完整路线图或分支求值器。临时主题入口已删除，13000 样例服务和验收页面已关闭；3000/8081 保持运行，未提交、推送或部署。

## 2026-09-14 左侧上下文与辅助浮层

用户确认采用快速切换与大区域悬浮展开后开始实现。本轮为 L1 交互切片，沿用本功能已启用的质量门禁。本体为 not-applicable：不修改生产状态、执行条件、快照、权限、签名、审计、数据库或 API。

精简影响分析：直接影响对象信息和工序导航布局、表单可用空间、ESOP/作业/记录的打开与收起；相邻风险为草稿丢失、收起点击穿透、键盘焦点、嵌套确认弹窗和文档阅读位置。扩展路径为 product-core，新增生产执行专用 ExecutionQuickPanel，保留原表单渲染器与执行 API。兼容迁移、快照、审计及权限影响均为空列表，未增加业务规则。

- 顶部保留扫码与工具栏；对象信息集中在左上，工序导航在左下，主空间用于填报。
- 右侧固定图标文字快捷条；鼠标停留 300ms 或点击展开 ESOP、作业或记录，使用同一浮层切换。离开鼠标不自动收起；点击外部、同一入口、返回填报、关闭按钮或 Esc 收起。
- 外部点击仅用于收起，不同时执行底层动作；触摸和拖动不触发悬停。嵌套签署或未保存确认期间暂停外层快捷键处理。
- 主表单与文档节点保持挂载；阅读切换保留当前文件、页码、缩放、滚动。刷新同一对象和工序不重置文档选择，切换对象/工序按原未保存保护处理。作业入口返回当前表单不重置草稿。

验证记录：

- TypeScript/Vite 完整构建退出 0，日志 `/tmp/execution-peek-build.log`；8 项浮层交互、6 项路线、13 项通用 UI 回归共 27 项通过，日志 `/tmp/execution-peek-tests.log`。交互单测使用受控计时器与 DOM 边界替身验证悬停延迟/取消、触摸/拖动、点击消费、弹窗暂停和焦点恢复；不将其表述为真实鼠标悬停浏览器测试。
- 从 App.tsx 提取真实主题并加载 index.css，连接隔离 H2 集成夹具。浏览器验证 B01 扫码、工序开工、温度 37 草稿保留、保存及刷新恢复；ESOP/作业/记录切换、同一表单返回、外部收起不误切工序、未保存切换默认返回、Esc/Tab 焦点；ESOP 缩放 150%、滚动 1045，在收起及刷新后重新打开仍保留。SN01 回车扫码显示正确的 SN 上下文。
- 1366×768 含导航占位时填写画布约 694×272，工作卡片约 696×554；1680×920 验证大区域浮层；390×844 下快捷条横排、浮层宽 344，页面 scrollWidth 384，不超过窗口宽 390。窄屏以纵向滚动为主。浏览器仅出现既有 React Router future 警告，无运行错误。
- 此轮文档实测为单页 PDF 转图片；未扩大为多页/多文件及全部 Office 格式浏览器验收，未重跑不受本轮影响的后端业务完整门禁或生产数据库验证。

临时主题验收入口已删除，13000/18081 隔离服务与页面已关闭；原 3000 前端与 8081 后端进程保留。未提交、推送或部署。

独立质量实例 execution_peek_quality 返回 `qualityResult.result: passed`，无 findings 或 blockingConditions；实际独立运行 8 项浮层与 6 项路线测试，14/14 通过，核对最终构建和 27 项回归日志。该实例基于 `/tmp/execution-before-peek.tsx`、`/tmp/execution-before-peek.css` 审查本轮增量，base/head 均为 `cb3cfc13ea70951b6d70af55f66dfdfd6e5234a7`，知识基线 0.3.12；浏览器证据来自主实例，未声称重复独立浏览器验收。

## 2026-09-14 左侧信息分组与工序抽屉

根据用户最新截图直接落实 L1 交互调整：工单、目标数量、状态及进度逐项分行；生产产品、产品配置、工艺路线与 eDHR 拆为四个独立灰色卡片，卡片内附属字段也逐行呈现。左侧变为单个可滚动纵向容器，原工序导航移入从工作台左侧展开的抽屉，入口显示当前查看工序、状态及“切换工序”。

影响分析：直接影响左侧布局、导航入口和抽屉显隐；相邻风险为未保存切换、当前工序重复选择、全屏嵌套确认、焦点恢复和与右侧辅助面板互斥。扩展路径为 product-core，新增页面专用 ExecutionOperationDrawer，复用原导航、availability 与 protect；本体 not-applicable，无业务、权限、签名、审计、快照、接口或数据库变更。兼容修复仅为公共 ConfirmDialog 新增可选 container，其他调用未传入时保持默认挂载行为。

交互：鼠标悬停 300ms 或点击打开，触摸/拖动不触发悬停；选择当前工序仅收起，不重置草稿；选择其他工序经过未保存保护。取消确认直接回到表单并保留值，关闭后恢复入口焦点；关闭后的 500ms 内抑制悬停重开，点击仍即时可用。抽屉和右侧辅助浮层互斥，支持遮罩和 Esc 收起。

验证：主实例与独立质量实例均运行 32 项回归（新增抽屉 5、辅助浮层 8、路线 6、通用 UI 13），全部通过；日志 `/tmp/execution-drawer-tests.log`。TypeScript/Vite 最终构建退出 0，日志 `/tmp/execution-drawer-build.log`，10.56s 完成。悬停延迟和冷却由受控组件测试验证，不声称完成真实硬件悬停自动化。

主实例浏览器原始证据来自真实 App.tsx 主题/index.css、导航占位和隔离 H2：B01 扫码、四灰卡纵向展示、点击抽屉、检验受前置条件阻断、返回装配开工、温度 38 未保存保值、同工序收起、Esc、遮罩、取消确认和保存。1366×768 工单和数量位于不同行（y=259、288.5），灰卡背景各为 rgb(244,246,249)，无横向溢出；1680×920 截图确认完整左侧布局；390×844 抽屉宽 360、页面 scrollWidth 384，无横向溢出，窄屏纵向滚动。

独立质量实例 execution_drawer_quality 发现并复核修复 QF-DRAWER-001（medium）：全屏内未保存切工序时，原确认弹窗挂在 body 而不可见。现传入工作台 rootRef 容器。主实例全屏截图及原生 AX 点击验证确认可见、返回保留温度 39 且恢复入口焦点；再次确认放弃后切至检验，开工仍禁用。独立结果 `qualityResult.result: passed`，该问题 resolved，无阻断项；base/head 为 cb3cfc13ea70951b6d70af55f66dfdfd6e5234a7，知识基线 0.3.12，独立执行范围为源码及 32 项测试，浏览器证据由主实例提供。

临时主题入口已删除，验收页面、13000 网关和 18081 H2 夹具已关闭；原 3000/8081 服务保留。未重跑无关后端全量生产链/迁移门禁，未写开发数据库，未提交、推送或部署。

## 2026-09-14 字段业务用途与工序产出

使用 writing-plans 技能组织本次 L2 切片，延续本功能门禁。用户已确认：产出是当前工序的良品、不良品、报废品合计，来源为生产表单字段，字段需要内置业务用途标识及明确映射。

实施步骤：
1. 表单新增/编辑数字字段及子表数字列可设置业务用途，保存在现有 typeConfig；普通字段默认不参与。保存/重新加载验证配置，修改类型清除不适用用途。
2. 执行服务只读聚合当前工序的快照字段与已保存值，用 BigDecimal 求和；排除 fulfilledBy 的别名表单。缺少三类映射、未填或非法数量时不返回虚假的 0。
3. 当前工序显示产出/目标，目标沿用当前生产对象的目标数量；工序计数已移至批次进度区。表单保存后的响应刷新产出，未保存值不参与。
4. 执行字段配置/序列化、汇总边界、真实 API 保存/重读/快照/审计回归，完成本体与独立质量检查。只在隔离环境验证，不重启或写入现有开发服务，不提交推送。

```yaml
decisionPackage:
  id: DEC-PACKAGE-20260914-EXECUTION-OUTPUT
  scope: production-execution-field-purpose
  knowledgeBaselineVersion: 0.3.12
  summary: 字段用途显式映射当前工序的良品、不良品及报废数量
  confirmed:
    concepts:
      - id: concept.form-field-business-purpose
        name: 表单字段业务用途
        definition: 字段明确标识所承载的生产业务数量用途，不按名称推断
        status: specified
        sourceReferences: [user-confirmed-20260914]
    relationships: []
    rules:
      - id: rule.operation-output-field-purpose
        name: 当前工序产出来源
        status: specified
        trigger: production-execution.query
        condition: {fact: operation.hasQuantityPurposeFields, operator: equals, value: true}
        result: {type: return-query-projection, fields: [goodQuantity, ngQuantity, scrapQuantity, outputQuantity]}
        sourceReferences: [user-confirmed-20260914]
    executionContracts: []
  inferred:
    - id: inference.operation-output-safe-display
      statement: 仅数字字段可标识用途，三类映射完整且所有来源已填非负数字时才展示总数；未保存值不参与。目标沿用批次或SN目标。
      rationale: 防止未知被当作零及未保存数据被呈现为正式产出，不改变开完工条件
      relatedIds: [rule.operation-output-field-purpose]
  unresolved: []
  impactAnalysis:
    level: L2
    directImpacts:
      - area: template-designer
        change: 字段编辑器保存 typeConfig.businessPurpose
        evidenceReferences: [gmp-platform/frontend/src/pages/master-data/template-designer-react/tabs/model/ModelTab.tsx]
      - area: production-execution
        change: 当前工序产出只读投影及展示
        evidenceReferences: [gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ProductionExecutionService.java]
    transitiveImpacts:
      - area: form-binding
        change: 子表列配置随父字段模型保存，作业表单替代直接表单时排除别名重复
        evidenceReferences: [gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ExecutionSnapshotBuilder.java]
    potentialImpacts:
      - area: configuration
        concern: 管理员需避免把同一批产出的明细与小计同时标为数量来源
        evidenceReferences: []
    unaffectedAreas:
      - area: lifecycle
        reason: 不改变开完工条件、状态机、电子签名、批次良品NG报废字段和工单进度
    compatibilityAndMigration:
      - area: model-json
        strategy: 沿用模型JSON存储且无DDL，老字段无标识时不汇总
    snapshotImpacts:
      - area: execution
        change: 用途随fields快照冻结，已开工对象不读取新改模板用途
    auditImpacts:
      - area: existing-audit
        change: 沿用模板设计和表单保存审计，汇总读取不写新审计或派生产量
    permissionImpacts:
      - area: existing-permission
        change: 沿用模板编辑与生产执行权限，不新增权限入口
    testImpacts:
      - scope: form-purpose-and-output
        scenarios: [字段新建编辑类型切换与序列化, 多表单子表汇总与缺值异常, API读写与快照不漂移, UI展示]
        evidenceReferences: [gmp-platform/frontend/scripts/test-field-business-purpose.mjs, gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/ExecutionOutputSummaryTest.java]
    evidenceGaps: [现有3000与8081不保证运行最新后端代码，使用隔离夹具验证]
  extensionStrategy:
    selectedPaths: [configuration, product-core]
    rationale: 复用字段typeConfig及表单保存链路，生产模块负责确定性只读投影
    ownershipBoundaries:
      - owner: template-designer
        responsibility: 维护字段用途
      - owner: production-execution
        responsibility: 解释快照并展示汇总
  affectedFiles:
    - path: gmp-platform/frontend/src/pages/master-data/template-designer-react/tabs/model/ModelTab.tsx
      changeType: update
      reason: 字段用途编辑
    - path: gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ProductionExecutionService.java
      changeType: update
      reason: 工序产出投影
  acceptanceScenarios:
    - id: scenario.operation-output-from-saved-fields
      given: 当前工序表单的三类数字字段已显式标识用途
      when: 保存或重新读取填报
      then: 当前工序产出显示保存值之和并保持既有目标，其他工序与未保存值不计入
      evidenceRequirements: [单元测试, 隔离API持久化及快照检查]
```

本轮验证：前端 TypeScript 通过，28项聚焦测试全部通过，Vite构建10.04s退出0（日志 /tmp/execution-output-frontend-tests.log、/tmp/execution-output-build.log）。最后针对默认用途显示补充 displayEmpty/shrink 后，TypeScript与4项字段测试再次通过（/tmp/execution-output-final-frontend-tests.log）。后端 ExecutionOutputSummaryTest 5项、TemplateModelingControllerTest 40项、ProductionExecutionIntegrationTest 12项（1个按条件跳过的浏览器夹具）合计56通过/1跳过，无失败；/tmp/execution-output-backend-tests.log。单独启用浏览器夹具后正常退出0。

浏览器原始证据由主实例取得，记录 /tmp/execution-output-browser-evidence.md：真实ModelTab数字字段配置PRODUCTION_GOOD，序列化和重载后编辑仍显示“良品数量”；该浏览器保存步骤只覆盖前端模型序列化，模板仓储保存及审计由Controller测试覆盖。真实H2执行API的B01目标50件，填15/2/1未保存时仍显示未知，保存后18/50及三类明细，刷新保持；负值草稿使投影显示异常而不是错误总数，恢复后正确。1366×900实际主题截图核对左侧和填报区。浏览器未重复SN/子表/快照全部场景，这些由自动化测试覆盖。

本体实例 output_field_ontology 返回 ontologyResult.result: updated，知识基线仍0.3.12，仅implemented/internal；正式BusinessKnowledgeModelTest 53项通过。独立质量实例 output_field_quality 返回 qualityResult.result: passed，无 findings 或 blockingConditions；独立执行28项前端回归通过，复核后端及知识测试XML、构建日志、主实例浏览器记录，并核对冻结映射、只读汇总及权限审计边界。结论限于字段用途与工序产出切片，不代表全系统回归或原8081开发服务已更新。

临时验收入口和浏览器页已关闭，13000网关及18081 H2夹具正常结束；原3000(node69275)/8081(java2966)保留。未写原开发数据库，未将后端改动加载至原8081服务，未提交推送。旧模板不自动推断用途，旧执行快照不追溯新用途配置。
