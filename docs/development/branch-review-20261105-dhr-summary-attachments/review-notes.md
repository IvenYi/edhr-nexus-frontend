# 汇总附件：真实提交、资源、锁与索引审查

这是7704测试/取证阶段记录。用户随后已批准内部元数据复用；最新产品、72回归及最终门禁范围见[整改说明](reuse-review-notes.md)。本文件原“待用户/未改产品”等仅表达当时阶段，不覆盖新候选。

本批L2基线a429f983；PR63已人工合入，整树同f133e315，无外部代码/契约/知识增量。只新增DhrSummaryAttachmentObservationPostgresTest及研发记录，没有产品修复、索引/迁移/政策/UI变化。旧“5+2N/300附件605次”仅为七表PK、替身依赖、停人工guard的局部前缀线索；本批回到原始源码与完整canonical迁移，用实际Spring服务成功保存草稿/提交，并独立复验冻结摘要。

## 实际覆盖与结果

新原生15例：0/1/10/100/300附件成功提交5例、50MiB完整读取1例、缺失/篡改/未核验/草稿后来源变化/人工确认缺失/旧修订拒绝6例、成功和回滚提交并发unlink2例、完整既有索引混合分布1例。相邻54例为原SummaryService8、SummaryPersistence24、AttachmentWriteFailure5、AttachmentAndArchive13及FormFiles4；合计69/69，知识89/89，均0F/E/S。

新测试仅mock后台FormProjectionWorker，实际DhrInstanceService/AttachmentService/EvidenceImpactService/FormFiles/FrozenIntegrity/JPA审计及Spring事务全部运行。事务模板中调用真实Spring代理，覆盖实际commit/rollback；SQL直接种入已完成生产对象、1张WORK原记录、空operations执行夹具和已核验附件，验证的是当前服务读者/提交，不认证首次START、来源生成或生产完成执行。NONE定稿、单WORK源不代表REQUIRED、三来源、签署、全HTTP/RBAC或多租户部署矩阵。附件元数据不含服务器路径；冻结附件公开JSON按原始序列化字符串逐字比较，源记录数量/身份、checkResult、submitted_by_id、草稿删除、定稿状态、SUBMIT审计及实际FrozenIntegrity同时检查。

首focused因新测试缺两个DynamicProperty导入而编译失败，未执行JUnit；补导入后首69中6个断言失败，原因是内存LongNode的size与JSON解析后IntNode类型不同，显示/序列化字节相同。主审改为要求原始序列化JSON逐字相等，顺序、字段和数值没有放宽；另保留实际冻结摘要检查。再次完整69通过。原编译日志、六失败XML、各阶段测试源码和最终通过原件全部保留，不计产品缺陷或性能负控；数据库保护未关闭，产品没有为过测修改。

## 查询、字节及容量

每个动作使用独立SET LOCAL application_name标记真实事务，按成功execute与应用拦截SQL完整形状对齐。最终16观察合计998业务SELECT；44写入为22INSERT/15UPDATE/7DELETE，JPA非SELECT与JDBC写入范围分列，16SET/事务、初始化、种数、workspace/saveDraft、冻结后核对/断言、两EXPLAIN和runner版本查询均不称提交请求查询。

| 有效附件数 | 实际提交SELECT | 指定原件逻辑读取量 |
|---|---|---|
| 0 | 13 | 0 |
| 1 | 15 | 68B |
| 10 | 33 | 680B |
| 100 | 213 | 6800B |
| 300 | 613 | 20400B |

13+2N只适用于本夹具的1个WORK来源及NONE模式，固定读数不能推广到其他来源/审核绑定/HTTP。实际循环是submit:252→file，分别ensureDhr(false)和按tenant/DHR/id读取路径/SHA各一次，2N是重复元数据往返；不是内存分页。snapshot已经取全行，但公开JSON不暴露路径，不能把内部路径加进响应来省SQL。

50MiB PNG夹具直接登记VERIFIED，实际提交完整读52428800字节、线程累计分配约0.394MiB，且资源预算要求低于25MiB，避免恢复整文件摘要数组。这是已有8192B流式SHA在提交消费者的证据；不是上传/verify同样有界，也不是七格式50MiB全流程验收。upload/getBytes及verify/readAllBytes、导出附件数组/PDF累计仍另审。300小附件线程分配约14MiB，文件总计仅20400B，表明框架/元数据往返也有成本，不能据此声称生产慢查询或通用峰值。

JFR按指定原件路径和eventThreadId过滤，避免并发两录制互相归因；逻辑读取不是物理磁盘IO，夹具写入后属暖缓存。ThreadMXBean记录调用线程动作的累计分配，非保留堆/峰值/RSS；heapBefore/After是全JVM快照，并发可混入其他线程，不能作单线程峰值。锁用例elapsed含人工latch阻塞，不作性能时延。没有人为规定附件数量新上限。

## 并发、资格与A23

submit真实锁顺序为生产对象→DHR→草稿。当前upload/verify/unlink写者都先锁DHR，未找到改登记路径/原SHA的生产入口；这是当前源码观察，不是永久不可变新政策或任意SQL写者证明。

实际pg_stat_activity观察unlink的Lock等待，锁持有时active仍true。提交成功后NONE→FORMALIZED，等待者获取锁后必须被ensureDhr(true)重新读状态拒绝，冻结仍含原附件、无UNLINK审计；提交因人工确认失败回滚后等待者可成功unlink，active=false且原件留存。两者已分别通过，旧局部回滚测试不能替代成功定稿边界。

未核验在存草稿前设PENDING才真正命中“尚未核验”；存草稿后改变核验/用途会先命中source_scope_hash变化。缺失/篡改只改磁盘不改元数据，实际完整SHA拒绝且草稿/DRAFT保留，无冻结/提交审计。这些与人工三确认、源表单完整性、单源hash及整体冻结hash保护不同依据，不能机械删去重复外观守卫。file仍允许历史解除关联原件，由downloadableFile的active/冻结成员资格控制外部读取；不能全局改active-only或删除ensureDhr来优化submit。

## 索引与具体局部方案

完整canonical既有dhr_attachment_pkey(id)、idx_dhr_attachment_active(tenant_id,dhr_instance_id,active)及父FK；本轮ANALYZE后，在同DHR5000inactive、其他DHR5000混合记录与300有效附件分布上：活动集合Bitmap Index/Heap Scan实际300行，再按linked_at,id内存quicksort106KiB、Temp块0；按id Index Scan主键，保留tenant/DHR过滤。现有组合索引不含排序键，所以不能说无Sort，但本规模没有新增排序索引依据；PK命中也不能消除2N往返。深历史、更多活动附件、实际行宽/冷热/并发分布另有证据后才讨论索引，不凭样本承诺全部生产性能。

建议一次内部SubmissionAttachments读取上下文同时构造原公开snapshot及私有路径/SHA，保留父锁、来源hash与错误优先级；来源一致后逐项VERIFIED及完整SHA，再按原顺序冻结，不跨请求、不缓存失败、不改下载/导出入口。这个性能提案已向用户提出，当前未答，产品未实现。次优更小方案是父锁内专用检查只省N个DHR读取，仍N个路径查询。两者都不跳过文件全量校验，IO/锁持有仍随总字节增长。

长方法可先提取readSubmissionSourcesAndCheckDraftScope、verifySubmissionAttachmentOriginals、buildFrozenSummary、persistSummaryVersion，由submit继续拥有固定事务/锁与校验顺序；若真做内部投影，再抽公开snapshot共用行映射。当前不为行数重构或创建通用批处理框架。A23只覆盖上述方法，W6仍需含既审模块的全面复查。

## 知识及原队列

有限本体15条=14既有ID+1Markdown，13明确子范围一致，2完整场景evidence-gap；与上批20条有重叠，不叠加为unique。知识350、0.3.25/schema1.2/P0 in-progress不变，NONE冻结不等于放行/受控归档。原931知识候选、86 UI、W2余项/W3-W5交叉/W6健壮性性能抽取A23含旧已审/W7增量、原DHR high/A12/完整矩阵/history/文本ID索引/PDF累计及全部暂停继续。

7591路径只是当前基线盘点，整文件完成0、历史unique未知。当前待全新独立最终质量；全部角色FINAL后实际做PR前任务漂移与阶段复核。朋友通用任务密码/签名页和生产管理弹窗继续暂停，不自动merge/deploy/恢复或查询触发CI。
