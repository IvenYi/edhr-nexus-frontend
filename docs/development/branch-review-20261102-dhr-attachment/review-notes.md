# 源码与范围

## 确定性缺陷

`DhrAttachmentService.upload:99-115`在写盘后登记同步回调。旧`!= STATUS_COMMITTED`把UNKNOWN与明确回滚混同；UNKNOWN不能证明数据库未登记。新测试保留实际代理/JPA/JDBC事务，先真实提交数据库，再由自有测试管理器合成确认错误，Spring同步生命周期实际通知UNKNOWN。旧源附件与审计行存在但磁盘原件丢失；当前保留精确原件并记录定位。不能称为实际断网测试，也不能从UNKNOWN推断数据库一定已提交。

只对确认回滚清理本次新原件。回滚补偿失败时记录ID/path和异常，不覆盖导致回滚的原错误；非空目录实际触发DirectoryNotEmptyException。记录为技术日志，不伪造新的LINK审计或历史恢复。真正提交成功不清理；外层事务的最终状态继续决定回调。

原生产完工/草稿整理资格、PENDING_REVIEW/FORMALIZED拒绝、来源元信息、格式/50MiB、SHA256、冻结成员关系和带原因解除关联不动。真实LINK审计及附件SQL共同提交/回滚，审计拒绝测试证明事务回滚并清理当前原件。测试拒绝CHECK仅故障注入，不是产品政策。

## 健壮性与过度防御

UNKNOWN分支由实际旧红支撑，不能删作“过度防御”；显式ROLLED_BACK防止推测清理。局部文件系统异常捕获只用于回滚补偿定位，保留原事务错误，不用于允许继续上传或返回成功，不增加全局重试/备份框架。原getSize与实际bytes.length都保留：前者可在读取前拒绝超限，后者核对已读字节，不能简单去重；格式、摘要与冻结成员保护也不能因性能候选取消。

原`isSynchronizationActive`与直接内部无事务调用边界未因本批变成已认证；文件写入中断可能在回调登记前留下残片。UNKNOWN/清理失败和进程崩溃仍需持久对账，没有自动扫删或历史恢复。重复提交/UNKNOWN重试幂等尚未建立，本批不自动重试或新增业务去重策略。

## 性能候选与触发条件

本次上传处理一个附件，没有新增列表循环/N+1/内存分页/索引；已有输入字节复用于校验、写盘和摘要。单文件50MiB是业务上限，不代表并发峰值或解析堆内存已经受控。

`DhrAttachmentController.download`先调用`downloadableFile`再`originalName`；前者再次调用`file`。按现有直线源码路径，当前附件为5次显式JdbcTemplate查询，指定冻结版本为6次；这是源码调用计数，尚未做实际SQL/延迟采样。重复ensureDhr和附件元数据存在上下文复用空间，不属于集合N+1。

`file`先`readAllBytes`核摘要，随后FileSystemResource再次读取输出。允许的50MiB文件在每个下载请求中至少产生一个50MiB原件数组，另有驱动/解析/输出开销；10个同时达到上限的请求仅这些数组合计500MiB，这是容量推算，不是实测峰值/GC/SLA。不能为减少读取跳过SHA256，也不能先发字节再把损坏判定当作等价行为。

后续先在隔离环境量化1/4/16并发、50MiB有效和损坏原件、当前/冻结版的SQL次数/读取字节/峰值堆/错误行为。方案可讨论复用已授权上下文、流式摘要后再输出；保持完整摘要、冻结成员与当前资格验证。当前不改性能实现或索引。

## 具体拆分方案

未来`DhrAttachmentUploadService.upload`掌管上传校验、当前原件写入、既有登记/审计与事务补偿；`DhrAttachmentReadService.resolveDownload`一次返回已核验的路径、原文件名与必要版本上下文，保持当前/冻结读取资格和完整摘要；`DhrAttachmentAssociationService.verify/unlink`掌管核验状态、带原因解除和历史保留。Controller保留HTTP权限与响应构建；解析Office规则留既有DhrOfficeAttachment。先固定当前用例并逐方法委托，不整类搬家，不新增全局文件ACL猜测。本批只修局部回调，没有实施拆分。
