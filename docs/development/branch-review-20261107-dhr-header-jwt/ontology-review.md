# DHR 实际JWT下载响应交接：本体有限核对

正式 **not-applicable / FINAL**。固定最终候选703f2ee90417e778cf745fbbcd24f908a345d3bd，目标及实际读取契约基线b6691e2c6289ab414a7a3fed1f128562cbba4166；最终再次fetch目标未变。知识0.3.25/schema1.2.0/P0 in-progress保持，无业务冲突、新用户问题或知识修改。当前最终源绑定时共享工作树实际clean；来源/目标/契约不能由知识版本号代替。

## 实际执行与证据来源

本角色实际执行知识校验 **89/89、0 failures/errors/skipped**，fresh XML、命令、UTC起止时间和日志均保留。初始固定21份Git原件和单列未提交DP上下文，最终读取4个产品文件diff、更新后的同一DP及README；350知识文件逐字节与初始、目标、候选及工作文件一致，validator和5份治理/角色契约不变。350仅为文件指纹盘点，不是350条语义一致结论。

最终32个父侧运行输入与候选Git、当前文件及受测快照逐字节一致。父侧生成的最终XML独立重算125/125、0F/E/S；最新严格同字节旧源13项=10正/3真实Assertion失败、0 errors/skipped，旧SecurityConfig、JWTfilter及Controller匹配目标Git。HTTP测试源码与最终一致，见parent-final-source-binding.json及latest-negative-source-binding.json。父侧最终阶段原名final_verified；本包parent-generated-evidence/final是规范化的被接受运行副本，实际原路径保留在run.json和final-verification.json。

**本角色没有运行应用HTTP、PostgreSQL、JFR、浏览器或CI**。父侧真实JWT/Tomcat、PG及源码微例分别按各自原件解释，本报告只读取其中与业务边界相关的记录，不冒称独立质量门禁；新的未参与修复质量实例另行实际运行125+89。初始知识89执行与父侧125 XML核读来源严格分列，未把旧通过或失败计数相加。

## 有限权威结论及实现边界

有限权威子项及ASYNC身份补充均completed/FINAL。原10条=8 consistent、2 evidence-gap；ASYNC补充只复核原受影响子集，新增unique=0。原17成员和8成员补充均SHA验真并原样保留。8一致只限本次工程边界，不能推为整个DEC0063/0090、全知识或原W2-W7审计完成。

- rule.dhr-summary-zip-source-trace、DEC-0063-10/11/12：同显式冻结版本、FULL/SELECTED、原件字节/摘要、目录及审批范围保持。DhrArchiveService、FileController、JwtTokenProvider及GlobalExceptionHandler逐字节未变；原view+export方法资格及流前EXPORT顺序保留，导出传输失败不承诺回滚生成审计或已发状态/字节。
- 导出专用filter通过AntPathRequestMatcher匹配路径（不另设业务HTTP方法政策），包围初始HeaderWriterFilter链；GET及其HEAD沿原MVC映射处理，其他方法仍原样下传由原映射/认证判定。filter以new实例只进入安全链，不作为容器Filter bean双注册；monitor属于一个请求，不是全局锁。body同一monitor内领取归属并TWR复制，inline同线程可重入；完成清理不等待monitor。
- 现有默认lazy安全头和FileController私有缓存保持，不使用全局eager、不复制默认writer、不升级跨大版本依赖。父侧实际三个预览入口的private,max-age=300、无Pragma/Expires记录及源码保持，与依赖级304/reset微例不是同一种运行证明；不将局部缓存回归扩为所有资源缓存认证。
- JwtAuthenticationFilter仅让ASYNC按同一原Bearer重新执行原验签、subject/permissions及AuditContext恢复；不新增actor、签署或权限政策，不permitAll、不加session、不改ERROR默认策略、不放宽无效/过期token。初始认证的原规则继续适用，不将“原有效Bearer请求在重新派发丢身份”解释成新的业务拒绝政策。
- WAITING/BODY/FAILED/CLEANED是临时响应/资源归属的工程状态，不是DHR业务生命周期或归档状态。ASYNC并发结果为Throwable、尚未commit且body未领取时才原子标记FAILED，使用Servlet长度-1清ZIP长度、清ZIP ContentType并将attachment置明确inline，让原异常处理器输出其原500/JSON；保留安全头、回调清理和晚到body拒绝。活动body/已commit响应不修改、不回滚。
- DEC-0090-01/03/04及term.dhr-archive：冻结版本、下载副本与最终放行后的受控归档继续区分；本修复不交付归档/解封/放行/备份恢复，也不新增保存期限、自动销毁、跨租户或归档签名规则，原specified/internal及P0成熟度保持。

两项evidence-gap继续保持：scenario.dhr-archive-minimum-evidence-and-access仍需真实归档事务/访问/固定证据及备份恢复验证；question.multi-tenant-workflow-isolation仍是原非MVP开放问题。实际JWT签发/验签采用合成claims/key及mock ZIP生成器、文件仓库，不是实际登录目录/数据库的全HTTP链，不能关闭完整租户隔离。

## 失败历史、残余和交付限制

父侧阶段原件按其实际结果保留：最初编译throws遗漏0JUnit、首probe遗漏addHeader导致max0属于编排/夹具校准；正确旧控再证header max2/拒绝及超时401；恢复身份后124/125运行曾出现错误JSON沿用ZIP长度导致EOF，随后Disposition null仍残留attachment的聚焦失败，均未被最终125覆盖。最终采用长度-1/inline是Servlet实际行为下的错误实体修正，不降低原字节/状态/权限或单次启动断言。有运行摘要的历史XML副本见parent-run-history.json及parent-generated-evidence/history，最新严格旧控另存latest-negative；0JUnit等完整编排日志以主侧本批evidence/main.zip归档为准，不为未执行用例补造XML。

本工程切片不新增业务政策或权威知识，故ontologyResult为not-applicable；changedArtifacts、conflicts及questions均为空。请求monitor非可中断等待、初始下游filter永久挂起、真实网络活动流超时/取消、Error/OOM/崩溃/UNKNOWN持久对账和容量仍为明确边界，不把可靠交接解释为所有传输必定成功。原未答DB分页/索引及性能方案不由merge或本体核对当作批准。

整体仍W3/W4/W5交叉与W6专项，W2余项/W7增量、原931知识/86UI候选、A12/高风险/完整矩阵、历史ZIP/text-ID/上传PDFOffice容量/共享ACL并发、A23含已审与用户暂停项继续；本批整文件完成0、历史unique未知，不累计有限重核为全量覆盖。不修改仓库，不查询或触发CI，不合并、部署或恢复数据。全部本角色子项均正式FINAL，无在途孩子。
