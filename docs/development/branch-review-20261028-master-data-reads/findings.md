# 本批发现、反证与处置

基线`bbd2ff88886ade456aac8d7d73f8af4f5c1575e2`。性能风险先讨论，以下没有被实现为查询、缓存、索引或限制变更。本批不宣称产品无缺陷或容量通过。

## 已纠正：两处知识实现锚点

`fact.catalog.equipment-purchasedateisfuture`原定位`purchaseDate(LocalDate)`，实际控制器接收`String`并解析日期，改为准确`purchaseDate(String)`。`fact.catalog.material-typename`原指向不读取物料类型的`ProductProcessResolutionService`，改指实际`ProductProcessController.materialTypeNames()/isProductMaterial`和已有相符证据。只改sourcePath/sourceLocator/evidenceIds中受影响字段；规则含义、字段类型、可用阶段、历史日期、状态、知识版本0.3.25不变。原始业务依据及合理性由本批逐ID报告核对，不因锚点错误否定原政策。

## PERF-EQUIPMENT-ASSOCIATION-READS-001

状态：runtime-observed / pending-discussion。路径为`EquipmentController.categories/types/list → categoryResponse/typeResponse/equipmentResponse/categoryName → 三个repository`。

设备数E随单台设备登记增长；类型T、分类C随配置增长；分页大小P当前服务端限制至200（既有工程限制，不是新业务政策）。100设备的实际JWT/MockMvc/Hibernate/H2观察：

| 请求 | 返回规模 | SQL条数 | 实体加载 |
| --- | --- | --- | --- |
| 设备列表size=5 | 5台 | 12 | 设备5、类型5、分类5 |
| 设备列表size=20 | 20台 | 42 | 设备20、类型20、分类20 |
| 类型列表size=5/20 | 5/20类型 | 7/22 | 类型5/20、分类5/20 |
| 分类列表6/21分类（含1空分类） | 6/21分类 | 7/22 | 仅分类6/21；类型count不加载类型实体 |

设备列表同1类型/同分类与各设备不同类型的两组结果均12/42。`open-in-view=false`与实际应用一致；读取方法无包围整个映射的事务，各repository调用的一级缓存没有跨这些调用抵消查询。此路径确有随P增长的关联查询往返；类型列表亦逐行取分类，分类列表逐分类count。

反证：设备及类型主列表确实数据库分页，有稳定id次序，未全量加载E；分类count只统计，不应误写成加载全部类型。P有200上限，默认三类常使分类路径规模小。未测PG计划、网络时延、CPU/堆或客户并发，不能由42条SQL推算用户等待秒数或OOM。

候选方案：页内收集type/category IDs批量读并只在本次请求复用映射；分类类型数用按category聚合的查询，保留空分类0及租户/历史缺失名称语义。代价是额外只读DTO/查询及缺失关系测试；不得为了减少查询删掉类型/分类展示或扩大租户范围。先获实施方向，再用原生PG比较查询数、加载量和计划；不引入跨请求缓存。

## PERF-MATERIAL-TYPE-DIRECTORY-RELOAD-001

状态：runtime-observed / pending-discussion。`ProcessModelingController.listMaterials → matchesMaterialKeyword → matchesMaterialTypeName → materialTypeNameMap → materialTypeRepository.findAll`。`materialTypeName`是瞬态字段，在筛选前未填充；每个需要类型名判定的版本都重建完整目录，筛选后enrich又读取一次。

N=所有加载的物料版本，T=类型目录大小。N=100/500、T=2、size=5：按类型筛选分别102/502条SQL；物料实体加载100/500，类型实体累计加载202/1002。筛选返回50/250组中的5组。类型目录SQL成本随N增长，类型实体加载约(N+1)×T；这不是数据库内部相关子查询。

反证：无类型条件且无关键字时仅2条SQL。keyword先命中每行名称“物料”也仅2条；keyword只命中类型名“原材料”则102条。不能把所有物料查询都写为无条件N+1。T=2合成数据不代表客户目录规模，未测PG计划/生产延迟。

优先候选：每次列表调用只加载一次可信类型目录，显式传给筛选及响应enrich；保留名称/代码关键字短路、null类型、类型名匹配、现有分组前筛选顺序。代价是一份请求范围map，不能变跨请求缓存。它可以先于分页改造独立处理，但当前尚未实施。

## PERF-MATERIAL-VERSION-MATERIALIZATION-001

状态：runtime-observed / pending-discussion。`listMaterials`先`materialRepository.findAll`、过滤/排序、按code+name组装全部版本，再按组截取；`listProducts`亦全量加载物料后过滤并截取版本列表。

100/500个物料版本、size=5、不带筛选，均只执行2条SQL，但分别加载100/500份Material。不是SQL N+1，风险为宽版本行加载、分组、排序和中间集合随总历史增长；小返回页没有限制数据库读取量。原生请求可同时发生，用户未确认的版本/物料数量上限不能假设存在。

反证及保护：分组页的每一组包含完整versions；本批6版本合成数据实际4组、size=1时第一组仍含V10/V2/V1三个版本，产品派生也保留真实物料版本ID。因此直接对版本行加LIMIT会截断一组，可能破坏最新版本/有效版本数/聚合状态；不能这样优化。既有按code定向查询用于写侧分组读取，不应误报所有物料写路径都findAll。

候选方案：先明确保持现有筛选前后顺序与code+name分组、组状态及组排序；数据库先选组键/聚合页，再批量取该页完整版本，或按受控字段建立专用只读查询。复杂度与一致视图成本高于前一项map复用，需单独设计并验证筛选、状态、同值排序、跨页、时间边界及空组。暂不承诺索引足以消除全量实体加载。

## 保存宿主：补证与剩余交互边界

新脚本实际渲染`TemplateModelingPage`，经过公开“展开版本→设计”入口、真实TanStack mutation与`saveFormTemplateVersionDesign`/axios；只替换子设计器以发出受控payload，并拦截HTTP完成。6场景覆盖main/field各自正常、关闭A重开B后A成功/失败。

实际A请求始终发送至`.../form-templates/3001/versions/4001/design`，三段payload来源均A；重开B后没有额外B请求。A未结束时，父页共享pending使B的保存暂不可用，完成后恢复。本证据不能支持“旧请求会自动改存B”的指控，也不能把PR40 Shell局部busy独立看作父页pending已释放。

同时实际观测到A完成时，B界面仍能看到泛称“设计已保存”“字段已保存”或A的失败提示，未标明目标对象。登记`UX-DESIGNER-HOST-LATE-FEEDBACK-001`为已观测的反馈归属风险，尚未决定提示关联对象还是仅在原会话显示；没有证据证明B已保存，也不以此批报告承诺该交互已整改。后续若处理，应绑定请求目标/会话并保留真实失败可诊断性；不得取消已发出的服务器事务。完整main/autoSave并发顺序、真实子设计器及后端持久化联合链仍未验证。

## 待复现的相邻健壮性候选

- `CAND-MASTER-DATA-PAGING-OVERFLOW-001`：ProcessModelingController.toPagedResult及ProductProcessController.listProducts的int乘/加可能溢出。仅源码候选，下批用合法正整数API边界构造复现，明确受影响调用后小批修复；不能由PR23任务分页已修推定这里已修。
- `CAND-MASTER-DATA-VERSION-NUMERIC-001`：compareVersion用Long.parseLong读取版本数字段，需先证明正常写入口接受超long数字版本及实际列表触发，不能仅凭出现parseLong定bug。

## 具体拆分建议（未执行）

1. `EquipmentReadAssembler`：输入当前页设备/类型、请求内type/category映射，输出既有response DTO；不拥有写锁、状态和审计。查询由设备只读服务按页收集引用执行；controller只处理参数/权限与响应。收益是显式关联上下文及查询成本；保护同/异类型、缺失/旧分类、空分类0、排序分页、租户与既有CRUD回归。回滚可恢复原mapper，不动schema。
2. `MaterialListQueryService`：拥有只读列表编排；输入现有筛选/排序/组页参数，输出原PageResult<MaterialGroupRecord>。把纯版本比较/状态/组装交给`MaterialGroupAssembler`（参数含类型map和统一查询时点），先不接管写侧多版本同步、审计和冻结。保护多版本完整性、有效期边界、筛选阶段、组顺序/身份与产品派生；收益是让完整分组与查询策略可独立验证。禁止把整个ProcessModelingController机械搬进同样大的service。
3. 保存宿主未来若处理反馈归属，在父页保存命令变量中携带实际target/context，由mutation消费并反馈；Shell仍管文档/会话，store仍管历史。保护关闭重开、成功/失败、真实URL/payload及共享pending，不引入全局任务框架。当前无必要为六个观测场景抽取产品hook。

## 验证限制与失败原件

H2探针使用真实上述读取repository及JWT/filter/controller；未用的其他controller依赖为显式mock，不据此认证它们。16测试产生17条观察（分组/派生同一测试两请求），二者不相加。SQL计数仅记录，不用断言把现有低效行为锁成未来标准；可选审计探针须显式启用，运行命令没有跳过。

首轮16中2失败是探针误写响应字段`typeCount`（真实`count`），修正为准确契约后同16全过；原JSONL/日志保留。浏览器首轮错误点击名称进入详情，产生未配置审计GET，6项均夹具阻塞；纠正为真实展开按钮后同6全过，未改产品或隐藏异常请求。首轮不算产品红或修复成绩。

没有本批PG、真实后端浏览器持久化、堆/时延/容量、完整移动端/a11y、生产迁移/部署证据。旧strict19、ESLint缺配置未由本批消除；本批未改frontend/src，不重复声称全局静态通过。TaskDetail、生产弹窗设计、记录控制相关DHR high/A12、四旧知识gap及其他性能/结构候选保持。
