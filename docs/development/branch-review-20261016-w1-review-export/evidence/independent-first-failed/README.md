# W1 审批、修订与冻结导出：首轮独立复核

本实例未参与实现、未修复或修改仓库文件。来源/目标/实际契约读取与产品受测提交均为 `76b214426a271929bba2708cdda9e4d84d1f0679`。质量结果 **failed**，原因是首轮清单中的 6 个中文路径为 Git 八进制转义文本，不能直接定位实际文件。原 CSV SHA-256 为 `3f2b6d1e759982a695342e671d8efadaf20a51680331f34d71bd42d6eb5c33f2`；6 个真实/错误路径对照见 `inventory-initial-failure.json`。

这是该观察快照的文档问题，不是产品代码问题。本实例只报告。ROOT 接手修正后，另由全新实例验证最终文档；本报告不将修后工作树描述为仍失败，也不接受修后结果。没有参与修复的本实例实际独立执行了十套件 74 个唯一用例，全部通过，0 failure/error/skip，Maven 退出码 0。真实执行 `build:dhr-print`，归档 13 项实际使用 DhrPdfRenderer、Chromium、PDFBox 和原件字节校验。逐 case、命令、原 XML SHA 及日志 SHA 见 `test-result.json`、`case-index.json`。

实际源审范围为任务读取/动作与附件授权、冻结版本/hash/流程绑定、会话及实际签署人资格与双身份、通用工作流防绕过、JDBC/JPA锁与审计事务、显式修订先草稿后提交冻结、历史版本独立读取、FULL/SELECTED导出成员/排序/原件完整性及失败临时文件清理；源码以当前提交为原始证据。未在这些已读方法内发现新增确定产品代码缺陷，不能推定其余文件已审完。

测试边界按真实代码解释：DhrReviewServiceTest 运行真实 JDBC/Spring 事务，但 mock 工作流、签署和审计仓储等相邻边界；其审计失败验证当前 JDBC 状态回滚、双身份验证调用和记录内容。DhrReviewLifecycleIntegrationTest 使用真实工作流、签署和审计 JPA，并发批准只生成一次签署/结论；但仍 mock DHR 投影、附件、表单原件、主体与状态机等边界。DhrWorkbenchPermissionsTest 是真实 Spring 方法安全代理配合 mock 服务，不是 HTTP E2E；DhrGenericAccessTest 是真实 JPA 查询和真实 guard 方法配合直接控制器。归档类真实调用浏览器生成 PDF 并解析，审计仓储和表单文件仓储部分 mock。未执行 PostgreSQL 事务场景、完整浏览器页面视觉或真实 A12 来源生效联调。

知识 `0.3.25` 的 252 文件、2,487 个唯一 ID 不变；36 个政策声明/文本/来源定位核对只作政策导航，不计 36 全链通过。两项已有 high 实现差异保持 open，真实 A12 来源生效、主动通知、完整质量影响比较及发布级并发继续阻止完整 DHR 生命周期/发布完成。汇总修订创建新草稿及新汇总版本，与 A12 原始来源修订/作废所有权不同。原四个知识 evidence-gap、F004 及 W1 剩余/W2–W7没有关闭。

`protected-before.json` 与 `protected-after.json` 对全部 1,524 个跟踪文件逐项 SHA-256 相同。`verification-facts.json` 保存契约 blob、主侧两轮日志/XML原证据摘要复核、12条方法摘要和独立case集合核对。Maven构建产生的 target 文件属于实际运行产物，不计源码修改。独立结果和安全索引可供主侧保存；`maven.log` 与 `original-xml/` 为本机原证据，可能含测试认证输出，禁止未经清理直接提交或在聊天打印。

下一步技术判断：修正清单路径并完成文档最终独立复核即可继续此审查批次；没有依据要求为本次报告另改业务逻辑或补建完整 A12。完整功能和全分支审查仍应按既有台账继续，不得以本批测试通过宣布放行。
