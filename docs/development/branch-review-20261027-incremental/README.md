# 2026-10-27 整体审计续接检查点

## 正式验收与交付

已创建 [PR30](https://github.com/IvenYi/edhr-nexus-frontend/pull/30)，来源 `audit/edhr-dev-incremental-20261027`，目标 `edhr-dev`，等待用户人工合并。PR创建不代表已合并；下轮先fetch再按scope-review续接。

全新独立质量对干净候选 `66d00d15ba3613201e0face1cf811013ae081d64` 正式 **passed/FINAL，8/8**。两个全新隔离PG库实际运行104项：102通过、2原有opt-in开发服务测试跳过、零失败/错误；知识89项通过。独立重现三组查询观察，128路径状态/blob重建一致，16条有限语义复核无阻断。原件见[evidence/quality-result.yaml](evidence/quality-result.yaml)、[独立说明](evidence/quality-review.md)和[安全运行证据](evidence/independent-evidence.json)。原件内/tmp路径对应本目录同名归档映射，原始文件保持字节不变。

本体与质量实例均已FINAL。受测后仅追加L0归档/范围复核/交付登记，产品、测试、知识和冻结清单不改。自建PG容器已按确切ID停止且自动移除，未连接或修改用户业务库。PR前已实际向用户报告无任务漂移、当前整体进度和下一步，见[scope-review](scope-review.md)。

## 当前进展：本批运行与语义复核

本批现已推进为有限L2审计交付：产品仅纠正一行过时注释，没有业务逻辑改动；新增1项增长场景只读回归与查询观察。主侧原生PG基线103项中101通过、2原opt-in入口跳过；新测试另跑1项通过，不能合称同次104项运行。实际2/10/50工序对应规则查询2/10/50次，结论及结构方案见[findings](findings.md)，安全原件摘要见[evidence/primary-postgres.json](evidence/primary-postgres.json)。

本体角色对16条有限语义核对已正式not-applicable/FINAL：无当前知识改写需要，旧注释已核对纠正；原件见[evidence/ontology-result.yaml](evidence/ontology-result.yaml)。知识成熟度不提升，完整W4与W1–W7未完成。当前等待独立质量核验；以下“本轮已做与边界”为前一轮续接时点，不覆盖此处后续事实。

## 基线与规则切换

- 当前审计分支：`audit/edhr-dev-incremental-20261027`。
- 目标与工作树基线：`3aebfd49faa21a27fb3db7075e1ac2d9c8b2f176`；此前基线为 `d5adf22066ea4d6bb1c7e7ede09961fc97bea675`。
- 新提交：0756df80 填报交互；b05305ee 批次独立制程与作业实时匹配；3aebfd49 只读画布工具。项目及角色契约无增量。
- 用户本轮明确要求抛弃本地旧规则，以远端新规则为准。旧工单锁版候选及对应知识修改已退出工作树，不 cherry-pick、不作为当前验收依据。8 个旧已跟踪修改及 33 个未跟踪文件原样归档于仓库外 `/workspace/audit-archives/edhr-pre-3aebfd49-20261027`，仅用于保留历史来源。
- 旧 SN 模板候选也未移植；H008 是独立历史问题，需对新拆分页面重新核对，不能以规则替代自动关闭。
- 当前有效依据：`docs/knowledge/evidence/batch-process-2026-10-27.md`、`work-live-matching-2026-10-26.md` 及其关联当前规则。旧 H006 所依赖的创建时归属/工单锁版政策已被替代；新政策的实现正确性仍须验证。

## 初始续接时点已做与边界（历史）

这是整体 L2 审计的续接记录，本次仅同步基线、进行有限源码检查和运行已有聚焦测试；未修改产品、业务知识、接口或数据库。该记录属于 L0 进度文档，不是正式独立验收结果。本体门禁本次不适用：没有改写业务定义；未派发正式质量实例，不声明整个新切片通过。

实际亲读的有限方法包括：ProductionService 的 split/splitBatch/updateObject/requireProcessVersion/processOptions/requireApplicableProcess/allocatedQuantity/updateOrderWhenObjectsTerminal；WorkOrderController 的 list/update/toResponse/end；ExecutionSnapshotBuilder 的 build/refreshWorks；ProductionExecutionService 的首次 START 校验、刷新及 view 循环；ProductionOutputService 的 order/read。

确认源码中已具有独立选版、未开工编辑资格、剩余量约束、首次 START 重核及制程冻结、待开工工序刷新作业和已建实例保留的路径。这是路径核对，不代表并发、完整业务链或全量本体语义验收完成。提交自带的 passed 报告保持为他方历史证据，不冒称本轮独立重跑。

## 首轮性能候选（未实施优化）

1. 工单列表：list 先加载全部工单，逐项 toResponse，再过滤和内存分页。toResponse 调用 outputs.order，又分别通过 objects 和 allocatedQuantity 读取子对象；outputs.order 使用 JDBC 读取执行快照及投影 JSON。增长变量为总工单数、每单对象数和快照/投影宽度。旧全量列表风险继续存在，新响应字段增加重复读取；尚未量化 SQL 次数、耗时或内存，不能称生产容量已超限。
2. 作业实时匹配：view 遍历工序，对每个 PENDING 工序调用 refreshWorks；每次重新读取当前产品簇与全部活动 WORK 规则，再按命中定义读取已发布图及关联表单。增长变量为待开工工序数、规则数、命中作业数和表单宽度。IN_PROGRESS/COMPLETED 会提前退出是反证。建议先测单请求查询/加载规模，再讨论请求内共享匹配上下文；不能用缓存改变 START 时重新校验或已有实例保留的业务要求。
3. 批量拆分：沿用 `PERF-PRODUCTION-SPLIT-REPEATED-SCAN-001`，splitBatch 逐条 split；split 与 processOptions(order) 重读已有对象。SN 导入量增长时可能重复扫描。保留原 ID，不重复计为新缺陷；事务原子性、锁顺序、逐对象审计必须保留。

具体提取候选：将工单列表查询/汇总与写命令分开，列表先数据库筛选分页再按页批量组装；将作业候选匹配的请求内读取上下文与实例保留/创建分开；批量拆分在原事务中复用已加载分配上下文。以上只作方案候选，性能实现须先讨论，不直接开展大模块重构。

## 下一步与不漂移边界

1. W0：保存本次完整增量路径清单，旧覆盖记录按变更及依赖标记需重核，不以新报告覆盖旧冻结原件。
2. W4/W1：实际复验批次编辑—首次开工竞争、配置变更时一致视图、后续作业匹配—已有实例保留—DHR 历史读取；核对取消/提前结束/分配量及工单自动完成边界。
3. W5：对上述三条增长路径做隔离数据库查询数、加载量、宽 JSON 及规模对照，性能方案先讨论。
4. W2/W3 与 W6/W7：继续原审计契约 A01–A22、遗漏清单及具体结构方案；新功能加入增量，不把本轮生产变更当作全仓完成。
5. TaskDetail 签名问题仍待协作者修复后拉取验证；记录控制变更/作废相关暂缓、DHR 分块未授权及旧知识证据缺口继续保留。
6. 每个主要链检查点及生成 PR 前重新 fetch；生成 PR 前汇报范围漂移检查与实际整体进度。没有可信全量分母，不给虚假完成百分比。

运行测试结果单独保存 `verification.json`。未执行真实数据库/浏览器/并发复验的范围保持 pending。没有自动合并、部署、恢复数据或重新收尾 PR5/PR6。
