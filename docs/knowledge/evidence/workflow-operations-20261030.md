# 流程日志、流程干预和标准动作实施确认

日期：2026-10-30（Asia/Shanghai）。读取基线：`40497474da006dfd52ea38070036a6e350eaab8e`，知识 `0.3.25 / schema 1.2.0`。开始时远端刷新超时；主侧收尾重新fetch成功，`origin/edhr-dev`仍为`635711f97e9b794f4af02e1e5d1939bb2ecf920f`且已为本地HEAD祖先，原始[刷新结果](../../development/workflow-operations-20261030/evidence/remote-baseline.json)保留。本轮实现处于该HEAD上的工作树，未编造提交或据此声称已部署。

## user-confirmed

用户原话见[本轮原件](../../development/workflow-operations-20261030/user-confirmed.md)：

> 好的，就按这个方案推进，保留流程实例直接改成流程日志，新增流程干预，把重新分配、转办和受限撤回补齐。重新分配必须签名，注意不要破坏并且要遵守现有功能和页面规范。

本次确认记录为[DEC-0092](../decisions/DEC-0092-workflow-operations-entry-and-actions.yaml)。流程日志沿用实例查询和详情入口，新增流程干预；转办仍从任务详情、受限撤回仍从申请详情进入，不增加独立转办或撤回菜单。既有技术路由和实例身份兼容属于已采用方案边界，不重命名历史审计记录。

2026-10-29[DEC-0091](../decisions/DEC-0091-workflow-reassignment-signature.yaml)及[原始确认](workflow-reassignment-signature-confirmed.md)保留当时只调研、未实现的事实；本轮进入实施授权不回填该时点，也不重新打开已关闭的必签选择。

## existing-policy

- [DEC-0037-06/08](../decisions/DEC-0037-record-correction-and-void-control.yaml)与[分工契约](../../development/record-control-work-allocation-and-integration-contract.md)规定当前处理人转办、专门权限重新分配、申请人受限撤回及运行日志和不可变审计分层。转办、重新分配只改变责任，不改变节点、路径或业务结果。
- 记录控制转办仍按授权候选范围并排除申请人自审；[DEC-0081](../decisions/DEC-0081-tenant-scoped-task-delegation.yaml)确认的集合外租户内委托只覆盖通用工作流及普通生产表单，不能自动外推记录控制。
- 撤回仅限当前轮次尚无批准或退回决定，由流程域校验并使全部待办失效，记录控制域同步消费结果而不落地拟变更或作废；领域所有权按[DEC-0042](../decisions/DEC-0042-record-control-workflow-stage1-contract.yaml)保持。
- [DEC-0074](../decisions/DEC-0074-shared-terminal-button-signature.yaml)的实际签署人资格、共享终端会话与精确用户名admin凭证例外保留；不能把登录者权限借给签署人，也不能把重新分配必签外推为普通转办、撤回一律必签。
- DHR专属审核与退回整理、归档暂缓及禁止跳过/强制批准等边界不变。

## original-evidence 与 secondary-reference

本轮开发前原始源码显示已有 `/workflow/instances`、实例详情及日志路由，菜单显示名为“流程实例”；`WorkflowIntervention`只有实体字段，记录控制通用转办入口仍阻断，受限撤回只有Java端口。可定位到基线下的 `gmp-platform/frontend/src/router/index.tsx`、`utils/menuManagement.ts`、`gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/engine/WorkflowEngine.java`及`workflow/contract/RecordControlWorkflowWithdrawalPort.java`。这是开发前固定提交的事实，后续实现不能回写成当时已完成。

[冠骋调研](../../development/workflow-intervention-research-20261029/README.md)是本次实施的二手比较线索（`secondary-reference`），其原始源码与图片只证明各自观察范围，不是本轮产品规则或验收依据。本轮不重新调查竞品，也不把其退回起点语义替代本系统申请人受限撤回。

## inference 与实现成熟度

实例锁串行化任务责任变更和审批、签署绑定原新处理人与任务原因、陈旧请求校验等属于主侧工程方案（`inference`），以[同一决策包](../../development/workflow-operations-20261030/decision-package.yaml)及实际代码和测试为准，不把工程机制冒充用户原话。

规范声明`DEC-0092-01..05`保持`specified/internal`；本轮实现事实单独记在`DEC-0092-06`。源码及主侧聚焦测试支持责任保持规则、重新分配术语、只读运行日志和WITHDRAWN派生结果的`implemented/internal`，不提升为`verified`、客户知识或知识运行投影，也不新增知识规则执行器。知识版本与P0阶段保持，不新增标准工具或新试点。旧调研、阶段一通过或单纯schema通过均不能代替本轮独立质量验收。

## 本轮实现核对与验证范围

- `original-evidence`：`WorkflowResponsibilityService.change`锁定实例和任务、复核任务状态摘要、授权实际签署人并生成动作签名，`eligible`按原候选资格校验重新分配与记录控制转办，记录控制排除申请人；普通任务的租户内转办政策不扩给管理改派。保存同一逻辑任务和原候选原件、责任版本、运行日志、干预记录及不可变审计，不推进路径。转办签署要求继续读冻结节点配置；密码和认证方式沿现有`ExecutionAccess`。
- `original-evidence`：`WorkflowEngine.withdraw`实现既有Java端口，实例锁内拒绝已有批准/退回决定和非申请人，原子失效全部活动任务、输出确定结果；`RecordControlService.withdraw/applyResult`在同一事务消费，不修改来源当前有效修订。失败回滚包含流程、签名和业务状态。
- `original-evidence`：`WorkflowOperationsQuery.visibility`在列表分页/计数及单条详情前保护活动记录控制的申请关联范围；专门干预权限承载管理查询，普通日志权限不隐含扩权。DHR始终排除。旧任务、实例和日志CRUD写入关闭；`WORKFLOW_INTERVENTION`通用签名单条读写及列表分页排除同时接入。
- `original-evidence`：`InstanceList`同源双模式及`WorkflowInstancePanel/WorkflowResponsibilityDialog`复用现有列表壳、详情抽屉及签署组件；保留实例路由，新增干预路由，记录控制审批详情与申请详情分别接转办和撤回。[三张原始PNG](../../development/workflow-operations-20261030/evidence/browser)由本体角色实际查看，可证明动作入口、弹窗文案和错误签名反馈；PNG本身不证明操作提交成功或数据库结果。
- `original-and-test-evidence`：本体角色核对[主侧汇总及原JUnit](../../development/workflow-operations-20261030/evidence/backend-verification.json)，198项聚焦检查无失败、错误或跳过，包含25项真实PG套件及89项知识校验。25项套件包含本轮三动作，也回归已有记录控制、DHR通知和生效联动；不把25视为单独新增用例数。本轮源码断言涵盖缺失/错误签署、实际操作者权限、不合格目标、冻结候选及陈旧请求、日志范围与DHR隔离、转办签署配置、全部待办失效、竞争单胜和失败回滚。本体侧未亲自运行主侧业务套件，不将其当独立质量、完整权限矩阵或CSV验证。
- 本体角色另运行正式`mvn -q -Dtest=BusinessKnowledgeModelTest test`，具体结果、原件与源码摘要记录在本轮`ontology-result.yaml`及`evidence/ontology-validation.json`。本次结果仍不替代准备交付候选的独立质量门禁。
