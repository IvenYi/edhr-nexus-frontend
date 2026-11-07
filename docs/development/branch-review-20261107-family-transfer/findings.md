# 本轮发现及边界

## W4-FAMILY-TRANSFER-FLUSH-001 / medium

规则来源：DEC-0002-02/11、rule.product-family.member-transfer-audit与scenario.product-family-transfer。产品P合格且已属于簇A、目标簇B存在，确认跨簇转移应成功并写三方审计；同产品仍只能归属一个簇。这些规则合理且互相兼容，无需新业务选择。

实际复现入口：POST `/api/v1/master-data/process-modeling/product-families/12/members/101/transfer?confirmed=true`，有效JWT有`master-data.product-families`。旧服务实际400，原生服务提交抛唯一约束异常。根因是JPA延迟delete，flush队列先新INSERT；数据库约束正确，问题是工程写入顺序。现有Mockito只核方法调用，批次测试用JDBC UPDATE模拟转簇，均没有覆盖实际服务提交。

最小修复提交1709dbc4：原事务delete后显式flush，再保留原新ID save及审计。未采用原位UPDATE（会改变既有关系identity及created元数据）、不延迟或去掉约束、不拆事务、不增加重试/锁政策。主侧13由9P3F1E变13P，相邻143全过；全新独立同样实际156/156和89/89，最终质量passed/FINAL，按此有限范围resolved。

独立另报low未用AtomicInteger import，主侧b2b0df85只删除它。双方重新test-compile且三个新测试类javap指令相同，24输入同、1仅导入差异；独立按影响评估复用1709运行并resolved该low。没有把b2b0称为重新跑过156或把无用导入问题包装成业务缺陷。

真实第三audit失败验证前两audit也回滚，测试序列第三次尝试标记及触发器只存在自有测试库；外部连接在未commit前仍见旧成员与零审计。这不等同全套并发转移、删除、添加及START写者矩阵。

## 两条知识来源定位纠错

`fact.catalog.productfamilytransfer-confirmation`和`fact.catalog.productfamilytransfer-reason`原引用制程解析Service，实际确认及不采集原因入口在Controller。各改sourcePath/evidenceIds/sourceRevision/sourceLocator/capturedAt；不改事实定义/类型/状态/成熟度，不新增通用事实提供器。正式本体updated、有限28项、纠正后89/89。

## PERF-FAMILY-BULK-READS-001 / 已量化、下一批授权、未整改

同一产品簇批量添加1/10/100个合格未归属产品，分别8/62/602 SELECT，即样本6N+2。100是实验规模，不是选人或业务返回上限。保持为独立性能项，不和转移正确性重复计缺陷。下一批范围和验收见performance-next.md。

有限历史去重未找到同根flush已关闭项，不声称全历史唯一；旧H006归属冻结政策已由20261027明确替代，不重开旧政策。PR72三项已验收的JWT/响应头修复也不重开。
