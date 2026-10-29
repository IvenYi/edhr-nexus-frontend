# DHR 审核、封存与变更能力盘点

2026-10-29，Asia/Shanghai。本轮为同一调研／澄清切片的 L1 增量，来源与契约基线 `a4cb9a9fa4f3f88ed801d47463158495990b0308`，已 fetch 的目标仍为 `edhr-dev@635711f97e9b794f4af02e1e5d1939bb2ecf920f`，目标未合并。只做能力核对、聚焦既有测试及新确认知识同步，不实现本轮新门禁、封存或新入口。

## 当前结论

| 问题 | 结论 | 主要原始证据 |
|---|---|---|
| DHR 审核有做吗 | 已有页面、接口和服务，审核绑定冻结汇总版本，支持待审／已审、签署、通过、人工退回、版本核验和审计；完整变更生效联动仍有缺口 | DhrReviewPage、DhrReviewController、DhrReviewService、DhrSummaryService、WorkflowEngine |
| 有封存操作吗 | 在当前实际生产 DHR 工作区及服务中未找到完整封存动作。存在归档包导出和通用状态声明，不能据此称封存已实现 | DhrInstanceService、DhrArchiveController／Service、DhrStatusMachine、StateMachineService |
| 封存有规划吗 | PRD 有放行后只读、归档包、已归档状态及 P1 放行后变更方向；未形成已落实的独立封存业务规格和执行闭环 | MVP PRD 场景7、DHR状态规划，商业版PRD归档／放行后变更方向 |
| 是否缺冠骋式 DHR 变更 | 缺“按批次／SN打开DHR目录、选中表单发起变更”的便捷入口，且该入口已明确延期；单表变更审批核心已有。另有汇总版本“发起修订”能力，不能将二者混为一谈 | Crown V1 record-change 路径；DEC-0086；RecordChangePage／RecordControlService；DhrSummaryService.reorganize |

标记：`original-evidence` 是本轮直接读取的源码、原始产品文档和实际测试；`secondary-reference` 是以前的交接／调研索引；`user-confirmed` 是本轮原话与既有明确决策；`inference` 是建议和实现解释。原始资料不是最新竞品部署的保证，未操作冠骋线上系统。来源及哈希见本轮 capability-source-manifest.json；此前原图和状态门禁原件仍可追溯。

## 1. 新确认：DHR 审批中先退回，再发起表单变更／作废

本轮用户原话（`user-confirmed`）：

> 那我们也按冠骋这样，DHR审批中先禁止发起表单变更或作废，需要修改就先退回

这项确认补齐上轮尚未决定的发起资格：相关 DHR 审批中，禁止新发起来源表单变更和作废；需要修改，先由有权审批人通过 DHR 专属退回路径人工退回，再按原资格申请。它是我方业务约束，应覆盖按流水号、未来 DHR 目录入口及最终提交服务，不能只隐藏一个页面按钮。查看原记录、原修订和旧冻结不因此禁止；不自动退回，不扩大人员权限。

既有 DEC-0068-13 的另一方向继续适用：表单申请已经在审时，相关 DHR 暂缓汇总提交及批准。两项合起来形成两个方向的保护：DHR 正在审批时不能插入新申请；已有活动申请时不能把 DHR 送审或批准。不是永久禁止已完成记录纠正，也不是将申请状态变成来源生效。退回后应结束原 DHR 本轮审批并准备草稿，表单改完重新核查和提交，新旧版本、申请及签署各自保留。

`inference`：最终确认时须重新核对 DHR 状态，覆盖“用户先打开变更页、另一人随后提交 DHR 审批”的时序，并与现有生产对象／DHR 锁序协调；这是后续实现和并发验收责任。本轮未把打开页面视为占锁，也不新增“只有某个入口才禁止”的例外。

`original-evidence`：当前 RecordControlService.submit 的显式检查是来源已完成、当前修订、同实例活动申请等，尚未核对关联 DHR 的 PENDING_REVIEW；本轮新规则未实现。不能用现有 DHR 审核测试通过替代它。

## 2. 已有 DHR 审核具体做到哪里

- 前端 `router/index.tsx` 已挂载 `/dhr-management/review`，`DhrReviewPage.tsx` 调用真实 dhr-workbenches API，不是静态待办示例。
- 后端 `DhrReviewController` 有任务列表、详情、版本审计、冻结附件下载和 actions，动作受菜单、动作及任务主体资格约束。
- `DhrSummaryService.submit` 使用冻结的审批策略：REQUIRED 显式启动 DHR_SUMMARY 流程并进入 PENDING_REVIEW；NONE 直接 FORMALIZED。没有待审任务不必然表示没做审核，也可能是该实例开工时冻结的策略为 NONE。
- `DhrReviewService.act` 验证当前任务、流程和冻结哈希，核对人工检查结果、来源变化及原件，按节点配置认证签署人；调用专属引擎入口完成审批。人工 RETURN 准备新草稿，最终 APPROVE 进入 FORMALIZED；旧冻结正文不就地改写。
- `WorkflowEngine.completeDhrTask` 与通用任务路径分开，通用任务动作不能绕过 DHR 专属校验。
- 已定稿的 DHR 有 `DhrSummaryService.reorganize`／前端“发起修订”：基于最新冻结版创建新草稿，重新提交才生成新冻结版本，原版本与审批结果保留。

本轮在固定基线实际运行 4 个既有测试类：DhrReviewServiceTest 10 项、DhrReviewLifecycleIntegrationTest 6 项、DhrWorkbenchPermissionsTest 8 项、DhrSummaryServiceTest 8 项，共 **32 项通过，0失败／错误／跳过**。命令、各用例、JUnit及日志的无损归档见 [capability-tests/manifest.json](capability-tests/manifest.json)。它们使用 H2 内存库与 mock 夹具；生命周期测试真实组合汇总／工作流／签署／审计服务链，但 DHR 元数据投影使用 stub，表单文件、附件、主体解析、通用状态机和流程绑定规则仓储等使用 mock。未运行 PostgreSQL、浏览器或产品全系统验收。

缺口仍是：真实变更／作废结果接入、有效修订身份、站内影响通知、两方向的在审保护、当前追溯与 A12 统计切换等。审核“有实现”与这一整条链“已经验收”应分别陈述。

## 3. “版本冻结”“归档导出”“封存”是不同能力

1. 当前提交 DHR 汇总会冻结具体版本，审核和导出以该冻结版本为依据；以后可通过新草稿形成新版本，旧版保留。
2. 当前 `DhrArchiveController` 提供指定版本 GET export，`DhrArchiveService` 生成 ZIP、PDF及追溯文件并记导出审计；未把 DHR 改成 ARCHIVED，也未因此永久锁定后续修订。
3. 通用 `DhrStatusMachine` 声明 `SUMMARIZED->RELEASED->ARCHIVED`；但当前生产 DHR 持久化和实际入口使用自己的生产状态与 summary_status，未见调用这条 DHR 状态转换链。`StateMachineService.transit` 本身只验证并记录日志，不负责持久化业务状态。该声明不能替代封存处理服务、权限、签署、锁定范围或后续变更规则。
4. `DhrInstanceService` 当前实际 summary_status 为 NOT_STARTED／DRAFT／PENDING_REVIEW／FORMALIZED，生产 DHR 状态为 IN_PROGRESS／COMPLETED／EARLY_TERMINATED；定稿后仍允许显式“发起修订”，与已封存不是同一含义。

`original-evidence` 产品规划：MVP PRD 场景7和状态图规划放行审核、归档包、已归档及 P1 放行后变更；商业版也有归档与放行后变更方向。它们是产品目标，不能证明已开发。既有 DEC-0063-08／DEC-0068-08 明确 DHR 审批不等于产品放行，本轮保留。

`inference`：如后续做封存，应一起明确由谁、在什么时点执行，冻结哪些数据，是否需要签署，封存后能否解封以及如何受控补充／更正，并与产品放行和保存策略对齐。本轮只记录能力／设计缺口，不自动新增封存、解封或放行政策，不把 FORMALIZED 直接改名成封存。

## 4. “DHR 变更”应拆开看缺什么

| 实际需求 | 冠骋参考及我方现状 | 接续范围 |
|---|---|---|
| 从DHR找到具体表单纠正 | 冠骋按批次／SN目录选单表；我方目前按流水号发起，DEC-0086明确目录／批次入口延期 | 后续复用同一个记录控制服务，入口可补，不再建第二套审批 |
| 修改已填表单内容或作废该表单 | 我方已有独立申请、签署、审批和修订／作废核心 | 补本轮确认的 DHR 在审服务端阻断、权限协同和下游联动 |
| 重新核查已定稿DHR并出新版 | 我方已有“发起修订”与新草稿／冻结版本／重新审批路径 | 联动真实来源生效，并验证历史不被改写，不能说整套DHR修订没做 |
| 整份DHR任意编辑或整体作废 | 冠骋整体作废是另外的接口；我方本轮没有确认新增这类许可 | 不从竞品菜单名称自动推导此需求 |
| 已放行／封存后的更正 | 产品文档有长期规划，当前封存／放行执行闭环不完整 | 应作为独立生命周期切片，不借普通表单变更默认开放 |

本轮直接重读 Crown `edhr-change.vue`、V1 工厂、`canEnterChangeProcess` 及封存适配入口：DHR 页面在 IN_AUDIT／ABANDON 拦截，ARCHIVED 关闭变更和作废；FORM_CHANGE／DHR_CHANGE 最终共用单表处理器。冠骋页面层这一事实与本轮我方确认的全入口业务约束分别记录，不能声称已验证冠骋所有后端路径。

建议顺序（`inference`）：先闭环现有记录控制与 DHR 两方向门禁及真实生效消费，再完成追溯／统计 A12和影响通知；需要按批次操作时补复用入口。封存／放行另行定义最小生命周期，避免只加一个状态或按钮产生已受控封存的假象。本轮不关闭两项 DHR high 或 A12。

## 5. 本轮交付与验证回执

本体同步结果为 `updated`，见 [capability-ontology-result.yaml](capability-ontology-result.yaml)：新增 DEC-0068-14 并同步当前解释，知识模型仍为 0.3.25。独立质量结果为 `passed`，见 [capability-quality-result.yaml](capability-quality-result.yaml) 及 [capability-independent-evidence.json](capability-independent-evidence.json)，覆盖本轮知识和能力调研；复核发现的一处测试范围表述已收紧并复核通过。

本轮实际运行的既有业务测试为 32 项，知识测试为 89 项，分别保留原始结果；没有将知识检查算作业务验收。质量角色独立核对原件及来源，没有重复运行这些测试。通过后仅补本节回执与交接状态，不改业务结论。本轮没有产品代码、迁移或配置变更；新增双向门禁、真实生效联动、通知、作废展示、A12及封存仍须各自实现和运行验收，未执行 PostgreSQL、浏览器或发布验收。
