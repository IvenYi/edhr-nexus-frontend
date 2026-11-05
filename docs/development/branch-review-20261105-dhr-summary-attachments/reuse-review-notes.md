# 提交内附件元数据复用：最终产品范围

同一L2决策包增量。真实完整canonical提交先取得13+2N的证据，用户明确回复“先做提交内元数据复用（推荐）”；不是新业务政策或未经讨论的性能重写。7704的test-only独立16项/69/89仅为历史阶段；新产品候选必须再取全新最终独立质量。

## 改动及资格时点

AttachmentService增加包内SubmissionAttachments，forSubmission在已有父DHR锁内用与原snapshot相同的tenant/default+DHR+active过滤及linked_at,id顺序，一次读取公开快照与仅内部路径/SHA。公开snapshot签名与字段put链原字节相同，仅提取snapshotRow共用映射；不把路径塞入JSON，不在全局或跨请求缓存。SummaryService.submit只改获取上下文及校验调用，仍先source_scope_hash比较，之后按原快照顺序逐项VERIFIED→原verifiedFile完整SHA。内部列表与公开JSON在同一结果行回调中同步构建，不从客户传入路径/摘要。

原生产对象→DHR→草稿锁顺序、来源detail/待审申请检查和上下文之前源码不动；原件验证之后的生产执行/目录/必填/人工确认/源表单/版本分配/冻结/审计源码整段原字节保持。AttachmentService从upload起的全部尾部原字节保持，含upload/verify/unlink/file/downloadableFile/资格/流式SHA，未全局删掉ensureDhr或active/冻结成员检查。当前所有合法附件写者都先锁父DHR，因此提交持锁期间内部元数据不被这些写者改动；此论证不扩展到任意SQL写者/未来入口，W7必须增量反查。真实并发仍是成功定稿后unlink拒绝、提交回滚后unlink成功保留原件。

原DhrSummaryPersistenceTest仅增加无附件新内部上下文stub，原24个断言不改，不用产品兜底适配mock；新PG仍真实全部领域服务（只mock后台worker）。没有新接口、表、索引、迁移、规则或历史修复。

## 反证与最终回归

新增预算0/1/10/100/300和50MiB要求本声明场景查询不超过13，保留完整读取/冻结/审计断言；不把旧低效次数定为契约。另加其他DHR、其他tenant、inactive三种缺失原件的排除，以及“先缺失后未核验/先未核验后缺失”顺序两轴，防止先批验状态改变错误优先级。最终18新原生+54相邻=72/72，0F/E/S。旧产品+完全相同最终新原生18为13正/5真预算红/0E/S，五红是1/10/100/300及50MiB，0、所有完整性/顺序/锁/索引控制通过；两产品旧源指纹与7704/base一致，新native源码指纹前后相同。

最终19观察195业务SELECT，旧同19观察1035；服务器逐tag及完整SQL形状对齐，50业务写为25INSERT/17UPDATE/8DELETE、19SET另列。查询拦截仅计实际查询，JPA非SELECT与JDBC写范围分别报告；初始化/种数/workspace/saveDraft/冻结后检查/断言/EXPLAIN/runner不混作请求。驱动若额外按连接解析jsonb类型，须如7704独立那样明确列为catalog元数据SELECT，不能强行把全部网络SELECT等同业务计数。

| 附件数 | 旧→新SELECT | 完整原件读取量 |
|---|---|---|
| 0 | 13→13 | 0 |
| 1 | 15→13 | 68B |
| 10 | 33→13 | 680B |
| 100 | 213→13 | 6800B |
| 300 | 613→13 | 20400B |
| 1×50MiB | 15→13 | 52428800B |

13是单WORK/NONE夹具的声明上界，不是所有来源/审核配置/HTTP请求的普遍常数。50MiB流式校验分配约0.37MiB，300小附件线程累计分配约13.67→7.34MiB；内部元数据上下文仍是O(N)，不能称为整个汇总/导出内存有界。JFR按原件路径+Java线程过滤逻辑字节，非物理IO；ThreadMXBean是调用线程累计分配，非峰值/保留堆/RSS。暖缓存合成样本和故意锁等待都不作生产SLA/并发保证。

## 索引、A23与剩余

完整已有PK/active索引在10000条无关/已解除历史+300有效分布命中，300行quicksort106KiB无临时块；无依据新增排序索引，不能用索引消除旧2N往返。全字节SHA成本与持锁仍随附件总字节增长，省SQL不等于省IO。upload/verify数组、更多50MiB原件、PDF累计/清单载荷及生产并发仍开放。

本次消除的是同次已锁提交内重复读取，不是删除普通入口资格。来源hash、核验、全SHA、各冻结hash和人工三确认仍保护不同依据；没有新“缺失就忽略”、额外兜底或隐式状态。必要共同row映射及内部上下文已局部抽取，原服务仍拥有事务；后续readSubmissionSourcesAndCheckDraftScope/buildFrozenSummary/persistSummaryVersion等具体拆分继续作为审查方案，不为行数实施大重构或建通用批处理框架。

知识350及0.3.25/schema1.2/P0不变；原15有限及delta子集保持两完整场景gap，不叠加unique。直接SQL完成对象/单WORK/空operations夹具证明服务提交读者，不能认证START/来源生成/真实生产完成、REQUIRED/三来源/七格式上传核验/HTTP/RBAC/受控归档。原7591盘点、wholeFile0/历史unique未知、931知识/86UI、W2余项/W3-W5交叉/W6健壮性性能抽取A23含旧已审/W7增量、旧DHR high/A12/全部运行矩阵和用户暂停保留。最终已取得48be新quality passed/16项、独立72/89及全部角色FINAL，实际PR前无漂移复核见scope-review.md，不自动merge/deploy/恢复或查询触发CI。
