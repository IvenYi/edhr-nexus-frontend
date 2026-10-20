# 追溯设计保存与预览源码协助

固定 `061d7f1ff71d11084667d08293fd7d5fe0d7680d`，知识 0.3.25/schema 1.2.0。只读准备材料，不是正式独立 QA；未修改仓库或运行应用、浏览器、API、数据库、迁移。已读 AGENTS/codeplz、DESIGN、DEC-0077-42 及单绑规则，沿既有前端设计契约，不重新设计。

精确记录见 `edhr-trace-design-source-review.json`：19 条函数/调用边界范围，每条有固定提交、源码 blob/SHA、行号；全部不声明整文件完成或当前业务运行通过。

发现一项明确前端消费差异：合法 `tableId = ' \t\u3000'` 的主表单绑，在新保存校验及字段侧栏已按主表识别，但顶部“用途总览”仍将其列为“子表来源已失效”。该入口来自 Shell:268→ProjectionDialog:313，其“模拟预览”页签调用 `projectionPreview.ts`，继续按原始字符串产生两行嵌套样本而没有根级字段值。后端预览按 `String.isBlank` 读取主表根值，追溯 attributes 为空则不加入结果。这与另一个 MockFillDialog“模拟填报”入口不同。

实际纯计算探针已生成 `/tmp/edhr-trace-preview-source-probe.json`：`assignedRegions` 为原空白字符串，`values` 仅包含该键对应数组，`mainValuePresent=false`；模板 `tableId` 原值不变。前端函数运行反例已确认，后端空结果为直接源码推导，未冒称浏览器/API已运行。建议最小修复仅统一总览/预览区域比较和样本 key，保持原始配置身份与冻结证据，不改迁移或业务规则。

已核对反证：单绑计数使用模型字段身份及区域，不按名称或画布重复放置计数；含停用及重复同项，不限制同项跨字段复用、业务统计用途。React normalize/serialize 保留 projection，不自动 trim/删配置。主保存及字段确认共用最终检查；失败不 markSaved，成功确认提交快照。来源映射、画布与撤销/重做共用完整文档历史；模板文件导入只换当前画布页。

可复用 `scripts/test-projection-preview.mjs`、`test-projection-source-editor.mjs`、`test-projection-panel.mjs`、`test-designer-save-state.mjs`。真实浏览器脚本为 `test-designer-save-browser.mjs`，支持 `W2_CASE_FILTER`、`CHROME_PATH`、`W2_SCREENSHOT_DIR`、`W2_RESULT_PATH`。现 baseline 注入过滤器仅覆盖 Shell/Inspector/store/registry，不包含本次两个预览所有者；若重现旧实现红证，须修复前执行或扩展准确文件过滤器。默认 API fixture 仅允许 GET，预览 POST 应单独 route 并核对请求体；受控 POST 不称真实后端持久化。

本辅助已完成，后续修复与正式验收由主实例安排。
