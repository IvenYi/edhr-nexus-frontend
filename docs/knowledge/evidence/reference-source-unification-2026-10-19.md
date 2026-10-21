# 引用入口统一与失效筛选条件保留

日期2026-10-19；decisionPackage为`DEC-PACKAGE-20261019-reference-source-unification`，L2。知识基线`0.3.25 / schema 1.2.0`，P0保持in-progress，不新增试点或运行知识发布。本体仅维护已确认语义；当前实现由主侧和有界实现实例继续，本文初次核对不宣称实现、业务运行或独立质量已通过。

## user-confirmed

用户先问：“批次和SN，产品和物料只要在这里选择同一种引用类型就好了呢？你有什么看法？”主侧建议两组各自合并：物料默认各类、可限定产品/原料/包材等；生产批次/SN默认两类、列表辨认类型、可限定一类；范围按需而非必填；当前产品自动带入仅适配产品范围，保留真实身份、BATCH/SN数量和追溯区别及旧冻结解释。用户随后原话：“可以，你这个方案是我想的”。据此形成DEC-0082-15，不将合并入口解释为合并底层实体身份或抹平类型。

用户另选择：“保留并标错，修正后保存（推荐）”，对应的问题明确为切换引用类型或候选范围使原筛选条件不适用时，保留条件、标出不适用项、修正或移除后才能保存。形成DEC-0082-16；不静默忽略筛选，不由此引入其他草稿完整性门禁。

用户追加：“追溯和业务的那个页签，在我选择一个字段后，如果我取消选择字段，还会显示，那边的行为应该和字段配置的行为一样，请修复”。这是侧栏失去有效选中字段后关闭/复位的交互一致性要求，不新增业务概念、用途、事实或执行动作。

## original-evidence

本体实际读取当前`ca98ab2897990eba30bf1433134aa8560578f562`上的未提交工作树：

- `gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/entity/Material.java`的物料类型身份及`masterdata/controller/ProductProcessController.java#isProductMaterial`、`toProductSourceResponse`：产品是产成品/半成品物料视图，响应沿Material.id；共身份事实与上一纠正切片一致，不由新入口生成另一套产品记录。
- `gmp-platform/backend/src/main/java/com/zencas/edhr/production/entity/ProductionObject.java`的`object_type`及`template/service/FormReferenceLookup.java#source`：旧productionBatch/serialNumber仍分别使用BATCH/SN限定；新增productionObject来源开放两类并返回objectType与objectTypeName。共模型事实不授权改动SN数量1、生产生命周期或DHR身份。
- `FormReferenceLookup.java#appendScope`：本体读取到实施中的物料all/product/types及生产对象all/batch/sn分支；指定物料类型通过material_type ID列表及有效性核对，不以客户类型名称猜身份。查询使用参数化范围；有效候选和提交校验须沿相同范围，由本轮实际运行验收另证。
- `FormReferenceLookup.java#query`、`conditionValue`：现有等于、不等于、包含、不包含，条件AND组合；依赖无值追加无候选约束；引用右值读取实际依赖属性或默认字段，不是当前表单引用的原始ID直接比较。完全空行被跳过。这些是本轮保持的工程行为，不重造查询语言。
- `gmp-platform/backend/src/main/java/com/zencas/edhr/template/service/FormReferenceConfig.java#fields`、`validateDesignConditions`：当前工作树读取并同步范围键，开始在组合设计上核对查询条件属性、依赖字段及比较方式；本次仅核对实施中的代码，不证明全部保存入口、审计无写、生产初始化、用途兼容或浏览器已闭环。

上述源码在同一工作树并行开发，最终实现和测试须由主侧/独立质量对最终候选重新核对。源码存在不等于通过业务验收。

## inference与实现边界

新物料配置保存`sourceType=material`与`referenceMaterialScope=all/product/types`、类型ID列表`referenceMaterialTypeIds`；新生产对象保存`sourceType=productionObject`与`referenceProductionScope=all/batch/sn`，这些键名和枚举是工程选择。旧`product`、`productionBatch`、`serialNumber`配置按自身解释，只有用户显式编辑来源或范围才形成新配置，不批量改写旧值或快照。

统一来源的用途适配只允许原可接受对象集合的等价限定；例如原仅SN用途不能接受all或batch范围。物料指定类型是否等价产品须依真实类型判定，不按名称拼接、客户端标签或原始ID跨来源互认。字典仍须具体字典，原因仍须对应单选目录；不增加新追溯类型、用途、条件操作符或NG累计公式。

配置保存须在任何设计与审计写入前核对不适用条件；前端保留及标错、服务端拒绝是DEC-0082-16的实现边界，具体错误组件不作为新业务概念。完全空条件行仍不是规则；其他未完成草稿契约不变。侧栏在取消、切页或删除导致所选字段失效时复位属于同一UI修复的等效场景，不能据此删除持久化用途配置。

## 声明级替代与保留

- DEC-0082-15替代上一轮[引用对象与字典纠正](reference-dictionary-correction-2026-10-19.md)中将物料/产品、批次/SN分成配置入口的当前说明。原始调研、源码与验收记录保留其时点；不能改写成当时已存在统一入口。
- 当前`term.material`、`term.product`、`term.production-object`、`term.serial-number`和对应概念证据同步统一入口及范围，保留底层包含/共模型身份、既有成熟度和BATCH/SN规则。新规范15/16保持specified/internal，不因当前旧词条implemented而伪提升新入口验收。
- DEC-0082-04/07继续限定带入对象和首次空值/不覆盖时机；15明确其中产品在新入口下须限定产品范围。DEC-0082-14具体字典范围、08至13原因与NG边界保持，不整份替代DEC-0082或DEC-0060。
- `rule.form-reference-runtime`保留既有implemented/internal状态，在说明中分别标注新范围与失效条件规范为specified/internal；不创建未经执行验证的运行契约，不改原事实类型、关系或历史冻结。
- 没有新增真实业务未决项。`question.form-projection-context-prefill-lifecycle`只保留未来白名单外扩展，补充15当前范围约束而不重开已确认问题。

## contractBaseline与验证边界

本体实际核对HEAD为`ca98ab2897990eba30bf1433134aa8560578f562`，已fetch目标为`edhr-dev@336466d95c3866581e5d7d641544756ba7807946`；项目/角色/交接契约无增量，读取提交ca98，未提交契约路径为空，目标尚未合并。目标architecture中AUD-H004增量与本轮引用入口无冲突，本体不覆盖其内容，实际集成再核对。

`docs/development/reference-source-unification-20261019.md`为主侧决策包、影响和验收索引，属于secondary-reference，不替代以上原始确认和源码。知识测试结果在本轮返回中列明；只证明结构、引用、状态和投影边界，不替代真实配置、模拟/正式填报、旧快照、审计或独立质量验收。当前不使用前轮字典或原因切片的通过结果代替本轮门禁。

本体实际执行`mvn --batch-mode --no-transfer-progress --file tools/knowledge-model/pom.xml test`，89项、0失败、0错误、0跳过，日志`/tmp/edhr-reference-unification-ontology-tests.log`；`git diff --check -- docs/knowledge docs/architecture`通过。此处仅记录本轮知识验证，不将结果提升为业务运行、已集成目标分支或独立质量通过。

## 2026-10-19连续交互修正：范围解释与条件可读性

### user-confirmed与本轮请求

用户提出：“没必要候选范围这个选项，直接下面可以选择就好，默认全选你觉得如何？”并指出多选点一项就关闭、选下一项必须重新打开，要求优化；另要求查询条件更容易理解。主侧随后解释“全部类型”会自动包含今后新增类型，而指定类型是固定选择。用户回应：“你说的有道理，那我觉得是不是现在的配置项更合理一些呢？你评估一下”。后一句是要求评估，不是确认撤掉范围、把当前全选改成动态全部或新的范围政策；本轮不据此替代DEC-0082-15/16。

### original-evidence

本体重新读取本轮未提交工作树的`FormReferenceLookup#appendScope`：`all`不加类型ID限定，`types`使用所选真实类型ID的`IN`条件；因此前者包含以后符合既有有效性与授权要求的类型，后者不会因目录新增类型自动扩张。`product`沿产成品/半成品范围；`referencePresentation.supportsReferenceContext`只为该产品范围的物料开放当前产品带入。范围不只是多选控件的展示状态，直接取消结构或把全部ID选择等同`all`会改变候选及自动带入含义。

同次读取`ReferenceScopeConfig`：主侧保留三种范围结构，以“允许选择的物料”、不限类型/仅产品/指定类型和简短说明解释差异。类型多选使用保持打开、勾选、选中数量、当前类型全选与清空；“全选当前类型”只写入当时有效类型ID列表，仍为`types`，不是`all`。这是主侧依据原已确认范围所作交互选择，不记录为用户逐字指定的标签或新默认值。

同次读取`DesignerInspector.renderReferenceSections`：无条件时显示未额外筛选说明，添加后持续标明候选对象属性、比较方式、本表单取值字段，区分主表/当前明细取值，并展示条件的可读句子。`FormReferenceLookup#query/conditionValue`仍保留四运算符、AND组合、依赖字段无值则无候选、引用右值按实际对象属性取值，不使用方括号显示文本。失效条件仍按DEC-0082-16保留并阻止保存，完全空行仍不构成规则。

### inference、保留范围与验证边界

本轮是现有范围和查询能力的客户解释及交互修正，没有新增业务对象、状态、事实、操作符或追溯/统计用途，也不新增契约ID。保留DEC-0082-15的真实身份、范围、自动带入适配和旧冻结解释，保留16的失效条件处理；产品范围与指定产品类型ID列表不能仅凭标签相似推定为同一配置。无条件时不显示空白编辑行、连续勾选及可读句子均为工程选择，不改变空规则、草稿或历史处理政策。

知识基线与contractBaseline保持本文件前述实际提交，目标尚未合并，P0仍in-progress；前一轮通过记录不覆盖新增交互。本节只记录本体实际源码与语义核对，本轮浏览器、保存重读及独立质量结果由主侧收尾另记，不据本次说明或代码存在声称已通过。
