# W4响应一致性与W2装饰预览

本批L2基线`edhr-dev@26796235085b9759295f3dfff8e078ded3cd5ed8`，PR32已人工合入且树与e718b185相同，无额外契约或产品增量。生产管理弹窗重新设计仍user-deferred，WorkOrderPage及其下载导入测试脚本与目标逐字节不变。

## 正式验收

全新独立对干净候选`8eeefac024a496fa27ec8d9201f8b31110e5ab65`正式passed/FINAL，12/12必需检查通过。PG47项中45通过、2原opt-in性能观察跳过，新增6项全过；知识89、浏览器2组、TypeScript/构建与设计器静态验证通过，预览基线两红独立重现。实际核对flush非commit及审计失败回滚，生产管理弹窗两文件逐字节等于目标。

原件见[evidence/quality-result.yaml](evidence/quality-result.yaml)、[独立说明](evidence/quality-review.md)、[安全运行证据](evidence/quality-evidence.json)；其中/tmp路径映射本目录档案，原件字节保持。W4-CREATE-OUTPUT-READ-OWN-WRITES-001和UI-DECORATIVE-PREVIEW-SEMANTICS-001据本次独立范围关闭，不覆盖完整业务链或全站。全部角色FINAL后已向用户完成PR前范围/整体进度复核，见[scope-review](scope-review.md)。受测后仅L0归档与交付登记，产品、测试、知识内容保持；自建隔离PG已按确切ID停止并自动移除。

## 规则先行但不机械对齐

本体角色已对8条有限记录评估来源、当前适用性及合理性，not-applicable/FINAL，无知识或政策变更。创建响应与随后的GET应给同一对象一致解释，是当前DTO/读取路径的一致性要求；NO_DATA/NOT_STARTED/UNSUPPORTED是工程枚举，非用户逐字业务规则。当前SN产量算法未支持，缺失数量不等于实际0，不能借修复新增算法或回填历史。同事务flush不是commit，必须保留逐对象审计和失败整批回滚。见[evidence/rule-assessment.json](evidence/rule-assessment.json)。

## W4-CREATE-OUTPUT-READ-OWN-WRITES-001

承接PR31/32留下的批量响应最后对象可见性线索。真实JWT/MockMvc/完整干净PG基线复现：批量BATCH和SN各3条时，最后一条POST.output为NO_DATA，而提交后GET分别为NOT_STARTED和UNSUPPORTED；同组单条创建及审计失败回滚对照通过。首轮6项中2失败、4通过，无测试错误或跳过。这是状态解释不一致，未证明产量或历史证据丢失。

根因：splitBatch逐条调用split，JPA派生查询让前面对象逐步flush；最后对象仍待写。Controller响应组装转入ProductionOutputService的JdbcTemplate查询，JDBC不会自动触发JPA flush，漏读本请求最后新对象。单条路径本轮通过，是重要反证，不把所有创建概括为错误。

最小修复：批量创建结束后在原事务内`productionObjectRepository.flush()`一次，再返回对象列表供响应组装。没有改变锁顺序、事务提交点、逐条校验、审计、数量、制程或查询算法；不是批内上下文复用等性能实施。新增四个单/批、BATCH/SN场景严格比较POST与GET完整output，并验证没有虚构quantity；另两个审计故障场景在flush后验证对象及对象审计零行、已分配量0。

主侧修复后3套后端测试47项：45通过、2原有opt-in性能观察跳过，无失败/错误。跳过的是需pg_stat_statements显式配置的容量测量，不是新增业务或浏览器夹具；本批未重新运行历史性能测量。旧N-1产出返回行观测属于当时源码历史，新增最终flush改变末行可见性，不将旧数字继续认证为当前候选。

## UI-DECORATIVE-PREVIEW-SEMANTICS-001

沿原静态核实的去重根因`ui.preview-enabled-button-semantics`，涵盖WorkflowActionConfig用户操作预览与DesignerSidebar指针ghost两处。它们使用pointerEvents:none的启用MUI Button，仍有BUTTON角色和普通Tab停靠。真实浏览器两处红例分别证明静态预览含2个按钮、拖动ghost为BUTTON。

只对装饰预览添加`component="span" role="presentation" tabIndex={-1}`，MUI源码属性顺序确认显式role会覆盖其自动button角色。保留Button原样式/文字，不用disabled改灰预览，不改变实际配置控件或真实字段卡指针处理。浏览器候选2组通过：配置名称修改实际onChange且预览更新、Tab跳过装饰区；真实CanvasTab/Zustand指针拖放生成字段绑定、保留撤销历史、ghost消失。没有伪造drop消费者或替换组件逻辑；场景不写真实后台。

辅助源码报告仅核对两个位置/MUI实现及必要指针/存储代码，不是正式质量验收。字段卡的非拖动替代入口仍需沿其他真实入口继续审查，不能从本测试推定Enter可插入字段；未清理旧未使用原生drag helper。

## 检查、限制与进度

前端构建含TypeScript、设计器既有静态验证通过。新浏览器脚手架首次因不存在的bundle.css退出，安全记录单列fixture-initial-error.json；修好静态宿主后才取得两条真实产品红例，没有降低断言。PG/浏览器红绿及安全hash在evidence，不归档可能含测试认证信息的完整后端日志。

官方严格扫描基线/候选仍27项，完整finding多重集合增减0，均exit2。修好的装饰span仍可能被工具按大写Button误报，人工验收单列，不为扫描绿灯改业务。npm lint仍缺ESLint配置exit2。当前静态残余为标准滚动条样式回退和登录校验归属/运行证据，不冒称全站或全键盘交互已通过。

本批实际核对生产splitBatch、Controller响应组装、Output读取/汇总和两处预览；8条有限规则评估分别计数，不升级为全文件或全库完成。完整W2/W3/W4、W5横向、W6必要拆分和W7集成仍未完成；旧总账与原失败记录保留。性能方案（工单按页聚合、批内复用、作业匹配复用）待讨论，TaskDetail签名、记录控制变更/作废及DHR high/A12、分块和知识gap保持各自暂缓。

相邻候选：WorkflowActionConfig的普通审批转办说明仍含“受当前节点审批主体范围约束”，需下一批对DEC0081、实际使用profile和委托路径重新核对，不据一行文字直接改变运行规则。下一轮优先无依赖W2/安全与构建遗漏，不长期只跟新增bug。正式独立质量在收尾取得，不自动合并、部署或恢复历史。
