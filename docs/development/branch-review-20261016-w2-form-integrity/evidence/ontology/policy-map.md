# W2 定向知识边界核对

基线：`9542cb4cc2071df2c00129cc5dbb4572a245cfa1`，`knowledgeModelVersion: 0.3.25`。来源、目标 `edhr-dev` 与实际契约读取提交相同；未读取任何未提交的契约修改。仅核对当前 W2 切片所需的规范与原始方法入口，不执行质量验收、全库本体审计或生产数据操作。相关文件摘要见 `source-evidence.json`。

## 已确认规则

| 范围 | 权威声明 | 当前准确含义 |
| --- | --- | --- |
| 同一配置与历史 | DEC-0077-22；scenario.form-projection-independent-canvas-panel | 画布、字段与查找统计侧栏共用来源配置、保存和撤销；切换不丢当前选择和未保存修改。原始确认位于 evidence/form-traceability-projection-ownership-user-confirmed.md 的“2026-10-05 同一画布内独立查找与统计侧栏”。 |
| 使用时冻结 | DEC-0077-12 | 工序及作业表单在首次 START、执行中自定义表单在 ATTACH_FORM 复制当时映射。后改当前模板不得回写已形成执行、源表单或正式投影；不新增投影专属发布/禁编规则。 |
| 草稿与完成 | DEC-0077-07/30 | 草稿 SAVE 不因字段完整性或投影业务校验阻断；认证、来源授权、字段权限、请求格式、证据和签署安全保留。最终完成仍校验必要业务数据和配置，完成及待投影事件同事务持久化。系统处理故障可靠重试，不撤销已经成功完成；下游正式结果依赖等待投影成功。 |
| 过程追溯 | DEC-0077-17/29/33/39 | 最近成功保存或暂存内容可按来源授权查到，涵盖草稿、填报、审批及完成并显示状态；未保存输入不参与。表单主表条件同实例，子表条件同实际行；DHR 条件可由同一 DHR 的不同真实关联表单贡献。正向真实属性查询不要求内容用途。 |
| 正式来源 | DEC-0077-38 | 过程详情读取最近保存值；正式业务记录读取最终完成冻结的来源，而非最新模板或当前填写值。稳定 rowKey 用于所显示快照的实际行；缺失/重复身份不猜测高亮。 |
| 字段权限 | DEC-0034-01/02/03；rule.form-process.binding-field-permission-inheritance | 权限以模板版本与稳定 fieldId 解释，第一版 EDIT/READ_ONLY；共享表单渲染器呈现；后端重校版本、真实字段及当前用户资格。字段无例外时继承所属权限组默认权限，绑定例外不回写可复用流程。DEC-0034-04 的数组对象/未知 fieldId 诊断属于 inference，不是新增用户业务规则。 |
| 批号与单位 | DEC-0077-31/32 | 物料批号与统计单位允许没有来源或空值；不补造批实体/单位、不换算、不以相同字符串建立实体关系。普通字段自身 required 仍有效。空单位只在用途、实际对象、工序、适用物料与批号完整粒度内隔离合计，不与有单位组混加。 |
| 正式产出数量 | DEC-0077-13；DEC-0078-01 至 07 | 最终完成且正式投影成功才累计；实际多份/多行可累加，技术重试幂等，工序完工不二次加数。每具体制程零或一个最终节点，批次只取该冻结节点，工单只汇总真实所属批次。无数据不当真实零；正式真实零可显示。最终节点空/异产品单位保留事实、待核对且不并入权威累计；普通工序单位分组仍可保留。旧实例不补算，不改质量公式或生命周期。 |

上述 DEC 文件的成熟度保持原状态；本轮只读核对不把 specified/implemented 提升为 verified，也不发布 runtime 知识。

## 原始实现入口

- `TemplateDesignerReactShell.persistCurrentDocument`：捕获当前文档并序列化三份 slice，请求成功后调用 store 保存确认；`handleClose` 依赖 `isDirty` 决定未保存提示。
- `useTemplateDesignerStore.pushDocumentHistory / setProjectionBindings / undoCanvasChange / redoCanvasChange`：文档、来源映射进入统一文档历史；原始 `markSaved` 在回调时读取当前文档，`isDirty` 与 `savedSnapshot` 比较。这里只标定基线入口与候选竞态，不冒充运行复现。
- `utils/document.parseReactTemplateDesignerDocument / serializeTemplateDesignerDocument`：模型、画布、流程分别往返 JSON；来源映射属于模型投影。
- `ProductionExecutionService.act`：锁定来源并校验 revision/当前资格，在引擎成功动作后调用 `FormInstanceRecordService.saved`，同事务保存执行与审计；首次 START 构造快照，ATTACH_FORM 使用当时表单配置，其余动作读取既有快照。
- `ExecutionSnapshotBuilder.form / customForm`：读取指定版本模型与画布，复制字段及 projection；不读取新模板覆盖既有执行。
- `ProductionExecutionEngine.formAction / validateValues / validateNestedEdits`：先做当前节点、写权限、格式和证据处理；SAVE 等跳过完整性校验，最终完成校验完整表单；子表结构和只读约束独立于草稿免完整性规则。
- `FormInstanceRecordService.saved`：首次保存建立稳定实例，更新最近保存值和阶段，刷新独立内容索引；只有 COMPLETED 才调用正式完成入口。
- `FormTraceIndexService.refresh / extract`：最近显式配置内容索引；不完整草稿不补造缺失值。该索引不是权威统计或归属数据。
- `FormProjectionService.completed / process`：完成时冻结 form/model/values/context 和待处理批次；处理读取 `source_json`，事务生成正式结果并标 SUCCEEDED。该切片的 final_revision=1 与首次完成边界一致，不据此实现 A12。
- `FormProjectionController.source / instanceSource`：前者读正式批次冻结 source_json，后者读来源实例 snapshot_json + 最近 values_json；类级来源权限仍适用，DHR 回查另需 DHR 权限。

源码是上述局部实际入口的证据，不代表数据库事务、浏览器、所有权限或 W2 全链验收已通过。旧文档中的历史时点描述也不能覆盖当前 DEC-0078 或 DEC-0077 的后续声明。

## 本批候选保存确认竞态的语义结论

主侧提出的合法序列为保存 A 请求发出后继续编辑为 B，A 成功回调却把 B 标为已保存。既有“同一配置、保存和撤销”语义足够支持修复：成功确认必须对应实际成功请求的文档，未发送 B 继续为 dirty；真正保存 B 成功后才 clean。旧版本/关闭重开后的延迟结果不得清除其他当前文档状态。具体身份与异步回调隔离机制属于工程方案，不需要发明新业务政策或增加新 DEC。

本角色未运行该竞态，不参与修复或编写产品测试；红复现、修复及独立质量验收由主侧安排。本结论仅表示可沿既有规则确定性整改。

## 保留的未决或延期边界

- `question.production-batch-quantity-lower-bound`：BATCH `0 < q < 1` 与末批余数资格尚未定，不能借普通数字字段或 fixture 修复把 `>0` 或 `>=1` 升为新政策。
- `question.form-projection-free-text-identity`：文本编号解析、错误/不存在对象最终完成处置及实体歧义未定；现有受控引用有效性按 DEC-0060 保留。
- `question.form-projection-header-shared-fields`：表头共享到子表与去重契约未定，不默认复制。
- 不同子表组合、复杂 OR、跨表单同事件身份、长期记录本、不良分项件数/缺陷次数和客户自建模型仍按各问题独立保留。
- `question.form-projection-context-prefill-lifecycle`：自动带入取值时点、持久化、刷新覆盖、可编辑性和多设备未定；已有缺上下文提示/内容登记边界不重问。
- A12 表单变更/作废、失效历史视图、跨修订行身份及其 DHR 影响依赖用户已暂缓的上游能力，本批不实现。
- 客户低学习成本、全链 E2E、发布级权限/快照验证不由规范或局部源码存在证明。

这些既存边界不阻塞无依赖的保存确认修复。未发现需要就该修复新增询问用户的业务问题；本轮 `not-applicable` 仅表示没有本体定义变更，不等于 W2、W0–W7 或全库审计完成。
