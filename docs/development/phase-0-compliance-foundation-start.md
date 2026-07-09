# Phase 0 产品内核与流程底座开发启动说明

## 1. 当前是否可以开始落代码

可以开始。

当前产品范围、业务闭环、MVP PRD、正式商用版 PRD 和 P0 功能矩阵已经重新对齐。第一阶段不需要等待某一个行业客户的完整生产业务调研，可以先开发不强依赖具体品类、不强依赖客户工艺细节、但后续所有业务模块都会复用的产品内核、流程底座和批次生产闭环模型。

本阶段目标不是做完整 MES、完整检验、完整记录本或完整仓储，也不是做 Excel 式表单设计器，而是先把 eDHR 的可信底盘、流程运行、结构化模板、制程配置、事务配置、DHR 汇总和放行模型搭起来。

## 2. 必读文档

开始开发前先阅读：

- `README.md`
- `codeplzreadme.md`
- `docs/superpowers/specs/2026-06-05-edhr-p0-business-closure-and-function-matrix-design.md`
- `docs/prd/edhr-mvp-prd.md`
- `docs/prd/edhr-commercial-prd.md`

其中 P0 功能矩阵是当前最高优先级业务设计依据，MVP PRD 用于指导当前 Phase 0 和 Phase 1，商用版 PRD 用于避免早期架构走偏。

## 3. 推荐技术栈

### 3.1 后端

- Java 21 LTS
- Spring Boot
- Spring Security
- Spring Data JPA
- Spring Batch
- Maven
- PostgreSQL 17/18
- Liquibase
- Redis
- MinIO / S3 compatible storage

### 3.2 前端

- React
- TypeScript
- Vite
- Ant Design
- TanStack Query

### 3.3 测试与部署

- JUnit 5
- Testcontainers
- Playwright
- Docker Compose
- 后续预留 Kubernetes/Helm

### 3.4 架构策略

第一阶段采用模块化单体，不做微服务。

原因：

- 私有化部署更简单。
- 事务一致性更容易保证。
- 验证/确认范围更清晰。
- 初创阶段开发和调试成本更低。
- 后续可以按模块边界拆服务。

## 4. Phase 0 目标

Phase 0 的目标是实现 eDHR 的产品内核、流程底座和首条批次生产闭环所需的核心领域模型。

核心目标：

```text
建立领域模型
-> 建立权限与身份基础
-> 建立审计追踪
-> 建立电子签名模型
-> 建立审核流程、表单流程、事务流程
-> 建立结构化表单/DHR/放行单模板版本
-> 建立基础建模、工艺路线和制程配置
-> 建立事务定义、事务流程和事务实例
-> 建立工单、批次、工序执行和表单实例
-> 建立 DHR 实例、DHR 汇总和放行单
-> 建立最小完整性检查、放行阻断和追溯框架
```

## 5. Phase 0 范围内

### 5.1 工程骨架

- 初始化后端 Spring Boot 工程。
- 初始化前端 React/Vite 工程。
- 配置 PostgreSQL、Redis、MinIO 的 Docker Compose。
- 配置 Liquibase 数据库迁移。
- 配置基础测试框架。
- 配置基础 README 启动命令。

### 5.2 后端模块边界

建议先建立这些后端模块：

```text
identity      组织、用户、角色、权限
audit         审计追踪
signature     电子签名
workflow      状态机/任务流转
master-data   工厂、车间、产线、产品、设备、SOP、工序、原因
templates     表单模板、DHR 模板、放行单模板、模板版本
process       工艺路线、制程配置、工序绑定、事务显隐规则
transactions  事务定义、事务版本、事务流程、事务实例
production    工单、批次、SN 基础模型和查询、工序执行、生产过站
records       表单实例、字段值、表单审核
dhr           DHR 实例、DHR 汇总、完整性检查
release       放行单、放行审核、冻结
change        表单/DHR 变更、作废、受控更正
files         附件、归档包、文件元数据
common        通用异常、ID、时间、审计上下文
```

### 5.3 首批核心实体

优先实现这些实体和表结构：

```text
Organization
Site
Department
User
Role
Permission
UserRole
RolePermission

AuditEvent
Signature

WorkflowDefinition
WorkflowVersion
WorkflowNode
WorkflowEdge
WorkflowBindingRule
WorkflowInstance
WorkflowTask
WorkflowActionLog

Workshop
ProductionLine
ProductFamily
Product
ProductVersion
SopDocument
Equipment
Operation

FormTemplate
FormTemplateVersion
DhrTemplate
DhrTemplateVersion
ReleaseFormTemplate
ReleaseFormTemplateVersion

RouteVersion
ProcessVersion
ProcessOperationBinding
ProcessFormBinding
ProcessTransactionRule

TxnDefinition
TxnVersion
TxnNode
TxnEdge
TxnScopeRule
TxnInstance

WorkOrder
ProductionBatch
OperationExecution
FormInstance
FormFieldValue

DhrInstance
DhrSummaryVersion
DhrSummaryItem
ReleaseFormInstance
ArchivePackage
```

### 5.4 核心状态机

模板状态：

```text
DRAFT -> IN_REVIEW -> EFFECTIVE -> OBSOLETE
DRAFT -> VOIDED
IN_REVIEW -> RETURNED -> DRAFT
```

事务实例状态：

```text
CREATED -> RUNNING -> WAITING_TASK -> COMPLETED
RUNNING/WAITING_TASK -> RETURNED -> RUNNING
RUNNING/WAITING_TASK -> CONTROLLED_CLOSED
```

表单实例状态：

```text
OPEN -> SUBMITTED -> REVIEWED
SUBMITTED -> RETURNED -> OPEN
REVIEWED -> CORRECTION_PENDING -> CORRECTED -> REVIEWED
OPEN/SUBMITTED -> VOIDED
```

DHR 状态：

```text
CREATED -> IN_EXECUTION -> SUMMARIZING -> IN_REVIEW -> RELEASE_PENDING -> RELEASED -> ARCHIVED
IN_REVIEW -> RETURNED -> SUMMARIZING
RELEASE_PENDING -> RETURNED -> IN_REVIEW
RELEASED -> CORRECTION_PENDING -> CORRECTION_APPROVED -> RELEASED
```

DHR 汇总状态：

```text
DRAFT -> IN_REVIEW -> APPROVED
IN_REVIEW -> RETURNED -> DRAFT
APPROVED -> SUPERSEDED
```

放行单状态：

```text
PENDING -> APPROVED
PENDING -> REJECTED
PENDING -> CONDITIONAL_APPROVED
APPROVED/CONDITIONAL_APPROVED -> ARCHIVED
```

## 6. Phase 0 不做什么

本阶段不要做：

- 完整 SN 生产深度和连续生产。
- 完整检验项目库。
- 完整记录本。
- 复杂物料平衡。
- 完整偏差/CAPA 流程。
- ERP/MES/WMS/QMS/DMS/LIMS 深度集成。
- 设备/仪器数据采集。
- 跨组织/委外完整协同。
- AI 表单还原和 AI 证据检查。
- 复杂看板或大屏。
- 过度漂亮的 UI 动效。
- 微服务拆分。

本阶段也不要把产品做成通用低代码表单平台。所有能力都必须服务于 DHR 证据、生产执行、表单审核、事务处理、DHR 汇总、审核放行、追溯或受控电子记录数据完整性。

## 7. 第一轮可实现的纵向内核

第一轮代码应能跑通这个最小批次生产闭环：

```text
创建组织和用户
-> 创建角色和权限
-> 创建表单模板、DHR 模板、放行单模板
-> 发布模板版本
-> 创建工艺路线和制程配置
-> 创建事务定义和事务流程
-> 创建工单和批次
-> 按制程生成 DHR 实例、工序执行和表单实例
-> 填写表单字段并自动生成审计事件
-> 对表单实例执行电子签名
-> 触发一个事务并生成事务表单
-> 按 DHR 模板汇总表单和事务证据
-> 执行 DHR 完整性检查
-> 生成放行单并完成放行签名
-> 归档冻结并可追溯
```

这不是大而全产品演示，而是验证 eDHR 内核、流程运行、制程配置、事务驱动和 DHR 汇总是否成立。

## 8. 审计追踪设计原则

审计追踪是 P0。

必须满足：

- 记录操作人。
- 记录操作时间。
- 记录操作对象类型和对象 ID。
- 记录操作类型。
- 记录原值和新值。
- 记录操作原因，必要操作必须强制填写原因。
- 记录来源，如 UI、API、系统任务、导入。
- 普通应用功能不能删除或修改审计事件。

优先覆盖：

- 用户/角色/权限变更。
- 模板创建、修改、发布、作废。
- 流程定义、发布、绑定和运行干预。
- 制程配置、事务定义、事务实例处理。
- DHR 创建和状态流转。
- 表单字段修改。
- 表单提交、退回、复核。
- DHR 汇总、退回和审核。
- 电子签名。
- 放行单和放行决定。
- 变更/作废。
- 导出归档包。

## 9. 电子签名设计原则

电子签名是 P0。

签名记录至少包含：

- 签名人。
- 签名时间。
- 签名含义。
- 签名对象类型。
- 签名对象 ID。
- 签名前认证事件。
- 签名对象快照或哈希。
- 签名后冻结范围。
- 签名失效或重新签名规则。

第一阶段可先实现应用内电子签名模型和二次认证接口，不急于集成 CA。CA、USBKey、企业微信/钉钉身份、第三方电子签章可作为后续增强。

## 10. 数据模型建议

不要把所有记录都塞进一个 JSON。

建议采用混合模型：

```text
模板结构：FormTemplateVersion.schema_json，JSONB，版本化，不可变
流程结构：WorkflowVersion.definition_json，JSONB，发布后不可变
制程结构：ProcessVersion，关系表 + 必要 JSONB，发布后不可变
事务结构：TxnVersion.definition_json，JSONB，发布后不可变
表单实例：FormInstance，关系表
字段值：FormFieldValue，结构化字段值表，必要时带 raw_value_json
DHR 汇总：DhrSummaryVersion + DhrSummaryItem，保留来源对象和汇总版本
审计事件：AuditEvent，append-only 独立表
签名记录：Signature，独立表，绑定对象快照/hash
附件/归档包：MinIO 存文件，数据库存元数据
```

大表预留：

- `org_id`
- `site_id`
- `created_at`
- `updated_at`
- `status`
- 业务主键索引
- 后续分区和归档策略

未来可能很大的表：

- `audit_event`
- `form_field_value`
- `form_instance`
- `workflow_action_log`
- `txn_instance`
- `dhr_summary_item`
- `dhr_instance`
- `archive_package`

## 11. 前端风格方向

前端应是商业级 ToB 生产质量系统风格：

- 稳健。
- 清爽。
- 科技感但不炫技。
- 高信息密度但不拥挤。
- 强状态表达。
- 审核、签名、放行等高风险操作要有明确确认。

推荐视觉方向：

- Ant Design 企业级组件体系。
- 浅色主界面。
- 深色侧边导航可选。
- 主色建议青蓝、蓝绿或中性蓝。
- 状态色清晰区分：待处理、执行中、异常、已复核、已放行、已归档。
- 表格、详情页、时间线、审计轨迹、状态标签是核心体验。

第一阶段前端只需要基础框架、布局和少量管理页面，不需要做完整业务体验。

## 12. 第一阶段验收标准

Phase 0 完成时，至少应满足：

1. 项目可以一键本地启动。
2. 数据库迁移可重复执行。
3. 可以创建组织、用户、角色、权限。
4. 可以创建审核流程、表单流程、事务流程并发布版本。
5. 可以创建表单模板、DHR 模板、放行单模板，且生效版本不可被静默修改。
6. 可以创建基础主数据、工艺路线和制程配置。
7. 可以创建事务定义和事务版本。
8. 可以创建工单、批次、DHR 实例、工序执行和表单实例。
9. 修改表单字段会产生审计追踪。
10. 表单实例可以签名，签名后关键内容不能被普通修改。
11. 可以触发一个事务实例并生成事务表单。
12. 可以按 DHR 模板生成 DHR 汇总版本。
13. 可以执行最小 DHR 完整性检查。
14. 可以生成放行单、完成放行签名并冻结 DHR。
15. 可以从 DHR 追溯到表单、事务、工序、签名、审计和流程日志。
16. 关键逻辑有自动化测试。

## 13. 推荐第一批开发任务

建议按这个顺序：

1. 初始化工程骨架和 Docker Compose。
2. 建立数据库迁移和基础实体。
3. 实现 identity 模块。
4. 实现 audit 模块。
5. 实现 signature 模块。
6. 实现 workflow 模块的流程定义、版本、任务和日志。
7. 实现 master-data 模块。
8. 实现 templates 模块的表单/DHR/放行单模板和版本。
9. 实现 process 模块的工艺路线和制程配置。
10. 实现 transactions 模块的事务定义、事务版本和事务实例。
11. 实现 production 模块的工单、批次和工序执行。
12. 实现 records 模块的 FormInstance 和 FormFieldValue。
13. 实现 dhr 模块的 DHR 实例、汇总版本和完整性检查。
14. 实现 release 模块的放行单和冻结。
15. 补充架构文档。
16. 补充测试。

## 14. 推荐新增文档

开发过程中建议新增：

```text
docs/architecture/domain-model.md
docs/architecture/module-boundaries.md
docs/architecture/audit-trail-design.md
docs/architecture/e-signature-design.md
docs/architecture/workflow-state-machine.md
docs/architecture/process-and-transaction-design.md
docs/architecture/dhr-summary-design.md
docs/architecture/data-retention-and-archive.md
```

这些文档会帮助后续伙伴在同一个基座上设计生产、检验、记录本、物料、追溯和放行业务模块。

## 15. 新上下文启动提示词

可以在新上下文中直接使用：

```text
请基于 /Users/ivenwang/Documents/edhr-nexus 仓库开始第一阶段开发。

先阅读：
- README.md
- codeplzreadme.md
- docs/superpowers/specs/2026-06-05-edhr-p0-business-closure-and-function-matrix-design.md
- docs/prd/edhr-mvp-prd.md
- docs/prd/edhr-commercial-prd.md
- docs/development/phase-0-compliance-foundation-start.md

目标是初始化工程骨架，并优先实现商业级可定制 eDHR 的 Phase 0 产品内核、流程底座和批次生产闭环模型。

技术栈建议：
- 后端：Java 21 + Spring Boot + Spring Security + Spring Data JPA + Spring Batch + Maven
- 数据库：PostgreSQL + Liquibase
- 缓存：Redis
- 文件：MinIO
- 前端：React + TypeScript + Vite + Ant Design + TanStack Query
- 部署：Docker Compose 起步，后续预留 Kubernetes/Helm

架构采用模块化单体，不要做微服务。优先模块：
identity、audit、signature、workflow、master-data、templates、process、transactions、production、records、dhr、release、change、files、common。

第一轮目标不是做完整业务页面，而是跑通：
创建基础主数据 -> 创建表单/DHR/放行单模板 -> 创建工艺路线和制程配置 -> 创建事务定义 -> 创建工单/批次 -> 生成 DHR/工序/表单实例 -> 修改字段留审计 -> 电子签名 -> 触发事务 -> DHR 汇总 -> 完整性检查 -> 放行单签名 -> 归档冻结与追溯。

请先给出实施计划，然后开始落代码。
```

## 16. 注意事项

- 不要把审计追踪和电子签名后补，它们是底座。
- 不要一开始做完整检验、记录本、仓储、设备和深度集成，但 P0 必须建好流程、制程、事务和 DHR 汇总模型。
- 不要把系统做成泛表单工具。
- 不要承诺系统自动保证客户整体质量体系或法规合规。
- 要明确软件自身必须围绕 eDHR 预期用途进行受控设计和可验证交付。
- 所有关键状态变化都要可审计、可解释、可追溯。
