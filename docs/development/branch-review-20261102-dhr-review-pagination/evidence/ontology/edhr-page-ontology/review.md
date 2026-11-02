# DHR个人审批数据库分页：有限本体核对

FINAL：not-applicable。知识0.3.25/schema1.2.0及P0/in-progress保持；知识、架构及契约零修改。本轮源码以source-fingerprints.json列出的当前工作树字节为准，base/target为1ad6300918bd0059049eab3c415ca31162dd5115；未为未提交源码编造提交哈希。后续源或目标变化应重新核对受影响范围。

## 已核规范

14个既有ID为12项有限consistent和2项旧high的evidence-gap。DEC0068-01、DEC0063-07要求针对不可变汇总版本的个人待办/已办；DEC0068-07和DEC0063-05保留流程绑定、完整证据及版本边界；DEC0068-11及对应fact/rule限定当前任务候选或本人已办对本版附件的授权；DEC0063-12保留分权。DEC0068-08/09/10等仅核本轮不改生产、放行、UI职责及所有权边界，不是完整模块认证。原始确认见dhr-filling-review-confirmed.md:217、269及各原决策，不用历史摘要或测试代替原始语义。

## 源码与工程边界

实际读本轮DhrReviewService差异：list改为数据库visible筛选、准确count和当前页，使用一个MVCC语句；提取共享FROM和轻量列表投影。detail/act及既有Javaeligible/handled未变，菜单与动作、附件授权仍在原控制器/服务。JSON候选优先及fallback、ID倒序、strip/Locale.ROOT既有行为是本轮等价性基准，不冒充新增用户业务政策。生产候选由WorkflowEngine用userId.toString集合生成，空配置写Boolean unrestricted；其他JSON形状只属兼容与稳健性验证。

实际读0091两条runInTransaction:false的CREATE INDEX CONCURRENTLY及回滚语句：待审workflow_instance_id部分索引、已办assignee_id/id倒序含instance_id/node_id部分索引，保留既有索引，不回填或改写任务、候选、冻结证据与审计。第一条对pg_catalog.und-x-icu/provider=i设置HALT前置；关键词使用ICU root是保持现有大小写结果的运行兼容条件，不是新的本体政策。缺ICU环境、ICU版本及未来表达式/trigram索引升级重验应在部署和质量范围记录，不能由本报告代认证。

读取新原生PG矩阵/旧Javaoracle、迁移源码及完整应用退回→再提交→批准后的列表断言：H2中4条list断言迁至实际JSONB/PG与真实流程路径，其他动作/签署/冻结断言保持。此处仅核测试源码与语义边界，本体角色未执行后端、迁移、容量或浏览器测试。主开发与独立质量必须分别报告实际候选、命令及结果，不把首轮/夹具/元数据失败算产品红控或把前后重跑合并为unique覆盖。

## 实际验证和仍待审

本体亲自执行tools/knowledge-model Maven：89项，0失败/错误/跳过。330知识资产逐字节/哈希与目标相同，知识测试后这些资产和验证器未改变；结构校验不是全量语义审计。未新增知识、规则、事实、执行契约、试点或状态提升。

两项旧DHR high仍open：完整外部质量事实/变化比较及完整普通权限UI、账号状态、全部收件人矩阵。本轮列表优化不构成其关闭依据。666路径/44知识/183ID候选与W6含旧已审的健壮性/A23、W7新增提交仍待审，whole-file0、unique未知。TaskDetail友方、生产弹窗及原ACL/归档等暂缓不变。索引容量、共享其他业务量、所有待审下候选CPU及深页精确计数成本取实际计划报告，不能由创建索引或本体NA宣称所有规模性能已解决。

本报告不替代全新独立质量FINAL，不代表DHR全链、整体审计或生产发布完成。
