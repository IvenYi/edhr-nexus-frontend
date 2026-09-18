# DHR 管理开发交接

产品调研、用户确认决策、参考功能矩阵解读和完整开发路线见：
`docs/dhr-management-product-research-and-roadmap.md`。新上下文必须先读该文件，再读本文件的环境和代码交接内容。

## 新上下文必须使用的项目环境

- 项目目录：`/Users/ivenwang/Documents/edhr-nexus`
- 项目：`edhr-nexus`
- 分支：`edhr-dev`
- 远程跟踪：`origin/edhr-dev`
- 环境类型：选择“本地（Local）”，不要选择“工作树（Worktree）”
- 当前改动：已在工作区中，尚未提交；请先检查 `git status -sb`，不要重置或覆盖现有改动
- 用户原有的 `output/` 目录是未跟踪内容，必须保留，不要删除

## 工作契约与开发规范（新上下文必须遵守）

开始任何开发、迁移、测试或配置修改前，必须先完整阅读：

1. `AGENTS.md`：项目治理、业务门禁、智能体协作和完成条件
2. `codeplzreadme.md`：编码行为准则、最小修改、风险匹配验证和 Git 安全规则
3. `docs/architecture/business-knowledge-model.md`：业务知识模型和概念边界
4. `docs/knowledge/README.md`：当前知识基线 `0.3.24` 及其使用规则
5. `docs/knowledge/open-questions.yaml`：当前未决问题
6. `docs/knowledge/decisions/DEC-0062-dhr-instance-management-phase1.yaml` 与 `DEC-0063-dhr-summary-and-review-configuration.yaml`：DHR 实例首版、汇总和审核配置边界
7. `docs/knowledge/rules/dhr-instance-management.yaml`、`docs/knowledge/facts/dhr-instance-management.yaml`、`docs/knowledge/evidence/dhr-instance-management.yaml`、`docs/knowledge/implementation-anchors/dhr-instance-management.yaml`：DHR 的规则、事实、证据和实现锚点
8. `docs/prd/edhr-mvp-prd.md` 和 `docs/prd/GMP合规软件基座_功能矩阵PRD.md`：产品范围和功能矩阵

继续开发时必须遵守以下工作契约：

- 先判定执行级别。本 DHR 功能涉及生命周期、生产完成阻断、权限和数据库迁移，按 L2 风险处理；若后续只是纯文档/静态文案可降为 L0，普通非关键 CRUD 可按 L1，但扩大范围时必须升级。
- 编码前明确需求理解、事实与假设、未决问题、最小修改范围、成功标准、影响分析和验证方式；有会改变验收结果的歧义时先停下澄清。
- 只做已确认范围，不猜测扩展功能，不把竞品或旧 PRD 推断成已实现能力；保留用户已有改动和 `output/`，不使用 `git reset --hard`、`git checkout --` 等破坏性操作。
- 手工编辑使用 `apply_patch`；只清理本次改动造成的无用代码，不顺手重构无关模块。
- 业务概念、状态、规则、事件、审计、证据、权限或执行契约变化时，必须同步知识资产并触发本体门禁；代码、接口、数据库、权限、用户交互或知识基线变化时，必须触发质量验证门禁。
- 影响分析只维护当前 DHR 功能切片的一份版本；区分 `confirmed`、`inferred` 和 `unresolved`，并以源码、迁移和真实运行结果作为原始证据。
- 验证不能只报告“已修改”：必须运行与风险相称的聚焦测试；涉及数据库迁移时验证真实 PostgreSQL；涉及菜单权限时验证迁移、角色授权、接口授权和登录后菜单可见性。
- 最终报告必须列出实际修改、实际执行的测试/迁移/交互检查、未执行的验证、残余风险和明确暂缓范围；未执行的检查不能声称已通过。

## 本阶段不可擅自扩大的产品边界

- 不回填历史批次/SN，不为历史数据新增兼容策略；用户已确认前期忽略历史数据。
- DHR 只在 BATCH/SN 首次合法 `START` 时由系统自动创建，禁止手工创建，创建与开工同事务。
- DHR 以生产对象为唯一业务锚点，创建时冻结生产、制程、路线、模板和目录快照。
- 本期只做 DHR 列表和只读详情；不擅自加入汇总审批、退回、发布、归档、作废、拖拽证据或人工补充证据。
- 生产执行进入 DHR 闭环后，完成全部工序时必须同步完成 DHR；关联实例缺失时必须阻断完成并回滚。

## 为什么需要新上下文

此前的 Codex 任务是在 `/Users/ivenwang/.codex/worktrees/ce63/edhr-nexus` 这个隔离工作树中创建的，因此界面显示“工作树”。该工作树已被移除；真正的代码和开发环境现在都在上面的本地项目目录中。当前任务的环境元数据不能原地切换，所以请从 `edhr-nexus` 项目创建一个“本地”上下文，并选择 `edhr-dev`。

## 当前已完成内容

### DHR 管理第一阶段

- 增加 DHR 实例后端服务、控制器和数据访问逻辑
- 首次生产执行开始时自动创建 DHR
- DHR 支持按批次/生产对象汇总并查看只读详情
- 当前自动证据聚合只处理同一生产对象下、`source_type=PRODUCTION_EXECUTION` 且带冻结 `dhrItemId` 的表单记录，并按 `copyId` 保留副本；目录可以来自 DHR 模板，但跨生产/检验/灭菌/物料/记录本等模块的正式汇总仍是后续规划
- 增加 DHR 列表及只读详情页面
- 前端菜单路径：`记录 → DHR管理 → DHR列表`
- 暂不处理历史数据回填；历史批次/SN 没有 DHR 是当前 0-1 阶段的明确策略
- 新 DHR 产生后，相关数据和功能必须正常；如果没有 DHR，不应假装已有历史 DHR

### 菜单与权限

- 新增菜单权限：`records.dhr-management`
- 新增查看权限：`dhr.instances.view`
- `ADMIN` 角色已绑定上述两个权限
- 菜单显示依赖登录后的权限快照；新上下文启动服务后，浏览器需要退出登录、重新登录并刷新页面

### 数据库

- 新增 Liquibase：`gmp-platform/backend/src/main/resources/db/changelog/0089-dhr-instance-management.sql`
- 已在本机开发 PostgreSQL 数据库成功执行，变更集：`0089-dhr-instance-management::codex`
- 已确认 `ADMIN` 拥有 DHR 菜单和查看权限
- 当前 `dhr_instance` 数量为 0，这是因为按策略不回填历史数据，不是迁移失败

## 当前真实状态快照

以下是交接时的事实，不是规划：

- Git：`edhr-dev` 与 `origin/edhr-dev` 对齐，DHR 和知识基线相关改动仍在工作区，尚未提交。
- 目录：代码、前端和数据库迁移均已在 `/Users/ivenwang/Documents/edhr-nexus`；不要再从 `/Users/ivenwang/.codex/worktrees/ce63/edhr-nexus` 读取或写入。
- 服务：后端已从本地项目启动在 `8081`，前端已启动在 `127.0.0.1:3000`。
- 数据库：`0089-dhr-instance-management` 与 `0092-dhr-summary-workspace` 已在本地 PostgreSQL 成功执行；不回填历史 DHR。
- 权限：数据库中已有 DHR 管理/查看以及独立 DHR汇总 页面、编辑和提交权限，初始化只默认授予 `ADMIN`。
- 页面：菜单显示依赖登录权限快照；启动后必须退出登录、重新登录并刷新，才能验证 DHR 菜单。
- 验证：DHR列表 加载、来源分类详情、真实表单画布以及独立 DHR汇总 菜单已完成浏览器语义检查；前端生产构建通过；后端完整回归 704 tests、0 failures、0 errors、23 skipped；知识基线校验通过；`0092` 已在真实本地 PostgreSQL 成功执行。
- 未完成：没有提交、推送或创建 PR；DHR审核 独立菜单、审批实例/任务、电子签名、退回和批准结果落地尚未实现；发布归档、最终产品放行和历史数据仍不在本切片。

## 后续按顺序开发规划

### 第 0 步：新上下文接管和冒烟验收（下一步立即做）

1. 在 `edhr-nexus` 项目中创建“本地（Local）”上下文，选择 `edhr-dev`。
2. 阅读本交接文档、`AGENTS.md`、`codeplzreadme.md` 和上面列出的业务知识文档。
3. 执行 `git status -sb`，确认已有改动和 `output/` 未被覆盖。
4. 启动前后端，退出登录并重新登录。
5. 验收 `记录 → DHR管理 → DHR列表` 菜单、DHR 列表空态、详情路由和无权限返回。

验收标准：新上下文确实使用本地目录；菜单可见；接口能访问；不改变现有未提交改动。

### 第 1 步：DHR 第一阶段闭环验证（先补真实验收，不扩产品范围）

使用新的 BATCH 和 SN 测试数据逐项验证：

1. 首次合法 `START` 与生产开工同事务创建唯一 `IN_PROGRESS` DHR。
2. 重复开工、并发创建、拆分、未开工和取消场景不产生第二个有效 DHR。
3. 创建时冻结工单、产品、制程版本、路线版本、模板版本和目录快照。
4. 生产执行表单按 `dhrItemId` 聚合，按 `copyId` 保留副本，复用来源不重复计入。
5. 最后一个工序完成时生产对象与 DHR 同事务完成；缺失 DHR 时动作回滚并阻断完成。
6. `ADMIN` 可看列表/详情，未授权角色不能访问；浏览器菜单与后端接口权限一致。

验收标准：真实 PostgreSQL、后端集成测试、接口权限测试和浏览器页面结果一致；发现问题先修复第一阶段，不提前进入审批功能。

### 第 2 步：DHR 汇总工作台与审核配置（working tree 已实现，待发布级验收）

这是用户已确认并已形成 working-tree 实现的当前切片：

1. DHR列表 与 DHR汇总 是 DHR管理 下的两个独立菜单。
2. 流程中心增加 `DHR_SUMMARY` 分类，产品/产品簇共用制程版本选择 `NONE` 或绑定已发布流程版本的 `REQUIRED` 策略。
3. DHR汇总 页面区分“待汇总”和“已提交”，支持基础目录、多级覆盖目录、候选实例归档、草稿保存和冻结版本查看。
4. 当前候选严格限于三类表单实例：目录直接绑定、作业表单节点和生产执行自定义表单；冠骋的生产/检验/灭菌等模块分类仅为未来来源契约参考。
5. 目录实例自动纳入；作业和自定义实例按选择纳入，未选择即不纳入，不要求逐条排除原因。
6. 提交冻结完整候选范围、归档关系、来源快照和哈希；拖拽/选择只是交互，不改写来源表单。

后续进入 DHR审核 前仍需实现并验证：独立审核菜单、审批实例/任务、电子签名适用规则、退回后新版本、状态映射和批准结果落地。

### 第 3 步：人工补充证据（形式待用户确认）

推荐设计为受控拖拽/选择已有业务证据，而不是任意上传或直接改写 DHR：

- 只能从有业务来源、权限允许且与当前生产对象相关的记录中选择；
- 保存来源 ID、来源类型、操作者、时间、原因和目录位置；
- 同一来源不得重复挂载，撤回/替换必须留审计轨迹；
- 拖拽只是交互形式，不等于“冠骋功能已确认照搬”。

在实现前需要确认：可拖拽的证据类型、是否允许跨模块选择、人工补充是否需要审批、补充后是否重新触发 DHR 审核。

### 第 4 步：DHR 审核与状态闭环

在汇总切片稳定后，再实现 DHR 审核页面和流程：

- 待办/已办两个视图；
- 审核通过、退回、再次提交及权限控制；
- 汇总内容、人工补充、退回原因和操作者的审计记录；
- 审核状态与 DHR 生命周期状态的明确映射。

必须先形成状态机和迁移规则，再改代码和知识基线；不能仅按页面按钮名称推导状态语义。

### 第 5 步：列表、发布和归档（后续阶段）

- 扩展 DHR 全量列表、生产/灭菌/物料等模块的详情查看和筛选。
- 根据确认后的业务规则增加发布、归档、作废和只读导出等能力。
- 手工创建 DHR、历史数据回填和历史兼容仍然不在当前计划；只有用户重新确认产品决策后才可进入单独切片。

## 每个后续切片的固定交付顺序

需求确认 → 执行级别与影响分析 → 读取相关知识资产和源码 → 最小设计 → 代码/迁移/前端实现 → 聚焦测试 → 真实数据库/页面验收 → 更新知识基线 → 独立质量验证 → 汇总未验证项和残余风险。

任何一步失败都不能用“代码已写完”代替完成；不得把后续规划、竞品参考或推断内容写成当前已实现能力。

## 关键文件

### 后端

- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/DhrInstanceController.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrInstanceService.java`
- `gmp-platform/backend/src/main/resources/db/changelog/0089-dhr-instance-management.sql`
- `gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/DhrInstanceMigrationTest.java`

### 前端

- `gmp-platform/frontend/src/api/dhr-instances.ts`
- `gmp-platform/frontend/src/pages/dhr-management/`
- `gmp-platform/frontend/src/components/shared/AppLayout.tsx`
- `gmp-platform/frontend/src/router/index.tsx`
- `gmp-platform/frontend/src/utils/menuManagement.ts`

### 知识基线

- 已补充 DHR 管理相关 ontology、facts、rules、evidence、implementation anchors 和 decision
- 已修复知识基线版本与重复 DEC ID 问题
- 当前知识策略不记录历史数据兼容/回填方案，因为用户明确要求前期忽略历史数据

## 已验证结果

- 后端 focused tests：通过
- 前端构建及菜单/AppShell 检查：通过
- BusinessKnowledgeModelTest：通过
- 后端完整测试：688 个测试，0 failures，0 errors，23 skipped
- 后端可从正确目录启动在 `8081`
- 前端可从正确目录启动在 `3000`

## 本地启动

后端：

```bash
cd /Users/ivenwang/Documents/edhr-nexus/gmp-platform/backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

前端：

```bash
cd /Users/ivenwang/Documents/edhr-nexus/gmp-platform/frontend
npm run dev -- --host 127.0.0.1
```

## 新上下文的第一步

1. 确认当前目录是 `/Users/ivenwang/Documents/edhr-nexus`，分支是 `edhr-dev`。
2. 执行 `git status -sb`，保留现有未提交改动。
3. 不要重新创建工作树，不要把代码复制到其他目录。
4. 启动前后端并重新登录系统，确认 `记录 → DHR管理 → DHR列表` 可见。
5. 继续开发前先阅读本交接文档和现有 DHR 代码，避免重复实现或加入历史数据回填。
