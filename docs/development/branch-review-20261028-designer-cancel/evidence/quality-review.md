# 设计器 pointercancel 切片独立最终质量复核

**FINAL：qualityResult.result = passed。** 本批适用的 18 项必需检查通过；另行披露的全局 strict 与 lint 两项仍未通过。没有发现阻断此批交付的新代码问题。此结论仅适用于下列干净候选，不表示整体分支审计完成，也不授权自动合并或部署。

## 实际基线和独立性

- 目标分支：`edhr-dev`，base `6306457580dbd2787db7df8f2e3cf80ddd21defd`。
- 功能 head / 受测合并候选：`52c1069ea14dfee0ad79f9501005148d302fcca0`，已包含目标全部内容。
- 实际读取契约提交：`52c1069ea14dfee0ad79f9501005148d302fcca0`；知识 `0.3.25` / schema `1.2.0`；契约及知识在本区间无改动。独立再次 fetch 后目标未推进；起止工作树干净。
- 本实例与只读辅助均未参与产品、测试、知识或夹具修复；只在 `/tmp` 写复核产物。主侧编写测试与本次独立运行明确区分。
- 已读取仓库治理、质量角色/统一交接、当前决策包及影响/扩展方案、相关知识、当前源码和成对 UI 技能及检查表。已有 MUI/领域所有权保持，无视觉重设计。

## 实现与规则结论

两个产品文件总计 **7 增 7 删**：`DesignerSidebar.finishPointerDrag` 的 `pointerup` 允许提交、`pointercancel` 只收尾；`CanvasSheetWorkspace.beginWordTableInlineFieldMove` 的已有 Word 字段移动也仅在 `commit=true` 时修改文档。激活阈值、pointerId 筛选、预览/监听器清理、落点查找和正常释放路径保持。该缺陷是一项根因、两个入口，基线五个红例是五种复现形态。

三个新增 identity API 测试导出均指向意外调用即抛错的替身。原六项呈现测试在替身之后逐字节一致，没有以容错响应或弱化断言换取通过。主侧旧夹具基线编译错误和初次导出夹具错误原件保留；本实例核对原件及源码并独立运行修复后的完整 35 项，没有冒称独立重跑旧夹具基线。

本批不改变字段/父表身份、共享选项、统一 document 历史、模板保存结构、权限、业务规则、执行快照、后端或数据库。相关本体核对保持 **7 ID = 6 项有限一致 + 1 客户试用证据 gap**；知识角色原结果 `not-applicable/FINAL`，两产品原工作树 hash 与当前候选一致。原本体小验证器是旧时点工具，本次只核对内容/路径/hash，没有在新 HEAD 运行后误报失败。89 项知识测试仅证明结构/引用等机器检查。

## 实际运行

| 检查 | 结果 | 边界 |
| --- | --- | --- |
| 新 pointercancel 浏览器，1440 | 12/12 | 真实画布、Sidebar、Workspace、MUI、Zustand |
| 同一组，390 | 12/12 | 同 12 个唯一场景第二视口，不称 24 项独立场景 |
| 固定 base 两产品源 + 同组 harness | 5 红 / 7 正向 / 0 夹具阻断 | 预期 exit1，证明原缺陷可复现 |
| Node 邻接测试 | 35/35，0 skip | 选项、子字段、插列、呈现、保存状态 |
| 既有 save 浏览器 | 9 次运行全部通过 | 包含宽度复用，受控 save callback，不是真后端 |
| 非拖动现状观察 | 7 observed，0 blocked | 普通字段候选仍开放，其他控件并非都无非拖动入口 |
| build / designer verifier | 均 exit0 | TypeScript+Vite、既有设计器校验 |
| 知识模型测试 | 89 tests，0 fail/error/skip | 非全量语义或运行审计 |
| 官方 strict 基线/候选 | 均 19，exit2 | 完整规范化 finding 多重集合相同，无新增 |
| lint | exit2，未通过 | ESLint 配置缺失 |

浏览器覆盖完整 document 及 undo/redo、取消前已激活但尚未写入、取消清理、迟到真实鼠标 up、阈值之前取消、不相关 pointerId、正常 grid/Word/subfield 放置、正常 Word 移动及画布外释放。正常提交只增加一次历史，真实工具栏撤销/重做恢复完整文档；Word 移动检查源标记移除及目标唯一标记。鼠标 down/move/up 为真实自动化输入，**pointercancel 是合成 PointerEvent**，不等于物理触屏或操作系统中断验证。没有未知 API 请求或浏览器运行时错误。

已通过 `view_image` 亲自查看本次桌面 Word 取消、390 grid 取消与390 Word 取消截图：原文字/源字段保留，拖动预览无残留。390 现有侧栏约占大部分宽度，画布仍裁切；测试用现有滚动和可见目标交点，不改产品样式。**不能把窄屏用例通过表述为完整响应式认证。**

## 清单、证据与任务范围

只读辅助已 **FINAL，13/13 检查通过**。从固定 base 独立重建 `coverage.csv`、`entrypoints.csv`、`migrations.csv`、`inventory-summary.json`，四份文件逐字节一致；`git ls-tree -r -z` 核对 **4008 路径、130 迁移**。全部 coverage 仍 `pending`，这是盘点分母而非语义已审数。主侧 6 条与源辅助 13 条有交叉，不累计为 19 个唯一审查项；整文件完成数仍 0。

31 份主侧归档原件和4个仍存在的原日志 hash 匹配。初始夹具错误、旧产品红与候选通过被保留并区分。本次独立原始 JSON/日志另存，官方 strict 脚本重新从技能读取并确认字节一致，SHA256 `b56ca0495ace4aaac2bfa779dc707b04baab0f7d4537e6856b6348c63230661c`；固定 base 的独立导出目录按确切路径清除。

两项前端性能风险仅有源码依据：fallback 命中循环扫描画布单元格，以及可用字段计算重复扫描 Word block/cell；没有容量实验，不能宣告已发生掉帧或 SQL N+1。现有 document history 有50条上限。三项具体提取方案已写明接口、状态所有权和保护测试，本批没有实施大模块拆分。普通字段首次非拖动放置保持候选，未擅自增加目标选择/默认落点规则。

## 剩余边界与建议

当前切片可以提交合并审阅，**本批阻断为空**。全局 strict19项和 lint 缺配置依旧未通过；上批工艺静态校验 ENOENT 本实例未运行，不能称本批通过或新发现。GitHub ruleset/保护检查状态不在本实例核验范围。

继续保留普通字段非拖动候选、其他取消手势/卸载路径、性能量测和拆分建议、朋友侧 TaskDetail 签名修复、生产弹窗样式、记录变更/作废及依赖 DHR high/A12、原四知识 gap 和客户试用证据缺口。没有恢复历史数据、修改业务政策、合并或部署；没有真实后端持久化、PG或容量认证。后续目标/产品/测试发生变化应重新评估适用复验；当前结果不得覆盖新代码。

## 原始产物

- `/tmp/edhr-designer-cancel-quality-result.yaml`：正式统一格式结果。
- `/tmp/edhr-designer-cancel-independent-evidence.json`：实际命令、退出码、源码/原件 hash、截图观察与边界。
- `/tmp/edhr-designer-qa-desktop/result.json`、`/tmp/edhr-designer-qa-narrow/result.json`、`/tmp/edhr-designer-qa-baseline/result.json`。
- `/tmp/edhr-designer-qa-save.json`、`/tmp/edhr-designer-qa-nondrag.json`。
- `/tmp/edhr-designer-qa-node.log`、`/tmp/edhr-designer-qa-build.log`、`/tmp/edhr-designer-qa-verify.log`、`/tmp/edhr-designer-qa-knowledge.log`。
- `/tmp/edhr-designer-qa-static-comparison.json`、对应 base/current JSON、`/tmp/edhr-designer-qa-lint.log`。
- `/tmp/edhr-designer-qa-inventory.json`、`/tmp/edhr-designer-qa-inventory.md`：只读辅助 FINAL。
