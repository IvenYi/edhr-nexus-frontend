# 流程列表入口、业务类型与当前任务说明（2026-11-02）

本记录服务于 `DEC-PACKAGE-20261102-WORKFLOW-LIST-UI`。知识基线为 `0.3.25`（schema `1.2.0`）；核对的本地主目录提交为 `0bd0848bbded6d6954d62a4f924e0b2eec6623ad`，目标分支为 `edhr-dev`，最终核对的已获取远端目标提交为 `e3e49784eda6bc01e7e5c686d6f79dc5a600d5ae`（替代本轮首次获取的 `ab5adafb9629b94f95eb88825ec0a4ea06f4efb1`）。来源与最新目标之间的项目契约、相关知识及流程列表实现没有增量；本轮前端实现按未提交工作树记录，不声称已经合并或发布远端提交。

## 用户确认与本轮范围

- `user-confirmed`：流程干预列表增加“操作”列和“重新分配”按钮；流程日志、流程干预均补齐左上角列设置，遵守现有页面规范。用户同时要求说明“当前任务”能否包含多步。
- `user-confirmed`：用户指出列表和详情看不出业务类型，要求明确展示的业务类型；该追加需求由主智能体的同一切片交接传入。
- `existing-policy`：[DEC-0092](../decisions/DEC-0092-workflow-operations-entry-and-actions.yaml) 与 [DEC-0091](../decisions/DEC-0091-workflow-reassignment-signature.yaml) 继续约束重新分配权限、原因、签署、合法目标及不改变节点路径和审批结果；本轮只扩充入口与信息呈现，不改变这些政策。
- `inference / implementation-choice`：列表单活动任务直接进入既有重新分配对话框，多活动任务先选择具体任务；两个列表按用户及模式分别保存列偏好。业务类型与申请编号用于解释当前操作对象。这些是满足需求的界面选择，不是新增业务规则。

## 原始证据：任务数量和历史边界

- `original-evidence`：[WorkflowOperationsQuery.detail](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/service/WorkflowOperationsQuery.java) 的 `tasks` 来自实例的全部任务，包含历史任务；不能把响应数组长度直接解释为当前待处理任务数。本轮干预页按 `PENDING`、`PROCESSING` 呈现“当前任务”，流程日志详情仍保留历史任务。
- `original-evidence`：[WorkflowEngine.progressFromNode / activateStructuralNode / createTaskForNode](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/engine/WorkflowEngine.java) 在进入普通节点时创建任务，未来尚未进入的顺序步骤没有当前任务；`PARALLEL_SPLIT` 可同时激活多个分支，`PARALLEL_JOIN` 等待汇入节点完成。每节点仍只有一个逻辑任务，多个候选人员存于同一任务快照，符合 [DEC-0031](../decisions/DEC-0031-workflow-task-multi-candidate-runtime.yaml)。
- `existing-policy`：[DEC-0039](../decisions/DEC-0039-record-control-parallel-review-configuration.yaml) 的并行审批范围是记录控制变更／作废审批；不能由引擎包含并行实现，推断作业流程首版也已支持并行。
- `inference`：给用户解释时，应区分“整个流程依次有多步”“此刻有多个并行待办”“同一任务有多个候选人”和“历史已处理任务”。当前任务区域可有多个并行待办，不应把未来步骤和历史步骤一起列为当前任务。

## 原始证据：业务类型和查询范围

- `original-evidence`：`WorkflowOperationsQuery.list/detail` 已提供 `businessType`、`businessKey`，两者均排除 `DHR_SUMMARY`；记录控制实例会关联申请编号。该查询并未硬限定只返回 `CHANGE`、`OBSOLETE`，所以仍须如实显示历史其他类型或未标注类型。
- `original-evidence`：[RecordControlWorkflowService.start](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/service/RecordControlWorkflowService.java) 调用 `WorkflowEngine.createRecordControlInstance`，后者校验业务类型为 `CHANGE` 或 `OBSOLETE`。它们在本轮列表和详情显示为“表单变更”“表单作废”；类型说明与申请／业务编号、流程名称分别呈现，直接重新分配入口保留业务上下文。
- `original-evidence`：[DhrSummaryService](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrSummaryService.java) 经 `createDhrSummaryInstance` 发起 DHR 汇总审核；该业务使用专属查询和操作，继续排除在通用流程日志／干预范围外。不能把 `DHR` 与 `DHR_SUMMARY` 两个不同原码混同。
- `original-evidence`：[WorkflowInstanceController](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/controller/WorkflowInstanceController.java) 的通用创建、更新、删除均拒绝写入。本轮在 `backend/src/main/java` 搜索 `createInstance(`，只找到 `WorkflowEngine` 声明，未发现业务调用入口。[constants.ts](../../../gmp-platform/frontend/src/utils/constants.ts) 的 `BUSINESS_TYPES` 包含 `DHR`、`RELEASE` 绑定选项；这些选项本身不足以证明已接通相应实例业务。
- `inference / implementation-choice`：未知历史类型显示“其他业务（原码）”，空类型显示“未标注业务类型”，保持已有数据的可解释性；不猜测其对应业务，不新增业务入口，不扩大 DHR 查询或操作范围。

## 本轮实现锚点与验证边界

本轮界面入口可定位至 [InstanceList](../../../gmp-platform/frontend/src/pages/workflow-center/InstanceList.tsx)、[WorkflowReassignmentEntry](../../../gmp-platform/frontend/src/pages/workflow-center/WorkflowReassignmentEntry.tsx)、[WorkflowInstancePanel](../../../gmp-platform/frontend/src/pages/workflow-center/WorkflowInstancePanel.tsx) 和既有 [WorkflowResponsibilityDialog](../../../gmp-platform/frontend/src/components/workflow/WorkflowResponsibilityDialog.tsx)。使用既有 API、`taskState` 及签署对话框，不引入批量重分配或绕过签署的动作。

本体角色只核对原始源码、现有定义、知识结构及路径，不运行主数据库、不改变验收数据，也未执行浏览器、业务集成或独立质量验收。主侧构建和交互证据由本轮开发／质量交接记录承接；本记录不将静态核对提升为业务验证、CSV 或发布通过。原 [2026-10-30 实现与测试证据](workflow-operations-20261030.md) 保留其原始时点与范围，不回填为本轮验收。
