# DHR附件上传与核验资源审查

L2，edhr-dev@c4e451c264c11978515b2ae0088e64011fe2fcef，PR64已合入、整树同a89dbd36，无外部代码/知识/契约增量。新分支audit/edhr-dev-attachment-upload-verify-20261106。

继续原上传/核验内存和事务失败队列。计划以完整canonical迁移、真实Spring multipart包装/磁盘Part及实际服务，核七格式小原件、1/10/50MiB PNG、完整字节/SHA/审计及SQL/审计拒绝/外层回滚与资格边界；测量分配和逻辑读写，不预设产品优化，不把它冒称容器解析/HTTP/生产峰值。

主侧81/81（新原生27+相邻54）、知识89/89均0F/E/S；52观察128业务SELECT按tag/完整形状与PG吻合，52SET、48次成功写执行和3次具名约束拒绝分列。成功执行的写包含4次随后回滚，不能叫48次已提交写。七格式小样实际上传/核验/下载逐字保持，SQL/审计拒绝、已flush外层回滚、坏原件/资格/状态拒绝通过；产品没有修改。

50MiB常规磁盘Part上传约50.10MiB、合成generic流约100.61MiB、核验约50.11MiB调用线程累计分配；下载约0.07MiB且完整读取。均为真实Spring包装下的指定输入/暖缓存样本，不代表容器解析或生产峰值。图片核验临时快照方案已提出、尚未获用户答复，不把等待当批准；上传/PDF/Office仍是独立容量队列。

只读源码/本体子项FINAL，16有限记录13一致/3gap，350知识/版本阶段保持；既有W5-AUDIT-HASH-001去重并保留open，64位hash存在不等于回读可重算。当前待全新独立最终质量及全部FINAL后实际PR前漂移复核。[详细结论](review-notes.md)、[实测](performance-report.json)、[验证](main-validation.json)、[SQL分层](server-sql-review.json)、[历史去重](existing-issue-dedup.json)、[盘点](inventory-summary.json)。PR64提交复用、931知识/86UI、PDF累计/大格式解析/UNKNOWN/持久对账、W2-W7及全部暂停保持，不自动merge/deploy/恢复或查询触发CI。
