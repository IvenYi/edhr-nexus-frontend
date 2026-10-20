# 独立只读审查：AuditEvent 摘要边界

固定候选 `266a1635cc95870cd7907c574eb676db7f560d4f`，基线 `a8285be9b91fb76bcb27ccb16a5258bda1fb5077`。本实例只做 L2 的有限源码与原件核查，未参与修复，未修改仓库，未运行 Maven、数据库或浏览器。知识基线为 0.3.25/schema 1.2.0，契约实际读取提交为该候选。

未发现本批新引入的摘要读取或导出阻断；`W5-AUDIT-HASH-001` 仍为真实既有 medium/open，不能称摘要重算通过。

- AuditEvent、原始 JSONB/timestamp schema、0023 摘要列迁移、列明 API/UI/ZIP 消费者相对 a828 均字节相同。12 个有限范围中10个源码未变，另1个是新增转办审计调用，1个是新增测试。完整 Git blob/SHA 见 source-receipts.json。
- AuditEvent 在 PrePersist 按 contentBefore/contentAfter 的原字符串和 LocalDateTime 文本封存；JSONB 规范化及 timestamp 精度转换不能保证同样文本。主代码 computeSnapshotHash 的两处引用都在实体内部：声明和 PrePersist 调用，没有列明消费者的读时调用。
- AuditController 的 DTO/getById、AuditLogPage 指纹显示、DhrArchiveService 的 auditsFor/sourceAuditEvents 只传出所存摘要。ZIP 中的签名 payload 校验、附件字节 SHA、ZIP entry 清单 SHA，以及 DHR frozen-version 摘要和 review expected-version 判断是各自的完整性契约，不能当 AuditEvent 重算成功或失败。
- 新通用转办使用现有 AuditEvent 封存。新 PG 测试明确检查审计内容、存储摘要格式、数量和故障回滚，没有宣称重算等值；本批代码没有修改既有摘要算法或历史记录。
- failed-probe-fixtures.zip 的两个成员均逐个匹配归档 bytes/SHA；baseline-audit-hash-probe.java 保留第150/172行重算断言及实际0060加载。所附安全摘要明确为 a828 的2项失败、0错误、0跳过。本实例核对的是原始归档元数据与源码，没有新执行该探针，运行结论应由父级独立QA按自身实际执行分别说明。

本子检查局部通过，新增发现为空。W5 后续应独立设计稳定的版本化封存 payload/规范化和历史兼容方案，不能重写旧 hash 来消除红证。未对整个系统、所有审计消费者、完整 DHR 生命周期或实际历史库提供认证。
