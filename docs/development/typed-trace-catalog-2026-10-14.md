# 追溯项目录与类型化查询修正

本轮沿DEC-PACKAGE-20260929-FORM-PROJECTION执行L2，基线0.3.24；起点0e0474a6。用户确认未注释建议采纳，并补充四项：保留客户订单号；工单默认、设备默认隐藏；其余预置是固定展开条件且不可删除；自定义增加日期、数字，引用兼容延后。追加问答确认日期范围、数字精确值。来源为user-confirmed；冠骋原始8类与安速康表头只作original-evidence参考，清单不能伪称竞品部署事实。

预置为生产批次/SN、物料批号、工单号、设备编号、物料编码、产品编码、供应商批号、客户订单号，共8项。默认显示前三项，其他5项在展开区；动态添加只含自定义项。订单沿既有客户订单含义，不泛化为采购等任意ERP单据。旧产品序列号、相关生产批次号、责任班组、关联单据号退出当前目录；不机械把组件SN改成本单SN。原生受控引用对保留预置继续有效，新自定义引用兼容明确延期。

工程选择：日期项只接受日期字段(datetime mode=date)，按实际保存的日历日期匹配闭区间，允许单边范围；不替换为创建、修改或报工时间。数字项只接受数字字段，按十进制数值精确比较，1与1.0同值，零及负数有效，不加数字范围。目录类型创建后不可改变，显示名称与描述仍可维护。仍无删除API或删除入口，不能删除预置；本轮不新增自定义删除流程。

## 影响和实现

扩展路径为configuration（客户定义含义和类型）及product-core（类型契约、索引、查询及来源证据）。主开发拥有目录、模板兼容、保存索引、查询、迁移和前端；本体仅同步知识。未增加客户条件分支或任意统计模型。

- 直接影响：FormLookupCatalogService/管理页面创建text、number、date；服务器冻结类型，前后端按类型筛选来源。FormLookupValue统一数字与日期规范。form_trace_value增加value_type，保存时只采集明确绑定且合法的值，草稿非法/空值不阻断、不进入索引。TraceCondition统一SQL及DHR实际证据谓词；既有文本filters继续使用，日期独立dateRanges对象，不在字符串里拼接协议。
- 传递影响：表单AND和命中定位继续按同一表单/实际子表行；DHRAND允许不同真实成员贡献，当前与终止快照用同样的类型谓词核对，不解释为一笔跨行事实。来源变化仍停止旧高亮并提示重查。
- 潜在影响：已有MVP模板撤项后需显式重新配置；类型不能修改防止历史重解释；异常数字、无效日期、逆序区间需提前拒绝，不能让SQL转换任意内容。
- 不受影响：正向真实关联、来源授权、生产/DHR归属、生命周期、电子签名、最终业务统计及三个业务报表固定条件。
- 迁移：新增0112，旧索引value_type默认为text，拓展目录类型约束，删除仍标为builtin的旧4项。保持原迁移校验和；不重写已有实例快照、填写内容、统计事实或组件SN绑定。旧开发模板保存时明确提示项退出目录，按已确认MVP开发数据政策处理。
- 快照与审计：新类型从服务器目录进入模板快照，后续索引读取使用时定义；创建类型进入既有审计，更新不能绕过类型不可变。未新增审计动作或签署权限。
- 权限：沿原system.edit、模板设计、表单读取、production.execution及DHR读取组合，无新增授权或绕过。
- 测试：目录创建/冻结/类型拒绝、8项迁移及旧绑定提示；数字规范和日期闭区间/非法输入；真实PostgreSQL保存索引、同实际行、DHR跨成员和终止快照；原文本引用、业务筛选与权限；前端来源候选、构建、浏览器类型控件、默认/固定/动态、展开保留与重置。
- 证据缺口及暂缓：日期时间追溯、数字范围、多选、自定义引用类型、自定义删除生命周期、A12历史版本，以及生产规模性能不在本轮。

## 本轮验证

主开发执行10个聚焦测试类，共120项全通过、无跳过：61项功能/权限/解释器/真实PostgreSQL测试，59项BusinessKnowledgeModelTest。日志/tmp/typed-trace-tests-final.log；数据库测试使用edhr_form_projection中的一次性schema并清理。前端31项相关来源/侧栏/报表/导航测试及最终npm run build通过，日志/tmp/typed-trace-frontend-tests-final.log、/tmp/typed-trace-build-final.log。未执行全系统回归。

实际开发环境为8088 backend、3000 frontend，仅独立edhr_form_projection库；0112启动迁移执行成功。UI新增虚构实测温度20261014(number)与虚构检验日期20261014(date)。通过真实模板设计API保存类型绑定，临时虚构模板版本发布标志仅用于测试准备，不作为发布流程验收；挂载到虚构对象992018并通过真实SAVE动作暂存两行，得到FR-20261014-000010，填报中。虚构样例由旧布局复制，修正了本次样例的画布列布局；只调整新虚构样例布局，不作为生产证据或审计修订流程验证。

浏览器数字1.00与2026-10-14闭区间提交filters及dateRanges，实际返回表单1份，数字规范为1，命中第一行稳定rowKey；数字1与第二行日期2026-10-15组合返回0，不能跨行拼接。DHR查询返回1份，详情traceConditionsSatisfied=true，命中同一实际来源及第一行。默认3项、展开其余5项已实际核对；来源详情显示子表第1行，蓝色边框只命中第一行的1与2026-10-14，第二行2与2026-10-15未高亮。1024像素宽度下日期项名称单独一行、两个日期与移除按钮下一行，控件完整可见。截图output/playwright/typed-trace-source-hit.png、typed-trace-narrow.png为本轮实际虚构样例证据，不作为客户数据。

本体typed_trace_catalog_ontology_20261014返回updated，基线保持0.3.24，184 YAML解析、bootstrap引用及差异校验通过；正式59项由主开发本轮执行。

本轮全新质量实例typed_trace_catalog_quality_20261014返回passed，无findings或blockingConditions，未参与代码、测试或数据修复。独立执行7个后端类109项（50项功能、59项知识）、28项前端聚焦测试和最终构建，全部通过、无跳过；实际浏览器复核默认/固定/动态边界、错行排除、日期逆序提示、展开保值、重置与方向/类型切换、1024布局、目录类型不可变及无删除入口、DHR完整目录命中与首行高亮，以及三业务页面固定查询隔离。日志/tmp/typed-trace-quality-tests.log、/tmp/typed-trace-quality-front.log、/tmp/typed-trace-quality-build.log；独立截图output/playwright/typed-trace-quality-form.png、typed-trace-quality-1024.png、typed-trace-quality-dhr-hit.png。目录弹窗原有公共FormDialog的Emotion nth-child开发提示未作无关样式改动。

```yaml
ontologyResult:
  result: updated
  knowledgeBaselineVersion: 0.3.24
qualityResult:
  result: passed
  baseCommit: 0e0474a66cba53614a25d0c7242cbac475b50f08
  headCommit: 0e0474a66cba53614a25d0c7242cbac475b50f08
  workingTreeState:
    status: dirty
    scope: 本报告影响节所列代码、0112迁移、聚焦测试和知识资产，含五个本轮新增文件
    excludedPaths: [output/, gmp-platform/frontend/output/]
  knowledgeBaselineVersion: 0.3.24
  findings: []
  blockingConditions: []
```

上述质量结果覆盖提交前工作区，不用相同HEAD冒充代码未变。实际样例准备不证明完整模板发布/签署/审计修订流程；未执行全系统回归或生产规模性能测试。日期时间、数字范围、多选、自定义引用兼容/删除生命周期及A12历史视图明确暂缓。
