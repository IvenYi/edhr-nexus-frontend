# 记录控制增量：最终夹具修正的本体来源绑定

正式结果 **not-applicable / FINAL**。当前clean候选`0f5d4354ed381adb07650548a2ec417969d2416d`，目标edhr-dev仍固定`07d6d4168a00a265afea8105db9a1a0e2554f683`。本次仅做从`594a1944682f21550fbbd1a108b852d3ef34655b`到最终夹具修正的来源增量：两处JSON键business_key改为schema实际business_id，新增20个目标申请/实例业务关联及M个背景实例业务身份计数断言。逐字变换已核对，差异只涉及原RecordControlPostgresIntegrationTest；产品、UI、知识、schema、权限和契约均无变动，不新增本体语义或知识写入。

原594a整套79份受manifest管理的原件及原manifest完整保留在initial-594a/，逐条哈希一致。原结果、源码绑定、32项有限核对、inventory、知识运行、脚本、source及final-source快照均未在归档中改写。当前root正式文件仅表示本次增量绑定，旧时点结论以原归档为准。

独立v1对594a的正式结果仍是failed：唯一medium QF-RECORD-ACCESS-001为未知business_key被PostgreSQL jsonb_populate_record忽略，克隆实例保留原business_id。其质量结果、独立报告、源绑定、manifest及fixture-proof SQL/log已只读核对并原样保存到historical-qa-v1-594a/。旧业务关联元数据完全一致的声明不成立；原q.workflow_instance_id与task.instance_id实际读关联正确，不因此推断产品权限bug。**原NA只说明无本体变更，不能替代质量通过。** 修正后候选需要新独立实例验收，本角色未给出qualityResult或merge许可。

当前知识353文件仍92MD/261YAML，全部与07d6及594a逐字相同，清单摘要`2e3d2a99a029a15bce571cdba937e11c4f864a66d7c12a0053a7d6e56d02c5b1`。2848同口径资产ID来自原inventory，不重新枚举、不把旧931子集当同一分母；全量清单仍pending。原32项有限语义核对（30在限定范围一致、1精确部分替代、1既有非阻断完整多租户问题）保持，不在此次重审或新增覆盖数，成熟度仍knowledge0.3.25/schema1.2.0/P0 in-progress。

原规则结论按原范围保留：DEC0096仅部分替代DEC0087-09的记录控制IN_REVIEW申请详情只读限制；通过认证ID反查ACTIVE且trim/casefold用户名admin，普通ADMIN角色或显示名不授予例外。详情可读不扩展任务详情、审批、签署、转办或撤回资格，DEC0074凭证的精确小写admin为另一作用域。canViewDetail/canViewActiveRequest是权限投影，后台真实详情继续复核。历史7c2c+未提交来源说明保留，当前实际实现由07d6与最终候选快照绑定；没有为了本轮改写历史provenance。

本角色原已实际执行知识89/89、0F/E/S于07d6，原日志/XML/命令/时间保持。此次只校验原记录354输入指纹（353知识+pom）及整个tools/knowledge-model树未变，**没有重跑89，也没有声称在0f5重新运行**。该复用仅覆盖结构/引用/投影，不代表全量语义、产品或性能通过。

主侧final原件路径`/tmp/edhr-record-access-increment-20261110/final`已实际重新运行9类127/127、0F/E/S，9XML重计一致（RecordPG69，其余相关58）。run.json真实运行时HEAD是594a且测试文件dirty，不能改写为在clean0f5运行；40实际输入均与clean0f5 Git、当前文件及原source快照逐字一致，所以只作tested-bytes绑定。本体只读这些原件，未代跑产品或访问数据库。独立v2由父侧另派，本报告不预先宣称其通过。

最终12组观察与24份原服务auto_explain计划已核：4角色、0/5000/20000背景任务、每页20份合成元数据申请，只有原始单申请详情来自真实提交。8表前后摘要不变是原测试断言范围，不虚构摘要字符串。晚命中reviewer42在2万背景时task SeqScan20loops/每次过滤20010，page SQL本机约70.223ms；其他角色不能概括成同样扫描。时间和线程累计分配不是生产SLA或峰值，不把克隆称全新签署业务流程。只认性能风险，未改SQL/索引/资格，优化仍须按用户此前要求讨论。

历史状态分别保留：focused因幂等键克隆重复3E；retry早命中127P；verified晚命中但business_key仍错127P；独立v1正式failed；final修正后主测127P。它们不相互覆盖，之前绿灯不能验收新提交，原失败也不改成passed。UI输入未变，已有58workflow/11人员/build/列表/字体是父侧或v1历史运行；本体没有重跑。strict86项遗留且与2dc集合相同、lint缺配置exit2，不能称全UI通过。

无repo改动，无孩子，无SQL/索引/权限/业务规则修改，无合并、部署或历史数据恢复。W2–W7、A12/高风险/完整矩阵、性能容量与UNKNOWN、A23含已审复核、用户暂停的通用工作流签名密码页及生产弹窗仍在原队列。此次整文件完成0、historicalUnique未知，整体审计未完成；独立质量和主侧PR前漂移复核由对应角色完成。
