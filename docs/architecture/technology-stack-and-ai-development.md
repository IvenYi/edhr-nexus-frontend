# 技术栈与 AI 协作开发策略

## 1. 文档目的

本文档用于确定 eDHR 项目的推荐技术栈，并说明在“AI 深度参与开发和后续二开交付”的前提下，工程设计需要遵守的原则。

本项目是面向医疗器械企业的 ToB 合规软件，核心要求不是追新，而是：

- 可商用；
- 可私有化部署；
- 未来可演进为 SaaS/专有云；
- 支持大量批次、记录、审计和归档数据；
- 后端稳定、主流、易维护；
- 前端具备科技感、优雅、克制、合规稳健的企业级体验；
- 适合 AI 持续参与开发、测试、二开和交付。

## 2. 推荐技术栈

### 2.1 总体结论

```text
前端：React + TypeScript + Vite + Ant Design + TanStack Query
后端：Java 21 LTS + Spring Boot + Spring Security + Spring Batch
数据库：PostgreSQL 17/18
缓存/锁：Redis
文件存储：MinIO / S3 Compatible
数据库变更：Liquibase
API 契约：OpenAPI
部署：Docker Compose 起步，后续支持 Kubernetes/Helm
架构：模块化单体优先，暂不做微服务
辅助工具：Python 仅用于脚本、数据处理、模板转换和未来可选 AI 服务
```

### 2.2 后端

推荐：

```text
Java 21 LTS
Spring Boot
Spring Security
Spring Data JPA / JDBC 按场景选择
Spring Batch
Maven
Liquibase
JUnit 5
Testcontainers
```

选择理由：

- Java + Spring Boot 是 ToB 企业软件中最稳健、主流、长期可维护的组合之一。
- 强类型和编译期检查能减少 AI 生成代码时的隐性错误。
- Spring Security 适合实现认证、授权、会话、安全策略和敏感操作控制。
- Spring Batch 适合处理 DHR 归档、批量导入、审计归档、完整性重算、追溯索引重建等大批量任务。
- Java 生态对私有化部署、国产企业 IT 环境、长期维护和人员招聘更友好。
- 对医疗器械 eDHR 这种 GxP 相关系统，事务一致性、审计追踪、签名、权限和稳定性比快速原型更重要。

### 2.3 前端

推荐：

```text
React
TypeScript
Vite
Ant Design
TanStack Query
React Router
Zustand 或轻量状态管理
Playwright
```

选择理由：

- React + TypeScript 是 AI 最容易稳定生成和维护的前端组合之一。
- Vite 适合内部 ToB SPA，启动和构建简单，不需要 Next.js 的 SSR 复杂度。
- Ant Design 适合企业级后台系统，表格、表单、弹窗、步骤、筛选、权限页面、详情页都成熟。
- TanStack Query 适合服务端状态管理，能减少前端手写请求和缓存逻辑。
- Playwright 适合验证关键 ToB 流程，例如登录、记录填写、签名、审核和放行。

前端风格建议：

- 不是炫酷大屏风，而是“医疗器械质量系统”的专业感。
- 浅色主界面为主，深色侧边栏可选。
- 主色建议青蓝、蓝绿或中性蓝，状态色明确区分正常、待处理、警告、阻断、已放行。
- 页面信息密度要适合 QA、生产主管和质量负责人长时间使用。
- 审计、签名、放行、异常等高风险操作要清晰、克制、不可误点。
- 不用夸张渐变、复杂动效或装饰性视觉，避免削弱合规软件的可信感。

### 2.4 数据库与存储

推荐：

```text
PostgreSQL 17/18
Redis
MinIO / S3 Compatible Object Storage
Liquibase
```

选择理由：

- PostgreSQL 适合承载结构化 DHR、字段值、审计事件、签名、追溯查询和归档元数据。
- PostgreSQL 支持 JSONB、分区表、复杂索引和事务，适合模板结构与记录实例混合建模。
- Redis 用于缓存、短期锁、任务去重、频率限制和会话辅助，不作为核心证据数据存储。
- MinIO/S3 用于附件、图片、报告、DHR 归档包、导出文件等对象存储。
- Liquibase 负责数据库版本迁移，所有 schema 变化必须可追踪、可回放、可审查。

数据建模建议：

```text
模板结构：TemplateVersion 使用 JSONB 保存结构，但版本生效后不可变
记录实例：RecordInstance 使用关系表建模状态、所有者、生命周期
字段值：RecordFieldValue 使用结构化字段值表，并保留必要 raw_value
审计事件：AuditEvent 独立 append-only 表，后续按时间/租户/工厂分区
签名记录：Signature 独立表，绑定签名对象、签名含义、对象快照/hash
附件/归档：文件存 MinIO，数据库保存元数据、hash、关联对象和审计信息
```

## 3. 架构策略

### 3.1 模块化单体优先

第一阶段采用模块化单体，不做微服务。

原因：

- eDHR 核心流程强事务、强一致性、强审计，微服务会增加事务和部署复杂度。
- 私有化部署客户更容易接受单体应用 + PostgreSQL + Redis + MinIO 的组合。
- AI 开发时，模块化单体更容易理解上下文和维护边界。
- 未来如果数据量、团队规模或部署模式需要，可以按模块拆分服务。

### 3.2 推荐后端模块

```text
identity      组织、工厂、用户、角色、权限、认证
audit         审计追踪、审计查询、审计导出
signature     电子签名、二次认证、签名对象快照
workflow      状态机、任务流转、审批/退回/更正规则
records       模板、模板版本、记录实例、字段值
dhr           DHR 实例、完整性检查、放行阻断、追溯聚合
release       QA 审核、放行决定、证据冻结
files         附件、图片、报告、归档包、对象存储
integration   导入、外部系统引用、OpenAPI/Webhook
common        通用异常、时间、ID、租户上下文、审计上下文
```

### 3.3 推荐前端模块

```text
identity      登录、用户、角色、权限
dashboard     首页、待办、状态概览
templates     记录模板、模板版本、规则配置
dhr           DHR 列表、DHR 详情、记录执行
review        QA 审核、例外项、退回
release       放行清单、放行签名、归档
traceability  追溯查询
audit         审计追踪查询
settings      字典、编号规则、系统配置
shared        通用组件、布局、表格、表单、状态标签
```

## 4. Python 的定位

不建议用 Python 作为核心 eDHR 后端。

原因：

- 核心 eDHR 更需要事务一致性、权限安全、审计追踪、批量任务、长期维护和私有化部署稳定性。
- Java/Spring Boot 在医疗器械 ToB 系统的稳定性、组织接受度和工程生态上更适合做核心。
- Python 更适合作为工具和未来 AI 能力的补充，而不是承载核心受控记录和放行逻辑。

推荐 Python 使用范围：

```text
tools/
  数据迁移脚本
  历史 Excel/Word 模板解析
  批量导入辅助
  报表/归档包辅助检查

ai-service/ 未来可选
  OCR
  文档理解
  AI 辅助证据分类
  AI 辅助配置建议
```

AI 服务边界：

- AI 不得静默修改受控记录。
- AI 不得作出最终放行决定。
- AI 输出必须有来源、版本、置信度或不确定性提示。
- AI 输出进入受控记录前必须人工确认。
- 默认不使用客户数据训练模型，除非合同明确允许。

## 5. AI 深度参与开发的工程原则

AI 可以深度参与：

- 需求拆解；
- 架构文档；
- 代码生成；
- 单元测试；
- 集成测试；
- 前端页面；
- API 契约；
- 数据库迁移；
- PR 自检；
- 代码审查；
- 客户二开。

但 AI 不应无人监管地决定：

- 合规宣称；
- 质量责任边界；
- 电子签名法律实现；
- 客户最终放行逻辑；
- 系统验证结论；
- 安全策略最终批准。

### 5.1 AI 友好不等于 Python 优先

AI 更喜欢的不是某一种语言，而是：

- 清晰模块边界；
- 强类型；
- 标准框架；
- 明确接口；
- 完整测试；
- 可读文档；
- 统一代码风格；
- 可执行验收标准。

Java + Spring Boot + React + TypeScript 很适合 AI 协作，因为它们主流、强类型、结构清晰、错误容易被编译器和测试暴露。

### 5.2 必须为 AI 准备的项目文档

建议第一阶段补齐：

```text
docs/architecture/domain-model.md
docs/architecture/module-boundaries.md
docs/architecture/audit-trail-design.md
docs/architecture/e-signature-design.md
docs/architecture/workflow-state-machine.md
docs/architecture/api-conventions.md
docs/architecture/database-conventions.md
docs/architecture/testing-strategy.md
```

这些文档不是形式主义，它们会显著提升 AI 后续开发准确率。

### 5.3 AI 开发任务拆分原则

不要给 AI 这种任务：

```text
实现 eDHR 系统
做一个审计追踪模块
完成电子签名
```

应该拆成：

```text
实现 AuditEvent 实体、Liquibase 迁移、Repository 和基础查询测试。
实现 record.updateField() 时自动生成字段级审计事件。
实现 Signature 实体和签名前二次认证接口契约。
为 DhrInstance 状态机增加非法流转单元测试。
```

每个 AI 任务都应有：

- 输入文件；
- 输出范围；
- 不允许修改的范围；
- 验收标准；
- 必须运行的测试。

### 5.4 AI 参与开发的质量门槛

关键合规模块必须满足：

- 有单元测试；
- 有集成测试；
- 有数据库迁移；
- 有审计追踪验证；
- 有权限验证；
- 有异常路径测试；
- 有文档说明。

重点模块：

```text
audit
signature
workflow
records
dhr
release
```

这些模块不能只靠页面测试，必须以后端测试为主。

## 6. 代码与目录建议

### 6.1 仓库结构建议

```text
backend/
  pom.xml
  src/main/java/...
  src/test/java/...
  src/main/resources/db/changelog/

frontend/
  package.json
  src/
  tests/

tools/
  python/
  scripts/

docs/
  prd/
  architecture/
  development/
  design/

deploy/
  docker-compose.yml
  helm/
```

如果第一阶段希望更快，也可以先保留当前前端根目录结构，但后续建议整理成 `frontend/` 与 `backend/` 分离。

### 6.2 后端编码约定

建议采用：

```text
Controller -> Application Service -> Domain Service -> Repository
DTO 与 Entity 分离
所有外部输入先校验
所有状态流转走统一状态机
所有受控修改走审计上下文
所有数据库变更走 Liquibase
所有签名/放行操作必须服务端验证权限
```

### 6.3 前端编码约定

建议采用：

```text
页面组件与业务组件分离
API 调用集中封装
表单 schema 可复用
状态标签统一
高风险操作必须确认
签名、放行、作废、退回等操作必须显示操作含义和影响
表格、筛选、详情页使用统一布局
```

## 7. 第一阶段落代码建议

优先级：

1. 初始化后端 Spring Boot 工程。
2. 初始化 PostgreSQL、Liquibase、Testcontainers。
3. 建立核心领域对象。
4. 实现 `identity` 最小权限模型。
5. 实现 `audit` 审计事件模型和服务。
6. 实现 `records` 模板版本和记录实例模型。
7. 实现 `signature` 电子签名模型。
8. 实现 `workflow` 基础状态机。
9. 实现 `dhr` 聚合和完整性检查雏形。
10. 前端再接入登录、DHR 列表、模板列表、审计查询等基础页面。

第一阶段不要先做：

- 复杂生产工艺；
- 完整检验项目库；
- 设备联网；
- 深度 ERP/MES/QMS 接口；
- 委托生产协同；
- 大屏看板；
- AI 功能。

## 8. 最终建议

本项目推荐采用“Java/Spring Boot 核心后端 + React/TypeScript 企业前端 + PostgreSQL 证据数据库 + MinIO 文件归档 + Docker 私有化部署”的稳健路线。

AI 深度参与开发是可行的，但真正决定效率的不是使用 Python，而是工程秩序：

```text
强类型
清晰边界
稳定框架
可执行测试
统一文档
明确验收
受控变更
```

因此，核心 eDHR 系统不需要为了 AI 改成 Python。Python 应作为工具层和未来 AI 服务层存在，而不是承载受控记录、签名、审计、放行等核心合规逻辑。
