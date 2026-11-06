# W5审计读取正确性与W6规模取证

L2，基线edhr-dev@e69a8f3d97b34fea8737947c780b047bb0310c64。已核PR67人工合入且整树同a40a86ff，无外部/知识/契约增量。本批继续既定整体审计，不重新收尾旧PR；只修改两处后端产品文件，未实施待讨论的性能优化。

两项确定性整改：

- 正数page/size的int乘加可溢出，使超尾空页抛异常，或第二页大size无法正确截尾。仅两处中间运算改long，再按实际列表长度截断；不加页数、页大小或总条数上限。
- 全局审计页“编辑/UPDATE”先按原始action筛选，漏掉已显示为“修改”的生产取消/状态变更。现行DEC-0013-03及rule.production.audit-action-projection明确生产动作只呈CREATE/UPDATE。本批把同一分类用于SQL筛选，原action、事件hash、非生产类别和原实体类型筛选保留。

旧源负对照保留：分页6项=3正/3真失败；原生动作9项=3正/6真失败，均0错误/跳过，同字节测试最终通过。最终主侧116/116、知识89/89，0失败/错误/跳过。含原生规模17、动作9、空白等价17、分页6及相邻67；不代表全HTTP/全系统验收。空白测试以未改Java显示投影为oracle：类型String.trim和动作Character.isWhitespace的边界不同，因此SQL分别保留两种规则，不把长正则当新的防御规则。

25个具名观察的27,461条业务SELECT，与PostgreSQL实际execute日志逐事件、逐SQL形状吻合，未将parse/bind、初始化或控制语句算入。请求统计的Hibernate写入为0；动作测试另核数据库原action及hash前后相同。见[主侧分析](main-analysis.json)及evidence原件。种子为隔离合成数据，旧hash占位不用于摘要认证。

旧PERF-AUDIT-LIST-MATERIALIZATION-001继续open/pending-discussion，不新增重复性能发现。小页20条、匹配5000条时仍5001次SELECT；共享人员也因普通仓储事务/无外层事务/OSIV关闭重复加载。菜单派生筛选最终仅1条，也先处理1000条、1001次查询。详情[性能与拆分方案](performance-and-structure.md)。本批没有把这些数字说成已优化，页大小100不是人员总数上限。

本体not-applicable/FINAL，有限13记录12一致/1完整UI证据缺口；350知识文件不变，知识0.3.25/schema1.2/P0保持。只读源码角色两次FINAL；全新独立质量在clean固定候选9d4416c3f74a3a0e79da53670c6cd13b132bff1b实际116/116与知识89/89，15/15必需项passed/FINAL，无发现/阻断，25观察27461 SELECT吻合。四包335原件及QA86文件校验通过，自有资源清理。见[质量结果](quality-result.yaml)、[独立复验](independent-review.md)。

全部专业角色FINAL后已实际完成[PR前无漂移复核](pre-pr-drift-review.md)，目标仍e69，无新代码/知识/契约增量。此后仅L0证据归档、结果与台账文档，不改受测运行/测试/契约/知识。两项正确性子项可关闭，旧性能风险及政策缺口继续保留；建议人工合入本批修复，不等于全分支审计或发布完成。

审查覆盖仍为W3/W4/W5交叉链路与W6专项。整文件完成本批0，历史唯一覆盖未知；931知识/86UI候选、W2余项、A12/高风险/完整矩阵、旧历史/ZIP限制、text-ID索引、大上传/PDF/Office/导出容量、UNKNOWN持久对账及A23含已审代码复查继续。朋友签署页、生产弹窗样式暂停保持。不自动merge/deploy/恢复，不查询或触发CI。
