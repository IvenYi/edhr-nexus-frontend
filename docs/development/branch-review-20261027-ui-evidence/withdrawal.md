# 生产管理弹窗相关改动撤回

依据：2026-10-27用户明确要求“先不用管生产管理那个弹窗，把有关的修改撤回，那边的样式我需要重新调整设计”。本次L1撤回，不重新设计或修复弹窗，不修改业务政策。

撤回前HEAD：588f46d0c7a6845d64319942e48f28c73d8bd91e；目标edhr-dev：52dcf9d27a41f8243ed59d0a05605da011e32f83。已fetch确认PR32尚未合并，目标没有其他增量，本地无用户未提交改动。

恢复以下两文件为目标原件：

- gmp-platform/frontend/src/pages/production/WorkOrderPage.tsx：撤回局部网格、数量概览、导入操作分行及表格滚动/焦点改动。
- gmp-platform/frontend/scripts/test-work-order-template-browser.mjs：撤回新增几何/键盘滚动断言、保存后截图及新增BATCH窄屏场景，保留PR31原有下载/XLSX/导入/payload断言。

产品及测试目录相对目标diff为空；PR31三列SN模板、旧备注导入、工单分页修复未撤回。audit-charter的规则合理性审前要求、27条静态核实及9条有限评估保留；旧布局报告/截图只作已撤回候选历史。窄屏项状态明确变更为user-deferred，不声称当前窄屏验收通过。暂缓是用户范围选择，不是降低仍在交付范围的测试标准。

本体门禁not-applicable：仅撤回展示布局和对应验证，没有新规则、数据或生命周期变化。独立质量门禁针对实际撤回候选核对原件一致、无附带业务回退、历史证据标记及剩余资料；结果收尾归档。PR32标题与正文同步为审计文档范围，不自动合并。

正式独立对干净候选`bdcf7330506779256d5098132e3cd97595e6c487`返回passed/FINAL，8/8必需检查通过。两文件逐字节等于目标，产品/测试/知识目录零差异，17份原证据、静态核实及审前约束保留，当前user-deferred与历史通过边界明确。主侧原3组下载导入回归通过；独立未重复浏览器/构建/DB，以原件及范围核对验收，不冒称重跑。原件见[evidence/withdrawal-quality.yaml](evidence/withdrawal-quality.yaml)及[独立说明](evidence/withdrawal-quality-review.md)。受测后仅追加此L0归档和PR说明更新。
