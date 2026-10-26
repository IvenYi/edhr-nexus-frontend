# 宽记录容量、路线拓扑与初始化基线审查

基线：edhr-dev@34f7c9d736ac62961330343c64bc610fab41ad1c。PR26/27均人工合入，与上一轮交付组合树一致；无额外产品、知识或契约差异。L2有限审计，整体W0–W7未完成。

本轮实际入口：DhrEvidenceImpactService.changes宽JSON驻留量；ProcessModelingController.saveRouteGraph→payload归一化→RouteGraphValidator；Liquibase当前master→schema/seed及历史SQL测试资源边界。后端路线拓扑与知识声明逐项核对；前端视觉/浏览器交互未纳入本批，不把后端通过扩成全画布通过。

执行顺序：源码/知识最小核对；隔离PG与固定JVM容量测量；原路线及初始化回归；记录真实发现与反证；全新独立验收后任务复核和交付。容量测量是合成样本，不是客户SLA；性能方案保持待讨论，不因继续或合并自动实施。TaskDetail及记录变更/作废依赖维持暂缓。

初步反证：RouteGraphValidator内部对null类型的候选NPE并非当前HTTP可达缺陷，toRouteNode先拒绝null/空键并将空类型归一为OPERATION；toRouteRelation拒绝null端点并校验关系类型。仅内部函数非法调用不能直接登记产品缺陷。

主侧及全新独立已分别完成同组70项回归（61单元/控制器mock＋9原生PG），16次DHR宽JSON对照、3种图规模的实际saveAll查询观察，以及隔离fresh/非空库保护探针。正式独立对2cef901f给出passed、9/9必需检查通过，无产品代码修改；后续仅L0归档和进度。原件见evidence/independent，验收见acceptance.json；结果与结构提取候选见findings.md、source-review.json、structure-plan.md。

用户在看到分块选项后要求先通俗解释、理解后再决定；已解释逐条/全量/分块的查询与内存差异。分块实现仍pending-discussion，128仅候选工程批量，未获实施确认。新增路线saveAll风险也仅登记，未自动整改。

用户随后提出单份DHR可能在300张以内的规模假设。独立顺序补测300×32KiB额外驻留9.71MiB、300×128KiB为38.53MiB，均5查询且比较完成；不是业务上限、峰值或生产容量保证。主侧建议在通常<=300、单张内容不大且低并发的假设下暂缓分块，继续其他审计；并未实施分块或新增300张限制。固定候选progress.json保留当时pending时点，当前验收及假设以本README/acceptance/scope-review为overlay。
