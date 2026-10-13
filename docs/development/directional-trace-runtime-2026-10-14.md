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

前端复用当前列表、字段设置、列宽、分页、查询样式和 DHR 档案导航。增加追溯方向控制；反向仅常用预置内容项平铺，其余项目选择后填写。当前目录类型只有 text，本轮没有虚构日期或多选追溯能力。业务报表的更多筛选仅折叠固定字段。菜单标准化为五个独立页面，旧配置自动补齐 DHR 追溯且不重复。

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
