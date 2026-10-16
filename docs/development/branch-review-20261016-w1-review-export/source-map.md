# 本批实际源码映射与判断

来源与目标均为76b214426a271929bba2708cdda9e4d84d1f0679；方法摘要对应当前真实源码，精确路径/摘要在review-progress.jsonl。只对列明方法及依赖作结论，未将完整文件或所有相邻流程标为审完。

| 链路 | 实际保护 | 运行证据及边界 |
| --- | --- | --- |
| DhrReviewController→DhrReviewService.detail/act | 先校验任务候选或本人已办；动作另要求动作权限。act先锁workflow，随后production_object、DHR，再用JDBC重读任务，核验pending、冻结hash、按钮、意见、人工核查、未完资料、完整证据变化及原件。 | DhrReviewServiceTest10；DhrWorkbenchPermissionsTest8。Mock内容与HTTP/方法级边界按原测试，不声称全应用E2E。 |
| DHR签署→WorkflowEngine.completeDhrTask | 先校验会话访问与任务资格，再认证实际签署人及其动作资格，签署/工作流动作按签署人、审计保留会话与实际签署双身份；只接受APPROVE/REJECT专属完成。 | DhrReviewLifecycleIntegrationTest5使用真实工作流/签署/审计事务；DhrInstanceService、DhrFormFiles、DhrAttachmentService、SubjectResolver等按原Config被mock/stub，不是完整原件/附件整链。覆盖双批准仅一个签署/结论、退回再提交、过时证据拒绝及旧批准保留；原件/归档另由13项实际文件测试承担其列明范围。 |
| 通用工作流读写及完成 | 列表在SQL分页前排除DHR，单体读/通用日志写、转办/干预及通用完成有DHR保护；completeTask与createInstance拒绝绕过专属汇总入口，用户身份取认证主体。 | DhrGenericAccessTest3含真实JPA及真实guard方法；WorkflowTaskControllerTest2；RecordControlWorkflowControllerTest3；额外WorkflowEngineTest的冻结版本及防绕过两例。未由这些用例推定全部通用工作流并发矩阵。 |
| DhrSummaryService.saveDraft/submit/reorganize/version | 对象→DHR→草稿锁；draft身份/revision和来源范围核对；显式重整限定最新FORMALIZED版、原因和预期版本，先建DRAFT，submit才新冻结版本。历史正文取指定版本列和完整性核验，头部仅读header，不混入当前表单值。 | DhrSummaryPersistenceTest24，含失败审计整体回滚、历史读取不依赖可读实时值、原件/冻结候选完整性、显式修订保持旧证据、草稿/下一版本时点与范围。人工损坏行的健壮性用例不证明合法A12路径已实现。 |
| 任务附件→DhrAttachmentService | 当前任务授权后下载指定版本成员，核对DHR归属及冻结摘要，历史解除关联仍保留原件；编辑限定合适DHR状态并持DHR锁，上传失败回滚清理新文件。 | 工作区权限与归档类既有断言；原件上传/核验/解除关联及冻结成员范围随13项归档验证。 |
| DhrArchiveService.export→DhrPdfRenderer | 固定tenant+DHR+version，所选ID属于本版；校验候选、placements、排序和集合一致，按同版快照渲染及附原件；校验文件hash，SELECTED明确范围并去原始对象级载荷。ZIP生成或审计失败清理，响应流finally清理临时ZIP。 | DhrAttachmentAndArchiveTest13实际Chromium/PDFBox、ZIP与文件字节；不是整页视觉/HTTP客户端下载取消的全矩阵。未发现合法运行下的新确定缺陷，未为假定异常重构。 |
| 审计读取 | 审批先解有权任务，再按DHR+版本读取；通用审计遵守各入口权限和证据归属。 | DhrAuditReadTest4及工作区权限相邻验证。 |
| 来源生效与影响 | DhrEvidenceImpactService是读时比较，比较旧证据、当前关联集合与附件/字节；RecordControlWorkflowService只实现工作流侧start/candidates，结果/业务投影为端口。 | 生产源码符号检索未定位完整A12来源生效消费者及主动通知实现；原DEC已记录的high缺口继续open，不以测试直接改行代替合法生效事件联调。 |

本批主测74项为互不重复的选中case；同一条链可能对应多个断言，不能据表格行数增加测试数或语义覆盖率。未来来源写入者、权限或事务边界有新改动时必须重核，当前“无新增已证实缺陷”不等于其余1524路径和W2到W7已审完。
