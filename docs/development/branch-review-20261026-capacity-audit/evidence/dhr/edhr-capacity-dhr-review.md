# DHR读取容量：有限源码审查输入

作者 `/root/capacity_dhr_source`；只读辅助，不是正式独立质量验收。固定产品 `5259791fcbc5d1fddf04cd62a02d6593d00fe2e6`，实际契约读取HEAD `f1a20247e2d49077eac457912d4ac396ee221182`，knowledge `0.3.25 / schema1.2.0`。本轮decisionPackage为 `DEC-PACKAGE-20261026-AUDIT-CAPACITY-001`。未修改仓库，未运行数据库、Maven、浏览器、查询计数或性能测试，无子实例。本报告所有数量模型均为源码级应用调用模型，不能当作实测SQL数、数据库内部执行次数、客户实际容量、SLA或OOM结论。

## 实际方法与反证

固定Git对象读取了DhrInstanceController、DhrFillingController、DhrSummaryController、DhrReviewController的相关路由，以及DhrInstanceService.list/header/detail、DhrSummaryService.workspace/version/audit、DhrArchiveLayoutReader、DhrFrozenEvidenceIntegrity、DhrEvidenceImpactService和DhrReviewService.detail/锁内比较片段。逐有限范围、blob/SHA、行号见source-map；没有标记整文件或整个DHR模块通过。

* **列表分页的反证成立**：DhrInstanceService.list:185–227把size夹在1..200，执行COUNT和带LIMIT/OFFSET的列表查询。summary row mapper:400–420不再调用数据库。因此该路径不是Java内存分页，也没有每行一次JdbcTemplate调用。productionStatusSql/displayStatusSql和terminationColumns包含相关子查询，但在同一应用SQL语句内；是否被优化器重复执行、索引和代价如何，必须另以实际EXPLAIN判断，不能冒称网络层N+1。
* **当前详情也不是逐表单查库**：detail:268–280一次查询该生产对象全部实际表单，回调只构建JSON；目录分组在内存完成。DhrArchiveLayoutReader的元数据读取次数依DRAFT/冻结状态变化，不是F条表单各查一次。当前详情确实全量承载snapshot/values，成本随F及字节规模增长；这有完整证据可见性的业务依据，不可用随意LIMIT或只保留COMPLETED记录来优化。
* **历史读不混入当前正文**：DhrSummaryService.version先调用header而非detail，按dhrId+versionId读显式冻结版本，校验独立冻结证据；实时变化只放evidenceChanges。完整性校验是真实调用路径，不可因性能直接删掉或用最新模板/当前表单正文替换冻结正文。
* **冻结完整性检查自身不是N+1**：DhrFrozenEvidenceIntegrity.verify一次读该版全部独立证据行，再一次读版本构造摘要；for循环内执行哈希/JSON一致性比较，没有逐行JDBC。完整集与摘要成本为线性字节处理，不等于性能缺陷。

## 增长模型（假设，不是客户承诺）

| 变量 | 含义与增长来源 | 对应读取 |
| --- | --- | --- |
| D | 累积DHR/生产对象数量 | 列表COUNT、过滤与排序；查询计划待测 |
| P | 当前列表页长，现代码1..200 | 列表返回有界；SELECT*还传输未用于summary的context/directory文本，需测宽行影响 |
| F / Fc | 选定冻结版证据数 / 当前对象实际表单数，目录、作业及自定义多份逐实例累积 | 历史比较、当前详情、完整性校验；不能通过同模板合并来减F |
| B / S | 每份snapshot+values平均字节 / 当前版本冻结JSON总字节 | 解析、序列化、摘要、网络与内存；数量相同也可能因动态行/字段而差异很大 |
| V | 同一DHR正常修订形成的版本数 | workspace一次读取版本元数据和对应审核结果；未测实际增长上限 |
| A / A0 / s_k | 当前有效附件数 / 冻结附件数 / 第k个原件字节 | 实时变化比较按附件匹配并读取文件计算摘要；现业务单文件50MiB边界不等于整个DHR或请求总量边界 |
| R | 同时/重复打开历史或审批的请求数 | 前述查询往返与文件IO重复；本轮未做并发/吞吐测量 |

合法存在且完整性通过的单次DhrSummaryService.version路径，按源码直接JDBC调用可分解为：header1 + 冻结version1 + integrity2 + reviewOutcome1 + changes(F+4) + placements1，即 **F+10**。这是应用层调用模型，不含数据库内部子计划、驱动行为、连接和执行计划测量；异常/缺失分支会提前退出。只关注changes自身时是F+4，不应把F+10误归为changes实测值。

## PERF-DHR-EVIDENCE-NPLUS1-001

状态：`pending-discussion`。证据级别：`static-path-confirmed / runtime-pending`。建议风险优先级medium（规模条件下的放大风险，未证实生产故障；不据猜测升级high）。关联链：`DHR frozen/current evidence impact projection`。

**真实入口与必经条件**：GET `/api/v1/dhr-instances/{id}/summary/versions/{versionId}` → DhrSummaryService.version:81–125。在版本存在并通过冻结完整性校验时，113行必调用impacts.changes(versionId,false)，不存在可选开关或该路径的请求缓存。DhrEvidenceImpactService.changes:27一次读F条独立证据；29–46循环内，32行按每个source_record_id调用jdbc.queryForList读取当前snapshot/values/status/version。47、51、56行再读版本/对象当前成员/附件。合法版本存在时该方法直接JDBC读取模型为 **F+4**，F=100/1000/10000时对应104/1004/10004次源码调用，而不是此处已实测这些SQL。

**影响与反证**：ID查询可能走主键索引，但索引不能消除F次串行应用往返；不存在ORM懒加载造成误判，此处是显式JdbcTemplate循环。所有实际证据必须比较，不表示每份都必须单独取数据库。已有frozenRecordIds HashSet复用成员身份，不能据此说整个实现没有复用。缺失当前记录也要保留变化提示，不能inner join后静默丢失。

**可讨论选项**：将本次版本涉及的当前记录按tenant及完整ID集合批量/分块加载为map，保持缺失/无效JSON/版本及状态差异语义，再完整逐实例比较；记录真实SQL次数与返回字段/加载量。比较仍覆盖F条，但期望将往返数量与分块数而非单条数关联。不要以saveAll或新缓存名字代替实际测量。

**必须保留**：完整冻结成员、独立快照/版本摘要校验、tenant范围与当前成员新增/丢失检测；lock=true用于审核写事务时必须按原锁和最新性要求重新查，不能复用之前查看页面的结果。批量FOR UPDATE的顺序、锁范围与并发影响需另审。不得把已做字符串ID/目录投影的响应DTO直接代替用于冻结摘要的原始持久化内容。

**下一步验证**：隔离原生PG构造不同F且含缺失/变更/非法JSON/新实例的真实版本；记录应用查询数、查询计划、字段字节及响应一致性。性能选项讨论后才决定是否改码，本轮没有实现或验证优化。

## PERF-DHR-REVIEW-REPEAT-001

状态：`pending-discussion`。证据级别：`static-path-confirmed / runtime-pending`。建议风险优先级medium，关联上条同一证据比较链；两条记录不是两份互不相关业务缺陷，也不能把其成本重复相加再称总覆盖。

**真实入口与必经条件**：GET `/api/v1/dhr-reviews/{taskId}` → DhrReviewService.detail:75–83。requireTask及当前候选/已处理资格通过后，78行调用summaries.version（该方法113行已把changes计算结果放入evidenceChanges），80行又调用evidenceChanges；149–150行委托同一个impacts.changes(versionId,false)，并覆写前一次结果。代码没有对已算结果进行条件复用。故合法读取中影响比较部分执行两遍，源码模型为 **2×(F+4)**，并非整个HTTP端点的总SQL数；任务权限、资格和冻结校验等额外调用不在该模型中。

**附件IO/内存子项**：同一changes方法58–73遍历当前附件，每条再线性扫冻结附件（匹配最坏O(A×A0)）；未先判不同且验证状态为VERIFIED的附件，65–69会Files.readAllBytes读取完整原件并计算SHA256。两次changes意味着这些匹配/实际文件读取也可重复。每轮文件读取总字节随Σs_k增长，单次完整byte[]分配随最大单文件大小增长；不声称同时保留所有文件内容或已经OOM。单文件上限50MiB并不消除多次读取或并发请求的成本。

**反证与约束**：比较前会跳过元信息/核验状态已不同的附件内容读取；缺失文件或读取/摘要异常标记变化，不是吞掉后判一致。文件核验服务于证据保护，不能把它当无意义IO。两次读取可能处于READ_COMMITTED的不同读取时点；仅凭重复代码不能擅自决定新的读一致性政策。

**可讨论选项**：只读同一请求明确采用一个比较时点时，复用version已生成的comparison结果，避免再算一次；不跨HTTP请求或审批动作缓存。另将冻结附件建ID索引、将文件摘要改为有界缓冲流式读取以保留同样SHA256验证。审批act:86–119在锁内独立fresh changes(versionId,true)及其他文件验证必须保持；不能为了重用只读结果跳过写动作校验。先定义读接口一致性边界并用故障/并发/同内容探针验证，再决定修改。

**下一步验证**：在原生库/隔离文件目录下记录两个changes调用及每文件实际读取次数；对不同A、文件大小和并发R对照分配/IO/延时。该模型只是静态风险证据，没有给客户容量或SLA判定。

## 其余容量观察与未来审查范围

当前detail把每份证据放进目录或unmapped，再按来源聚合相同JsonNode引用；后续JSON序列化会在两个输出位置出现内容。这不表示Java中已深拷贝两份整树，也不表示证据应重复计数。workspace的candidates也是取既有对象引用。响应体/序列化大小随F×B增长，属于之后量化/接口兼容讨论，不能随意删字段或限制完整证据集合。本报告仅把它列为规模维度，未另开第三条风险。

DhrSummaryService.audit:143先调用完整detail，随后auditPage执行COUNT+LIMIT50。仅看最终审计页50条无法证明上游加载有界；是否应将任务/对象资格和必要完整性预检与完整正文组装分离，需要另核实际业务和权限约束，未直接推荐删除预检。DhrReviewController.audit/attachment下载也先经过service.detail，按注释承担任务授权解析，不可直接绕开。它们是后续专项清单候选，不把本轮读到的片段冒称已闭环。

建议主审完整矩阵覆盖：嵌套集合乘法与数据倾斜；宽JSON与响应重复序列化；数据库往返与应用CPU/文件IO分开计量；完整性/校验成本与可避免重复分开；分页前授权/过滤/计数的语义一致；COUNT/深OFFSET及相关子查询执行计划；单文件限制与请求/并发总量区别；超时、取消、连接池/线程池及资源释放；批量锁顺序与回滚；同请求、同事务、跨请求缓存的身份/版本/失效边界；完整与部分导出不能混淆。以上是后续审查维度建议，不是已实际检查通过项。

## 范围与最终状态

已有DEC0063-02/04/05、rule.dhr-summary-freeze-version及用户确认资料要求完整实际证据和显式冻结版历史。上面只是用它们约束优化选项，没有产生新的逐ID本体语义审查记录或改知识成熟度。未触碰记录控制未实现、两项DHR high/A12、TaskDetail暂缓安排；不关闭旧问题、不恢复数据、不部署或合并。没有发现需要本轮直接改业务政策的依据。

本辅助工作FINAL。两条性能风险保持待讨论，运行测量待主审后续安排。交付完整源码原件收据和有限范围地图，不提供qualityResult passed或整模块验收。
