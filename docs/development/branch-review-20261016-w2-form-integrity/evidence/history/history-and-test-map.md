# W2 历史去重、入口及测试性质

本实例为只读辅助，知识基线 0.3.25；来源、目标 `edhr-dev`、实际契约读取均为 `9542cb4cc2071df2c00129cc5dbb4572a245cfa1`，未提交契约路径 `[]`。历史文档为导航线索，本次已回到下列原始源码定位；没有运行 Maven、浏览器、构建、Actions 或数据库，没有修复和仓库写入。没有生成最终质量通过结论。源码阅读为方法及调用链定向抽样，不是全文件语义通过。

## 清单口径

`inventory-verification.json` 以真实 `git ls-tree -r -z` 逐项核对 W2 `coverage.csv`。1606 个路径均可严格 UTF-8 解码，1606 对路径/blob 顺序、集合、去重、基线均完全一致，全部 `pending / inventory-only`。其中内容可严格 UTF-8 解码 1588 个，18 个为非 UTF-8 内容。1606 不能解释为已审文本文件数。

## 历史主 ID 与当前状态

| 原主 ID / 原问题 ID | 当前原始源码证据 | 去重与本批建议 | 已有测试定位及缺口 |
|---|---|---|---|
| AUD-H005 / `discrepancy.form-reference-personal-entry-context-not-forwarded` | `FormFillingPage.tsx:257`、`FormReviewPage.tsx:154` 的 `references(fieldId, keyword, dependencies)` 均将 dependencies 传入 `getExecutionReferences` | 已修，当前源码保护仍在；不重开 PR5/PR6。只说明转发源码存在，未重跑历史验收。 | `scripts/test-form-references.mjs:46` 验证主表+当前子表行依赖值的纯函数；不是个人填报/审批页面网络端到端。W2 如触及该链，应另保真实入口依赖转发。 |
| AUD-H002 / `discrepancy.execution-form-plan-count-and-not-applicable-projection` | `ExecutionFormSelector.tsx:145` 的 `renderForm` 仍以 `instanceIds.length ?? 0` 显示总份数，fallback先检查工序状态；`ProductionExecutionService.java:353 formAvailabilityStatus` 也先判工序非 IN_PROGRESS，再判作业 COMPLETED | 历史描述的源码形态仍在，运行合法触发及当前期望尚待证实；不据此直接宣布新缺陷。与 W2填报来源邻接，修复必须另核 DEC-0047。 | `scripts/test-execution-form-selector.mjs:34` 保计划表可预览、`:84` 完成/未开工作业不提升当前表；这些导出函数/SSR案例不执行私有 `renderForm` 的所有份数文案。服务侧还需有已完成工序+未到达作业表单正反例。 |
| AUD-H003 / `discrepancy.form-fill-settings-missing-mode-default-and-validation-bypass` | `WorkTemplateController.java:183 saveGraph` 仍注入缺失fillMode=DIRECT，`:742 validatePublishableFormProcessReferences` 以字段存在控制全量校验；`FormFillSettingsService.java:24 usesProcess` 空模式返回false | 原历史形态保留；当前运行待证实。属于配置完整性/作业图边界，优先保持W3范围，除非W2根因实际依赖。 | `WorkTemplateControllerTest.java:738 saveGraphPersistsExplicitDirectModeWithoutInferringDormantProcess` 输入只给process引用而断言DIRECT；`FormFillSettingsServiceTest.java:43 savesExplicitDefaultWithoutInferringFromDormantReference`。这些历史断言不是政策来源，修改前须核DEC-0067并先证伪合法触发。 |
| AUD-H004 / `discrepancy.form-process-binding-switch-draft-retains-invalid-exceptions` | `FormFillSettings.tsx:129` 切换仅spread新processID/name；清理例外在`:103`直接配置/`:174`权限保存分支；`WorkTemplateEditor.tsx:2926 updateSelectedNode` merge旧配置，`:4037`切换表单只更新模板信息；后端 `saveGraph` 保存草稿 | 历史源码形态仍在；未做真实流程切换或立即保存复现。保留待证实，不能盲清旧例外或扩大本批。 | `FormFillSettingsServiceTest.java:63 rejectsUnknownFieldAndRemovedPermissionGroup` 保护服务拒绝；不证明前端流程切换行为正确，也不覆盖合法例外保留。 |
| AUD-H009 / `discrepancy.production-work-form-completion-condition-passthrough` | `WorkTemplateEditor.tsx:366 persistentFlowGraph` 只移除临时图状态；`:654 normalizeFlowGraph` 保非CONDITION config；后端 `saveGraph` 序列化节点 | W3候选，当前只重新定位入口；未复核全部条件规则、未重跑，不以历史confirmed-current当新缺陷。 | `WorkTemplateControllerTest` 的saveGraph/条件结构测试可作入口；正式整改须加具体禁止字段写入反例，不能恢复/清理历史数据。 |
| AUD-H010 / `discrepancy.production-work-legacy-condition-save-publish-asymmetry` | `WorkTemplateController.java saveGraph / conditionSourceHandles / validatePublishableConditionRules / hasLegacyConditionConfiguration` | W3候选，未完成新基线行为复验；不混入W2首批。 | `WorkTemplateControllerTest` 已有CONDITION分支/otherwise和边结构测试，不能代替 canonical+legacy 同载荷 save/publish 的对照行为。 |
| AUD-H013 / F-004 | 上批实际修复见 `branch-review-20261016-f004/findings.yaml` 和PR9合并基线 | 已由上批验收、已合并；旧 `history-dedup.json` 的confirmed-current是固定旧审查事实，不回写历史成未发生的新验收，也不重开。 | 上批12浏览器/21后端为历史范围，不能替本批W2测试。 |

设计文档/store及正式投影的当前追溯链没有对应一个已确认的新历史缺陷ID。本次映射是审查入口，不能因为源文件大或历史资产出现projection就建立新finding。

## W2 第一条来源链源码锚点

- `utils/document.ts:345 parseReactTemplateDesignerDocument` 读取 model/canvas/workflow 三片；`:360 serializeTemplateDesignerDocument` 分别以 `edhr-template-designer-react` version1包裹，保留完整各slice。
- `store/useTemplateDesignerStore.ts:1888 pushDocumentHistory` 是完整document历史壳；`:1934 setProjectionBindings` 也进入此壳；`:3306 undoCanvasChange / :3319 redoCanvasChange` 交换完整document；`:3481 markSaved / :3485 isDirty` 比较完整JSON。
- `FormInstanceRecordService.java:39 saved` 以tenant+object+operation+copy保存实例，保存最新values/stage，`:91`刷新过程追溯索引，`:92`仅COMPLETED调用正式projection；这是真实源码调用关系，不是本实例已运行的事务证明。
- `FormProjectionService.java:21 completed` 从冻结form/value/context建立source_json并入outbox；`:43 process` 从持久source运行解释器写正式记录，不从当前模板重读。还须主侧通过合法完成与失败回滚测试证实。

## 大模块具体拆分方案（仅方案，不实施）

复用原结构报告S04，当前上述symbols仍同形，不因行数安排大重构。

1. 第一小批只将 `sheetCoordinates.ts` 的纯坐标/范围变换，与 `sheetDocumentCommands.ts` 的 page+command→完整nextPage 操作分开。`set(state => pushDocumentHistory(...))` 继续是store唯一命令提交者。每一用户操作只推一次history，selection与document一起返回，不拆成互相调用的多个Zustand slices。
2. 第二小批把 `createBoundNodeFromField:1617` 所需的默认节点工厂/label/schema metadata 从value循环 `store:22 → componentRegistry → store` 拆到无React/store依赖的 `registry/componentNodeFactories.ts`。registry只负责拼装factory+renderer，store只引用factory；每个component旧新默认值、ID前缀、只读、必填和空值等价，禁止复制第二套registry。
3. 序列化 `utils/document.ts` 保持唯一持久协议，model.projection、主/子表fieldId、真实row身份、canvas绑定、workflow片段不得被提取时重建或丢弃。保存/重读、复杂子表一次undo、redo清空、50项history上限、导入保pageID需characterization保护。无真实缺陷依赖则留W6按批实施。
4. 追溯/统计不另建通用引擎：`FormInstanceRecordService` 保实例/事务编排，`FormTraceIndexService` 保保存内容索引，`FormProjectionService` 保正式完成冻结outbox。若需提取，从纯来源快照构造函数开始；不将保存、索引、完成outbox拆到异步或REQUIRES_NEW事务，不用统计行替代过程索引，不以数组位置代rowKey，不推定A12修订政策。

## 主侧首批建议运行的六条命令（本实例均未运行）

工作目录 `gmp-platform/frontend`：

1. `node --test scripts/test-projection-panel.mjs scripts/test-field-business-purpose.mjs scripts/test-sheet-cell-transfer.mjs scripts/test-quick-sub-table.mjs` —— 真实esbuild加载生产store/纯函数的Node行为测试，包含source配置history、序列化及一次undo；不是浏览器或HTTP E2E，也非源码正则。
2. `node --test scripts/test-runtime-row-values.mjs scripts/test-execution-form-values.mjs scripts/test-form-references.mjs` —— 真实生产函数行为测试，覆盖新行身份/默认、数字传输、主子表引用context，不能证明后端权限或最终完成。
3. `node --test scripts/test-form-document-preview.mjs scripts/test-projection-source-editor.mjs` —— 真实组件SSR输出及部分直接callback/纯函数行为，覆盖只读/签名/实际行与来源配置；不是实际浏览器focus/拖拽/网络保存。
4. `node scripts/verify-template-designer-react.mjs` —— 混合检查：大量路径/includes/正则静态契约，加真实esbuild加载Excel导入、子表/Word纯函数和store行为；不能将全部统计为浏览器场景或纯静态正则。

工作目录 `gmp-platform/backend`：

5. `bash /workspace/.edhr-cloud-tools/mvn-edhr -o -Dtest=ProductionExecutionFormValuesTest,FormTraceIndexServiceTest,FormProjectionInterpreterTest,FormInstanceRecordStageTest test` —— JUnit直接生产引擎/解释器/提取函数与Mockito权限替身，不访问真实DB；需报告0 skip才可计入实际运行。
6. `PROJECTION_TEST_DATABASE_URL=jdbc:postgresql://localhost:5432/edhr_projection_integration_test bash /workspace/.edhr-cloud-tools/mvn-edhr -o -Dtest=FormTraceIndexPostgresTest,FormProjectionPostgresTest test` —— 在已确认可用的独立测试数据库中建随机schema并清理的真实PostgreSQL行为/回滚/并发/冻结来源测试；不是Spring管理HTTP E2E，环境变量正则不满足时会skip，skip不得当passed。数据库不存在时先走既有隔离环境准备，不指向业务库或降低环境限制。

这些命令按实际缺陷影响选用，不要求为了计数全跑。A12变更/作废、数量下限、长期记录本、自由文本实体解析、表头共享、复杂OR/跨子表组合仍遵守现有暂缓或未决边界；本辅助没有改写政策、成熟度、数据或历史记录。
