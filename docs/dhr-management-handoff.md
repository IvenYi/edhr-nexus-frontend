# DHR 管理设计与开发交接

更新日期：2026-09-28。现行设计以 [汇总核查与审批设计](dhr-management-product-research-and-roadmap.md) 为主，重点阅读第 6～10 节。本文直接修订原交接，不再沿用“作业/自定义未手选即不纳入 DHR”的错误方案。

## 1. 当前任务边界

已在原设计和知识之上实现自动归集、展示目录与证据范围解耦、受控附件、冻结版本及 ZIP 导出。开发库已执行至0104并重启后端：错误旧汇总转待核查草稿，旧模型字段及运行分支已清理；正常业务版本修订保留。尚未 Git 提交或推送。通用业务设计仍标为 specified/internal；实现和测试结果不等于整系统合规认证。

- 保留 DHR填报、DHR汇总、DHR审批、DHR列表菜单。
- 汇总的主线变为自动归集、完整性检查和人工核查；人工目录整理只是辅助。
- 中国法规按 2025 新版医疗器械 GMP 设计，不考虑旧版；海外先核对美国/欧盟，具体客户适用范围未确认。
- 暂不做打印；设计完整 DHR 版本 ZIP 与选定范围 ZIP，部分输出不能冒充完整档案。
- 不新增跨批次移表、不自动放行、不恢复终止生产、不改朋友负责的表单变更/作废流程。

## 2. 环境与安全边界

- 仓库：`/Users/ivenwang/Documents/edhr-nexus`。
- 既有协作分支：`edhr-dev`，实际操作前用 `git status -sb` 和 `git branch --show-current` 核对，不假定远程已同步。
- 使用当前本地项目；不要求新建上下文或切换 Worktree。
- 用户原有未跟踪 `output/` 必须保留，不重置或覆盖其他开发者改动。
- 本地开发环境使用后端 8081、前端 3000；本轮已在开发 PostgreSQL 应用 0102/0103，并通过浏览器读取已有 DHR 数据审计。后续使用时仍须重新检查服务状态。
- 历史记录的“DHR 数量为 0”“尚无审批运行时”“尚未提交推送”和既往测试数量，不是当前环境事实，不能据此继续开发。

## 3. 开始实施前必读

1. `AGENTS.md`、`codeplzreadme.md`。
2. `docs/dhr-management-product-research-and-roadmap.md`。
3. `docs/development/dhr-summary-decision-package.yaml`。
4. `docs/architecture/business-knowledge-model.md`、`docs/knowledge/README.md`、`docs/knowledge/open-questions.yaml`。
5. `DEC-0063`、`DEC-0068`、`DEC-0069`、`DEC-0070`、`DEC-0071`、`DEC-0072` 及对应规则/事实/证据。
6. 当前共享组件规范与源记录控制模块契约。

知识基线为 0.3.24。相同功能切片维护一个决策包；用户负责真实业务决策，智能体负责同步知识和验证。新业务实施属于 L2，不能因是 UI 改版而跳过来源、并发、权限、审计和快照检查。

## 4. 必须一致的业务规则

| 事项 | 现行设计 |
| --- | --- |
| DHR 形成 | 继续以生产对象为锚点，首次合法开工自动创建；不要求手工组装目录才形成 DHR |
| 证据范围 | 生产关联的目录/作业/自定义实际实例自动归集，附件受控关联；状态不决定记录是否可追溯 |
| 缺项与未完成 | 应有记录按冻结配置及适用规则核查；零实例不造证据，失败/作废/替代不能静默消失 |
| 人工目录 | 别名、顺序、展示位置可调整，不改变来源归属、内容或证据成员；取消自定义位置恢复默认 |
| 分组 | 按具体作业节点或自定义创建项，不按相同模板混组；组和单份均可整理/查看 |
| 审批 | 冻结完整证据及检查结果，按既定 NONE/REQUIRED 执行；NONE 不绕过适用签署、质量审核或放行 |
| 来源变化 | 自动识别、提示并阻断过时批准；人工退回/发起新版本，保留旧结论与旧快照 |
| 详情 | 正式版本默认展示汇总目录，可切来源视图但仍读同一版本；实时记录必须显式区分 |
| 审计 | 实例日志查看源填报/签署/变更；DHR 详情数据审计查看目录/附件/提交/审批/导出等 |
| 附件 | 保留原始文件、版本、来源与核验；扫描/上传时间不冒充原记录形成时间 |
| 导出 | 完整与部分 ZIP 明确标识，不修改证据范围，不能静默缺件或混用版本 |
| 终止 | DEC-0069 的终止只读留证政策不变；本轮不补终止后追加/异常结案 |

自动工序/作业表单绑定当前执行对象，自定义创建也绑定当前上下文，不是自由选择表单归属。“在 A 页录入 B 的值”属于内容错误；“附件误关联”属于关系错误。不得将这两者混写为正常自动归属会串批，也不通过 DHR 拖拽改 objectId。

## 5. 原始实现与本轮改造核对

2026-09-25 读取以下源码：

- `ProductionExecutionService`：按生产对象锁定执行上下文；`ATTACH_FORM` 在该对象/工序内追加自定义定义，保存时传递同一 objectId。
- `FormInstanceRecordService.saved`：从执行快照查找工序/表单，按 objectId、operationId、copyId 保存唯一来源记录。
- 原 `DhrSummaryService.submit/validatePlacements` 由 placements 决定正式证据行，是本轮已替换的旧语义；现行提交按生产对象实际来源记录生成完整证据集合，placements 只保存展示位置。
- `DhrReviewService`：已有个人审批任务查询、动作、流程结果与审计路径。不能再称“审批运行时完全不存在”；新证据范围下的审批正确性仍须重新验证。
- `DhrManagementPage` 的正式版本详情现使用 `DhrSummaryPage` 的冻结版本视图；生产中实时详情仍由 `DhrInstanceService.detail` 提供，不能冒充冻结版本。
- 新增 `DhrAttachmentService`、`DhrArchiveService` 和对应控制器，0102/0103 迁移分别支持完整证据版本与受控附件。
- 现有来源分组、目录顺序、全来源别名和实例面板可复用，不重建第二套 UI。

已在真实开发 PostgreSQL 执行迁移并通过浏览器打开旧版 DHR 的冻结详情及 DHR 数据审计；新版待汇总对象的端到端页面操作因当前库无测试对象，尚未实测。附件/ZIP、并发和审批变化通过聚焦集成测试验证。提交前需逐项人工确认质量与异常、源审批签署及证据范围，并填写说明后随版本冻结；系统当前不能通用解释任意表单的质量结论，不能把这一确认称为自动判定合格。签署全链路、企业备份恢复、恶意文件扫描及全部记录控制接口未在本轮完成验证。

## 6. 实施顺序与成功标准

1. **证据范围与展示目录解耦**：先定义实例身份、状态与完整范围及缺项核查；验收“不拖拽也完整、恢复默认不删证据”。
2. **审批/详情一致性**：完整证据版本、源变化检测、签署与权限；验收列表/审批/汇总读同版，新增来源与并发变化不漏检。
3. **附件与审计入口**：受控文件关系、来源核验、旧版本可查；验收误关联处理不破坏其他引用，实例日志与 DHR 审计可达。
4. **ZIP**：固定版本、完整/部分标识、原件与索引、权限和失败策略；验收不漏项、不重复、不混版。
5. **可选目录/UI**：保留已确认的整组/单份整理、顺序、别名、hover/focus行操作、独立实例与来源面板；按现有公共组件对齐。

详细场景以主设计 AC-01～AC-12 为准。客户市场、器械类别、企业签署/保存 SOP、恶意文件扫描和监管可接受的电子副本格式仍需专项确认，不冒称通用实现覆盖所有客户法规。

## 7. 数据与历史保护

- 开发期错误旧汇总按0104转换或清理，不保留双模型。备份后恢复可用目录、位置、顺序及别名为待核查草稿，删除对应错误旧冻结及位置；已有当前草稿/冻结优先。意外旧审批依赖或非完成状态阻断自动清理，先排查依赖。
- 本地唯一旧汇总DHR-20260922-000003已恢复为草稿；删除1条旧冻结及3条展示位置，3份源表单、生产完成状态、签署与原审计保留并补迁移事件。需重新保存、核查并提交，不补造旧确认；正常当前冻结版本及审批事实仍不可改写。
- 首次开工冻结生产上下文及审批绑定；后续配置发布不能静默改变在途对象。
- 新版本可引用原来源记录但必须保存可靠内容版本及签署/状态依据，不能只保存指向实时变化对象的 ID。
- 表单变更/作废由来源记录控制域负责，DHR 消费真实生效事件；活动记录作废资格沿用该域未决边界，不在这里补全。

## 8. 关键文件

后端：

- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrInstanceService.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrSummaryService.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrReviewService.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrEvidenceImpactService.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ProductionExecutionService.java`
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/FormInstanceRecordService.java`

前端：

- `gmp-platform/frontend/src/pages/dhr-management/DhrManagementPage.tsx`
- `gmp-platform/frontend/src/pages/dhr-management/DhrSummaryPage.tsx`
- `gmp-platform/frontend/src/pages/dhr-management/summarySourceGroups.ts`

开发库已应用至0104当前证据模型修正。0102/0103及此前迁移保留为已执行履历，不能改写Liquibase校验和，不代表保留旧运行模型。

## 9. 验证与交付

当前L2迁移切片已验证完整备份在隔离PostgreSQL恢复、转换/异常阻断/事务回滚、源数据指纹不变、转换草稿重新核查提交的服务测试，以及四工作区图标和附件ZIP的隔离浏览器回归。具体结果及独立质量门禁见 docs/development/dhr-workspace-navigation-decision-package.yaml；不复用此前全量测试代表本轮。未替用户实际核查提交，没有完成企业级恢复演练、恶意文件扫描或整体电子签署专项验收。

本文件是设计/工程交接，不替代企业质量负责人、法规适用性评估或系统验证。

## 10. 可打印 ZIP 的运行依赖（2026-09-28）

- 总 PDF 按冻结档案顺序列索引及表单正文；单表原版式 PDF 按批记录模板、作业表单、自定义表单归类。附件原件不合入总 PDF；表单附件在实例目录内，汇总附件在根级「汇总附件」。冻结 JSON、文件摘要及审计/签署清单在「追溯资料」，不代替打印正文。
- 前端先在 `gmp-platform/frontend` 执行 `npm ci`；后端 Maven 的 `generate-resources` 会调用 `npm run build:dhr-print`，将同源 React 预览组件打包到 JAR 内的 `dhr-print/renderer.js`。后端构建机因此需要 Node/npm，不能只复制旧 JAR 或省略打印资源。
- 本机后端运行前，在 `gmp-platform/backend` 执行 `mvn exec:java -Dexec.mainClass=com.microsoft.playwright.CLI -Dexec.args="install chromium"`；Linux 原生部署使用 `install --with-deps chromium` 并安装 Noto CJK 中文字体。可通过 `edhr.dhr.pdf.chromium-path` 指定受控 Chromium 路径。
- 容器使用与 Java 依赖一致的 Playwright `1.58.0-noble` 镜像及 Noto CJK 字体，保留现有 OCR 安装。其官方 Dockerfile 使用 JDK21：<https://raw.githubusercontent.com/microsoft/playwright-java/v1.58.0/utils/docker/Dockerfile.noble>。本机无 Docker，不能将本机 Chromium 测试表述为容器构建验收。
- 打印运行器只加载随应用发布的离线代码，拦截外部网络；每台后端最多同时处理两份导出。缺少冻结版式、原件、浏览器依赖或文件摘要不符时应报错，不返回残缺 ZIP。中文字体需按部署要求安装并目视验收，不能只凭文件生成成功认定字体正确。冻结输入框内容超出可打印区域时明确拒绝，不能把屏幕省略号当成完整打印内容。
- 修订创建草稿，不改写旧冻结版本；「档案版本」可在当前草稿和历次 Vn 间切换。历史版只读、可导出；未保存目录切换前确认放弃本地调整。仍沿用 `dhr.summaries.reorganize`、`dhr.summaries.export` 及接口授权。
- 本轮实际测试和独立门禁结果维护在同一导航决策包的 `revisionPrintableExport` 中；不代表全部客户版式、生产容器容量或法规专项验收通过。
