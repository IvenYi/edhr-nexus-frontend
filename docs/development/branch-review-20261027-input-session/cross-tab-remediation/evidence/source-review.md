# PR35跨标签保护：只读源码建议

角色：只读设计辅助，**不是正式独立质量验收**，未修改仓库/代码/测试/知识，未运行测试或浏览器。基线读取 `daca7531c475101ec1dd3ff0f2c0861d6f9e09cd`；目标 `2c4b79e1641be4886fd5361b48df076e57abd768`，知识上下文0.3.25。已读AGENTS/codeplz、本批README及原failed报告、请求/会话/store、App/Router/AppLayout和Axios实际实现。用户本轮已明确接受两层保护，本文只讨论其工程落实，不新增政策。

## 1. 同步请求拦截器必须真正抛出错误

项目实际安装Axios **1.17.0**。`node_modules/axios/lib/core/Axios.js:205–225`：同步fulfilled抛错后，Axios调用rejected，然后break；**如果rejected只是返回一个Rejected Promise或吞错，后面仍会执行dispatchRequest**。项目 `src/api/client.ts:32` 现有 `(error) => { throw error; }` 是正确基础，应保留。外层 `request()` 为async方法，会将该同步异常变为返回Promise的拒绝。

建议在同步fulfilled中先检查本页已认可的会话与实时共享存储，再捕获generation/会话指纹、绑定Authorization。失效时抛CanceledError；写操作需要按已确认规则仅当前页回登录。测试要观察实际adapter/网络调用数为0，不只断言函数抛错。GET背景请求可以取消并显示共享阻断提示，不宜让背景GET本身强制跳转而吞掉提示。

## 2. 旧退出的晚收尾不能清新会话

当前 `sessionPolicy.ts:26` clearAuthStorage无条件删共享凭据。精确异步调用：

- `AppLayout.tsx:434–443` handleSessionTimeoutLogout：await logout、catch后clear。
- `AppLayout.tsx:648–657` handleLogout：同样无条件晚clear。
- `DhrManagementPage.tsx:382–390` reauthenticate：同样路径。
- `client.ts:58–60` 当前401会clear；`authStore.ts:39–42` logout同步clear后本地set null。

仅在client旧401分支加保护不够。即使client将旧logout响应取消，页面catch后仍会执行clear。尤其**同一标签已合法login B并认可B之后**，旧A退出收尾再调用一个无参数“当前baseline=共享storage？”保护，依然看成B当前有效并清掉B。

最小建议：三个await调用在开始时捕获generation或会话快照，晚收尾调用clear时传expected值作比较并返回是否确实清理；默认同步清理路径也需先验证本页会话与共享存储一致。只在成功清理原会话或失效提示分支做相应本页导航，不能靠catch吞取消继续无条件删存储。可以局部扩展已有clearAuthStorage，不必建通用认证框架。DHR业务规则无需改变，只保护其重新认证按钮的共享退出收尾。

## 3. token字符串不是每次登录唯一标识

`JwtTokenProvider.generateToken` 只有subject、username、displayName、permissions、issuedAt、expiration及签名，无jti。JWT NumericDate时间按秒表达，相同claims/时长且同秒重登可能得到相同token；这是源码推断，本辅助未运行碰撞实验。

因此只有token比较会遗漏A→B→A在事件处理前已回到同样A token，或A重新登录仍得到同值token。建议前端最小额外登录标记：每次成功login生成独立随机nonce，存于独立localStorage键，并由本页显式认可，与token一起形成比较指纹。退出删除该标记；它只用于客户端会话边界，**不是凭据、不提供服务端JWT撤销**。不要用可同毫秒重复的Date.now单独表示每次登录。

兼容已有会话：初始缺标记可以作为null基线，后续真实login建立新标记。只改头像/姓名等user缓存而token和标记未变，不应推进generation、清缓存或锁页面。有效标记应单独拥有，不必混入idle/expiry等SESSION_STORAGE_KEYS，避免profile/策略更新误定新会话。

存储事件只是主动通知，不是唯一防线：request和response都应实时读共享指纹；焦点/pageshow重新检查能覆盖冻结/恢复页面。不能只依赖event.newValue，因为事件排队期间共享状态可能已经多次变动。确定本页失效后保持闩锁，不因共享数据后来又恰好等于旧token而自动恢复旧表单。所有storageArea检查应排除sessionStorage事件。

## 4. 旧响应检查顺序及本页/新页分离

先验证本页认可会话是否仍等于共享指纹；若不等，失效本页并清本页query/mutation缓存。然后比较该请求捕获的generation/指纹与当前本页认可会话。

后一个比较失败，只代表**该请求**过时：本页可能已主动、合法地完成login B，不能因此再把B会话标失效。应拒绝旧响应，不清新共享凭据、不触发新操作。

保护位置必须在client的blob/arraybuffer直接返回之前、409删除保护对话框之前、401清存储之前、业务错误消息处理之前。当前 `client.ts:39–42,52–59` 的顺序可扩展；同标签generation原保护应保留。已发出的写请求不会因为前端取消就被撤销；本轮只阻止新提交、迟到响应及自动补交，不声称撤回已抵达服务器的写入。

## 5. 共享阻断界面位置

`App.tsx:248–252` BrowserRouter下当前有AppRouter、DeletionProtectionDialog、RecordLocationHighlight。推荐在这里用一个共享会话边界包住这三项：失效后返回独立的可访问提示卡与“重新登录”按钮，直接卸载旧route/layout及旧私有对话框；已有Theme/Query/Snackbar provider继续复用。比仅覆盖一个Modal更容易证明旧表单不可操作。

不要只改 `router/index.tsx:63–69` ProtectedRoute：它只是渲染时读localStorage token，既不订阅变化，也无法区分B token与A页面。也不要只依赖AppLayout：其user storage listener只是更新头部；旧页面仍存在。

按钮只让本页导航到/login并重建页面上下文，不调用clearAuthStorage，不影响B其他标签，也不自动提交旧表单。外部共享边界订阅单一会话状态时，authStore不能在收到远端变化后直接readAuthSnapshot安装B；失效页本地身份应变无效或保留只读旧显示，但不可再以其授权。仅资料更新沿用现有同tab事件及既有权限刷新。

浏览器测试应引用真实共享边界，保留真实AppLayout/client/store；旧观察宿主必须加上实际产品已使用的边界，不能自造一个测试专用失效遮罩。至少一条验证真实App安装点，避免只测试未接入组件。

## 6. 28个现有Node测试的夹具适配

保持全部现有断言。发现两处原先绕过正常登录的setup：

- `test-review-batch-01.mjs:70–80` logout清理测试直接将token/user/策略全写'A'。若新guard在模块初始化认可空会话，这种setup会被合理认定为外部会话变化。用真实useAuthStore.login('A',合成userA)建立初始会话，再填所需策略及query/mutation；原storage.size=0和缓存清零断言保留。若新增nonce单独键，退出清理仍须把它删除。
- `:272–282` “request binds identity before immediate switch”直接setItem token A。改为真实login A，再发请求、立即login B；原Authorization=A和旧响应ERR_CANCELED断言保持。

`authEnvironment()` 是Node VM的EventTarget窗口，只有独立global localStorage而没有window.localStorage、没有StorageEvent、没有crypto。新增生产逻辑依赖这些时，按浏览器语义补充测试环境对象（例如注入Node webcrypto、合成含storageArea/key/oldValue/newValue的Event），不能把真实guard mock成通过。

其余Snowflake字符串、同账号资料更新不清cache/不增generation、损坏display cache保留token、当前401仍清理、同标签A→B→A及成功导航断言均应保持。已存在测试没有覆盖三处logout收尾；新测试应新增此真实回调或真实UI的晚返回场景，而非以现有28通过替代。

## 最小验证清单

实际双标签storage变化立即阻断及卸载旧表单；延迟storage事件下write adapter调用0并仅本页到login；旧成功/401/409/blob全部拒绝且B存储/页面保持；跨标签logout；同标签及跨标签A→B→A/同token新nonce；旧logout晚收尾；真实资料刷新保留缓存与编辑；无旧表单自动补交；新页重新登录成功建立可用会话；桌面/窄屏提示及键盘登录按钮。

以上是有限源码建议，未认证实现、测试或UI通过。全部只读工作完成，**FINAL**，无待运行工具。
