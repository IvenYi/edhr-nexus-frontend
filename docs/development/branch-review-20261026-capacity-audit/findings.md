# 首批容量风险与反证

固定产品5259791fcbc5d1fddf04cd62a02d6593d00fe2e6。本批不修改产品，四项均为performance-risk、medium、pending-discussion；不是已经修复或证明生产故障。两个DHR条目在同一比较链相交，记录数不是独立缺陷数，成本不能重复累计。

| ID | 已查路径与证据 | 增长条件与可讨论选项 |
| --- | --- | --- |
| PERF-WORKFLOW-QUEUE-001 | todo/done原生PG/真实JWT与MockMvc，合法多实例fixture的8项观测通过；N=100/1000/10000时每次返回5，却加载N个WorkflowTask；均1次查询，不是这条路径N+1 | 个人待办积压/已办历史增长时每次小页也全量材料化。讨论数据库分页/窄DTO及索引，保持候选/当前委托/DHR排除、原排序和数组返回；未测客户容量、p95或OOM |
| PERF-DHR-EVIDENCE-NPLUS1-001 | 历史版本version必调用changes；冻结表单逐份读当前记录，changes静态应用JDBC模型F+4 | 单DHR证据F增长时串行往返增长。讨论按完整ID及tenant批量/分块读取再逐份比较，保持缺失/新增成员、状态/版本/摘要及锁内最新性 |
| PERF-DHR-REVIEW-REPEAT-001 | 授权审批详情先version内changes，随后再changes覆盖结果；比较部分静态模型2×(F+4)，不是整接口总SQL | 同一比较和附件匹配/readAllBytes/hash可能重复。讨论同请求一致时点内复用、冻结附件ID索引、流式hash；审批写动作仍须锁内重查，不跨请求缓存 |
| PERF-EXECUTION-REFERENCE-VIEW-001 | 执行引用搜索先get(id)构造完整view，包括正式产出、全工序质量/份数/控制，再查某字段有界候选；静态路径已核、规模测量未做 | 工序/表单副本/动态行/正式来源增长会放大每次搜索的无关计算。讨论窄可信引用上下文，保留真实版本/来源资格和条件复验，不直接信任客户端context |

DHR两项及执行引用项只完成静态调用链分析，未运行SQL次数/文件IO/堆/时延测试。F+4及2×(F+4)是合法分支的源码调用模型，不能写成已经在F=10000库上测过10004次SQL。

## 反证和现有保护

- DHR实例列表是COUNT加LIMIT/OFFSET、页长1..200，行映射没有逐行查库；当前详情通过批量查询读实际表单，冻结完整性验证也不是循环内逐条SQL。关联子查询在同一SQL里，真实成本需要EXPLAIN，不能都叫网络N+1。
- 引用候选已有SQL LIMIT100，分页上限100加1；不是全量加载再分页。ProductionExecution.view已有创建人map去重，条件属性重查/目录有效性校验有必要，不能以“上下文已有显示数据”为由删除。
- 目前没有证明所有长文件或所有循环都有性能问题。完整证据可见性、每次动作审计、签名原文/摘要、锁内资格和快照身份不能当作可随意删除的开销。

## 实际观测及限制

工作流辅助探针最终8/8原生PG通过，0failure/error/skip，案例为两队列×三规模加两条认证/分页对照。同一个合法多实例数据形状显式安装当前active(instance,node)唯一索引，检查0重复/0工作流引用缺失；DHR/他人排除、伪造assignee、顺序及读前后表摘要不变保留。使用JPA/Hibernate create-drop加目标约束的合成配置，不是完整baseline迁移或生产负载验证。

前两轮8项通过但fixture合法性不足，均保留安全原件及差异并从当前有效规模证据排除；最终8是同组修正复跑，不计24个不同案例。原Maven日志/XML/JWT不归档；运行原件见evidence/workflow，DHR静态证据见evidence/dhr，主侧引用链见evidence/primary。

六条DEC0082有限语义由正式本体实例完成源码/原始依据核对，无冲突无需改知识，ontologyResult not-applicable只表示本片无知识定义变化；不表示2618ID全审通过。既有TaskDetail、记录控制/两DHRhigh/A12及四gap、旧AuditEvent和历史签名限制保持。
