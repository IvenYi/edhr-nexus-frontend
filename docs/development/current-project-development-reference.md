# eDHR 当前项目开发参考

> 更新时间：2026-08-26  
> 用途：帮助开发人员和 AI 在修改功能前，快速理解当前项目结构、真实实现范围、参考资料边界和强制开发规则。  
> 性质：开发导航与核对清单，不替代用户确认、PRD、结构化业务知识、源码、数据库迁移和测试。

## 1. 项目定位

本项目是商业级、可配置、可私有化部署的 eDHR 产品与工程仓库，面向批次/SN 生产记录、DHR 汇总、审核放行、追溯和受控电子记录等数据完整性场景。

医疗器械、GMP、CSV/CSA 是重要的高监管实施参考和验证场景，但不是产品的唯一行业边界。

当前工程的主要实现重心是：

- 组织、用户、角色、权限与系统设置；
- 审计追踪、登录日志、电子签名和文件对象；
- 物料、工序、工艺路线、产品、产品簇和文档等主数据；
- 产品/产品簇制程及制程版本；
- 表单模板、批记录/DHR 模板及可视化设计器；
- 审核流程和生产作业模板配置。

完整生产工单、批次/SN 执行、作业运行实例、生产快照和端到端追溯仍存在规划或未完整实现的部分。不得把文档中的目标能力直接描述成当前已经可运行的功能。

## 2. 事实来源与优先级

出现规则冲突或实现歧义时，按以下顺序核对：

1. 用户本次明确确认的产品决策；
2. 当前仓库的结构化业务知识、有效设计和 PRD；
3. 当前分支的前后端源码、数据库迁移和测试；
4. eDHR 原始页面、接口和真实数据；
5. 冠骋原始前端、后端、数据库、接口、页面、截图或录屏；
6. 冠骋探索记录、摘要和其他二手资料。

调研结论应标明来源类别：

- `user-confirmed`：用户明确确认；
- `original-evidence`：从原始源码、数据库、接口或原始页面核对；
- `secondary-reference`：调研记录或摘要提供的二手线索；
- `inference`：基于证据推导但尚未确认；
- `unresolved`：会影响方案或验收、仍需用户判断的问题。

冠骋只能作为业务理解和实现证据，不是 eDHR 的最终需求。不得直接照搬其低代码平台、通用框架、代码生成器或客户特有逻辑。

eDHR 业务术语统一使用“作业”；冠骋源码和原始资料中的“事务 / transaction / Txn”在引用证据时保留原名。

## 3. 仓库与外部参考目录

### 3.1 eDHR 仓库

```text
E:\Zencas_医疗套件方案\edhr-nexus-frontend
├─ gmp-platform/
│  ├─ frontend/                  React 前端
│  ├─ backend/                   Spring Boot 后端
│  ├─ docs/                      平台局部文档
│  └─ docker-compose.yml         PostgreSQL、前后端容器编排
├─ docs/
│  ├─ agents/                    智能体角色和交接契约
│  ├─ architecture/              架构与业务规则说明
│  ├─ development/               开发和启动说明
│  ├─ design-audit/              UI 规范与设计审计
│  ├─ knowledge/                 结构化业务知识基线
│  ├─ prd/                       产品需求
│  ├─ reference-assets/          冠骋及其他参考资料索引
│  ├─ regulation/                合规资料
│  └─ superpowers/               设计规格与实施计划
├─ scripts/                      仓库级辅助脚本
├─ AGENTS.md                     项目治理与门禁
└─ codeplzreadme.md              强制编码行为准则
```

### 3.2 冠骋参考工程

```text
D:\EDHR\paas-datav-front         冠骋 eDHR 前端工程
D:\EDHR\gct-edhr-bed            冠骋 eDHR 后端工程
D:\EDHR\edhr-and-crown-reference-checklist.md
```

仓库内对应的参考索引：

```text
docs/reference-assets/edhr-and-crown-reference-checklist.md
```

外部 D 盘版本用于定位本机冠骋工程；仓库版本用于遵守当前项目的术语、证据和调研规则。两份文件不一致时，以当前仓库规则和用户确认优先。

## 4. 技术栈

### 4.1 前端

- React 18.3；
- TypeScript 5.4；
- Vite 5；
- Material UI 5 + Emotion；
- React Router 6；
- TanStack React Query 5；
- Axios；
- Zustand；
- React Hook Form + Zod；
- `@xyflow/react` 流程图/建模画布；
- ExcelJS、xlsx、JSZip 等模板导入处理工具。

### 4.2 后端

- Java 21；
- Spring Boot 3.3；
- Spring MVC、Validation、Security、AOP；
- Spring Data JPA + Hibernate；
- PostgreSQL 16；
- Liquibase；
- JWT + BCrypt；
- Lombok、MapStruct；
- SpringDoc OpenAPI；
- Apache POI、PDFBox；
- JUnit 5、Mockito、Spring Test、H2；
- 已声明 Testcontainers 依赖，但当前真实 PostgreSQL 集成测试覆盖有限。

## 5. 前端结构与入口

### 5.1 启动链路

```text
src/main.tsx
  -> src/App.tsx
  -> QueryClient / Theme / Snackbar / BrowserRouter
  -> src/router/index.tsx
  -> components/shared/AppLayout.tsx
  -> 业务页面
```

### 5.2 主要目录

```text
gmp-platform/frontend/src/
├─ api/              API 适配层
├─ components/       通用组件
├─ hooks/            共享 Hook
├─ pages/            页面和业务工作台
├─ router/           路由入口
├─ stores/           Zustand 状态
├─ types/            TypeScript 类型
└─ utils/            菜单、状态计算和工具
```

### 5.3 当前主要路由

- `/login`：登录；
- `/account/settings`：个人设置；
- `/master-data/materials`：物料管理；
- `/master-data/operations`：工序管理；
- `/master-data/routes`：工艺路线；
- `/master-data/products`：产品管理；
- `/master-data/products/:productVersionId/modeling`：产品制程兼容工作台；
- `/master-data/product-families`：产品簇；
- `/master-data/documents`：文档管理；
- `/master-data/form-templates`：表单模板；
- `/master-data/batch-record-templates`：批记录模板；
- `/workflow/review-templates`：审核流程模板；
- `/workflow/binding-rules`：流程绑定规则；
- `/workflow/instances`：流程实例；
- `/workflow/tasks/:id`：流程任务；
- `/production/work-templates`：生产作业模板；
- `/system/*`：组织、用户、角色、菜单、字典、图标、系统设置、登录日志、审计日志和签名记录。

修改页面前必须从 `src/router/index.tsx` 确认真实入口，不能仅凭文件名判断。仓库中存在旧页面和兼容工作台，未被路由使用的文件不应被误认为当前主入口。

### 5.4 共享页面和组件

主数据存在共享建模入口：

- `ProcessModelingPage.tsx`：物料、工序和工艺路线；
- `ProductModelingPage.tsx`：产品建模；
- `ProductFamilyModelingPage.tsx`：产品簇建模；
- `TemplateModelingPage.tsx`：表单模板与批记录模板；
- `ProductProcessVersionEditorDialog.tsx`：产品与产品簇复用的制程版本编辑器；
- `ProductModelingWorkspacePage.tsx`：仍保留路由的产品制程兼容工作台。

常用共享组件：

- `AppDialog`；
- `ConfirmDialog`；
- `EmptyState`；
- `PageHeader`；
- `SnackbarProvider`；
- `StatusBadge`；
- `TableSkeleton`；
- `AppLayout`。

当前存在两个不同目录下的 `StatusBadge.tsx`。后续修改状态展示时必须先确认调用方，避免继续产生重复实现。

### 5.5 API 约定

- Axios 基础路径为 `/api/v1`；
- 请求自动附带本地 JWT；
- 后端响应使用统一 `ApiResponse` 包装；
- 401 会清理会话并跳转登录；
- Snowflake ID 在前端必须始终作为字符串，禁止转换为 JavaScript `Number`；
- 前端菜单权限只控制显示，不是后端安全边界。

## 6. 后端结构与核心业务模块

### 6.1 启动入口与目录

后端入口：

```text
gmp-platform/backend/src/main/java/com/zencas/edhr/EdhrApplication.java
```

主要包：

- `common`：统一响应、异常、安全、审计上下文、审计切面、Snowflake ID；
- `compliance`：审计事件、电子签名、文件对象、受控原因和 OCR；
- `identity`：用户、部门、角色、权限、工厂、车间、产线和登录日志；
- `masterdata`：物料、工序、路线、产品、产品簇、产品制程、文档、批次和 SN；
- `system`：系统设置、业务字典和图标；
- `template`：表单模板、DHR/批记录模板、目录与模板项；
- `workflow`：审核流程、实例、任务、绑定规则和生产作业模板。

当前代码不是完全严格的 Controller -> Service -> Repository 分层。部分 Controller 直接编排多个 Repository，Service 主要承担跨实体、版本归属、解析和复杂规则。修改业务逻辑前必须定位真实写入路径，不能默认逻辑只存在于 Service。

### 6.2 产品制程

关键入口：

```text
masterdata/controller/ProductProcessController.java
masterdata/service/ProductProcessOwnerService.java
masterdata/service/ProductProcessResolutionService.java
masterdata/entity/ProductProcess.java
masterdata/entity/ProductProcessVersion.java
masterdata/entity/ProductProcessOperationBinding.java
masterdata/entity/ProductProcessOperationFormBinding.java
masterdata/entity/ProductProcessOperationDocumentBinding.java
```

产品与产品簇共享制程能力。修改制程字段、版本规则或绑定关系时，必须同时核对：

- 产品入口；
- 产品簇入口；
- 兼容工作台；
- 新建、复制、编辑历史版本；
- Controller 请求与响应；
- Entity、Repository 和迁移；
- 审计快照和测试。

### 6.3 模板与作业

模板模块包含表单模板、表单版本、DHR/批记录模板、目录、模板项和设计器数据。前端模板设计器代码规模较大，涉及画布、组件注册、文档状态和 Excel/Word 导入。

作业模板配置已经有前后端和数据库实现，但运行时匹配、实例快照、条件求值和完整生产执行不能仅根据配置页面推断为已完成。

前端 `workflow-tasks.ts` 中多个动作当前仍映射到同一个 GET 接口，使用前必须重新核对真实后端能力。

## 7. 数据库与迁移

Liquibase 主入口：

```text
gmp-platform/backend/src/main/resources/db/changelog/db.changelog-master.yaml
```

当前主链包含 62 个 SQL 文件，最新迁移为：

```text
0060-work-template-version-integrity.sql
```

强制规则：

1. JPA 使用 `ddl-auto: none`，不得依赖 Hibernate 自动建表；
2. 不得修改已经执行过的迁移；
3. 新变更必须新增递增编号 SQL；
4. 新 SQL 必须加入 `db.changelog-master.yaml`；
5. 必须验证迁移顺序、初始化兼容性和历史数据影响；
6. 不得只重启前端后声称数据库变更生效。

### 7.1 当前本地脚本风险

工作区外层脚本存在迁移偏差：

- `start-postgres.cmd` 当前只手工执行到 `0054`；
- `run-backend.cmd` 显式设置 `spring.liquibase.enabled=false`；
- 正式 Liquibase 主链已经到 `0060`。

使用外层 Windows 快捷脚本时，本地数据库可能缺少 `0055` 至 `0060`。涉及数据库或作业模板开发前，必须先核对实际 `databasechangelog` 和数据库结构。

## 8. 权限、安全与审计

### 8.1 安全

- 后端使用无状态 JWT；
- 登录、公开系统设置、公开文件预览、Swagger 和健康检查可匿名访问；
- 其他接口至少要求登录；
- `@EnableMethodSecurity` 已启用；
- 当前 `@PreAuthorize` 主要集中在模板相关 Controller，细粒度权限覆盖不均匀。

后续新增查询、保存、删除、发布、审核、签名、转办等接口时，必须明确：

- 所需权限码；
- 后端校验位置；
- 无权限返回；
- 菜单可见性与接口权限是否一致；
- 是否存在数据范围要求。

前端隐藏按钮或菜单不能代替后端鉴权。

### 8.2 审计

项目审计包含：

1. `@Auditable` + `AuditAspect` 的方法级审计；
2. 重要业务操作显式保存修改前/修改后快照；
3. `AuditEvent` 不可修改，并保存快照哈希。

`AuditAspect` 只记录方法执行上下文，不自动生成字段级差异。对版本、状态、发布、权限、签名和生产关键操作，必须显式确认审计对象、动作、操作者、前后快照和失败策略。

当前自动审计持久化失败时会记录错误但不回滚业务事务。涉及高合规功能时，应将这一行为作为风险纳入设计和验证。

### 8.3 租户

当前实体中同时存在：

- 字符串租户：`"default"`；
- 数值租户：`0L`。

租户上下文尚未形成统一的成熟实现。新功能不得继续随意扩散硬编码租户或在同一接口混用类型；涉及租户边界时应先形成明确设计。

## 9. 启动、构建与测试

### 9.1 前端

```powershell
cd gmp-platform/frontend
npm install
npm run dev
npm run build
npm run lint
```

默认开发端口为 `3000`，`/api` 代理到后端 `8081`。

前端还提供多个 `verify:*` Node 脚本，用于页面布局、源码契约和特定模块验证。它们大量依赖源码字符串断言，适合做定向回归，但不能替代浏览器真实交互验证。

当前没有完整的 Vitest/Jest 单元测试体系。

### 9.2 后端

```powershell
cd gmp-platform/backend
mvn spring-boot:run
mvn test
```

默认端口为 `8081`。正常 Spring Boot 启动会执行 Liquibase。

接口文档：

```text
http://localhost:8081/swagger-ui.html
http://localhost:8081/api-docs
```

后端测试以 Mockito 单元/Controller 测试为主，另有少量 `@WebMvcTest` 和 `@DataJpaTest`。关键持久化、迁移和生产流程不能仅依赖 Mock 测试。

关键测试：

```text
common/config/DatabaseChangelogTest.java
common/config/DevProfileLiquibaseConfigTest.java
knowledge/BusinessKnowledgeModelTest.java
masterdata/controller/ProductProcessControllerTest.java
masterdata/controller/ProcessModelingControllerTest.java
masterdata/service/ProductProcessResolutionServiceTest.java
```

知识模型正式校验：

```powershell
cd gmp-platform/backend
mvn -Dtest=BusinessKnowledgeModelTest test
```

## 10. 结构化业务知识

`docs/knowledge/` 是机器可读的业务知识基线，包含：

- `schema.yaml`：结构和枚举约束；
- `glossary.yaml`：术语；
- `ontology.yaml`：概念与关系；
- `rules/`：业务规则；
- `decisions/`：已确认决策；
- `evidence/`：实现、测试和文档证据；
- `execution-contracts.yaml`：运行执行契约；
- `open-questions.yaml`：真实未决问题。

成熟度必须严格区分：

- `planned`：已识别，尚未完成定义；
- `specified`：规则已确认，尚未实现；
- `implemented`：已有实现，尚未完成发布级验证；
- `verified`：实现、测试、证据和执行契约完整；
- `deprecated`：已废弃，仅保留追溯。

未达到 `verified` 的规则不能进入客户或运行时投影，也不能被描述为已验证生产能力。

## 11. 强制开发流程

任何实际开发开始前，必须完整读取：

```text
AGENTS.md
codeplzreadme.md
```

涉及业务概念、状态、规则、流程、审计、追溯、快照或执行契约时，还必须读取：

```text
docs/architecture/business-knowledge-model.md
docs/knowledge/README.md
docs/knowledge/open-questions.yaml
docs/knowledge/ 下相关规则、决策和证据
```

开始编码前必须明确：

- 需求理解；
- 已知假设；
- 真正未决问题；
- 最小修改范围；
- 成功标准；
- L0/L1/L2 执行级别；
- 本体门禁是否触发；
- 质量门禁是否触发；
- 验证方式；
- `extensionStrategy`。

执行级别：

- **L0**：纯样式、静态文案、注释、格式和不改变语义的开发文档；
- **L1**：普通 CRUD、RDO 页面、非关键接口和常规业务功能；
- **L2**：生产阻断、生命周期、审计、权限、签名、放行、执行引擎、迁移、跨模块契约和重大重构。

扩展路径必须从以下类型选择并说明边界：

- `configuration`；
- `transaction-orchestration`；
- `standard-action`；
- `project-plugin`；
- `product-core`。

不得把客户差异散落成页面、Controller 或监听器中的硬编码条件分支。

## 12. 修改功能时的标准核对顺序

```text
1. 用户需求与业务歧义
2. 路由和菜单入口
3. 当前页面与共享组件
4. 前端类型、状态和 API
5. 后端 Controller 与权限
6. Service/Repository 真实写入路径
7. Entity、约束和 Liquibase
8. 审计、签名、状态和历史兼容
9. 单元/Controller/持久化测试
10. 构建、静态验证和真实交互
11. 知识模型与实现证据
12. 独立质量验证与残余风险
```

修改时保持最小范围：

- 每一处改动都应能追溯到需求、修复、测试或必要配套；
- 不顺手重构无关代码；
- 不清理用户已有修改；
- 不修改历史迁移；
- 不执行破坏性 Git 操作；
- 手工编辑使用 `apply_patch`；
- 不声称没有实际运行的验证已经通过。

## 13. 当前重点风险清单

1. Windows 启动脚本与 Liquibase 主链不同步；
2. 后端细粒度权限覆盖不均匀；
3. 自动审计失败不会阻断业务事务；
4. 前端仍有旧页面、兼容工作台和重复组件；
5. 前端缺少系统化单元测试，静态验证脚本较脆弱；
6. 后端真实 PostgreSQL 集成测试覆盖不足；
7. 租户 ID 存在字符串和数值两套类型；
8. Snowflake ID 若在浏览器转成 `Number` 会丢失精度；
9. 作业模板配置与完整生产运行时能力不能混为一谈；
10. 文档、知识状态和当前代码可能处于不同成熟阶段，必须交叉核对。

## 14. 当前生产模式需求的参考边界

当前用户确认的规则：

- 前端隐藏生产模式选择；
- 后端继续保留生产模式字段；
- 新建制程默认使用量产模式；
- 不因为隐藏字段而删除数据库字段或破坏接口兼容；
- 不应批量改写已有历史版本。

实现前应核对以下入口：

```text
frontend/src/pages/master-data/components/ProductProcessVersionEditorDialog.tsx
frontend/src/pages/master-data/ProductModelingWorkspacePage.tsx
backend/masterdata/controller/ProductProcessController.java
backend/masterdata/entity/ProductProcessVersion.java
相关 Controller、前端验证脚本和后端测试
```

产品与产品簇共用制程能力，因此不能只验证单一产品入口。新建默认值应由后端提供可靠兜底，前端默认值用于保证交互和请求一致；复制与历史编辑行为应明确区分“保留已有值”和“新建默认值”。

冠骋的生产模式行为只能作为参考证据，不能覆盖上述用户确认规则。

## 15. 开发任务记录模板

```markdown
### 需求理解

- 用户确认：
- 已知假设：
- 未决问题：

### 影响分析

- 执行级别：L0 / L1 / L2
- 直接影响：
- 相邻风险：
- 数据与兼容：
- 权限与审计：
- 测试范围：
- 扩展路径：

### 证据

- user-confirmed：
- original-evidence：
- secondary-reference：
- inference：

### 实现与验证

- 修改文件：
- 已运行验证：
- 未运行验证：
- 本体结果：
- 质量结果：
- 残余风险与暂缓范围：
```

## 16. 关键入口索引

- `README.md`
- `AGENTS.md`
- `codeplzreadme.md`
- `docs/development/startup-commands.md`
- `docs/architecture/business-knowledge-model.md`
- `docs/architecture/rdo-version-governance.md`
- `docs/knowledge/README.md`
- `docs/knowledge/open-questions.yaml`
- `docs/reference-assets/edhr-and-crown-reference-checklist.md`
- `gmp-platform/frontend/package.json`
- `gmp-platform/frontend/src/router/index.tsx`
- `gmp-platform/frontend/src/api/client.ts`
- `gmp-platform/backend/pom.xml`
- `gmp-platform/backend/src/main/resources/application.yml`
- `gmp-platform/backend/src/main/resources/db/changelog/db.changelog-master.yaml`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/common/config/SecurityConfig.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/common/audit/AuditAspect.java`

---

本文件是当前项目快照。路由、迁移、知识模型版本、测试数量和已实现范围发生变化后，应基于原始证据更新，不能依赖对话记忆自动视为长期正确。
