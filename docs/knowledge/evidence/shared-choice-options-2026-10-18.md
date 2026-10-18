# 同一字段共用选项的确认与实现边界

本批知识基线为 `0.3.25 / schema 1.2.0`；实际读取的项目、本体角色和统一交接契约为 `b191e054892ae06cb0d8a45f62d034deabbba3e3`，来源及目标均为该次 `edhr-dev` 提交。用户确认来自本会话 2026-10-18 原始问答，当前定义见 `DEC-0080-01`。本批只同步受影响知识，不证明全库语义审计或 W2 全部完成。

## 原始用户确认

`user-confirmed`，原问题：

> 审查发现一个需要确认的配置边界：同一字段在表单里放置多次时，各处是否必须共用同一组选项？当前组件可分别配置选项，但后端保存只校验字段模型中的选项；这决定修复应统一配置，还是支持各处不同。此项先暂停整改，我会继续无依赖的填写模式审查。

用户原答复：

> 必须共用同一组选项（推荐）

确认范围为同一表单中同一选择字段的所有放置位置。字段名称相同或控件类型相同不构成同一字段身份；不能推导不同字段或不同表单也须共享选项。没有已确认的“各处独立选项”旧政策，本轮不伪造整份旧 DEC 的替代关系。

## 原始源码核对

`original-evidence`，以下均在 `b191e054892ae06cb0d8a45f62d034deabbba3e3` 读取，不是本轮已修复或已测试的声称：

- `useTemplateDesignerStore.ts::updateNodeBindings` 只更新当前画布被指定 node 的 bindings，并调用引用配置同步；选项未同步到 model 或其他放置位置。
- `DesignerInspector.tsx::renderSingleSelectSections` 的选项编辑写 `widgetConfig.optionList`，默认按钮写原 `optionLabel` 文本；`label:value` 配置不能以整行显示文本冒充实际 value。
- `types/model.ts::ModelFieldOption` 区分 `id / label / value / sortOrder / status`，模型选项不是单纯的显示标签。
- `newSubTableRow.ts::newSubTableRow` 对单选默认从该列 `typeConfig.options` 解析实际 value；不会读取全部 widget 的选项并集作为合法值。
- `ProductionExecutionEngine.java::validateValues` 对单选和多选读取该次表单模型的 `typeConfig.options`，排除 disabled 项并验证实际 value。未知值仍须拒绝，不能通过放宽该校验掩盖配置不一致。

以上路径均位于 `gmp-platform/frontend/src/` 对应设计器/表单渲染器或 `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/`。精确本轮修改与测试证据由本批交付台账记录，不复用 PR14 的运行结论。

## 工程实现与保留边界

`inference` / 工程选择：复用当前字段模型保存共享选项；在既有 store 编辑命令中同步同一字段的全部放置位置和子列副本，模型编辑反向同步，沿现有完整 document 单次保存/撤销。子表列按父表与列稳定身份隔离。默认按钮记录实际选项值，是贯通既有 `label:value` 协议的修复；新字段原界面已有两项占位选项显式进入模型是配置一致性选择，不是用户确认永远固定两项。

继续保留 `DEC-0077-12` 使用时复制配置与旧快照不回写、`DEC-0077-22` 同一配置保存撤销边界。没有新增模板发布冻结动作，没有在填报时查询最新模板，没有迁移既有不一致模板或历史执行，没有合并不同 widget 选项以绕过服务端允许值校验。打开、parse或归一化旧文档时不补齐缺失/空options；预置显式保存只属于新字段创建或主动类型变更的当前写命令，不放进读取也复用的字段定义工厂。字段和父表身份、已有选项值对应的 ID/元数据、无关布局样式、字段权限、签署和审计所有权继续由既有配置及执行链负责。

本次用户答复没有确认跨字段共享字典、删除已选选项对所有存量填写值的自动改写、默认值刷新/覆盖全生命周期、A12 表单变更作废或其余填写模式政策。本批不新增这些规则，不把已确认范围重新列为未决。

## 本轮验证时点

知识初次同步时实现和基础测试仍在进行，未据此预写通过。后续本体角色实际读取当前源码，确认 `syncChoiceOptions` 只有本次选项文本发生变化才从该位置更新模型，按父表与字段稳定身份同步同字段所有位置；无关只读、默认值或显示形态编辑不会采纳已保存的不一致旧选项。模型编辑及兼容控件重新绑定使用对应字段选项，新建字段把原界面已有占位选项显式保存；默认按钮解析实际 value。同一逻辑值多处显示的 React key 加入 node 身份，仅区分渲染位置，不生成另一份填写值或字段身份。

本体角色只读核对主侧 `/tmp/edhr-w2-choice-primary-java.json`：实际 Maven 总 189 项，186 实跑通过、3 项既有条件跳过、0 失败/错误；其中 `BusinessKnowledgeModelTest` 89 项全通过，新 `inspectorChoiceOptionsSaveAndSubmitAgainstTheSameFrozenCanonicalValues` 已实际通过。后端集成使用 **H2 PostgreSQL 兼容模式的 MockMvc、JPA/JDBC 及事务**，不是原生 PostgreSQL 或全认证浏览器 HTTP 验收；报告保留逐 suite 与 case。该新增场景实际读取浏览器产出的设计和值，验证 START 冻结、合法值 SAVE、未知值 SUBMIT 失败时 revision/记录值/审计不变、合法值 SUBMIT 成功及整个解析后快照树不变；JSON 原文数字词法格式差异不作为语义篡改。实际 UI 产物与测试资源 `gmp-platform/backend/src/test/resources/fixtures/shared-choice-options-design.json` 原字节相同，6343 bytes、SHA256 `721d500935aa38b52dae95414e45d1c41c8921b2c50788864ea3554a2ada2b63`。产物使用实际 Inspector、受控 Shell 保存回调和实际纸面预览新增两行，不能据此宣称后端模板设计 HTTP 保存全链已验。

主侧最终 126 项 Node 全通过、0 跳过，包含旧文档主字段/子列缺失或空options读取不补预置的保护；主字段缺失沿原归一化为[]、子列缺失保持undefined，不将其改成默认两项。最终产品tsc/Vite构建、设计器静态guard均通过。静态guard将原单选整行label断言收紧为解析实际value，并保留原多选断言、补value解析/激活/切换断言，未删除其他门槛；本轮新环境无旧vendor缓存，不能继承先前vendor阻断描述。

本体角色实际读取 `/tmp/edhr-w2-choice-browser-final.json`，主侧最终13个真实Chromium场景全通过：旧9场景保留，新增1440/390视口各自单选共享/默认/新增两行及多选默认选择/取消/保存。浏览器脚本对每场景pageerrors与console errors均断言为空。主侧实际查看1440配置及纸面、390纸面及多选配置截图；窄视口原toolbar溢出与固定纸面横滚仍是既有边界，不能据此声称完整移动端或触摸验收，也不证明多选新行工厂已增加能力。本体角色只读源码、运行报告及原fixture，不冒称亲自运行Maven、Node、浏览器或构建；后续独立质量结果由实际验证实例与本批台账另记。

本体自身完成 YAML、全局 ID/引用、证据路径和内部投影诊断；其通过不替代正式 Maven/JUnit。Ruby bootstrap 因本环境缺 Ruby 未运行，未登记为通过。ESLint仍缺配置、官方premium工具当前不可用未执行，不能把历史84项当成本轮扫描。当前源码与已确认含义未发现冲突，新增定义仍保留 `specified/internal`、`0.3.25`，无新增执行契约或客户/运行投影，不提升为 `verified`、整阶段完成或独立质量已通过。

## 首轮独立失败后的真实入口补漏

2026-10-18 首轮冻结候选 `c4491dde7703e778c0b4ba7dd293dc940d8a262d` 的独立结论是 **failed**，原件保留于 `docs/development/branch-review-20261018-w2-choice-options/evidence/independent-first-failed/quality-result.yaml`。`QF-W2-CHOICE-001` 为 medium、当时 open：独立实例通过实际 ModelTab 子列创建对话框确认，新建单选子列仍有 canonical `options=[]`，界面显示选项1/2，默认按钮记录选项1，但实际新增两行均无该列值。主动子列改型遗漏由该轮源码核对，不能冒称当时也完成该对话框运行验收。前述126项Node、13个浏览器、186实跑Java加3跳过及89知识测试是首轮真实通过记录，不覆盖这个额外入口，更不能改写为首轮独立质量已通过；原本体结果原件也保留其生成时点和有限核对范围。

根因映射补正：`tabs/model/ModelTab.tsx::createSubTableField` 从读取也复用的 `definition.defaultField` 创建子列；`handleSaveField` 的子列新增和主动改型经 `updateSubTableFields` 调用 `updateField(parentId, {typeConfig: {columns}})`。首候选只在顶层字段/快捷子列创建和顶层实际改型路径初始化选择预置，未覆盖真实 ModelTab 的父表 columns 写命令。该遗漏是实现和原有限测试覆盖不全，不是 DEC-0080 业务含义发生变化，也不是需要用户重新决定选项政策。

主侧当前补丁在既有 `store.updateField` 父表 columns 写命令内比较上一份同父表、同列ID的定义：只对新出现的子列或实际类型改变的子列调用 `initializeChoiceField`；同ID同类型的旧空/缺失选项保持，不因父表改名、旧文档打开或parse被补两项。后续仍沿原 `syncBoundNodesForField` 对齐同身份位置及原单次 `pushDocumentHistory`，不修改读取字段工厂、运行允许值、服务端授权、默认行工厂或旧冻结快照。用户确认、稳定字段身份、同组选项、使用时冻结及原保存撤销边界全部保持；本次不修改DEC、YAML定义、版本或成熟度。

跟进同步时主侧新回归和实际对话框验证仍在进行，本体角色只读核对这段补丁，不预写通过或将首轮发现标为resolved。最终跟进源码摘要和主侧实际验证时点以本轮跟进结果及交付台账补证，仍须后续全新实例独立验证。首轮独立实例另已实际恢复读取官方premium脚本并对base与该首候选运行扫描，84条完整集合相同、新增0；这与前述主侧当时工具不可用分别属于各自时点，不是本次后续候选的全站通过结论。

跟进源码稳定后，本体角色实际读取主侧最终安全报告/日志及对应测试：Node 128/128通过、0跳过；新增两条父表columns store回归已通过，同一12条选项测试对首候选c449回放为10通过/2失败，新增反证分别对应真实入口的新列和改型漏初始化。新增实际ModelTab创建、改型、原预置默认选择、保存载荷与实际新行值的两个Chromium场景在1440和390视口均通过，报告为 `/tmp/edhr-w2-choice-modeltab-browser.json`；对c449的1440场景在首次保存canonical预置断言失败，390未达到，不能声称两视口均完成反证。当前跟进tsc/Vite构建与原静态guard通过。本体未亲自运行这些业务测试；原186实跑Java加3跳过和13个既有浏览器场景仍属首轮，不预写最终全15浏览器或189项Java已复验，更不把首轮failed改成passed。当前补丁与既有DEC-0080、原冻结/身份/单次历史边界一致；原失败记录中的QF保持其历史open状态，最终解决与质量结论待全新独立实例实际验证。
