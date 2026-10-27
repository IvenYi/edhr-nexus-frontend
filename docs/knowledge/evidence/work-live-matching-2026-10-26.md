# 作业实时匹配与既有实例保留

知识基线 `0.3.25`；源码及契约读取基线 `edhr-dev@d5adf22066ea4d6bb1c7e7ede09961fc97bea675`，来源与目标相同。本轮直接修正当前定义，不增加并行模式、迁移政策或新迭代决策。交接见 `docs/development/work-live-matching-20261026/decision-package.yaml`。

当前边界补注（2026-10-27）：下文保留作业确认时的原始范围。所称“制程待讨论”及仍为open的制程实施差异，现已由[批次制程直接修正](batch-process-2026-10-27.md)收敛；当前工单不锁制程、各批次未开工保存引用且首次START重核冻结。作业实时匹配与实例保留的确认不变。

## 用户确认（user-confirmed）

2026-10-26本聊天原话：“作业应该是实时查的”；产品在A簇时匹配的a作业已执行一个节点，转至B簇即使不再匹配a，也应继续执行原实例；新簇命中其他作业允许引入。

批注1：“对后续工序生效，因为作业使用规则可能也配置了工序，如果工序已经过站了就不管了。”批注2对“已创建实例但尚未执行任何节点的作业同样保留”回答“是的”。随后明确：“你先把作业这边修改了，本体知识也需要修正，这不是迭代这是直接修改。完成后我们再来讨论制程。”

因此直接修正 `DEC-0007-03/04` 和其当前词典、关系与规则；`DEC-0002-10` 仅作业候选范围被明确排除。制程选择、工单锁定及转簇后继续拆分不在本轮决定或修复范围。

## 历史原文与替代范围（secondary-reference）

以下摘录来自上述 Git 基线，保留原始解释，不能继续作为当前作业政策：

- `DEC-0007-03`：“后续首 START 已在受限 OPERATION_START 切片匹配并冻结命中规则所选字段与当前已发布作业图”。本轮修正其被解释为批次首次START固定所有后续作业候选的范围。
- `DEC-0002-10`：“产品簇成员转移只影响未来生产对象；未来创建的生产对象保存产品、产品簇、所选版本和配置快照。”其制程侧边界保留待后续讨论，作业侧明确按本轮实时匹配与实例保留处理。
- `discrepancy.product-family-transfer-unstarted-object-context` 原作业部分：“首次 START 从当前 product_family_member 读取产品簇用于作业匹配，未冻结独立产品簇上下文；转移前已创建但未开工的对象可能改用新簇作业。”这项行为不再因转簇本身认定为错误；该差异仍以 open 保留制程继续拆分范围，不宣称全部解决。

保留旧审计、已创建实例、已冻结表单、签署与生产快照，不把历史记录改写成此次规则。旧批次未创建实例的后续工序候选按当前规则处理，不把旧计划项当成已运行实例。

## 工程边界（inference）

沿用现有 `OPERATION_START`：PENDING工序查询候选，合法START在原执行事务中重新匹配并创建；IN_PROGRESS/COMPLETED不补入。这里对“后续工序”的状态映射属于本切片工程选择，不冒充用户逐字指定。无工序限定的规则按实际工序匹配，同样不追补已过站工序。

查询不落库或创建实例；START沿用权限、工单/对象锁、revision及事务审计。嵌入状态 `state.operations[operationId].works` 表示已创建实例，单独的 `snapshot.operations[].works` 计划不证明实例存在。已有实例的身份、流程和表单快照、进度保留；新实例冻结创建时当前产品簇匹配事实及已发布流程。实时查询不重建制程快照，也不改DHR首次创建或其目录快照。

WORK适用规则不存在用户可控启停；本轮不增加此政策。共享数据中的历史字段兼容与例外匹配应分别核对，不将技术字段写成新产品动作。

## 原始实现与验证（original-evidence）

读取基线中 `ExecutionSnapshotBuilder.build` 装配制程并一次匹配全部工序作业；`ProductionExecutionEngine.initialState` 的工序 works 初始为空，`start` 才初始化嵌入图；`ProductionExecutionService.act` 首次START保存执行快照。该链支持区分计划与实例，不证明本轮修正已运行通过。

本体实例于2026-10-26直接核对当前未提交源码：`ExecutionSnapshotBuilder.build`只构建制程侧配置；`refreshWorks`仅处理PENDING、按state.works保留既有作业及其表单并记录新候选matchContext；`ProductionExecutionEngine.start`跳过已有works状态；`ProductionExecutionService.view`只在允许执行对象内投影候选且捕获候选错误，`act`的START重新匹配、保存并审计snapshot前后值。未开工候选配置错误只阻断该工序开工，不妨碍既有实例继续。原实例保留不要求回填历史缺失的matchContext。

已读取主侧原件 `docs/development/work-live-matching-20261026/primary-postgres.json`：三套测试共117项，115实跑通过、2既有条件跳过，无失败或错误；这不是本体实例独立执行的运行测试。直接读取新增6项 `ProductionExecutionIntegrationTest` 断言，覆盖首次START前转簇/GET零写、已有零业务节点执行实例失配后继续、后续新版本及匹配事实、已过站不补做、重复START、审计失败回滚、旧后续计划刷新和无效后续配置隔离。制程context/routeNodes与原作业快照有相等断言；制程转簇策略仍不属于本轮验收。

本体实例执行 `mvn -f tools/knowledge-model/pom.xml test`，89项通过、零跳过，覆盖schema、ID引用、类型、投影及证据路径等正式知识检查。知识仍为specified/internal，不提升verified/runtime；独立质量由本轮质量结果提供，不宣称通用规则层、独立作业实例或制程政策已完成。结构校验不能替代运行验证。
