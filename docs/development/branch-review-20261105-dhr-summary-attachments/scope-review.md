# PR前任务、阶段与剩余范围复核

源码、本体原核对及复用delta、7704历史质量及子项、全新48be最终质量及子项均正式FINAL后，主审实际重读用户工程批准、同一决策包、NEXT、产品/测试差异和最终quality，重新fetch目标仍`edhr-dev@a429f983a7a69553753034e9306d12598fcc15be`。clean受测候选`48be11f44962b2dfe7390f7bb45b1ec833ac2bd3`已包含该目标，独立实际契约读取同48be，无外部代码/契约增量。

本轮无任务漂移。原全审汇总附件循环读取队列先补真实成功提交证据，再按用户明确“先做提交内元数据复用（推荐）”局部实现。最终只改DhrAttachmentService和DhrSummaryService两产品文件、新增一个opt-in原生测试、原Persistence增加无附件上下文stub及研发证据。共同snapshotRow/包内SubmissionAttachments是本次必要局部抽取；没有新功能、业务政策、接口、索引/迁移、全局缓存、数量限制、历史修复或大重构，不改用户暂停页面。

1122保护指纹仅允许两个产品读取文件变化；公开snapshot put链、AttachmentService从upload开始的全部资格/下载/核验/解除/摘要尾部、Summary上下文之前及原件验证之后的锁/来源/人工确认/冻结/审计源码原字节保持。上下文仅一次已锁父DHR事务，内部路径不进JSON；sourceScopeHash先比较，然后依原顺序VERIFIED→完整SHA。所有现有合法附件写者先父DHR锁，成功定稿后等锁unlink拒绝、回滚后unlink成功并留原件。两错误先后和DHR/tenant/inactive排除均实际运行。

最终主侧72/72、全新独立72/72及知识89/89均0F/E/S，不叠加为更多unique；quality16/16必需项passed，无发现/阻断。旧产品+同字节最终native18为13正/5真预算红，原始源码/XML/log/JFR保留；五红是1/10/100/300及50MiB查询超预算。前阶段初编译缺import、首69六JSON数值节点类型断言失败均是主侧测试问题，修为原公开JSON序列化逐字比较且独立冻结摘要仍验，不计产品/性能负控。7704质量16/69/89仅历史，不覆盖产品；最终必须以48be新实例通过为准。

最终19动作195业务SELECT，独立另1条驱动jsonb类型catalog SELECT单列；50业务写、19SET分别吻合，未把初始化/种数/workspace/saveDraft/断言/冻结后复验/EXPLAIN或runner叫业务总数。19外部JFR按线程+路径重算，50MiB完整52428800字节、约0.37MiB线程累计分配；300附件由613→13SELECT、完整字节不变。13仅声明单WORK/NONE夹具，非全HTTP/所有源普遍数；累计分配非峰值/RSS/SLA，内部元数据仍O(N)，全SHA/持锁仍随总字节增长。

索引混合10000无关/已解除+300有效分布命中既有active/PK，300行内存排序106KiB无temp，本批不加推测排序索引。更深历史、更多有效行、真实冷热/行宽/并发需另证。A23保留不同资格/摘要/人工确认守卫，只消除已锁同次重复读取；更大buildFrozenSummary/persistSummaryVersion等拆分仍为具体方案，不为行数实施。

知识350、0.3.25/schema1.2/P0 in-progress不变，两个本体结果NA/FINAL。原15有限=13明确子范围一致/2完整场景gap，delta6既有ID+2gap为子集，不叠加unique或提升成熟度。直接SQL完成对象/单WORK/空operations/VERIFIED夹具验证服务提交，不认证START/来源生成/生产完成、REQUIRED/三来源/七格式上传核验/全HTTP/RBAC或受控归档。所有自有PG、软链和工作树清理，无CI/Actions查询或手动触发。

本次只在声明路径关闭提交附件重复metadata查询。整体仍W3/W4/W5交叉及W2余项，W6健壮性/性能/具体抽取/A23含旧已审复查、W7增量继续；7591只是固定盘点，整文件0/历史unique未知，931知识/86UI、原DHR high/A12/完整矩阵/history/文本ID索引、PDF/清单/上传核验容量等原队列保留。朋友任务签名密码页和生产弹窗样式继续暂停。

下一轮先fetch真实merge/新提交及相关契约知识增量，再推进上传/核验的内存与事务失败边界、PDF/多附件容量和原覆盖队列；性能取舍继续先量化讨论，不自动扩展当前批准。之后仅L0结果/原件归档、README/NEXT和交付登记，受测代码测试/知识配置保持，生成PR供人工合入，不自动merge/deploy/恢复。
