# DHR 填报与审批设计确认及证据边界

## 同切片最新四条 UI 补正（2026-09-27）

`user-confirmed`：DEC-PACKAGE-20260927-DHR-WORKSPACE-NAVIGATION 的 `confirmedUiRefinements` 当前前四条，L2、知识基线 0.3.24、specified/internal；原位纠正而非新增迭代。

- 分段按钮切换档案目录/按来源，仅来源视图显示来源分类，保留实例身份及未保存保护。冻结来源导航仅读取当前版本 candidates，报错修复不得混入实时记录。
- 汇总及冻结查看的附件入口切换右侧主内容为附件列表；沿用原上传元信息、核验、下载及带原因解除关联，不物理删除历史文件，不新增接口或其他工作区写权；冻结查看只读。
- 冻结版本统一入口支持完整 ZIP/自定义 ZIP；自定义可混选当前冻结版本内跨来源的实例及附件，标记部分范围，切换版本清空选择，不改变证据或审批范围。
- `revisionPrintableExport` 最新确认（2026-09-28）原位纠正入口：列表采用纯图标及提示，查看弹窗直接显示“发起修订”，不再通过更多菜单。两个入口沿同一技术动作、资格、原因和权限基于最新定版创建 DRAFT 汇总中草稿；重新提交才生成下一冻结版本并按原配置审批。草稿及历次冻结版通过版本选择可达，旧版只读并按权导出，不以数据审计替代旧版正文。版本隔离、同版中文可打印 ZIP 和附件不合入总 PDF 的确认及工程边界见 `dhr-summary-user-confirmed.md` 首节，尚不表示实现已验收。

`original-evidence`：本轮静态读取 working-tree `DhrSummaryPage.tsx` 的冻结 workspace，成员与附件分别取 `frozen.version.candidates/attachments`；`DhrSummaryService.reorganize/prepareNextDraft` 核对最新版本后创建新草稿。主开发仍在并行实施，读取时附件列表仍在 Dialog 内，不能据既有代码或旧质量 passed 宣称本次四条 UI 已验收。

最新旧汇总处置见 `dhr-summary-user-confirmed.md`“当前模型统一、旧汇总转换与证据边界”：用户明确前期旧汇总是错误设计，保留可用编排转为待核查草稿，不能转换者可清理；清理错误旧冻结及位置并去掉模型分支，不覆盖当前模型冻结或草稿，不补造核查，不删除原表单、生产对象、签署、审计、附件文件或终止快照。正常发起修订与 version_no 仍保留，生产完成状态和权限不变。PG 唯一样本与候选5/6/7、3条位置、0附件由交接转述，本角色未独立查询；竞品回退只作历史参考。

`inference` 与 `evidenceGaps`：组件组织仍是工程选择；本机0104迁移已按原始日志、前后指纹及只读查询验证，详见dhr-summary-user-confirmed.md；用户再次核查/正式提交未做，本切片独立质量验证已通过，实际业务再次提交未执行；附件、ZIP及浏览器验证范围见主决策包currentModelCorrection.qualityResult，不宣称整体合规。本体不改主决策包；最新 L2 范围已包含转换/清理及审批、导出删除旧模型分支，主开发须同步 impactAnalysis，不能继续将这些路径全部列为不受影响。公共开启图标蓝色不改业务。下列旧时点记录及测试保留追溯，不替代本轮结果。

## 共同工作区与来源目录关系的原位补正（2026-09-27）

最新前四条补正的实际知识校验（original-evidence）：2026-09-27 23:25 +08:00，在 backend 执行 `mvn -q -Dtest=BusinessKnowledgeModelTest test`，退出 0，59 项、0 失败、0 错误、0 跳过；在两项证据索引修订后重新运行，未复用历史结果。报告 `gmp-platform/backend/target/surefire-reports/TEST-com.zencas.edhr.knowledge.BusinessKnowledgeModelTest.xml` SHA-256：`557cfc8e30a9b2c37bd858e8d3c2de164a31f5750b929aea41c884d2b783fd9e`（构建输出可能被后续运行覆盖）。六份限定资产的 diff whitespace 检查通过；基线仍为 0.3.24，未改变 specified/internal 或 P0 in-progress。本次未运行业务、浏览器、数据库和独立质量验证，不以知识测试代替功能验收。

知识基线 `0.3.24` 不变；交接包 `docs/development/dhr-workspace-navigation-decision-package.yaml`（DEC-PACKAGE-20260927-DHR-WORKSPACE-NAVIGATION）；同切片新增四条 confirmedUiRefinements 后按 L2 核对，仅维护 DEC-0063/0068 及直接关联证据，不新增迭代、决策、规则 ID 或执行契约。下方既有详情抽屉、审计和签名相关记录保留。

### user-confirmed

- 来源身份与档案展示位置分离。整组或单份整理并保存重开后，来源中仍保留原实例，档案位置引用同一实例；两处可访问不表示两份证据，总数不增加，不按模板合并来源身份。
- 查看、填报、汇总、审批四工作区使用“档案目录/按来源”两视图，填报默认按来源，其余默认档案目录；表单选择和实例窄栏位置一致，首次打开第一份，关闭实例面板仍保留已选实例，填报切换保留未保存保护。DIRECTORY 仅将来源显示名改为“批记录模板”，WORK/CUSTOM 对应“作业表单/自定义表单”，来源枚举和关系不变。
- 整理只是档案目录的编辑状态，完成返回档案浏览并保留选中目录和实例，不是第三种业务视图、DHR 生命周期状态或提交/定版动作。编辑时来源位于目录旁边，整组或单份沿用原摆放、同级顺序与别名规则；DIRECTORY 固定基础位置，取消自定义位置恢复默认位置。来源访问与目录展示不是证据纳入/排除操作。
- 档案默认作业/自定义区域可折叠，零项仍保留紧凑入口及空态；已经调整位置的实例不重复挂在默认目录，来源视图仍包含当前证据范围内全部实例。零项是该默认位置的计数，不表示此来源没有记录或证据被排除。
- 审批与定版查看的两视图使用同一任务或显式版本的冻结候选及位置，不混入实时草稿；填报使用当前生产实例及只读既有编排，不获得整理、上传或其他写入权限。本次不改变生命周期、归集、审批权限、签署和写入契约。
- 同包 `confirmedUiRefinements` 确认统一使用紧凑的“DHR 导航”标题，范围说明移至工作区头部；“整理目录/返回浏览”位于导航标题行，返回浏览保留当前实例；模式和实例栏使用短过渡并支持减少动态效果。
- 附件位于导航底部独立入口，零份附件仍可打开，不增加第四种表单来源；原权限、数据、冻结版本及只读边界不变。
- 移除业务工作区重复的 DHR 数据审计按钮，保留四列表行详情数据审计。实例日志以表单管理为主入口，本轮不新增 DHR 实例日志 UI；日志分层、节点动作、电子签名及原授权不变。

以上入口与过渡要求是用户确认的设计，仍为 `specified/internal`。下方源码观察与既有测试各有其时点，不证明本轮 UI 已实现或已验证；本轮实现与交互验收由主开发完成。

### original-evidence：静态实现核对

本次四条补正核对时点：`capturedAt: 2026-09-27T22:31:03+08:00`，`sourceRevision: working-tree`，HEAD `dcbc67864147750579b8328da28c45d380798693`；`reviewStatus: reviewed` 仅指源码读取。用户授权原位修正旧设计，旧“三页统一来源导航”不构成需要新决策替代的业务政策。

- `gmp-platform/frontend/src/pages/dhr-management/dhrSourceNavigation.ts`：`archiveNavigation` 按 recordId 将覆盖位置替换默认位置，WORK/CUSTOM 默认节点即使零项也生成，并区分“暂无记录”与“暂无留在默认位置的记录”；`evidenceNavigation` 从原始 records 按 originKind 分组，不按展示位置过滤。仅证明投影源码，不证明四页接入、折叠或浏览器行为。
- `gmp-platform/frontend/src/pages/dhr-management/DhrSummaryPage.tsx`：只读 workspace 从 `frozen.version.candidates`、`frozen.version.overlayDirectories`、`frozen.placements` 构造；`effectivePlacements` 用覆盖替换默认位置，`actualRecordCount` 使用 candidates.length。`DhrReviewPage.tsx` 读取 `detail.version.candidates` 与 `detail.placements`。这些是既有版本范围的源码锚点，不是本次双视图验收。
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrReviewService.java`：`detail` 先校验当前候选或本人已办资格，再以任务的 dhr_instance_id/version_id 调用 `summaries.version`。`DhrSummaryService.version` 从指定版本及其证据关联读取候选和位置；`DhrFillingService.workspace` 读取 `executions.get(objectId)` 和基础目录快照，支持当前生产视角。后续同轮读取已见 `DhrArchiveLayoutReader.read` 返回只读 archiveLayout；它按草稿或最新汇总版本读取编排元数据，不能代替审批/定版的显式冻结版本读取，不证明权限回归通过。
- `gmp-platform/frontend/scripts/test-dhr-workspace-navigation.mjs`：读取时已有来源身份分组、位置不改变来源成员、空定义不造实例三项用例；本次未运行这些业务测试，它们不能单独覆盖四工作区默认视图、默认目录折叠/零项、整理完成双选择保持、冻结版与实时草稿隔离。

本次 `evidenceGaps`：四页接入、填报只读编排响应及原读取权限、双视图同版本隔离和上述交互仍由主开发完成并交独立质量验证；并行源码继续变化，不等待其完成才同步已确认知识。当前环境没有真实 subagent 调度能力，本体角色不创建平级线程替代质量实例，收尾质量门禁仍交主开发。本节之后的源码/测试结果是较早时点，不能替代本次验证。

`sourceRevision: working-tree`；基点 HEAD：`dcbc67864147750579b8328da28c45d380798693`；`capturedAt: 2026-09-27T02:12:54+08:00`；`reviewStatus: reviewed`。主智能体正在并行实现，以下只描述读取时点，不能当作最终实现或浏览器验收。

- `gmp-platform/frontend/src/pages/dhr-management/summarySourceGroups.ts`：`summarySourceKey` 按 originKind/operationId/formId 分组，缺失来源键按实例独立；`placeSummarySourceGroup` 按 record.id 调用逐实例摆放，空目标仅清除自定义位置。
- `gmp-platform/frontend/src/pages/dhr-management/summaryPlacementOrder.ts`：`placeSummaryRecord` 先移除同 recordId 的原位置再插入目标位置，保留别名；该源码支持展示引用替换，不证明服务端去重或保存重开已验收。
- `gmp-platform/frontend/src/pages/dhr-management/DhrSummaryPage.tsx`：`sourceGroups` 从 workspace.candidates 构建，`effectivePlacements` 叠加默认位置与覆盖；`actualRecordCount` 取候选数量而非来源/目录行数之和。读取时 grid 将目录、实例、预览、来源依次排列，尚不满足整理模式的来源目录相邻要求。
- `gmp-platform/frontend/src/pages/dhr-management/DhrFillingPage.tsx`：`guarded`、`dirty`、`pending` 和 ConfirmDialog 已有未保存切换保护，`selectedCopy` 沿实例组选择；读取时实例选择仍是预览区内下拉框，不能证明统一实例窄栏已完成。权限和签名逻辑仅作为保留边界，不在本次验证范围。
- `gmp-platform/frontend/src/pages/dhr-management/DhrManagementPage.tsx`：`DetailDialog.sourceRecords` 将 WORK/CUSTOM 分别取整个来源列表，`hasMultipleInstances` 仅适用于 DIRECTORY；读取时尚未证明按各来源表单组统一导航与实例窄栏的实现闭环。

### secondary-reference、inference 与 evidenceGaps

- `secondary-reference`：既有来源分组、排序证据和下方详情抽屉记录用于承接已确认规则；其中旧测试或旧源码时点不作为此次导航验收。`dhr-summary-source-group-user-confirmed.md` 中固定“右侧来源入口”的位置说明已按本次用户确认原位修正；DEC-0071/0072 的组/单份业务规则不变。
- `inference.dhr-workspace-shared-components`：三页复用具体组件以及窄屏允许收起预览是交接包明确列出的工程方案，未升格为 confirmed。用户确认的是布局一致和整理来源相邻，不是具体组件 API、尺寸、断点或状态存储方案。本轮无新增业务推断。
- 交接包 `rule.dhr-workspace-source-placement-display` 的语义复用 DEC-0063-03、DEC-0068-02/09。schema 支持 `exists`，但 `evidence.originKind` 尚不是事实目录中的已注册条件，因此交接示意规则不直接落库；不为此新建重复事实或规则。
- `evidenceGaps`：三页共同工作区、整组及单份整理后来源保留、同实例计数、保存重开、首次选择与关闭面板保留选择、未保存保护、冻结只读及窄屏交互仍需主智能体完成实现并提供聚焦测试/浏览器证据。本角色未执行这些运行验收，不等待并行实现才完成已确认知识修正。
- 本切片 `extensionStrategy: product-core`；代码所有权为 DHR 前端，知识角色只维护 docs/knowledge。独立质量门禁仍由主智能体在功能收尾统一安排，正式知识测试不替代独立质量结果或功能交付。

### 本次导航知识校验（original-evidence）

四条补正后的正式校验：2026-09-27T22:34:27+08:00，在既有 Java 21/Maven 环境的 `gmp-platform/backend` 执行 `mvn -Dtest=BusinessKnowledgeModelTest test`，完整 compile/testCompile/test 生命周期 BUILD SUCCESS，退出码 0；59 项、0 失败、0 错误、0 跳过。覆盖结构、唯一 ID、引用/证据路径、事实和状态/投影契约；`git diff --check -- docs/knowledge` 通过。报告 `gmp-platform/backend/target/surefire-reports/TEST-com.zencas.edhr.knowledge.BusinessKnowledgeModelTest.xml` 的 SHA-256 为 `8cb7ed8b72617923760d98e96986c5cb50c54abc810c7d123846cc4aec060020`，构建输出可被后续运行覆盖。本次不运行 DHR 业务、浏览器或数据库验证，不复用旧质量 passed；本体 updated 仅表示本轮知识更新及适用校验通过，不声明功能、发布、合规或独立质量完成。基线 0.3.24、specified/internal、P0 in-progress 保持，P1/P2/P3 暂缓。

同切片 `confirmedUiRefinements` 原位修订后的本次校验：2026-09-27T21:33:19+08:00，在 `gmp-platform/backend` 执行 `mvn -Dtest=BusinessKnowledgeModelTest test`，完整 Maven 生命周期 BUILD SUCCESS、退出码 0；59 项、0 失败、0 错误、0 跳过。报告为 `gmp-platform/backend/target/surefire-reports/com.zencas.edhr.knowledge.BusinessKnowledgeModelTest.txt`，可被后续构建覆盖。知识基线仍为 0.3.24，决策仍为 specified/internal；本次仅校验知识契约，未运行导航/附件/审计入口及动画的浏览器验收，未取得本轮独立质量结果。此前结果保留如下，不替代本次 UI 验证。

2026-09-27T02:15:27+08:00，在 `gmp-platform/backend` 执行 `mvn -Dtest=BusinessKnowledgeModelTest test`：完整 Maven 生命周期 BUILD SUCCESS、退出码 0；59 项、0 失败、0 错误、0 跳过。正式 JUnit 校验涵盖当前基线、schema、ID/引用、事实、证据路径及状态/投影约束。报告位于 `gmp-platform/backend/target/surefire-reports/com.zencas.edhr.knowledge.BusinessKnowledgeModelTest.txt`（构建输出可被后续运行覆盖）。`git diff --check -- docs/knowledge` 通过。本轮未运行 DHR 业务、浏览器、数据库或独立质量验证，不复用下方其他任务时点的结果。

## 2026-09-27：四列表通用详情与审计入口遗漏修复

知识基线保持 `0.3.24`；交接包 `DEC-PACKAGE-20260927-DHR-LIST-DETAIL`；执行级别 L2；原位补正 `DEC-0068-09` 及既有验收场景，保持 `specified/internal`。本次不是新增产品迭代，不新增概念、知识版本或执行契约。

### user-confirmed

来源为本次用户指令及交接包：DHR填报、DHR汇总、DHR审批、DHR列表的行点击都应打开右侧“数据信息 / 数据审计”抽屉；业务按钮独立打开相应工作区，沿各入口原授权。原有实例操作日志与 DHR 数据审计分层不变，通用详情入口不能替代工作区动作授权。

### original-evidence

`sourceRevision: working-tree`；基点 HEAD：`dcbc67864147750579b8328da28c45d380798693`；`capturedAt: 2026-09-27T00:59:30+08:00`；`reviewStatus: reviewed`（仅指本段源码与规范静态复核，不是运行或发布验证）。主智能体正在并行实现，下列观察仅对应读取时点，不代表最终交付状态。

| 来源路径与定位 | 已直接核对的事实与证据限制 |
| --- | --- |
| `docs/frontend/list-page-guidelines.md`：194–195、290–292 | 既有规范明确行点击使用右侧 Drawer，承载数据信息/数据审计；操作列不重复审计入口，窄栏审计采用折叠项。遗漏来自 DHR 落地及知识说明，不是本次新增该规范。 |
| `gmp-platform/frontend/src/pages/dhr-management/DhrManagementPage.tsx`：列表 TableRow、setSelected、SummaryWorkspace/DetailDialog | 读取时行点击、键盘和图标均设置同一 selected，再按汇总状态进入工作区或旧详情 Dialog，尚未区分通用详情与业务工作区。 |
| `gmp-platform/frontend/src/pages/dhr-management/DhrWorklistTable.tsx`：rows.map；`DhrFillingPage.tsx`、`DhrReviewPage.tsx`：DhrWorklistTable action | 读取时共享行没有通用详情回调，填报与审批由操作按钮进入各自工作区；不能把组件规范引用当成四页抽屉已经实现。 |
| `gmp-platform/frontend/src/pages/dhr-management/DhrSummaryPage.tsx`：列表 TableRow、auditDialogOpen | 读取时汇总列表由图标进入工作区；工作区已有分页审计弹窗和来源实例日志提示，前后证据按原始字符串展示。待复用共享审计展示。 |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/DhrFillingController.java`：detail、audit；`DhrSummaryController.java`：detail、audit | 并行工作树已加入填报/汇总只读详情，填报审计沿 records.dhr-filling，汇总读取沿 dhr.instances.view 或 records.dhr-summary；未据注解存在声称权限矩阵测试通过。 |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/DhrReviewController.java`：audit；`gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrReviewService.java`：detail | 新审计入口沿 records.dhr-review，先经 detail 校验当前待审候选或本人已办资格，再取任务对应 DHR/版本调用 versionAudit；不改用全局查看权替代任务授权。仅核对调用和校验源码。 |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrSummaryService.java`：audit、versionAudit、auditPage | audit 查询本 DHR 的实例、草稿、附件及汇总版本/审批/导出事件；新增 versionAudit 检查版本所属 DHR，按绑定版本筛选 DHR_SUMMARY_VERSION/REVIEW/EXPORT。复用 audit_event、只读事务及每页50条查询，没有在这些读取方法中写回原始快照。SQL运行与隔离待测试。 |
| `gmp-platform/backend/src/test/java/com/zencas/edhr/production/controller/DhrWorkbenchPermissionsTest.java` | 读取时已有菜单/动作/附件授权测试源码；不能作为新增详情/审计端点及版本隔离的通过证据。 |

后续源码复核（`capturedAt: 2026-09-27T01:03:01+08:00`，同一 working-tree）：三个新文件已出现并逐一读取。`gmp-platform/frontend/src/pages/dhr-management/DhrDetailDrawer.tsx` 已声明右侧 Drawer、双页签及按 list/filling/summary/review 选择读取接口；`gmp-platform/frontend/src/pages/dhr-management/DhrAuditTrail.tsx` 已声明折叠前后快照、分页、加载/空态/失败重试和分层提示；`gmp-platform/frontend/src/pages/dhr-management/dhrAuditPresentation.ts` 的 `dhrAuditFields` 解析字符串并生成中文展示字段，不写回输入快照。`gmp-platform/frontend/src/api/dhr-workbenches.ts` 已出现填报详情/审计与审批审计请求。此时四页面尚未接入 DhrDetailDrawer，不能把新组件文件存在视为四页交互完成，也未运行前端构建或投影测试。

### secondary-reference、inference 与待验证边界

- `secondary-reference`：DEC-0063-12、DEC-0068-01/07/09 和本文件旧记录用于承接日志分层、四入口职责与冻结版本语义。历史测试结果不能替代本次实现验证。
- `inference.dhr-review-audit-scope`：审批审计仅返回任务绑定版本的提交、审批及导出事件，是从任务授权和冻结版本边界推导的工程查询方案；即使源码已经出现，也不转写成用户 confirmed 产品规则。前端共享组件与中文快照转换也是实现选择；转换不得改写原始审计证据。
- 交接包的 `rule.dhr-list-standard-detail-entry` 作为既有 DEC-0068-09 的遗漏补正保存；`authorized-list-row` 是交接示意条件，尚非事实目录 ID，不为此创建重复规则、业务事实或概念。
- 三个新组件/投影文件已在上述后续时点直接核对源码，尚无本角色执行的运行验证。主开发完成后需核对四页接入、行键盘交互、按钮事件隔离、页签与重开复位、分页/空态/错误态及中文快照。
- 后端需运行入口权限矩阵、非候选/非本人任务拒绝、绑定版本隔离、事件集合和分页测试；当前静态读取不等同于这些测试通过，也不等同于真实浏览器/数据库验收。
- 本角色只修改本决策与相关证据；全局 README/ontology/glossary/architecture、button-signature 资产及运行代码/测试均不在本次写入范围。收尾独立质量门禁由主智能体统一安排；本体结果不代表 DHR 功能或发布完成。

### 本轮实际知识验证（original-evidence）

- 2026-09-27 01:01:28 +0800，backend 下 `mvn -Dtest=BusinessKnowledgeModelTest test` 在 testCompile 失败：`DhrWorkbenchPermissionsTest.java:77/78` 的 DhrReviewController、DhrFillingController 构造调用尚未补入并行新增的 DhrSummaryService 依赖。未修改运行代码或测试，完整 Maven 生命周期未通过。
- 已核对本次编译产生的 `target/test-classes/com/zencas/edhr/knowledge/BusinessKnowledgeModel*.class` 时间为 01:01:27，晚于对应四份知识校验源码。随后重新执行 `mvn -Dtest=BusinessKnowledgeModelTest surefire:test`，01:02:42 完成：59项、0失败、0错误、0跳过，退出0。该次实际运行正式 JUnit 校验器读取当前 YAML，通过结构、ID/引用、事实及成熟度/投影约束；不是复用历史报告，不证明完整测试编译缺口已关闭。
- 该次原始报告为 `gmp-platform/backend/target/surefire-reports/TEST-com.zencas.edhr.knowledge.BusinessKnowledgeModelTest.xml`，SHA-256：`b63ea740db242bcbee9e78ff4189dbcde560c3afeb7f3542548554d7b3791c35`。此文件为可被后续测试覆盖的构建输出，摘要仅定位此次结果。
- Ruby 只读定向探针通过：两份 YAML 基线仍为0.3.24；DEC-0068其他声明及既有决策属性保持不变；未新增声明ID，仍为specified/internal；日志分层引用确为DEC-0063-12；三个既有证据路径存在，版本审计隔离未进入confirmed声明。三份目标文件的 `git diff --check` 通过。
- 未执行本切片前端构建、浏览器、数据库或业务测试；未取得本切片独立质量结果。P0仍为in-progress，P1/P2/P3暂缓，不标记发布级verified。

### 主开发收尾复核（2026-09-27，original-evidence）

以下证据补齐本节并行读取时尚未完成的实现与验证，不改变知识基线或上述产品决策：

- 四页已接入 `DhrDetailDrawer`，行点击及 Enter/Space 打开右侧 560px / 移动端全宽抽屉；操作列阻止事件冒泡并保持原工作区。抽屉层级沿表单详情规范使用 `theme.zIndex.drawer + 2`，避免顶部应用页签遮挡。
- 后端 `mvn -q -Dtest=DhrAuditReadTest,DhrWorkbenchPermissionsTest,DhrSummaryPersistenceTest,DhrReviewServiceTest,BusinessKnowledgeModelTest test` 通过94项（3+7+17+8+59）。已通过正常 testCompile 和 test 阶段，前述并行开发时的构造参数编译缺口已关闭。
- 前端 `npm run build` 通过；`node scripts/test-dhr-list-detail.mjs` 4项通过，涵盖中文投影、原快照不变、用户原文保留及键盘事件。
- `/tmp/edhr-dhr-browser-venv/bin/python -u scripts/test-dhr-list-detail-browser.py` 通过四页行点击、键盘、业务图标隔离、关闭重开复位、分页、详情/审计错误重试、空态及移动端宽度。HTTP使用隔离数据，没有业务写入；截图位于 `output/dhr-list-detail/{list,filling,summary,review}-audit.png`、`mobile-detail.png`。
- 本地后端8081重启成功，Liquibase没有待执行变更。本次没有新增迁移或删除数据。真实API核对三份现有DHR的详情与审计：填报入口和全局入口返回同一DHR审计；真实浏览器完成列表、填报、汇总三页的数据信息及实际审计快照展开，截图位于 `output/dhr-list-detail/live-{list,filling,summary}.png`。
- 实际账号的待审/已审列表均为空，未制造业务任务；审批页交互由隔离浏览器测试覆盖，任务归属由既有服务校验、方法安全测试和绑定版本SQL隔离测试覆盖。未声称完成真实审批任务浏览器联调，也未回归全系统写流程。
- 本体结果 `updated`（原位修正既有DEC-0068及证据，基线0.3.24不变）。独立质量结果另由质量验证智能体返回；本段运行证据不代替独立验收。

---

## 2026-09-25：完整证据审批设计确认（保留原记录）

知识基线：`0.3.24`；修订日期：2026-09-25；`specified/internal`。
统一交接：DEC-PACKAGE-20260919-DHR-SUMMARY；原位修订 DEC-0068。

user-confirmed：完整证据范围沿用 DEC-0063，审批冻结全部实例/附件、含人工逐项确认的检查结果及流程绑定，目录与来源是同版本视图。审批任务专属附件下载只对当前任务授权主体开放，且仅限该冻结版本包含的附件。NONE 不免法定审核、源签署或放行。系统检测有效来源变化（含新增关联实例及附件）并提示，阻断过时批准；人工退回或发起新版重审，旧批准保留。申请待审不等于生效，来源变更/作废仍归记录控制域。受控追加不重开生产，终止政策不变，实例日志与 DHR 审计分层关联。客户菜单名按 DEC-0070 使用 DHR审批。

original-evidence：本轮读取 DhrSummaryService.submit、DhrReviewService.detail/act、DhrReviewController.attachment、DhrAttachmentService.downloadableFile 与 DhrEvidenceImpactService.changes，已有流程创建、任务授权、冻结版本成员校验、签署、批准和人工退回路径；聚焦测试源码覆盖无审批权限/任务拒绝时附件服务不被调用，尚无完整真实任务附件下载端到端证据。影响比较现已覆盖冻结表单、新增关联实例和受控附件，但未见生效事件主动通知、质量检查结果变化的完整比较及记录控制真实生效联调。具体差异见 DEC-0068 implementationDiscrepancies。

secondary-reference：下列 2026-09-23 记录保留为历史时点；其“仅新增资产”“当前未实现”等说法不描述 2026-09-25 当前工作树，也不构成本轮校验结果。历史业务报告见 dhr-filling-review-implementation.md，新能力仍待运行验收；市场及 SOP 适用性是 evidenceGap，不阻塞本轮通用设计修订。

---

# DHR 填报与审核设计确认及证据边界

知识基线：`0.3.24`；日期：2026-09-23；切片：`dhr-filling-review`；执行级别：L2。
决策包：`DEC-PACKAGE-20260923-DHR-FILLING-REVIEW`；落地决策：`DEC-0068`。
成熟度：`specified`；可见性：`internal`。实现仍在进行，本记录不构成功能验收、客户能力或运行时契约。

## user-confirmed：本次输入

来源为本次用户消息及随附决策包；下面是可追溯摘录，不声称重新读取了其他对话全文。

- 四个菜单为 DHR填报、DHR汇总、DHR审核、DHR列表。DHR审核是针对不可变汇总版本的个人待办/已办。
- 三类实例来源沿用目录直接绑定、作业表单节点、生产执行自定义表单。来源分类不等同于全局实例的业务承载域枚举；不据此新增全局来源值。
- 补录属于低频受控操作，不凸显；追加创建新表单实例，不修改旧实例或手工创建 DHR。
- 朋友负责表单变更和作废；DHR 消费实际生效结果。申请待审不代表源证据已改变。
- 审核中受影响由系统自动标识、提示并阻断过时批准，退回整理由人执行；退回后创建新草稿/汇总版本，保留历史。
- 已批准版本不自动退回、不擦除旧批准或快照；由人发起新版本重审。
- 完工补录不自动重开生产；上述处理不自动影响产品放行，不回填历史。
- 审核使用冻结的 DHR_SUMMARY 定义/版本及本次不可变汇总版本；通用流程入口不能绕过域校验。
- 页面遵守新版共享组件规范，DHR 开发不接管朋友的变更作废模块。

“新增实例”在本切片指表单实例；“新版本”指同一 DHR 下新的汇总版本。两者都不改变每个生产对象唯一 DHR 的既有约束。

## 历史决策承接（secondary-reference）

既有知识仅用于确认现行模型和定位来源，不当成本切片新功能的实现证据。

| 既有资产 | 本次承接或局部替代 |
| --- | --- |
| DEC-0062 | 保留首次合法开工自动创建唯一 DHR、冻结生产上下文和完工语义；只承接并局部替代 08 中本切片填报补充、汇总审核/退回的延期范围，不扩展 DHR 作废、发布或归档。 |
| DEC-0063 | 保留三类候选、实例级归档、基础目录不可变、提交冻结、NONE/REQUIRED 和不回填；仅替代 07 的审核延期范围。本次是设计授权，不追认其历史切片已实现审核。 |
| DEC-0056 | 最新任务明确指定 DHR审核。本切片仅替代 01 中 DHR 菜单展示名；流程中心“审批流程”、表单审批及稳定技术标识保持原契约，不全面撤销术语规则。 |
| DEC-0067 | 共享填报设置是相邻进行中切片；不将其代码或知识状态升级，不把其“不兼容旧数据”扩大为允许删除本切片历史证据。 |
| open-questions.yaml | 活动表单作废资格、重新分配签名等问题仍归原领域；本切片不替其作产品决定，也不清除未决问题。 |

原有 DEC-0062/63 和 README 的阶段性“后续开发”文字按其历史切片解释。本次只新增资产，通过新决策 supersedes 和此处局部范围保留追溯，不修改已有 dirty 文件。

## original-evidence：只读核对范围

`sourceRevision: working-tree`；基点 HEAD：`7ad18e464cd918f3c5ac256e6525f2f87c7a9cd1`；`capturedAt: 2026-09-23`。
复核方式为源码/规范静态读取，不是运行验证。并行实现继续变化时，以下观察不代表后续最终源码。

| 原始路径与定位 | 本次可支持的观察 |
| --- | --- |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrSummaryService.java`：`candidates`、`submit`、`version`、`lockedCompletedDhr` | 读取时三类候选来自 directory/work/custom；submit 冻结目录、候选、关联、哈希和流程引用，REQUIRED 使用 PENDING_REVIEW；既有写门禁阻断对已提交汇总的直接修改。只能作为新切片接入基点，不能证明审核、新版重审及影响检测已完成。 |
| `gmp-platform/backend/src/main/resources/db/changelog/0092-dhr-summary-workspace.sql`：汇总版本/证据表及状态约束 | 存在 DHR_SUMMARY 分类、汇总版本和实例证据关联结构，来源值为 DIRECTORY/WORK/CUSTOM；读取迁移不等于执行迁移，新状态兼容需由实现验证。 |
| `gmp-platform/frontend/src/pages/dhr-management/DhrSummaryPage.tsx`：imports | 当前汇总页引用 ListTableShell、TableStateCell、ConfirmDialog 和共享列表样式；引用存在不等于新页面及交互已验收。 |
| `docs/frontend/list-page-guidelines.md`、`docs/frontend/list-table-shell.md`、`docs/frontend/dialog-guidelines.md` | 当前共享规范来源：独立列表共用表格壳、表头/正文/固定列/列宽样式、TableStateCell；首列继承普通正文，不另设蓝色链接或特殊字重；普通表单使用 FormDialog、FormDialogSection、FormDialogFieldGrid；预览、确认、签名及内嵌明细按各自适用边界。 |
| `gmp-platform/backend/src/test/java/com/zencas/edhr/knowledge/BusinessKnowledgeModelTest.java`：`currentKnowledgeModelIsValid`、基线和负向测试 | 正式知识校验入口，可验证 schema、标识、引用及投影约束；不能验证 DHR 业务运行、页面或真实变更作废集成。 |

未使用竞品调研摘要证明本产品规则，未重新调研外部法规，也不将旧切片测试或质量结果复用为本切片结果。

## impactAnalysis：L2 设计范围

| 维度 | 确认范围与边界 |
| --- | --- |
| directImpacts | DHR 填报/审核菜单、受控追加、冻结版本审核及证据影响；源码接入基点为上表服务和页面。 |
| transitiveImpacts | 显式冻结 DHR_SUMMARY 绑定、个人任务/已办、通用入口防绕过；真实运行证据待实现。 |
| potentialImpacts | 朋友的变更/作废生效接口及修订标识尚未暴露；待审申请不当成生效。此项是集成依赖，不是已完成能力。 |
| unaffectedAreas | 产品放行、手工 DHR 创建、历史回填、生产自动重开均不在授权范围；表单变更作废实现仍归朋友。 |
| compatibilityAndMigration | 按包采用增量 schema/菜单权限，保留旧快照；不自动回填历史审核绑定，迁移与状态约束验证由主开发负责。 |
| snapshotImpacts | 已提交版本的内容、来源证据和冻结绑定不被后续操作覆盖；发起修订先产生草稿，重新提交才产生下一冻结版本，旧版始终可按权只读访问。 |
| auditImpacts | 区分系统检测、人工退回、重新汇总及新版本审核，保留原批准、原来源和退回历史。 |
| permissionImpacts | 专用菜单/动作权限及冻结流程候选资格分别核验，个人待办与已办不能构成越权通道。 |
| testImpacts | 授权、并发、冻结绑定、通用入口防绕过、有效变化阻断、人工退回、新版重审、历史保留、共享组件交互；具体场景见 DEC-0068，均为待交付证据要求。 |

`extensionStrategy.selectedPaths: [product-core, transaction-orchestration]`。
DHR 域编排既有表单与流程引擎，不散落客户条件分支。主开发拥有 DHR 代码/测试，朋友拥有表单变更作废模块；本角色仅新增当前切片决策与证据。

## inference、缺口与暂缓

- inference：影响检测采用事件、查询时校验或其他机制，事务锁/幂等策略和补录入口具体控件均属实现选择，本记录不将其确认为业务规则。补录映射到哪一类来源须用实际实例证据核对，不凭本记录发明第四类。
- evidenceGaps：实际变更作废生效接口、有效修订定位及联调证据尚未提供。其缺失不阻塞记录已经确认的设计，但阻塞宣称该集成已实现。
- evidenceGaps：新填报/审核页面、任务、签署、并发批准阻断、新版重审和迁移的最终实现及测试证据仍待提供。不能以旧汇总服务或旧质量报告补齐。
- 决策包 `inferred` 与 `unresolved` 均为空；上述工程缺口不新增用户业务问卷，也不清空基线已有问题。
- 输入包的 `condition: {all: []}` 及 `block-stale-approval-and-notify`、`new-record-preserve-history` 不能直接成为当前 schema 的正式规则。本次将 `concept.dhr-review-workbench` 语义保存在 DEC-0068-01，将 `rule.dhr-human-return-on-impact`、`rule.dhr-supplement-not-reopen` 语义分别保存在 DEC-0068-05 和 03/08；这些输入标识未注册为概念或可执行规则，不伪造事实条件或执行契约。
- P0 仅沿用现有结构，未证明阶段退出；P1/P2/P3、schema/词典/本体/事实目录扩展、运行时和客户投影均暂缓。
- 质量门禁由主开发在功能切片收尾统一安排。本体结果仅说明这次知识资产更新及适用校验，不宣布 DHR 功能完成。

## 本次知识校验结果（original-evidence）

- `mvn -Dtest=BusinessKnowledgeModelTest test` 在测试编译阶段失败：并行工作树中的 DhrSummaryService 已增加 WorkflowEngine 构造参数，DhrSummaryPersistenceTest:165 与 DhrSummaryServiceTest:27 尚未同步；未修改这些业务测试，也不声称完整 Maven 生命周期通过。
- 该次编译已生成本次时间戳（2026-09-23 01:15，Asia/Shanghai）的五份知识校验源码对应 class，随后在 backend 目录执行 `mvn -Dtest=BusinessKnowledgeModelTest surefire:test`：59 项，0 失败、0 错误、0 跳过，退出码 0。该命令独立运行正式 JUnit 知识校验器，通过 schema、引用、路径与成熟度/投影等检查；不是旧报告复用，也不代表前述业务测试编译缺口已修复。
- Ruby 定向检查通过：新增 YAML 基线均为 0.3.24，决策及十条声明均为 specified/internal，证据路径存在且可见性为 internal，supersedes 指向本次列明的三项历史决策。
- `git diff --check` 通过；本角色仅新增 DEC-0068 及本切片两份证据文件，没有修改既有文件。未执行 DHR 业务集成、浏览器、真实数据库迁移或独立质量验证。
