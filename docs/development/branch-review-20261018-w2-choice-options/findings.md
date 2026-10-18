# 发现、历史去重及处置

固定 base：`b191e054892ae06cb0d8a45f62d034deabbba3e3`。首候选 `c4491dde7703e778c0b4ba7dd293dc940d8a262d` 独立验收failed；修正版实际冻结后登记，不为工作树编造提交。

## W2-F004-SHARED-CHOICE-OPTIONS

| 项目 | 当前结论 |
| --- | --- |
| 分类 / 领域 | 代码缺陷；表单设计配置、动态行默认与执行允许值契约 |
| 严重程度 / 置信度 | medium / confirmed；合法配置会造成默认值丢失和最终提交被原允许值校验拒绝，不是授权旁路 |
| 负责人 | 主实例修复；本体实例同步已确认语义；另由全新质量实例收尾 |
| 状态 | `implemented-primary-verified`；独立验收 `pending`，未宣告关闭 |
| 有效依据 | 本会话用户明确确认“必须共用同一组选项（推荐）”；DEC-0080-01；原冻结执行仅用已选择模型校验值的所有权保持 |
| 来源分类 | 用户答复为 `user-confirmed`；源码和运行产物为 `original-evidence`；辅助报告是来源索引，不替代运行证据 |

**触发。** 新建单选子列并在同一表单放置多次，在真实 Inspector 把选项改为 `合格:pass`、`不合格:fail`，点击第一项默认，然后新增实际子表行。普通主字段选择器会隐藏已使用字段；主字段重复位置回归用导入的合法 typed document，不能声称普通选择器能直接产生该步骤。

**预期。** 当前 canonical 字段和各同身份位置使用同组选项，默认值为 `pass`；新行保存真实 UUID 及实际默认值。保存设计、首次 START 冻结后，后端接受合法值、拒绝未知值；模板后来改变不替换已有冻结配置。

**原行为及影响。** `DesignerInspector` 只写当前节点 `widgetConfig.optionList`；`updateNodeBindings` 原来只有引用配置同步，canonical `typeConfig.options` 及其他位置保持旧值/空值。默认圆点写原始整行 `合格:pass`。纸面控件可显示并写 widget 选项，而 `newSubTableRow` 和 `ProductionExecutionEngine.validateValues` 读取 canonical 选项。于是配置、真实默认输入及提交校验分裂。SAVE 不做同等全表提交校验，单凭 SAVE 成功不能证明 SUBMIT 可用。

**最小整改。** 新建 `choiceOptions.ts` 处理既有 `label:value` 转换和当前文档同字段同步；store 原命令更新 model、全部页/递归 children 中同字段位置及子列 embedded，按父表和子列 ID 隔离。模型编辑和重绑也投射 canonical 选项。保持同 value 选项 ID 与停用定义元数据、无关 widget 设置、节点布局及原完整文档 history。只有实际 `optionList` 改变才采用编辑文本，避免只读/默认/显示配置顺带采信旧副本或复活停用值。默认按钮使用解析出的 `optionValue`。重复同字段位置的 React key 加入 node ID；数据仍按同字段/实际行共享。

**兼容及反证边界。** `initializeChoiceField` 只在新字段创建和主动类型改变写命令生成既有两个预置；registry 与旧文档 parse 未改，不在读取缺失/空 options 时补值。不同字段、其他父表、旧 document、已有显式输入及冻结快照不被迁移或覆盖。没有运行时选项并集、放宽服务端允许值、查询最新模板或新增生失效政策。

**验收要求与主测。** 单/多选跨位置、跨页、父表隔离、模型反向同步、同值保留 ID、停用元数据、单次 undo/redo、保存重读、旧缺失/空 options 不补值、真实默认按钮与纸面增删行，以及冻结 SAVE/SUBMIT 正反证。多选默认保护 Inspector 的独立选择/取消/保存，不宣称原行工厂新增多选默认能力。新后端测试还检查非法值拒绝后的 revision、record values、audit 不变，成功后完整冻结 JSON 内容不变。主实例已实际完成 126 Node、13 浏览器、build 和静态 guard 通过；Java 189 总项、186 通过、0 失败/错误、3 条件跳过；原基线选项 10 条为 8 失败、2 正对照通过。此处仅承接主测结果，独立结果尚未产生。H2 兼容模式和受控浏览器保存载荷分开报告，不外推原生 PostgreSQL 或完整后端 E2E。

**验证诊断处置。** 新测试曾因夹具不能通过普通主字段选择器形成重复位置而失败，该部分不作为旧缺陷红证据；使用 typed document 后再复现。新冻结断言比较完整解析 JSON 树，避免 `1.00` 等数字词法归一化被误判为内容改变，不缩小字段比较范围。静态 guard 中固化 raw `optionLabel` 的单选断言改为要求解析并保存实际值，其余门槛保留。真实重复位置触发的 React key 冲突作为同切片最小修复，不能靠忽略 console error 通过。

### 首轮独立发现 QF-W2-CHOICE-001

首轮正式 `failed`（medium/open），原始 [qualityResult](evidence/independent-first-failed/quality-result.yaml) 和真实UI [复现](evidence/independent-first-failed/modeltab-child-reproduction.json) 原字节保留。`tabs/model/ModelTab.tsx::createSubTableField` 仍用registry空选项；子列新增及改型走 `updateSubTableFields → updateField(parent,{columns})`，父表类型未变，绕过原初始化。实际新建单选子列的模型为空，Inspector显示预置，未编辑文本直接设默认后真实两行均无该字段值。仅检查快捷工厂不足以覆盖此入口。

修正版仅在父表显式columns写命令中，比较子列稳定ID与旧类型，对新增或实际改型列初始化；同类型旧列保留missing/empty，读工厂不变。后续沿原同步和一次history更新embedded及widgets。新增两条store用例在c449为2失败，原10条全部通过；修后全128 Node通过，真实ModelTab新增/改型/保存/默认/新行两视口通过，构建及静态guard通过。测试最初用全局保存按钮等待child-design自动保存，但该视图没有全局按钮，已改为等待实际document清脏；属测试等待条件修正，不计产品红证。修正版最终状态仍待全新质量实例，未把本条提前标关闭。

## 历史去重

| 旧问题 / 批次 | 当前处置 |
| --- | --- |
| PR5/PR6：身份、引用依赖、显式 DHR 版本、删除 schema、quantity fixture 等 | 已合并，保留原验收与限制，不重新收尾 |
| W2-F001-SAVE-ACK / PR10 | 已合并；本批不是重新修保存 A/B 竞态 |
| AUD-H002、旧 W2-F002-FORM-AVAILABILITY / PR11 | 已合并；历史已有重用短序号，本批使用完整唯一 ID 区分 |
| 正式投影链、W2-C001-LEGACY-ROW-KEY / PR12 | 已合并；不迁移旧冻结配置，不重计原运行结果 |
| W2-F002-COLUMN-INSERT-NODE-ALIGNMENT、W2-T001 / PR13 | 已合并；不将插列节点几何和过期测试入口当本次新发现 |
| W2-C002 → W2-F003-SUBFIELD-DEFINITION-SYNC / PR14 | 已合并且树等同批准交付；本批解决选项编辑写路径，与原通用子列编辑同步不同 |
| AUD-H003 缺 fillMode 推导 DIRECT / 发布旁路 | W3 open；只读调用图已核对，留下一批，不新建重复 ID |
| AUD-H004 旧权限例外；AUD-H009/H010 条件配置存储/发布 | W3 open，本批不关闭 |
| A12、表单变更/作废及两项旧 DHR high | 依用户确认暂缓/open，待相关能力实现后继续，不隐式降级 |

动态字段条件只有未调用的配置函数和旧实体定义，不足以证明当前存在合法可编辑 AST 的执行缺陷。不同 renderer 的静态 placement 限制也不能自行推导为全字段隐藏政策。以上线索不升级为本批缺陷。
