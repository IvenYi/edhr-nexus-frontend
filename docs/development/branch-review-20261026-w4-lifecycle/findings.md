# 本批发现、去重与未决

## AUD-H007：执行导致的生产对象状态审计缺口

沿原唯一ID与 discrepancy.production-object-execution-lifecycle-audit-projection，medium / functional-defect。不是新增第一个“完全无审计”问题：原执行日志已经有状态信息，缺的是DEC-0019对象审计投影。

合法START及最终完成经 ProductionExecutionService.act 调 ProductionService.startObject/completeObject，原代码只写PRODUCTION_EXECUTION；批次详情既有查询指定PRODUCTION_OBJECT。主侧6例原生PG红绿证明缺失与真实回滚路径。核心3281863b复用previousObjectStatus与持锁对象，在既有事务中补status差异；只在状态改变时写，保留执行事件。故普通SAVE、中间工序完成/开工、旧revision拒绝不额外产生对象状态审计。既有批次自定义表单测试证明SUBMIT自动完工也写事件。

失败测试分别注入对象审计及执行审计save失败：START回滚对象、工单、DHR、执行及审计；最终完成回滚状态、执行revision/state及新增审计，随后重试成功。测试的审计查询是真实AuditController+JPA+PG，但未验证全局权限政策或实际页面渲染。既有旧审计hash往返问题未处理，不能把本批称审计完整性全验收。当前修复的最终独立状态在acceptance记录。

## AUD-H006：成员转移与已创建对象、已锁定工单

source-confirmed / medium / open，承接原差异而非计新bug。DEC-0002-10保护已存在对象；DEC-0012工单锁定制程与首次START冻结详细配置是不同职责。ExecutionSnapshotBuilder.build仍从当前product_family_member取family匹配作业，ProductionService.requireProcessVersion/processOptions仍调用findVersionForProduct重验当前成员。创建后转移可能改变未开工对象的作业，且旧簇制程工单后续拆分可能被拒绝；已开工对象读取原执行快照是反证，不能称所有历史对象都会变。

下一批需真实跨时点复现、确定独立成员上下文的最小持久化/新对象初始化方案。不能把旧制程owner当作已有对象创建时成员身份的可靠证据，不能回填没有证据的历史。转移后旧工单新建对象可同时保留锁定制程及新的成员身份，是待方案验证的工程解释，不据此发明新政策。本批未改此链，也未做运行复现；H008仅承接原待审，未宣称最新源码已经通过。

## PERF-AUDIT-LIST-MATERIALIZATION-001

medium / performance-risk / source-confirmed / pending-discussion。入口GET /api/v1/audit/logs及/me。AuditController.list用PageRequest(0,Integer.MAX_VALUE)取得基础条件命中的所有AuditEvent，逐条映射后再按展示模块/菜单/摘要过滤并subList；toAuditLogItem→resolveOperatorDisplayName对有账号的行调用findByUsername。这里返回20条不意味着只读20条；请求局部没有账号去重缓存。真正SQL次数尚未测，不能忽略ORM/数据库缓存而声称已测得N+1。

增长量M为基础筛选命中的历史事件数，宽度包括前后JSON；列表映射及内存至少O(M)。指定单对象会缩小M，但没有已证硬上限；全局入口随日常操作累积。没有生产M、p95、堆峰值或并发压测，不声称已OOM。现有PageRequest上限并非分页保护，过滤前简单加LIMIT会导致漏结果和错误总数。

建议优先于<=300张DHR分块做多规模PG观察；随后讨论将兼容展示语义的过滤/排序/计数放到数据库、按本页唯一账号批量查名。必须保持旧事件的模块/菜单/摘要派生含义、对象范围和缺失用户回退；不能直接把当前SQL列等同展示文本。另int页偏移可能溢出为独立功能候选，后续需按真实参数复现并单独最小修复，不以性能讨论为由长期遗漏。去重依据：旧W5-AUDIT-HASH-001仅hash原文，旧AuditController范围只toAuditLogItem/getById；本风险不关闭或重计它。

## PERF-PRODUCTION-SPLIT-REPEATED-SCAN-001

medium / performance-risk / source-confirmed / pending-discussion。POST工单objects/batch→ProductionService.splitBatch逐请求调用split；每次重新锁工单、读取该单全部对象、遍历类型/数量、校验已锁制程、查编号再保存。若初始M个对象、再增N个，在保存对象对后续查询可见的通常flush路径下，累计返回/扫描规模约NM+N(N-1)/2；这是源码模型，不是实测SQL/耗时。JPA身份复用不等于省掉派生查询及结果遍历；仍须PG计数反证。

增长假设主要来自SN每件一对象或大批导入，而不是单个DHR表单数；客户真实每单对象数/导入规模未确认。单对象工单影响很小。Controller.splitBatch响应还逐对象调用toResponse，重复产品/版本读取及产出查询是相邻候选，不据源码直接宣称准确往返次数。候选优化为同一事务、持原工单锁、一次建立已分配上下文后增量校验；唯一约束、逐对象审计、重复编号、取消对象扣除、失败整批回滚都必须保留。未经讨论不实施。
