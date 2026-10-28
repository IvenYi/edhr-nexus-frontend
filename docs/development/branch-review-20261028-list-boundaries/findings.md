# 本批根因、处置和待审范围

基线`cf0eb57c`，PR36整树承接。前批`W5-LIST-SHRINK-ADJACENT-001`是多个列表的待复现父线索，本批只关闭下述已实际复现的子范围，不把父线索全部关闭或重开PR36图标项。

## 两类确定缺陷

1. `W5-LIST-SHRINK-DICTIONARY-MODELING-001`（medium）：业务字典父列表及子列表、工序管理、表单模板主列表均可在末页合法删除唯一记录，收到totalPages从2变1的成功响应后仍停page2空表。真实浏览器走原确认和DELETE；工序/模板同时经过原关联预检，不用失效接口或绕开删除资格。本批用同一个仅一基的`useListPageBounds`处理四处消费，只有成功、非刷新、非占位且总页数已知才回最后有效页；失败/等待不夹页，零页归1。模板保留原totalPages缺失时以totalElements算页数的兼容读取。其他ProcessModeling pageKey和DHR模板共享组件仅源码影响核对，未把工序/表单模板实测称为所有variant实测。
2. `W5-DICTIONARY-CHILD-PAGE-001`（medium）：父列表变化后已有自动选择机制会换字典，但未同步itemPage；新字典同样有多页时仍显示旧page2，本质不依赖总数减少。修复在fallback到新父项时立即派生请求/显示子页1，selection effect同步保存page1；没有选中父项时也显示空的单页。原显式选中、筛选/页长重置和API排序保持。实际A/B各21子项，B第2页切回A，验证A第1页并禁止向A发出旧子页2请求；不是靠A只有1页而让缩页hook掩盖错误。

固定基线同11场景实际5红/6正：四种合法删除和自动父项变化红；等待/失败/缓存及页长、三个空数据页等正对照通过。候选1440/390同11场景通过，不称22种不同业务场景。真实页面/React Query/client/Chromium与受控HTTP不等于真实后台持久化E2E。首次夹具code/name相同导致选择器重复、相对has及图标模块别名不匹配的运行原件保留；纠正测试夹具后重跑同一业务断言，不改产品来适应夹具、不降低断言。

## 相邻反证与未审部分

ModelTab报表及MenuManagement图标选择器仍为`W5-LIST-SHRINK-ADJACENT-001`的pending-reproduction范围。当前queryClient关闭焦点刷新；菜单重新挂载会将页码重置1。因此“切回标签/离开再进”不能据作保留旧页状态的真实刷新触发。ModelTab也无记录DELETE入口，不能造删除来复现；已保存表单变更后不再命中筛选，或过期查询的真实重连刷新须另行闭环。ModelTab的UI1/API0转换、按实例分页而子表只展开当前页的分母均正确，不误报为索引错位或全量内存分页。细节与14条只读方法证据见辅助原件。

## 性能与大模块方案：只分析，未优化

沿原`PERF-DICTIONARY-ITEM-COUNT-MATERIALIZATION-001`：父字典数据库分页正确；计数却读取本页字典的全部子项实体再Java groupingBy。父项P受本次页长约束，子项M=Σmᵢ不受该页长约束，实体/字符串宽度W使应用内加载约随M×W增长；不是N+1，不从源码捏造实际SQL条数、生产时延或OOM。当前更新父字典响应也为计数读取其全部子项，归同一风险而非重复新ID。当前计数含ACTIVE和DISABLED，空ID/零子项为0，未来方案须保留。

建议先核对真实目录增长来源，再在隔离PG量化M/W、返回行、分配/堆、冷暖延迟和并发；讨论仅按本页ID做数据库GROUP BY投影。现有(dictionary_id,sort_order)索引和图标计数投影提供可参考形态，但数据库仍可能扫描M条，不能说计算量变O(P)。本批没有改SQL、索引、计数语义或导入限制；其他旧工单/拆分/作业/DHR/导入性能风险仍按原ID待讨论。

已实施的最小提取仅10行一基页码hook，其调用方负责实际success/fetch/placeholder资格，领域页保留查询、父子选择与删除所有权。没有迁移零基FormListPagination或全站列表。

其他大模块具体方案：ModelTab先提读取hook，拥有templateId/查询/页长及成功边界，保留实例分页分母和设计store/history所有权；再提只接收已分页记录的报表组件，不自行重取全量。Menu的IconSelectorField已有props边界，可提为领域组件，读取状态另由query hook负责，不把图标删除或菜单提交带入选择器。字典计数若获授权优先repo聚合projection复用，不先重构整个controller。上述尚未实施，详见源码辅助方案。

## 验证限制

既有`verify-process-modeling-pages.mjs`引用已退役`0014-process-modeling-permissions.sql`，固定基线与本候选均因ENOENT退出，未执行其余完整断言。master当前只包含baseline两文件；脚本还依赖多个旧迁移名字，不能仅改一处路径假称旧断言已有效。列为后续验证工具维护，不改业务规则迎合它。当前字典/模板静态脚本及40 Node通过；官方strict基线/候选各19项完整多重集合除行号一致且均exit2，ESLint缺配置exit2仍保留。最终实际验收范围以本批质量原件为准。
