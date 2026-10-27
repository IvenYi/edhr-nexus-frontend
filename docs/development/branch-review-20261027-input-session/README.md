# 登录输入、跨标签会话与设计器运行核查

基线 `edhr-dev@2c4b79e1641be4886fd5361b48df076e57abd768`，PR34已人工合入，树与交付e9562c8d相同，无其他代码/契约/知识增量。L2；本体审前9条有限评估not-applicable/FINAL。全新独立对 `39f292d883e35b8ff8d7dfc6271486498b7f276a` 正式failed/FINAL，13必需检查12通过、1失败；跨标签high仍open且交互待用户答复，当前不建议合并。

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

这些是受控真实组件的运行事实，不是仅脚本改store得出的全app推断；宿主明确展示真实store/cache，外壳是真实AppLayout并等待getMe初始化。未访问真实后台或泄露真实用户数据。[运行原件](evidence/session-observations.json)及[脚本](evidence/session-observation.mjs)保留边界。当前尚未修复，未宣称完整浏览器→后端E2E。

已向用户集中询问：建议检测到共享会话变化后，清理旧缓存、拒绝迟到响应并立即重载；未保存编辑会丢失。需用户确认该交互取舍，不能把“继续”视为同意，也不自行引入JWT撤销或跨标签独立登录政策。本项不依赖的输入修复继续，但不能把安全问题标done。

## 设计器：7组实际观察

真实CanvasTab/Sidebar/Workspace/Zustand、1440×1050；初始空文档及字段可用store准备，但选择、放置、菜单、撤销重做均走真实UI，不程序调用放置API。

- 普通已有字段卡可Tab聚焦；Enter、Space、点击均不首次绑定，nodes保持0；同文档指针拖放绑定1，撤销0、重做1。
- 聚焦B2后Shift+F10和ContextMenu均成功打开应用菜单，修正仅凭“无显式按键分支”可能产生的误判。
- 显示文本组件点击及Tab/Enter均插入display node；已有子表多格菜单绑定成功且可撤销。
- 快速添加真实对话框确认后模型字段+1，nodes不变，不能冒充普通已有字段放置。

沿用 `adjacent.designer-field-card-keyboard-placement`，当前有限普通字段路径未找到非拖动首次放置；不是证明整个设计器无替代。网格多条件、Word目标、保存重开、窄屏/屏幕阅读器未本批全测。后续若整改，建议以当前合法选区的显式“放置已有字段”命令调用现有ToCell/Word/Range guarded API，保留enabled、重复/重叠限制及一次完整history；不把旧generic addNode绑到字段卡点击，不自行决定新点击含义。现有源码拆分方案继续保留，不做大模块重构。

## 证据与门禁

设计器/会话两个只读辅助实例已产出脚本及运行数据，但在书面收尾时因平台usage limit退出，未冒称其正式FINAL验收。主审检查脚本与源代码后分别重新运行全部7组和4组观察，并查看真实跨标签截图，作为实现侧/审查侧证据；其数据不是独立质量结果。本体实例已正常返回正式NA/FINAL。

独立质量实例已成功执行，**没有独立实例额度或环境阻塞**。当前failed的真实原因是会话隔离high未关闭，不能归因于先前辅助实例中断。独立新库56后端（17原生PG）、28 Node和89知识通过，设计器7组观察及会话1正3缺口独立重现；正式[质量原件](evidence/quality-result.yaml)、[可读报告](evidence/quality-review.md)、[安全证据](evidence/quality-evidence.json)及[门禁状态](acceptance.json)如实保留failed。本批不改前端产品文件，strict27/lint缺配置按前批原结果保留，前端build/strict/lint未本轮重跑。生产管理弹窗、TaskDetail签名密码、记录控制变更/作废及DHR high/A12、原知识gap/性能讨论保留。

直接输入矩阵还未覆盖不匹配Content-Type、所有超长值、Jackson数值到字符串兼容等，不将已验证12种情况外推全输入域。跨标签修复完成后须由另一全新实例做最终L2复验，不用本次局部通过覆盖high。

本轮实际源码范围：登录DTO/入口、精确全局异常分类；会话generation/client/authStore/AppLayout四条入口；设计器前批ND01–10对应的七组UI。9条规则评估不等于全量本体审查；W0持续增量，W2–W5仍未完成，W6提取方案及W7反查未完成，没有可信整体百分比。下一步先获取跨标签交互答复、完成修复及全新独立复验，再决定是否可合并；期间有新提交即fetch并重新评估。
