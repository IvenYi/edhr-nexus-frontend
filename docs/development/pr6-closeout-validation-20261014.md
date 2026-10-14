# PR6 收尾验证（2026-10-14）

## 范围与基线

本轮是 PR6 收尾，执行级别 L2。原 HEAD 为 `e02a63fdac31567ac1e6b6e053fd30781fad3d3a`，PR base 为 PR5 的 `e0652d0b5579aebbf99a26498bacc7e32dfefa90`，`edhr-dev` 为 `cb863ad83e2aca20caf86f0e78602120e8b4727f`。项目、编码、交接及质量契约均从原 HEAD 读取；知识基线 0.3.25/schema 1.2.0。本轮没有本体审计或业务规则变更。

用户交付的 e923 独立报告记录删除保护目录和 quantity fixture 两项失败；后续 Final Gate 针对 e02，九项已知发现均 resolved，但正式质量结果仍为 blocked（34 检查：12 passed、22 blocked，其中 16 required blocked）。两份报告对应不同提交，不以早期 failed 覆盖后续修复，也不以自动测试覆盖运行证据。

已核对 Final Gate 依据包 10 个载荷、e923 原始证据包 273 个载荷的字节数及 SHA-256；外部 qualityResult 和 Final Gate 与包内副本逐字节一致。原始文件和 required 状态没有改写。

## 最小修改与影响分析

- 删除关系目录与当前完整迁移 schema 已对齐，本轮没有修改生产删除保护逻辑。
- `0060a` 可以保留旧 `work_order.quantity` 及其非空约束，`0069` 仅解除旧 code 的非空约束。e02 的 fixture 省略 quantity，兼容新 schema，却不能插入此种旧表。新增回归在专用 PostgreSQL 上先实际复现 SQLSTATE 23502，再修复测试插入构造：按实际列存在性填入旧 quantity，普通插入与并发写入共用同一 SQL。没有给新 schema 补旧列以掩盖原问题，没有更改迁移或数量规则。
- 新增两个真实 LoginPage 回调的自动测试，分别验证 forcePasswordChange 与 forceSignatureVerification 导向 `/account/settings`，并核对新身份、权限替换和旧查询清理。没有修改登录实现；这些是函数/组件边界证据，不是实际首登浏览器验收。

扩展路径为现有 product-core 的回归测试；没有新增产品扩展点。直接影响只有测试 fixture 与回归覆盖，生产 API、数据库迁移、候选冻结、历史快照、审计及权限政策不变。测试用 legacy schema 是独立合成 QA 库，不是旧生产数据或已消失精确对象的重建。并发测试的 23503、删除 409、记录保留和审计不写入断言均保留。

## 本轮实际验证

| 检查 | 本轮结果 |
|---|---|
| quantity 新增回归反向控制 | 修复前 1 项 error，根因为 quantity 非空列；保留失败证据 |
| 删除保护完整套件，新 schema | 23 passed，0 failed/error/skipped |
| 删除保护完整套件，兼容旧 quantity 非空列的合成 schema | 23 passed，0 failed/error/skipped；包括原并发外键场景 |
| 全后端，启用专用 PostgreSQL 条件套件 | 单次 913 项：910 passed、0 failures、0 errors、3 skipped；exit 0 |
| 前端聚焦回归 | 27 passed，0 failed/skipped |
| 安全跳转反向控制 | 仅在仓库外源码副本移除签名强制跳转分支，对应 1 项新增测试失败；当前源码未改 |
| 原五组相邻前端回归 | 59 passed，0 failed/skipped |
| 原 DHR 工作区结构检查 | passed |
| TypeScript/Vite 生产构建 | passed |
| 后端 package | passed；使用 skipTests，仅计打包，不增加通过测试数 |

两次删除套件、前端测试和全后端不是同一计数分母，不能把重叠方法相加。全后端报告目录在运行前移出并留存，每份计数取自本轮新生成 Surefire XML。最初全后端尝试的 16 项错误是尚未配置字体/浏览器缓存的运行环境问题；完整配置后上述单次回归通过。初始工具链、网络/信任配置及新增测试编写阶段的失败记录均保留，没有以残留 XML 代替新执行。

保留三个 skip：`formRecordsBrowserFixture`、`browserEvidenceFixture`、`rendersAvailableFrozenDatabaseTemplatesReadOnly`。前两个是等待人工信号的条件夹具，第三个需要外部冻结数据；没有开开关制造绿色，也不把未执行计为通过。

## 有限真实浏览器补证

在本轮专用合成 QA 数据库、真实后端及 Vite 页面上，通过正常管理 API 创建两个普通 QA 用户，不修改权限模型、认证策略或用户真实凭据。实际 Chromium/Playwright 操作验证：

- 一次真实失败登录 HTTP 401，跳转后登录页稳定，store/storage 没有安装身份、token 或权限。
- 正常 UI 退出 HTTP 200 后，存储、内存身份、权限、query/mutation 清理。
- 本人资料 UI 保存 HTTP 200 后身份展示同步；session generation 和既有 roles-all、REVIEW_PENDING、REVIEW_DONE 查询的 queryHash（查询键）、dataUpdatedAt 及 hasData 状态保留。没有计算数据内容散列，也没有声称验证编辑中草稿；不是仅凭昵称判断查询保持。
- 真实首登 forcePasswordChange=true 跳到个人安全设置，并经本人 UI 完成改密。forceSignatureVerification=false，故整项双分支真实安全跳转仍缺签名分支证据；两个函数测试不能填作真实 UI 通过。
- 同一页面 A→B→A 正常登录，三次真实 `/auth/me` HTTP 200 的身份与 store 匹配。每次 REVIEW_DONE 请求暂停发送时实际显示“正在加载审批任务…”且无业务行，随后原样继续真实上游响应。两用户返回均为空列表，因此只有身份/等待窗口子证据，没有双已办正样本；GATE-03 三个完整检查仍 blocked。

运行时生产源码与原 e02 完全一致，本轮变化仅在测试及本文；相同产品字节的运行证据可按该边界使用，不能说服务在后来生成的 Git SHA 上重新部署过。旧 generation 指定晚 200、旧有效会话晚 401 和合法当前 401 未制造；正常认证仅使用合成 QA 凭据，未输出或交付密码、token 或 Cookie。

## 合并门禁与合理限制

Final Gate 的九项可接受限制按原边界承接：六项 optional（条件 skip、额外账户范围拒绝矩阵、ROLE、DEPARTMENT、START 权限组、非候选部署 HTTP 矩阵），以及三项限定历史/适用性限制（旧冻结空候选对象连续性、正常串行零版本入口、消失的精确旧删除对象）。旧对象没有恢复、替换或执行删除，原授权未被扩大。

原十三项实质缺口按四组保留并增量补证：审批引用/READ_ONLY/共享终端签署；身份生命周期；双普通审批账户已办正样本及等待隔离；旧 200/旧有效会话晚 401。现有真实 client/QueryClient 与受控 adapter 测试是有效机制证据，不能自行宣布指定真实时序通过。没有修改 JWT、TTL、时钟或认证政策来产生 401。

上述实际补证可关闭正常退出内存清理、资料刷新查询保持、失败登录不安装身份三项；其余十项实质门禁仍待满足。合法当前 401 的自然失效前置尚不存在（当前无状态 JWT 有效期 480 分钟，退出/改密不撤销它）；强制签名首登、审批引用/READ_ONLY/签署运行链、双账号已办正样本/等待隔离及旧响应时序均不能据本轮自动回归豁免。九项限定验收限制继续单列，不与十项必需补证混同。

自动回归通过不满足全部 L2 运行验收要求；必须结合本轮独立质量结果及实际补证范围判断。当前不授权合并、部署或改为 ready；F004、历史空候选恢复、大模块重构和本体审计仍不在本轮范围。
