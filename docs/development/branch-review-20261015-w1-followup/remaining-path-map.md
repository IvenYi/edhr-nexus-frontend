# W1 剩余路径：本批补读与下一验证点

来源 `1113fe14f7f7539b9727fc708f49838504287d4f`，目标 `6379bf105127b05a65695992b008b55c142264f9`。本页是主审在START修复独立复验期间的源码导航，未运行本页所列新增场景，不作完成或独立通过结论。未改变本批候选源文件。静态阅读与后续运行必须分别登记。

| 路径 | 已亲读的实际调用与边界 | 下一步实际验证 |
| --- | --- | --- |
| DhrReviewController → DhrReviewService.detail/act | 控制器菜单权限与动作权限分开；detail按任务候选/历史处理者校验，审计与附件先解析有权任务；act先锁workflow，再对象、DHR，重读任务，核验当前pending、候选、expectedSnapshotHash、按钮与意见。批准另核对人工检查、缺项、来源变化与附件；签署核验真实签署人资格，保留会话人与签署人。 | 在下一批实际跑DhrReviewServiceTest并回到WorkflowEngine.completeDhrTask及通用任务入口核对绕过、锁顺序、双请求处理、签署失败与审计失败回滚；本次源码阅读不能替代这些运行。 |
| DhrSummaryService.reorganize/prepareNextDraft | 显式重新整理要求FORMALIZED、非空原因、最新expectedVersionId，先对象后DHR锁；退回/重整另建draft，保留原冻结版本。 | 本批已独立安排现有DhrSummaryPersistenceTest相邻回归；后续还需与审批/补录交错核对，不能仅凭单方法锁判断全矩阵。 |
| DhrSummaryService.version/versionAudit | 版本按tenant+DHR+version精确查询；历史正文取base/overlay/candidate/attachment冻结列并校验候选完整性，审计按明确version定位；随后来源变更单独输出。 | 补齐审批后、退回后、重新整理后的版本读链及原件访问；当前已终止detail前置execution解析仍仅为依赖观察。 |
| DhrArchiveController → DhrArchiveService.export | 明确DHR+version与FULL/SELECTED，控制器要求查看和导出权限；服务校验版本归属、冻结候选与所选ID范围、placement完备性、目录去重与证据集合一致；表单/附件检查冻结来源及摘要；SELECTED去除可能带出未选字段的对象级原始载荷。临时ZIP生成失败、审计失败及响应流结束有清理路径。 | 本批没有重新跑归档/PDF用例；先前6379的13项仍只作其原运行证据。下一批按真实版本、原件、选定范围与权限入口补缺，核对响应流异常及归档日志失败是否需要新增有意义回归。 |
| 修订/作废 | 本次补读的DHR控制器/服务只见重新整理、退回及新汇总版本；不能把这些动作等同完整A12受控修订/作废。 | 继续按全入口清单查通用记录控制消费者及现行DEC原依据。未找到实现前保持范围缺口，不擅自创建新流程或修改政策。 |

对应源文件位于 `gmp-platform/backend/src/main/java/com/zencas/edhr/production/{controller,service}/`；所述方法是下一轮的精确起点，不代表这些文件已完整审完。W2–W7、F004及四个知识evidence-gap仍保留。
