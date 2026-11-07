# 响应交接、A23及后续审查

固定b669→受测703f2ee9，源代码映射不是整文件完成证明。原始JWT/Tomcat时序实验、真实文件预览和原native PG回归分别记录；源码/官方依赖角色不冒充应用HTTP运行。

| 请求资源状态 | body能否领取 | completion能否领取文件清理 | 未commit异步错误能否改ZIP实体头 |
|---|---|---|---|
| WAITING | CAS到BODY | CAS到CLEANED | CAS到FAILED后允许 |
| BODY | 已交给原TWR | 否，不提前删活动文件 | 否，不回滚活动/已发响应 |
| FAILED | 否，拒绝晚到body | CAS到CLEANED | 只由第一次失败CAS处理 |
| CLEANED | 否 | 否，避免删后来替代路径 | 否 |

这些只是请求临时资源归属，不是DHR状态。BODY完成后仍表示TWR已消费其清理责任，不伪造再次callback清理。两个cleanup CAS覆盖WAITING/FAILED，保留PR70主异常/suppressed和PR71单次归属语义。ASYNC错误不拿monitor，因此等待或活动worker不能拖住completion；initial链与body之间的monitor只是当前请求，不形成全局下载串行。

SecurityConfig注册新filter实例在HeaderWriterFilter前；类无@Component/Bean注册，避免容器再挂一次。Ant matcher按防火墙后的servlet path匹配导出路径，真实非根context-path、GET/HEAD已覆盖。仅当前导出使用StreamingResponseBody；本轮源码搜索DeferredResult/WebAsyncTask/Callable/Emitter/CompletableFuture未见其他异步Controller来源（Callable只出现在该回调）。JWT只改变ASYNC重验入口，仍按当前时点执行既有过期检查；ERROR默认跳过未改，不扩大permitAll或session。没有添加未知路径、未来接口或任意请求属性的猜测性兜底。

框架6.3.0两个writer仍可能串行调用，这是原lazy语义，不要求只执行一次writer；只要求同响应不并写，并保留下载任务仅一次。全局eager的preview/304/reset反例和官方7.x依赖要求都保留，因此本批不复制安全writer、反射字段、升级跨大版本依赖或复制两套认证链。请求monitor非可中断，下游filter永久挂起不是本方案能恢复的故障；不得借此新增无限重试/扫描或声称崩溃后必然回收。

错误响应的长度与内容必须一致。Tomcat中setHeader(null)并非可靠的删除操作，本批用Servlet setContentLengthLong(-1)取消原ZIP长度，ContentType重新由原错误处理器选择，Disposition精确inline避免继续广告ZIP附件；安全头保留。只处理未开始/未commit错误，不用response.reset清空安全头，也不对已有部分输出承诺回滚。

前端源码映射见evidence/client-source-mapping.json：DhrSummaryPage冻结版本导出调用downloadDhrArchive，当前同会话/代际401会clearAuthStorage并returnToLogin。因而错误401具备使有效用户返回登录页的源码路径；本批未运行浏览器验证，不将其说成已复现实际页面退出。前端文件与基线逐字节相同。

N+1、SQL循环、内存分页及上下文复用：本批4产品改动没有新增SQL、分页、文件整块数组或跨请求缓存；原native observer33和读取JFR保持，不等于全系统这些问题已审完。monitor额外等待来自初始安全链退出，主侧强制700ms测试调度不作生产性能数据。原PDF缓冲、多附件、共享ACL/原件并发和导出容量仍需专项。

另有后续上下文复用候选：现JwtAuthenticationFilter先validateToken，再取userId/username/displayName/permissions；当前provider各方法独立parseClaims，正常非空displayName路径每次派发会解析/验签约5次。ASYNC修复复用现有逻辑，会在该派发再次做这些既有校验。这里只做源码计数，未量化CPU或判为性能缺陷；可后续比较“单次派发一次验签后复用claims”，仍须保持当前过期/权限/无效处理，不跨请求缓存或擅自省去验签。按用户要求先量化讨论，不在本批优化。

长模块仍按既有具体拆分方案推进：DhrArchiveService.export的writeFrozenRecords保目录排序/成员数/source_snapshot/hash及单表PDF；writeFrozenSummaryAttachments保原件/SHA/顺序；appendTraceManifest保提交截止/AS_OF_EXPORT与审计签名窗口。需要对应回归与必要的容量讨论，不为行数建通用导出引擎。本批仅有精确响应交接部件，没有大模块无关重构。

整体W3-W5交叉/W6，W2余项/W7增量、931知识/86UI候选、A12/高风险/完整矩阵、性能/容量/A23含已审及用户暂停队列保持；整文件0、历史unique未知。数据库分页选择未答未实施。全部角色及孩子FINAL后由主侧实际复核当前范围、阶段和下一步，不能仅以本页计划代替。
