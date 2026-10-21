# 签名创建—JSONB存储—DHR归档消费的有限源码复核

固定来源、目标和契约：`edhr-dev@c3343f45bb79f72368937f0d197ae01f989f0390`。知识 `0.3.25 / schema 1.2.0`。本实例是只读源码辅助，不是正式本体或独立质量验收；未改仓库，未运行 Maven、PG、API、浏览器、迁移或摘要测试。28条有交叉有限范围涉及14路径，见同名 source-map.json；不代表28个不同完整方法、14文件或全W3完成。

## 本次确定的源码控制流

真实普通生产入口是 `ProductionExecutionController.act`，已有 `production.execution` 权限；进入 `ProductionExecutionService.act` 的生产事务，再由 `ProductionExecutionEngine.formActionInternal` 校验本份、当前节点、允许按钮及实际签署人资格。按钮签署走 `ExecutionAccess.sign → signTarget(PRODUCTION_EXECUTION)`；字段签署走 `signField`，仍为本会话签署和个人认证，不借用按钮跨账号/admin例外。签名ID进入表单状态，签名和执行保存共享外层事务。

真实DHR入口是 `DhrReviewController.act`，同时要求 `records.dhr-review` 和 `dhr.reviews.act`；`DhrReviewService.act` 核对活动任务、当前处理人、冻结版本、人工核查与来源变化，再依据冻结按钮要求认证签署人。需要签名时调用 `signTarget(DHR_SUMMARY)`，得到的签名ID传入 `engine.completeDhrTask`，不是外部任意generic signatureId替代签署。这条链已经存在，不依赖用户暂缓的记录控制申请入口。

两个生产签名写方法均先把有确定插入顺序的证据对象序列化为紧凑JSON字符串，对该字符串的UTF8字节计算SHA256，再把字符串写入 `Signature.snapshotData`。实体使用 `@JdbcTypeCode(SqlTypes.JSON)` 和 `columnDefinition="jsonb"`；初始迁移同样将 `signature.snapshot_data` 定义为JSONB，摘要另存。所核写方法没有额外保存原始JSON字节或声明版本化的规范化算法。

真实导出入口 `DhrArchiveController.export` 有 `dhr.instances.view` 与 `dhr.summaries.export`，直接调用 `DhrArchiveService.export`。服务的 `sourceSignatures` 和 `signaturesFor` 分别从JDBC取得 `snapshot_data` 字符串，对读回字符串的UTF8字节直接重算SHA256，与保存摘要不相同即抛业务异常停止导出；导出异常会删除临时ZIP再传播。没有先parse/canonicalize后验算，也没有恢复原始签署字符串的机制。

精确范围：FULL和至少选一个表单的SELECTED调用来源签名消费者；SELECTED只有汇总附件时跳过来源签名。审批签名消费者始终调用。SELECTED随后才移除 `snapshotData`，因此移除载荷不绕过已执行的校验。来源签名按生产对象及汇总提交时间截止，不是所选表单份次独占。

## 可定位的运行线索与最小实证

候选为 `candidate.signature-jsonb-archive-digest`：原字符串摘要与JSONB读回文本之间的字节稳定性不一致，可能使未篡改的正常生产/DHR审批签名阻断真实ZIP导出。源码生产与消费链已确认；本实例没有运行PG，因此不把该候选升级为运行已复现或裁定严重度。

主侧最小原生PG探针可使用真实 `ExecutionAccess.signTarget`、真实Signature仓库、事务flush/clear和JDBC读回；同时记录原始输入字符串与读回文本的摘要、JSON树语义相等及原摘要未改，再调用实际 `sourceSignatures/signaturesFor` 消费者或其可重复贯通入口。应保留正常验算、字段篡改和摘要篡改拒绝对照。不得只测字符串工具或手工TEXT fixture后声称覆盖PG往返；也不必先运行所有PDF渲染步骤才证明这两个消费边界。

读回后简单去空格或按读回键序重序列化，不能证明原始插入顺序已恢复。设计修复时需由主审明确算法、版本及原始摘要材料的所有权和旧记录边界；不能重写历史摘要、恢复已丢字节、放宽校验或改变签名业务规则来让测试通过。此处仅为工程风险说明，不代替主审方案或实现。

## 与既有签名、审计和测试的区别

`SignatureController` 对传入目标类型以及同ID已有记录均保护 `PRODUCTION_EXECUTION`、`DHR_SUMMARY`、`USER_PROFILE`，普通通用CRUD不能覆盖或删除这些记录。`AuthController.createPersonalSignature` 另行认证当前用户并生成USER_PROFILE快照；其原字符串也有摘要，但所核 `verifyCurrentUserSignature/extractSignatureImageFileId` 只检查密码、有效期并parse图片引用，不作原字符串重算。DhrArchive来源查询不选择USER_PROFILE；不能把所有认证功能都说成已经有导出阻断。

所核 `DhrArchiveService.auditsFor/sourceAuditEvents` 只是投影AuditEvent原摘要及载荷，不重算。既有 `W5-AUDIT-HASH-001` 也明确该限制，不能直接代表Signature问题已修复、已证明或被忽略。当前47问题记录的限定去重只找到该相邻AuditEvent项，没有据此宣称全仓历史去重。

只读子实例已FINAL。其原件 `/tmp/edhr-w3d-signature-policy-tests.json`、`.md` 定位了DEC-0074、DEC-0058及DHR导出的原始现行来源。DHR同版签名追溯的精确声明为 `DEC-0063-05/11/15` 与 `rule.dhr-summary-zip-source-trace`，不能误引用-14。`DhrAttachmentAndArchiveTest` 的相关真实测试源码使用H2并手建 `snapshot_data TEXT`，覆盖FULL/SELECTED、载荷隐藏和篡改摘要拒绝，但不包含JSONB规范化；`SignatureTest` 仅反射JSON注解；`ExecutionAccessTest` 用mock捕获签名和64位摘要；DhrReviewLifecycle为H2且不运行archive。它们都不是本实例执行的测试结果。

DEC-0074普通按钮与DEC-0058字段签署各自适用范围保持，不新增generic必签政策，不扩大严格用户名admin例外。记录控制重新分配签名未决、两项DHR high/A12、全量多租户隔离及完整分支审查继续保持各自边界。

本实例无待运行工具，子实例已FINAL；源代码与政策/测试辅助原件的SHA在source-map.json中分别记录。
