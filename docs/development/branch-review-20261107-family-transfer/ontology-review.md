# 产品簇成员转移有限本体核对

状态：FINAL。最终 clean 来源提交 `1709dbc4d3d28d8721ff001b69ad934a6de54d18`；目标/契约保持 `04db7e838ec5e194355ff954ff173a02205e0fd6`。

本批产品修复保持既有业务政策，仅在 `ProductFamilyMembershipService.transferMember` 的旧成员删除后显式 flush，落实同事务内先 DELETE 再以新 ID INSERT。核对发现两条既有 transfer fact 的来源定位错误，同批已作最小纠正，正式结果应为 `ontologyResult.result: updated`。此更新仅改来源路径、证据引用、定位和核对 provenance，不引入业务政策替代或成熟度提升。

实际读取契约、目标和原始源码固定于 `04db7e838ec5e194355ff954ff173a02205e0fd6`，目标 `edhr-dev`；本次契约无未提交修改。知识保持 `0.3.25`、schema `1.2.0`、P0 `in-progress`。最终源码已增量核对：契约无增量、知识字节与纠正后89项验证一致，产品源码/测试与主侧绿运行原件逐字节一致；详见 `source-binding.json`。

`fact.catalog.productfamilytransfer-confirmation` 与 `fact.catalog.productfamilytransfer-reason` 原指向没有确认/转移/原因入口的 `ProductProcessResolutionService`。两者现指向实际 `ProcessModelingController.transferProductFamilyMember`，复用已有 `evidence.process-modeling-controller`，来源版本固定为实际未改 Controller 所在的 `04db7e...`。`confirmed` 默认 false 并由 `requireConfirmed` 拒绝未确认；`second-confirmation` 保留为规则层语义标签。该入口不采集 reason，不虚构运行时 reason 属性读取。类型、操作符、aliases、规范、implemented/internal 及历史 Git 原件均保留，前后字段证据见 `fact-source-correction.json` 与 diff。

有限记录共 28 项：17 项直接、11 项相邻边界。DEC-0002-01/02/11 保持合格半成品/产成品、一个产品最多一个簇、事务/二次确认/不收原因/产品旧簇新簇三方审计。默认租户、同簇 no-op、新 ID 和 created 元数据、原审计内容/主体/hash、原权限均未改变。DEC-0002-10 保持未开工首次 START 当前归属/有效期/形态重核冻结与已开工快照不改；产品优先/簇兜底与已有引用合法性分开。DEC-0007-03/04 保持当前簇实时匹配后续工序和已有实例保留。既有 `implemented/internal` 不代表本批运行已通过；相邻 `specified/internal` 不因局部回归升级为 verified。

350 个知识文件已逐字节指纹盘点，指纹不表示全文件语义审查。纠正前全部与固定源相同，sha256sum 格式清单摘要 `31cda10a67b0f93565bd8cf9849d36bf37d5765513b7493925b70a1628b30d61`；纠正后 349 个相同、仅 `facts/core-business.yaml` 的上述 2 个 ID 变动，摘要 `ec67bff59cf2f8b848caa4ab70cc3ed2b2e2ad9dd08228679b95d6389d00a8b4`。逐文件清单见 `knowledge-before.json`、`knowledge-after.json`。

纠正后正式知识校验实际运行：`bash /workspace/.edhr-cloud-tools/mvn-edhr --batch-mode --no-transfer-progress --file tools/knowledge-model/pom.xml clean test`，89 项、0 failure、0 error、0 skipped，日志与 XML 已保全。纠正前曾跑一次 89 项 precheck，单独保存而不代替纠正后结果；最初直接调用不在 PATH 的 `mvn` 只产生启动失败，没有运行 Maven 或测试，同样保留原件。此校验覆盖知识结构、引用和投影等，不覆盖产品运行，也不机器验证本交接记录的所有自然语言结论。

已读取主侧负对照原件：13 项中 9P、3 个 assertion failure、1 个真实 DataIntegrityViolation error；后者发生在 tenant/product 唯一约束，不误写为 fixture 错误或 0E。修复后主侧最终运行原件 `/tmp/edhr-family-transfer-20261107/verified` 为 156 项、0 failure、0 error、0 skipped，已核对新ID/三方审计、失败回滚及提交前隔离的13项新测试与相邻回归；本角色只读取并绑定该原件，未独立执行。本体实例没有运行产品应用、PG、HTTP、浏览器或真实登录目录。主侧 MockMvc/JWT 链不是 socket/浏览器；SQL 种入产品/簇不是完整创建/START/多租户验收；自有 test DB 的 trigger/sequence 为失败注入，不是业务规则。

主侧各阶段原件透明保留：`final/setup-failure.json` 记录编排把现有 `ProductProcessResolutionServiceTest` 拼成 `ProductProcessResolverServiceTest`，输入查找失败发生在 Maven/JUnit 之前，实际执行 0 测试；`retry/test-summary.json` 为 156 项、0 failure/error、2 skipped；`verified` 启用既有 growth 观察和测试库 pg_stat_statements 后为 156 项全部执行、0 failure/error/skipped。前两个阶段不冒充最终绿运行，也未为通过削弱产品约束或断言。最终 25 个输入 SHA-256 与 clean 候选全部相同，负对照 service 同固定源，负对照测试与最终测试同字节。

相邻 bulkAdd 1/10/100 样本 8/62/602 SELECT 本轮仅观察。用户最新已明确同意下一批批量化预校验读取，并要求保留原实时复核、写入和审计；该授权作为下一批范围排队，本轮未实施优化，不改锁策略或事务边界，也不构成本轮 merge 授权。全审 W2-W7、931 知识/86 UI、A12、高风险、完整矩阵、A23（含已审）及暂停队列保持；本批 wholefile 完成数为 0，historicalunique 未统计。未查/触发 CI，未 merge、部署、恢复历史或扩大本体试点。

只读权威子任务已 FINAL，见 `authority-review.md`；它没有执行应用/数据库/测试。此最终记录及有限语义记录由本体角色负责，最终独立质量结果仍由主侧另行取得。

最终交付：`ontology-result.yaml` 为 updated；`finite-review-records.json` 为28项有限记录，`source-binding.json` 绑定 clean 源及主侧产品运行原件。主侧运行后仅文档差异为 []；产品/测试/结构字节全部相同。本次有限完成不代表全量知识审计或质量角色通过，亦不构成merge授权。
