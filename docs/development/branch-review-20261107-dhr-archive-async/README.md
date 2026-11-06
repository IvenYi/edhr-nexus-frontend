# DHR 未启动下载流的临时 ZIP 清理

L2。固定目标 edhr-dev@764258b869567c0f7840f16ff1358ed5c2491f53；PR70 已人工合入，整树同 d689c031d478e96b098591d320981a7b7cc9ba54，无外部代码、知识或契约增量。本轮承接上一批明确保留的未启动流/异步拒绝/排队超时队列，不重新收尾 PR70。数据库分页方案仍未取得实际答复，未实施。

确认 medium 缺陷 **W6-DHR-EXPORT-UNSTARTED-STREAM-001**：Service 已生成 ZIP，Controller 只在 StreamingResponseBody 中删除。执行器拒绝任务、接受任务后排队超时，或客户端在排队期间取消请求，body 没执行时会留下当前请求的临时文件。重复失败可能积累磁盘占用；不将合成实验外推为生产故障频率或容量结论。有限源码/历史去重未发现已关闭同项；PR70 修复的是双重失败覆盖原异常，本项是其明确留下的资源归属缺口。

最小产品修改只有 DhrArchiveController：使用 Spring 既有 Callable 完成回调，并以请求内一个 AtomicBoolean 分配一次清理归属。body 先取得归属，继续 PR70 原 Closeable TWR；请求结束先取得归属则删除尚未交给 body 的 ZIP，晚到 body 被拒绝。完成回调不会提前删除活动 body 的文件；重复回调不会再次删除同路径后来出现的文件。响应元信息构建的同步失败也清理并保留原异常。清理本身失败时记录自有路径和异常，同步主异常附加 suppressed；不进行自动重试、递归扫删、未知孤儿扫描或持久对账。

成功字节、文件名、HTTP 查询参数、权限、原件/摘要/冻结范围及审计次序保持。额外 NativeWebRequest 是 MVC 注入参数。EXPORT 仍在流之前保存，失败不会回滚已经记录的生成审计或已发送的 HTTP 状态/字节。只处理当前请求创建的临时副本，不等同 DEC-0090 受控归档、放行、备份或恢复能力。

## 实际验证与原始证据

初版主侧 **95/95**、知识 **89/89**，均 0 failures/errors/skipped。95 包含真实 HTTP 5、归属单元 5、原 Service 故障 7、原流 6、原生 PG 导出 12、FormFiles 4、layout 3、hash 48、event 2、aspect 3。原流六项断言保持，仅补框架请求上下文。原21个运行输入见 initial-main-analysis.json；隔离装配修正后主侧重新运行同 **95/95** 全过，21输入与当前一致，最新同字节旧源仍 **5=2正3文件遗留F/0E/S**；见 main-analysis.json。仍待另一全新独立质量，不能以主侧绿覆盖初版failed。

初版 clean 8fc765dd 的全新独立质量正式 **failed/FINAL：94/95，知识89/89**，原件和报告完整保留。normal实际返回200/164字节且文件已删，但executor started=2，严格的一次执行断言失败；首次请求Tomcat MimeHeaders发生ArrayIndexOutOfBoundsException，HeaderWriterFilter的servlet finally与worker commit同时写头，随后存在第二次GET。客户端自动重试只是符合时序的推断，未做客户端协议跟踪；没有超时证据，不归因250ms或ZIP CAS。

主侧核实际security6.3.0和当前产品SecurityConfig，共享默认lazy header writer；确定性依赖微例lazy有2线程/2次writer、eager仅1线程/1次。全局eager会改变304、自定义Cache-Control及reset边界，当前FileController两处private,max-age=300预览也会残留先加的Pragma/Expires，故本轮不直接修改产品全局策略。只在已声明独立的Basic测试链显式eager，隔离其非ZIP归属干扰；所有五项原断言、真实Tomcat及可控执行器保持，未增加重跑/容错或放宽一次执行要求。原产品响应头竞态另列open，不能把夹具修正说成产品响应头已修。修正后的同字节旧源5负对照与新95必须重新通过，并换另一全新实例最终复验，初版failed不能覆盖。

初版旧产品两次 HTTP 负对照均为 **5=2 正控/3 真实文件遗留失败，0 errors/skipped**。初次负对照之后仅增加测试 profile，隔离嵌套配置避免污染另行运行的完整 PG 应用；随后初版 negative_context 与初版最终同字节。修正eager装配后再做最新同源负对照，不拿旧配置结果代替。所有阶段及配置差异原件保留，未降低断言或把编排错误计为产品红。

最新旧源工作树首轮因未提供frontend依赖软链，在renderer构建步骤退出127，JUnit执行0项；原件保留negative_context_setup-failure。主侧补独立工作树依赖软链后原测试/产品字节不变，重新运行才得到5=2正3真实失败，不混计构建失败与断言失败。

HTTP 用例运行真实随机回环端口 Tomcat、Spring MVC、Controller 和方法权限。安全使用独立合成 Basic 身份、生成 ZIP 的 Service 为 mock；不是产品 JWT、GlobalExceptionHandler、数据库和 PDF 的完整 HTTP 链。正常响应精确字节/头通过；拒绝和排队超时均 body started=0、结束后自有 ZIP 已删除；无权请求在 Service/执行器之前拒绝。实验中的 500/503 是隔离测试配置的观察，不是生产错误状态契约。取消用例真实调用 HttpClient.cancel(true)，严格断言调用被接受；记录的 future.isCancelled() 为 false，因此只证明取消请求后最终结束的请求会清理，不声称即时服务器取消归因、网络中断时间或响应回滚。

五项直接归属检查覆盖：完成先于 body、活动 body 中回调不得删文件、重复回调及晚到 body 不得再次领取路径、删除失败可见 ERROR 日志、Files.size 同步失败保留原异常并清理自有符号链接。它们直接调用回调，不冒充真实网络活动流超时/断开验证。

原生 12 项使用完整 canonical Liquibase+0092 的自有 PostgreSQL、真实冻结/原件/ZIP/PDF 合并和审计。renderer 仍 mock 合成有效 PDF，不验证 Chromium 布局。11 个原观察区间共 33 个调用线程 SELECT，服务器实际 3 次 EXPORT/v2 审计 INSERT；11 份 JFR 独立重算读取量匹配。原观察没有服务器逐事件 tag，不将 33 称为全网络 SQL 或精确服务器区间归因。自有 PG 容器、HTTP 端口和临时根清理已核。

源码角色实际核对安装的 Spring 6.1.8：afterCompletion 遍历全部拦截器，不依赖 preProcess；submit 拒绝在异步启动之后处理，完成回调异常会被 Spring 吞到 TRACE，因此本地 ERROR 日志有必要。3 个依赖级微实验仅证明框架行为，不是应用或 PG 测试；源码/历史子项正式 FINAL。主侧和后续全新独立质量结果分别记录，不用旧批质量覆盖本批。

## 业务依据、健壮性与剩余边界

依据现有 rule.dhr-summary-zip-source-trace、DEC-0063 和 DEC-0090，未引入新业务政策。知识 0.3.25/schema 1.2.0/P0、350 知识资产保持；初版本体NA/FINAL，有限10=8一致/2gap，不冒充实际HTTP/PG运行。最新测试装配增量和全新最终质量另取正式回执。

A23：CAS 针对实际并发归属竞争，不为假设添加通用生命周期框架。私有清理方法复用同步失败/完成回调两处；已有活动 body 的 TWR 保持。不扩大拆分 Service，也不因行数统计声称大模块已审完。后续仍可按原方案拆分 ZIP 计划/源验证、渲染合并和响应交付边界；需要对应资格/冻结/审计/输出回归，不在本修复无关抽取。

仅关闭实证的未启动流清理子项。回调注册后、async listener/startAsync 建立前在框架外发生的异常未被本 hook 全面覆盖；真实网络活动 body 的超时/取消、Error/OOM、进程崩溃、磁盘失效、UNKNOWN 和持久对账仍保留。清理失败只留可诊断证据，不保证文件必然删除。共享 ACL/原件并发、上传/PDF/Office/导出容量、历史 ZIP/text-ID 索引及原性能队列仍待审。

整体仍为 W3/W4/W5 交叉与 W6 专项，W2 余项和 W7 新提交增量继续；原 931 知识/86 UI 候选、A12/高风险/完整矩阵、A23 含已审代码及用户暂停项保持。整文件完成数本批 0，历史 unique 未知，有限本体核对不计为全量已一致。全部角色及子项 FINAL 后再实际完成 PR 前任务漂移/阶段复核；不自动合并、部署、恢复或查询/触发 CI。
