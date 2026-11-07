# DHR JWT 下载响应头竞态：源码与依赖增量

正式 **completed / FINAL**。本角色为主侧提供只读源码、安装依赖与官方来源证据，不是最终质量角色。固定 source/target/contractRead 为 `b6691e2c6289ab414a7a3fed1f128562cbba4166`；知识 `0.3.25 / schema1.2.0 / P0 in-progress`。启动时共享工作树 HEAD 仍为45858291，二者整树相同；本包14个输入均从明确的b669 Git对象提取并保留指纹，没有把在途测试算作固定源码。没有修改仓库产品、测试、配置或知识。

## 1. 已确认的当前根因入口

安装的Spring Security6.3.0 `HeaderWriterFilter` 默认lazy。servlet链返回时调用 `HeaderWriterResponse.writeHeaders()`；异步输出首次commit经 `OnCommittedResponseWrapper` 调到同一响应实例的同一方法。该方法只判断回调是否禁用，然后执行原writer循环，既无CAS也无互斥。servlet finally写完并不禁用后续commit回调，因此一次正常请求出现两次**串行**writer调用本身也属于当前可能行为，不能把writer调用必须等于一次当作局部门禁修复验收条件。

真实字节码见 `bytecode/HeaderWriterFilter.javap`、`HeaderWriterResponse.javap`。只核安装jar而不远程认证生产部署版本。产品 `SecurityConfig` 使用这个默认配置；JWT过滤器只认证、设置上下文及审计上下文，不写上述安全响应头。当前源码的 `StreamingResponseBody` 入口是DHR导出；但真正产品JWT、实际Controller与异常处理装配是否可达、如何返回错误，仍需主侧本轮HTTP试验，而不是由旧Basic试验推定。

这沿用已有 **W6-SECURITY-STREAM-HEADER-RACE-001**，与初版QF-DHR-ASYNC-NORMAL-HTTP-001是同一来源，不新增第二个产品缺陷。原Basic夹具eager仅解决隔离测试干扰；产品风险未由此关闭。临时ZIP单次归属、主异常/suppressed及流前EXPORT的既有修复不重开。

## 2. 当前公开扩展点的限制

实际 `HeadersConfigurer` 的private `getHeaderWriters()`将各配置writer直接装进列表；`createHeaderWriterFilter()`new过滤器之后，只对整个filter调用 `postProcess`，没有逐writer postProcess。原writer列表private，`HeaderWriterFilter.writeHeaders(request,response)`还是包级方法。不能仅靠现有公开配置API给每个默认writer附加一次互斥包装。

`setShouldWriteHeadersEagerly(true)`确是支持的配置，但会改变写头时点。当前FileController两个实际路径明确使用private,max-age=300；默认cache writer如果提前写入Pragma:no-cache/Expires:0，下游只覆盖Cache-Control会留下其他头。304和reset也会产生差异。这与官方维护者issue9175的缓存警告一致，不建议把全局eager当作语义不变开关。

不建议通过反射生产private字段、复制整套默认writer、在Controller提前flush并锁定200、复制两套认证链、或者把async下载换成同步Resource占用servlet线程，来绕过这个缺口。本包依赖观察微例会反射读取安装的默认writer列表用于比较；这不是生产方案，也没有向仓库加入反射代码。

## 3. 请求局部门禁方案的有限评估

主侧提出的设计是：DHR导出专用OncePerRequestFilter在HeaderWriterFilter外层持有请求局部monitor；真实异步body在同一monitor内先执行既有CAS，再进入原TWR/copy。这个次序能让initial安全过滤器先完成lazy写头，再让worker输出；同线程inline executor因monitor可重入而不会死锁。它不改变默认writer名单、认证链、缓存政策或async任务执行策略，较跨主版本升级/复制框架过滤器更收敛。

必要边界：

- gate须实际位于HeaderWriterFilter之前，并只注册一次。不要把同一个Filter bean同时由Boot自动注册到容器和Security链；注册机制由主侧实现及验证。
- 专用路径匹配要覆盖GET隐含的HEAD及context-path。现有AntPathRequestMatcher仅匹配专用export路径、不另限method，可以避免HEAD漏过；其他方法仍原样交给既有路由/权限判断，不因gate获得处理资格。
- body的CAS应在取得monitor后执行；完成清理回调不应等待monitor，确保排队超时/取消可先取得ZIP清理归属，晚到body再拒绝。
- ASYNC/ERROR redispatch的默认跳过、未认证/无权/业务错误、response头/状态/字节及临时文件清理需实际JWT链回归。依赖模拟不能替代它。
- intrinsic monitor等待不可中断。如果initial下游filter finally永不返回，worker也可能一直等待；不能由本方案声称解决任意filter挂起、Error/OOM、进程崩溃、磁盘或网络容量。本轮不建议为此添加新的超时、重试或扫描政策。
- default lazy可能仍调用writer两次，但必须串行且最终安全头/缓存值保持；上游CAS补丁保证的是单次writer，本局部设计无需伪称相同内部调用次数。

这是对主侧设计的源码/依赖评估，尚未核其最终产品实现。实际候选和正式最终验收由主侧及全新质量角色负责。

## 4. 本角色实际运行的11个依赖微例

`GateDependencyProbe.java`直接使用安装的HeaderWriterFilter与MockHttpServletRequest/Response，不启动应用、JWT、Tomcat或PG。运行命令和12个依赖jar SHA见 `gate-probe-run.json`，原输出 `probe-1.stdout`。

1. async worker在initial filter退出后才写；writerCalls=2但maxConcurrent=1，1字节输出完整。
2. inline同线程重入完成一次copy，没有死锁。
3. completion先CAS、worker后到门禁时被拒绝，copy=0；这是归属协议微例，不是真实HTTP超时。
4. normal/304/private,max-age=300/reset × HTTP/HTTPS共8例，门禁与原lazy最终header集合和值完全一致，HSTS仍只在secure请求。

**11/11通过**。8个头集合比较读安装默认列表的反射仅用于依赖观察。初次工具编译因classpath遗漏spring-context而找不到EnvironmentAware，0微例执行；原stderr保留 `setup-initial`，补足工具classpath后才得到11项结果，没有改应用源码、测试断言或框架约束，不混计为产品失败。

## 5. 确切官方修复与兼容性

官方来源子项已经正式FINAL，原件按字节复制在 `upstream-role/`，其中66个文件均核SHA。官方修复 [bdf501fe87daf07586a26ae9b442a2818578e90b](https://github.com/spring-projects/spring-security/commit/bdf501fe87daf07586a26ae9b442a2818578e90b) 在HeaderWriterResponse增加AtomicBoolean，CAS一次写头，保留lazy。真正committer时间2026-09-03，不能用作者2026-04-18时间推断已发布。

已实际取得官方稳定release：7.0.8、7.1.2于2026-10-22发布并列出该竞态修复；7.0.0–7.0.7、7.1.0/1没有该CAS，所查6.x分支及6.5.11也没有。7.0.8 Maven POM依赖Spring7.0.10/security-core7.0.8，当前Boot3.3安装Framework6.1.8/security6.3.0，故不能只替换web jar当成低风险补丁。这是有具体POM依据的工程判断，不是做过7.x二进制兼容运行测试。

没有发现当前6.x可直接使用的已发布drop-in补丁；这是明确有限查询，不认证所有商业维护构建。官方修复可用作根因证据和设计参考，不等于本地门禁已经通过产品链验收。源下载URL/UTC时间/状态/大小/SHA和部分404均保留，外部issue的事故概率不外推为本产品发生率。

## 6. 知识与全审边界

DEC-0063-10/11/12和rule.dhr-summary-zip-source-trace要求原件/摘要、同一冻结版本与范围、权限及追溯保持；门禁不改变这些业务概念或执行政策。DEC-0090区分汇总冻结、导出副本和受控归档，不因响应头修复实现放行/归档、备份恢复或历史恢复。没有新业务政策或知识成熟度提升；本体有限一致性与最终quality由对应角色另行核对。

当前结论不覆盖实际产品JWT HTTP、真实renderer/PDF/原生PG、浏览器或CI；本角色这些运行均未执行。整文件完成0、历史unique未知。原W2-W7/931知识/86UI候选、高风险/A12/完整矩阵、性能/容量/A23含已审及用户暂停队列保持。子项已FINAL，无在途孩子，不继续轮询开发；主侧若需最终候选增量核对可另明确范围，不覆盖本包原件。
