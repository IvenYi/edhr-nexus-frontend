# W2 runtime-contract：只读盘点、历史去重与方法范围

本实例为临时只读技术辅助，不是质量验证或业务知识本体角色，不参与开发。结论是源码/Git核对及候选检查点，不是运行验收，不据此宣布完整W2或全分支完成。

## 固定基线与实际读取

- sourceCommit / targetCommit / contractReadCommit：`b191e054892ae06cb0d8a45f62d034deabbba3e3`；targetBranch：`edhr-dev`；uncommittedContractPaths：`[]`。
- 工作分支：`audit/edhr-dev-w2-runtime-contract-20261018`。开始时工作树干净；本实例没有修改任何仓库文件。
- PR14合并提交b191e054与批准交付`1246cda13aca6ae5a5f98c3b7a5bf79f58f4b26e`的树均为`c18e8b782a1a9d85b4435673f86a8e227e6d88ef`；两者`git diff --name-status`为空。
- 前批基线37bc05ec→b191e054的AGENTS.md、codeplzreadme.md、docs/agents、docs/knowledge、docs/architecture和根/前端DESIGN.md增量为空。生产差异仅PR14 store同步及其2个测试入口；旧材料不作为本轮运行通过。
- 实际读取AGENTS.md、codeplzreadme.md、统一交接契约、共享NEXT、知识README当前基线头、全部open-questions；相关原始DEC-0067、rule.form-reference-runtime；历史history-dedup、各W2批source-map/findings和S04具体方案。
- 知识基线：`0.3.25 / schema 1.2.0`。未修改知识，未提升成熟度或阶段。

## 固定分母

`git ls-tree -rz --full-tree b191e054...`获得1931个tracked路径/blob，无Git submodule条目。CSV列为`baseline_commit,path,source_blob,review_status,review_depth`，1931行全部`pending / inventory-only`。UTF-8无BOM，标准CRLF，路径按Git原始UTF-8解码而非转义显示。旧CSV未覆盖、未改状态。此分母包括代码、文档、测试和证据；不是1931文件已深入审查。

## 历史去重及边界

| 原记录 | 当前处置 | 本次源码/原报告锚点 |
| --- | --- | --- |
| W2-F001 保存请求A完成后B被误标已保存 | PR10已合并，不重开 | Shell.persistCurrentDocument保存捕获currentDocument并markSaved(currentDocument)，而非无参标记最新文档。 |
| AUD-H002 计划份数/未到达FORM状态 | PR11已合并，不重开 | 旧availability批范围及原独立报告保留，不能用本次盘点重计运行通过。 |
| W2第三批保存→过程索引/完成正式投影及W2-C001旧rowKey线索 | PR12已合并，不重开 | 原173 Java/13 Node只属第三批；新保存prepareDesign已移除rowKeyFieldId。旧冻结配置不自动迁移。 |
| W2-F002 插列节点几何未动；W2-T001过期组件测试入口 | PR13已合并，不重开 | 前批明确修复和原验收保留，本轮不统计为新缺陷。 |
| W2-C002→W2-F003 子列embedded定义未同步 | PR14已合并，不重开 | b191合并树精确相同。当前文档写路径同步，不回填已保存旧模板/执行快照。status同步不产生新的隐藏/删除政策。 |
| AUD-H005 个人填报/审批未转发引用条件 | 旧PR5/6已修，不重开 | FormFillingPage/FormReviewPage转发回调的历史结论只作索引；本轮可核对相邻消费但不能重报同一旧问题。 |
| AUD-H003 缺fillMode推导DIRECT | W3保留，不当作W2新发现 | 当前WorkTemplateController.saveGraph:183/198仍补DIRECT；FormFillSettingsService和frontend form-fill-settings/types.ts仍有默认分支。DEC-0067-01/05明确新配置显式选择。当前已知差异不因源码存在改写为政策。 |
| AUD-H004 切换流程后旧字段例外留在草稿 | W3保留 | FormFillSettings.tsx:129选择新流程仍spread原value；原permission/eventBindings清理边界按历史记录。没有本次真实交互复现。 |
| AUD-H009 非支持completionCondition透传 | W3保留 | 历史WorkTemplateEditor.persistent/normalizeFlowGraph与saveGraph完整nodes持久化；不得借纯提取清理历史数据。 |
| AUD-H010 旧condition字段保存/发布不对称 | W3保留 | saveGraph只做图边界/出边校验；validatePublishableConditionRules:547通过hasLegacyConditionConfiguration:616拒绝旧字段。未运行当前候选测试。 |
| A12与两项旧DHR high | 依用户确认暂缓/open | 不实现变更/作废生效、主动通知及依赖上游的并发联调；不恢复历史数据，不计关闭。 |

共享NEXT中的“W2历史fillMode/条件”是导航措辞；不能据此把已明确分配给W3的H003/4、H009/10悄悄转入本批修复。W2可先核对同一当前设计文档的字段引用查询条件、模拟/正式renderer值上下文及保存重读；它们与作业条件AST不同。

## 实际源码方法映射与本批候选

以下路径若以`designer/`开头，指`gmp-platform/frontend/src/pages/master-data/template-designer-react/`；行号固定本基线。只声明所列方法/分支被阅读，没有整文件深入覆盖声明。

| 环节 | 实际已读方法/分支 | 观察、下一项可验证边界 |
| --- | --- | --- |
| 三片文档编码 | designer/utils/document.ts safeParseJson:21、isReactTemplateDesignerPayload:31、normalizeFieldType:96、normalizeModelField:124、normalizeModelState:156、normalizeCanvasPage:282、parse:345、serialize:360 | 原schema字符串识别；model做类型/config归一化，canvas保留绑定；workflow独立slice；serialize逐片JSON。候选：新建合法字段/绑定/条件，serialize→真实保存响应→parse后配置与ID一致。旧config字段兼容存在不等于允许运行中全域历史迁移。 |
| 保存所有者 | designer/TemplateDesignerReactShell.tsx 初始化effect、persistCurrentDocument:102、handleSave、handleFieldConfirmPersist、handleClose；TemplateModelingPage.tsx saveDesignerPayload:1252及手动/自动mutation | Shell捕获同一currentDocument，成功只markSaved该对象；页面共用saveFormTemplateVersionDesign。候选应是API返回后的三片一致性，而非重复PR10受控回调竞态。 |
| 后端保存 | template/controller/TemplateModelingController.java saveFormTemplateVersionDesign:230；template/service/FormLookupCatalogService.prepareDesign:248 | 版本归属读取、事务内model prepareDesign、canvas/workflow原始slice、save+audit；model投影校验/lookup snapshot单独处理，不保证任意旧embedded自动修复。候选：当前合法模型通过保存后重读原身份及类型/配置，事务/audit适用范围单列。 |
| 引用配置命令 | frontend/src/components/form-renderer/referenceConfig.ts referenceConditions:5、resolveReferenceField:10、syncReferenceConfig:20 | widget覆盖sourceType/referenceField/referenceQueryConditions，命令同步model和所有页同字段placement/embedded。候选：配置一个主/子表引用字段并放置多处，更新后保存往返仍相同，一次undo完整恢复；不要新增未确认引用类型或复杂OR。 |
| 查询依赖值 | 同文件referenceDependencyValues:42、mockReferenceValues:46、updateMockFieldValue:62 | 查询依赖按targetFieldId取值；mock从主表placement+当前子表record前缀组装，主字段重复放置同步值。候选：主表依赖/同实际子表行依赖、不串行、缺值不放宽查询、重复放置值一致。只读未证明当前缺陷。 |
| 模拟纸面 | designer/components/mock-fill/MockFillDialog.tsx resolveBoundField:179、FormSheetPage.renderFieldNode:1016、handleValueChange:1431 | embedded优先，renderFieldNode传mockReferenceValues；不是通用列表renderer。PR14已修当前编辑同步，不能从相邻差异再次宣称旧bug存在。 |
| 完整纸面运行 | designer/components/form-preview/FormDocumentPreview.tsx bindFormPreviewField:25、changeRowCount、renderField:66 | 同一table行值与主表值合并为referenceValues；readOnly守卫、签署权限和表单字段身份保留；reference通过resolveReferenceField进入FormRuntimeField，其他控件沿原mock控件。候选：与mock/list查询依赖一致、readonly不写入、实际rowId保留。 |
| 列表/精简纸面 | frontend/src/pages/master-data/DhrTemplateWorkspaceDialog.tsx FieldListPreview:886、FormCanvasPreview:1021、PreviewField:578 | 列表用当前model字段；fullPage直接FormDocumentPreview，非fullPage的Word/Sheet有另一支路。disabled字段列表过滤不能推导纸面同政策。候选按真实生产调用fullPage与layout区分，不把未实际调用支路当生产必经故障。 |
| 通用字段/引用组件 | frontend/src/components/form-renderer/FormRuntimeField.tsx FormRuntimeField、RuntimeSubTable:58、RuntimeReference:96 | 子表列取canonical parent.columns，行referenceValues合并主表和实际行；引用条件不完整/缺值、200ms请求、effect清理、配置变化deps分别存在。候选：实际交互请求载荷与最终提交同字段/同行；不能只做SSR证明异步完整正确。 |
| 冻结引用解释 | backend template/service/FormReferenceConfig.java fields、resolveFields、collect | 从同一个冻结form.fields/canvas读取widget，多个placement配置不一致明确阻断；不抓最新模板。候选：新保存→冻结→主/子表lookup与完成validate同配置；多placement冲突拒绝、原快照不回写。 |
| 真实查询/校验 | backend template/service/FormReferenceLookup.java query/search/validate；production/service/ProductionExecutionService.references:105 | source白名单、条件完整性、四运算符、空值AND1=0、参数化查询；validate按id/name及可选sourceType/code核对。ProductionExecutionService先get授权view，再从冻结fields查引用字段，交access.references。候选：模拟与正式允许/拒绝、无权来源及最终失效引用拒绝；本实例没有实际数据库或权限验证。 |
| 执行配置冻结 | backend production/service/ExecutionSnapshotBuilder.java build选定forms/works读取、attachFillSettings:139 | 工序fill_settings与作业FORM config传入同一attach；PROCESS冻结已发布流程，DIRECT冻结entryConfig，未读取当前运行后的新模板。此映射只说明消费者，不解决H003默认模式差异或全START并发矩阵。 |

建议本批先选“当前文档引用配置→三片保存重读→mock/完整纸面/列表取同一字段及行依赖”中的一个最小链。有合法触发与可重复红证据再立新缺陷ID；无确定问题则记录实际方法范围和正反向验收，不为通过质量结果改业务规则。若扩展到fillMode/作业条件或权限/签署，主审应明确转W3范围并重新评估门禁。

## S04具体拆分边界（提案，未实施）

1. `store/operations/sheetCoordinates.ts`拥有纯坐标/范围位移；`sheetDocumentCommands.ts`输入page+命令、返回完整nextPage与selection。先做等价性characterization，再移动，不能把一条命令拆成多个set/history。
2. `fieldBindings.ts`拥有当前document/fieldId/patch到model、各page placement及embedded的对齐；引用配置继续复用referenceConfig，不新增第二个策略所有者。store继续是唯一完整document历史提交者，保护ID/projection/rowKey/readonly/布局、一次undo、redo清空及50条上限。
3. 独立后续切片提取`registry/componentNodeFactories.ts`，无React/store，只输出默认node/label/schema metadata；registry组装renderer，store依赖factory，解除store→registry→store值循环，不另造重复registry。
4. `utils/document.ts`继续拥有唯一三片持久协议；生产实例/trace刷新/正式outbox继续原事务所有权。无迁移、无新的业务规则；逐批可revert。验收覆盖每组件默认值等价、导入页身份、保存往返和复杂命令完整undo/redo；不以长文件行数强制拆分。

## 本实例实际验证范围

执行的仅是只读文件/Git对象检查、清单生成及SHA256/bytes核对。没有运行Node/Maven测试、构建、浏览器、数据库、GitHub Actions；没有切换分支、worktree、commit、push、merge、deploy、仓库文件修改或数据恢复。不提供qualityResult/ontologyResult，不能以本报告替代专业最终结果。所有源码线索仍需主审的合法红绿复现及适用独立验收。
