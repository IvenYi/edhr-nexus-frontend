# 反向追溯查询布局与8087运行核验

当前验收范围以文末“追溯日期与纯内容反向查询”节为准；前文记录此前各轮实际验证，不代表仍保留已撤下的归属区域或八项清单。

沿用 DEC-PACKAGE-20260929-FORM-PROJECTION，知识基线0.3.24，起点4deac511b76d113dcde5233ec6c88d76e8bd9950，执行L2。用户授权重新构建并重启8087，验证关联读取、预览、解除与预置；授权查询区域重新设计并将添加查询条件默认隐藏。只用独立虚构配置验证写动作，不解除客户原有配置。

```yaml
decisionPackage:
  id: DEC-PACKAGE-20260929-FORM-PROJECTION
  scope: trace-query-layout-and-runtime-verification
  knowledgeBaselineVersion: 0.3.24
  summary: 仅表单与DHR的反向查询区域分组并默认隐藏添加条件，正向保持原布局；重启8087验证既有配置解除
  confirmed:
    concepts: []
    relationships: []
    rules:
      - id: DEC-0075-40
        statement: 保留八项预置、三项默认、其余固定展开；自定义条件添加入口默认隐藏。查询区域获准不沿旧布局规范重新设计，页签仍沿现有形式。
      - id: DEC-0075-41
        statement: 自定义项先解除配置再删除，历史内容保留；关联列表勾选或全选解除，预览定位字段。
    executionContracts: []
  inferred:
    - id: inference.trace-query-grouped-layout
      statement: 展开区分其他预置、自定义条件和真实属性，收起保留值并显示额外非空条件数量；隐藏条件校验失败时展开。
      rationale: 减少常态高度，同时防止隐藏过滤被忽略；两追溯页共用组件。
  unresolved: []
  impactAnalysis:
    level: L2
    directImpacts:
      - area: trace-query-ui
        change: TraceQueryPanel反向布局、默认隐藏添加条件、展开与条件反馈；正向保持原布局
        evidenceReferences: [gmp-platform/frontend/src/pages/reports/TraceQueryPanel.tsx]
      - area: local-runtime
        change: 重建并以原projection配置重启8087
        evidenceReferences: [gmp-platform/backend/src/main/resources/application-projection.yml]
    transitiveImpacts:
      - area: form-and-dhr-trace
        change: 两页面共享布局，提交协议与匹配规则保持
        evidenceReferences: [gmp-platform/frontend/src/pages/reports/DhrTraceReportPage.tsx]
    potentialImpacts:
      - area: hidden-filters
        concern: 隐藏的非空筛选必须可感知，收起不清空，失败自动展开
        evidenceReferences: []
    unaffectedAreas: [业务统计固定查询, 生产流程, 签名, 真实归属, 查询匹配粒度]
    compatibilityAndMigration:
      - 不新增或改写迁移；核对0108/0110/0112已执行与最终八项预置
    snapshotImpacts:
      - 测试解除仅操作本轮虚构模板，不触碰已保存实例或DHR快照
    auditImpacts:
      - 既有解除接口更新模板审计，实际测试核对，不改审计语义
    permissionImpacts:
      - 不改权限，绑定列表/预览/解除沿既有system.edit与模板权限
    testImpacts:
      - scope: trace-and-catalog
        scenarios: [8087接口恢复, 八项预置, 读取预览单选全选解除, 收起展开保值, 日期数字输入, 表单与DHR查询, 窄屏]
        evidenceReferences: []
    evidenceGaps:
      - 客户长期使用体验与生产规模性能不作为本轮验证结论
  extensionStrategy:
    selectedPaths: [product-core]
    rationale: 既有共享追溯查询组件局部调整，无客户分支或新查询模型
    ownershipBoundaries:
      - owner: reports-ui
        responsibility: TraceQueryPanel布局及反馈；请求和匹配契约保持
      - owner: ontology
        responsibility: 原位纠正旧查询布局限制，保留原始证据
  affectedFiles:
    - path: gmp-platform/frontend/src/pages/reports/TraceQueryPanel.tsx
      changeType: update
      reason: 分组及默认隐藏添加入口
  acceptanceScenarios:
    - id: scenario.reverse-trace-progressive-query
      given: 八项预置和自定义文本数字日期目录
      when: 打开反向、展开、添加条件再收起并查询
      then: 默认只显示三预置，无添加入口；展开清晰分组且能添加；收起保值并提示额外条件数量，提交类型和命中规则保持
      evidenceRequirements: [真实浏览器, 前端构建]
    - id: scenario.8087-catalog-binding-recovery
      given: 原3007前端仍代理8087
      when: 重启后读取关联与预览，解除本轮虚构配置
      then: 接口正确返回，字段定位准确，解除持久化且原数据保留，八项预置不可删除
      evidenceRequirements: [接口响应, 真实浏览器, 数据库审计]
```

本轮知识阶段仍P0/in-progress，不引入P1查询图或推理器。原始证据来自运行进程、后端日志、源码与本轮浏览器；既有报告仅定位线索。用户对布局权限与添加入口隐藏为user-confirmed，分组、计数与收起保值为inference工程选择。

同包主决策文件 `form-traceability-projection-decision-package.yaml` 的顶部、directImpact、测试场景和TraceQueryPanel说明也原位清理此前“严格复用旧查询布局/默认按builtin全部展示”的陈旧解释，记录当前八项/三默认/五展开/添加默认隐藏及本轮运行核验；Ruby YAML和diff检查通过。不重开业务问题或新增DEC。

## 本轮基础验证

重建日志 `/tmp/trace-query-8087-build.log` 成功，以原projection配置和同一库重启8087，PID15247；新日志 `/tmp/trace-query-8087-backend.log` 在21:58:44确认启动。3007仍代理8087，未改代理、上传路径或数据库。原虚构灭菌锅次读取返回一项关联，已恢复接口而非补建数据。Liquibase启动无待执行变更，SQL确认0108/0110/0112为EXECUTED，API确认最终八项预置。

主开发78项后端测试（19目录PostgreSQL、59知识）、另5项目录权限测试通过，无跳过；35项前端投影来源/面板/预览/报表/导航回归和npm run build通过。日志 `/tmp/trace-query-backend-tests.log`、`/tmp/trace-query-auth-tests.log`、`/tmp/trace-query-frontend-tests.log`、`/tmp/trace-query-frontend-build.log`。不把错误测试类名的未执行项计入结果。

3007真实浏览器创建独立虚构项lookup_385820202941353984及模板385820203016851456/version385820203033628672，三个来源为主表main_a、main_b及details/lot。首次旧测试源只有空layers版式，预览正确提示未放置；之后只为新虚构模板复制既有有效虚构版式。实际主表main_a与details/lot分别唯一高亮，返回保留勾选，逐项解除3→2后全选2→0。API前后字段、canvas、workflow相等，production goodQuantity配置保留；SQL存在两次解除对应模板UPDATE审计。未解除原有客户配置。截图 `output/playwright/trace-8087-main-preview.png`、`trace-8087-sub-preview.png`。

布局经真实截图核对：默认三项同宽、底部动作同一行；展开预置连续，随后自定义及真实属性分组，日期起止并排。截图 `output/playwright/trace-query-collapsed.png`、`trace-query-expanded.png`。进一步类型/窄屏及独立质量验收在本报告追加，不复用上一轮门禁。

实际收起后提交数字1.00及2026-10-14～14，filters/dateRanges保持正确，表单返回1且按钮显示“更多条件（2）”；改日期到第二行15返回0，保持同实际行语义。逆序日期触发自动展开，主开发发现旧Alert位置会落在屏幕下方，已移到三项常用条件之后再实际核验1024视口内top=341可见；该修正不改校验规则。1024下数字同行输入、日期上下两行、移除按钮完整显示，日期范围字段均可操作。DHR同组件默认三项、添加隐藏核验完成。截图 `trace-query-hidden-active.png`、`trace-query-1024.png`、`trace-dhr-query-collapsed.png`，最终构建 `/tmp/trace-query-frontend-build-final.log` 通过。

补充设计技能静态审计：`audit_project.py --mode strict` 报26项现存全局问题，全部位于本轮未改的页面/组件/样式；无TraceQueryPanel发现。遵循仓库精准修改要求不扩大为全系统规范重建，也不声明全项目premium审计通过。静态证据 `/tmp/trace-query-premium-audit.json`。现有维护设计来源为docs/frontend/list-page-guidelines.md与docs/design-audit/vue-admin-plus-ui-style-constraints.md；本轮只获得查询区布局例外，无全局字体、颜色、壳层改动。

## 最终门禁

本体实例trace_layout_ontology_20261014返回updated：7项知识资产原位修正、183 YAML解析与bootstrap通过，基线保持0.3.24，无冲突或未决问题。主开发另外核对主决策包4处说明与本轮确认一致。

全新独立质量实例trace_layout_quality_20261014返回passed，无findings或blockingConditions。独立执行83项后端、35项前端及最终构建通过，无跳过；最后主决策包修改后再执行59项知识测试通过。日志 `/tmp/trace-layout-qa-back-final.log`、`/tmp/trace-layout-qa-knowledge-final.log`、`/tmp/trace-layout-qa-front.log`、`/tmp/trace-layout-qa-build-final.log`。独立3007实测关联/预览/解除，QA虚构项lookup_385823476281053184/template385823542651719680/version385823542651719681的3→2→0解除、保真及两笔审计385823854250758144/385823921791635456通过。未登录401、预置删除400也核验。两页初始三项/Add隐藏、类型控件、保值计数、逆序提示、重置/方向切换和1024无横向溢出通过；数字1+date15表单0/DHR1，匹配粒度未变。QA窄屏截图 `output/playwright/trace-layout-qa-dhr-1024.png`。两独立浏览器均已关闭，8087仍运行；测试虚构目录与模板保留供复核，追溯关联均已解除。

```yaml
executionLevel: L2
ontologyResult:
  result: updated
  baselineBefore: 0.3.24
  baselineAfter: 0.3.24
qualityResult:
  result: passed
  baseCommit: 4deac511b76d113dcde5233ec6c88d76e8bd9950
  headCommit: 4deac511b76d113dcde5233ec6c88d76e8bd9950
  workingTreeState:
    status: dirty
    includedPaths: [TraceQueryPanel.tsx及本报告所列知识与决策资产]
    excludedPaths: [output/, gmp-platform/frontend/output/]
  knowledgeBaselineVersion: 0.3.24
  findings: []
  blockingConditions: []
```

上述简表索引独立实例完整结构化结果，不用相同HEAD冒充工作树未修改。未执行全系统回归、生产规模性能与长期客户体验测试；既有全局UI审计问题和通用模板GET权限风险保持另行范围，不宣称本轮整体加固或完整MVP验收。无当前范围未决问题。

## 正向布局越界修正

用户指出只授权反向改版。此前共享组件将新底栏及属性分组同时应用到正向，属于实现越界，上一轮验证没有识别这一范围错误。现以4deac511原始代码为依据，在同一组件中分开渲染两方向：正向恢复p:2、两项常用条件与同行操作、展开后产品编码在首行第三格、其余字段原顺序以及原展开/收起按钮；反向保持新布局和默认隐藏添加入口。

同一决策包增量修正按L1：直接影响表单/DHR正向展示与展开；相邻风险是共享动作和方向切换影响反向；请求、匹配语义、权限、数据库、快照、审计无改动，extensionStrategy仍为product-core、所有权为reports-ui/TraceQueryPanel。无真实业务未决问题；ontologyResult.result为not-applicable，本次仅恢复已存在界面，不改变任何业务概念或规则，现行DEC-0075-39/40本已明确授权反向范围。若发现接口或数据问题须升级，当前未触发。

主开发7项报表/导航聚焦测试及前端构建通过，证据`/tmp/trace-forward-restore-tests.log`、`/tmp/trace-forward-restore-build.log`，diff检查通过；未重跑无改动的后端与全系统测试。独立质量只验本次修正和邻接反向行为，不复用上一轮通过结果。

独立实例trace_forward_restore_quality返回qualityResult.result: passed，基线0.3.24，base/head仍为4deac511，范围为TraceQueryPanel及本报告工作树修正；无发现或阻塞。独立7项测试通过；3007表单/DHR正向折叠同行、展开产品编码第三格与原字段顺序、1024无溢出、实际FORWARD请求参数通过，两个页面反向三项默认/Add隐藏及展开分组保持。截图`output/playwright/forward-restore-qa-form-collapsed.png`、`forward-restore-qa-dhr-expanded.png`、`forward-restore-qa-dhr-1024.png`、`forward-restore-qa-dhr-reverse.png`。自有浏览器已关闭。本次不重跑后端、数据库及全系统回归。

## 追溯日期与纯内容反向查询

2026-10-14用户确认撤下反向归属区域，不加范围浮层，并明确选择新增不可删除的预置“追溯日期”：date型，由制表人绑定实际业务日期，不自动取创建时间，固定放展开区。默认仍前三项，共九预置/六展开；自定义日期独立保留。正向布局、结果实际归属展示和查询匹配规则不改。

同一decisionPackage增量impactAnalysis为L2（初始化迁移）：直接影响目录初始化、日期绑定候选、表单/DHR反向范围控件；传递影响为dateRanges和隐藏条件计数。extensionStrategy为product-core，所有权template-catalog及reports-ui。不改变后台兼容查询协议，反向UI提交properties为空；权限、审计、生产执行、快照不变。0113仅插lookup_trace_date/date/builtin，可重放，原迁移不改，不合并或重写自定义日期和实例证据；同名自定义项受既有唯一约束保护，不能静默覆盖。潜在风险是固定日期被当文本提交、被误用创建时间、方向切换遗留值、展开后挤掉列表；验收覆盖相应场景。无业务未决问题；其他日期类型与时分秒不扩展，本轮复用日历日期闭区间和单边范围（工程inferred）。

主开发29项后端测试（21目录PostgreSQL、5权限、3日期条件）通过，含新增预置日期保护/绑定/命中/无创建时间回填、增量迁移重放保留自定义数据；35项前端回归及构建通过。本体更新后59项知识测试通过。日志`/tmp/trace-date-backend-tests.log`、`/tmp/trace-date-frontend-tests.log`、`/tmp/trace-date-frontend-build.log`、`/tmp/trace-date-knowledge-tests.log`。重建日志`/tmp/trace-date-backend-build.log`，8087按原projection参数重启为PID38463，`/tmp/trace-date-8087-backend.log`确认0113执行成功及启动完成。3007未改代理。

初步真实视觉截图`output/playwright/trace-date-expanded.png`已查看：1440×900展开九项及添加入口后，列表表头和多行可见；无归属区域或空分组。后续实际交互及独立质量结果另记，不复用前轮通过。

主开发进一步实际提交2026-10-14～2026-10-14：请求为REVERSE、properties为空、dateRanges.lookup_trace_date含from/to；收起后保留日期条件并显示数量1。当前运行样例未绑定新增预置，因此返回0，正命中由隔离PostgreSQL测试验证，不以该空结果冒充正命中。1024×768展开截图`output/playwright/trace-date-expanded-1024.png`已实际查看，日期起止可操作，列表表头和两行仍可见。主开发trace-date-root浏览器已关闭。

本轮L2完成门禁：trace_date_ontology返回ontologyResult.result: updated，知识基线0.3.24原位替换现行规则，无冲突或未决问题；全新独立trace_date_quality返回qualityResult.result: passed，base/head为4deac511b76d113dcde5233ec6c88d76e8bd9950，验收当前dirty工作树，无findings或blockingConditions。独立88项后端与知识测试、35项前端回归及构建通过，日志`/tmp/trace-date-qa-backend.log`、`/tmp/trace-date-qa-frontend.log`、`/tmp/trace-date-qa-build.log`。实际运行库0113为EXECUTED、目录九项及日期类型正确；两页闭区间/单边日期、收起保值计数、逆序提示自动展开、重置和方向切换清空、正向原布局均通过。1440与1024真实截图已查看，1024表单表头top=624、首行top=672/bottom=712，无页面横向溢出。证据`output/playwright/trace-date-qa-form-1024.png`、`trace-date-qa-dhr-1024.png`、`trace-date-qa-dhr-1440.png`。独立浏览器已关闭，未修改客户业务数据。

验证边界：共享运行环境没有绑定新增预置的现成正命中样例，正命中和无创建时间回填由隔离PostgreSQL测试覆盖；未执行全系统、生产规模性能或长期体验验证。本轮未提交或推送代码。
