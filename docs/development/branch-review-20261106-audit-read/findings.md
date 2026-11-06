# 本批发现及去重

后续用户明确授权当前页批量补名，见[后续切片](../branch-review-20261106-audit-page-names/README.md)。本表保留原取证阶段状态；姓名N+1按新切片实际独立验收结论处理，事件全量加载仍open，不把本表性能旧状态误当授权仍缺失。

| ID / 范围 | 依据与复现 | 当前状态 |
| --- | --- | --- |
| PERF-AUDIT-LIST-MATERIALIZATION-001 / 算术子项 | 旧20261026已列int候选；e69同源分页6中3真失败，最终6过 | verified-resolved，主侧及全新独立116/116通过，只关闭正确性子项，不重复计新性能问题 |
| W5-AUDIT-ACTION-FILTER-001 / medium实现差异 | e69生产取消/状态记录显示UPDATE，却被UPDATE筛选漏掉；DEC-0013-03为既有依据，原生9中6真失败，最终9+空白17过 | verified-resolved，全新独立15必需项passed/FINAL；基线已存在，非PR67引入。有限历史检索未找到相同旧发现，不能声称全仓unique已完成 |
| PERF-AUDIT-LIST-MATERIALIZATION-001 / medium性能 | 5000匹配/小页20仍5001 SELECT；宽JSON及派生筛选再现，见main-analysis | 实测确认，open/pending-discussion；未实施姓名批量/DB分页/索引 |
| W5-AUDIT-ACCESS-POLICY-GAP / 证据缺口 | authenticated-only全局/详情源码；共享生产对象/个人入口资格不同，未找到足够现行政策矩阵 | 待补规范与真实HTTP矩阵，不臆定允许/拒绝、不算一致通过 |
| W5-AUDIT-NAME-SEARCH-GAP / 证据缺口 | 当前姓名优先显示、筛选用历史operatorName，期望是否统一未明确 | 保持当前行为，后续确认依赖范围，不算已修或一致通过 |

本批没有恢复旧历史hash、改审计动作原值、加数据/人员上限、改变业务政策或扩大性能授权。知识及只读角色只覆盖其明确子范围，测试通过不等于全审完成。
