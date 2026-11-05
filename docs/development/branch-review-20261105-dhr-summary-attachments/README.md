# DHR汇总附件提交读取审查

L2，edhr-dev@a429f983a7a69553753034e9306d12598fcc15be；PR63已合入，整树同f133e315，无外部代码/知识/契约增量。新分支audit/edhr-dev-dhr-summary-attachment-review-20261105。

继续原汇总附件5+2N队列，旧605只认证局部手工guard前缀/七表PK/替身依赖。本轮拟用完整canonical迁移及实际服务成功saveDraft/submit、真实冻结摘要、坏文件回滚/父锁并发、0/1/10/100/300及50MiB读取分配和现有索引混合分布计划补证。仅新增opt-in测试与研发记录；未批准批读/分块优化，不先改产品或业务。

主侧69/69（新原生15+相邻54）、知识89/89均0F/E/S。16观察实际998 SELECT，逐application_name/SQL形状与PG成功execute完全吻合；44写入另列（22INSERT/15UPDATE/7DELETE），16SET不混计。0/1/10/100/300附件实测13/15/33/213/613读取；50MiB完整读取、调用线程分配约0.4MiB；均非生产SLA/峰值。完整索引混合分布查询：active组合索引命中，300行内存排序106KiB、无临时块；id主键命中，不加推测索引。性能复用提案已向用户提出，尚未获答，不把等待当批准。

源码/本体子项FINAL，15有限记录=14既有ID+1Markdown，13明确子范围一致/2完整场景gap，350知识及版本阶段不变；当前待全新独立最终质量与全部FINAL后实际PR前漂移复核。[详细结论](review-notes.md)、[实测](performance-report.json)、[主侧验证](main-validation.json)、[服务器核对](server-sql-review.json)、[固定盘点](inventory-summary.json)。PR63签名图片复用保持；PDF累计内存/931知识候选/86UI/所有原全审余项和用户暂停保持，不自动merge/deploy/恢复或查询触发CI。
