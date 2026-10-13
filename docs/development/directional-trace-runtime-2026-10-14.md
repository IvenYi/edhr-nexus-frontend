# 表单与 DHR 正反向追溯修正

执行级别 L2；知识基线 0.3.24；沿用 DEC-PACKAGE-20260929-FORM-PROJECTION、DEC-0075-39 同一功能切片。此次涉及查询权限、真实归属、来源快照与命中定位，触发本体和独立质量门禁。

## 已确认范围与成功标准

- 三张业务报表使用产品固定查询字段，逐笔显示最终完成的业务记录；不查询追溯项目录，不添加任意条件。
- 表单正向按已成功保存的 PRODUCTION_EXECUTION 实例的实际归属与属性查询，未配置追溯字段仍可查。模板、未保存输入及其他未支持来源不在范围内。
- 表单反向复用显式绑定内容索引；主表条件同一实例满足，子表条件同一实际行满足。字段内容不改变归属。
- DHR 增加独立菜单及正反向查询；反向条件可分布在同一真实 DHR 的不同表单中，结果每份 DHR 一行。
- DHR 详情保留完整档案目录和全部表单，标记命中表单及实例，突出对应主表字段或实际子表行。单纯正向查询不伪造内容命中。
- 默认查看当前成功保存的生产证据；已终止 DHR 使用经过现有读取器摘要核验的终止快照。查询与展示使用同一来源基准，不自动跳到冻结汇总版本。
- 查询后来源变化时，表单提示重新查询并停止旧命中高亮；DHR 详情重新核对当前内容，条件已不满足则明确提示。
- 表单来源需 form-instances.view + production.execution；DHR 查询、计数和详情另需 dhr.instances.view；不产生新的写操作权限。

## 实现和影响

新增 TraceReportController、DhrTraceReportService 和固定属性过滤器；表单索引查询扩展正向与属性筛选，原反向接口继续可用。DHR 的实时索引仅用于缩小候选，最终命中来自同一次读取的实际 DHR 证据；终止对象不能用实时索引排除。先按完整结果核验和计数，再分页，命中身份不因页数或字段添加顺序改变。

前端复用当前列表、字段设置、列宽、分页、查询样式和 DHR 档案导航。增加追溯方向控制；反向按现有目录的 builtin 标记平铺预置内容项，自定义项经“添加查询条件”选择后填写。当前目录类型只有 text，本轮没有虚构日期或多选追溯能力。业务报表的展开区域仅折叠固定字段。菜单标准化为五个独立页面，旧配置自动补齐 DHR 追溯且不重复。

扩展路径为 product-core（查询、归属、命中与权限）和 configuration（已有追溯项目录），不使用客户分支；不新增统计模型、工作流、数据结构或迁移。不改变生产生命周期、最终统计、电子签名、放行、审批或冻结汇总证据。相邻影响包括共享 DHR 导航的只读标记及报告表格操作列；默认无标记时保持已有功能。

现行知识原位替换错误规则，不通过另加决策掩盖旧错误；用户原话及按日期的原始证据仍作为来源保留。冠骋证据复核区分如下：用户指定业务后端存在，但 GET 追溯接口核心在未取得的 gct-apaas-bed-controller 平台依赖中；前端实例属性查询、空条件加载及目录/实例标记属于 original-evidence。其服务端所有状态范围与此入口精确字段高亮仍是 evidenceGaps；我方字段/行定位依据 user-confirmed 需求。

## 验证记录

本轮 PostgreSQL 测试使用独立 edhr_form_projection 数据库中的一次性 schema，清理后不改现有业务行。浏览器验证使用 projection 配置（8087）和本地前端（3000），只读已有虚构样例。

- 主开发实际执行 `mvn -q -Dtest=FormTraceIndexPostgresTest,DhrTraceReportPostgresTest,TraceReportAuthorizationTest,FormProjectionAuthorizationTest,FormTraceIndexServiceTest,FormProjectionPostgresTest,DhrInstanceLookupTest,DhrSummaryServiceTest,DhrArchiveLayoutReaderTest,DhrAttachmentAndArchiveTest test`，59 项全部通过；追加固定业务条件拒绝测试后单独执行 FormProjectionAuthorizationTest，4 项通过。本轮合计 60 个不同后端测试用例，日志 `/tmp/trace-runtime-tests-final.log`、`/tmp/trace-runtime-authorization-final.log`。
- 前端最终 `npm run build`（TypeScript、应用及 DHR 打印构建）通过；`node --test scripts/test-projection-report.mjs scripts/test-projection-report-navigation.mjs` 共 7 项通过，覆盖独立导航、业务字段、稳定行身份及不能猜测缺失/重复行。
- Playwright 实际登录验证：表单正向 9 份，含 2 份没有追溯绑定的表单；反向无条件 7 份；物料批号 ROW-A-UPDATED 命中 2 份，列表明确子表第 2 行，详情仅高亮实际第 2 行。DHR 正向 7 份、反向无条件 5 份，同批号查询 2 份；打开详情保留完整目录，未命中模板及无实例节点未被删掉，命中表单和实例标记，原始表单的实际行高亮。消耗报表仅固定筛选，没有追溯方向或添加追溯条件控件。当前证据说明可见，以上页面无浏览器错误。
- 主开发截图：`output/playwright/form-reverse-row-hit-20261014.png`、`output/playwright/dhr-reverse-row-hit-20261014.png`。样例浏览器验证不替代终止快照、权限或跨表单 AND 的后端聚焦测试；未运行全系统回归或生产规模性能测试。
- 本体 `ontologyResult.result: updated`，基线仍 0.3.24，59 项 BusinessKnowledgeModelTest 和 YAML/引用校验通过；旧错误规则原位纠正，不新增决策版本。
- 全新独立质量实例 `directional_trace_runtime_quality` 返回 `qualityResult.result: passed`，审查基准为 `2d159c2454280a2415946ea2d457c335983ed3ce` 上本轮工作树（排除已有 output）。独立执行 60 项后端、59 项知识、7 项前端检查及共享列表样式契约，全部通过；独立浏览器复核 DHR 命中行、完整目录、固定业务条件且无目录请求。1024×768 下页面无横向溢出、关闭按钮可见、画布内部滚动正常；截图 `output/playwright/quality-dhr-reverse-1024-20261014.png`。未参与任何修复，最终 findings 和 blockingConditions 均为空。

## 明确边界

A12 历史修订反向查询、冻结汇总历史版本检索、日期与多选自定义追溯类型、批次/工单最终产出联动继续暂缓。DHR 反向对候选证据逐份核验以保证终止快照口径，候选规模较大时读取成本高于仅查索引；当前不承诺生产规模的性能上限。

## 同切片查询布局修正（L1）

用户确认报表查询严格沿用现有查询规范，方向页签与作业模板一致，反向默认条件来自现有预置追溯项。仅修改 TraceQueryPanel 和 FormProjectionReportPage 的前端展示及对应知识；本轮不改变 API、匹配、权限、状态、快照或目录标记。

复用 FormInstanceListPage/formManagementListStyles 的查询容器、40px输入框、12px网格间距，以及“重置、查询、展开”的图标、按钮尺寸和顺序；方向页签复用 WorkTemplateList 的48px顶部页签和分隔线。窄屏采用两列、按钮独占一行，避免按钮覆盖输入框；宽屏三列。自定义条件在窄屏保留两个输入列和30px删除列，不让操作独占下一行。反向默认按 builtin=true 显示全部现有预置项，自定义候选排除预置项和已选择项，不默认增加空行。真实归属属性保留于展开区；展开收起不清空值，查询仍区分 properties 与 filters。三业务页仍为固定筛选，无追溯目录或动态条件入口。

主开发本轮实际验证：最终 npm run build 通过；BusinessKnowledgeModelTest 59项通过；相关前端导航、报表字段与来源定位测试7项通过。Playwright 在隔离 projection 环境操作五个报表：物料批号 ROW-A-UPDATED 查询表单2份、DHR2份，自定义锅次 DEMO-POT-001 查询1份；展开收起保留归属属性和内容条件，重置清空，切换方向清除条件；三业务查询均200。1920px下预置输入框等宽且40px高，1024px下输入框等宽且操作按钮独占一行。截图位于 output/playwright/report-query-forward.png、report-query-reverse.png、report-query-dhr-1024.png；仅验证只读查询，未新增数据库数据或进行全系统回归。

本体实例 report_query_ui_ontology 返回 ontologyResult.result: updated，基线保持0.3.24。本轮全新独立实例 report_query_ui_quality 返回 qualityResult.result: passed，审查基准为37619670e2a0a070b02fd72216c51a4a7510ede5上的本轮工作树（排除已有output），未复用历史L2结果。独立执行7项相关前端测试，并实际复核五页查询、预置目录、动态排重、空条件反馈、展开保留值、重置及方向切换；1920px输入高40px、宽518.66px、页签高48px，1024px预置宽333px且按钮独占一行。发现并由主开发修复的低级删除图标换行问题已针对性复验：两输入各312px加30px删除列，同一行40px，删除对象正确；截图output/playwright/quality-report-query-custom-1024-fixed.png。最终blockingConditions为空，唯一finding已resolved。知识59项报告由质量实例独立读取，未声称其重新执行；未重跑完整后端、迁移、安全或全系统回归。
