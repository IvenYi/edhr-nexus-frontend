# 本轮浏览器验证

主开发使用真实 Chromium/Playwright CLI，前端 `127.0.0.1:3018`、后端 `127.0.0.1:8098`，连接本轮独立测试库；没有连接或迁移 `edhr_dev`。合成账号 ID41/42 为展示验证临时授予 ADMIN，普通权限边界取控制器和服务测试，不将浏览器操作解释为完整普通权限矩阵。

- ID41 经登录界面登录，顶栏出现 1 条未读作废生效提醒。打开通知可见 DHR-LINKAGE/V1、来源流水号和处理提示；点击标记已读后为 0，Escape 关闭并恢复通知按钮焦点。`notification-desktop.png`。
- 在 390×844 窄屏打开同一浮层，实测边界 left=16/right=382/width=366，位于视口内。`notification-narrow.png`。未据此宣称全部 DHR 工作区已完成窄屏适配验收。
- 已提交 V1 的来源当前已作废，但冻结内容仍为 COMPLETED，原值 old/100/件，显示来源变化提示；没有把当前作废状态写回旧冻结。`frozen-v1-after-void.png`。
- 通过已有“发起修订”界面填写原因，生成当前 DRAFT；没有提交 V2。当前草稿默认隐藏作废来源，概览仍计入 1 份实际证据、1 份待核查。低位“查看作废表单（1）”可以恢复查看。`draft-void-hidden.png`。
- 开启查看后来源及原值可见，证据数量不变。发现既有状态函数将 OBSOLETE 统称为“未完成”，本轮已局部修为“已作废”，继续使用现有中性徽标，未调整布局。修复前、后分别为 `draft-void-visible-before-fix.png`、`draft-void-visible-corrected.png`；首次独立失败结果保留在 `../../quality-result.yaml`，最终复核另存。

此合成表单使用既有字段回退展示，没有据此声称验证完整复杂表单画布。PDF/ZIP 另有离线打印自动回归证据。本轮保留当前导出成员范围，尚未实现打印排除作废表单。

浏览器记录含既有 Router future warnings；打开已有修订对话框还触发 Emotion `:nth-child`/`:nth-last-child` SSR 提示，共 6 条 console error 级提示，未发现对应页面运行失败。不得描述为“控制台零错误”。

## 证据分类

本目录截图与上述现场观察为 `original-evidence`；用户确认的业务规则为 `user-confirmed`，在决策包中单列。既有研究材料仅作为 `secondary-reference` 索引，不以本轮合成数据反推冠骋行为。设计和实现选择仍按决策包的 `inference` 标注。

## 用户连续反馈后的查看入口

用户指出底部独立按钮突兀且占目录空间。最终入口移至现有“DHR 导航”标题行右侧的灰色更多图标，Tooltip 为“查看选项”，打开后可勾选“显示作废表单”，旁列实际数量。底部独立行移除，附件入口和目录宽度保持。此处只调整共享控件呈现及菜单交互，原 `count/show/onToggle`、填报未保存保护、默认隐藏与冻结/导出规则不变。

采用用户指定 design-taste-frontend 的 preserve/targeted 方法；该技能主体面向展示网站，此处只应用保留式审查、视觉层级、可访问性与单一设计体系，继续使用既有 MUI。设计读法为受控业务工作区局部整理；`DESIGN_VARIANCE=3`、`MOTION_INTENSITY=1`、`VISUAL_DENSITY=7`，依现有紧凑密度，不新增动效、字体、配色或布局系统。营销页面的 hero、SEO、品牌换色等检查不适用于此控件。

主侧以相同隔离账号重新经真实登录界面进入草稿，确认默认隐藏、标题菜单可打开、选择后实际记录仍显示“已作废”，概览仍为 1。`view-options-default.png`、`view-options-menu.png`、`view-options-obsolete-visible.png` 为更新后原始截图；前述六张保留为同一切片的早期验证证据。最终菜单的键盘、窄屏及冻结版本回归另由独立质量记录。

用户随后指定竖向三个点，并要求收紧浮层。最终使用 MoreVertRounded，菜单缩小上下留白、行高和勾选区，原生菜单角色与焦点能力保留。主侧桌面实测菜单约 139×40px，导航标题仍为 40px 高；`view-options-compact-vertical.png` 和浏览器直接局部截图 `view-options-detail.png` 为最终样式，先前横向图标图片仅属该切片过程。新增图片另以 `view-options-manifest.json` 固定，不改前六张原件索引。
