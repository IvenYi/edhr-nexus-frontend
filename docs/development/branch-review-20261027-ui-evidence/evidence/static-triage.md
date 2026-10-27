# 静态提示只读源码复核（辅助，不是正式验收）

基线：`52dcf9d27a41f8243ed59d0a05605da011e32f83`。已逐条回到27个报告位置及必要导入/处理函数。没有修改仓库，未运行浏览器或Maven。

- **23 条误报**：13条是将MUI `Select`误当原生`select`；4条忽略anchor/Router Link导航；3条忽略label下真实文件/颜色input；1条忽略onPointerDown拖动动作；2条将JS日期比较`< form.plannedStartAt`误当`<form>`。
- **3 条源码确认的低风险缺口，去重为2个根因**：两处装饰预览使用enabled Button + pointerEvents:none，仍保留button/tab焦点语义（同一根因）；全局WebKit滚动条无标准CSS回退（另一根因）。未运行焦点、屏幕阅读器或Firefox验证，不能称已验证实际用户受损。
- **1 条证据不足**：LoginPage确实用原生form且没有noValidate，required仍由浏览器校验；尚未证实当前登录UX要求应用接管。不能单加noValidate使既有校验失效。

27条是27个唯一报告位置/rule组合，归并为8个扫描/实现根因组（5种误报、2种源码确认缺口、1种证据缺口）。这不是全站缺陷数量。完整逐条引用、范围、建议、运行证据需求见同名JSON。

另有一个不计入27的候选：DesignerSidebar字段卡片自身无键盘放置处理，但其他画布/侧栏非拖动入口未追踪，不据此宣称整个设计器没有替代操作。仓库还有未被这27条指中的真实native SelectProps用法，这份扫描不能作为全部下拉框清单。
