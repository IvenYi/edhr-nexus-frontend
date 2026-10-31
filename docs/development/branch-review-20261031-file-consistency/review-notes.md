# 来源、未决范围与工程后续

文件所有权按实际创建成功判断，不用先exists再写；这防止失败补偿误删其他文件，也是A23必要防护。清理仅针对本次新路径，清理失败保留原异常/suppressed，日志可排查，不伪称始终能删除；没有遍历或修复历史目录。成功字节/MD5/返回ID与原限制保持，HTTP uploadedBy复用现有JWT AuditContext，不增加循环用户SQL或另建身份查询。

共享权限来源核对：DEC0065-01规范主数据文档接口页权，生产SOP也调用通用文件读取，合法执行人员不必有主数据页权。DEC0068-11及rule.dhr-review-task-frozen-attachment-download针对专用任务冻结附件；DhrReviewController先任务资格，再按dhrId/attachmentId/taskVersion核冻结成员，dhr_attachment与FileObject不是同一存储，不误报已证明通用接口绕过该表。公开资源沿四用途及实际引用，不把上传targetType当授权事实。

未绑定文件谁可读删、多业务引用是任一合法读取理由还是其他组合、个人身份证/签名认证材料谁可特权读取，未找到完整既有确认。已向用户集中询问“未绑定仅上传者、多引用任一合法对象可读、个人材料仅本人另授权”；当前仅建议，未答复不实现默认ACL。其他已确认专用读取资格保持。候选CAND-W3-FILE-OBJECT-ACCESS-001仍pending/needs-decision，未认证真实全租户、全部业务对象读写矩阵。

CAND-W5-FILE-CROSS-STORAGE-001仅复制失败残片子项修复；DB save/commit失败仍可能有孤儿，delete仍先删物理后删DB并吞IO。下一步必须用真实事务/失败注入确定提交、回滚与不确定结果，不在commit未知时删除可能被引用原件。不能只在控制器加@Transactional就声称文件可回滚，也不自动清历史。进程崩溃/断电不在本批故障处理保证内。

若下一切片抽取，FileUploadStorage.stage(file,id)应返回OwnedUpload(path,size,digest)，只拥有新路径及流；FileRegistrationService协调事务完成结果，已确认回滚可补偿，提交不确定必须保留并报告，禁止无条件删除。删除应有独立真实引用授权/保留策略与可恢复处理，再谈物理清理；不把原控制器整段平移成同体积Service。保护测试应覆盖原件碰撞、copy/close/清理失败、DBsave/flush/commit/rollback、真实对象资格和并发引用。按单入口委托可逐步回退，不新增无现实用途的通用框架。

容量增长包括单文件字节、PDF页幅像素及并发、DHR导出所有原件及Base64；当前未压测/统计SQL/执行计划，无生产堆GC/SLA结论。list已有数据库PageRequest，不称内存分页；本次上传仍两次流扫描，不未经讨论改为缓存/一次复制摘要。上传者上下文直接复用，无N+1新增；共享多引用资格下一步须批量思考，不能在页内逐文件盲查全部业务表。原PDF/导出/签名材料相邻上传候选继续。

本批测试真实文件、受控故障、JWT/filter/MVC和字节，仓储mock；不借此声称数据库补偿或完整ACL通过。无UI代码变更，未运行浏览器/前端构建，历史strict19/lint缺配置/process旧SQL路径非绿保持。原TaskDetail友方、生产弹窗设计、记录控制依赖DHRhigh/A12、四知识gap与缺文件政策维持。
