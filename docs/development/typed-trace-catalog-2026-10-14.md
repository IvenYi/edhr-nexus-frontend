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

## 同日自定义项CRUD与配置解除

本轮追加用户确认：预置不能删除，自定义项应有CRUD；已被表单配置使用时先解除配置再允许删除，历史填报内容保留。操作列提供关联配置弹窗，查看所有表单配置项，支持全选或逐项勾选解除。此确认取代前轮“未新增自定义删除流程”的交付范围，本轮仍L2，起点0e05ebda。本轮门禁另行执行，不能复用上节结果。

最小实现及成功标准：目录仅自定义显示删除，服务端仍拒绝预置/陈旧版本/未解除配置；关联清单定位模板、版本、主表字段或子表列，可批量移除选定的对应追溯来源；其他追溯项、统计用途和画布保持。按实际sources判断引用，不以残留lookupItems误判；现存各版本均列入，不以持久status或生失效日期静默缩小清单，实际实例和DHR快照不列为待解绑配置。此范围与现有模板版本仍可编辑的原始源码一致，版本范围及行锁为inference工程选择。

扩展路径继续configuration与product-core，主开发拥有目录事务、模板来源解除、控制器/API和页面，本体拥有知识记录。直接影响目录删除、关联读取/批量解除、后端校验与两个候选缓存更新；传递影响是模板model_design_json、版本锁与更新审计。兼容迁移不增加schema，不级联删除实例/索引或改写运行/冻结快照；删除后目录不再提供该项作为新查询条件，历史原表单和DHR内容仍可查看。正式统计、真实归属、日期数字匹配、八项清单与三默认不变。删除与模板新增来源共享目录锁，批量解除按模板版本和锁版本核对，避免部分更新或覆盖刚保存配置。使用system.edit删除目录，关联读写同时要求master-data.form-templates，沿原模板设计授权与审计。

验证覆盖预置保护、自定义未使用/被使用/解除后删除、历史证据保留、全选与部分解除、子表及多版本、别项/统计/画布保真、陈旧版本及事务回滚、并发新增来源与删除、权限和审计、真实弹窗选择与缓存刷新。大规模关联清单性能、完整多人协作与A12历史视图不在本轮；已打开的设计器若之后主动重新添加仍存在的项，沿原保存行为处理，不把数据库乐观锁宣称为完整客户端协作协议。

本轮主开发6个聚焦后端类57项通过（目录PostgreSQL19、目录权限5、追溯权限3、解释器18、表单索引PostgreSQL8、DHR PostgreSQL4），目录样例数量角色名修正后19项单独复跑也通过；本轮BusinessKnowledgeModelTest59项通过，无跳过。前端31项聚焦测试与最终构建通过。日志/tmp/trace-crud-tests-final.log、/tmp/trace-crud-catalog-retest.log、/tmp/trace-crud-knowledge-tests.log、/tmp/trace-crud-front-tests.log、/tmp/trace-crud-build.log。

真实浏览器创建“虚构解除校验20261014”，通过模板API新建“虚构追溯解除验证表”V1/V2，每个版本主表两处、子表一处，共6关联，另含生产报工数量来源。未解除时删除返回400及明确提示；弹窗只选V1主表锅次A后返回200、剩5项；全选其余5项解除后无关联，再删除返回200、目录行立即消失。两个版本的4个字段、画布和goodQuantity统计来源保留，未替换实际实例/DHR冻结证据。截图output/playwright/trace-crud-bindings-selected.png。浏览器运行使用8088/3000独立开发库，错误夹具请求路径/数量角色已改正，不当作产品缺陷；完整模板发布/签署流程不在本轮验收。

本体trace_crud_ontology_20261014已返回updated，基线0.3.24，8份知识/架构资产、184份YAML、bootstrap及本轮59项正式知识报告核对通过。本轮独立质量尚待新实例结果，前轮typed目录门禁不代本轮CRUD。

同切片用户追加预览定位：每条关联提供预览入口，查看实际表单版式及字段位置。先平铺逐条，不增加表单分组；没有客户使用频率数据，不把虚构重复样例当常见业务的统计证据。预览使用独立受控接口（system.edit与master-data.form-templates同时要求），返回所选当前模板版本的model/canvas，并先核对version/binding/field确属此项；通过现有AppDialog/FormCanvasPreview按fieldId+tableId定位，字段和子表列只读高亮，返回保留勾选。关联已变化或未放置版式不伪定位。既有通用模板GET未带同样方法权限，属于原有相邻风险，本轮不借它宣称权限已证实，也不扩大为通用权限重构。

仅补两份新QA虚构版本的canvas用于预览测试，3处追溯来源与数量统计未修改，lockVersion从1递增为2；QA须重新读取画布基线，不把测试布局准备解释为产品业务修改。新增预览API及前后端源码定向24项测试/构建已通过，日志/tmp/trace-crud-preview-tests-final.log与/tmp/trace-crud-preview-build-final.log；独立质量最终范围须包含预览增量。

主开发实际预览显示仅main_a主表字段高亮，子表预览仅lot/details高亮，返回父弹窗保留已勾选项true；截图output/playwright/trace-crud-binding-preview-main.png、trace-crud-binding-preview-table.png。24项预览及CRUD测试包含空标识拒绝、解除后陈旧预览拒绝、两类权限与当前归属验证。追加预览后的新59项知识测试通过（time2.222，无失败/跳过），本体实例已返回最终updated。删除及字段解除的实际审计读取证实DELETE有前值无后值，模板解除UPDATE保留前后modelDesignJson和操作者。全系统回归、旧通用GET权限重构、生产规模清单性能仍未覆盖。

本轮最终ontologyResult.result=updated，预览追加后的基线仍0.3.24。独立trace_crud_quality_20261014已返回完整qualityResult.result=passed，findings/blockingConditions为空；baseCommit/headCommit均0e05ebda441acafd966869578b29963adac9798b，审查该起点之外已暂存的18个本轮代码/测试/知识路径，含两个新增TSX，排除output目录。独立最终7类后端116项（57功能+59知识）、31前端和构建通过，最后决策包写入后新知识59项也独立通过；日志/tmp/trace-crud-quality-tests-final.log、/tmp/trace-crud-quality-knowledge-final.log、/tmp/trace-crud-quality-front-final.log、/tmp/trace-crud-quality-build-final.log。

独立浏览器验证6→5→0→DELETE200、陈旧选择400与刷新、预置无删除、主/子表精确只读定位、返回保留勾选及1024布局。未放置字段通过只读响应替身验证明确提示，没有改数据库。QA夹具两版本的fields/canvas/workflow/统计来源完全保持，实例/执行/DHR/汇总/索引前后哈希一致；3笔模板解除UPDATE与1笔目录DELETE审计正确。证据/tmp/trace-crud-quality-baseline-db.txt、/tmp/trace-crud-quality-after-db.txt、/tmp/trace-crud-quality-audit.txt以及output/playwright/trace-crud-quality-preview-main.png、trace-crud-quality-preview-column.png、trace-crud-quality-1024.png。质量实例未修复代码或数据，仅按授权在专用虚构夹具验证CRUD，自己的浏览器已关闭；不把这些检查宣称为全系统或通用GET权限验收。历史目录入口/A12与生产规模性能、完整多人设计器协作保持暂缓范围。
