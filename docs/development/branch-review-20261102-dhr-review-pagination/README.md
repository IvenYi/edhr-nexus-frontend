# DHR个人审批查询与索引

L2；已fetch实际目标`edhr-dev@1ad6300918bd0059049eab3c415ca31162dd5115`。PR50仍OPEN，未改其分支；本批从最新目标建立`audit/edhr-dev-dhr-review-pagination-20261102`，只实现用户明确同意的DB筛选/计数/分页及索引评估。

当前全新独立质量对clean `b07fc1ca5dd7e4a37b2584c19377495b86b5536a` 正式passed/FINAL、13/13必需检查，单次146/146及另一次知识89全过；最终整类同源旧1条真实断言红、0error/skip，11组索引计划和迁移/安装路径复验、87份原件归档。[正式报告](evidence/final-quality/quality-review.md)、[验收](acceptance.json)及[原件映射](evidence/final-quality/archive-map.json)留证。全部正式角色FINAL后已实际向用户完成[PR前范围/漂移/阶段沟通](scope-review.md)，可合入有限查询/索引整改，不代表全审结束或发布认证；受测后仅L0归档/验收/交付，保护路径保持。下文主侧阶段数不替代最终独立结果。

列表一条SQL完成原权限筛选、字面关键词、准确总数及当前页，保留空页总数和一次读取快照。轻投影不读取未使用大字段。旧同源反证1条真实断言红：5309条任务/个人21/页20时84次SQL、5309行；新1次SQL、20行，结果不变。候选/已办、Unicode与分页边界由实际PG及旧Java oracle比较，不用ADMIN或模拟JSON函数替代。

两项部分索引证据和边界见[index-boundaries.md](index-boundaries.md)。实际5万DHR历史+10万其他业务任务下，待审小索引及大量个人已审的ID顺序索引各有收益；原assignee/status/instance/GIN仍保留。CONCURRENTLY独立changeset含ICU root前置，升级/回滚/重放实际验证。5万同时待审仍有候选JSON CPU成本，不称全部规模已解决。ICU与深页/准确COUNT/关键词索引边界明确留证，未部署。

主侧最终单次143/143通过（原生PG99、完整应用26、相邻18），另一次数据库基线3/3通过；先前142/轻投影后98及其他重跑不加总unique。本体r2 NA/FINAL，14ID=12有限一致+2旧gap、330知识未改、原89实际通过。两轮夹具约束错误、辅助元数据错误、Liquibase重载编译错误及旧树vite前置失败均保留原件，不算产品红控或通过。初始编译失败汇总脚本曾收集旧XML，原汇总注明无新执行，最终命令按XML时间戳校验新结果。大XML/log可逆gzip保存，原始解压字节/哈希与存储哈希分别记录，不清洗空白。

H2四条列表断言迁至原生PG矩阵和完整应用真实退回重提批准列表验证，原流程/签署/冻结断言保留。测试层次、源码和A23具体判断及后续拆分见[review-notes.md](review-notes.md)。固定目标清单只盘点；整文件完成0，历史unique未知。既有666/44/183增量、A23旧856+feature1/SQL130+新4及全部历史队列继续W6含旧已审/W7，当前新迁移与改动另入队，不用本批局部通过关闭。

两旧DHRhigh、外部质量事实与全部普通权限/UI/账号/收件人矩阵保持open；朋友任务签署页与生产弹窗暂缓、ACL三问、文件一致性、A12/四gap不自动关闭。不自动merge/deploy/恢复，不查询或触发CI。
