# 有限审查结论与性能讨论

## PERF-DHR-EVIDENCE-RETAINED-001（medium，runtime-observed，pending-discussion）

这是PR27已明确披露的currentById内存权衡的补测，不把已修N+1重新打开或重复计为新功能缺陷。生产代码未改。

固定512MiB最大堆、SerialGC，真实DhrEvidenceImpactService/JDBC/PG，对旧a192逐条实现与当前实现各运行100/1000条×1/32KiB载荷，独立JVM重复两轮（16次）。1000×32KiB时，当前记录查询后强制GC驻留增量两轮均约32.77MiB；旧实现首条当前记录检查点约0.10MiB，SQL分别5和1004。冻结证据本身已是全量驻留，当前batch另保留F份当前JSON。小样本差分可能受类初始化/GC影响为负，不作对象精确计费。

不是请求全过程峰值、吞吐、OOM、并发容量或SLA测量；旧实现只取第一条当前记录检查点，不能称旧请求峰值仅0.10MiB。无附件，ASCII载荷，不代表真实客户内容压缩率/字符宽度或业务规模。

建议讨论有界分块：例如先验证128条内部工程批量，查询约ceil(F/128)+4，额外当前JSON最多一块而非F。不是用户业务上限。须保留缺失和跨tenant判定、原升序锁定、同事务持锁、锁后新值；非锁读取由单语句变多语句的观察时点要明确，不新增跨请求一致承诺。用户未确认前不实施。

## PERF-ROUTE-GRAPH-EXISTENCE-001（medium，runtime-observed，pending-discussion）

saveRouteGraph先分配节点/关系ID，再调用JpaRepository.saveAll；两个实体没有Version或Persistable新对象标志。实际Spring Data+Hibernate+PG模拟该保存段：10节点9边产生19次存在性SELECT，100/99为199，1000/999为1999；配置batch_size=20仍然存在。statementInspectorCalls并非网络往返计数，不据插入SQL模板次数推断插入次数。

正常路线预计小于历史记录类数据，但未获得客户上限；多工序、重复工序与分支增长会放大此保存段成本。测量使用真实实体和仓储实现、隔离Hibernate建表，未通过完整HTTP/删除/审计链，也没有实际保存延迟或客户SLA失败结论。既有写事务/审计/删除顺序仍保留。

候选方案：仅在明确全新的图实体写入段使用EntityManager.persist并保持JDBC批量；不要全局更改实体isNew语义或把图保存拆成多事务。实施前补完整PG图替换、重复键回滚和审计失败零写验证。当前先记录待讨论，不自动修改。

## 反证与通过范围

- RouteGraphValidator对当前规范化输入以Kahn拓扑排序和迭代可达集合实现，时间/空间O(V+E)，无递归深栈；允许并行及不同nodeKey同operationId，REWORK关系类型不能绕过普通骨架无环规则。
- toRouteNode/toRouteRelation在校验前拒绝null/空键或端点，类型归一化后再查白名单；内部null候选不是已证HTTP缺陷。结构拒绝在任何图删除、写入及审计前发生。
- 70项原测试在clean后通过，包含9项原生PG签名迁移/当前fresh master；未宣称完整HTTP事务路线图保存已验收。
- 额外当前master探针：2变更集、95有效FK/0未验证FK、9预置查找项、列明9业务表零行；再次update无新增变更集；非空哨兵库被阻断且哨兵保留。只证明隔离fresh和误用阻断，不是已有开发库升级方案。
- 首轮迁移8错误来自target/classes遗留历史SQL与test-classes重复；clean消除，未放宽Liquibase。独立baseline探针首轮用了错误表名form_trace_item，修正为实际form_lookup_item并重建自有fresh库；原失败摘要保留。

本批没有新增已确认业务代码bug或产品修复。前端视觉、完整路线并发写、真实宽记录并发、其余W0–W7范围继续pending；TaskDetail和记录变更作废相关用户暂缓保持。
