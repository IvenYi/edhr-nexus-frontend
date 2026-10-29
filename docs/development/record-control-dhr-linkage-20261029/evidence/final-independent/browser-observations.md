# 最终独立浏览器复核

2026-10-29。新质量实例 `/root/dhr_linkage_final_quality`，未参与修复。Playwright CLI 独立会话 `dhr-final-qa`，真实 Chromium，前端 `127.0.0.1:3018`、后端 `127.0.0.1:8098`，均指向主侧专用隔离夹具库。未修改来源、汇总、审批或签名数据；没有向浏览器注入令牌。账号以正常登录／登出切换。

## original-evidence：本实例实际交互

- 合成账号 41 登录，顶栏实际显示 0 未读；打开通知有本人既存 `DHR-LINKAGE · V1` 作废生效消息。已读状态由前序主侧操作产生，本实例未重新制造未读消息。
- 390×844 下通知浮层边界 x=16、right=382、width=366，在视口内；内容与关闭及分页控件可见。截图 `notification-narrow.png`。
- Escape 后浮层数量为 0，焦点回到 `aria-label="通知，0 条未读"` 的按钮。
- 当前草稿默认隐藏作废来源，导航两来源组显示 0；概览仍显示实际表单 1、待核查状态 1。低位“查看作废表单（1）”可达。截图 `summary-obsolete-hidden.png`。
- 点击查看后来源可读，标题徽标明确为“已作废”，正文保留 old、100、件及原明细，概览仍计入该证据。截图 `summary-obsolete-corrected.png`。这解决首次质量发现 QF-DHR-LINKAGE-001；本实例未修复代码。
- 打开既有档案版本选择，当前草稿与 V1 均可见；选择 V1 后相同记录显示冻结时的“已完成”及原 old/100 正文，无作废开关，顶部仍提示 1 项来源变化。截图 `version-select-open.png`、`summary-frozen-v1.png`。未提交新版本。
- 仅在本浏览器会话临时将通知 GET 拦截为 503，页面出现“提醒加载失败，请重试”；撤除拦截后点击重试，恢复真实既存消息。截图 `notification-error.png`、`notification-recovered.png`。这不是后端故障或持久数据修改。
- 真实登出 41，再登录合成账号 42；对首次通知 GET 临时延迟 7 秒，实际观察并截取“正在加载提醒”，随后自动进入“暂无提醒”。截图 `notification-loading.png`、`notification-reviewer-empty.png`。确认跨账号未沿用 41 的提醒缓存；拦截已撤除。
- 从 DHR 列表的既有“查看 DHR 档案”打开同一草稿，仍默认隐藏，可查看并显示“已作废”。截图 `list-archive-obsolete.png`。该入口在当前草稿条件下复用 SummaryWorkspace，不能据此声称 DhrEvidenceViewer 的所有状态都已浏览器覆盖。
- 所有上述步骤完成后关闭本实例的独立浏览器会话；未停止主侧服务或删除主侧夹具库。

## 视觉与验证边界

截图已直接查看：页面继续使用既有全屏工作区、导航、实例区、状态徽标和顶栏位置；作废入口位于导航底部，未新增列表或重排壳层。对照汇总与列表入口，正文、导航与同一状态一致。

本夹具未配置完整富画布，正文采用既有字段回退展示；不将其称为任意复杂表单的版式验证。审核任务与填报中未保存保护、DhrEvidenceViewer 无汇总场景未逐一浏览器运行，当前源码审查、导航测试及前序后端/权限测试覆盖其受影响规则。临时 ADMIN 账号仅用于展示和账号隔离，不证明普通角色的全权限矩阵。未执行 200% 全矩阵、真实移动设备或所有存量模板打印。

首次打开登录页出现 2 条 favicon.ico 的 404 和 React Router 未来行为警告；重新导航到汇总与列表后为 0 错误、2 条既有 Router 警告。通知故障注入产生 2 条预期 503 控制台错误，恢复后正常；不声称全会话控制台零错误。无认证访问后端提醒 GET 实际返回 HTTP 401，响应未包含个人提醒。

## 用户继续反馈后的最终查看菜单

前述底部开关原图保留为过程证据。用户要求移除独立行，随后明确竖向三点和紧凑浮层；当前最终产品只改变 DhrWorkspaceNavigation.tsx，另外29个产品/测试文件相对本实例初次指纹未变。按用户指定 design-taste-frontend 的 preserve/targeted 方法与既有MUI规范核对，没有引入营销布局或新组件库。

本实例重新打开独立浏览器并经真实登录界面登录41，验证最终 MoreVertRoundedIcon。1280×720下导航标题仍40px，触发区28×28；菜单实测136.8125×40，按内容自适应。默认隐藏，底部旧按钮不存在，附件入口保持。原始测量在 view-options-desktop.txt，原图为 view-options-default.png、view-options-menu.png。

- 聚焦查看选项后按Enter，菜单自动聚焦首个menuitemcheckbox，aria-checked=false。Esc关闭后焦点回同一入口。
- 再按Enter打开并切换，菜单关闭且原表单明确显示已作废，概览仍为1。重新打开时aria-checked=true；点击后恢复隐藏。截图 view-options-visible.png、view-options-checked.png。
- 390×844下先关闭再实际点击入口可打开菜单，菜单x86至222.8125、y788至828，完全位于视口，Esc恢复焦点。原测量和截图为 view-options-narrow.txt、view-options-narrow.png、view-options-narrow-detail.png。原汇总顶栏仍有标题被工具组挤成竖排、主体下沉的窄屏布局限制；这部分头部代码本轮未改，不将菜单本体可用解释为整个DHR工作区移动适配通过。
- 恢复1280×720并切到V1，同一来源仍冻结已完成及原正文；版本内作废数为0，没有查看选项按钮。截图 view-options-frozen-v1.png。

最终候选再次独立执行前端构建及12项导航/详情测试均通过。后台与知识业务语义无新增改动，复用前述有效原件；无产品或测试修改。截图在实际过渡完成后保存，最终独立浏览器已关闭；指纹与范围见 verification-integrity.json。
