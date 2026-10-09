# DHR 填报与审核：实现与验证记录（进行中）

日期：2026-09-23。知识基线：0.3.24。执行级别：L2。
工作位置：Local `/Users/ivenwang/Documents/edhr-nexus`，分支 `edhr-dev`。
决策：DEC-0068；决策包：DEC-PACKAGE-20260923-DHR-FILLING-REVIEW。
独立质量结论为 `blocked`（有效变更联动和主动通知尚未闭环）；本记录不表示完整质量门禁已通过，不宣称系统整体法规合规或产品放行能力。

## 已写入源码的范围（original-evidence）

- 新增 DHR填报、DHR审核菜单、路由和独立菜单/动作授权，保留已有汇总与列表。
- 两个新列表复用 `ListTableShell`、共享表格样式、`TableStateCell`、列设置与列宽持久化；状态和操作固定右侧，普通首列不加粗，使用既有 `PreviewOutlined` 图标。
- 填报使用冻结执行快照、三类来源和真实基础目录；实例默认收起；复用 `FormCanvasPreview`、`WorkflowActionButtons`、`AppDialog`、`FormDialog`、`FormDialogSection`、`FormDialogFieldGrid`、`ConfirmDialog`。
- 正常填报委托现有执行服务；完工后对**已经实际到达的表单绑定**创建新副本，沿用冻结权限/流程。补录要求原因及实际发生时间，保存系统录入人/时间，不覆盖原实例、不重开生产。尚未到达的作业表单不能借补录绕过适用规则。
- 汇总提交通过开工时冻结的 `DHR_SUMMARY` 定义/版本启动真实流程；没有审核节点的配置不能假装进入审核。`NONE` 沿用既有定稿语义。
- 审核针对个人待办/已办及明确汇总版本，服务端核验候选资格、动作配置、意见、签署与来源变化；批准不产生放行。
- 退回与重新整理保留原提交快照/审核历史，创建新草稿。草稿身份与修订号共同校验，旧请求不能跨草稿代际生效。
- 审核运行结果独立保存在 `dhr_summary_review`；不覆盖汇总版本的提交状态或哈希。已提交版本查看时可提示当前来源变化，已批准版本不自动撤回。
- 通用流程任务、实例、日志、签名读取排除 DHR；通用写入保护原记录与目标关联，不能通过改挂流程、复用 ID 等方式改写审核证据。

## 与已确认设计尚有距离的部分

- **真实表单变更/作废生效事件与有效修订标识**由朋友的模块提供，尚未接入。当前为读取及批准前比较已纳入记录的快照、字段值、模板版本和状态，不是事件驱动消息通知。不得将“变更申请提交”擅自解释为已生效。
- 尚未提供主动站内通知；当前影响提示位于审核及汇总版本查看中。
- 本切片的 DHR 审核动作实现通过/退回及配置的账户签署；`TRANSFER` 未闭环，不声称所有流程配置动作都已支持。
- 完工追加当前针对已到达绑定的新副本；不包含完工后选择一个全新自定义模板的新增入口。
- 不自动回填历史 `PENDING_REVIEW` 的工作流或审批事实；旧数据升级需要明确的后续处理方案。
- 开发环境已按用户本轮追加授权迁移、重启并完成只读冒烟（详见下节）；真实开发数据上的补录、汇总提交和审核写操作尚未执行，不能将启动成功等同于完整业务验收。

## 验证证据与边界

主开发执行的聚焦测试覆盖草稿并发、冻结绑定、审批资格/签署、人工退回、已批准历史保持、补录新实例及审计回滚。具体可运行入口：

- `DhrSummaryPersistenceTest`：真实 JDBC/事务，包含保存、提交、重整、跨草稿旧请求拒绝；来源详情与引擎部分使用替身。
- `DhrReviewServiceTest`：真实 JDBC/事务，资格、证据变化、配置按钮/签署委托、异常回滚；引擎/签署使用替身。
- `DhrFillingServiceTest`：真实 JDBC/事务，补录校验、不改变生产/定稿状态、审计失败回滚；执行引擎使用替身。
- `ProductionExecutionEngineTest`：补录权限、已到达约束、不修改旧实例/工序状态。
- `ProductionExecutionIntegrationTest#dhrSupplementUsesRealExecutionAndRecordServicesWithoutReopeningProduction`：真实 HTTP 安全过滤、DHR填报/执行引擎/实例记录/审计组合，补录新增且旧记录及快照不变。
- `DhrWorkbenchPermissionsTest`：真实 Spring 方法权限代理，不只是注解文本断言。
- `DhrGenericAccessTest`：真实 JPA 过滤/分页与通用读取/日志写保护。
- `DhrReviewLifecycleIntegrationTest`：真实汇总/工作流/账户密码签署/审计/JPA 事务组合，验证冻结非当前流程版本、人工退回重审、错误密码拒绝、批准后的来源影响提示及历史不变、并发批准只产生一次结论和签署。`DhrInstanceService`、`SubjectResolver`、`StateMachineService`、`WorkflowBindingRuleRepository` 使用替身；后三项不参与本测试的显式冻结版本路径，不能据此宣称覆盖其真实集成行为。
- `DhrReviewMigrationTest`：独立 H2 PostgreSQL 模式运行原始 0097 DDL 与种子，核验唯一/外键/状态及只授权 ADMIN、保留历史。
- `frontend/scripts/test-dhr-workbenches-browser.py`：真实无头 Chrome、全部业务接口拦截；验证目录/收起式多实例、补录说明、失败保留输入、签署防重、证据变化阻断与人工退回。截图位于 `output/dhr-filling-workbench-qa.png`、`output/dhr-review-workbench-qa.png`。
- `frontend/scripts/test-dhr-summary-browser.py`：汇总草稿缓存、远端更新、写入互斥、失败重试及冻结版本查看回归。请求包含草稿身份。

浏览器模拟接口不能证明真实后端联调；H2 不能替代 PostgreSQL 全量升级；单元测试不能替代真实变更/作废生效联动。

### 开发环境升级与只读冒烟（2026-09-23 02:18，Asia/Shanghai）

- 用户明确授权直接迁移和重启。升级前通过 `pg_dump -Fc` 备份本地 `edhr_dev`，文件为 `output/edhr-dev-before-dhr-review-20260923-0220.dump`，权限 `600`；未删除或覆盖既有 `output/` 文件。该备份包含开发库数据，未加入暂存区，不应提交 Git 或对外分享。
- 只读检查确认 0096 已于此前执行。本轮正常停止旧后端，通过 Java 21 / Maven 的 `dev` profile 启动；Liquibase 校验完整 master 后执行唯一待应用的 0097，126 个 changeset 中 125 个此前已应用、1 个本轮成功应用，迁移锁已释放。没有手工修改 changelog、清空校验和或回填历史审批。
- 新后端监听 8081，`/api-docs` 返回 200。启动日志：`/tmp/edhr-dhr-dev-restart-20260923.log`。迁移前后 DHR 均为 5 条、汇总版本均为 0 条；新增审核运行表为空，6 项新增权限各有一条 ADMIN 授权。
- Chrome 真实登录本地系统后，四个 DHR 菜单可见；DHR填报成功加载 5 条真实记录，并打开 `DHR-20260918-000002` 的真实目录、完成状态和表单画布；DHR审核正常显示 0 条待审，与库内尚无汇总版本相符。
- 本轮线上式冒烟仅登录、查询及预览，未修改现有生产记录、提交汇总、追加实例或执行批准/退回。前端继续使用现有 3000 Vite 服务读取更新源码。

## 独立质量门禁

首轮 `qualityResult: failed`，发现 QF-DHR-001（跨草稿旧请求）、QF-DHR-002（通用日志写入）、QF-DHR-003（通用读取越权）。主开发已实施修复并增加回归；全新独立质量实例 Hypatia（`01a0ca48-f8c4-7241-8358-9fd98461863a`）已返回结构化最终报告：三个 high 均为 `resolved`，未发现新增可复现代码缺陷，**整体 `qualityResult: blocked`**。

- 独立后端两轮去重 188 项：186 通过、0 失败、0 错误，2 个既有浏览器夹具因未启用专用属性跳过。补录 HTTP 集成在两轮各执行一次。
- 独立前端构建、两个 DHR 隔离浏览器脚本均通过，两张工作台截图已实看。复杂真实画布的只读冒烟由主开发补充，不混作该实例独立验证。
- 本轮 PostgreSQL 迁移及真实 Chrome 登录/只读冒烟由主开发执行；质量实例核对了启动日志和备份元数据，未重复迁移或真实业务写入。
- 阻断条件：真实变更/作废生效事件与有效修订标识未接通、主动通知未实现；缺少真实生效接口、待审申请对照及生效与批准并发的集成证据。读取时比较和页面提示不能替代完整闭环。
- 其他覆盖边界：原生 todo/done 的 PostgreSQL 排除查询、四类列表的全面多页总数、部分通用日志方法权限代理、复杂画布/移动端及动态影响投影的专门浏览器断言未全面独立执行；真实开发库未进行补录、签署、批准或退回写操作。
- 只有完成上述联动并复验，或用户明确接受有限范围交付，才能重新作出相应范围的验收结论；当前不宣告全部需求完成。

本体角色已将用户确认内容写入 DEC-0068，`ontologyResult: updated`，基线保持 0.3.24；设计资产仍为 `specified/internal`，没有假称已验收。

## L1 增量：DHR 填报生产状态与提前结束反馈（2026-09-23）

决策包：`DEC-PACKAGE-20260923-DHR-FILLING-STATE-FEEDBACK`；知识基线保持 `0.3.24`；本体阶段保持 `P0/in-progress`，不升级 schema、全局决策或知识成熟度。本节只记录局部查询投影、页面反馈和图标复用；上文 L2 的 `qualityResult: blocked` 及未闭环事项完整保留，本次证据更新不替代其验收。

### user-confirmed、实现方案、未决议题与 secondary-reference

- `user-confirmed`：用户要求修复误导性的状态展示和只读反馈，复用更符合填报语义的既有图标，并询问提前结束与补录的关系。该询问不构成用户已确认允许或排除提前结束后受控追加的产品决定。
- 主开发实现方案（非逐项用户确认；源码证据见下文）：生产状态从 `production_object.status` 查询，填报查询参数和附加返回字段均为 `productionStatus`，原 DHR `status` 不变；弹窗使用已有 `objectStatus` / `orderStatus` 解释当前只读边界及补录限制；入口选用 `FormFillingPage` 的 `PlayCircleOutline`。上文 `PreviewOutlined` 是此前实现记录，本次仅替代 DHR 填报入口图标。
- 本次实施边界（非长期产品排除决策）：主开发将 L1 限定为查询投影和页面反馈修复，暂不扩大状态机、不恢复批次、不放宽写权限。此边界不能解释为用户已决定永久禁止提前结束后的补录。
- 未决后续议题：提前结束后是否允许受控追加、允许时采用何种控制仍待产品讨论，本 L1 不放开。原交接包的 `unresolved: []` 仅表示当前展示修复没有阻断性歧义，不表示该后续议题已获决策；本次仅在此记录，不扩展其他知识文件。
- `secondary-reference`：`docs/knowledge/decisions/DEC-0062-dhr-instance-management-phase1.yaml` 的 04/08、`DEC-0063-dhr-summary-and-review-configuration.yaml` 的 08、`DEC-0068-dhr-filling-review.yaml` 的 03/08 分别保留生产正常完成与 DHR 完成、非产品放行、追加不重开生产的边界。它们用于核对既有决策，不能替代下列源码证据；已有未决问题继续归原领域，本次不清除或扩展。

### original-evidence：本产品源码定位

复核日期：`2026-09-23`；`sourceRevision: working-tree`；Local `edhr-dev` 的基点 HEAD 为 `7ad18e464cd918f3c5ac256e6525f2f87c7a9cd1`。下列路径相对仓库根 `/Users/ivenwang/Documents/edhr-nexus`，行号对应本次读取的 dirty 工作树；采用 `rg -n` 与 `nl -ba` / `sed -n` 静态核对，不声称运行验证或发布完成。

| 原始路径与定位 | 本次可支持的观察 |
| --- | --- |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/DhrFillingController.java:20-23`；`service/DhrInstanceService.java:100-156`（同一 production 包） | 填报 GET 显式接收 `productionStatus` 并调用 `listFilling`。服务按生产对象 ID 与租户关联查询 `production_object.status`，过滤和总数使用相同条件，填报结果额外投影 `productionStatus`；DHR `status` 保留。原 `list` 传入空生产投影参数，DHR 状态过滤仍限定 `IN_PROGRESS/COMPLETED`。 |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/DhrInstanceController.java:23-30`；`DhrSummaryController.java:29-34`（同目录） | DHR 列表仍传递自己的 `status`；汇总仍以 DHR `COMPLETED` 查询，未把填报的生产状态条件移植到列表或汇总。 |
| `gmp-platform/frontend/src/api/dhr-workbenches.ts:17-18`；`gmp-platform/frontend/src/pages/dhr-management/DhrFillingPage.tsx:32-38,158-165` | 填报类型增加 `productionStatus`；请求使用同名参数，列表按 `row.productionStatus` 渲染生产状态，未知值显示“未知状态”，不回退为 DHR 状态。入口使用 `PlayCircleOutline`，与 `gmp-platform/frontend/src/pages/form-management/FormFillingPage.tsx:434` 的填报图标一致。 |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ProductionService.java:156-168`；`ProductionExecutionService.java:197-203`（同目录） | `endObject` 设置生产对象 `EARLY_TERMINATED` 及结束原因/时间，更新工单终态，未同步完成或作废 DHR；正常全部工序完成路径才调用 `completeWithProductionObject`。因此首次开工形成的 DHR `IN_PROGRESS` 在该提前结束路径仍保留，不能解读为生产仍在执行，更不代表批准或放行。 |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrFillingService.java:31-56,60-84`；`ProductionExecutionService.java:158-159,236-240,267-278`（同目录） | workspace 沿用执行视图的 `objectStatus/orderStatus` 与服务端动作资格；普通动作仍委托生产执行并拒绝已结束对象。`mutate` 仅接受生产对象 `COMPLETED`，还受审核中阻断等既有校验；`EARLY_TERMINATED` 不符合追加补录条件。不是只靠前端隐藏按钮限制写入。 |
| `gmp-platform/frontend/src/pages/dhr-management/DhrFillingPage.tsx:78-82,139-147` | 生产对象提前结束时提示“仅可查阅”和“当前不支持提前结束后的追加补录”；工单提前结束且当前表单不可操作时另行解释所属工单状态。追加入口仍要求对象 `COMPLETED`；表单读写沿用服务端 controls，未新增恢复生产动作。 |

### original-evidence：冠骋关闭批次路径的限定比较

前端根目录：`/Users/ivenwang/Documents/iven space/paas-main-front`；后端根目录：`/Users/ivenwang/Documents/iven space/gct-edhr-bed/gct-edhr-bed`。以下是本次直接读取的本地源码副本；两处均无法解析 Git HEAD，版本未知，不冒称其部署版本或运行结果。

| 原始路径与定位（相对上述根目录） | 本次可支持的观察 |
| --- | --- |
| 后端 `src/main/java/com/gct/apaas/edhr/container/biz/ContainerCloseBs.java:138-164`，`closeContainerBatch` | 关闭批次写入 `ContainerStatusEnum.ENDED`，记录结束原因/时间，并调用 `edhrInstService.abandonEdhr(names, null, endReason)`。代码中“改为完成”的注释不能将这个关闭路径泛化为所有正常完工路径。 |
| 后端 `src/main/java/com/gct/apaas/edhr/service/EdhrInstService.java:119-130,141-190`，`abandonEdhr` / `abandonForm` | 先调用 `abandonForm`，再把 DHR 的物料运行状态设为 `ENDED`、实例状态设为 `ABANDON` 并保存原因。表单作废筛选通过 `LOT_RELATION` 查询及 `notIn` 排除关联表单，随后调用 `onlineFormProcessService.abandon`；注释说明用于排除其他批次/SN 关联的表单，不能写成无差别作废全部表单。 |
| 前端 `src/projects/online-form/src/views/integration/apaas_ebr/utils/instance-status/useInstanceStatus.ts:130-147`，`canEnterFillProcess` | 对 DHR `IN_AUDIT`、`SUMMARIZED`、`ABANDON` 显示提示并返回 false，拒绝进入填报。此处核对的是前端入口条件，不推断所有后端入口的权限行为。 |

`inference`：两个系统在已核对路径中的差异是：本产品提前结束保留 DHR `IN_PROGRESS` 并允许只读查阅，冠骋关闭批次路径联动作废 DHR 及符合筛选条件的表单，并由前端阻断填报入口。这只解释这些路径，不能推导冠骋正常完工后一律禁止补录，不能作为法规合规背书，也不把 GCT 的 `ABANDON` 联动默写为本产品需求。

### L1 impactAnalysis、验证及暂缓范围

- 直接影响：填报 list/filter/workspace 的状态与只读反馈、填报图标。相邻边界：DHR 列表/汇总的 `status` 过滤、菜单及动作权限、DHR/生产状态机、快照与审计规则不在本次变更范围。
- 兼容与迁移：填报 API 使用显式 `productionStatus` 参数和附加同名返回字段，原 DHR `status` 含义不变；这是查询投影，无数据库迁移。不能把旧填报参数 `status` 继续解释成新的生产状态筛选契约。
- `inference` / 扩展路径：`extensionStrategy.selectedPaths: [product-core]`，依据是现有查询服务与页面的局部修复；代码和测试归主开发，本角色只更新本 Markdown 证据，不修改业务规则或运行实现。
- 测试源码已定位：`gmp-platform/backend/src/test/java/com/zencas/edhr/production/controller/ProductionExecutionIntegrationTest.java:254-284` 的 `dhrFillingProjectsAndFiltersProductionStatusWithoutChangingDhrOrWriteRules` 覆盖生产状态过滤/分页、DHR 状态保留、workspace 只读及写入/补录拒绝。该测试直接设置生产对象终态，是投影与写门禁测试，不是提前结束动作自身的端到端验证。
- 测试源码已定位：`gmp-platform/frontend/scripts/test-dhr-workbenches-browser.py:106-133` 增加提前结束夹具、生产状态筛选/重置、图标、只读说明及无写按钮断言；业务 API 被拦截，不能当作真实后端联调证据。脚本中的截图路径不代表本角色生成或实看了截图。
- 本角色仅执行 Markdown 内容、源码定位、路径及旧内容保留检查；未运行 Maven、浏览器或数据库测试。新增测试的运行与当前 L1 质量门禁由主开发收尾汇总，本节不复用旧报告宣称通过。
- 后续议题与暂缓范围：提前结束后的受控追加仍是未决产品议题，本 L1 不放开，不记作用户已确认排除的需求；DHR 终止状态重新设计、冠骋正常完工路径扩展调研、P1/P2/P3 及上文 L2 已记录的阻断事项继续暂缓。无需为本次展示修复修改其他知识文件或新增全局决策。

### L1 收尾验证（主开发汇总）

- 本体 Mencius 返回 `ontologyResult: updated`，基线保持 `0.3.24`；独立质量 Plato（`01a0cc38-d817-7271-b1b6-479fc5fa959f`）返回 `qualityResult: passed`，两个实例均已关闭。通过范围仅为本节 L1，不替代上文 L2 阻断结论。
- 主开发及质量实例分别执行 `ProductionExecutionIntegrationTest,DhrFillingServiceTest`：53 项，51 通过、2 个既有条件跳过，无失败或错误；前端 TypeScript/Vite 构建及隔离浏览器五组检查通过。
- 本地后端已重启，未新增迁移。主开发真实接口核验 5 条记录，其中 2 条提前结束、3 条生产中；分别筛选所得总数为 2/3。真实 Chrome 核验 DHR `DHR-20260922-000004`、表单 `FR-20260922-000009` 的提前结束说明、只读输入及无保存/提交/审批/补录动作。仅登录、查询、预览，未修改业务单据或恢复生产。
- 真实页面截图：`output/dhr-filling-status-live-20260923.png`、`output/dhr-filling-readonly-live-20260923.png`；隔离截图：`output/dhr-filling-terminated-qa.png`。真实联调由主开发执行，质量实例实看截图，不能混称全部由独立实例执行。

## L1 增量：DHR 列表与详情的提前结束展示（2026-09-23）

决策包：`DEC-PACKAGE-20260923-DHR-EARLY-TERMINATION-DISPLAY`；知识基线保持 `0.3.24`。本段只记录 DHR 列表/详情的只读解释及其实现证据，不改变上文 DHR 填报切片或 L2 门禁结论。前节关于 DHR 列表未传生产状态参数的记录是当时实现快照，当前查询契约以下列源码为准。

- `user-confirmed`：提前结束生产对象的 DHR 不应继续被误导性显示为普通“收集中”，须在列表和详情明显区分。受控追加与作废不是同一动作；是否允许提前结束后受控追加、是否新增 DHR 终态或作废动作，留待独立产品决策，不视为本切片已确认规则。
- `secondary-reference`：`DEC-0062-04/08` 只定义首次开工 `IN_PROGRESS`、正常全部工序完成时 `COMPLETED`，没有定义提前结束后的 DHR 持久化状态迁移；`DEC-0068-03/08` 定义追加不覆写旧实例、不自动重开生产或改变放行。两者均不能推出“提前结束即 DHR 作废”。
- `original-evidence`（本地 dirty 工作树，2026-09-23，`sourceRevision: working-tree`）：`gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrInstanceService.java:117-160,275-305` 从关联的 `production_object.status` 投影 `productionStatus`，列表可按该字段筛选，详情返回同一字段；原 `dhr_instance.status` 仍独立返回。`gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/DhrInstanceController.java:20-34` 将 `status` 与 `productionStatus` 作为独立查询参数。
- `original-evidence`（同一工作树）：`gmp-platform/frontend/src/api/dhr-instances.ts:3-4,16-17,70-92` 保留 `DhrStatus` 的 `IN_PROGRESS/COMPLETED`，仅把 `EARLY_TERMINATED` 加入列表展示筛选，并映射为原 DHR `IN_PROGRESS` 加生产 `EARLY_TERMINATED`；普通“收集中”筛选同时要求生产 `IN_PROGRESS`。`gmp-platform/frontend/src/pages/dhr-management/DhrManagementPage.tsx:83,127-130,250-255,489-493,641` 在列表和详情显示“生产提前结束”警示，并提示 DHR 实例未自动作废或完成。
- `inference`：这里的“生产提前结束”是关联生产状态驱动的展示投影，不是新增的 `dhr_instance.status` 枚举、状态迁移或 DHR 作废结论。DHR 查询投影属于 `product-core`；筛选与详情的原始状态应分别核验。
- `original-evidence`（测试源码，未由本角色运行）：`gmp-platform/backend/src/test/java/com/zencas/edhr/production/controller/ProductionExecutionIntegrationTest.java:254-273` 覆盖提前结束与普通进行中的两个筛选、详情的双状态，以及非法生产状态参数。测试直接设置生产对象状态，可证明查询投影预期，不能证明提前结束动作本身的端到端过程。该 L1 的测试运行及独立质量结果由主开发另行汇总；本角色不据此宣称发布或审核通过。
