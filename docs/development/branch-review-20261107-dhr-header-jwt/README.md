# DHR 实际 JWT 下载响应交接整改

L2，固定目标 edhr-dev@b6691e2c6289ab414a7a3fed1f128562cbba4166。PR71已人工合入，整树同45858291，无外部代码/知识/契约增量。继续原W6-SECURITY-STREAM-HEADER-RACE-001，未重新收尾旧PR。本批主侧实际 **125/125**，0失败/错误/跳过，32受测输入匹配当前文件；待全新独立最终质量与本体最终源绑定，不提前宣称全部门禁通过。

最终受测 **703f2ee90417e778cf745fbbcd24f908a345d3bd** 已获全新独立 **passed/FINAL：125/125、知识89/89、12/12必需检查**，三medium均复核关闭，无新开放发现/阻塞；源码孩子也FINAL。本体NA/FINAL、350知识及32受测输入保持。全部角色及孩子FINAL后已实际[PR前漂移/阶段复核](pre-pr-drift-review.md)，目标仍b669，无漂移；此后只L0验收/台账/交付。见[完整质量结果](quality-result.yaml)、[独立复验](independent-review.md)、[发现关闭范围](findings.md)。前文待验收为历史阶段，最终以本段为准；整体审计未结束。

## 根因与最小修复

既有响应头风险已在实际SecurityConfig、JwtTokenProvider签发/验签、JwtAuthenticationFilter、DhrArchiveController、GlobalExceptionHandler及真实Tomcat装配证实。受控调度下，同一响应的servlet线程与worker进入默认安全头writer，maxConcurrent=2且nosniff重复。它是已知框架6.3.0的lazy并写入口；不把受控调度延迟或出现频率外推为生产事故/SLA。源码角色核官方7.x已修，但当前Boot3.3/Security6.3不是可单换web jar的组合，因此未升级依赖。

专用DhrArchiveResponseFilter只匹配导出路径，在HeaderWriterFilter外侧持有请求局部monitor到initial链退出；body在同一monitor内领取归属并继续原TWR/copy。inline同线程可重入，仍是异步输出，不把下载改成占用servlet线程的同步Resource。GET/HEAD、实际非根context-path及无关预览有回归；filter以new实例只注册安全链，不作为Filter bean双注册。保留原lazy writer与所有原缓存策略，串行writer可以执行两次，不把writer总次数必须1当标准；下载任务仍严格仅启动1次。

同链确认两项相邻缺陷：

- **W6-JWT-ASYNC-IDENTITY-001**：原JWT过滤器默认跳过ASYNC，初始身份未保存到请求库，重新派发时被当匿名，有效Bearer的拒绝/超时请求误报401。仅覆盖shouldNotFilterAsyncDispatch=false，按同一Bearer重跑现有验签、subject/permissions/AuditContext；不permitAll、不加session、不改ERROR默认、不放宽无效或过期token。
- **W6-DHR-ASYNC-ERROR-FRAMING-001**：恢复身份后真实500错误JSON仍携带ZIP长度162，实际错误body137，客户端EOF。只有ASYNC错误、response未commit且body未开始时才原子标记FAILED，清除ZIP长度/类型并将attachment改为明确inline，让原错误处理器输出完整JSON。单一WAITING/BODY/FAILED/CLEANED原子状态替代旧boolean，completion仍可清理FAILED文件，晚到body拒绝；不等monitor完成清理，不修改活动body/已发响应。

Servlet/Tomcat对setHeader(name,null)不保证删除：首轮长度null仍EOF，改用setContentLengthLong(-1)后完整JSON通过；Disposition null仍保留attachment，因此使用标准inline并严格断言精确值。中间失败全保留；测试意图是错误不再伪装成ZIP下载，不是降低字节/状态/权限或单次执行标准。

产品修改4文件：SecurityConfig仅注册局部filter，DhrArchiveResponseFilter协调响应及未启动错误，DhrArchiveController沿同一归属/TWR，JwtAuthenticationFilter恢复ASYNC验签。Service、原件/摘要/冻结、导出范围、业务权限、签名、schema/UI、JWT签发/过期规则及流前EXPORT顺序保持。此处资源状态不是DHR业务生命周期；失败不能回滚已发送内容或既有生成审计。

## 验证与证据范围

最新同字节旧源13项 **10正/3真Assertion失败，0错误/跳过**：并写max2，拒绝/排队超时401。旧3产品源逐字节匹配b669，新增filter在旧源不存在。主侧最终125=新HTTP13+gate5+原95+原JWT相关10/新增ASYNC2；13项真实HTTP包含GET/HEAD、inline、有效/无效/匿名/缺权限、拒绝/超时/取消及三个真实FileController预览入口。新实际HTTP max1、任务仅启动1次，失败500/完整JSON/inline且ZIP已删；原private,max-age=300及无Pragma/Expires保持。HeaderProbe只强制时序，未模拟writer逻辑、未改实际认证规则；合成密钥/claims与mock ZIP生成器/repository不代表真实登录目录/业务数据库全HTTP链。

5项直接gate测试覆盖context-path的GET/HEAD、无关预览、completion在worker等待时先清理/晚到body拒绝、FAILED仍可清理；它们不是实际网络活动流取消。原完整canonical+0092 PG导出12仍mock renderer，原观察11/33调用线程SELECT、服务器3次EXPORT/v2写入与11JFR读取重算保持。观察无服务器逐事件tag，不称全网络或精确区间SQL归因。两真实HTTP端口、独立PG和自有ZIP资源清理核过，见[main-analysis.json](main-analysis.json)。

完整阶段保留：最初throws遗漏编译失败0JUnit；首probe只观setHeader漏addHeader，max0为夹具校准错误，不作产品并写证据；修正后旧13确证max2/两个401。中间124/125各2个EOF错误、聚焦13的两个attachment残留失败，以及最终聚焦13/完整125分列，不叠加旧通过或重跑盖红。最新严格inline断言同源旧控重新运行，旧产品仍3真实失败。

## 健壮性、知识边界与后续

A23：monitor只属一个导出请求，其他请求不共享，不加全局锁、重试、扫描、跨请求缓存或默认writer复制。新原子状态各自区分body归属、失败未开始与一次清理；两个CAS覆盖WAITING/FAILED，没有IO重试循环。异步错误不等monitor，初始filter永久挂起/非可中断等待、真实活动网络取消、崩溃/UNKNOWN持久对账仍是缺口。新路径无SQL/分页/数组读入，原33 SELECT及读取量保持，不宣称完成容量验收。

长模块的具体抽取继续沿既有方案：Service.export可提writeFrozenRecords（同一冻结上下文、目录排序/完整性与单表PDF）、writeFrozenSummaryAttachments（原件/SHA/顺序）、appendTraceManifest（提交截止与AS_OF_EXPORT窗口）。实际抽取须保留这些边界与对应回归，不只为行数拆方法；本批只提请求响应交接，未无关重构Service。PDF缓冲/原件容量、上下文复用及其他性能方案仍先量化讨论，数据库分页选择未答未实施。

本体0.3.25/schema1.2/P0、350知识不改；现有DEC0063/0090及原认证/分权规则保持，有限ID核对和知识89不等于全量一致/运行全验。整体仍W3/W4/W5交叉及W6，W2余项/W7增量、931知识/86UI候选、A12/高风险/完整矩阵、历史ZIP/text-ID索引/上传PDFOffice容量/共享ACL并发、A23含已审与用户暂停项继续；整文件0、历史unique未知。全部角色/孩子FINAL后再实际PR前漂移复核，不自动merge/deploy/恢复或查询触发CI。
