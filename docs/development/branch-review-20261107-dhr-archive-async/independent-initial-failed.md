# 最终独立质量：failed / FINAL

本实例未参与任何实现或修复，固定 detached 候选 `8fc765ddf566517c22487564e1bbbc9a0e435e9a`、目标 `764258b869567c0f7840f16ff1358ed5c2491f53`。独立 fetch 目标仍为该提交，契约原字节一致。L2 门禁本次不能通过；没有改业务代码、测试、夹具、配置或断言，没有重跑绿覆盖失败。

实际运行 **95=94 pass/1 failure/0 error/0 skipped**，知识 **89/89**。唯一失败为新 HTTP 正控：`normalHttpStreamReturnsExactBytesAndDeletesOwnedArchive:78`，预期 started1，实际2；normal.json 记载 HTTP200、164字节、submitted2/started2、自有文件不存在。精确字节和头的前置断言通过，并非“normal返回500”失败。

原始日志显示17:06:06.384Z第一次授权，06.395Z约11ms后 Tomcat `MimeHeaders.getValue` AIOOBE。Servlet线程栈沿 `HeaderWriterFilter.doHeadersAfter`，worker栈沿 `Files.copy`→`SaveContextServletOutputStream`→同一 HeaderWriterFilter。06.419Z有第二次GET，06.498Z再次授权。与连接错误后客户端自动重试相符，但没有客户端trace，保留为推断。第一次 timeout 记录直到07.962Z，为 HOLD 用例；不支持“250ms正常路径冷启动误超时”的归因。未证明此异常由新增CAS引入，也未验证产品JWT安全装配，不能把它写成已确认业务缺陷；同样不能忽略实际正控失败或擅自调整timeout。

正式发现 **QF-DHR-ASYNC-NORMAL-HTTP-001 / medium / open**。主侧需要定位正常HTTP装配中的安全头与异步输出边界，做必要修复；包括夹具修改在内的修复后，按L2换全新未参与修复实例验收。其余94项的通过不能覆盖该必须检查。详见 `quality-result.yaml` 和 `normal-http-failure-extract.txt`。

其他四项真实嵌入式HTTP（拒绝、排队超时、取消请求后最终完成、无权）通过，均保留其Basic/mock Service实验边界。cancel(true)断言通过但isCancelled记录false，不当立即服务器断开证明。直接回调五项全过：完成先于body、活动body不提前删除、重复回调与替代路径、清理失败ERROR、同步元信息失败；不冒充真实网络活动流取消验证。

独立核对主侧两阶段负控，均5=2正控/3真实文件遗留失败、0E/S，最新negative_context的HTTP测试与候选同字节，旧controller匹配基线。107份主侧归档和71份源码原件逐成员SHA核验。双方21个运行输入匹配候选；原Service不改，原stream6断言仅补NativeWebRequest上下文。

原生PG12及相邻回归通过，完整canonical+0092、冻结/原件/ZIP/审计真实运行，renderer仍mock。本实例重算11份JFR、11观察合33个调用线程SELECT，未称全网络或服务器逐窗口归因。3次实际服务器EXPORT/v2 INSERT的20参数重新构建固定顺序JSON并计算SHA，全部匹配；见analysis.json。知识350文件不变、0.3.25/schema1.2/P0保持；89验证不等同全量语义核查。

只读源码子项已正式FINAL，无源码新缺陷；直接核对Spring6.1.8的回调遍历、Future.cancel及吞TRACE语义。A23中请求内CAS和复用小helper有明确实证，不引入大框架。业务冻结、权限、EXPORT在stream之前的次序和DEC0090边界保持。

自有PG容器已删除，HTTP端口42863关闭，JVM临时ZIP无遗留；测试时仅自建frontend/node_modules依赖软链是未跟踪路径，跟踪源码全程不改，验证后删除自身软链，最终工作树clean。保留原run.json的真实dirty记录，不伪造clean。实际测试阶段17:05:05Z—17:06:09Z约64秒，知识21.229秒另跑；原件详录。

pre-async setup/活动body真实网络timeout、Error/OOM/crash/UNKNOWN持久对账、容量与原W2-W7/A23/931知识/86UI/A12/高风险/完整矩阵等队列继续；不自动merge/deploy/恢复/扫删/触发或查询CI。
