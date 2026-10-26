# 方法与模块结构结论

长度是线索：当前ProductionExecutionService 427行、ProductionService 307行、AuditController 314行。这里没有按行数搬迁大模块。本轮只抽取私有auditObjectStatusChange(object, previousStatus, reason)；它由act调用，消费已持锁上下文，同事务写事件，输入/副作用集中，不再查对象或组装昂贵全视图。没有第二个实际调用方，不新建通用审计框架。

后续具体候选：

1. `ProductionService.splitBatch`：保留公开split和splitBatch及原事务；提取私有`allocate(order, version, allocationContext, request)`。上下文由单入口锁工单后生成，包含已有生产形态、有效累计数量、批内编号。对象/工单权威写归服务，controller只组响应和逐对象审计；不要把整个service搬到helper。收益是消除同批重复加载并集中单条/批量验证；代价是增量状态与flush失败的正确性风险。先测PG查询次数；再做总量、SN=1、取消占用、重复编号、并发拆分及审计失败整批回滚。性能授权前仅方案，不执行。回退为代码回退，无数据迁移。
2. `AuditController.list`：候选`AuditLogQueryService.search(criteria, pageable)`负责保持展示语义的查询/计数，独立纯`AuditLogPresenter`只消费event与当前请求账号映射。HTTP参数与身份留controller，数据库查询和批量账号解析归query service；不做跨请求缓存。必须先列出现有派生模块/菜单/摘要及旧事件回退表，再验证组合过滤、总数、缺失用户和稳定分页，避免分页提前导致漏查。不能把原内存分页原样搬家当优化；未讨论前不实施。

H006需要的是明确的对象成员上下文所有权，而非一次拆解snapshot builder；应先跨时点红绿证明再选最小字段/初始化/读取方案。旧无证据对象不能靠重构推测历史。原七项结构计划继续保留，以上两项不表示W6或全仓结构审查完成。
