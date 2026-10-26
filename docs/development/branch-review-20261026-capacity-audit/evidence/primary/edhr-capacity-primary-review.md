# 引用候选与执行上下文：主审有限源码核对

固定5259791fcbc5d1fddf04cd62a02d6593d00fe2e6，知识0.3.25；作者/root。实际范围和Git/blob/SHA见source-map。没有运行本链浏览器、HTTP/DB查询计数、执行计划、CPU/内存或时延测试，不能把以下静态结论改称规模实测。没有产品/测试/知识/数据库修改。

## 已查反证与正常实现

FormReferenceLookup.search已有SQL LIMIT：非分页调用100条，分页size夹1..100，额外取1条判断下一页；没有把候选全量载入Java后切片。FormReferenceController和ProductionExecutionController的分页参数实际传递到同一lookup。深OFFSET、LOWER包含查询及用户部门相关子查询仍需以执行计划测量，不能据搜索表达式直接声称生产故障。

query/appendScope/conditionValue采用白名单列及绑定参数；存在上下文中的引用展示属性不等于可信的服务端资格依据。按物料类型校验目录状态、引用条件从真实对象取值、reason保存FOR UPDATE等重查有业务原因；不能看到已有字段就直接删SQL。find/cache key若评估复用须包含来源/配置/条件值、真实对象/版本/租户/资格边界，不可只按id缓存。

ProductionExecutionService.view已经用creatorNames.computeIfAbsent按创建人去重，不能声称for中每份表单都单独查询同一创建人。ProductionOutputService.read采用一条包含JSON聚合的JDBC语句，不是应用端逐条SQL；但仍可能返回和解析大量数据，具体计划/加载字节尚未观测。

## PERF-EXECUTION-REFERENCE-VIEW-001

分类performance-risk，建议medium、证据static-path-confirmed/runtime-pending、状态pending-discussion。范围为生产执行表单引用搜索，不是用户暂缓的TaskDetail页面。

真实入口：GET或POST /api/v1/production/execution/{id}/references → ProductionExecutionService.references → get(id) → view(...)。先构造完整执行详情，再从snapshot.operations找到目标operation/form/field，最后调用access.references的有界候选查询。

view读取/解析整个执行snapshot和state，投影表单创建元数据、按创建人缓存名称、判断可变资格及完整性，调用outputs.object读取全部正式来源构造产出/质量摘要；随后遍历全部工序及表单份，生成数量/质量、start/completion问题及field controls。生产表单工序O、每工序表单/副本F及动态行R/正式来源P增加时，单次只需某字段引用候选的请求仍负担这些无关完整详情计算；用户每次搜索/翻页都会再次触发。实际成本与合法业务规模有关，尚未测总SQL、CPU、响应时间、堆峰值或并发容量。

反证：候选列表本身已SQL限量；view没有证据显示持久化修改，不能声称搜索会改业务；创建人局部map已复用，一条聚合SQL与大量应用SQL不同；没有发现跨HTTP请求缓存，因此不能宣称缓存已经造成旧授权。首次未开工或配置失败路径和存在执行的路径成本不同。本风险只选合法存在且具有冻结配置的执行来源路径。

可讨论选项：提取用于引用查询的窄执行上下文读取，只取得可信的对象/工单/冻结执行配置、目标field和适用资格，保持原权限、字段配置、来源范围、conditionValue服务端复验和历史版本身份；避免生成完整展示用产出/质量/所有工序按钮控制。先做功能/权限对照与不同O/F/R/P规模观测，再决定实施，不在本轮改API或缓存。若有同请求重复依赖读取，可讨论有限生命周期的上下文map；不能跨请求信任前端带来的context或省略锁内授权。

下一步证据：在隔离PG构建不同合法工序/表单份/正式来源规模，记录一次reference HTTP请求的SQL/加载行和字节及完整view调用；与保持同资格的窄读取候选对照。当前没有实现候选方案，不能宣称性能已修或业务回归通过。
