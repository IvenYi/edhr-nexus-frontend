# 跨标签会话保护整改

PR35已转待审，读取时OPEN/MERGEABLE/CLEAN，等待用户人工合并。标题及正文已按最终输入/跨标签整改重写；高风险新实例正式验收之后只有L0归档与交付，未自动合并、部署或恢复数据。隔离PG及临时扫描导出已清理。

全新独立对 `4b45fb88679c8eddaec29f92ae7a36dcee9f5d68` 正式 **passed/FINAL，14/14必需检查通过**。AUD-H014-XTAB-001按本次明确范围resolved；输入两个既有整改也通过最终候选回归。正式[质量原件](evidence/quality-result.yaml)、[报告](evidence/quality-review.md)、[安全证据](evidence/quality-evidence.json)及[验收状态](acceptance.json)分别保存；39f292d8的failed不回写。

用户已标注并接受两层保护，来源为DEC-0085及本轮原始确认。共享会话变化时停止旧页面并提示重新登录；保存/提交发出前再检查，拒绝不一致请求，仅当前标签回登录，不清新凭据、不补交或恢复旧表单。不是较早未确认的自动进入B方案。目标仍2c4b79e1，同一PR35继续，不恢复原暂缓。

## 实现与边界

`sessionPolicy`集中保存本页认可的token/随机本地登录标记，处理storage/focus/pageshow及请求/响应前比较。标记区分同秒相同JWT，不是认证凭据；旧会话无标记可正常初始化。`SessionChangeBoundary`安装在App入口，失效时卸载旧操作区、通知及私有弹窗，显示明确提示及键盘可达的登录按钮，不自动安装B身份。

统一client在dispatch前拒绝不一致请求；Authorization使用本页认可的token，避免检查后重新读取共享B凭据。旧成功/401/409/blob消费前拒绝，不让旧401清新会话。AppLayout手动/超时退出与DHR重新认证三处await后收尾携带原generation，保护同标签及跨标签晚返回。前端不会撤回服务器已收到的写请求，也不会自动重试/补交原内容，见DEC0085-03/04。头像/姓名刷新保留编辑；DEC0074的A登录/B本人签署不改变登录会话，原规则保持。

## 实现侧证据

主侧Node40/40：原28断言保留，两个直接写token的setup改为真实login，VM补WebCrypto；新增12项真实adapter/旧响应/同token标记/资料/clear及三处实际退出回调保护。首轮重复身份通知导致原HOME-IDENTITY断言失败，修正产品重复通知而不改期望；另一旧setup经正常登录适配。首次TypeScript因CanceledError构造参数声明失败，已修正后完整生产构建通过，原失败散列保留。

测试实现实例Chromium同12场景在1280/390均通过：迟到成功/401/409/blob、退出/clear、同token新标记、ABA、资料刷新、键盘回登录和实际LoginPage重登C无旧提交、同标签正对照、实际App安装点。390横向溢出0、按钮在视口内。真实组件+受控HTTP，不是连接真实后台的认证E2E。

旧daca基线五场景实际4红1正：原三跨标签缺口及旧authStore远端资料不同步为红，同标签控制为正。首轮浏览器11/12因过早从被动页读取未传播完整的nonce失败；改为从写入页取完整期望并等待传播后释放旧响应，凭据完全不变断言保留。原登录/转办浏览器8项通过，知识同步实例实际89通过；strict基线/当前完整27集合一致，仍exit2，lint缺配置exit2。缺失旧/tmp扫描脚本的尝试不是扫描通过，读取官方原脚本后已实际执行。

后台产品及测试相对39f292d8未变化，主侧原56证据保留原受测范围，最终新独立实例需实际重跑。新本体updated/FINAL：DEC0085六声明四场景、九条有限评估，0.3.25及specified/internal不提升；不新增认证fact/rule/execution框架。

新独立实际运行40 Node、56后端（fresh PG17、2changeset及阈值2）、89知识、两宽同12浏览器、原登录8及构建全部通过，基线五场景4红1正独立复现。strict27/lint缺配置及两旧verify脚本均真实失败单列，源码确认基线相同，不冒称全绿。所有正式角色及只读辅助均FINAL；4b45后仅L0归档/范围/交付登记，产品/测试/知识不变。

旧39f292d8 failed原件及当时high/open作为历史保留。生产管理弹窗及原脚本、TaskDetail、记录变更/作废及其他DHR high/A12、知识gap和性能讨论保持。前批设计器7组有限观察不外推完整可访问性；W0–W7整体审计未完成，没有可信整体百分比，不自动merge/deploy/恢复。
