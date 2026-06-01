# Phase 0 合规可信基座开发启动说明

## 1. 当前是否可以开始落代码

可以开始。

当前产品范围、法规锚点、MVP PRD 和正式商用版 PRD 已经沉淀完成。第一阶段不需要等待完整生产业务调研，可以先开发不强依赖具体品类、不强依赖客户工艺细节、但后续所有业务模块都会复用的合规可信基座和产品内核。

本阶段目标不是做完整 eDHR 业务页面，也不是做生产记录模板细节，而是先把 eDHR 的可信底盘搭起来。

## 2. 必读文档

开始开发前先阅读：

- `README.md`
- `codeplzreadme.md`
- `docs/prd/edhr-mvp-prd.md`
- `docs/prd/edhr-commercial-prd.md`

其中 MVP PRD 用于指导当前 Phase 0 和 Phase 1，商用版 PRD 用于避免早期架构走偏。

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
- CSV/CSA 验证范围更清晰。
- 初创阶段开发和调试成本更低。
- 后续可以按模块边界拆服务。

## 4. Phase 0 目标

Phase 0 的目标是实现 eDHR 的合规可信基座和核心领域模型。

核心目标：

```text
建立领域模型
-> 建立权限与身份基础
-> 建立审计追踪
-> 建立电子签名模型
-> 建立受控记录状态机
-> 建立模板版本与记录实例关系
-> 建立 DHR 实例聚合
-> 建立最小完整性检查和放行阻断框架
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
records       模板、模板版本、记录实例
dhr           DHR 实例聚合、完整性检查
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

RecordTemplate
TemplateVersion
RecordInstance
RecordFieldValue

DhrInstance
ReleaseDecision
ArchivePackage
```

### 5.4 核心状态机

模板状态：

```text
DRAFT -> IN_REVIEW -> EFFECTIVE -> OBSOLETE
DRAFT -> VOIDED
IN_REVIEW -> RETURNED -> DRAFT
```

DHR 状态：

```text
CREATED -> IN_EXECUTION -> IN_REVIEW -> RELEASE_PENDING -> RELEASED -> ARCHIVED
IN_REVIEW -> RETURNED -> IN_EXECUTION
RELEASE_PENDING -> RETURNED -> IN_REVIEW
RELEASED -> CORRECTION_PENDING -> CORRECTION_APPROVED -> RELEASED
```

记录实例状态：

```text
OPEN -> SUBMITTED -> REVIEWED
SUBMITTED -> RETURNED -> OPEN
REVIEWED -> CORRECTION_PENDING -> CORRECTED -> REVIEWED
OPEN/SUBMITTED -> VOIDED
```

放行决定状态：

```text
PENDING -> APPROVED
PENDING -> REJECTED
PENDING -> CONDITIONAL_APPROVED
APPROVED/CONDITIONAL_APPROVED -> ARCHIVED
```

## 6. Phase 0 不做什么

本阶段不要做：

- 完整生产路线建模。
- 完整检验项目库。
- 复杂物料平衡。
- 完整偏差/CAPA 流程。
- ERP/MES/WMS/QMS/DMS/LIMS 深度集成。
- 设备/仪器数据采集。
- 委托生产完整协同。
- 复杂看板或大屏。
- 过度漂亮的 UI 动效。
- 微服务拆分。

本阶段也不要把产品做成通用低代码表单平台。所有能力都必须服务于 DHR 证据、电子记录数据完整性、追溯、审核放行或软件确认/验证。

## 7. 第一轮可实现的纵向内核

第一轮代码应能跑通这个非业务化闭环：

```text
创建组织和用户
-> 创建角色和权限
-> 创建记录模板
-> 发布模板版本
-> 创建 DHR 实例
-> 从模板版本生成记录实例
-> 修改记录字段并自动生成审计事件
-> 对记录实例执行电子签名
-> 签名后冻结记录或触发受控更正规则
-> 执行 DHR 完整性检查
```

这不是产品演示 demo，而是验证 eDHR 内核是否成立。

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
- DHR 创建和状态流转。
- 记录字段修改。
- 记录提交、退回、复核。
- 电子签名。
- 放行决定。
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
模板结构：TemplateVersion.schema_json，JSONB，版本化，不可变
记录实例：RecordInstance，关系表
字段值：RecordFieldValue，结构化字段值表，必要时带 raw_value_json
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
- `record_field_value`
- `record_instance`
- `dhr_instance`
- `archive_package`

## 11. 前端风格方向

前端应是医疗器械 ToB 质量系统风格：

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
- 主色建议青蓝或医疗科技蓝。
- 状态色清晰区分：待处理、执行中、异常、已复核、已放行、已归档。
- 表格、详情页、时间线、审计轨迹、状态标签是核心体验。

第一阶段前端只需要基础框架、布局和少量管理页面，不需要做完整业务体验。

## 12. 第一阶段验收标准

Phase 0 完成时，至少应满足：

1. 项目可以一键本地启动。
2. 数据库迁移可重复执行。
3. 可以创建组织、用户、角色、权限。
4. 可以创建模板和模板版本。
5. 生效模板版本不可被静默修改。
6. 可以创建 DHR 实例。
7. 可以从模板版本生成记录实例。
8. 修改记录字段会产生审计追踪。
9. 记录实例可以签名。
10. 签名后关键内容不能被普通修改。
11. 可以执行最小 DHR 完整性检查。
12. 关键逻辑有自动化测试。

## 13. 推荐第一批开发任务

建议按这个顺序：

1. 初始化工程骨架和 Docker Compose。
2. 建立数据库迁移和基础实体。
3. 实现 identity 模块。
4. 实现 audit 模块。
5. 实现 records 模块的模板和版本。
6. 实现 dhr 模块的 DHR 实例。
7. 实现 RecordInstance 和 RecordFieldValue。
8. 实现 signature 模块。
9. 实现 workflow 状态流转约束。
10. 实现最小完整性检查。
11. 补充架构文档。
12. 补充测试。

## 14. 推荐新增文档

开发过程中建议新增：

```text
docs/architecture/domain-model.md
docs/architecture/module-boundaries.md
docs/architecture/audit-trail-design.md
docs/architecture/e-signature-design.md
docs/architecture/workflow-state-machine.md
docs/architecture/data-retention-and-archive.md
```

这些文档会帮助后续伙伴在同一个基座上设计生产、检验、追溯和放行业务模块。

## 15. 新上下文启动提示词

可以在新上下文中直接使用：

```text
请基于 /Users/ivenwang/Documents/edhr-nexus 仓库开始第一阶段开发。

先阅读：
- README.md
- codeplzreadme.md
- docs/prd/edhr-mvp-prd.md
- docs/prd/edhr-commercial-prd.md
- docs/development/phase-0-compliance-foundation-start.md

目标是初始化工程骨架，并优先实现医疗器械 eDHR 的 Phase 0 合规可信基座和领域内核。

技术栈建议：
- 后端：Java 21 + Spring Boot + Spring Security + Spring Data JPA + Spring Batch + Maven
- 数据库：PostgreSQL + Liquibase
- 缓存：Redis
- 文件：MinIO
- 前端：React + TypeScript + Vite + Ant Design + TanStack Query
- 部署：Docker Compose 起步，后续预留 Kubernetes/Helm

架构采用模块化单体，不要做微服务。优先模块：
identity、audit、signature、workflow、records、dhr、files、common。

第一轮目标不是做完整业务页面，而是跑通：
创建模板版本 -> 生成 DHR 实例 -> 生成记录实例 -> 修改字段留审计 -> 电子签名 -> 签名后冻结 -> DHR 完整性检查。

请先给出实施计划，然后开始落代码。
```

## 16. 注意事项

- 不要把审计追踪和电子签名后补，它们是底座。
- 不要一开始做复杂生产业务模块，等伙伴完成业务调研后再接入。
- 不要把系统做成泛表单工具。
- 不要承诺系统自动保证客户整体 GMP 合规。
- 要明确软件自身必须围绕 eDHR 预期用途进行合规设计和可验证交付。
- 所有关键状态变化都要可审计、可解释、可追溯。
