# 审计事件全量加载：有限数据库分页试验

L2，edhr-dev@f2646c9a098291883434b7e6a7db628fe631ebd6。已核PR68人工合入、整树同0c04162f，无外部/知识/契约增量。本批复用PERF-AUDIT-LIST-MATERIALIZATION-001的事件全载子项，只增加一个opt-in原生测试及证据/方案；生产代码、前端、schema、索引、事务、排序、权限与历史全部不改。用户此前只批准本页批量姓名，不把merge当进一步数据库分页授权。

已交付[PR69](https://github.com/IvenYi/edhr-nexus-frontend/pull/69)，audit/edhr-dev-audit-paging-probe-20261106→edhr-dev，观察OPEN/MERGEABLE/CLEAN，建议人工合入本轮测试与取证。受测6daaafe9、验收576525f1后仅L0交付登记，实际记录见evidence/delivery-verification.json；登记后再次核对本地/真实远端/PR head及受测运行/测试/契约/知识字节保持。下一轮先fetch实际合入与新代码，按用户实际方案答复或原无依赖队列继续，不自动merge/deploy。

实际完成新28+原134=162/162，0失败/错误/跳过。新28包括12个全DTO/原筛选对照、6个页/排序边界、5个规模宽度、实际JPA offset拒绝、个人目标对象、同时间排序及2个代表性MVCC实验。原型复用真实repository.search、原loadOperatorNames和toAuditLogItem，只在测试调用私有方法，无新增运行入口。无派生关键词时直接数据库分页；有module/menu/dataKeyword文本或offset超过JPA实际int边界时，候选回到原controller，不新增页数/结果上限。原PageResult回显page/size及所有实体属性排序能力保持，未擅缩为只有createdAt。

98个具名只读观察210条业务SELECT，与实际PG execute逐形状/次数吻合；Hibernate写数及具名DML为0。代表性快照另4 SELECT和2个独立连接fixture INSERT分列，非产品写入或所有网络SQL。23个运行输入指纹仍与当前相同，自有PG清理。具体报告见[分析](main-analysis.json)及evidence。

| 代表场景，页20 | 当前controller | 测试原型 |
| --- | --- | --- |
| 匹配5000，较窄事件 | 5001实体加载、2 SELECT | 21实体加载、3 SELECT |
| 匹配1000，每行JSON文本131072字符 | 1001实体、累计252.52MiB | 21实体、累计5.43MiB |
| 同一宽JSON场景单次时间 | 约504ms | 约17ms |

这些为同机单次合成调用线程累计分配/时间，包含Hibernate统计、observer与SessionMetrics日志，不是生产峰值/RSS/p95/SLA。增加的一次COUNT换取不读取/展开整批宽JSON；准确COUNT仍可能扫描匹配项，不承诺全链O(pageSize)。姓名仍按当前页批量，旧N+1修复保持。派生筛选及极大offset回退仍全载，不把有限候选说成完整风险已解决。

实际限制而非现有产品新bug：

本批六个分页边界用例均为正数；非正输入的既有clamp与原page/size回显只做源码核对，未来产品切片仍需补对应运行用例，不能从当前162推断全参数已经覆盖。

- 同时间戳1000行：当前全载切页IDs1..20，而只改SQL LIMIT的第一页是1000..981。两者均只按createdAt排序、同键次序原无保证，不能声称“完全同序”。显式(createdAt,id)测试可稳定两页；生产次排序仍未改，属于需明确的工程选择。
- 当前Spring Data/JPA实际把offset转换成int，超界时拒绝，虽然PageRequest.getOffset是long。新测试真实复现异常；原PR68最大正数超尾页仍正确。候选明确回退旧路径，不恢复溢出、不加新cap。
- 代表性JDBC内容/COUNT两阶段之间在另一连接新增1行：READ_COMMITTED返回原页但总数41，REPEATABLE_READ总数40。它只证明通用两语句视图取舍，不是对实际repository内部COUNT的拦截，也未改生产隔离或DHR业务冻结。一次请求RR不保证跨页请求冻结；并发新增导致OFFSET移动是既有相邻边界。
- 实际调用还包括普通生产表单三个页面，按totalPages以200逐页读完PRODUCTION_EXECUTION审计；不能删总数或把200当完整集合上限。全局/个人/工单/批次调用仍保留。

建议下一有限切片：无派生文本且JPA offset适用时使用真实数据库分页，派生或极大偏移继续原路径；明确同时间ID次排序，并让内容/COUNT在一个请求的同一读取视图中完成。由两个入口均调用public AuditLogQueryService事务代理；不要只在list加@Transactional后忽略/me的self-invocation旁路。查询服务负责筛选、计数、分页和本页姓名；AuditLogPresenter作为无DB纯投影后续小步提取，不先建通用查询框架。DocumentListReadService可参考事务结构，不照搬其page/size回显或资格规则。方案已向用户提出，未答不当批准，未实施。

索引边界：现有created_at、(entity_type,entity_id)、action等不变；直接分页与COUNT的完整实际计划、稳定ID次序的组合索引收益/写放大仍须在最终方案验证。本批未对新完整稳定排序SQL做EXPLAIN，不把原索引代表性实验当新方案索引认证。contains与lower/生产CASE不能简单宣称由普通btree解决。A23上，offset回退有实测依赖拒绝，派生回退有现有语义依据，不能删去当“简化”；无产品新增兜底/吞错/权限削减或推测型配置。

本体not-applicable/FINAL，有限10=8一致/2gap，350知识与0.3.25/schema1.2/P0保持。只读源码及sort/index孩子全部FINAL。全新独立质量在clean候选6daaafe9b4207b8e44b61368ae2ad521d768022a实际162/162、知识89/89、15/15必需项passed/FINAL，无新发现/阻断；98/210与实际分页绑定、代表性4读/2夹具写分列核对，两包227原件及质量228文件校验通过，资源清理。质量源码孩子也已passed/FINAL。见[质量结果](quality-result.yaml)、[独立复验](independent-review.md)。

全部角色及子项FINAL后已实际[PR前漂移复核](pre-pr-drift-review.md)，目标仍f264，无外部增量，运行/测试/契约/知识未改，无任务漂移；后续仅L0验收、台账和交付登记。整文件完成0、历史unique未知；W2余项/W3-W5交叉、W6健壮性/性能/具体拆分/A23含已审、W7增量、931知识/86UI候选/A12/高风险/完整矩阵、历史ZIP/text-ID索引、上传PDFOffice导出容量/UNKNOWN和用户暂停项保持。无真实HTTP/浏览器/生产并发峰值验收，不自动merge/deploy/恢复或查触发CI。
