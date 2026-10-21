# 本体基础修复：事实类型与当前定义核对

核对日期：2026-10-12。源码与原知识基线：`ea5d1a65b7390c7f89964980364866583c5fd018` / `knowledgeModelVersion: 0.3.24`。本修复由 `DEC-PACKAGE-20261012-ONTOLOGY-FOUNDATION` 授权，属于建模纠错，不建立新的生产业务政策。

本记录把原始源码、既有确认定义和剩余差异分开。源码核对只证明这里列出的类型或结构；不证明相应知识事实已经具有通用运行时读取器，也不代表 Java 测试、数据库或发布验证通过。原事实的 `status`、`availability`、`visibility` 和既有 `reviewStatus` 保持不变。

## 一、修复范围

`facts/core-business.yaml` 中 82 个原为 `string` 的事实改为 66 个 `boolean`、14 个 `integer` 和 2 个 `decimal`。其中 79 个事实被 92 条布尔或数值比较使用，其余是 PDF 页码上界 `documentBinding.pageEnd` 及已从编辑器／实体确认类型的两个必填配置字段。以下使用既有规则别名定位事实；稳定 `fact.catalog.*` 标识保持不变，可在该目录中逐项解析。

### 1. 已有实现记录中的布尔命题与配置字段（31 项）

这些事实表达一次存在性、有效性、完成或条件判断的结果，类型为布尔；不能因为其原始输入是编号、数量或列表而声明为字符串。

| 事实别名 | 原始核对依据 |
|---|---|
| 三项 `RdoVersionStatusResolver.isReferenceable(...)`：DHR 模板版本、表单模板版本、路线版本 | [RdoVersionStatusResolver.java](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/common/util/RdoVersionStatusResolver.java) 的两参数方法返回 `boolean`。 |
| `RdoVersionStatusResolver.isReferenceable(selectedProcessVersion.effectiveFrom, selectedProcessVersion.effectiveTo, queryTime)` | [ProductProcessResolutionService.java](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/service/ProductProcessResolutionService.java) 的 `availableVersions` 比较 `resolve(..., atTime)` 与 `ACTIVE`。三参数 `isReferenceable` 是保留的旧规则别名，源码没有这个重载；`sourceLocator` 已明确实际表达式。 |
| `batch.itemsPresent`、`productionObject.objectNoAlreadyUsed`、`productionObject.plannedTimeRangeValid`、`split.processVersionResolved`、`workOrder.existingObjectFormsMatchRequestedForm`、`workOrder.objectTargetQuantityWithinPlannedQuantity`、`workOrder.processVersionLocked` | [ProductionService.java](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ProductionService.java) 的 `split`、`splitBatch` 与 `requireProcessVersion`：集合非空、编号存在、时间比较、版本解析、生产形态匹配及目标数量边界均为判断结果。 |
| `importedBatch.batchNoPresent`、`importedBatch.quantityPositive`、`importedSn.snNumberPresent` | [WorkOrderPage.tsx](../../../gmp-platform/frontend/src/pages/production/WorkOrderPage.tsx) 的导入候选构建检查编号文本和数量正值；事实表达检查结果，不是编号或数量本身。 |
| `product.hasAvailableProcessVersion`、`productFamily.hasAvailableProcessVersion` | `ProductProcessResolutionService.resolve` 对产品／产品簇可用版本集合执行非空判断；`ProductionService` 消费解析结果。 |
| `productProcessVersion.isNewRecord` | [ProductProcessOwnerService.java](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/service/ProductProcessOwnerService.java) 的新建／复制路径，与 [rule.product-process.production-mode-default](../rules/product-process.yaml) 的新记录命题对应；不是某个同名字符串数据库列。 |
| `productModelEditor.formBinding.required`、`productProcessOperationFormBinding.required` | [ProductProcessVersionEditorDialog.tsx](../../../gmp-platform/frontend/src/pages/master-data/components/ProductProcessVersionEditorDialog.tsx) 的复选框读写 `checked` / `event.target.checked`；[ProductProcessOperationFormBinding.java](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/ProductProcessOperationFormBinding.java) 的字段为 `Boolean required`。依据原始值类型校正，不根据 `configurable` 或 `persisted` 的字符串元数据推断。 |
| `workOrder.orderNoPresent`、`workOrder.plannedQuantityPositive`、`workOrder.plannedTimeRangeValid`、`workOrder.productSelected` | [WorkOrderController.java](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/WorkOrderController.java) 的 `apply` 检查文本、产品引用、`BigDecimal.signum()` 及起止时间。 |
| `productionWorkApplicabilityRule.listRequested`、`productionWorkApplicabilityRule.persisted`、`productionWorkDefinition.persisted`、`productionWorkFlowVersion.deleteRequested` | [WorkTemplateController.java](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/controller/WorkTemplateController.java) 的查询、保存和删除入口，与 [transaction-runtime.yaml](../rules/transaction-runtime.yaml) 中的请求／保存事件命题对应；不声称存在这些别名的同名字段。 |
| `subject.resolution.completed` | [SubjectResolver.java](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/identity/service/SubjectResolver.java) 返回主体解析结果；[rule.workflow.task-creation-freezes-candidate-resolution](../rules/identity.yaml) 用布尔命题表示解析已完成，不是把整个 `SubjectResolution` 对象改为布尔。 |
| `workshop.changePersisted`、`workshop.codeDuplicateWithinTenant`、`workshop.statusProvided` | [WorkshopController.java](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/WorkshopController.java) 的保存后审计、仓储重复判断与新建默认状态逻辑。 |

### 2. 已确认、尚未作为可用事实落地的布尔命题（35 项）

以下按现有规则的明确命题校正类型，继续保留 `specified` / `not-available`；不根据相邻源码提高成熟度，也不把原有宽泛来源路径解释成可调用读取器。

| 事实别名 | 已有确认定义 |
|---|---|
| `sourceRecord.completed`、`sourceRecord.currentRevisionExists`、`voidRequest.approved`、`currentRevision.exists`、`workflow.parallelBranchesExist`、`workflow.allBranchesApproved`、`formProcessButtonConfigurationRequested` | [production.yaml](../rules/production.yaml) 的记录变更、作废、并行汇合和首切片干预边界；[DEC-0037](../decisions/DEC-0037-record-correction-and-void-control.yaml)。 |
| `reviewTemplate.approvalNodePresent`、`reviewTemplate.approvalNode.approverSubjectsConfigured`、`reviewTemplate.fixedActionMutated`、`reviewTemplate.configurableFillPermissionRequested` | [DEC-0041](../decisions/DEC-0041-record-control-application-confirmation-start.yaml) 的审批节点、主体必填及固定动作配置约束。 |
| `earlyTermination.reasonPresent`、`productionObject.routeHasNoCurrentOperation`、`productionObject.allAssociatedObjectsTerminal`、`productionObject.hasParentOrChildren` | [production.yaml](../rules/production.yaml) 的终止原因、工序结束、关联对象终态及谱系存在命题；本次不重评这些较广规则的运行闭环。 |
| `productionWorkApplicabilityRule.isApplicable`、`productionWorkDefinition.hasPublishedFlowVersion`、`productionWorkDefinition.selected`、`productionWorkMatch.matched` | [transaction-runtime.yaml](../rules/transaction-runtime.yaml) 的适用规则解析、显式选择和匹配结果定义。 |
| `productionWorkFlowVersion.saveRequested`、`productionWorkFlowVersion.publishRequested`、`productionWorkFlowVersion.containsConditionRule`、`productionWorkConditionNode.published`、`productionWorkFlowGraph.isFirstReleaseFlow` | 同文件的草稿保存、发布验证和条件分支规则；是否请求、是否包含以及是否满足范围，均为布尔命题。 |
| `formProcessPermissionGroup.subjectConfigurationPresent`、`subjectSelector.opened`、`formProcessBinding.fieldPermissionException.exists`、`formProcessBinding.versionChanged`、`formProcessApproval.returnRequested` | [DEC-0023](../decisions/DEC-0023-production-form-process-subject-default-and-binding-exceptions.yaml) 及对应的主体、字段例外与退回规则。 |
| `formProcessEntry.subjectConfigurationPresent`、`authenticatedUser.present`、`formProcessApproval.subjectConfigurationPresent` | [DEC-0033](../decisions/DEC-0033-form-process-optional-subjects-and-open-operation-scope.yaml) 中未配置主体但必须认证的开放操作边界。 |
| `formProcessNode.buttonEvent.exists`、`formInstance.submissionValidation.passed` | [transaction-runtime.yaml](../rules/transaction-runtime.yaml) 的按钮事件存在性和提交验证是否通过的命题。 |
| `formBinding.required` | [product-process.yaml](../rules/product-process.yaml) 的工序完工必需表单规则；事实类型是必填开关，较广运行规则成熟度保持原值。 |

### 3. 数量与页码（16 项）

| 事实别名 | 修正类型 | 原始来源或已确认含义 |
|---|---|---|
| `documentBinding.pageStart`、`documentBinding.pageEnd` | `integer` | [ProductProcessOperationDocumentBinding.java](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/ProductProcessOperationDocumentBinding.java) 均为 `Integer`；`ProductProcessOwnerService` 验证成对提供、起始页不小于 1、结束页不小于起始页。 |
| `product.productFamilyCount` | `integer` | [ProductFamilyMembershipService.java](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/service/ProductFamilyMembershipService.java) 的成员唯一归属检查；规则定义关系数量，不把 Optional 返回对象当作计数字段。 |
| `productFamily.memberCount` | `integer` | [ProductFamilyMemberRepository.java](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/repository/ProductFamilyMemberRepository.java) 的 `long countByTenantIdAndProductFamilyId`。 |
| `productFamily.processVersionCount` | `integer` | `ProductProcessOwnerService.processVersionCount` 返回 `int`。 |
| `product.availableProcessVersionCount`、`productFamily.availableProcessVersionCount` | `integer` | `ProductProcessResolutionService` 的可用版本集合数量。 |
| `batch.generateCount`、`split.batchCount` | `integer` | `WorkOrderPage.addPendingBatch` 对对象数量使用 `Math.floor`／`Math.ceil` 并按整数长度创建候选数组；与每个对象的目标数量分开。 |
| `workOrder.productionObjectCount` | `integer` | `ProductionService.objects` 的对象集合及首次拆分 `existing.isEmpty()` 判断。 |
| `productionWorkApplicabilityRule.count` | `integer` | `WorkTemplateController.delete` 查询绑定规则集合并检查是否为空。 |
| `productionWorkDefinition.auditEventCount` | `integer` | [0059-work-template-audit-baseline.sql](../../../gmp-platform/backend/src/test/resources/db/changelog/0059-work-template-audit-baseline.sql) 用 `NOT EXISTS` 查找无审计的作业；对应规则定义审计记录数为零的条件。 |
| `workshop.referenceCount` | `integer` | `rule.workshop-reference-lock` 定义引用数量；当前 `WorkshopController.isReferenced` 用产线引用存在性完成阻断，不声称已有通用完整引用计数器。 |
| `formProcessApproval.candidateCount` | `integer` | `rule.form-process.approval-any-candidate` 与 DEC-0023 的候选人数定义；保持 `specified` / `not-available`。 |
| `split.targetQuantity` | `decimal` | `ProductionService.split` 接收 `BigDecimal targetQuantity`，数值可以有小数；SN 场景另行限制为 1。 |
| `split.quantityPerBatch` | `decimal` | `WorkOrderPage.addPendingBatch` 在按每批数量模式使用用户的数值输入；输入控件该模式的 `step` 为 `any`，提交最终进入 `BigDecimal` 目标数量。 |

页码规则原来的 `value: documentBinding.pageStart` 是含义不明确的字符串。本次改为 `value: {fact: fact.catalog.documentbinding-pagestart}`，明确右操作数是另一个整数事实，并保留空值与成对提供条件。

### 4. 原有枚举事实的受控取值（5 项）

| 事实 ID | `enumValues` | 核对依据 |
|---|---|---|
| `fact.form-process-binding.form-process-template-version-status` | `[DRAFT, PUBLISHED]` | [FormProcessController.java](../../../gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/controller/FormProcessController.java) 的新草稿、发布和当前版本标记。 |
| `fact.production-work-flow-version.status` | `[DRAFT, PUBLISHED]` | `WorkTemplateController` 的相同版本机制。 |
| `fact.target-form-process-version.status` | `[DRAFT, PUBLISHED]` | 目标版本也是表单流程版本；发布资格另检查是否当前版本。 |
| `fact.referenced-form-process-version.status` | `[DRAFT, PUBLISHED]` | 历史已发布版本通过 `isCurrent=false` 区分，状态仍为 `PUBLISHED`，不增加虚构的 `HISTORY` 状态。 |
| `fact.form-fill-settings.mode` | `[直接填报, 按流程填报]` | [填报设置确认证据](form-fill-settings-confirmed.md) 和现有规则；保留业务语义取值，不将它偷换为已实现的 `fillMode` 存储枚举映射。 |

相应将当前 `rule.production-work.published-version-only` 的值从 `published` 修为 `PUBLISHED`。已弃用的 `rule.transaction.published-version-only` 原样保留，不能将历史事务规则复活为当前规则。

## 二、保留的操作符边界

`is-present`、`is-null`、`exists` 等操作符中的布尔 `value` 表示期望检查结果，不表示原事实是布尔值。同样，`contains-actor`、`explicitly-selected`、`planned` 和 `is-referenceable` 的期望结果不能用于盲目重写底层事实类型。本次没有按这些操作符批量改类型，也没有把数量、主体集合、版本引用或配置对象改为布尔。

## 三、审计事件与自定义表单当前定义

- `concept.audit-event` 直接对应 `AuditEvent` 的独立事件身份；`relation.audit-event-retains-change-snapshot` 改为从该事件指向快照，动作分类通过独立关系表达。分类只是展示投影，不能成为一次变更快照的所有者。
- 自定义表单词条按 [DEC-0075-01/-02/-08](../decisions/DEC-0075-custom-form-scope-and-record-completeness.yaml) 同步工序或批次归属、默认完工要求、添加原因、有效模板及明确版本快照。表单模板不要求 `PUBLISHED`，作业流程与表单流程的发布要求独立保留。相关概念和关系补充同一确认来源，知识仍为 `specified/internal`。

## 四、数量下限的实现证据与待决边界

2026-10-12 补正：原类型核对已发现下表差异，并将 `0 < q < 1` 的业务资格留待确认。随后固定 `7bf87c00a4a1158d6fbb4085eb9fb632918bcb50` 的全量内审在候选 `0d46558234a933a020430ccf6c6a064ecfa05687` 中，把两条结构化阈值从 `>= 1` 改为 `> 0`，并将其表述为不需要业务决定的推导纠错。该结论的确定程度超过了证据范围，本次明确撤回；以下实现事实和原始来源继续保留。

| 规则 | 知识条件 | 原始实现 | 影响范围 |
|---|---|---|---|
| `rule.production.production-batch-input-quantity-required` | `split.targetQuantity >= 1` | `WorkOrderPage.addPendingObject` 与 `ProductionService.split` 要求数量 `> 0`；SN 单独等于 1 | 在其他条件满足时，BATCH 数量 `0 < q < 1` 的代码与知识条件不同。 |
| `rule.production.mass-batch-quantity-distribution` | `split.quantityPerBatch >= 1` | `WorkOrderPage.addPendingBatch` 按每批数量模式要求输入 `> 0`，允许小数 | 同一区间内，每批数量候选生成的代码与知识条件不同。 |

[DEC-0012](../decisions/DEC-0012-production-work-order-and-production-object.yaml) 的 `DEC-0012-03` 确认 SN 等于 1 与总量边界；[DEC-0014](../decisions/DEC-0014-production-batch-staged-bulk-submission.yaml) 的 `DEC-0014-03/-09/-12` 确认数量必填、按批次数／每批数量分配及末批承接余数。这些声明没有明确确认 BATCH 必须 `>= 1`，也没有充分确认 `0 < q < 1` 的业务资格，原声明及验收场景保持不变。

**原始实现证据：**`WorkOrderPage.addPendingObject/addPendingBatch` 的页面校验、`ProductionService.split` 的 `BigDecimal.signum()` 检查，以及 [0062 数据库约束](../../../gmp-platform/backend/src/test/resources/db/changelog/0062-production-object-and-work-order-lifecycle.sql) 的 `CHECK(target_quantity > 0)` 按正数量处理；存储精度为 `DECIMAL(15,4)`。这些证据支持保留两个事实的 `decimal` 类型、实际来源与现有校验定位；它们不单独授权把该下限写成产品政策。

**保留为推断：**较早词条及规则中文解释中的正数量表述，与上述实现共同支持“旧 `>= 1` 可能混同数量与对象个数”的判断。但这仍不足以作为无需用户确认的规范纠错，也不能反向认定旧 `>= 1` 一定正确。用户此前要求先核对代码，不等于授权代码覆盖业务决定。

**本次已授权的纠正：**用户要求在同一 PR 修复上述过度确认，未选择数量下限。两条组合规则因此改为 `deprecated/internal`；`0d46558` 中的条件与结果原样保留作历史追溯，不构成当前准入依据。现有 schema 没有未决规则状态，且要求保留非空条件与结果，因此不删除条件形成更宽的生效规则，也不发明事实或谓词占位。`deprecated` 在这里撤回的是未经充分确认的组合表达，不取消数量必填和已确认的分配能力；当前代码、SN 数量等于 1、整数批次数、总量和存储边界均未改动。

**仍待业务决定：**[question.production-batch-quantity-lower-bound](../open-questions.yaml) 登记 `> 0` 与 `>= 1` 两种候选政策及其依据。后续在依赖数量下限的开发中澄清，并同时考虑已经确认的末批余数；不能擅自丢弃、补足余数或把阈值待决解释为取消校验。本次恢复待决记录已在授权范围内，不等待用户立即选择下限。未运行 `(0,1)` 的业务集成或数据库边界测试，不宣称该政策已确认、对应代码已修复或发布验收通过。

原审计清单及当时结论保留在固定候选历史中；本次修订记录、逐 ID 处置和实际验证单列于[数量下限补正](../../development/ontology-quantity-boundary-amendment-20261012/README.md)，不得用新代码状态改写原审计摘要或让历史完整性脚本充当未来回归门禁。

其余事实的通用运行读取器、精确源码符号映射与完整发布证据也不由本次修复自动获得。校验通过只能证明本次校验器明确覆盖的结构、引用、类型和投影约束，不能证明所有自然语言规则或生产行为都已一致。
