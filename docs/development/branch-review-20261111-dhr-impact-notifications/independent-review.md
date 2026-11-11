# 独立质量复验

本实例未参与任何修复，仅在自有 detached 工作树 `/tmp/edhr-notification-qa-20261111` 复验候选 `7b63b4c545490489e3e7df1d2009957e7e34cf63`，base／实际 fetch 目标为 `ea46c826f821ab2496a56df13fbcb0bd47e25eff`。质量等级 L2。结论为本切片 **passed**；没有影响当前测试及知识证据交付的发现。它不是整体代码审计、完整通知 UI、生产容量或知识运行发布结论。

读取 `AGENTS.md`、统一交接及质量角色契约、编码准则，并核对知识模型架构、README 当前定义、开放问题、DEC-0068／0087／0093、原通知用户确认以及本批 DP。本人 contractReadCommit 使用实际读取的 `7b63b4c5`；契约本身与 base 无差异。知识 `0.3.25 / schema 1.2.0 / P0 in-progress` 保持。

## 实际范围及原件

base 到 candidate 共 8 文件：一个维护原生测试、DP、六份知识；所有生产 Java、前端、API、迁移、索引、POM 和协作契约均无差异。没有新业务政策或代码修复。实际日志、fresh XML、SQL、HTTP、真实通知／影响行、命令及输入 SHA 见 `final_ready/`、`knowledge/`、`independent-recheck.json`、`source-plans.json`、`role-inputs.json`。后者 52 个回归输入和 359 个知识输入与候选／原件一致。

首次 `final/` 在前置 `dhr-print-renderer` 因独立工作树缺少 Vite 依赖而以 127 结束，实际 **0 个业务测试**，没有 fresh XML；这不是产品或测试逻辑失败，原件未覆盖。随后只给自有工作树创建现成 `node_modules` 软链，未跳过 Maven renderer 或任何断言；在全新自有 canonical PG 运行 `final_ready/`。Git 对目录的 ignore 不忽略该软链，故两轮正式 run.json 的工作树真实记录为 dirty，仅 `?? gmp-platform/frontend/node_modules`；此依赖路径排除在受测源码外，tracked 源码与候选完全相同。结束已删除自己的软链，最终工作树 clean；两次自有 PG 容器均已清理，见 cleanup 原件。没有把执行期间的 dirty 状态改称 clean。

## 实际验证

- 原生 canonical PostgreSQL 118 项及其余 59 项（其中包含 15 项 H2）共 **177/177**，10 类 fresh XML，0 failure／error／skipped；另外独立正式知识 **89/89**，0 failure／error／skipped。主侧结果只用来核对范围，未代替本人执行。
- 新增 20 份 observation：当前责任 8、旧身份 8、真实冻结版本规模 3、分页／已读 1。读取实际通知和影响行，核对账号、类型、版本／影响关联、缺失不猜、冻结及重投摘要对，并回到测试源码确认 4 表冻结及 14 表重投为全内容精确比较。没有另存完整前后表 JSON，故这里只称摘要对和精确断言已核，**不声称从归档行外部重算了这些表摘要**。
- 共 **110** 条真实 Spring MVC／JWT／方法安全原响应，新增通知相关 **28** 条：200×19、403×8、401×1。每条实际状态均与预期一致。它们是真实后端 API 验证，不冒充浏览器。
- 100 条个人通知在 5 页中每页 20 条、末页为空，顺序按实际 BIGINT 倒序，100 个 ID 全部唯一可达；其他账号目录为空，匿名 401，他人 mark-read 虽返回通用成功但全内容无写，本人重复已读及事件重投保留同一 `read_at`，未读变 99。20 只是页大小；100 是冻结版本／通知样本，不是人员数上限。
- CHANGE／OBSOLETE 各自覆盖 MULTIPLE、UNRESTRICTED、真实管理员签名 REASSIGNED、DISABLED_CANDIDATE；实际新处理人 43 和提交人 41 收件，旧候选 42 不再收件；多／无限制样例是当前审批人 42／43 与提交人 41 合并，历史已办 44／异租户 45 不混入。冻结候选停用仍收件不等于能登录或处理。无 DHR 菜单权的提交人能读本人通知、审批详情仍 403。
- 旧提交 ID 置空后，原 review 身份和唯一原 SUBMIT 审计分别可靠恢复；审计歧义或缺失仅保留影响行，不按同名猜账号。缺失／歧义用例没有当前任务，不能据此取消其他任务的接收人。
- 两向在审门禁、真实批准消费、失败回滚、并发唯一获胜和原审批资格测试保留并实际运行。当前责任组合用例显式构造旧存量双在审，不把 fixture 当成当前入口可创建的新业务路径。

## 原规则及有限知识结论

回到 `docs/reference-assets/research/crown-dhr-change-downstream-20261029/handoff.yaml#confirmedNotificationReply` 原确认证据：“站内提醒当前审批人和该版本汇总提交人”。DEC-0068-12 的站内渠道、真实账号、当前责任、无任务不虚构接收人、不提醒历史批准人／邮件、不改旧冻结／批准／生产放行均保持。`RecordControlService.applyResult` 在原事务、对象及来源锁内批准落地后调用 `sourceEffective`，重投在上游事件收据处即返回；DHR 原件不变，个人接口按认证人隔离。

六份知识仅把 `discrepancy.dhr-review-effective-source-integration` 的既有三个剩余组合证据缺口收敛为 resolved，接续当前跨域摘要与一个新证据 ID，没有把缺陷改成政策或重写旧失败。早期聚焦 16 项使用的 dirty 测试 SHA、旧 32 项／12 步及 failed 证据保留时点，后来的正式候选 177／89 及本独立结果另记。主侧聚焦完整运行中曾有对照 SQL 文本别名排序失败；当前 `ORDER BY n.impact_id DESC` 保持严格数值顺序和全部 100 唯一断言，是取证 SQL 修正，不是产品排序修复或降低标准。

独立按 schema 的 collectionTypes／nestedCollectionTypes 盘点 353 文件、2849 个 ID（schema 的示例 id 占位符不算业务记录）。盘点不等于语义通过；本体有限台账 25 条的 19 consistent／4 evidence-gap／2 needs-decision 与实际适用含义相符。另一质量／异常处置／源签署有效性变化自动判读 high、完整 A12 历史、全浏览器／账号切换／错误／权限矩阵、非 MVP 多租户及其他 W2—W7／全量 A23 继续。

## 性能、A23 及后续提取边界

独立按 PG 服务器成功 `execute` 重算，没有把 parse／bind／auto_explain 重复算查询。真实 frozen 版本 1／10／100（无当前 DHR 任务）对应 SELECT **2／11／101**，影响 UPSERT RETURNING **1／10／100**，通知 INSERT **1／10／100**；合计 **4／31／301** 条，计划数亦 4／31／301。实际原生产者通过 Spy 的 `callRealMethod` 执行一次，未 mock 业务结果。

本次原 `sourceEffective` 阶段耗时约 **3.78／17.50／136.34 ms**，调用线程累计分配 **11040／66824／617864 B**。不是整批准耗时、事务／锁时、峰值、RSS 或生产 SLA；SQL 日志／计划也增加观察开销。100 个冻结版本不是一份 DHR 的表单数量。当前 query 存在每受影响版本一次当前任务读取的 N+1；逐版本影响／通知写入属于现有语义存储，不一起称作冗余查询。可讨论批读当前任务、请求内按版本归组后保留原独立写入和原锁／幂等，不在未确认时实施优化。

本人核对个人通知已有 `(recipient_id,impact_id DESC)` 索引，影响／通知唯一约束亦保留。来源 evidence 现有 `(tenant,version,source)` 不是 `(tenant,source)` 查询前缀；本次小表／全匹配计划实际使用现有 version 索引，不能从它证明生产一定缺索引或立即加索引。未来应加入大量无关来源背景、ANALYZE 后量化选择率／计划／写成本，再决定是否加 `(tenant_id,source_record_id,summary_version_id)` 一类索引。

A23 有限核对：上游事件收据与下游唯一约束分别保护业务消费及数据去重；账号 ID 的 review／唯一原审计回退处理明确旧边界；个人已读未知／他人统一 no-op 防泄露且不跨权写；重复已读 `COALESCE` 保留时间。这些有独立目的，未确认可安全删除的过度防御。未将本轮结论延伸到已审全部模块。

可维护性后续方案是从 `DhrEvidenceImpactService.sourceEffective` 提取只返回当前责任账号集合的领域解析方法，保持 sourceEffective 的调用事务、影响／通知写入和去重所有权；如批准批读，再为版本→任务元数据引入一次只读查询，避免先抽通用通知框架。57 行个人通知服务无需为拆分而拆。约 1600 行维护测试可按共享 fixture 基类／支持对象，拆成记录控制修订、责任转移、DHR影响通知三个套件，原 @SpringBootTest、真实 PG、签署、容量 opt-in 及失败／并发断言应原样回归；本批不改这一结构。

没有推送、合并、部署、恢复数据、访问共享业务数据库或查询／触发 CI。实际目标末次 fetch 仍 ea46c826；主智能体仍须在全部角色 FINAL 后完成真实 PR 前漂移检查及交付登记。
