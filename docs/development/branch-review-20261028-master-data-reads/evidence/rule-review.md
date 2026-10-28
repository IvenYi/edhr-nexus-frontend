# 设备与物料读取：本体有限审查

正式角色 `/root/master_data_reads_ontology_20261028`；基线及实际契约读取均为 `bbd2ff88886ade456aac8d7d73f8af4f5c1575e2`。知识 `0.3.25` 保持。正式结果 `updated`：只纠正两条事实的过时源码锚点，业务规则、类型、状态、availability、成熟度和历史日期均保持。没有产品/测试/迁移修改。

29 条既有 ID 已按下列有限范围核对；两条先发现定位错误再更正，当前结论均为 limited consistent。与历史覆盖可能重叠，未做全历史去重，不报29个新增unique语义覆盖；整文件完成0。逐条机器记录见同名前缀 `rule-review.json`。原四知识gap、全部用户暂缓、未审声明保留，不在本片关闭。

| ID / 数量 | 实际核对范围及结论 |
| --- | --- |
| DEC-0044-01—09 / 9 | 两个入口、分类/类型/实物关系、四系统字段、品牌/采购日期、日期上限及两类可选描述与既有确认和相关源码一致。没有凭三层关系推定新生命周期。 |
| rule.equipment-purchase-date-not-future / 1 | 后台 `purchaseDate(String)` 解析后比较服务器自然日；前端有对应提示/保存阻断接线。只确认源码，跨时区一致性未运行。 |
| rule.material.required-type、rule.material.optional-brand / 2 | 新增与基础编辑解析类型，缺少类型拒绝；品牌可空，长度及裁剪仍是工程选择。保持 specified/internal。 |
| rule.product.source-from-material、DEC-0001-01 / 2 | 产品仅产成品/半成品物料的用途视图，沿物料ID，不重复建档。两读取入口源码一致。 |
| concept.equipment-category/type/equipment、对应term / 6 | 分类、种类、具体单台各有明确定义，实体/术语不混同，不扩成保养、校准或采购流程。 |
| relation.equipment-category-types、relation.equipment-type-instances / 2 | 父到子0到多，子对象持久化真实上级ID。历史空/孤立引用不据此自动归属。 |
| term.material、term.product、relation.material-derives-product / 3 | 仅核对物料与产品视图/身份边界；原引用入口/旧冻结的规范承接不重置，未重新验收引用全链。 |
| DEC-0048-01—02 / 2 | 类型必填和品牌可选的确认范围清楚；未将多版本同步、兼容或输入实现升为新政策。 |
| fact.catalog.equipment-purchasedateisfuture、fact.catalog.material-typename / 2 | 派生事实含义保持，只修实际来源锚点；不把catalog元数据当已具备通用运行时事实求值器。 |

两处确定性纠错：

- `KNOWLEDGE-MASTER-READS-ANCHOR-001`：设备事实 `sourceLocator` 写成 `purchaseDate(LocalDate)`，当前实际方法参数是 `String`。改为 `purchaseDate(String)`，非改日期规则。
- `KNOWLEDGE-MASTER-READS-ANCHOR-002`：物料类型名称事实指向没有任何物料类型读取的 `ProductProcessResolutionService`。实际 `ProductProcessController.materialTypeNames()` 经仓储形成名称映射，`isProductMaterial(Material, Map<Long, String>)` 按该名称判定产成品/半成品。修 sourcePath/locator 和匹配的既有 `evidence.product-process-controller`；不更改事实含义或产品范围。

规则合理性与来源分层：设备类型和设备实物承担不同维护责任，层级关系避免按名称猜归属；物料/产品共身份避免重复主数据；类型必填、品牌选填、采购日期上限和可选描述均有版本化确认来源。内置分类不能改删、上级必填、人员解析/历史回填、长度/空白归一化、服务器和浏览器“今天”的时区、分页及查询算法仍是实现选择，不能因为代码已有而升级为用户政策。物料版本行与主表分组不是同一分页单位；未来优化应保留当前合法身份/排序/组结构及状态解释，具体查询方案须主审取证讨论。

已读取原始规范记录：`docs/superpowers/plans/2026-09-09-equipment-modeling.md`、设备描述确认、物料字段确认、DEC0044/0048、DEC0001-01及DEC0082-15的既有入口/身份边界；并读取相关当前词条、概念、关系、规则和事实。它们是仓库版本化需求/决策记录；本次没有最早聊天导出和历史截图，未声称重访原用户会话。计划中旧macOS部署、备份、PostgreSQL/浏览器及旧日志结果只是历史二手运行说明，本次没有复用为运行通过。计划早期DEC0037编号属于历史记录，当前权威设备声明使用DEC0044，未改写历史。

实现原件：设备控制器的分类/类型/设备读取与保存辅助、相关三个实体；物料控制器的类型/品牌解析、产品派生、分组/版本比较与分页辅助；产品制程控制器的产品列表与类型映射；制程解析服务仅用于反证旧来源锚点不成立。页面仅查设备字段/查询/保存接线、物料配置类型必填与品牌选填，另查实际菜单/路由及相关测试源码。均为有限方法/声明范围，不是这些文件全审。

本体角色实际运行：知识模块89结构/引用检查全通过，0失败/错误/跳过；29记录解析/成熟度/路径检查及两个锚点/其余事实字段不变核对通过，原始结果和日志另附。不曾执行本批业务后端、浏览器、原生PG计划/容量/并发或客户环境验证；主侧/独立质量后续结果需各自归档。

两个相邻源码候选留下一小批复现：`toPagedResult` / 产品制程列表的int分页算术，及 `compareVersion` 数字段 `Long.parseLong` 范围。仅源码候选，未提供运行红测，不称已证缺陷；本批不修改分页协议或版本政策。本体阶段维持P0 in-progress，不声称全域一致或阶段退出。
