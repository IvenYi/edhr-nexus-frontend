# 普通表单与DHR集中流程及责任变更确认

知识基线为0.3.25/schema1.2.0。来源提交为`0bd0848bbded6d6954d62a4f924e0b2eec6623ad`及该提交上的本轮工作树；本页不为工作树编造提交。最近获取的目标引用和契约核对以本轮decisionPackage及ontologyResult分别记录，不由fetch推定工作文件或部署已更新。

## user-confirmed

用户在分清处理人转办与管理员重新分配后询问：

> 我觉得表单那边需要重新分配，表单的转办是不是还是处理人转办？还是说转办就是重新分配？需要搞清楚。dhr审批的话，你觉得有重新分配的必要吗？dhr审批可以转办吗？但无论如何，流程日志肯定要有，但如果说dhr审批你觉得没有重新分配功能的必要的话，那么就没必要放在干预里了，也没啥意义。

主侧建议的已确认范围：普通表单保留处理人转办，增加管理员签名重新分配；DHR增加管理员签名重新分配并进入集中日志及干预，本期不增加处理人主动转办。只改变当前未处理审批任务责任，保留内容、冻结汇总版本、既有签名和决定；作业及工艺路线保持。

用户明确接受并补充：

> 好的，那么就按你说的补一下。记得在dhr数据审计里要体现，包括表单的数据审计里也要体现哈

原始会话原话同步在[本轮确认](../../development/workflow-central-entry-extension-20261102/user-confirmed.md)。本次确认不重新授权DHR本人转办、撤回、跳过、强制批准或归档。

## 当前有效含义与历史保留

[DEC-0093](../decisions/DEC-0093-central-form-dhr-workflow-responsibility.yaml)的01补充DEC-0092-01的入口业务范围；02局部替代DEC-0081-04、DEC-0091-03和DEC-0092-05中普通表单及DHR管理员重新分配未开放的对应范围。旧声明的DHR专属批准/退回、证据及签署检查、禁止本人转办及其他越权动作边界继续适用。上述旧声明并未定义永久禁止集中只读查询，不能凭历史实现排除反推该政策。

DEC-0092-06及`workflow-operations-20261030`所记载的DHR查询排除属于当时的原始实现事实，保留原文和测试时点；本轮增加集中读取后，不将其继续表述为当前范围，也不把本轮行为回填成旧测试已经覆盖。DEC-0081普通表单处理人转办的租户内范围和原候选来源保持，不由管理员改派的工程目标资格改变其原语义。

## inference / implementation-choice

普通表单集中记录从持久化表单实例、当前生产执行状态和结构化历史投影，改派只针对当前审批节点；填报阶段可解释但不由本次改派扩大填报字段权限。不建立第二套表单运行任务或执行引擎。DHR复用审批任务并保持专属业务动作和冻结版本检查。

主侧选用的具体目标资格为同租户正常有效用户，并在DHR改派目标复核`records.dhr-review`及`dhr.reviews.act`，普通表单目标复核`production.execution`及`form-management.review`；管理会话与实际签署人均复核`workflow.intervene`。权限码、表单前缀身份、签名摘要、分页和审计实体映射是工程选择，须由实现与负向测试验证，不是用户逐字段指定。原候选依据与当前责任分开保存；表单既有转办不套用新的强制签名要求。

## original-evidence 与验证边界

本体已直接读取本轮`0bd0848b`上的未提交工作树，相关源锚点见[集中入口锚点](../implementation-anchors/workflow-central-entry.yaml)，并区分下列原始行为与工程选择：

- `WorkflowOperationsQuery.list/detail`聚合真实工作流及普通表单投影，在SQL的领域可见范围后统一关键词/状态过滤、计数及分页；DHR业务编号显示DHR号和版本。`FormWorkflowOperations.source/detail`以`FORM_PROCESS`和`form-<持久化实例ID>`区分普通表单；任务身份为`form-<实例ID>:<节点ID>`。控制器复用现有集中接口按身份路由，不另存第二套运行任务。
- `FormWorkflowOperations.reassign/requireActive/state`复核当前可变审批节点、原生产/工单/DHR可变性、同租户正常用户及目标表单审批权限；管理会话和签署人权限、原因和当前状态摘要均受控。原候选和字段内容不被改写，当前目标写入既有`transferAssignees`，更新`production_execution.revision`并在同一事务写`WORKFLOW_INTERVENTION`签名、`REASSIGN`结构化历史及`PRODUCTION_EXECUTION`审计。
- `WorkflowResponsibilityService.change/eligible/requireActive`只为DHR放开管理员签名改派，复核汇总审批仍在审；冻结候选的原件保留在`originSnapshot`，当前责任变化不修改冻结汇总。DHR审计使用`DHR_SUMMARY_REVIEW`、`entityId=summaryVersionId`，因此`DhrSummaryService.audit/versionAudit`的既有领域查询可见；DHR本人转办仍由该服务明确拒绝，审批和退回仍经原`DhrReviewService`。
- `frontend/src/api/workflow-operations.ts`编码带前缀身份并明确业务类型；`productionAudit.ts`的`isAuditForForm`仅对新`REASSIGN`按持久化实例或`formId/copyId`精确过滤，`FormInstanceListPage`、`FormFillingPage`和`FormReviewPage`复用该过滤。历史工序级审计的原范围不因本轮改写。`dhrAuditPresentation.ts`和生产审计展示补充责任、节点、原因、签名及实际签署身份的中文字段，原始审计内容不变。

上述是本轮源码核对，不代表已执行全部交互或负向场景。`RecordControlPostgresIntegrationTest`的六个新增场景包含两领域签名改派、新旧处理权、冻结证据和审计可见、非法目标及签名、业务锁、两源分页、表单竞争和审计失败回滚断言；本体已读取这些源断言，不将旧25项套件当本轮新范围已通过。本轮执行证据与适用边界另列如下，不回填旧时点。

来源与目标明确分开：主侧本次fetch成功将最近目标引用更新为`8ec8391721858a7f96d73a5d293d93f43679118a`，证据为本轮`evidence/remote-baseline.json`；实际工作树仍基于`0bd0848bbded6d6954d62a4f924e0b2eec6623ad`，未宣称已经集成目标。本体实际核对的AGENTS、codeplz、角色/交接契约和相关知识目标差异为空；尝试读取目标`DhrReviewService`差异时partial clone补取对象因网络失败，因此不声称已核对该目标文件或覆盖其合并兼容性。既有本地专属审核行为及本轮实际候选另行验收。

## 主侧执行报告复核与限制

下列测试由主开发智能体执行，本体读取保留的JUnit/命令摘要及相应源断言，并未亲自重跑Maven或操作数据库：

- [RecordControlPostgresIntegrationTest](../../development/workflow-central-entry-extension-20261102/evidence/RecordControlPostgresIntegrationTest.txt)：31项，0失败/错误/跳过，含本轮新增6项及原记录控制/DHR联动回归。该套件仅接受显式`edhr_record_control_test_*`隔离PostgreSQL实例；主侧报告针对本轮本地工作树，不覆盖未集成的远端候选。之前提示顺序断言未通过的尝试不计为通过，最终保留报告为本轮成功结果。
- [ExecutionAccessTest](../../development/workflow-central-entry-extension-20261102/evidence/ExecutionAccessTest.txt)13项、[ProductionExecutionEngineTest](../../development/workflow-central-entry-extension-20261102/evidence/ProductionExecutionEngineTest.txt)22项、[DhrReviewLifecycleIntegrationTest](../../development/workflow-central-entry-extension-20261102/evidence/DhrReviewLifecycleIntegrationTest.txt)6项及[DhrReviewServiceTest](../../development/workflow-central-entry-extension-20261102/evidence/DhrReviewServiceTest.txt)12项，共53项，0失败/错误/跳过；支持本轮相邻原转办、审批资格及DHR专属动作的聚焦回归，不代表全部领域场景。
- [前端构建](../../development/workflow-central-entry-extension-20261102/evidence/frontend-build.txt)及[列表规范](../../development/workflow-central-entry-extension-20261102/evidence/list-style.txt)命令保留成功结果。前端[40项交互结果](../../development/workflow-central-entry-extension-20261102/evidence/ui/result.json)明确使用实际维护组件、主题和API客户端配合合成拦截响应，覆盖1440/390宽度；该证据不连接真实后端或数据库，不表述为全栈E2E、真实账户签署或人工验收已通过。本体只核对报告声明和源码，不冒称亲自进行了浏览器视觉验收。

最终知识资产的[BusinessKnowledgeModelTest报告](../../development/workflow-central-entry-extension-20261102/evidence/BusinessKnowledgeModelTest.txt)为89项、0失败/错误/跳过；本体已读取主侧保留报告，[validation.md](../../development/workflow-central-entry-extension-20261102/validation.md)记录实际命令、候选和隔离库边界。Bootstrap和链接诊断只作补充，不替代正式知识检查。独立质量由本轮质量角色另行给出，本体结果不替代其收尾。本轮不提升新增规范为verified/runtime，不关闭完整多租户、其余DHR高风险历史矩阵或无关开放问题。

冠骋[本轮原始资料复核](crown-workflow-scope-20261102.md)仅为方案参考；外部产品行为不能代替本轮用户确认或我方运行验证。本次不新增未决业务问题，不关闭无关开放问题，不提升P0路线阶段或宣称CSV、运行知识投影和生产发布通过。
