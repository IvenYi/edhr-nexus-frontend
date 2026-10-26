# 容量整改执行台账

用户于 2026-10-26 同意执行前轮建议。目标基线 a192a1d83be3644524ef6e2516619bdf81866678；PR25 已人工合并，与交付树一致。当前 L2。

1. PERF-WORKFLOW-QUEUE-001：SQL LIMIT/OFFSET，保留过滤、时间降序、数组协议、正数参数和 long offset。同时间增加 ID 降序确定次序（原同时间次序未定义），已办 NULLS LAST 保留。测试真实 HTTP/JPA/PostgreSQL，规模 100/1000/10000、后续页、越界、同时间和权限对照。并发新增时 offset 页仍可能移动，不声称游标或跨请求快照语义。
2. PERF-DHR-EVIDENCE-NPLUS1-001：使用冻结成员子查询批量读取当前记录。保留 default tenant、缺失判定、冻结比较、记录顺序；锁定分支保留按 ID 升序加锁，并验证等待锁后读取新鲜值。冻结成员不可变；非锁查询改为一个语句快照，不承诺跨语句一致视图。
3. PERF-DHR-REVIEW-REPEAT-001：实际 H2 汇总—审核服务链确认同一详情调用 changes(version,false) 两次。结合单次 PG 比较 5 查询，两次比较仍重复；不是完整端点 SQL 测量，附件字节/堆峰值尚未实测。
4. PERF-EXECUTION-REFERENCE-VIEW-001：真实 view/engine 加模拟 repository 的 1/100/1000 表单实验确认：单字段引用查询仍对全部表单调用 formControls，并调用完整 formalOutput 和创建元数据投影；查询候选 mocked，无数据库耗时/SLA结论。两项仍 open/pending-discussion，尚未授权改变读取一致性或配置来源。

最小范围为查询实现、必要测试及本批审计证据。无迁移、历史数据修改、业务政策替代、页面改动。主侧回归后由全新质量实例验收。整体 W0–W7 未完成；TaskDetail 签名页面和记录变更/作废依赖继续暂缓。

当前状态：本体not-applicable，两个候选全新独立验收passed。队列Q=3c32730a，59项；本DHR分支D=630c8c67，58项，均零失败/错误/跳过。独立PG额外验证锁顺序、等待后新值及事务结束前持锁。原件见evidence/independent，正式受测提交见acceptance.json。后续仅L0归档/交付。本分支不含Q产品修改；总包/主侧汇总跨两批，collect-results.py只适用于组合C=8e9cefe4。

容量边界：DHR 批量读取用内存换数据库往返，currentById额外同时保留F份当前JSON，旧实现逐条读取当前记录；这是新增峰值内存权衡。10k小JSON未验证宽记录/并发堆峰值，后续讨论分块与大JSON测量。SQL 分页减少实体加载，但不免除深 offset、排序、过滤扫描成本；未调整索引或新增 size 上限。客户实际数量、并发、记录宽度与 SLA 未知。

主侧首轮转办回归因错误地传入 command 测试库而被既有库名安全门禁拒绝；已新建同一隔离容器内 transfer 专用测试库重跑，安全约束未改。首轮安全汇总保留，后续通过不覆盖原失败。
