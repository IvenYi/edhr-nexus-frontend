# 登录输入、跨标签会话与设计器运行核查

继续[PR35](https://github.com/IvenYi/edhr-nexus-frontend/pull/35)：用户本轮已明确接受两层保护，同一分支完成实际前端整改，正在准备全新独立复验。初轮39f292d8 failed原件保持；daca7531之前只有L0归档，本轮有产品/测试/知识变更，不沿用“仅文档”结论。新独立passed前保持draft，不重开PR34。详见[跨标签整改](cross-tab-remediation/README.md)。

目标 `edhr-dev@2c4b79e1641be4886fd5361b48df076e57abd768`，PR34合入树同e956，无其他目标增量。L2初轮本体NA、独立39f292d8 failed/FINAL（13必需12过1失败）只代表当时范围。当前已取得明确用户确认、DEC0085知识updated/FINAL和本轮实现侧证据，高风险正式关闭仍须新实例通过。

## 输入整改

- **AUTH-INPUT-001 / medium**：LoginRequest未声明校验。缺失/null密码进入BCrypt后返回500，缺失用户名和空白字段返回401；不完整密码可进入既有失败计数逻辑。新增 `@Valid` / `@NotBlank`，在认证读写前拒绝为400。不trim、改写非空凭据，不新增长度/复杂度限制，不改真实错误密码401计数、阈值、锁定或成功清零。
- **API-BODY-001 / medium**：MVC的 `HttpMessageNotReadableException` 落入全局generic500。只增加该精确异常的400分类，统一安全消息；不响应/记录转换异常明细或请求内容。业务拒绝、权限及真正技术500保持。

正确基线新增12项输入例全部红，原PR34四项正对照通过（16项12红4正）。最小修复后16通过；补充非空带首尾空格密码正例、非登录MVC转换/正常绑定及技术500相邻验证后，最终 **56/56后端通过，无skip**，其中真实PG17；既有Node会话/工作区回归 **28/28**。详见[evidence](evidence/primary-verification.json)。既有断言未降低、未跳过；无schema或历史数据修改。

## 跨标签新发现：待定处理交互

**AUD-H014-XTAB-001 / high / open**，为旧AUD-H014的不同入口扩展，旧同标签修复不重开。真实AppLayout、authStore、queryClient和client在同一Chromium上下文两页运行，HTTP为合成夹具：

1. 同一标签A→B正对照：generation推进、缓存清空，A迟到响应拒绝，原修复成立。
2. 另一个标签A→B：当前AppLayout头部已显示B，authStore仍为A、A缓存保留，generation不变；新请求却带B凭据，A迟到成功仍被接受。
3. 同上但A迟到401：清掉共享B凭据并跳回登录，将新会话误登出。
4. 另一个标签退出：当前页仍保留A身份/缓存，并接受退出前迟到成功；新请求已不带凭据。

这些是初轮受控真实组件运行事实，宿主是真实AppLayout并等待getMe初始化；无真实后台或用户数据。[初轮运行原件](evidence/session-observations.json)及[脚本](evidence/session-observation.mjs)不覆盖为绿。本轮修复与新场景另存cross-tab-remediation，不宣称完整浏览器→真实后端认证E2E。

此前立即重载方案仅为历史讨论。用户现在明确接受DEC0085两层保护：检测后停止旧操作并提示，发出保存/提交前再拦截，仅当前页回登录，不清其他标签新凭据、不自动补交。无该业务未决，不引入JWT撤销或独立多账号政策；high按新独立结果关闭。

## 设计器：7组实际观察

真实CanvasTab/Sidebar/Workspace/Zustand、1440×1050；初始空文档及字段可用store准备，但选择、放置、菜单、撤销重做均走真实UI，不程序调用放置API。

- 普通已有字段卡可Tab聚焦；Enter、Space、点击均不首次绑定，nodes保持0；同文档指针拖放绑定1，撤销0、重做1。
- 聚焦B2后Shift+F10和ContextMenu均成功打开应用菜单，修正仅凭“无显式按键分支”可能产生的误判。
- 显示文本组件点击及Tab/Enter均插入display node；已有子表多格菜单绑定成功且可撤销。
- 快速添加真实对话框确认后模型字段+1，nodes不变，不能冒充普通已有字段放置。

沿用 `adjacent.designer-field-card-keyboard-placement`，当前有限普通字段路径未找到非拖动首次放置；不是证明整个设计器无替代。网格多条件、Word目标、保存重开、窄屏/屏幕阅读器未本批全测。后续若整改，建议以当前合法选区的显式“放置已有字段”命令调用现有ToCell/Word/Range guarded API，保留enabled、重复/重叠限制及一次完整history；不把旧generic addNode绑到字段卡点击，不自行决定新点击含义。现有源码拆分方案继续保留，不做大模块重构。

## 证据与门禁

设计器/会话两个只读辅助实例已产出脚本及运行数据，但在书面收尾时因平台usage limit退出，未冒称其正式FINAL验收。主审检查脚本与源代码后分别重新运行全部7组和4组观察，并查看真实跨标签截图，作为实现侧/审查侧证据；其数据不是独立质量结果。本体实例已正常返回正式NA/FINAL。

初轮独立实例无额度/环境阻塞，failed原因是真实会话high未关闭；当时56后端（17PG）、28 Node及89知识通过，7设计器观察及会话1正3缺口重现。[初轮质量原件](evidence/quality-result.yaml)、[报告](evidence/quality-review.md)和[证据](evidence/quality-evidence.json)不回写。初轮前端未改、未重跑build/strict/lint为当时事实；本轮已实际修改前端、构建及扫描，单列新证据。生产管理弹窗、TaskDetail、记录控制/DHR原暂缓、知识gap与性能讨论保持。

直接输入矩阵还未覆盖不匹配Content-Type、所有超长值、Jackson数值到字符串兼容等，不将已验证12种情况外推全输入域。跨标签修复完成后须由另一全新实例做最终L2复验，不用本次局部通过覆盖high。

初轮源码范围为登录入口/DTO、精确异常分类、四会话入口和设计器七组UI；本轮补统一页面边界、会话标记及三处退出收尾，见整改目录。有限规则/场景不等于全量审查；W0持续增量，W2–W5、W6提取及W7反查未完成，无可信整体百分比。下一步新独立复验，目标新增提交即fetch并重新评估，不自动merge/deploy/恢复。
