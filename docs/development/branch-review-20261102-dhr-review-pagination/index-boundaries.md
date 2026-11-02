# 索引与规模边界

本轮在原生 PostgreSQL16.15、ICU root版本153.136、默认en_US.utf8环境观察实际执行计划。受控数据包含5万条DHR审批版本/任务历史和10万条不关联DHR的其他业务待办，保留canonical读表DDL、PK/唯一约束及既有索引；这是查询切片，不是全业务数据模型/全历史迁移或生产容量认证。索引试验前后不改变个人结果。原始11组SQL、参数、EXPLAIN ANALYZE/BUFFERS及源探针见evidence/index。

| 场景 | 观察与索引使用 | 本轮处置 |
| --- | --- | --- |
| 历史5万、DHR待审稀疏 | review待审部分索引直接定位约170个在审workflow；一组buffer hits从1955降至1225 | 新增 `idx_dhr_review_pending_workflow(workflow_instance_id) WHERE status='PENDING_REVIEW'` |
| 个人已审82条 | 新索引存在时仍选择原assignee索引，buffer hits均1481 | 保留原索引，不强迫planner或删除既有索引 |
| 个人已审49,900条 | 新部分索引用于按处理人/ID倒序取页，buffer hits从4433降至2459；准确总数仍有成本 | 新增 `idx_workflow_task_done_assignee_id(assignee_id,id DESC) INCLUDE(instance_id,node_id) WHERE status IN ('COMPLETED','REJECTED')` |
| 5万DHR任务几乎全待审 | 小索引选择性下降，JSON候选判断仍是成本，单次约1.4秒 | 不宣称全规模已解决；记录后续候选查询/读模型讨论边界 |

毫秒数是单次受控观测，受缓存、统计信息及并行工具影响，不用作生产SLA或回归阈值。两试验索引的受控体积分别16KiB与约2.39MiB；不是每个生产库的固定大小。正式迁移使用同样的列/谓词，名称与trial前缀不同。

两个部分索引分别只承担当前在审review和已完成/退回task的索引项。workflow_task为全平台共享表，已办索引也包含其他业务符合状态的任务；任务写入/状态切换时增加维护与存储成本。个人数据少时原索引已足够，新增索引针对累积历史和排序边界，不声称每次都被采用。existing candidate_snapshot GIN、assignee/status/instance及唯一活动任务索引均保留。

现查询按旧资格包含unrestricted、集合非空优先、空/缺失回退及已有兼容类型，不能许诺一个现有JSON GIN便自动解决全部组合。本批主要消除把全体任务逐批搬到Java、应用内计数/取页，以及读取未使用大字段；数据库仍须评估符合范围的任务。若大量同时活跃待审成为实际负载，应对候选过滤另做可索引谓词/规范投影评估。人员关系读模型增加写入、回填及一致性成本，本轮不新增。

关键词是五列跨关联表的字面子串匹配，普通B-tree不能直接解决任意包含搜索。当前strpos无LIKE通配符含义，百分号、下划线、反斜线和SQL片段均按字面。未为它新增五套索引或pg_trgm扩展；若实际出现大个人历史并频繁搜索，需单独量化宽/短/无命中关键词、跨表OR、表达式/trigram的计划及写入成本，不能把本次小个人关键词计划当全量搜索认证。

准确COUNT至少要判断符合条件的记录；深OFFSET仍需跳过匹配结果，索引不使这两项变成常量工作。本轮保留准确总数和页码交互。SQL采用一个MVCC语句同时计算COUNT和页数据；空页用一条total行返回准确总数，应用只保留当前页，避免两条语句之间的可见数据漂移。不使用缓存或新增业务关系表。

## Unicode运行前置

默认PG lower('İ ΟΣ')与Java Locale.ROOT不一致。查询明确使用ICU `und-x-icu`，原生矩阵检查i+组合点、词尾sigma、大小写和Unicode空白。迁移检查pg_catalog中该ICU collation存在，缺失即HALT，不改用默认lower。没有安装新扩展，也没有把collation解释为业务政策；实际目标生产库未连接，部署前须满足该前置。ICU/JDK版本升级需要重做等价性验证，当前有限Unicode矩阵不等于全Unicode认证。将来若建依赖collation的表达式索引，还需评估版本变化后的REINDEX；本次两个数字/状态/处理人索引不依赖关键词lower表达式。

## 迁移与恢复

0091的两个CREATE INDEX CONCURRENTLY各为独立runInTransaction=false changeset，避免普通建索引长期阻塞共享表写入；完整应用升级及原生Liquibase独立schema的升级→回滚两条→重新应用均验证。并发建索引仍会扫描表、消耗IO并等待相关事务，不承诺零部署影响。部署未执行。

中断可能留下invalid同名索引，不能用IF NOT EXISTS把它当成功。应由部署操作核对pg_index.indisvalid、实际定义和Liquibase记录后处理具体失败索引并重试；本批不自动删除已有索引、不清理历史记录。正式回滚也是CONCURRENTLY；不在业务事务中运行这两条迁移。证据只证明本轮实际PG版本与路径，不等于所有历史迁移已认证。
