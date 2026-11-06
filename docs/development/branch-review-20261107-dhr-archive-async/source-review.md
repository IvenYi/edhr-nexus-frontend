# 未开始流的临时ZIP归属：只读源码与依赖核对

正式结论 **completed / FINAL**。固定源码/目标764258b869567c0f7840f16ff1358ed5c2491f53，知识0.3.25/schema1.2.0/P0 in-progress，项目与交接契约按该提交读取。固定20份Git源码、当前未提交DP单列；没有修改仓库产品、测试、配置、知识或数据库。执行内容只有已安装Spring 6.1.8的javap静态字节码检查与3个依赖链微例；没有运行应用、真实Servlet/HTTP、PG、浏览器或CI。主侧的真实Tomcat负对照与最终质量不能由本报告替代。

## 1. 当前源码的清理所有权

固定Controller第33行同步调用Service生成ZIP；第34–38行只在StreamingResponseBody真正执行时通过Closeable TWR删除；第39–41行响应头及Files.size在body外。没有请求完成/超时/错误回调或其他持有此ZIP路径的清理注册。因此仅有正常body或已开始body抛错的分支具备现有TWR保障；body完全未执行时，当前Controller本身没有清理动作。这是源码可证的归属缺口候选，执行器拒绝/超时等实际HTTP可达性由主侧新试验确认。

PR70已关闭的W6-DHR-EXPORT-PRIMARY-ERROR-001保持关闭：Service两失败catch保存主异常与附属清理错误，Controller TWR保留输出主异常；本批不能重开或混成同一已修问题。原view+export权限及生成完成后先保存EXPORT审计、再交付Controller的次序保持。成功流仍不能承诺客户端已接收、HTTP已发状态/字节不能回滚。

## 2. 安装依赖的实际时序

原件见dependency-bytecode/和dependency-evidence.json（4个Spring 6.1.8 jar的路径/大小/SHA）。后端pom的Boot parent为3.3.0；本角色检查的是记录指纹的安装依赖，不声明生产部署版本已被远程核验。

StreamingResponseBodyReturnValueHandler.handleReturnValue先处理ResponseEntity状态与头，取得响应OutputStream，创建StreamingResponseBodyTask，再调用WebAsyncManager.startCallableProcessing。该Task.call先执行body.writeTo，再flush输出流；body负责的TWR在外层flush之前完成。这不能解释为网络/数据库原子交付。

WebAsyncManager.startCallableProcessing(WebAsyncTask,...), 字节码偏移161–213：先装timeout/error/completion处理器；218–226执行applyBeforeConcurrentHandling；229–231调用startAsyncProcessing；234–259才调用taskExecutor.submit并保存Future。submit段234–262捕获Throwable，交applyPostProcess后setConcurrentResultAndDispatch错误。beforeConcurrentHandling或startAsyncProcessing不在这段submit catch内。

StandardServletAsyncWebRequest.startAsync先检查request.isAsyncSupported，之后调用request.startAsync，取得AsyncContext才addListener(this)。如果这些步骤在实际启动或监听器建立前失败，不能假定容器以后会触发该对象的onComplete。onComplete依次执行completionHandlers并把状态设COMPLETED。

## 3. 关键结论：completion不依赖preProcess成功

CallableInterceptorChain.triggerAfterCompletion从interceptors.size()-1倒序遍历**全部**注册拦截器，未读取preProcessIndex。因此即使执行器拒绝、task未进入preProcess，已经通过正常async启动/结束的请求也可以由注册的completion hook回收未交给body的ZIP。不要把applyPostProcess的行为混淆进来：后者才从preProcessIndex倒序运行，未preProcess时其索引仍-1。

该afterCompletion链捕获每个拦截器抛出的Throwable，并仅在TRACE启用时记录“忽略afterCompletion失败”，随后继续其他拦截器。故完成回调里删除失败不能只throw并指望原HTTP改成失败或一定可见；应明确记录本请求自有临时路径及清理异常。是否未来持久对账/自动回收是另外范围，不要借此添加框架。

本角色针对真实安装依赖执行三个微例，原件CompletionChainProbe.java、dependency-probe.json/jsonl：

1. 未调用preProcess就触发completion，afterCompletion仍执行1次、preProcess为0。
2. 后注册completion抛IOException，链正常返回且继续先注册hook。
3. 排队Future先由timeout取消，之后completion仍执行。

三例通过，但它们只有依赖链对象、null NativeWebRequest和可控Callable/Future，没有启动应用或容器，不证明实际HTTP会触发全部路径。

## 4. timeout与body竞争：为何需要单次归属

triggerAfterTimeout和triggerAfterError首先cancelTask；有已保存Future时调用cancel(true)，取消本身异常被忽略。没有证据能据此推断运行中的body已经退出，或者所有executor都立即停止任务。超时与setTaskFuture之间也可能竞争；setConcurrentResultAndDispatch用于接受一个并发结果，不会自动终止已经运行的业务copy。

最小请求局部方案可用一个CAS领取标记，由body入口与请求completion竞争：body先领取则继续原TWR，completion不能提前删除其文件；completion先领取则删除尚未交给body的ZIP，晚到body必须拒绝已结束请求而不能再次读路径。标记即使清理失败也不应重置为“可供body使用”；应保留错误证据与剩余清理风险。该CAS解决的是本请求资源所有权，不是业务快照、全局缓存或新重试政策。

应实测body已开始时completion/timeout不会提前删、未开始时能清理，以及晚到body/重复完成回调的归属行为。不要用无条件completion删除取代TWR，也不要只在preProcess注册清理，因为拒绝时preProcess并不运行。

## 5. 仅Callable hook不能覆盖的边界

| 路径 | 仅Callable completion hook的源码保障 | 处置范围 |
| --- | --- | --- |
| 已async启动后的submit拒绝/排队超时，body未开始 | completion链遍历全部，适合未领取ZIP清理 | 主侧真实容器负对照/回归需证实 |
| body已开始，随后timeout/error | completion可能与copy并行，不能推断任务已停止 | CAS保持body归属，原TWR负责关闭/删除 |
| Controller内Files.size或响应构造失败 | Controller未正常返回，async启动尚未发生 | 需要同步失败清理或明确保留gap；保留PR70原异常/suppressed语义 |
| ReturnValueHandler取输出流、beforeConcurrentHandling、asyncSupported/startAsync在建立监听前失败 | 不保证后续onComplete | 若当前未覆盖，应明确保留而不是声称全生命周期已解决；不要为假设配置做大框架 |
| 进程崩溃/kill、硬盘故障、无回调 | JVM回调不能作可靠回收承诺 | 原UNKNOWN/持久对账/崩溃恢复队列保持 |
| completion里的删除也失败 | 链可能吞异常到TRACE，文件可能仍在 | 显式路径错误日志；不称已回收、不改HTTP完成结果 |

必要时标准HandlerInterceptor/Filter等可成为未来同步交接扩展点，但本报告没有建议立即添加跨模块清理框架；具体修复按已复现路径收敛。本轮不改变实际默认timeout、executor参数或用户导出资格，不设计新的业务超时政策。

## 6. 业务与历史边界/A23

rule.dhr-summary-zip-source-trace继续同一显式冻结版本、完整/选定范围、原件/摘要和权限；DEC-0090区分临时导出副本、汇总冻结和真正受控归档生命周期，不因本轮临时资源修复实现保存期限、归档/解封或备份恢复。

历史子项completed/FINAL，固定原件完整复制到history-role/。其有限检索13历史文档，原20261105-dhr-export/review-notes.md:32及PR70 findings/quality/independent/source报告均明确保留未启动body/async等gap；未找到已关闭相同项ID，不能据此称全历史唯一性认证。已关闭的PR70错误覆盖不重开。

A23：请求内CAS与已有TWR各有真实取消/并发语义依据，不属于无证据防御；不应加通用catch返回空ZIP、跨请求缓存、未知文件递归扫描、无限重试或新的权限兜底。组件应继续只有当前请求自有路径，没有客户端任意路径或旧冻结原件删除权。高层Service创建/审计阶段归属与Controller响应/body阶段归属有明确分界，不为行数重构。

本报告只完成固定基线的源码/安装依赖及微例核对；主侧真实HTTP、修复后源码与最终独立验证另行取证。全审W2-W7、931知识/86UI候选、高风险/A12/完整矩阵、历史ZIP/text-ID、上传/PDF/Office容量、UNKNOWN/持久对账/共享ACL并发、A23含已审和用户暂停项保持；整文件完成0、历史unique未知。所有本子项及孩子均正式FINAL，无仓库修改或更多在途工作。
