# DHR 汇总与审批设计确认

知识基线：`0.3.24`；修订日期：2026-09-28；成熟度：`specified/internal`。
统一交接：`docs/development/dhr-summary-decision-package.yaml`（DEC-PACKAGE-20260919-DHR-SUMMARY）；来源导航原位补正：`docs/development/dhr-workspace-navigation-decision-package.yaml`（DEC-PACKAGE-20260927-DHR-WORKSPACE-NAVIGATION）。
关联设计：`docs/dhr-management-product-research-and-roadmap.md` 第 6～11 节；旧汇总处置须由主开发同步最新确认，第 2/4/5 节仅解释首版时点。

## 修订入口、历史版本与可打印 ZIP（2026-09-28，同一切片原位修正）

输入为同一交接包的 `revisionPrintableExport` 子节，L2、基线 0.3.24，`unresolved: []`。以下修正原有定义，不新增替代 DEC、旧证据模型或兼容层；只同步内部设计，尚未达到 `verified` 或发布状态。旧 Office、导航、迁移及 ZIP 的通过记录不能替代本轮验收。

### user-confirmed

- 列表操作栏采用符合共享规范的纯图标及提示表达“发起修订”，查看弹窗直接显示该按钮，不再藏在“更多”中。两个入口共用原流程、资格、原因和权限；不改变列表行点击详情与数据审计。
- 修订基于最新定版创建 DRAFT 汇总中草稿，不立即形成下一冻结版本；重新核查提交才分配下一 `version_no`，按原配置审批。草稿及历次冻结版本通过版本选择可达，草稿存在时旧版仍只读且可按权导出；数据审计记录动作，不替代旧版正文查看，不从历史查看入口扩大写权。
- 导出选择按当前显式冻结版本的档案目录、顺序和别名展示，支持目录/组/实例勾选及本版汇总附件混选；完整与选定范围明确区分，切换版本清空选择，导出选择不改变完整证据或审批范围。
- ZIP 使用中文目录：总 DHR PDF 按冻结档案顺序呈现可打印表单；各实例的原模板版式 PDF 按批记录模板、作业表单、自定义表单的真实来源归类。整理到其他目录不改变来源身份，同一实例不重复计数。
- 表单内上传文件放在对应实例的“附件”目录，汇总整理上传文件放在与来源同级的“汇总附件”目录。**附件内容不并入总 PDF**，PDF 只列附件索引，ZIP 保存原件；Office 不在线预览、编辑或转换。总 PDF 是可打印正文及索引，不等于已包含附件原件的完整档案。
- JSON 和机器清单保留在“追溯资料”中，承担冻结数据、身份/版本、摘要、审计和签署的追溯，不作为客户阅读打印的主要文件。总 PDF、单表 PDF、原件引用及追溯资料都须使用同一冻结版本，不用当前草稿、实时表单内容或最新模板替代。
- 本轮提供可下载后打印的 PDF，不新增系统在线打印工作流；生产完成、放行、审批配置、电子签名、七种上传格式与单文件 50 MiB 边界不变。仍沿用现有 `reorganize`/`export` 权限和后端授权。

### original-evidence：本仓库静态核对

采集日期：2026-09-28（Asia/Shanghai）；HEAD `dcbc67864147750579b8328da28c45d380798693`；`sourceRevision: working-tree`。主开发正在并行实现，以下只说明本次核对时点，不证明之后源码状态、业务运行或独立质量通过；后台源码指纹明确所读修订。

- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrSummaryService.java`：`workspace` 同时返回草稿及按版本号倒序的历史版本；`version` 按 DHR/版本读取冻结候选、目录、附件、核查及位置。`reorganize` 校验 FORMALIZED、原因和最新 `expectedVersionId`，`prepareNextDraft` 继承编排并写 DRAFT；`submit` 才按 `MAX(version_no)+1` 建冻结版本。源码 SHA-256：`57281745de9629d74754b2876b0541b9b0ad73df6b9fb83698471da7df222058`。
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/DhrSummaryController.java`：修订端点仍要求 `records.dhr-summary` 与 `dhr.summaries.reorganize`；不能因为列表增加入口就绕过原授权。
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrArchiveService.java`：初核仍输出 `forms/{id}.json/.html`，HTML 为字段值表，并非原模板版式；汇总附件按冻结长度及 SHA-256 校验后写 `attachments/`，已有 Office 扩展名映射、范围成员校验、来源审计和签署数据。来源审计/签署截止提交时点，DHR 审计另标 `AS_OF_EXPORT`；“同一冻结版本”不应把导出时审计伪称为提交时的冻结内容。该时点未有总 PDF、单表 PDF 或表单字段原件打包链；源码 SHA-256：`c089e109d85fbb28c10d2b32490f39edee2fee29df54949f708b634425f5383e`。这是实现进行中的差异，不能把本次规则写为已交付。
- `gmp-platform/frontend/src/pages/dhr-management/DhrSummaryPage.tsx`：初核已见 `hasCurrentDraft` 与 `selectedVersionId` 区分只读、档案版本选择及直接修订按钮；`DhrExportDialog.tsx` 已接入 `DhrExportTree` 和档案节点。这些并行工作树代码只证明已有实现片段，不证明未保存保护、权限矩阵、版本切换、树选择或导出端到端已验收。`DhrSummaryPersistenceTest.java` 有修订继承及旧冻结位置不变的测试源码，本体未运行该业务测试。

### original-evidence / secondary-reference：竞品参考边界

- 本轮直接重读 `/Users/ivenwang/Documents/iven space/paas-main-front/src/projects/web-render/src/views/edhr-application/render/edhr-summary/components/layout-header.vue`：`onBatchPrint` 调用 `postFileTaskSubmit`，类型为 `EDHR`。直接重读 `/Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/service/EdhrFileTaskPrintService.java`：`getDocInstIds` 选择全部/已汇总实例路径，`getSummarizedFormInstIds` 按目录排序选实例且过滤 ABANDON。过滤作废不属于本产品可借用规则；本产品按冻结完整证据范围保留真实记录和状态。
- 直接用 `jar tf`/`unzip -l` 核对 `/Users/ivenwang/Downloads/0823-5 药物支架 DHR 202609242210.zip`：三条目为 `0823-5 药物支架 DHR.pdf`、空 `文件/`、空 `附件/`；ZIP SHA-256 为 `a55bd44474686665dfe4bd00d62108cdeb23748b733f665db1edfcb2e929b1c7`。这证明样本存在中文命名 PDF 与目录，不证明按来源单表 PDF、非空附件如何分层、附件是否合入 PDF 或所有导出情形。
- 主交接提及其他 ZIP 样本及 PDF 版式/页数，属于本角色未重验的 `secondary-reference`，不再扩写为本次事实。所给后端文件检索仅定位业务适配 `EdhrFileTaskPrintService` 及其编译类；平台 PDF 合并与 ZIP 工作器源码不在本次可核对范围，不能宣称已复现其内部逻辑。我们的来源单表 PDF 及两类附件目录是用户确认的产品选择，不冒称竞品既有行为。

### inference 与 evidenceGaps

- 使用现有 React 版式、离线服务端 Chromium 与 PDFBox 合并属于工程方案；文件按冻结字段引用识别、不可覆盖对象校验、缺失/摘要不符或不可渲染时拒绝残缺包、路径安全和同名去重也由主开发实现验证，不写为法规指定技术。
- 选中实例默认带出其字段附件、仅输出所选实例数据及依赖的具体联选算法，仍按输入包标记为 `inference`。不得将此推断升格为用户单独确认的选择交互，也不得因此缩小完整档案或扩大部分包为完整 DHR。
- 长表分页、字体和签名图片、字段内嵌附件/子表、资源开销、原件保全、同版内容和跨版本拒绝、两入口权限及真实浏览器/PDF/ZIP 验证由主开发及后续独立 QA 收敛；部分包还须核对追溯 JSON 是否夹带未选实例字段数据。知识校验不替代这些功能证据。
- 扩展路径为 `product-core`：DHR 服务负责版本、范围、原件和 ZIP，打印入口只消费授权冻结数据，前端负责导航与选择。本体只拥有知识及必要架构投影；不修改代码、测试或决策包。沿用既有法规适用边界，不新作法规扩展或整体合规声明。

### 本轮实际知识校验（original-evidence）

- `mvn -q -Dtest=BusinessKnowledgeModelTest test` 本次未完成：新接入的 `dhr-print-renderer` 构建在主开发尚在修改的 `src/dhr-print/main.tsx` 报 Unexpected end of file，知识测试尚未运行；本体未修改该实现。
- 随后独立执行 `mvn -q -Dtest=BusinessKnowledgeModelTest surefire:test`，使用已有编译测试类读取当前知识资产，退出 0；报告为 59 项、0 失败、0 错误、0 跳过。02:02:49 +08:00 生成的 `gmp-platform/backend/target/surefire-reports/TEST-com.zencas.edhr.knowledge.BusinessKnowledgeModelTest.xml` SHA-256 为 `d610a5dbae55955a5e854fcac21d36de345041a3b76efe6e685b8a3423382f0e`；报告可能被后续构建覆盖。此为正式 JUnit 知识校验，不代表全 Maven 生命周期或新打印构建通过。
- Ruby 只读定向检查确认 181 份知识 YAML 均为 0.3.24；修订先草稿后提交、同版冻结输出、附件仅索引、Office 不转换、中文来源/附件/追溯目录及 specified/internal 边界通过。`git diff --check -- docs/knowledge docs/architecture` 通过；已清除相关现行 DHR 资产中的“更多菜单发起修订”“暂不打印且格式未确认”等过时解释。
- 未运行 DHR 业务测试、浏览器、PDF 视觉、ZIP 下载或数据库验收，未创建其他智能体；主开发收尾仍须取得新切片的独立质量结果。P0 保持 in-progress，P1/P2/P3 暂缓。

## Office 原件与 50MB 边界（2026-09-28，同一切片原位同步）

来源为本次用户交接及 `docs/development/dhr-workspace-navigation-decision-package.yaml` 的 `officeAttachmentSupport`；执行级别 L2，基线仍为 0.3.24，不新增替代 DEC 或本体代际。下文既有导航、迁移、附件与 ZIP 的历史验证均不证明此次 Office/50MB 增量通过。

- `user-confirmed`：保留 PDF/PNG/JPEG，新增 DOC/DOCX/XLS/XLSX；Office 仅上传和下载原文件，不提供在线预览、编辑或格式转换。单文件 50MB 明确定义为 `50*1024*1024 = 52428800` 字节（50 MiB），含边界；满足其他条件时允许该大小，52428801 字节拒绝。此上限不是整个 multipart 请求体的上限。
- `user-confirmed`：受控来源/生产对象/内容关联核验、原权限、原件 SHA-256、冻结引用、带原因解除关联并保留原文件继续适用；格式扩展不改变生产对象、三类表单来源、审批及放行规则。原件不因 Office 类型而转换后另算摘要，冻结 ZIP 保留原始字节。
- `inference`：扩展名与真实结构一致性校验、拒绝含宏/加密/损坏 Office、限制 ZIP 展开及解析资源开销是工程防护，不是用户直接规定的业务规则。只放在内部工程证据说明，不作为已确认规则条件；格式检查既不保证无恶意软件，也不替代人工受控核验。具体阈值、解析器及异常处理由主开发实现和验证。
- `original-evidence`：本体初核的工作树 `DhrAttachmentService.MAX_BYTES/upload/detectedType/inspectReadable` 仍为 25*1024*1024 且仅识别 PDF/PNG/JPEG；原件写盘后计算 SHA-256，verify/file 复核摘要，unlink 仅取消关联，downloadableFile 校验指定冻结版本中的附件 id 与 sha256。初核源码 SHA-256 为 `8d4817a62f57fb3537a0dabf756bc3c5cc765cb154550f7f854ba17f4faeb634`，HEAD 为 `dcbc67864147750579b8328da28c45d380798693`，sourceRevision 为 working-tree；这是并行实现过程的时点记录，不作为后续源码仍未实现的断言。
- `original-evidence`：初核 `DhrAttachmentController` 的上传/核验/解除关联仍要求 records.dhr-summary 与 dhr.summaries.edit；`DhrReviewController.attachment` 先取任务 detail 再绑定版本下载。两处下载文件名当时为无扩展名的 dhr-attachment-id，`DhrArchiveService.export` 当时只映射 PDF/PNG/JPEG 扩展名、按冻结 size/sha256 校验字节；主开发须核验 Office 原文件名/类型及同版 ZIP 输出。路径均为 `gmp-platform/backend/src/main/java/com/zencas/edhr/production/` 下对应 controller/service。
- `original-evidence`：初核 `gmp-platform/frontend/src/pages/dhr-management/DhrSummaryPage.tsx` 仍提示 25 MB 且选择器仅允许 PDF/PNG/JPEG；`0103-dhr-controlled-attachments.sql` 的 mime_type 为 VARCHAR(64)，不能容纳长度 71 的 DOCX MIME；`application.yml` multipart 为 150MB/160MB，`gmp-platform/frontend/nginx.conf` 未显式配置请求体上限。决策包提出新增迁移扩为 128 字符、调整网关及前端；这些是待主开发验证的工程影响，不改写原迁移或既有附件，不从通用上传上限推导 DHR 上限。外部部署网关仍需核对。
- `original-evidence`：仓库 `gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/controller/FileController.java` 的 ALLOWED_MIME_TYPES 包含四种 Office MIME，MAX_FILE_SIZE 为 150L*1024*1024；upload 读取 file.getContentType 并用 MD5 保存通用文件。源码 SHA-256 为 `81c548a72fb7a3772453b518e2f5b84c9aa375c59848684839c0a2de407e3ff9`。只用于对照，不能整套继承为 DHR 受控附件规则；不扩大 DHR 到其 PPT、视频或 ZIP 等白名单。
- `secondary-reference`：交接将上述通用 FileController 描述为 eSOP 原始实现；本次直接复核了本仓库原始控制器，未获得独立 eSOP 仓库及版本证据，不对外部历史同源性作额外确认。旧调研或历史通过记录不能替代 Office/50MB 验收。
- `original-evidence`：初核 `DhrAttachmentAndArchiveTest` 已有四种 Office 的上传/核验/下载及冻结 ZIP 参数化测试源码、acceptsExactly50MiBButRejectsOneByteOverBeforeReading 和伪造/损坏/加密/宏拒绝用例；本体仅阅读源码，未执行这些业务测试。测试存在不证明并行实现通过，也不证明所有恶意内容均被拦截。

知识同步无业务未决问题。扩展路径仍为 `product-core`：DHR 主开发拥有附件服务、下载控制器、ZIP、前端、迁移、部署配置及测试，本体只修改本节及既有 DHR 决策、规则、证据索引。Office 全格式、50MB 边界、拒绝场景、展开限制、MIME 迁移、真实浏览器上传下载和原权限/冻结回归及独立质量结论均交主开发收尾；本体保持 specified/internal，不新增执行契约，不宣称实现、发布或整体验证通过。

本次知识校验（`original-evidence`）：在 `gmp-platform/backend` 执行 `mvn -q -Dtest=BusinessKnowledgeModelTest test`，退出 0，59 项、0 失败、0 错误、0 跳过；2026-09-28 00:57 +08:00 读取 00:56:33 生成的 `target/surefire-reports/TEST-com.zencas.edhr.knowledge.BusinessKnowledgeModelTest.xml`，SHA-256 为 `3c9e0aa6cec8a45c8f94c1c34ac7657c489ea52dd39399827ea64d613d9dc7a8`（报告可能被后续构建覆盖）。只读 Ruby 定向探针确认 181 份知识 YAML 均为 0.3.24、七种格式、52428800 字节含边界、Office 原件处理和成熟度/推断边界；四份目标文件 `git diff --check` 通过。以上只证明知识结构、引用、证据路径与投影约束，不替代本次 Office 功能的独立质量门禁；本体未执行业务、浏览器或数据库迁移验收。

## user-confirmed

本轮同包 `confirmedUiRefinements` 前四条按 L2 原位补正（0.3.24 不变，不新增迭代）：

- 档案目录/按来源使用分段按钮，仅来源视图显示来源分类；保留选择身份和未保存保护。来源报错修复只让导航读取当前冻结版本 `candidates`，不得混入实时成员。
- 汇总及冻结查看的附件入口将右侧主内容切换为附件列表；原上传元信息、来源核验、下载和带原因解除关联保持，历史文件不物理删除。冻结查看只读，不增加其他工作区写权或附件接口。
- 冻结版本统一导出入口提供完整 ZIP/自定义 ZIP；自定义允许跨来源实例与附件混选，只限当前冻结版本成员，切换版本清空选择，明确标记部分包，不改变冻结证据及审批范围。
- 既有“重新整理”的显示动作统一为“发起修订”；最新入口按本文件首节，列表纯图标及提示、查看弹窗直接按钮，基于最新定版先建草稿，重新提交才形成下一冻结版本。技术动作和权限不变，不扩大整体合规结论。

### 当前模型统一、旧汇总转换与证据边界（2026-09-27）

- `user-confirmed`：前期旧汇总是错误设计，允许转换旧数据，不能转换的旧汇总可清理；移除旧模型及无意义兼容。原定义就地修正，0.3.24 不变，不增加替代性 DEC；此前搁置旧数据处理的错误现行结论已纠正。
- `user-confirmed`：自动完整归集、人工核查、目录仅展示；缺少 `checkResult` 的旧冻结即使是 `NONE/FORMALIZED` 也不能视为核查或合规完成。保留可用目录、位置、顺序及别名转成待核查草稿，旧冻结及其证据位置清理；源表单仍按生产对象重新完整归集，草稿须再次人工核查提交，不能直接翻模型标记、补造过去的核查或审批。
- `user-confirmed`：已有当前模型冻结版本和草稿不得覆盖；保留正常 `version_no/versionNo` 业务修订、批准与审计概念，移除 `evidence_model_version/evidenceModelVersion` 模型分支。迁移前备份旧汇总及关联，保留原审计并追加迁移事件。原始表单、生产对象、签署、原审计、附件文件和终止快照不删除，生产完成状态、权限及审批策略不变。该限定清理不是普通业务删除或重开生产入口。
- `user-confirmed`：公共图标仅在开启状态使用蓝色，属于展示，不引入业务状态、权限或证据语义；实现及 UI 验证归主开发。
- `secondary-reference`：最新交接标注为主开发原始数据库证据：`edhr_dev` 唯一旧版本 `378445557658828800`，对应 DHR 3 / `DHR-20260922-000003`，`model1,NONE,FORMALIZED`，无核查快照/审批，候选 `5,6,7` 仍存在，3 条位置，0 附件。该迁移前样本来自交接，保持secondary-reference；本次已直接核对迁移后状态，不据本机样本推断其他数据库。
- `original-evidence`：2026-09-27 23:53 +08:00，HEAD `dcbc67864147750579b8328da28c45d380798693` 之上的工作树静态核对 `DhrSummaryService.workspace/version/submit/reorganize/prepareNextDraft`：已移除服务中的模型标记，仍保留 `version_no`、完整集合、人工确认与新草稿修订路径；`DhrReviewService.hasCompleteManualReview` 不再以模型版本免检，`DhrArchiveService.export` 已去旧模型阻断分支，`DhrEvidenceImpactService.changes` 对当前集合统一比较新增实例和附件。只证明读取时源码，不能证明迁移已完成或旧数据已安全处理。
- `secondary-reference`：同日更早的本体证据曾直接核对冠骋 `SummaryEdhrRollBackBs.doService` 的 SUMMARIZED→IN_SUMMARY 及审批历史 inactive/rollbacktime。此次未重读竞品源码，保留为历史参考；不以外部回退实现证明本产品转换或正常修订规则。
- `inference`：删除错误模型的业务数据前，应能从备份与原审计定位原版本、关联和转换/清理结果；具体备份结构、迁移事件名、事务及幂等键由主开发实现。无核查快照只排除追认旧确认，不排除保留编排后重建待核查草稿。
- `original-evidence`（2026-09-28 接续核对）：`0104-dhr-current-evidence-only.sql` 及 changelog 注册已存在。SQL 先阻断非 NONE 或有 dhr_summary_review 的旧版本，以及 DHR.status 非 COMPLETED 的旧记录；后者按既有生产正常完工同步契约判定，不另行修改生产对象状态。已有当前冻结则不建转换草稿，已有草稿由 ON CONFLICT 保留；否则恢复最新旧版的目录及仍关联同一对象源表单的可用位置/别名。新草稿 source_scope_hash=NULL，要求重新保存核查。SQL 写入 MIGRATE，删除仅限错误旧汇总版本及其位置，保留原 audit_event 行，移除模型列并设 check_result_snapshot 非空；不生成旧核查或审批。这是一次迁移，不是运行时兼容分支。
- `original-evidence`：`DhrSummaryService.audit` 先按现存版本归属查审计；只有该租户已无版本行时才按 `data_summary` 关联已清理版本事件，避免伪造 data_summary 跨 DHR。`versionAudit` 仍要求指定版本属于本 DHR，不能用此回退打开已清理版本。`DhrAuditReadTest.removedDevelopmentSummaryAuditRemainsVisibleWithoutCrossDhrLeak` 有已清理归属、跨租户和现存他 DHR 版本反例源码；本角色未运行该业务测试。
- `secondary-reference`：2026-09-28 最新交接报告隔离 PG 备份恢复、布局、原始表单/生产/签署/附件/审计保护、事务回滚、当前冻结及草稿优先、空数据测试通过，本体本次已直接读取 `output/dhr-model-migration-nd28ev/postgres-regression.log` 的四组PASS，作为原始执行证据；未亲自运行该脚本。当前样本完全符合自动处理条件；其他环境如出现旧审批依赖须阻断排查，不能直接清空审批或签署。
- `original-evidence`：本体已直接核对0104成功及后端启动日志、postgres-regression.log四组PASS、前后指纹diff为空，并只读查询edhr_dev确认DHR3为COMPLETED/DRAFT、1草稿恢复作业7位置、旧冻结/位置0、模型列删除及1条MIGRATE；本机迁移已验证。用户再次核查/正式提交未做，本切片独立质量验证已通过。原始文件位于 `output/dhr-model-migration-nd28ev/`：backend-restart.log的00:01:41.693记录0104成功、00:01:44.207记录后端启动，pre/post-apply-fingerprints.txt的forms/production/signatures/audit指纹一致。psql查询在READ ONLY事务执行，草稿revision=1、source_scope_hash为空，recordId=7的目录位置及displayOrder=0恢复。
- `evidenceGaps`：用户再次核查及正式提交尚未执行，本切片独立质量验证已通过；本机迁移验证不代表这些后续动作已完成。

本轮 L2 影响：直接统一当前模型并转换草稿；传递到审批核查与导出删除旧分支；源实例、签署、生产完成和终止快照受保护；原审计保留并补迁移事件；权限不变。扩展路径 `product-core`，DHR 主开发拥有代码/迁移/UI/测试，本体只拥有知识与架构 DHR 段落；真实业务未决问题为空。主决策包已补 currentModelCorrection 和迁移/审计边界；主开发继续同步最终测试范围与证据，历史质量结果只解释其原范围。

### 本次本体实际校验（2026-09-28，original-evidence）

- 在 `gmp-platform/backend` 执行 `mvn -q -Dtest=BusinessKnowledgeModelTest test`，退出 0；正式报告为 59 项、0 失败、0 错误、0 跳过，覆盖 schema、标识与引用、证据路径、事实及成熟度/投影等约束。00:05 +08:00 核对报告 `target/surefire-reports/TEST-com.zencas.edhr.knowledge.BusinessKnowledgeModelTest.xml`，SHA-256 `028ce7268ff88e68624910f88587eb965f0bab40b16f059123e0eb52dd73674c`；构建报告可能被后续运行覆盖。
- Ruby 只读探针解析 181 份知识 YAML，全部保持 0.3.24；DEC-0062/0063/0068/0071/0072 为 specified/internal，旧汇总搁置处置的错误现行表述已消除，迁移核查与源数据保护边界存在。
- `git diff --check -- docs/knowledge docs/architecture` 通过；定向 `rg` 检查生产域 Java、DHR 页面及两个 DHR API 文件，无 `evidence_model_version/evidenceModelVersion/legacyVersion` 运行分支命中。历史迁移标记仅作为转换来源，不构成当前双模型设计。
- 本体仅修改知识及架构的 DHR 段落，未修改代码、测试、迁移、主决策包、并行按钮签署资产或知识版本，未创建其他任务。未亲自执行 PG 迁移、业务测试、浏览器或独立质量验证；已只读核对本机迁移日志、指纹和数据库现状，不宣称重新提交或独立质量通过；P0 仍为 in-progress，P1/P2/P3 暂缓。

以下为同切片原有确认，以上最新补正优先解释本轮范围；历史验证不替代本轮验收。

用户明确授权原位修订 DEC-0063/0068/0071/0072 及关联规则、事实与证据，不新增重复迭代方案。旧手选和完成状态纳入政策不再是现行需求，历史实现保留于 implementationDiscrepancies 与 Git。

- 按生产对象持续自动归集目录、作业、自定义实际实例及受控附件，不以手选或完成状态决定可见；普通汇总整理/提交仍限生产正常完成，已终止对象政策不变。
- 未完成、待审批、失败、作废、替代与处置历史保留，不冒充合格完成。COMPLETED 是流程状态，不等于检验合格；质量结果及处置另行核查。
- 空来源不造证据；应有记录、数量、签署、质量结果及异常处置按冻结配置和适用规则检查。必填目录只是其中一项，普通选填不自动豁免或一律阻断，既有未完成补录阻断保留。
- 证据范围与展示目录解耦，全部证据有默认位置。目录、别名、排序和组/单份整理不改变身份、内容或生产归属；整理保存重开后来源中仍保留记录，来源与档案位置引用同一实例，同一证据不重复计数。取消自定义位置恢复默认位置。DIRECTORY 保持基础归属，自定义根目录和子目录属于展示层。
- 查看、填报、汇总、审批四工作区统一“档案目录/按来源”两视图；填报默认按来源，其他默认档案目录。DIRECTORY 来源显示名为“批记录模板”，来源枚举及关系不变。整理只是档案编辑状态，完成返回档案浏览并保留选中目录和实例，不表示提交或生命周期变化；编辑时来源位于目录旁边，组/单份沿用既有摆放规则。
- 档案默认作业/自定义区域可折叠，零项保留紧凑入口及空态；已移实例不重复挂在默认目录，来源视图仍含当前范围内全部实例。审批与定版查看两视图使用同一冻结候选及位置，不混入实时草稿；填报使用当前生产实例及只读既有编排，不增加整理或上传权限。四条补正来自本次用户指令及同包 confirmedUiRefinements，按 L2 原位修正旧设计，不作为迭代，不改变生命周期、归集、审批授权或写入。最新源码核对及验证边界见 `dhr-filling-review-confirmed.md` 首节，旧测试不替代本次验收。
- 同包 `confirmedUiRefinements`：统一使用紧凑的“DHR 导航”标题，范围说明移至工作区头部；“整理目录”和“返回浏览”位于导航标题行，返回浏览保留当前实例，模式和实例栏以短过渡切换并支持减少动态效果。附件在导航底部提供独立入口，零份仍可打开，不增加第四种表单来源。移除业务工作区重复的 DHR 数据审计按钮，保留四列表行详情审计；实例日志以表单管理为主入口，本轮不新增 DHR 实例日志 UI。以上为用户确认的待验证 UI，既有测试记录不证明本轮入口与过渡已验收。
- 作业/工序表单由执行上下文绑定生产对象，不设计为人工选择归属；填错另一批次的值是内容错误，自定义选错上下文和附件误关联分别处理，不虚构自动归属事故或开放跨批次移表。
- 手工附件及纸质扫描核验来源、对象及内容关系；保存文件版本、来源/核验、上传信息及原件追溯，区分原记录形成时间和扫描时间。替换/解除关联受权限、审计及版本影响控制，旧冻结版本仍可追溯。
- 提交重新核查完整集合及来源版本（含新增实例/附件），陈旧提交阻断。冻结全部证据、检查结果（规则依据/版本、时间、问题、处置及确认）、目录展示、附件和审批绑定。
- 提交人必须逐项人工确认质量结果与异常处置、来源审批签署、完整证据范围，并填写核查说明；三项确认、确认人、确认时间和说明随 `checkResult` 冻结。系统不自动判读任意表单质量结论，人工确认也不表示系统已自动证明合格或签署有效。
- REQUIRED 使用开工冻结的 DHR_SUMMARY 流程版本，任务绑定完整冻结证据及检查结果。NONE 不另启本系统汇总审批，不免法定审核、源签署或放行；无虚构批准和自动放行。
- 审批任务专属附件下载必须经过任务级授权，且只能下载本任务绑定冻结版本包含的附件；通用 DHR 查看权和其他任务资格不扩展此范围。
- 来源生效变化自动检测、提示并阻断过时批准；人工退回或发起新版本重审，旧批准与快照不覆写。申请待审不等于生效，来源资格及变更作废仍归记录控制域。
- 实例操作日志负责填报、签署、变更作废及历史内容定位；DHR 数据审计负责目录、附件关系、核查、提交、审批及导出，分层关联而非替代。
- ZIP 支持整份冻结版本和选定范围，包含对应来源生产执行审计与签名，并保持 DHR 审计及审批签署可追溯；部分包明确标识，不能缩减审批对象或冒充完整 DHR；完整包不静默漏项。中文目录、可打印总/单表 PDF、两类附件原件及追溯 JSON 按本文件首节最新确认；不新增在线打印流程，具体打印引擎、命名去重和序列化细节仍为工程方案。
- 错误旧汇总按 DEC-0063-09 备份后转换或清理；不保留旧模型兼容，不补造历史核查，保护原始来源及审计。正常业务修订与已有当前模型草稿、冻结版本保留。

## original-evidence 与实现差异

2026-09-25 静态复核；Git HEAD：`ea2036027124c1fc9b9fb9aa2ddbb959478a1a81`；`sourceRevision: working-tree`。

- `DhrInstanceService.detail` 按 object_id 查询实际生产表单；`DhrSummaryService.candidates` 收集三类来源，`validatePlacements` 先给全部实际实例默认位置再叠加展示设置，不以 COMPLETED 过滤，`submit` 逐实例写入冻结证据。草稿和提交重新核对实例及附件范围，旧手选行为只由 Git 历史解释。
- `DhrSummaryService.submit` 已调用 createDhrSummaryInstance；`DhrReviewService.act` 已有任务、签署、批准、人工退回及新草稿路径，不能继续说审批运行时整体不存在。
- `DhrEvidenceImpactService.changes` 已比较冻结表单、新增关联记录与受控附件，并被批准动作调用；读取比较不能冒充记录控制生效事件、主动通知或质量检查结果变化的完整闭环。
- `summarySourceGroups.ts` 的来源键为 originKind/operationId/formId；空目标过滤自定义 placements，`DhrSummaryPage.effectivePlacements` 补回默认位置，不再把移出展示当成排除证据。
- `submit` 已校验三项人工确认和非空说明，并在 `checkResult.manualReview` 冻结确认人、时间和说明；`DhrSummaryPersistenceTest` 有缺确认阻断测试，但未见逐项/说明边界和冻结字段的完整断言。`DhrReviewController.attachment` 先调用任务详情授权，再以版本号调用 `DhrAttachmentService.downloadableFile` 校验附件快照成员及摘要；权限测试覆盖无菜单权和任务拒绝路径，尚非完整真实任务端到端验证。
- `DhrArchiveService` 已把提交时点前的生产执行审计与签名写入 ZIP manifest；`sourceSignatures` 与 `reviewSignatures` 均导出签署 payload 并校验 SHA-256，摘要不一致即阻断导出。`DhrAttachmentAndArchiveTest` 直接断言两类签名 payload，且将审批签名 snapshot_hash 改错后验证 FULL ZIP 阻断、恢复摘要后继续原测试；附件测试仅直接证明冻结包含附件的正向读取，尚缺跨版本拒绝断言。源码和聚焦测试文件存在不等于真实数据库 ZIP、外部记录控制审计全集或发布验收。任意质量结果/异常处置和源签署有效性并无通用自动判读；人工确认不能被写成自动合格结论。

详细剩余差异分别见 DEC-0063/0068/0071/0072；本体角色只读新业务源码及测试文件，未运行 DHR 业务、浏览器、数据库或导出测试。旧报告只作 secondary-reference，不能作为本次新能力验收。

## inference 与 evidenceGaps

ZIP 的中文来源目录、总/单表 PDF、实例附件、汇总附件及追溯 JSON 已由 revisionPrintableExport 确认，附件内容不合入总 PDF；打印引擎、具体命名去重算法、字段文件识别、影响事件传输及锁方案仍为工程实现选择。国外 US/EU 仅为工程建议基线，未确认客户市场；器械分类、签署/留存 SOP 与全部法规适用性为 evidenceGap，不阻塞通用文档修订。中国只采用 2025 新版设计基线；法规原文核验与功能映射以主设计第 7 节为来源，不宣称全集合规。

交接中的 `concept.form-instance-record` 未在当前本体注册，关系复用既有 `concept.form-instance`；`one-to-many` 按 schema 的零下界词汇记为 `one-to-zero-or-many`，避免为空来源制造必有实例。受控附件语义保留在同一决策与完整证据事实中，不扩展未确认的数据接口或全局表单来源枚举。

## 2026-09-25 知识校验历史（本次仅作 secondary-reference）

- 环境：项目 pom 要求 Java 21；实际 Homebrew OpenJDK 21.0.11、Maven 3.9.16。macOS java_home 注册查询失败，但 PATH 的 java 与 Maven 均使用上述有效 Java 21。
- 在 gmp-platform/backend 执行 `mvn -Dtest=BusinessKnowledgeModelTest test`：BUILD SUCCESS，59 项、0 失败、0 错误、0 跳过。报告为 `gmp-platform/backend/target/surefire-reports/com.zencas.edhr.knowledge.BusinessKnowledgeModelTest.txt`，验证 schema、引用、事实、provenance 与投影等正式契约。
- Ruby 只读定向检查：177 份知识 YAML 可解析且统一 0.3.24；四项决策及声明均 specified/internal 且保留实现差异；冻结字段含完整范围/检查/附件/状态/版本。完整证据范围、必填目录适用资格与有效变化事实均为 not-available，不冒充当前运行数据；旧 COMPLETED 实现事实与现行合格资格事实分开。
- `git diff --check -- docs/knowledge docs/architecture/business-knowledge-model.md docs/architecture/transaction-traceability-dhr-business-rules.md` 通过。未修改代码、测试、迁移、PRD、主交接资产或 output/；未运行 DHR 业务/浏览器/数据库/法规全集验收。
- 本结果只完成本体更新与知识校验；独立 QA 由主智能体随后派发。本轮新能力实现缺口不阻塞已授权的文档验收，不代表运行功能交付。

## 同切片补充收尾复核（2026-09-25）

- 三项人工核查、说明与确认人/时间冻结、审批任务专属附件下载、ZIP 来源生产执行审计/签名保留为原 DEC-0063/0068 的确认；旧数据处置统一按上文 2026-09-27 最新确认解释。历史校验不证明本次转换已验收，境外适用性推断未升格。
- 再次执行 `mvn -Dtest=BusinessKnowledgeModelTest test`：59 项通过、0 失败、0 错误、0 跳过。Ruby 解析 177 份知识 YAML；决策包仍为 0.3.24、concept/rule 为 specified、unresolved 为空；`git diff --check` 通过。只读核对了当前控制器、服务和聚焦测试源码，未由本体角色执行 DHR 业务、真实下载或 ZIP 端到端测试。
- 主开发需同步本角色无写权的 `docs/dhr-management-handoff.md`、`docs/dhr-management-product-research-and-roadmap.md` 第 5/9/11 节及 `docs/development/dhr-summary-decision-package.yaml` 的旧汇总处置；当前主包 `docs/development/dhr-workspace-navigation-decision-package.yaml` 沿用同一 ID 更新迁移/审批/导出影响与验收范围，不另建替代方案。
- 最后 ZIP 补充复核：`DhrArchiveService.signaturesFor` 将 `reviewSignatures.snapshotData` 写入清单并按 SHA-256 校验，与 `sourceSignatures` 同样失配阻断；测试已覆盖审批签署 payload 和 snapshot_hash 错误时 FULL ZIP 阻断，恢复摘要后继续原测试。真实数据库 ZIP 导出验收仍缺。
