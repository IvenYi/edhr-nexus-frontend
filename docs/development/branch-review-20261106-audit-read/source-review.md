# 审计读取：只读源码、历史去重与具体方案

本角色只读，未修改产品、测试、配置、知识或数据库，未执行应用JUnit、浏览器、PG规模或索引实验。唯一运行观察是独立Java整数/列表切片探针，不能冒充真实controller或PG验收。固定来源基线为edhr-dev@e69a8f3d97b34fea8737947c780b047bb0310c64，知识0.3.25/schema1.2.0；来源副本与指纹见source-manifest.json。主角色在并行修复分页，源码快照仍从固定Git提交读取，未把其在途修改冒称本角色成果。

## 实际入口与当前权限事实

- 左侧“系统 → 安全管理 → 审计日志”，路由`/system/audit-logs`（router/index.tsx:156–167；constants.ts:274–280），调用GET `/api/v1/audit/logs`。页面默认20条，可选20/50/100/200（AuditLogPage.tsx:82–83）。useQuery的key包含page、size和filters（750–762）；每次筛选输入onChange直接setFilters（787–789、908–915），因此打开、翻页、改大小及逐字输入筛选都可能请求，非仅“查询”按钮触发。
- “个人设置 → 数据审计”第三页签（PersonalSettingsPage.tsx:85、863–872）调用`/audit/logs/me`，按auditPage/auditPageSize续页。后端从JWT滤器设置的userId取当前账户，再限定`entityType=USER_ACCOUNT`与`entityId=currentUser.id`；这是“该用户作为被修改对象”的历史，包含管理员修改该用户的记录，不能改为`operator_id=currentUser`（AuditController:71–107；既有测试356–437）。
- 工单详情（WorkOrderPage:418–424）与批次详情审计（BatchManagementPage:270–275）分别指定WORK_ORDER/PRODUCTION_OBJECT对象，均请求page1,size100，只取content而未续页。此调用方边界不等于后端100条硬上限，也不是人员目录100总数政策；先记录相邻边界，不借此修改用户暂停的生产弹窗样式。
- 当前服务端SecurityConfig:49–55除公开端点外仅要求authenticated；JwtAuthenticationFilter:36–41从有效JWT设置userId属性。AuditController无方法权限注解，全局list和getById没有菜单权限或对象范围检查；前端ProtectedRoute仅检查token存在，菜单定义另有`system.audit-logs`。这些是当前源码事实，不证明全局审计的期望授权政策，也不自动授权本批新增限制或宣告安全全审通过。

## 已知性能风险的去重与增长模型

精确旧ID是 **PERF-AUDIT-LIST-MATERIALIZATION-001**，原文在`branch-review-20261026-w4-lifecycle/findings.md:21–27`，原状态medium/source-confirmed/pending-discussion；同目录structure-plan.md第2项已提出QueryService+Presenter。2026-10-27 NEXT承接、PR66 W5只读方案和PR67后续计划也保留此项。本批是该旧风险的重新核对/待主侧规模取证，不重记成PR67引入的新缺陷；W5-AUDIT-HASH-001是独立写入摘要问题，不能因本次列表审查重开其已解决新行子项或关闭旧历史限制。

AuditController.list:45用`PageRequest(0,Integer.MAX_VALUE)`读取原始筛选命中M条AuditEvent，然后为M条组装DTO，最后按派生module/menu/summary筛选再subList（46–68）。实体包含before/after JSON。返回20条不表示只读20条；即使派生筛选最终零行，映射和补名已发生。增长至少是O(M)实体/DTO工作与M×单条JSON宽度的载荷。M是原始DB筛选后的历史事件数，随日常修改、签署、审批和运行时间累积；不能用公司人数少或单DHR表单<=300来限制M，也不能假设历史会自动删除。

每条映射调用resolveOperatorDisplayName→resolveOperatorAccount（145–167）。最后回退是`"-"`，hasText总成立，故连空操作者元数据也会查询username='-'，不是只有显式账号行才查。相同账号没有请求级去重，缺失账号也无负缓存。application.yml:22为open-in-view=false，源码无query cache配置；JPA一级实体复用也不等于省略findByUsername派生查询。估计是1次事件SELECT加M次姓名查询（个人入口另1次当前用户查询），但这是源码模型，真实SQL/可跳过COUNT/驱动元数据由主侧原生PG观察确认，不能在此写成实测N+1数值。

## 正数分页算术缺陷候选

固定基线66–67行以int计算乘法和加法。独立Java探针原件`IntPaginationProbe.java`与`arithmetic-probe.jsonl`（3行列表）复现：

| 正数输入 | 原from/to | 原结果 | 宽化中间值结果 |
| --- | --- | --- | --- |
| page=1,size=20 | 0/3 | 3条正常 | 相同 |
| page=107374184,size=20 | -2147483636/-2147483616 | IndexOutOfBoundsException | 空页3/3 |
| page=2,size=2147483647 | 3/-2147483646 | IllegalArgumentException | 空页3/3 |
| page=2147483647,size=20 | -40/-20 | IndexOutOfBoundsException | 空页3/3 |

最小建议仅将乘法改为`(safePage-1L)*safeSize`、加法改为`(long)fromIndex+safeSize`，先Math.min到列表长度后转int。int正数输入的最大乘积小于Long.MAX_VALUE，不需新请求上限、总条数上限或通用分页框架。正常页/末页/空数据/边界正数应由主角色在实际controller回归；本探针不替代其测试。非正参数的现有clamp与PageResult回显原参数是另一语义边界，本子项不擅改。

## raw action过滤与显示投影：实际UI差异

全局AuditLogPage.actionOptions:114–134有UPDATE（标签“编辑”），无CANCEL/STATUS_CHANGE；757行把action原样发送。后端repository.search:21先对存储event.action做lower相等过滤；Controller:178–180随后把WORK_ORDER/PRODUCTION_OBJECT非CREATE动作投影为UPDATE。因此原始CANCEL/STATUS_CHANGE事件能在“全部”中显示action=UPDATE/“修改”，却不在全局action=UPDATE筛选中出现。这有实际UI输入，不只是猜测无调用方的API参数。

既有AuditControllerTest:156–170只在无action过滤的mock数据中验证CREATE/CANCEL投影，未覆盖真实repository的UPDATE筛选；test:106–115反而固定了传raw action给repo，不能据此宣称规范要求按raw筛选。生产详情调用不发action参数，所以该处主要体现显示投影，全局筛选可暴露差异。现行rule.production.audit-action-projection要求生产审计统一两类；是否足以明确筛选结果契约由本体角色核原确认裁决，本角色只登记实现差异与调用证据，不修改规则或产品。

## 不能直接把当前页限制推到原始列上的原因

| 展示值 | 现行来源/优先级 | 直接原列筛选或LIMIT的回归风险 |
| --- | --- | --- |
| moduleName | 有非空模块时把系统/组织/安全及相关叶子标签归为“系统”；旧空值按entityType补“系统”或“-” | raw NULL或“组织”等事件会在显示“系统”筛选时漏掉 |
| menuName | 已含·的原值trim后保留；否则由菜单自身normalizeModuleLabel加叶子，旧空值按entityType补父与叶子 | 旧NULL菜单实际显示“组织管理 · 用户管理”等，原列LIKE不等价；未知显式标签也有当前拼接行为，不能只覆盖枚举 |
| dataSummary | 非空原值（不通用trim）→非空reason→派生菜单加`#entityId`→“-” | raw空摘要也会命中用户可见reason/对象摘要；先LIMIT再Java筛选会漏结果且总数错误 |
| action | 生产实体CREATE以外全部投影UPDATE，其他实体保raw action | raw action过滤与投影后类别不同，需先确认/修正语义再完整下推 |
| operatorDisplayName | resolve账号后优先当前UserAccount.displayName；缺失/空名时旧operatorName且不等账号→账号或“-” | 不能直接换成历史operatorName；当前operatorName筛选仍查存储字段，不等同显示现名，此差异应显式保留/讨论 |

`matchesAuditText`用Locale.ROOT lower、keyword.trim和contains，展示字段有各自trim规则。SQL lower/btrim/ILIKE、Unicode空白/大小写及LIKE的%/_转义并非自动等价Java contains；按原字段筛选后分页会改变现有语义。应先固定正反例与旧事件回退表，不以少读数据为由省略这些条件。

人员查找当前是精确username、不按tenant过滤；唯一索引为(tenant_id,username)。未来批量映射须保持现有当前名优先与缺失回退，不应以first-wins掩盖跨tenant同名的多结果异常。完整多租户是既有未决范围，本批不扩张；不加全局/跨请求姓名缓存。`/me`当前用户身份查询是边界依据，不因“多一次查询”删除。

## 可讨论的具体拆分与实施顺序（未实施）

1. `AuditController`保留HTTP参数和/me身份解析，仅调用`AuditLogQueryService.search(criteria,pageable)`，详情按原入口边界读取。不要把原全量+subList搬进新类后称性能已优化。
2. 提取域内纯`AuditLogPresenter`，接收单事件和本请求username→当前姓名结果；承接现有resolveProjectedAction/actionLabel、module/menu/function/summary、source标签及缺失回退。它不能自行查库、读取SecurityContext或使用跨请求缓存。逐字段旧/新对照覆盖全显式/空/遗留/未知值、·、空白、Unicode及生产动作。
3. `AuditLogReadRepository`/查询适配层先保持全部有效筛选（包括派生值）、排序和准确COUNT，再数据库只返回本页，QueryService仅对本页唯一账号分批查名。先前端切页再过滤、固定取100、删除总数都不是等价方案。人员批量读取的单批限制不是总人数/结果上限，超大页面可有界分批而不截断。
4. 可分小批先做请求内姓名复用/批量（仍保全部结果和回退），再做派生筛选完整SQL投影与DB分页；两者均先测并讨论后实施。姓名先局部去重可消除重复账号查询，但不同账号仍线性，且仍全载M，不应把它称整体风险已消除。
5. 如SQL投影与Java presenter共存，必须有同数据全结果/总数/排序/分页对照，避免两套含义漂移；不为本期搭通用规则引擎或改写历史冗余列。新增ID排序tie-breaker、支持的sort字段和COUNT一致读取时点要写清工程边界；不能默默缩小当前合法sort集合或把跨请求分页当冻结快照。

## 索引边界

正式baseline现有audit_event索引：action、created_at、(entity_type,entity_id)、operator_id、snapshot_hash（1824–1832），user_account唯一(tenant_id,username)（2066）。现在Integer.MAX全载削弱了created_at索引在小页LIMIT时可提前停止的收益；repository对entityType/action包lower，普通索引不自动等同这些表达式；操作人/账号/派生文本包含查询也不能靠普通btree解决。

建议只在目标查询原型及EXPLAIN/BUFFERS/排序/临时块证据后考虑：全局默认页的(created_at,id)，对象与/me常用(lower(entity_type),entity_id,created_at,id)表达式组合，以及批量精确username在当前tenant边界上的可用索引。低选择度action不能默认值得单独加；%...%包含搜索即使用lower btree也无通用收益，trigram涉及扩展、短中文词及写放大，不应预先添加。准确COUNT仍可能扫描所有匹配项，只能改善返回/组装/补名和计划，不承诺全链O(pageSize)。不因本入口不用snapshot_hash索引就删除它。当前没有实施任何索引或迁移。

## A23有限结论与剩余

当前分页clamp、可选过滤空串归一、旧事件module/menu/summary/姓名回退有真实请求或遗留数据依据，不为“简化”删除；没有在此发现宽catch把读取失败当成功。Integer.MAX不是有效分页保护。逐行重复姓名查询是可量化冗余候选，不涉及写入资格的新鲜度；优化应消费本请求上下文，不能吞掉真实多结果/DB错误。当前sort和userId异常不在本子项新加通用兜底或权限政策。

本结论不覆盖整个AuditController、前端文件、全部授权或全分支A23；whole-file完成0，历史unique未知。原W2-W7/931知识/86UI/A12/高风险/完整矩阵/历史与ZIP/上传PDFOffice容量/UNKNOWN对账及朋友签名页/生产弹窗样式暂停均保持。主角色负责实际PG规模与代码修复，本体负责规范，最终质量必须由未参与修复的新实例完成。
