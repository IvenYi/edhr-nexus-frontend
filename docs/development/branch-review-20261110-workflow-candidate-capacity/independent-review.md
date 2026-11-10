独立最终质量结论：**passed**。本实例未参与产品、测试、夹具、配置或断言的修复，未修改仓库任何受保护内容。结论只覆盖本批“记录控制审批流程候选目录容量取证”，没有把已确认性能风险称为已经修复。

固定范围为 `68861c2ab0291fc8f20271c2d2cae37d1eca66fd..e173d4022079cb77b3eb53cd44d26c09935bbd27`，独立 detached worktree 为 `/tmp/edhr-workflow-candidate-qa-worktree-20261110`。启动及最终实际 fetch 的 `origin/edhr-dev` 均为前者。契约实际读取于后者，知识基线0.3.25/schema1.2.0。候选只新增决策包45行和现有PG集成测试91行；产品源码、SQL、schema、索引、UI、知识与业务政策均未改。

本实例独立执行的结果：

| 验证 | 实际结果与证据 |
|---|---|
| 后端六类回归 | 94通过、0失败/错误/跳过；`final_verified/test-summary.json`及六份新XML |
| 回归性质 | 75为原生PG测试，另19为mock、方法安全或资源检查；不是94项都经过真实PG |
| 正式知识校验 | 自己运行89通过、0失败/错误/跳过；`knowledge/run.json`及原XML |
| 五档目录 | 每类0/1/10/100/1000；两类型、各两次原服务只读事务，共20观察 |
| 原生SQL与计划 | 实际4504个SELECT=4504个auto_explain原计划；保留60代表计划，所有原件在PG日志 |
| 完整结果 | 每一行七个DTO字段、明确版本、顺序及1000末项验证；100是样本，既非上限也非员工数 |
| 读取资格 | 普通无create权限的真实JWT+MockMvc GET200十次，匿名401十次，完整响应JSON核对 |
| 业务/审计无写 | 五档10表完整行摘要before/after相等，标签SQL无DML；元数据夹具写入在测量前 |
| 原有错误边界 | 两PUBLISHED current触发现有IncorrectResultSizeDataAccessException；前后摘要保持 |

第一次 `final` 执行在Maven构建渲染器时因独立worktree缺少node_modules出现 `vite: not found`，当时**0测试**，完整失败日志、0摘要和自有PG清理记录均保留。随后仅创建本实例自有依赖软链，原候选和原命令在 `final_verified` 实际重跑成功。运行时Git真实状态为 `?? gmp-platform/frontend/node_modules`，没有把这一阶段虚称clean；软链现已移除，最终worktree clean。两个自有PG容器均删除并再次inspect核对，未触碰其他实例数据库或进程。见 `final-cleanup.json`。

夹具真实性已从原SQL、迁移和实际断言核对：每种业务有M个正常目录，额外有“缺current”“current DRAFT且历史PUBLISHED”“DRAFT定义”“WORK类型”四种对照，原两定义改DRAFT。因此数据库定义数/版本数各 `2M+10`，对应匹配定义 `M+2`，实际候选M。不是靠不识别的JSON键构造空数据；目录及版本列为真实schema字段。但这些是合成目录元数据，版本JSON为小型 `[]`，没有宣称它们通过真实发布、签署或端到端业务创建。

DEC0094-01/02的认证只读、匹配类型、当前PUBLISHED具体版本，与DEC0087-03/04的来源/有效修订/活动申请/真实签名/原子发起保持。候选可读没有扩大办理权。`findByDefinitionIdAndIsCurrentTrue` 返回Optional，先确认current再过滤PUBLISHED；本批只观察两个PUBLISHED current现有异常，不将其扩展为新的全域唯一current政策、start规则或完整损坏数据矩阵。

确认的性能信号是：原实现先查一份定义列表，再逐个查询current版本，因此每次真实SELECT为 `1+(M+2)`，五档对应3/4/13/103/1003。版本实体还选取候选DTO不用的nodes_json/edges_json。本机第二次读取在100档约46.2/47.9ms，1000档约502.8/365.2ms，调用线程累计分配约42.5/42.0MB；采集开销、热缓存、小JSON及线程累计分配都不能当作生产延迟SLA、峰值内存或大JSON容量证据。原记录列表的12个观察独立保留，没有混到这20次或4504计划中。

索引边界已核对真实计划与canonical schema：1000档版本查询使用既有 `uk_wf_def_version`，定义表有 `(type,business_type)` 索引。小表顺扫本身不说明缺索引，已有版本索引也消除不了1003次往返；本批没有证据要求新增索引。以后改变SQL后再看真实选择性、排序和计划。

健壮性/A23核对没有发现本批新增过度防御。严格独立数据库URL guard用于阻止破坏性fixture触及共享库，是必要防护；显式夹具数量/完整结果/摘要断言对应真实验收，不是产品里兜底。未新增吞异常、静默取首项、自动挑最新或重试框架。`RecordControlWorkflowService` 实际127行，按行数不需拆大模块。下一批的具体抽取方案应把“候选读取+批量current查询+必要字段投影”放在独立读取职责中，保留原服务 `start` 的校验及写事务；保留每种类型全部选项、名称顺序、缺失/current未发布排除与既有多current错误边界，避免为性能悄悄改变业务。

用户已明确授权**下一批批量读取并精简字段**；当前e173未实施。原记录列表资格SQL和事件DB分页仍未答，不能把上述授权扩张到它们。两PUBLISHED current之外的混合状态损坏组合须在后续批读中按实际影响补测；本次观察的N+1数量不是要锁定的业务性能标准。

本轮仍处于原W3/W7增量及W6性能/A23审计。全量知识语义、W2–W7、高风险/A12/完整矩阵、已审模块A23及容量UNKNOWN队列继续；知识353文件/旧2848ID清单不能冒称语义全通过，旧931是不同分母。通用签名页和生产管理弹窗继续暂停。产品/UI无改，本实例没有重跑前轮92浏览器，没有声称前端strict86/lint已绿，没有查询CI、触发Actions、合并、部署或恢复数据。

当前无影响本批交付的发现或阻塞；建议主审在所有角色FINAL后完成PR前任务漂移/阶段复核，再交付这个测试取证切片。任何目标或候选提交变化均须重新评估，当前结果不能覆盖新提交组合。原始命令、输入SHA、XML、完整PG/应用日志、结果、计划和清理均在本目录；`source-binding.json`为独立核对，`manifest.json`和`SHA256SUMS`为可复核文件清单。
