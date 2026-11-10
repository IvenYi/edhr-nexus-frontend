# 审计读取：有限数据库分页候选的只读源码评估

正式结论：**completed / FINAL**。固定源码/目标基线`f2646c9a098291883434b7e6a7db628fe631ebd6`，知识0.3.25/schema1.2.0，契约按该提交实际读取。PR68姓名N+1、分页算术和生产动作筛选已有实现；本角色只核本批“事件全载”后续方案，没有修改仓库产品、测试、配置或知识，没有执行产品JUnit、PostgreSQL、HTTP、浏览器、EXPLAIN或CI。安装依赖的`javap`是静态字节码检查，不能当成运行验证。源码副本来自固定Git，当前未提交DP单独标来源；子项全部正式FINAL，原件已完整复制。

## 1. 有限路径有源码依据，但不是任何输入都能直接换PageRequest

`AuditController:49–72`现读全部基础SQL条件命中的AuditEvent（含前后JSON），对事件运行三个派生过滤，再切页、批量读本页姓名及组装原DTO。姓名已经不是M条逐个查询，不得重开已解决N+1或把新风险记成PR68引入。

当moduleName、menuName、dataKeyword三项都**没有StringUtils.hasText**时，`matchesAuditText:112–115`立即true，没有需要在分页前计算的这三类派生匹配。因此候选可复用`AuditEventRepository.search:16–48`原五个有效基础SQL条件（entityType、entityId、action、operatorName、operatorAccount），末三个派生参数仍传空串，在数据库切页后沿原页内姓名与DTO。任何一项有文本时继续原controller路径，不能先LIMIT再Java过滤。应使用完全相同的hasText判断：U+2000等空白与NBSP不是简单ASCII trim的同一边界；也不能把原姓名SQL LIKE的%/_语义改成Java contains或擅自转义。

这是固定数据集上的有限等价条件，不是完整候选运行通过。其前提还包括支持的offset、总数与内容读取视图、并列顺序及原分页元数据，具体如下。

## 2. 已证的依赖限制：JPA分页offset是int

真实安装依赖Spring Data JPA **3.3.0**。`ParameterBinder.bindAndPrepare`字节码调用`PageableUtils.getOffsetAsInteger(pageable)`再`Query.setFirstResult(int)`。后者当offset > 2,147,483,647时抛`InvalidDataAccessApiUsageException("Page offset exceeds Integer.MAX_VALUE (2147483647)")`；PageRequest.getOffset返回long并不能绕过此限制。原件在`dependency-bytecode/`，jar路径/版本/SHA和实际命令在dependency-evidence.json。

这不是当前产品新缺陷：PR68当前long中间运算能让Integer.MAX_VALUE/20等正数超尾页返回空页。若候选无条件`PageRequest.of(safePage-1,safeSize)`，会把已修边界重新变为异常。原型必须验证库拒绝及保留语义的处理。可讨论的有限处理包括：超JPA offset时继续当前路径；或者先准确COUNT确认超尾后直接空页（仍保留原page/size/total），对真实超大且非空offset另用支持long参数的查询。不能为避免库异常新增请求总页数/结果上限、把offset强转int，或凭小型夹具认定任意超界请求必然空。

当前Controller只对运算用safePage/safeSize，`PageResult.of:33–42`仍回显**原page/size**，totalPages也按原size计算；非正输入现有行为不能照抄别的页面的“回显规范化值”而静默变化。普通页、最后页、空匹配、超尾、最大正数及既有clamp都需真实对照。

## 3. 准确COUNT有成本和事务边界

安装的`JpaQueryExecution$PagedExecution`先getResultList，再用`PageableExecutionUtils.getPage(content,pageable,countSupplier)`。count不是必然执行：首个未满页可从content.size推断，后续非空未满页可从offset+size推断；整页和超尾空页等可执行真实count。普通完整小页可能从当前“1事件+1姓名”变成“1事件+1COUNT+1姓名”，读取实体/JSON却大幅减少。只比较语句次数、或者声称所有页固定三次，都不准确。

Repository未指定单独countQuery，需主侧原生验证自动生成COUNT保留完整原WHERE及参数，尤其生产动作CASE、空白规则及姓名/账号contains，而不能仅凭返回Page类型宣布等价。

当前AuditController、AuditEventRepository.search没有显式@Transactional，application.yml:22关闭OSIV，未发现本路径请求级隔离配置。声明查询也不能仅因继承JpaRepository便推断它像SimpleJpaRepository基础CRUD那样拥有同一只读事务；依赖的RepositoryAnnotationTransactionAttributeSource原件显示它按具体方法/声明类/目标方法注解寻找属性。这里没有请求级“内容+COUNT同一视图”的源码保障。实际连接隔离仍应由主侧SHOW或隔离实验确认，不把PostgreSQL常规默认READ_COMMITTED写成已经观测生产配置。

在READ_COMMITTED下，即使两句处在同一只读事务，二者也可能看见不同已提交新增；readOnly并不等于REPEATABLE_READ。RR可作为单请求内容/COUNT相同视图的工程候选，主侧代表性两语句实验应明确不是已改真实controller，也不证明跨请求翻页冻结。RR不是SELECT FOR UPDATE，仍需量化读事务持续时间和MVCC保留成本，不能由“无行锁”推断零开销。

**未来注解边界要特别保留**：`listMyProfileLogs:83–95`在同一Controller内直接调用list。若只在list上加Spring代理@Transactional，/me的self-invocation不会经过事务代理；给private辅助方法加注解也不能解决。未来应由两个入口都经明确public查询Service代理，或让各入口都覆盖所需事务；本批不要求实现。若希望名字仍按当前阶段独立补全，应明确RR覆盖事件内容/COUNT还是也包括姓名，不宣称“当前显示名称”的未确认瞬时新鲜度政策已定案。

仓库已有`DocumentListReadService.read:34–45`的readOnly+RR、先COUNT、long offset超尾返回空及native LIMIT/OFFSET结构，也有FormInstanceQueryService/FormWorklistService的显式RR。它们可作工程结构参考，不能复制其租户/权限、页号协议、页大小上限或响应clamp到本审计入口。

## 4. 排序与实际续页调用方

只读sort/索引子项的30固定源码与报告在sort-index-role/。四个主要入口均使用默认或显式createdAt/desc：全局审计页不发送sort/order，个人显式发送；工单/批次省略。Controller:46–49仅接受一个String sort直接交Sort.by，没有唯一次序和字段白名单。现有映射实体属性不止createdAt，不能因UI暂没用而缩窄既有合法实体属性排序；DTO的operatorDisplayName/operationTime/actionLabel并非直接JPA属性。没有白名单不等于任意字符串都成功，也不自动构成SQL注入。

created_at非唯一，新自动事件还按微秒封存，不能假设不会并列。原全量排序与LIMIT/OFFSET可能换计划，对并列记录无唯一顺序保障；时间全部唯一的对照不能证明一般数据等价。保留主排序并追加唯一id是工程候选，应明确是给原未定义并列顺序补规则，包含其他非唯一/可空排序及主排序已为id的情况，不能伪称原业务已有决定。

这是实际调用依赖：FormFillingPage:140–147、FormReviewPage:97–104、FormInstanceListPage:173–180按firstPage.totalPages，以200条分批拉全PRODUCTION_EXECUTION审计。准确总数、无新增截断和翻页无重复/漏项不只影响全局表格。即使单请求RR+唯一排序，并发新插入仍会移动下一次OFFSET页；不要把它称跨页快照。生产弹窗样式仍是用户暂停项，不借本审查修改。

## 5. 索引及A23/具体拆分

canonical有PK(id)及action、created_at、(entity_type,entity_id)、operator_id、snapshot_hash五个btree；0092只加hash版本列。只有DDL结构事实，没有本角色EXPLAIN。真正LIMIT使created_at顺序索引有机会提前停止，但COUNT、低选择度动作CASE、lower(entity_type)、%...%文本、JSON或其他主排序仍可能扫描/排序较多数据。created_at单列与独立PK并不自动组成(created_at,id)组合顺序；当前普通复合索引也不等同lower(type)表达式索引。是否新加组合索引需完整查询/COUNT、分布、写放大和重叠证据，不能由此静态分析直接添加或删除。

最小候选的hasText资格分支、必要JPA offset处理、空页跳过姓名和同页重复账号失败都有具体依据，不属于无证据过度防御；不能用A23删除它们。不要添加通用catch后返回空结果、固定取100/200、跨请求缓存、额外权限兜底、任意sort缩窄或通用动态查询框架。

若后续两个查询路径和事务使Controller职责继续增重，具体小批拆分为：Controller保留HTTP参数与/me身份解析；`AuditLogQueryService`作为两个入口都调用的public事务/查询编排点，持原筛选、排序、总数和路径选择；`AuditLogPresenter`只收事件及页内姓名上下文，承接原模块/菜单/动作/函数/摘要和姓名回退，不查库、不读SecurityContext。姓名读取仍是单请求、500参数批次；生产资格和历史来源不移交纯Presenter。先局部证明候选，再按实质复杂度拆分，不为统计行数搬类、不一次性大重构。

## 6. 结论与范围

有限候选在明确上述边界后值得原生量化，当前**没有新确定性产品缺陷整改结论**，JPA offset是候选限制而非现有产品失败。沿用PERF-AUDIT-LIST-MATERIALIZATION-001事件全载子项，不重复计新风险；未来无派生筛选路径成功也不能关闭派生筛选全载、宽JSON/全COUNT或所有数据库成本。

本角色原始证据为固定Git源码、安装依赖静态字节码及子项固定快照；旧报告只作去重导航，已回到当前源码。主侧将实际执行的PG/测试不由本报告冒称；产品方案仍待实际讨论，merge PR68不构成数据库分页/索引授权。姓名搜索、全局权限、多租户政策缺口及W2-W7/931知识/86UI/A12/高风险/历史ZIP/容量/UNKNOWN/A23含已审代码/暂停项保持，整文件完成0、历史unique未知。
