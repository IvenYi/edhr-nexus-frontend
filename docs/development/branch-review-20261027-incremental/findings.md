# 当前批次结论与风险

源码基线：3aebfd49faa21a27fb3db7075e1ac2d9c8b2f176。下列主侧运行结果不代替本批独立验收。

## 业务链有限复核

实际运行原生 PostgreSQL：BatchProcessIntegrationTest 12/12 通过；ProductionExecutionIntegrationTest 原有 91 项中 89 通过、2 项 opt-in 开发服务入口跳过。两套测试分别使用干净完整 Liquibase 基线和受限执行测试 schema；后者部分外围服务被 mock，不能称完整生产栈。

- 编辑与 START 均按工单→对象加锁；首次START采用REPEATABLE_READ，检查已选引用适用性、有效期和形态，然后生成配置与DHR。已有并发测试覆盖同批次编辑/START、重复START、分配量竞争、等锁期间终止，以及配置查询间更新。未发现这些测试覆盖范围中的新业务缺陷；不泛化为所有HTTP管理入口并发已覆盖。
- 创建时的制程配置、DHR上下文和目录由同一首次START事务读取；后续工序START刷新作业，不重建制程/DHR初始目录。DhrInstanceService.detailRow读取已存context_snapshot/directory_snapshot，只做响应ID格式投影。
- 作业实例按工序START创建，预览无持久化；已有实例的流程、表单和进度保留，尚未开工工序按当前产品簇/规则/已发布版本重查，已过站不补做。原有测试实际覆盖失配后的已有实例继续、预览后换版、审计失败回滚及旧计划刷新。
- 原 AUD-H006 旧政策不再作为整改依据；相关新实现仅按本批实际范围获得证据，不自动关闭全域或所有相邻问题。

## DOC-PROCESS-OWNERSHIP-COMMENT-001：旧注释（已修正，待独立核验）

ProductProcessResolutionService.findVersionForProduct 的注释仍称工单冻结版本后可越过有效期使用。当前工单已无制程引用，实际调用方在首次START会严格核验有效期。仅将注释改为“本方法解析归属，调用方在选择/开工时另验有效期”。无运行逻辑或业务规则变动。

## PERF-WORK-MATCH-REPEATED-CONTEXT-001：预览重复查询（待讨论）

入口：GET `/api/v1/production/execution/{id}` → view逐工序 → refreshWorks。

原生PG观测通过真实MockMvc/JWT/服务/JDBC链，数据来自测试专用schema。40条规则均不适用于当前产品，避免将命中作业图/表单成本混入此基础观察。

| 待开工工序 | 活动规则 | 规则查询次数 | 规则结果行处理次数 | 产品簇查询次数 |
| --- | --- | --- | --- | --- |
| 2 | 40 | 2 | 80 | 3 |
| 10 | 40 | 10 | 400 | 11 |
| 50 | 40 | 50 | 2000 | 51 |

产品簇次数包含build的一次和每个PENDING工序的一次。这里仅计snapshotBuilder实际JDBC查询及返回行回调，不是整个请求总SQL数，也不是数据库物理扫描行数。没有记录生产p95、堆峰值或客户实际规模。若有命中作业和宽表单还会增加读取/解析成本，本轮未量化。

新增测试只固定“所有工序可预览且GET不创建执行/DHR/审计”行为；查询次数仅观察输出，后续优化不会因降低次数被测试拒绝。三组检查均实际通过。

建议先讨论：请求内加载一份当前产品簇和活动规则上下文，按工序筛选；START仍在原事务里重新读取，已有实例保持原配置。禁止跨请求陈旧缓存、取消START校验或改变匹配政策。当前未实施。

## 其他风险沿用，不重复计数

- 工单列表全量加载/逐单产出汇总/内存分页仍是源码确认风险；新toResponse的objects和allocatedQuantity又重复读子对象。待下一批实际测SQL、加载量及宽JSON。建议数据库先筛选分页，再以本页ID批量聚合；结果过滤、排序、数量及权限语义须保持。
- `PERF-PRODUCTION-SPLIT-REPEATED-SCAN-001` 保持旧ID：splitBatch逐条split，重复扫描分配上下文。建议同事务持工单锁复用上下文，保留编号唯一、形态、额度、逐对象审计和整批回滚；未实施。
- H008 SN模板按新页面仍需单独复核；不移植已归档候选，也不因H006替代而关闭。

## 具体结构候选

1. ExecutionSnapshotBuilder：可分出WorkCandidateContext（请求内当前归属/规则）与work实例配置构建，原snapshotBuilder保留制程冻结编排；参数显式传入，不使用全局缓存。先用上述观察及既有转簇/换版/回滚测试保护。
2. WorkOrderController：列表查询与分页批量响应组装可移至独立查询服务，写命令继续原事务和审计边界；先保持字段、搜索、排序和总数契约。性能方案确认前不提取。
3. ProductionService.splitBatch：批内分配上下文可抽为内部对象，保存已分配量、形态和待写编号；一批一事务，不能为减SQL拆成逐条独立提交。先验证失败整批回滚及并发额度。

这些是基于职责和调用链的方案，不以文件行数作为实施理由；本批未进行大模块重构。
