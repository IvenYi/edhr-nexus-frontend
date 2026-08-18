# eDHR 与冠骋参考资料清单

本文档用于帮助参与 eDHR 项目的开发人员，快速定位产品需求、当前实现、冠骋参考资料和结构化业务知识。可将本文件直接转发给协作者。

## 使用约定

- 本仓库中的相对路径均以 eDHR 仓库根目录为起点。
- 冠骋工程不在本仓库中。请在本机设置以下占位路径，或在阅读时替换为实际路径：

```text
CROWN_FRONTEND_ROOT  # 冠骋 eDHR 前端工程根目录
CROWN_BACKEND_ROOT   # 冠骋 eDHR 后端工程根目录
```

- 冠骋资料用于理解业务模型、页面交互、状态流转和实现证据，不是本产品的最终需求。用户已确认的产品决策、仓库内 PRD、知识模型和实现代码优先。
- 不直接照搬冠骋的低代码平台、通用框架、代码生成器及客户特有实现。
- 阅读和调研时需要标明资料来源：`crown-front`、`crown-back`、`crown-exploration`、`edhr-design`、`edhr-implementation` 或 `user-confirmed`。

## 建议阅读顺序

1. 阅读 [AGENTS.md](../../AGENTS.md) 和 [edhr-develop-need-read.md](../../edhr-develop-need-read.md)，了解项目协作、开发原则及已确认的产品方向。
2. 阅读 PRD、架构文档和当前功能设计规格，先建立 eDHR 自身的需求边界。
3. 阅读 `docs/knowledge/` 中的结构化知识资产，确认当前已知概念、规则、决策、证据和未决问题。
4. 对需要求证的生产、事务、DHR、表单、追溯或版本问题，再查阅冠骋探索资料和前后端代码。
5. 最后回到 eDHR 当前页面、后端接口、数据库实体与测试，确定实际已实现范围。

## eDHR 产品需求与设计资料

### 产品需求

- [MVP PRD](../prd/edhr-mvp-prd.md)：MVP 阶段范围和优先级。
- [商业版 PRD](../prd/edhr-commercial-prd.md)：商业化功能方向。
- [GMP 合规软件基座功能矩阵](../prd/GMP合规软件基座_功能矩阵PRD.md)：合规能力与功能矩阵。
- [eDHR 开发必读](../../edhr-develop-need-read.md)：产品背景、开发约束及重要结论。

### 关键设计规格与实施计划

- [P0 业务闭环与功能矩阵设计](../superpowers/specs/2026-06-05-edhr-p0-business-closure-and-function-matrix-design.md)
- [模板建模设计](../superpowers/specs/2026-06-23-template-modeling-design.md)
- [表单模板导入、保真与 OnlyOffice 设计](../superpowers/specs/2026-06-26-form-template-import-fidelity-and-onlyoffice-design.md)
- [产品簇与制程建模设计](../superpowers/specs/2026-08-11-product-family-process-modeling-design.md)
- [Word 文档组件管理设计](../superpowers/specs/2026-08-12-word-document-component-management-design.md)
- [工艺路线与工序管理计划](../superpowers/plans/2026-06-22-process-operation-management.md)
- [持久化智能体协作设计](../superpowers/specs/edhr-persistent-agent-collaboration-design.md)
- [持久化智能体协作实施计划](../superpowers/plans/2026-08-08-persistent-agent-collaboration.md)

### 生产、事务、追溯与版本架构

- [业务知识模型架构](../architecture/business-knowledge-model.md)：本体、规则、证据、决策和执行契约的分层。
- [本体驱动的影响分析与扩展开发](../architecture/ontology-driven-impact-analysis-and-extension-development.md)：基于知识模型进行需求影响分析和可维护扩展。
- [AI 赋能交付与事务运行时架构](../architecture/ai-enabled-custom-delivery-and-transaction-runtime.md)：事务编排、动作处理器、插件化扩展与 AI/Codex 协作边界。
- [事务、追溯与 DHR 业务规则](../architecture/transaction-traceability-dhr-business-rules.md)：事务、投影、追溯和 DHR 汇总的边界。
- [RDO 版本治理](../architecture/rdo-version-governance.md)：父子 RDO、版本、生效失效、审计和快照约束。
- [技术栈与 AI 开发说明](../architecture/technology-stack-and-ai-development.md)

### 业务流程图

- [eDHR 现有生产业务流程图](diagrams/2026-07-08-edhr-production-business-flow.png)
- [冠骋生产执行流程图](diagrams/crown-production-execution-workflow.png)
- [冠骋生产执行 Mermaid 源文件](diagrams/crown-production-execution-workflow.mmd)
- [eDHR 目标生产执行流程图](diagrams/edhr-target-production-execution-workflow.png)
- [eDHR 生产快照与追溯流程图](diagrams/edhr-production-execution-snapshot-and-traceability.png)
- [流程图说明](diagrams/production-workflow-diagrams.md)

## 结构化业务知识库

`docs/knowledge/` 是当前 eDHR 的机器可读业务知识基线。它记录已确认概念、规则、决策、证据和未决问题，不等同于完整代码依赖图。

- [知识库说明](../knowledge/README.md)
- [本体](../knowledge/ontology.yaml)：业务概念与关系。
- [术语表](../knowledge/glossary.yaml)：领域术语、别名和客户可见性。
- [产品制程规则](../knowledge/rules/product-process.yaml)
- [事务运行时规则](../knowledge/rules/transaction-runtime.yaml)
- [产品制程决策](../knowledge/decisions/DEC-0001-product-process-modeling.yaml)
- [产品簇制程决策](../knowledge/decisions/DEC-0002-product-family-process-modeling.yaml)
- [事务运行时决策](../knowledge/decisions/DEC-0003-ai-enabled-transaction-runtime.yaml)
- [本体驱动影响分析决策](../knowledge/decisions/DEC-0004-ontology-driven-impact-analysis.yaml)
- [产品制程实现证据](../knowledge/evidence/product-process.yaml)
- [事务运行时证据](../knowledge/evidence/transaction-runtime.yaml)
- [执行契约注册表](../knowledge/execution-contracts.yaml)
- [未决问题](../knowledge/open-questions.yaml)
- [知识模型 Schema](../knowledge/schema.yaml)

注意：`planned`、`specified`、`implemented` 与 `verified` 表示不同成熟度。未验证或规划中的规则不能当作已经可运行的生产能力。

## 冠骋探索资料

以下归档资料适合先了解冠骋页面、概念和生产业务的整体轮廓：

- [冠骋探索之旅文本归档](research/crown-exploration-extracted.txt)
- [冠骋事务模块调研](research/crown-transaction-module-research.md)
- [参考资料归档说明](README.md)

重点调研主题：

- RDO 父子结构、版本、生效失效、列表操作栏、字段设置、详情与数据审计；
- 物料、产品、产品簇、工序、工艺路线、制程配置；
- DHR 模板、表单模板、目录引用、文档引用、PDF 页码配置；
- 工单、批次、SN、生产工作台、工序开工/完工、表单填报；
- 事务定义、流程节点、条件分支、子事务、事务实例和事务追溯；
- DHR 汇总、审核、正向追溯与逆向追溯。

## 冠骋前端代码参考

工程根目录：

```text
CROWN_FRONTEND_ROOT
```

前端调研以菜单结构、RDO 页面交互和业务表达为主。优先查找以下能力对应的页面、组件、接口调用和枚举：

- RDO 列表页：父子版本展开、列设置、操作栏图标、详情、审计；
- 主数据：物料、产品、产品簇、工序、工艺路线、制程配置；
- 模板：DHR/批记录模板、表单、SOP/文档、目录与引用关系；
- 生产：工单、批次、SN、生产工作台、报工和表单实例；
- 事务：事务列表、事务配置、流程编排、节点、条件、子事务与追溯。

工程中已有的调研辅助文档：

```text
CROWN_FRONTEND_ROOT/docs/edhr-rebuild/MVP-PRD.md
CROWN_FRONTEND_ROOT/docs/edhr-rebuild/IMPLEMENTATION-PLAN.md
CROWN_FRONTEND_ROOT/docs/edhr-rebuild/FUNCTION-MODULE-PRIORITY.md
CROWN_FRONTEND_ROOT/docs/edhr-rebuild/CODE-MAP.md
```

建议搜索关键词：

```text
DHR
dhr
Edhr
edhr
Product
ProductFamily
Process
Route
Operation
Transaction
Txn
transaction
txn
Form
Document
SOP
Audit
Trace
version
status
effective
expire
引用
建模追溯
```

## 冠骋后端代码参考

工程根目录：

```text
CROWN_BACKEND_ROOT
```

核心业务根路径：

```text
CROWN_BACKEND_ROOT/src/main/java/com/gct/apaas/edhr
```

### 生产、工单与事务

重点包：

```text
order/
transaction/biz/
transaction/method/
transaction/entity/
transaction/enums/
```

代表性文件：

```text
order/biz/MfgOrderSaveBs.java
order/biz/MfgOrderSaveBatchBs.java
order/biz/MfgOrderSplitContainerBs.java
order/biz/MfgOrderSplitSNBs.java
transaction/biz/ContainerWorkStartBs.java
transaction/biz/ContainerWorkCompleteBs.java
transaction/biz/SNWorkStartBs.java
transaction/biz/SNWorkCompleteBs.java
transaction/biz/ReworkWithSnBs.java
transaction/biz/TxnDefinitionListPublishedSearchBs.java
transaction/method/TxnExecuteService.java
transaction/method/TxnRefApi.java
transaction/method/CreateFormInstOfStartWork.java
transaction/entity/TxnMainlineEntity.java
transaction/entity/TxnInstEntity.java
transaction/entity/TxnDefinitionEntity.java
transaction/entity/TxnNodeStatusEntity.java
transaction/entity/TxnUsageRuleEntity.java
```

调研时重点理解：工单创建、批次/SN 拆分、开工/完工、事务实例、事务主线、事务引用关系以及表单实例创建的时机。

### 表单、DHR、追溯和审核

重点包：

```text
form/
datacollection/
edhr/
notebook/
trace/
approve/
```

代表性文件：

```text
form/biz/FormInstGetListBs.java
form/biz/FormTmplGetBs.java
form/biz/DhrOnlineFormTmplCheckBeforeDeleteBs.java
form/entity/OnlineFormInstanceEntity.java
form/entity/OnlineFormMainlineEntity.java
form/method/InstanceRelationGetListMethod.java
form/hardcode/CreateFormInstance4Edhr.java
edhr/biz/SummaryReportSaveBs.java
edhr/biz/SummaryReportFinishBs.java
edhr/biz/EdhrReverseTraceBs.java
notebook/FormTraceManager.java
approve/handler/business/OnlineFormChangeProcessHandler.java
```

调研时重点理解：模板与实例关系、实例关联、DHR 汇总、审计/审核、追溯索引、表单作废/变更的投影处理。

### 其他业务模块

```text
bom/
product/
route/
operation/
process/
equipment/
production-line/
permission/
audit/
message/
integration/
```

重点理解 BOM 和物料消耗、产品制程、工艺路线与工序、设备与生产线、权限、审计和外部集成与生产执行之间的边界。

## eDHR 当前实现代码参考

以下是当前主数据、模板、合规审计和知识模型的关键实现入口。调研或修改前，应先在当前分支确认文件是否仍为对应能力的入口。

### 前端

```text
gmp-platform/frontend/src/pages/master-data/ProductModelingPage.tsx
gmp-platform/frontend/src/pages/master-data/ProductModelingWorkspacePage.tsx
gmp-platform/frontend/src/pages/master-data/ProductFamilyPage.tsx
gmp-platform/frontend/src/pages/master-data/ProductFamilyModelingPage.tsx
gmp-platform/frontend/src/pages/master-data/ProcessModelingPage.tsx
gmp-platform/frontend/src/pages/master-data/RoutePage.tsx
gmp-platform/frontend/src/pages/master-data/OperationPage.tsx
gmp-platform/frontend/src/pages/master-data/DocumentManagementPage.tsx
gmp-platform/frontend/src/pages/master-data/DhrTemplateWorkspaceDialog.tsx
gmp-platform/frontend/src/pages/master-data/components/ProductProcessVersionEditorDialog.tsx
gmp-platform/frontend/src/pages/system/AuditLogPage.tsx
```

### 后端

```text
gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/ProcessModelingController.java
gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/ProductProcessController.java
gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/RouteController.java
gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/OperationController.java
gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/DocumentManagementController.java
gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/service/ProductProcessOwnerService.java
gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/service/ProductProcessResolutionService.java
gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/service/ProductFamilyMembershipService.java
gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/ProductProcessVersion.java
gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/ProductProcessOperationBinding.java
gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/ProductProcessOperationFormBinding.java
gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/ProductProcessOperationDocumentBinding.java
gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/ProductFamily.java
gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/ProductFamilyMember.java
gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/DhrTemplateWorkspaceController.java
gmp-platform/backend/src/main/java/com/zencas/edhr/template/entity/DhrTemplateVersion.java
gmp-platform/backend/src/main/java/com/zencas/edhr/template/entity/DhrTemplateItem.java
gmp-platform/backend/src/main/java/com/zencas/edhr/template/entity/FormTemplateVersion.java
gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/controller/AuditController.java
gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/entity/AuditEvent.java
```

### 关键测试

```text
gmp-platform/backend/src/test/java/com/zencas/edhr/knowledge/BusinessKnowledgeModelTest.java
gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/controller/ProductProcessControllerTest.java
gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/controller/ProcessModelingControllerTest.java
gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/service/ProductProcessResolutionServiceTest.java
```

## 调研与开发边界

1. 冠骋页面或代码只能作为证据与灵感。eDHR 的最终规则以用户确认、仓库内知识模型、设计文档和当前实现为准。
2. 对版本、状态、生效失效、审计、追溯、DHR 快照、生产阻断和事务执行等关键问题，需要同时查看设计、知识库、实现和测试，不能仅根据截图判断。
3. `planned`、`specified` 或未验证能力不得写成 `implemented`、`verified`，也不能直接进入客户问答或生产运行时。
4. 本体知识库用于结构化沉淀概念、规则、证据、决策和影响关系；它不自动替代对页面、API、数据库、审计和测试的核对。
5. 需要实现需求变更时，先基于该清单定位相关资料，再遵循 [AGENTS.md](../../AGENTS.md) 的决策包、影响分析、本体门禁和质量门禁要求。

## 给协作者的最小调研任务模板

```markdown
### 调研主题

例如：冠骋的工单创建如何选择产品制程版本，并如何冻结快照。

### 已查资料

- eDHR 设计/知识库：
- 冠骋探索资料：
- 冠骋前端：
- 冠骋后端：
- eDHR 当前实现：

### 结论

- 已确认事实：
- 仅为冠骋参考、不能直接迁移的内容：
- eDHR 当前已实现/未实现范围：
- 仍需产品确认的问题：

### 证据

- 文件路径、关键类/组件/接口或截图来源：
```

