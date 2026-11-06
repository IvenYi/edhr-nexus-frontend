# StreamingResponseBody 安全响应头并发：只读增量核对

本角色仅核对固定源码、实际安装依赖和依赖级微例，不修改产品/测试/配置/知识，不承担最终 QA。原 /tmp/edhr-archive-async-source-20261107 FINAL 原件保持不变。契约/目标基线为 edhr-dev 764258b869567c0f7840f16ff1358ed5c2491f53；本次观察工作 HEAD 为 8fc765ddf566517c22487564e1bbbc9a0e435e9a。产品安全类取固定 Git；新增生命周期测试单列为工作上下文。知识基线仍 0.3.25/schema1.2.0/P0 in-progress。

## 1. 本次信号及证据边界

复制独立 final QA 的原始 maven.log 和 http/normal.json，保留来源；本角色没有重跑这套 HTTP/PG。该次运行 95 项中 1 项 normal 断言失败，不能报告全绿。normal.json 为 200/164 字节、submitted=2/started=2、自有 ZIP 已删除；测试期望 started=1。HTTP 200 和字节吻合不消除服务端异常或多次调度的异常信号。

17:06:06.395 的首个堆栈是 Tomcat 10.1.24 MimeHeaders.getValue 下标 8、容量 8，经过 CacheControlHeadersWriter → HeaderWriterResponse.writeHeaders → HeaderWriterFilter.doHeadersAfter。随后同类堆栈经过 HeaderWriterResponse.onResponseCommitted → OnCommittedResponseWrapper.checkContentLength → ServletOutputStream.write → Files.copy → StreamingResponseBodyTask。这里记录来源链路，并不把微例说成已重新产生相同 Tomcat AIOOBE，也不单凭堆栈推断第二次 executor submit 的完整因果。

## 2. 实际安装 Security 6.3.0 字节码

bytecode/和 dependencies.json 固定 spring-security-web/config 6.3.0、Tomcat 10.1.24 的路径/大小/SHA。8 次 javap 均退出 0。

- HeaderWriterFilter 构造函数明确 shouldWriteHeadersEagerly=false。默认 doHeadersAfter 创建 HeaderWriterResponse/Request，执行 chain 后在 finally 调 response.writeHeaders。
- 该包装响应同时在输出 commit/满足内容长度等路径调用 onResponseCommitted → writeHeaders。writeHeaders 的检查和实际 writer 调用没有同步或原子领取；OnCommittedResponseWrapper.disableOnCommitted 是普通 boolean，且 disable 动作在 commit callback 写完头之后。即便某线程稍后 disable，也无法阻止另一线程已进入 writer。
- HeadersConfigurer.createHeaderWriterFilter 创建同一默认 HeaderWriter 列表，经过 postProcess 再 addFilter。其 getHeaderWriters 默认包括 nosniff、X-XSS-Protection、缓存、HSTS、frameOptions；没有自动启用 eager。
- setShouldWriteHeadersEagerly(true) 只改变 filter 执行分支：先以原 request/response 同步调用原 writer 列表，再 chain；不创建这个 HeaderWriterResponse 包装器，也没有 lazy finally 的第二个写入口。因此它可避免本例 HeaderWriterFilter 两个线程入口之间的并写；它不是对所有 Servlet 响应访问的通用线程安全保证。
- Tomcat MimeHeaders 的初始数组容量为 8，count/headers 可变且相应 add/set/grow/read 无同步。已有真实失败与这一共享可变状态竞争相容，但本角色没有在微例中重现数组损坏。

## 3. 实际运行的依赖微例：10/10

HeaderWriterConcurrencyProbe.java、probe-execution.json、probe-result.jsonl 保留准确命令和输出；43 个 classpath jar 单列 SHA，security-web/config 均只有 6.3.0。使用真实安装 HeaderWriterFilter、HeadersConfigurer 默认 writer 和 Spring MockServlet，**没有启动 Spring 应用、容器、HTTP、数据库或 JWT 链**。

两项确定性调度微例用单个带屏障的自定义 writer：lazy 下 worker 输出内容长度满足触发 commit，主线程返回 chain 进入 finally，同时 writer 2 次/maxConcurrent=2；eager 下仅 main 先写 1 次/maxConcurrent=1。该屏障用于证明真实 filter 的入口竞争，不是实际默认 writer/Tomcat AIOOBE 重现。

八项默认 writer 微例分别以 HTTP/HTTPS、普通/304/自定义缓存/reset 对照：

| 下游行为 | eager 与 lazy 结果 | 影响 |
| --- | --- | --- |
| 普通 200、不改安全/缓存头 | 两者完整 header map 相同 | nosniff、DENY、X-XSS=0、默认 no-cache 三头保持；HSTS 仍仅 secure 请求 |
| 下游将状态改成 304 | 不同 | lazy 的 CacheControlHeadersWriter 看见 304 不补默认缓存头；eager 在状态改变前已加三头 |
| 下游设置 Cache-Control: private, max-age=60 | 不同 | 最终 Cache-Control 同样被覆盖，但 eager 残留先写的 Pragma:no-cache 和 Expires:0 |
| 下游调用 response.reset() | 不同 | lazy 完成时补回安全头；eager 先写的头被 reset 清空，且不再补写 |

因此准确结论是：**eager 保留 writer 对象和配置，不保证所有终态响应头策略与 lazy 完全等价。** HSTS 的 matcher 仍是原请求判定，但执行时间提前；若下游会包装/改变该请求判断，同样需按实际顺序验证。

## 4. Basic fixture 与产品 JWT 的共因/差异

固定产品 SecurityConfig 没有 headers 定制或禁用默认 headers，JwtAuthenticationFilter 主要读取 JWT、建立登录上下文/请求 userId 与审计上下文，不写上述响应头。独立 Basic fixture 同样采用默认 HeadersConfigurer，因此两者共享前述 HeaderWriterFilter/流输出共因。产品方法权限、JWT 过滤器和 fixture 用户认证不是同一条真实身份验证链。

产品 CSRF disabled/stateless、Basic/form disabled、自定义 JSON 401/403；fixture Basic enabled、CSRF 默认值，允许 ASYNC/ERROR dispatcher。fixture 未导入产品 WebMvcConfig 的 /api/** CORS。不得把 Basic 真 HTTP 的证据外推为产品 JWT/CORS/401/403 完整验收。

子角色有限扫描另确认产品 FileController 现有 page-preview、inline/public-preview 会设置 private,max-age=300。这是全局 eager 缓存头时序差异的实际可达边界，不能仅当假想风险。DHR ZIP 入口没有显式缓存策略覆盖。完整固定行号、源码与搜索范围见附随 history-role 报告。

## 5. 交付给主审的技术判断

1. 本次真实失败必须保留为失败，直到定位与回归完成；不降低 started=1 等标准，不将 200 当全部正常。
2. eager 是真实依赖支持的消除该 HeaderWriterFilter 双入口竞争的局部机制，不需修改用户导出业务/超时政策；但全局配置影响所有 endpoint，范围和缓存/reset 边界要明确。
3. 若主审选择全局 eager，至少验证既有预览缓存三头、304、错误响应和必要的 reset 路径；若仅解决 DHR/已确认流下载，可考虑把时序改变限制到明确路径，以免顺带改变全应用策略。本角色不设计或实施修复。
4. 真 HTTP 修复回归要验证单次调度、精确 ZIP 字节、权限、拒绝/排队超时、自有文件清理及无同类服务端错误；产品 JWT/CORS 与真实 DB/PDF 仍应按其各自证据声明范围。
5. PR70 已关闭的主错误抑制修复保持关闭；当前增量属于真实验收新发现，不借此重构安全框架、改业务政策或宣称全审完成。A23 上应采用能消除已证竞争的最小机制，避免通用同步/重试/吞异常框架。

## 6. 主审已采用的范围决定

收到主审明确决定：本批**不全局修改产品 HeaderWriterFilter**。实际 FileController 缓存反例已证明不能声称全应用头策略等价；产品响应头竞争风险保持单独 **open**，后续按产品 JWT 专项复现/方案设计处理。主侧仅将独立合成 Basic 测试链显式配置 eager，以隔离与 ZIP 归属无关的测试链响应头竞争，保留 normal started=1 及原 5 项断言，并重跑同字节旧源负对照和最终 95 项。

该 fixture 修改不构成产品响应头风险修复；之后 ZIP 所有权验收通过也不能据此关闭产品 JWT/头并发待办。本角色未实施或重跑这些主侧动作，其最终结果以新原始产物为准。


本角色及只读子角色均正式 **completed / FINAL**，没有在途子项。history-role/ 完整保留子角色固定源码/工作快照/有限扫描与原件manifest；其javap成功9次、错误包名失败1次透明保留，未掩盖或当成功检查。父角色8份字节码均成功。
