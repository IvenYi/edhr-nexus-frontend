# 引用对象范围与具体业务字典纠正

日期：2026-10-19；切片`DEC-PACKAGE-20261019-reference-dictionary-correction`，执行级别L1。知识基线保持`0.3.25 / schema 1.2.0`，当前P0仍in-progress，不新增试点或运行知识发布。本文只核对本轮受影响范围，不重审或改写前一原因与引用切片的验收记录。

适用时点说明：本文原始核对及验收记录保留同日较早切片的实际情况；随后用户确认统一物料/产品及批次/SN配置入口，当前入口规范见[DEC-0082-15/16证据](reference-source-unification-2026-10-19.md)。只替代分开入口的现行解释，共模型、真实身份、具体字典及历史不迁移等其余范围仍适用，不将后续确认反填成本轮当时实现。

## user-confirmed

本轮用户原话：“我们的物料和产品，生产批次和生产SN是不是都是一个东西？还是说我们底层的模型是两个 所以你在这里设计上就分开了？然后供应商是干啥的没用的话删了。字典的话，就选择字典但也没说显示哪个字典，那选择字典有什么用？另外字典的页面这个详情弹窗好像不太对，请修复。”

据此落实的确认是：核实并解释来源关系；无实际用途的供应商配置占位撤下；字典引用须能选具体字典；详情按公共界面规范修复。这不授权合并模型、更换引用身份、删除供应商业务数据或迁移历史填报。

## original-evidence

本体实际核对以下原始源码，来源均为`ca98ab2897990eba30bf1433134aa8560578f562`上的本轮未提交工作树：

- `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/Material.java`与`masterdata/controller/ProductProcessController.java`：产品列表从MaterialRepository读取并通过`isProductMaterial`限定产成品/半成品，响应沿原Material.id；不是另建一套产品主记录。当前词典把产品称为“生产对象”容易与执行对象混淆，按此既有来源纠正为生产用途主数据视图。
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/entity/ProductionObject.java`及`template/service/FormReferenceLookup.source`：生产批次和SN共用production_object，引用分别限定object_type=BATCH和SN；物料引用覆盖有效物料，产品引用限定有效产成品/半成品。保留这些不同候选范围及既有sourceType，不以共表推定两者可以混选。
- `gmp-platform/backend/src/main/java/com/zencas/edhr/template/service/FormReferenceLookup.java`：字典项查询关联business_dictionary，按显式`referenceDictionaryId`限定dictionary_id；搜索与validate共用query，同时要求字典和项启用。字典目录按名称/编码搜索，ID重读可识别原配置字典停用；不能以显示名称重建身份。
- `template/service/FormReferenceConfig.java`、`gmp-platform/frontend/src/components/form-renderer/referenceConfig.ts`与`pages/master-data/template-designer-react/components/ReferenceDictionaryConfig.tsx`：范围键归引用字段配置，同字段位置同步，冻结解释器读取自身配置。设计器需明确选择字典，空值不取第一本；供应商禁用占位已从候选清单撤下。
- `gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/FormReferenceController.java`：具体字典目录查询复用表单/批记录模板设计权限，试填未选具体字典明确提示；不授予字典管理写权限。源码存在不是完整权限运行验收。
- `gmp-platform/backend/src/test/java/com/zencas/edhr/template/service/FormReferenceLookupTest.java`、`FormReferenceConfigTest.java`与`gmp-platform/frontend/scripts/test-form-references.mjs`包含限定字典、跨字典拒绝、停用项/字典、未完成配置、注入及旧配置读取不回写、同字段位置同步等聚焦断言；本段只证明已核对测试源码，不表示本体已运行测试或浏览器。

本轮未新增独立产品或SN主数据模型。后端产品管理的有效期口径和引用查询中的ACTIVE口径是否应统一不在此纠正范围；不能用本条替代其他主数据状态契约。

## inference与兼容边界

选择`referenceDictionaryId`作为稳定配置、区分键缺失的旧冻结配置与显式空值的新未完成配置，是工程兼容选择。无键旧冻结来源沿原解释，不批量猜测或迁移；新配置空范围明确提示，不跨字典混查。可保存未完成草稿，不新增发布状态机或阻断政策。当前字典停用/删除时提示配置问题，不自动换成另一字典。供应商移除仅撤下无实现的禁用配置占位，不声明供应商业务永远不需要或删除历史数据。

字典详情的满高公共抽屉、固定标题页签、内容滚动与0值正确展示属于UI实现，不为其新建业务概念或改动审计含义。本段记录初次源码核对时点，不以源码存在宣布交互通过；随后实际验证见文末续核。

## secondary-reference与证据缺口

`docs/development/reference-dictionary-correction-20261019.md`为主开发范围及验证汇总索引，不替代上述源码或原始用户确认。既有DEC-0060、DEC-0082-03/05/07的引用职责、身份、冻结和带入边界保留；本轮只补DEC-0082-14的具体字典范围，不替代原因建模、NG口径或自动带入白名单。当前声明为specified/internal，相关既有规则不因新增范围而自动提升成熟度。初次建模时实际浏览器、服务运行及独立质量证据尚待完成；文末续核记录随后取得的本轮证据，不把早期缺口继续表述为当前待补，也不标verified。

## 契约与声明级处置

本体独立核对HEAD为`ca98ab2897990eba30bf1433134aa8560578f562`、已获取目标`edhr-dev@336466d95c3866581e5d7d641544756ba7807946`；项目、角色及交接契约在两提交间无增量，契约读取提交为ca98，未提交契约路径为空。目标未合并，本轮不冒称目标集成候选已验收。

- `term.material`、`term.product`：按原始持久化与列表代码澄清主数据包含关系；纠正产品与执行生产对象混称，保留既有身份和成熟度。
- `term.production-object`、`term.serial-number`：明确共模型按类型分流；不改变单件数量1、生命周期、累计或质量规则。
- `DEC-0082-14`与`rule.form-reference-runtime`：补具体字典范围，撤销将新配置跨字典混查当成已完整配置的解释；DEC-0060其余声明、无新增键的旧冻结解释及全部原始历史证据保留，不作决策级整份替代。
- 不良/报废原因、独立不良明细及本轮不相关规则不变；字典范围不等于新追溯项或业务用途，不引入引用型自定义追溯。

本体本轮实际执行`mvn --batch-mode --no-transfer-progress --file tools/knowledge-model/pom.xml test`，89项、0失败/错误/跳过，日志`/tmp/edhr-reference-dictionary-ontology-tests.log`；`git diff --check -- docs/knowledge docs/architecture`通过。此结果只覆盖知识结构、引用及状态投影等校验，不替代业务、浏览器或独立质量验收。

## 2026-10-19本轮验收续核

本体收尾实际读取[独立质量最终结果](../../../output/playwright/dictionary-correction-20261019/quality-result.yaml)及下列原始产物，未重新操作浏览器或重复执行业务。质量实例针对ca98上的本轮未提交切片返回`qualityResult.result: passed`，无发现或阻断；其独立执行后端17项、前端10项、知识89项均通过且无跳过。后端及知识日志分别为`/tmp/qa-dictionary-backend-tests.log`、`/tmp/qa-dictionary-knowledge-tests.log`，前端结果定位于质量报告。完整前端构建由主侧执行，本体与质量角色读取`/tmp/edhr-dictionary-correction-build.log`确认成功，不宣称独立重跑构建。

以下路径统一位于`output/playwright/dictionary-correction-20261019/`：

| 原始产物 | 续核结果及边界 |
| --- | --- |
| `runtime-scoped-query.json` | 两本同名字典项分别仅返回UNIT_A与SHIFT_A，无具体范围的试填被拒；属于实际服务响应，不由同名推定同身份 |
| `designer-persisted-version.json` | 安速康新副本ASK-DICT-20261019-CLEAN的模型及画布均保存具体字典ID387613106676502528；该副本未进入生产签署 |
| `qa-mock-scope.txt` | 独立质量实际打开上述副本模拟填报，断言候选只有同名字典项[UNIT_A]且选中成功，无SHIFT_A或停用项UNIT_X |
| `qa-drawer-measurements.txt`、`qa-standard-drawer-measurements.txt`及对应截图 | 质量报告记录桌面1200×733、短窗1200×420、窄屏390×660三视口；公共详情同视口对照均560×733、top0、头部107，短窗内容滚动不移动头部，窄屏无内部横向溢出。字典及字典项、审计切换、字典项数0及排序0已实际检查 |
| `old-execution-unchanged.json` | 被比较的ASK-FINAL-20261015-A/B及R2-A/B四个执行对象snapshot/state/revision均与原基线一致，不扩大为全库历史逐项验证 |

本轮服务仍使用3000/8081与`edhr_form_projection`，主侧报告更新运行包且不执行数据迁移。上述质量报告及产物证明本轮配置和界面验收，不构成目标336466合并候选或发布验收，不代表旧无范围键冻结配置已批量修复，也不新增正式生产签署验证。知识定义与成熟度保持不变；原始时点记录、旧快照解释及前一切片证据继续保留。
