# PR6 合并验收

## 范围和基线

本轮继续关闭 PR6 合并门禁，执行级别 L2。起始 HEAD 为 `52f81f29b28649e566fdd5b03f79ab675a05018b`；实际 PR base 是 PR5 的 `e0652d0b5579aebbf99a26498bacc7e32dfefa90`，不是直接 edhr-dev。项目、编码、交接与质量契约从起始 HEAD 读取，未修改；知识基线 0.3.25/schema 1.2.0。本体门禁不适用：没有更改业务定义、权限政策、候选冻结、签署身份、迁移或知识资产，也没有开展本体审计。

原 e923、e02 和上一轮 52f81 的 failed/blocked 结果保留。新验收结果必须使用实际最终候选 SHA，不覆盖历史文件，也不把历史 required 改为 false。最终结论由新的独立质量实例形成；本文是主验收责任人的范围及证据方式裁定。

## 本轮最小修复和影响分析

实际 QA 登录证实认证 JSON 的数值 Snowflake ID 被 JavaScript 舍入。JWT subject 和服务端个人列表过滤保持精确，没有观察到串号，但 authStore 身份不符合仓库现有字符串 ID 契约（`current-project-development-reference.md` 第 5 节）。

仅将 AuthController 登录和 me 的用户 id 改用现有 idToString；authStore 和 DashboardTaskList 类型接受新字符串及旧缓存的 numeric id，不主动把 Snowflake 转成 Number。新增实际 Jackson 序列化回归覆盖登录/me/资料更新、精确 JWT 主体和审计身份；前端回归覆盖相邻大 ID 的登录及资料事件保真。没有改变租户、权限、认证声明、签名或候选规则，也没有扩大修复其他 ID 字段。

另新增 SecurityJwtExpirationTest：使用实际 JwtTokenProvider/JJWT、JwtAuthenticationFilter 与 SecurityConfig 验证正常 token 的精确主体，以及独立、正确签名的已过期测试凭据被真实安全链拒绝为 401。该凭据只在隔离 MockMvc 中使用，未送入真实应用；没有修改生产 JWT、TTL、时钟或校验。它是解析器/安全链证据，不是八小时自然到期的浏览器 E2E。

扩展路径是现有 product-core 的技术契约修复和验收测试。直接影响是认证身份 JSON、内存/存储身份与身份查询键；相邻风险是资料刷新和同标签账号切换。数据库、历史快照、审计主体和签署资格不变，无数据回填或迁移。旧数值缓存保持兼容；成功重新登录和正常资料读取使用准确服务端身份。最终需重建真实后端并重跑 UI，不能用修改前运行证据覆盖新的身份表示。

## 运行环境和数据边界

所有新增业务记录均在任务专用合成 PostgreSQL 数据库，通过正常管理/建模/执行/签署 API 建立。没有直写 state/history、恢复旧空候选、复制消失的旧精确对象或扩大旧删除授权。

正常上传发现默认 user.home 不可写，已用受支持的 `--edhr.file.storage-path=/workspace/.pr6-files` 修复运行配置。中文字体和 Playwright 浏览器使用已验证的原环境资产；不修改源码绕过部署前置。

强制签名使用现有 QA 配置的短暂矩阵：forceSignatureOnFirstLogin 开启后验证新普通 QA 用户，经正常 UI 手写签名、明显标记的合成证件图片、本人密码重新认证及服务端认证，最后恢复所有原策略/branding 语义字段。JWT 始终为 480 分钟。首次持久化设置行的技术 id 变化单列记录，不称作策略变更或恢复失败。没有更改真实用户凭据、认证定义或生产配置。

## 十项原实质缺口的关闭依据

下列结果须由新的独立质量实例在最终候选上复核，不以实施者结论替代独立结果。

| 原检查 | 本轮证据及要求 |
|---|---|
| http-dependencies-evidence | 实际主表 A→B→清空→恢复和动态双行独立/交换/单行清空，逐次记录真实 dependencies、候选响应及目标 UI 行，不能只看最终选中值。 |
| read-only-conflict | 同一用户匹配 EDIT 与 READ_ONLY 组时真实 UI 禁用；SAVE、SUBMIT、签署 APPROVE 的服务端拒绝及 state/revision/audit/signature 不写入完整链。 |
| signature-identity | 真实 A 会话/B 合格签署人正常操作，A 身份和 generation 不变；history/signature 记录 B，audit 记录 A。 |
| forced-security-redirect | 原真实强制改密与本轮强制签名两分支；认证完成后 flag 清除、会话保留，再登录进入正常首页。 |
| store-request-identity | 普通 A/B/A 的精确登录、store、实际请求 JWT 主体、服务端身份及各自有区分已办样本对应。修复后不得留下身份舍入。 |
| list-waiting-guard | 真实个人已办请求发送前暂停、原样继续；等待期间有加载提示、旧用户正样本不显示，加载后只显示当前用户正样本。 |
| dual-review-done-positive | 两名普通用户分别通过正常真实 UI APPROVE 产生可区分 REVIEW_DONE；不是空列表、通用 workflow done 或伪造 history。 |
| runtime.F001.late-success | 两个真实旧 A 上游 200 在响应阶段暂停，正常 UI 安装 B，再原样释放；必须实际观察 direct/旧 Query 底层 Axios ERR_CANCELED、新 B cache/store/DOM 保持，原 30000ms 内处理。 |
| runtime.F001.late-valid-session-401 | 以下明确裁定的组合等价证明，保留自然过期晚 401 未实跑的事实；不是豁免隔离要求。 |
| current-session-401 | 以下明确裁定的实际安全链及同代际 401 完整清理证明；失败登录 401 单独不能替代。 |

## 主审对 401 组合等价证据的明确裁定

依据用户交付 Final Gate 第 5 节允许的等价证据评审，本轮接受下面的组合验证方法用于当前 PR6 合并范围，并要求独立质量实例核对每条；不修改原 required，不声称自然到期时序已经执行。

1. 新增实际解析器/安全链测试验证正确签名但过期的隔离测试凭据：JJWT 到期校验失败，真实 JWT filter 不安装身份，真实 SecurityConfig entrypoint 返回标准 JSON/HTTP 401。正常真实 provider token 的正向对照通过。
2. 合法已认证 QA 用户的实际签名负向请求由未修改后端返回 SIG-001/401；不改写状态、body、JWT 或 adapter。检查源码确认失败在修改、签署或锁定之前拒绝。此响应是签名认证失败，明确不是 JWT 到期。
3. 真实 Chromium XHR 的旧 401 响应在接收后暂停，正常 UI 切换到 B，再原样释放；实际 Axios 回调必须 ERR_CANCELED，B 身份/权限/cache/mutation/DOM 保持且无跳登录。不是仅观察 socket 已释放。
4. 当前同代际、非 skip 的真实 401 必须在硬跳转前同步清空 token/user、内存身份、权限、策略、query/mutation，再实际停留登录页。生产签名 verify wrapper 的 skipAuthRedirect=true 对照必须保持同一会话，防止将例外规则误判为普通清理失败。
5. 真实旧 200、实际 QueryClient 取消/销毁、正常 UI 退出卸载旧页面/登录重新挂载，以及具有双正样本的个人列表等待/最终隔离共同验证旧结果无法供给新身份。

充分性理由：响应防线的判断输入是请求发送前同步绑定的 generation、当前 generation、HTTP status 和 skipAuthRedirect；不包含 JWT 到期原因、签名失败原因、响应业务代码或账号状态。旧代际检查位于所有 body/status 处理之前；当前 401 清理与 body 中的具体业务错误码无关。解析器/安全链证明 expiry 正确产生 401，真实传输证明 Axios error.config 保留原代际，实际浏览器证明该 handler 的旧/当前分支及渲染后果。组合覆盖原安全风险，而不把较低层测试冒充单次自然到期 E2E。

自然旧有效 JWT 到期后的晚 401、自然当前会话失效未实跑，仍作为有来源的残余运行限制记录。未来更改 issuer/parser、response adapter、会话绑定/取消顺序、skip 规则，或者引入不卸载页面的身份切换/跨标签协议，必须重新评价此证明。若独立实例发现任一输入或分支无法对应，或者正常 UI/真实响应复验失败，则继续 blocked/failed；不得仅因等待成本或目标绿灯接受。

## 九项限定验收限制的承接

Final Gate 的六项 optional（条件夹具/外部 PDF 样本、额外范围拒绝矩阵、ROLE、DEPARTMENT、START 权限组、非候选部署 HTTP 矩阵）和三项历史/适用性限制（旧空候选对象连续性、正常串行空版本、已消失精确删除对象）按原建议接受为当前 PR6 非阻断边界。

新结果检查这些边界裁定是否有源码/测试/影响分析依据，并在 residualRisks 保留原检查 ID 和未执行范围；旧 qualityResult 中的 required/blocked 原字节保留。它们没有变成真实运行 passed。当前候选仍须验证冻结候选不回填、防御性空版本解析/工作区和显式目标不回退；不能以接受历史环境限制豁免当前代码保障。

三个条件跳过不计通过，也不打开人工等待开关制造绿灯。F004、本体审计、大模块重构、历史受阻记录恢复、真实冻结库迁移和生产部署均不在本轮承诺范围。

## 最终合并要求

最终 actual base/head/candidate 必须可定位；PR5 base 是候选祖先时候选就是功能 head，目标发生变化则重新验证。新独立质量结果必须 passed、所有适用必需检查 passed、blockingConditions 为空且无阻断发现。原 CI 成功不能替代新候选必需检查；GitHub mergeable 也不是质量批准。质量通过后才将 PR6 草稿改为 ready，保留 PR5 base，不自动合并或部署。

## 新候选实际自动回归

- 新完整后端单次 916 项：913 passed、0 failure/error、3 条件跳过；Surefire 报告目录在本轮前移出留存，不混用旧 XML。
- 聚焦 AuthController/实际 JWT 过期安全链/ExecutionSubjectScope/ExecutionAccess/SubjectResolver：51 项通过，与全量重叠，不相加。
- 前端身份聚焦 28 项、原五组相邻 59 项通过；TypeScript/Vite 与 DHR 工作区原结构门禁通过。
- 后端 package 通过（skipTests 仅计打包）。重建服务后独立质量须复跑正常 API 新业务夹具和真实 UI、强制签名、真实迟响应，并强制核对 authStore ID 字符串与精确 raw JSON/JWT subject，而非沿用舍入观测日志作为通过。

实施证据保留在任务工作区的 pr6-merge 系列目录中；最终结构化质量结果及经过脱敏和 manifest 校验的交付包单独交付。包含签名密码、登录 token 或私密凭据的本地文件不随报告交付。
