# 追溯项目录切片 · 2026-10-07

这是同一 `DEC-PACKAGE-20260929-FORM-PROJECTION` 下的 L2 实现记录，接续[最终设计评审](form-projection-final-design-review-2026-10-07.md)和同日侧边确认。整体流程图使用 [Mermaid 源文件](diagrams/form-projection-overview-2026-10-07.mmd)。本记录只证明下面的目录切片，不代表完整投影 MVP 或所有设计问题已经关闭。

## 实现范围

2026-10-07用户补充：产品统一称“追溯项”（此前称“查找项”），页面遵循仓库统一 UI/UE。菜单、设计器、查询、管理、校验及新审计文案同步；稳定 ID、API、表名和历史审计原文保留。旧默认菜单缓存按路径兼容更名，不覆盖客户自定义名称。沿用统一列表壳、查询面板、字段设置、分页、详情抽屉和表单弹窗；范围说明放列表工具栏，新增/编辑使用“基本信息”分组及“描述”字段。

- 管理员在“系统 → 系统管理 → 追溯项管理”新增追溯项、修改名称/说明、查看详情及实际审计。沿用 `system.edit` 写权限；制表或有来源查询权限的人员可读取候选项。
- 产品当前支持文本精确查询，来源可为普通文本字段或子表文本/单选列。新项自动进入设计器兼容来源候选和追溯页条件，无需已有绑定或数据；查询时填写具体值。
- 保留子表与主表分散字段两种来源。新定义由服务端按稳定 ID 写入模板配置，并随现有使用时快照保留；不用字段名猜含义，不新增发布冻结。
- 自定义项接入既有首次最终完成、成功投影后的查询。待处理/失败、真实生产归属、原报表和 DHR 关联保持原契约。多条件继续要求同条投影明细同时满足，子表不能跨行拼条件。
- 查询结果显示命中字段及来源快照。无新绑定的旧实例不因名称/值相同而获得新含义，也不重写历史快照。

当前工程范围为新增及显示信息维护；ID/类型不可编辑，不提供删除、停用、合并或改类型接口。这是最小实现范围，不是用户已确认完整目录生命周期。统计模型仍由产品维护，客户新追溯项不自动成为统计指标或实体关系。

## 预置项与引用边界

迁移 `0108` 预置12项文本含义：物料批号、产品序列号、设备编号、责任班组、关联单据号、生产批次号、工单号、物料编码、产品编码、相关生产批次号、客户订单号、供应商批号。参考来源见[冠骋原始源码复核](form-projection-final-design-review-2026-10-07.md)，预置名称不表示对应实体解析或业务动作已经完成。

本轮没有扩充原生引用对象、建立文本到实体解析或打通引用ID与文本编码的联合检索。原生引用选择/校验仍不以投影配置为前提；Q6 的范围、唯一性、编码变更/复用、未匹配/多匹配策略及 MVP 纳入尚未定版。普通文本的物料匹配应由显式对应用途触发、次要展示，不能从名称和值自动推断；这一确认已同步知识资产，但匹配能力未在本切片实现。

## 验证记录

主开发在本机独立 `edhr_form_projection` 验证：

- 90项聚焦后端测试，零失败/错误/跳过，包括6项真实 PostgreSQL 目录集成测试、4项新增方法权限测试及原投影/模板/执行回归。测试使用随机临时 schema，结束清理，不操作现有业务表。
- 本体专业实例返回 `ontologyResult.result: updated`，基线维持0.3.24；正式 `BusinessKnowledgeModelTest` 59项通过。DEC-0075-23/24/25保持 specified/internal，不冒充全功能已验收。
- 前端6项投影交互/预览测试及 TypeScript/Vite 构建通过。运行日志位于本机 `/tmp/edhr-lookup-catalog-tests.log`、`/tmp/edhr-lookup-catalog-frontend.log`、`/tmp/edhr-lookup-front-tests.log`，不提交生成物。
- Liquibase 在原独立开发库增量应用0108成功，新增1张目录表及12行预置；启动日志确认137个 change sets 中本轮执行1个。未在 `edhr_dev` 执行迁移或写入，未做生产迁移/回滚演练。
- `form-lookup-catalog-demo.py` 通过真实 API 新增目录、保存模板、启动执行、最终完成、查询及来源回查；确认完成前无结果、命中字段/冻结定义和实际创建审计。演示重复执行保留已完成证据。先前一次种子生成因产品制程唯一约束回滚；改为独立虚构产品后完成。先前脚本尝试未配置的SAVE动作被正确拒绝，随后按配置完成；未回写已启动执行快照。

浏览器主开发已验证目录新增/编辑（数据库revision由1到2）、实际创建审计页签、无绑定项出现在查询条件并返回零结果、演示项精确查出1份表单与来源预览、设计器新候选选择与保存重开。保存后模板有两项绑定，旧完成实例仍仅有原绑定。1440×1000及800×900布局已查看；修正查询按钮换行和详情抽屉被应用导航遮挡。实际截图保留于本机 `output/playwright/lookup-catalog-list.png`、`lookup-catalog-narrow.png`、`lookup-catalog-audit.png`、`lookup-source-preview.png`、`lookup-designer-custom.png`，不提交输出目录。模板列表有既有DOM嵌套警告，登录初始连接时有短暂网络错误，不宣称浏览器全程无控制台信息。

第一轮[独立质量结果](form-lookup-catalog-quality-2026-10-07.yaml)为failed，发现两项medium，主开发已修复：

1. 原五个内置项改名会漂移历史显示：新保存也保留其目录定义，查询返回各批次冻结定义，列表及详情统一按冻结名称；无目录快照的旧来源使用原v1固定名称，不回写旧实例或回退当前目录别名。新增真实PostgreSQL回归。
2. 客户名称括号内容被设计器删除：字段、子表与总览的追溯项保持管理员完整名称；产品统计属性的既有说明缩写保持原样。

修复后主开发完整重跑上述后端命令，150项（91项功能及59项知识）全部通过，零失败/错误/跳过；前端6项及TypeScript/Vite构建通过。最终日志为 `/tmp/edhr-lookup-catalog-tests-final.log`，其余日志路径同上。测试范围未覆盖全系统、大规模目录性能、所有客户表单或生产环境。

全新且未参与修复的质量实例返回 `qualityResult.result: passed`，见[最终独立质量报告](form-lookup-catalog-quality-final-2026-10-07.yaml)。独立执行74项后端/知识测试，术语更新后再次执行59项知识测试、菜单检查及6项前端测试，均通过；实际浏览器确认两项缺陷修复、动态候选及查询、名称快照、创建/编辑/审计、旧菜单缓存和统一弹窗/列表规范。本体结果为 `updated`，基线0.3.24；两个适用门禁均完成，结论仅覆盖本切片。

相邻残余已记录：旧来源在1200×733窗口显示6个命中时，既有详情分组会被压缩并重叠；共享网格组件产生SSR开发提示；不宣称整个报表视觉或全仓脚本无缺陷。独立库保留明确命名的虚构QA追溯项及审计，不向真实业务库导入。

术语与统一UI增量后：再次通过前端构建（`/tmp/edhr-lookup-catalog-terminology-build.log`）、菜单管理静态检查和6项投影测试；本体增量DEC-0075-26、同义术语及59项正式知识测试通过。后端编译启动于8087，仍使用独立库。额外旧脚本 `verify:system-menu-pruned` 失败4项：它要求删除所有“表单模板”菜单/路由及FormTemplate实体/仓库，与HEAD已有模板建模能力冲突；已用 `git show HEAD` / `git ls-tree HEAD` 确认均为基线既存，不因本轮改名引入，未为通过该脚本删除业务能力。

## 拉取后的复现

沿用[独立环境启动说明](form-traceability-projection-running.md)：Java21、Maven、Node/npm、PostgreSQL；只启用 `projection` profile，默认后端8087、前端3007、数据库 `edhr_form_projection`、上传目录 `uploads-projection`。分支不提供数据库隔离。已有同名独立库直接增量迁移，新环境创建空库；不要复制真实业务数据。

```sh
# gmp-platform/backend；服务启动后，仅在独立库生成虚构样本
python3 scripts/form-projection-demo.py
python3 scripts/form-lookup-catalog-demo.py
```

新增脚本使用985001–985009配置ID及 `LOOKUP-DEMO-*`，复用基础演示路线；通过API保存模板和生成正式证据。不要自行占用这些虚构ID。目录示例为“虚构演示灭菌锅次”，在追溯页查询 `DEMO-POT-001`；来源为 `LOOKUP-DEMO-BATCH`。配置种子初始化不作为用户操作审计证明，目录创建、设计保存和生产动作走实际API。

```sh
# gmp-platform/backend；不要与另一个 Maven 构建并发共享 target
PROJECTION_TEST_DATABASE_URL=jdbc:postgresql://localhost:5432/edhr_form_projection \
  mvn -Dexec.skip=true -Dtest=FormLookupCatalogPostgresTest,FormLookupCatalogAuthorizationTest,FormProjectionInterpreterTest,FormProjectionPostgresTest,FormProjectionAuthorizationTest,TemplateProjectionAuthorizationTest,TemplateModelingControllerTest,FormFillSnapshotTest,ProductionExecutionEngineTest,BusinessKnowledgeModelTest test
```

## 保留边界

新含义对未关联历史的补充覆盖和自定义业务报表在二期。Q9表头共享、Q15独立查找索引状态/时机、Q17上下文自动带入生命周期、系统行身份、跨表事件关联仍未闭环；本次不为其设默认值。A12受控修订/作废继续按用户确认暂缓。批次/工单最终产出联动、复杂谱系、库存动作、报表导出、客户制表试用也未交付；当前预设报工/报废/消耗报表仍按工序用途展示。
