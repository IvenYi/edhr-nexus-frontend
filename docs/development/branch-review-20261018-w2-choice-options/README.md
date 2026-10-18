# W2 第六批：同字段共享选项

本批以 `edhr-dev@b191e054892ae06cb0d8a45f62d034deabbba3e3` 为固定基线，继续整体审查中的一个有限切片。PR14 已人工合并，合并树精确等于批准交付 `1246cda13aca6ae5a5f98c3b7a5bf79f58f4b26e`；不重新收尾 PR5/PR6 或此前审查 PR。

用户对本轮真实业务歧义已明确答复：**“必须共用同一组选项（推荐）”**。适用范围是同一个字段的多个放置位置，不是不同字段共用全局字典。当前知识增量由本体角色记录到 DEC-0080；原始问答、工程选择与实现证据分别保留。

## 当前处置

唯一新发现 [W2-F004-SHARED-CHOICE-OPTIONS](findings.md)：Inspector 原来只改组件 `optionList`，模型允许选项、其他位置及子列副本仍旧；默认按钮还会保存完整 `label:value` 行。新行默认取 canonical 模型，后端提交也只验证冻结模型，因而仅修新行 helper 不能闭环。

当前修改在原 store 写命令内同步模型和同字段位置，默认按钮写实际选项值，并让重复位置使用不同 React node key。新字段和主动改型到选项类型时，写入界面原有的两个预置；旧文档读取及 registry 不补预置，不采用旧组件副本修复模型。字段值、父表、行及节点身份和唯一 document history 保持各自所有权。不改后端生产规则、旧模板、旧快照或历史记录。

首候选 `c4491dde7703e778c0b4ba7dd293dc940d8a262d` 的主测和独立运行均通过126 Node、13浏览器、构建、静态guard及186 Java（3条件跳过），但独立源码和实际ModelTab入口复现发现遗漏，正式结果为 **failed**，不能用运行绿覆盖该结论。原件见 [首轮失败](evidence/independent-first-failed/quality-result.yaml)。原基线10条回归8失败、2正对照通过仍只属初轮证据。

修正版在父表columns写命令补充新增/实际改型子列初始化，同类型旧列不补预置。主侧128 Node、两个实际ModelTab视口、构建和静态guard通过，详见 [跟进证据](evidence/primary-followup/README.md)。全新实例对 `9ac5e0e2e9adc6662f8a9530d6e2c10c2854c1d7` 正式 [qualityResult: passed](evidence/independent-final/quality-result.yaml)，15项必需检查通过：128 Node、15实际浏览器、构建/静态检查、186 Java通过及3既有条件跳过。实际ModelTab新增/改型/自动保存/未改文本直接默认/两行真实值在1440和390均通过；b191的12条为10红2正，c449为2红10正，实际c449 UI1440仍红。QF-W2-CHOICE-001已独立关闭，首轮failed原件保留。当前代码切片建议人工合并，后续仅更新L0验收台账，不声称完整W2完成。

## 实际覆盖与证据层级

- [固定基线](baseline.json) 和 [coverage.csv](coverage.csv)：1931 个 tracked 路径/blob，全部 `pending / inventory-only`，不代表 1931 个文件深入审查完成。
- [源码方法范围及 S04 拆分方案](source-map.md)：只声明列明方法/分支被核对，不宣称整个设计器或完整 W2 已完成。
- [历史去重与新发现](findings.md)：已合并问题保留原始验收范围，不能把历史测试计数加成本轮通过。
- [原始辅助材料收据](evidence/helpers/receipts.json)：辅助报告、安全环境摘要和用户交接主文档均按原字节保留，记录来源、bytes、SHA256 和适用边界。交接附件是参考材料；当前用户授权及仓库契约优先，附件不创造新授权。

主侧验收包含真实 store、序列化/撤销、新行、Inspector 单选配置和完整纸面增删行，以及多选默认独立选择/取消/保存、冻结 SAVE/SUBMIT 正反例；不扩展原新行工厂的多选默认支持。后端本批使用 H2 PostgreSQL 兼容模式，不得称为原生 PostgreSQL 或完整浏览器到已认证后端 E2E。真实浏览器的受控保存回调与后端使用的安全合成夹具之间，要保留具体原字节来源；不能用组件截图代替 HTTP/数据库验证。

## 限制与下一步

ESLint缺配置为实际工程限制。主侧初轮官方premium技能不可用的原记录保持；首轮独立恢复脚本，最终独立再次核对官方原脚本来源和摘要，对b191/9ac实际strict扫描各84项、均退出2，完整finding集合一致、新增0。两轮原JSON均保留，这不是全站扫描通过。当前没有旧vendor阻断，设计器静态guard实际通过；上述限制由最终独立结果明确列为本切片残余边界，不通过修改业务逻辑或删除断言消除。

W3 AUD-H003的只读调用图已保留，缺模式推导、序列化提前补值及发布旁路须在下一批按DEC-0067与DEC-0009不完整草稿边界处理，本批未夹带fillMode修复。AUD-H004/H009/H010仍open；A12、表单变更/作废及依赖它的两项旧DHR high继续按用户决定暂缓。下一步提交本批PR，交由用户人工合并，随后拉取最新edhr-dev继续审查。完整验收边界见 [合并验收](merge-acceptance.md)。
