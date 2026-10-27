# 装饰预览语义只读核对

基线26796235085b9759295f3dfff8e078ded3cd5ed8。两处同根因低风险：启用MUI Button仅靠pointerEvents:none不移除默认原生按钮、按钮角色或Tab停靠。

已直接读取安装版MUI Button/ButtonBase属性展开顺序，component="span" role="presentation" tabIndex={-1}最小方案成立：显式role在buttonProps之后覆盖自动role=button，tabIndex=-1直接传入，variant/color/sx仍保留，不用disabled避免视觉变灰。它移除普通Tab停靠和按钮语义，不是程序化聚焦的绝对inert保证。

建议真实WorkflowActionConfig状态夹具验证标签/样式onChange；真实CanvasTab+Zustand验证pointer ghost及实际字段拖放，详细入口和断言见JSON。实际字段卡只有onPointerDown，不能顺便声称Enter插入已支持。旧clone拖图helper无调用，不扩大清理。

本角色未修改仓库、未运行浏览器/Maven/构建，无运行通过或正式质量验收主张。
