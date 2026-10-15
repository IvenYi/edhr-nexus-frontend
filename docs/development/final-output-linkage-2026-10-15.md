# 最终产出工序与数量链交付验证

执行级别 L2；基线 `edhr-dev@4b236d7d53e7792ad5831d77220b037f30b69e1a` 加本功能工作树，知识0.3.25/schema1.2.0。实现、主侧验证及全新独立质量最终复验已完成；本体结果 `updated`，最终质量结果 `passed`。首次质量报告的failed保留为修复过程证据，不作为通过依据。收尾重新fetch确认远端 `edhr-dev` 仍为同一基线；本功能工作树尚未提交或推送。

## 规则与实现

用户确认与精确范围见同包决策文件及DEC-0078：具体制程最多一个最终产出工序，可不设；成功的正式报工累计，同工序多次分别统计；批次取指定工序，工单只汇总所属批次；空值不等于0，部分结果显式未齐；最终产出按使用时产品单位核对，空/异单位保留原记录但暂不计入；旧实例不补算。用户后续明确否决逐工序单位配置和自动带入，普通工序按用户填写单位分组，不能混加。

- 配置：具体制程工序绑定增加`final_output`，服务端最多一个校验及数据库部分唯一索引；编辑、复制、审计、两个现存配置入口均携带标记，复用同一个复选控件。
- 冻结：新开工执行写`outputPolicyVersion=1`及工序最终标记；产品单位沿既有context快照冻结。旧无策略标识的执行显示历史未配置，不读取新配置追算。
- 来源：生产报工增加明确的`outputQuantity`数字角色，可复用同笔良品或不良的一个数字字段，不混同良品和不良，不允许跨笔重复来源。
- 权威计算：`ProductionOutputService`从已持久化的完整正式来源集计算，单次SQL读取本对象/工单的冻结配置、投影批次及记录；只计SUCCEEDED，不使用有限报表查询，也不另存会漂移的累计缓存。该读时重算是工程选择，不是新增用户政策。
- 工序按单位分组；批次只取最终工序且单位等于使用时产品单位的来源，工单不跨单位相加。待处理、失败、待核对及未配置保留可解释状态。批次共享自定义表单不因显示位置而被认领为该工序产出。
- 展示：批次与工单列表各一列累计产出，单位/未齐状态同格；详情展示最终工序、正式来源和计入情况，长明细分页。工单拆分对象表也有累计列，生产执行补充当前工序正式累计，报工流水增加产出字段。既有质量指标不由产出反推，生产和DHR生命周期不按数量改变。

## 原始竞品核对

本轮重新读取本地冠骋源码（路径见原TODO）：`operation-trigger.vue:50-74`有最终工序复选入口；`ProductNumDataService.java:128-159`合计该节点多笔good_qty并覆盖批次/工单。`ProductProcessingSubmitBs.java:76-87`的必选/唯一校验已注释，不能据此声称冠骋服务端严格必选。仅借鉴显式选择及全量累计，不照搬固定良品口径或保存即统计；未运行其部署页面。

## 主智能体实际验证

1. 后端9类134项，其中132执行通过、0失败/错误，2个条件浏览器夹具未启动。包含`ProductionOutputPostgresTest`实际隔离PostgreSQL9项、解释器19项、既有正式投影13项、生产执行68项及配置/控制器回归。新测试覆盖多次报工、双批次、普通工序单位隔离、真实0、空/异单位、待处理失败重试、并发、旧快照、数据库唯一性、子表实际行与多笔主表、批次共享表单排除。
2. 前端40项通过，含产出0/缺数/状态/多单位/来源展示、来源角色复用、报表和投影相邻回归；TypeScript及Vite构建通过。
3. 独立开发库`edhr_projection_integration_test`的8097后端启动，Liquibase执行0114成功。原8087及其旧模拟库未迁移或重启。
4. 通过实际API新建明确标识的虚构产品、路线、表单、DHR目录、制程、工单与两批次，并走真实生产START/SUBMIT/ADD_FORM_COPY/END_FORM/COMPLETE。A批前道100根，最终两笔10件+8件=18件；B批前道50根，最终9件；工单27件。完成响应曾显示PENDING，worker成功后API显示18/9/27，证明没有把表单完成直接当作已入统计。
5. 实际API拒绝两个最终节点；修改当前制程最终节点后，已开工A批仍定位冻结的last且产出18；恢复当前配置后通过PRODUCT owner接口复制V2，最终标记正确保留。
6. 真实浏览器3017→8097登录，批次列表显示18件与9件，A批详情显示10件与8件两份来源。实际操作旧产品制程工作区，前道选项在已选其他节点时禁用，最终工序回显选中；保存出现成功提示，API回读仍为[false,true]。后续全新独立质量实例核验工单列表及详情27件、A18/B9来源、执行工序100根/18件隔离、旧入口及审计中文、768×900窄屏，结果见最终质量报告。

复现：从backend目录运行`JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home PROJECTION_TEST_DATABASE_URL=jdbc:postgresql://localhost:5432/edhr_projection_integration_test mvn -Dtest=ProductionOutputPostgresTest,FormProjectionInterpreterTest,ProductProcessOwnerServiceTest,ProductProcessControllerTest,ProductionObjectControllerTest,ProductionBatchControllerTest,WorkOrderControllerTest,ProductionExecutionIntegrationTest,FormProjectionPostgresTest test`。前端目录运行`node --test scripts/test-production-output.mjs scripts/test-projection-*.mjs`及`npm run build`。

主侧最终日志在`/tmp/edhr-final-output-{backend-final,frontend-final,frontend-build-final}.log`；运行与配置证据在`/tmp/edhr-final-output-{runtime-evidence,totals,config-evidence,fixture}.json`，仅包含独立库虚构数据，不是旧安速康原表完整复跑。正式API与页面验证不由直接SQL伪造完成状态。

## 独立审查与边界

首次独立质量报告`final-output-linkage-quality-review.yaml`发现high：旧产品工作区保存会丢标记，以及medium：三处审计显示技术key。主侧已修复两个入口数据往返并复用控件，补中文是/否和字段名；高风险修复后交全新实例复验，旧passed测试不替代最终门禁。

最终门禁：

- [本体结果](final-output-linkage-ontology-result.yaml)：`updated`；实现支持的资产为 `implemented/internal`，知识89项通过，不伪造运行知识发布或`verified`执行契约。
- [全新独立质量结果](final-output-linkage-quality-final.yaml)：`passed`，10项必需检查通过；独立重跑后端134项（132执行、2条件夹具跳过）、前端40项、知识89项及构建，并只读核验实际迁移和浏览器。两项首次发现均已关闭，无阻断条件。
- 原8087/3007环境保留；验收预览为[批次列表](http://localhost:3017/production/batches)和[工单列表](http://localhost:3017/production/work-orders)，数据使用明确标识的虚构场景。

前端技能全项目静态审计已执行，存在既有未声明native select归属等问题，原始报告保存在输出目录；不把它声称为全项目UI合规，也不扩大本功能为全站重构。新组件沿既有MUI、表格、抽屉与权限入口，不重写全局视觉规范。

本轮不补旧数据、不实现SN自动产出算法、不改变良品/不良/报废统计口径、不实现A12修订作废数量撤回，不声称产品放行或远端CI通过。既有批次质量列仍取原独立字段，不能把其默认0当作本次正式报工质量汇总；本轮新增的产出列及对应来源独立解释。安速康旧原表模拟保留，未在本轮重新签署或定稿。

未执行规模性能压测。当前列表沿原有内存筛选分页结构，新增完整来源读取；大规模数据的查询次数、响应体积及延迟需另行实测，不能据小样本推断性能达标。
