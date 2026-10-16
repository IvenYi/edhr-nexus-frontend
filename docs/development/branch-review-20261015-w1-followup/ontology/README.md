# W1 四项证据缺口定向复核

本批只读专业支持，仅复核上批33项中的四个 evidence-gap，不承担主要开发或最终独立质量。交付时实际来源与目标均为 `6379bf105127b05a65695992b008b55c142264f9`，新分支 `audit/edhr-dev-w1-followup-20261015` 工作区干净。原始领域读取基线为 `3cfff38c1c1996cff841708e97c9f012e41eaed2`，读取途中出现的 `427df1ef` 只改 NEXT/history 文档。相关源文件按 Git 对象比较保持一致，未把 fetch、切换工作区或合并事件伪称契约重读。

知识仍为 `0.3.25 / schema1.2.0`；继承分母2486，没有新定义或删除。四项是重复复核，不给全量审查分母加4，不把其余2452 pending自动计通过。原始契约实际初读为537bb240；本批在安全检查点核对契约无增量及对应blob相同，复用同一规则，而不编造新读取时点。

四项均缩小了具体证据缺口，结论暂保留 evidence-gap；没有发现足以直接宣告新代码缺陷的完整反证，没有新增用户必须拍板的业务歧义。

| ID | 本批确定的源码事实 | 尚未证明的具体范围 |
|---|---|---|
| rule.dhr-summary-freeze-version | 修订要求最新定版/原因，建立DRAFT且不改旧版；草稿期间显式历史选择为只读；version正文取持久化冻结字段；ZIP集合与正文绑定明确版本；0104有局部旧模型转换及保护边界 | 本批未运行浏览器/PDF视觉、实际迁移；未穷尽文件登记对象在所有后续受控变化中的写权限/原件保留，以及任务附件权限和完整ZIP失败并发矩阵 |
| fact.dhr-instance.status | 领域服务实际写入/读取状态，正常完成与真实终止分离；部分资格消费者明确；终止详情最终返回经摘要核验的冻结正文 | 通用fact读取器、取值阶段/版本契约未建立；各跨入口普通写动作未全部复核；终止详情在返回冻结快照前仍解析当前execution，后续合法演进下的失败影响未复现 |
| fact.dhr-instance.has-summary-artifacts | derived boolean确为draft/version存在性；终止在持DHR锁后直接COUNT检查，非虚构列或同名事实API | 没有执行终止与所有草稿/提交/修订写路径的对抗并发矩阵；不能单凭锁源码视为并发通过；通用fact消费契约仍未闭合 |
| fact.dhr-instance.count-for-production-object | 唯一性由首次START工单/对象锁、执行存在条件和数据库tenant/object唯一约束落实；没有必要先COUNT才算实现业务唯一性 | 未见可调用count-fact provider；其租户/时点/版本语义未闭合；唯一约束不替代首次START与配置编辑并发验收 |

每个ID的规范来源、亲读符号和行、实际消费者、反证、测试断言来源与残留范围见 `gap-recheck.jsonl`；`gap-recheck.csv` 为索引，不替代逐项证据。

## 三层必须分开

1. **已保存定义**：首次START保存DHR context/directory。它们不随当前模板重建。
2. **冻结版本正文**：candidate、base/overlay、attachment、checkResult、placement及其摘要，版本读取/导出使用明确dhrId+versionId。历史API不会拿当前表单值补齐冻结candidate。
3. **当前元数据**：header总体状态、当前summaryStatus、审批reviewOutcome、来源impact和导出时点DHR审计。它们允许随当前事实更新，不属于整份API JSON永久不变的承诺。不能因整体响应hash变化就报告正文快照漂移。

同理，领域服务直接根据数据库状态/集合采取动作，不等于产品运行时已经加载知识facts YAML。正式validator只注册及校验事实ID、类型和引用，不提供生产读取API。原始类型复核说明明确“相邻源码不证明通用运行读取器”，所以本批不凭业务代码存在更改availability/status/visibility，也不由not-available反推出业务功能不存在。

## 具体新定位但未定案的依赖

`DhrInstanceService.detail:249-254` 在判断 `EARLY_TERMINATED:256-262` 前先解析当前production_execution，并计算CustomFormPolicy.incomplete。最终返回冻结终止正文的事实成立；“终止详情读取完全不依赖当前execution”则不成立。是否有合法后续受控演进能令该前置步骤失败，本批没有构造或运行，因此仅作为已定位读取依赖交主审，不升格为可复现缺陷。

没有运行Maven、数据库、迁移、浏览器或PDF。已有测试仅阅读断言；旧通过记录没有冒充本批运行。没有修改仓库、业务政策、成熟度或历史数据。下一步由主审结合实际START配置并发与终止/汇总补录路径决定哪些需要失败回归；知识运行消费者契约不足继续留有界缺口，不自动建设新规则引擎。
