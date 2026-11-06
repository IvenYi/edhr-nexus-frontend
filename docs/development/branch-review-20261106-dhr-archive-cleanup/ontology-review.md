# DHR导出临时ZIP清理失败：本体最终有限核对

正式结论 **not-applicable / FINAL**。固定基线/目标2cb85492b2dbf47f5b837c565eecc5832b62b39a，实际读契约也是该提交。最终源码及测试采用clean候选a4777e9f6ef7518d8684a48516c21cf5904cff01：19个主侧final运行输入与当前和候选逐字节一致，无post-run差异。350知识文件与基线相同，知识0.3.25/schema1.2.0/P0 in-progress保持；本角色没有修改产品、测试、配置、知识或契约。

本次只恢复原生成、审计或输出异常为主异常，清理失败作为suppressed并保留自有路径诊断。Service两处catch调用私有removeFailedArchive：原Exception仍抛出，IO/Runtime清理失败被附属记录及日志报告；Controller用标准Closeable try-with-resources关闭清理，输出IO或Runtime主错误不被清理错误覆盖，只有清理错误时仍传播。原成功字节/头/临时文件释放与失败阻断保持。此为工程错误传播，未新增业务许可、状态、证据或政策。

DEC-0063-05/10/11/12、rule.dhr-summary-zip-source-trace、版本与附件关系和EXPORT审计保持。原AuditEvent/归档SHA生成、save位置、域权限注解及全部冻结/内容校验不变。原异常身份恢复可让既有BusinessException处理器保留原错误码和消息，不是新定义错误码或放宽失败。原件、历史附件及冻结引用不被清理；没有未知孤儿扫描、递归删除、自动重试、UNKNOWN或持久对账设计。

term.dhr-archive和DEC-0090明确最终放行后的受控保存生命周期与汇总冻结、下载指定版本副本不同。本切片处理临时下载副本，不实现归档执行、解封、保存期限、备份恢复或放行能力。原下载实现的DhrArchive类名不能被当成生命周期已经完成的证据。

实际有限10条=8 consistent/2 evidence-gap，原成熟度保留，逐项见finite-audit-records.jsonl。两个广域缺口为既有完整HTTP/异步/发布级附件归档验收范围和相邻完整多租户未决；不因本片通过计作全域一致。整文件完成0，历史unique未知，不累计为新增全审覆盖。

本角色实际知识89/89，0F/E/S，fresh XML及run时间/指令/原日志完整。已读取主侧两测试文件同字节负对照：旧13=7正/6真F、0E/S，旧两产品源与固定Git一致；最终85/85=新service7+stream6+native12+FormFiles4+Layout3+hash48+event2+aspect3，均0F/E/S。只有本角色知识89为自行运行；产品、真实Linux临时路径非空目录故障、PostgreSQL、PDF合并、SQL/JFR均为主侧原件，已读取而未冒称本角色执行或重算。

故障夹具只将本次自有临时ZIP路径替换为非空目录，获得真实DirectoryNotEmptyException；DB/renderer协作者为mock，不是生产磁盘掉线或权限事故。原生12另用当前canonical真实PG和真实冻结/ZIP/PDF merge/审计，但renderer仍mock，不是Chromium打印/servlet端到端。主侧11观察33 SELECT、3成功audit INSERT及11 JFR描述按其分析范围保留，本角色不虚称逐事件服务器归因或资源峰值/SLA。

主侧--rm后立即观察删除为false的原记录和后续inspect已删除证明分别保留；这是环境资源清理观测时点，不改写为产品/JUnit失败，也不能省略最初记录。后续runner有界轮询只属执行编排，19受测输入未变。本片不关闭异步流未启动/超时/取消、真实FS崩溃、清理失败持久对账、UNKNOWN、PDF/Office/上传容量及其余原队列。

最后独立fetch目标仍2cb85492b2dbf47f5b837c565eecc5832b62b39a，未发现契约/知识增量。全新最终质量由另一未参与修复实例承担，本体读85报告不替代该门禁。W2-W7、931知识/86UI候选、高风险/A12/完整矩阵、历史ZIP/text-ID索引、上传PDFOffice导出容量、UNKNOWN、A23含已审代码及用户暂停项全部保持；不宣称整体审计、全局权限或生产发布完成。
