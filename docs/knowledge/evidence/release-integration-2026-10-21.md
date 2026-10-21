# 原因、引用与初始化知识整合

本次为已授权L2整合，不重新定义业务政策，也不是全库语义审计。知识版本保持`0.3.25`、schema保持`1.2.0`；已有成熟度逐项保留，P0继续in-progress，不新增试点。

## 基线与来源

- `original-evidence`：本体角色实际读取的目标与契约提交为`c671b23fd9847a7e1cb2d1bad3c3bb138fc5620f`，分支`edhr-dev`；候选在该提交上整合未提交差异，不能用知识版本代替Git候选。
- `original-evidence`：原因/引用来源为原运行工作区`ca98ab2897990eba30bf1433134aa8560578f562`上的未提交实现和知识；初始化来源为`d405a9afb4327b859545fa5a12c7eebe1350f418`上的整理差异。两来源的历史运行记录只证明其当时切片。
- `user-confirmed`：用户要求将原因/引用、初始化清理、旧入口修复及本体引用修正一起整合到edhr-dev，验证后提交推送并同步3000/8081；开发库允许处置，不为旧测试数据保留废弃写入口。
- `secondary-reference`：[当前决策包](../../development/edhr-dev-release-integration-20261021/decision-package.yaml)、[初始化逐处映射](../../development/initialization-knowledge-references-20261021/reference-resolutions.json)用于确定范围；本体同时读取候选原始SQL与源码，不以历史验收代替本次核对。

## 唯一ID与声明处置

原因决策在原未合入工作区临时使用`DEC-0081`，目标分支已经将该ID用于租户内显式委托。保留目标`DEC-0081-tenant-scoped-task-delegation.yaml`和其全部引用，将原因决策改为`DEC-0082-defect-reason-detail-and-reference-ownership.yaml`。原原因`DEC-0081-01`至`DEC-0081-16`逐项对应新`DEC-0082-01`至`DEC-0082-16`，后缀与语义不变。这是工程编号消歧，不是替代委托政策或重新取得用户确认；原讨论、源码采集和历史验收时点保持。

当前原因、引用词典、本体、规则、开放问题和人员说明统一使用新原因ID。当前项目`DEC-0081`均表示租户委托；历史原因原称仅在本节及本次交接映射中说明。未机械替换目标分支的委托引用。

合并保留两套原因目录、分类暂缓、对应目录单选引用、一个原因明细一个数量、原因分项不能相加替代NG、编号/名称来源快照。物料/产品及批次/SN统一配置入口仍保持真实对象身份及适用范围；明确归属的批次/SN、工单、产品和工序才可显式开启首次空值带入，设备等不在白名单，重开不覆盖。查询失效条件保留并阻止保存，字典须明确范围。

目标分支的同字段共享、单字段至多一个追溯项、Java空白主表区域身份及跨配置组计数、合法区域消费链、显式委托及签名TEXT边界保留。单绑计数事实采用目标分支较新sourceLocator，没有将旧工作区较宽泛的tableId解释覆盖回来。所有已存在的未决问题和延期边界继续按其ID管理，初始化定位修复不关闭业务缺口。

## 当前初始化与历史证据

候选生产master仅包含[当前结构](../../../gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql)与[当前预置](../../../gmp-platform/backend/src/main/resources/db/changelog/baseline/0002-current-seed.sql)。本体实际核对`quality_reason`表、两类原因的编号唯一索引、原因建模及两类原因菜单权限和ADMIN关联已纳入最终基线。目录数据仍由客户维护，不预造客户原因或分类。

[0115原因历史SQL](../../../gmp-platform/backend/src/test/resources/db/changelog/0115-quality-reasons.sql)与其他迁移只用于历史来源和隔离测试，不加入生产master。原2026-10-19文档中“0115迁移成功”、当时数据库及PID继续保留为历史记录；不改成当前新建库仍会执行0115，也不把旧结果算为本次空库验收。

上轮107处引用中，59处当前事实/实现锚点定位到最终DDL或预置，48处历史来源定位到原字节测试夹具；本次把这些差异整合到实际候选并重新检查。历史SQL存在不等于仍可通过当前页面或接口写入旧数据。旧文档CUD和两份灌数工具关闭、退役追溯ID写入拒绝的运行验证由主开发与独立质量对当前候选另行执行，本体不冒称已操作接口。

## 验证边界

本体执行正式知识测试：`mvn --batch-mode --no-transfer-progress --file tools/knowledge-model/pom.xml clean test`，89项通过，0失败、0错误、0跳过；日志`/tmp/edhr-release-integration-ontology-tests.log`。合并标记、唯一ID、当前/历史路径及目标保留内容另见[本轮本体结果](../../development/edhr-dev-release-integration-20261021/ontology-result.yaml)。这些检查不替代数据库承接、实际页面交互、安速康业务或独立质量门禁；最终运行结果由主侧追加到集成验收记录，历史通过不自动覆盖新候选。
