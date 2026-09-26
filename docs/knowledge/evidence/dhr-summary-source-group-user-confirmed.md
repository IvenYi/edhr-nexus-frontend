# DHR 汇总来源分组与展示整理确认

知识基线：`0.3.24`；修订日期：2026-09-25；`specified/internal`。
来源：用户本轮明确指令、统一 DEC-PACKAGE-20260919-DHR-SUMMARY、主设计第 6～11 节。

## user-confirmed

原位修订 DEC-0072，不另建重复决策。来源键为 originKind + operationId + formId；作业区分工序及节点，自定义区分创建项，同模板不同来源不合并，键缺失按实例独立。

全部实际关联实例自动归集，未完成、失败、作废、替代状态不隐藏，也不冒充合格完成。整组及单份操作只整理展示位置，不构成证据纳入选择；x/y 只能表示自定义整理进度。组内不得静默跳过非完成记录，空来源不造证据。适用缺项及未完成补录等检查继续阻断提交；表单 COMPLETED 不等于检验合格。

同源可分目录或交错，草稿与冻结只读按实际顺序显示，仅相邻同源折叠，A1/B1/A2 不变为 A1/A2/B1。取消自定义位置恢复默认位置，证据和审批范围不变。

全来源真实实例支持草稿别名：组行限当前范围、相邻折叠行限本段、单份限一份；保存重开、提交冻结及新草稿继承，旧版空别名回退原名。来源内容/身份、生产归属和基础快照不改，DIRECTORY 固定基础位置不变。目录去独立份数，单例也有列表按钮，行点击预览首份，拖拽单落点；工作区概览与右侧来源入口保留。

## original-evidence：本轮静态核对

`summarySourceGroups.ts` 实现上述来源键；空目标只过滤自定义 placements，`DhrSummaryPage.effectivePlacements` 补回默认位置。`DhrSummaryService.validatePlacements` 给全部实际实例默认位置，提交逐实例冻结；`prepareNextDraft` 与 0101 的 display_name 保留别名及继承。源码及新增测试文件存在，尚未经本体角色的真实浏览器、PostgreSQL 或独立质量复验，完整设计仍为 specified/internal。

## secondary-reference、inference 与验证边界

此前 2026-09-24 分组、别名、H2 和隔离浏览器报告属于旧语义，保留于 Git 和既有证据索引，不复用为本轮验收。本轮未重新读取冠骋原代码，其旧描述只能作参考线索，不证明当前设计。

具体布局、动画和文件格式是实现选择。本轮仅知识与文档，正式 BusinessKnowledgeModelTest 用于结构/引用/投影校验，不证明 DHR 运行、真实数据库、浏览器或发布能力。
