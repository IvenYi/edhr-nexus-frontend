# 追溯区域消费者只读独立源码核对

本实例未参与修复，未修改仓库，未运行 Maven、Node、构建、浏览器或数据库测试，也未查或触发 Actions。基线为 `061d7f1ff71d11084667d08293fd7d5fe0d7680d`，实际读取候选/契约为 `ba68b03dab051d228c3646a03bbb404f2724f1d4`，开始及结束工作树均 clean。知识 `0.3.25 / schema 1.2.0`。

结论：三处生产文件的有限方法范围内未发现新增可复现缺陷。两项原问题的修复与既定政策一致，最终运行通过应取正式质量实例的新鲜执行证据；本文件不是正式 qualityResult，也不声明整文件或整个分支通过。

## 原问题与修复因果

- **W2-TRACE-REGION-001 / high**：独立亲读 `FormTraceIndexService.extract`。基线中空白 tableId 非空串，被错误用于子表查找，合法根字段和值被跳过。候选仅两处改为 `isBlank`，与原解释器 `validate` / `preview` 及新设计 `validateConfiguration` 的 Java 空白主表身份一致。输出继续为主表 `"" / form / -1`，不会写回 binding。非空白 tableId 保留原字节，实际行仍用 `__rowId` 或原 legacy 下标定位。原 add 的值类型、内容规范化和去重键未变。
- **W2-TRACE-REGION-002 / medium**：独立亲读 `ProjectionDialog` 的打开定位、区域构建和分组、模拟字段渲染与结果标题，以及 `projectionPreview` 的样本键、字段集和值构建。候选在遗漏消费点复用既有 `projectionTableId`，空白主表归入根区域、模拟根值进入根对象；没有改写模型、真实数据或保存行为。共享 helper 的正则与 Java 空白集合一致，非空白及不换行空格 ID 不 trim。普通主表与其他子表列、行值维持独立。

## 测试源码与失败证据

新增 Java 单元覆盖省略、空串、混合空白及全部 BMP `Character.isWhitespace` 字符，要求通过设计校验并取到精确主表值，且配置 JSON 不变；另有 main、`" details "` 与 `details` 的精确 ID/行正对照。新增保存 PostgreSQL 回归通过真实 saved+显式事务查询，验证即时命中、替换后旧值消失、新值可查、跨实际行不拼配、快照字节不变和无正式投影。新增终止 DHR PostgreSQL 回归在冻结后改 live 值，要求仅旧内容命中和冻结原件不变。后者 reader 是 Mockito mock，不证明真实 hash 读取；该限制明确保留。

新增 Node 用例对旧实现必然在空白字段集区域键处失败；当前使用根样本键并要求根对象精确相等，同时保留 padded/NBSP 子表身份正对照及原有四项测试断言。浏览器脚本仍使用真实 Shell/Canvas/MUI/Zustand；新增两视口用例检查无假失效子表、根级 POST 值、原 tableId 和整 document 不变、dirty=false、无保存回调、结果文字及页脚键盘关闭。catalog/preview POST 是受控 API 夹具，不冒充全栈持久化。基线替换插件新增恰好 ProjectionDialog 和 projectionPreview 两消费者文件，旧断言未弱化。

我独立解包 failing-runs.zip，逐一校验五成员字节数与 SHA-256，均匹配。最终同一浏览器夹具对固定基线出现“子表来源已失效”，在 1≠0 的产品断言失败；Node 原失败是 `[' ']` 与 `['']` 不等。两次中间失败分别为目录缓存使标签错误与关闭按钮双匹配，修正采用先装夹具后 reload、页脚语义定位，未放宽值、无变更或可达性断言。该档案是历史因果证据，不代替本实例未执行的当前运行。

## 相邻保护与边界

只读子辅助 frozen_boundary 已正式 FINAL，报告 `/tmp/edhr-trace-qa-frozen-source-review.md`。其精确方法审读确认：saved 的 refresh 使用现有事务，后续保存不覆盖 snapshot_json，正式统计仍仅 COMPLETED；旧执行从自己的 snapshot_json 读取，新配置才进入 validateConfiguration；DHR query/matches 仅消费真实关联成员，终止 reader 对持久化原字节核 SHA-256 后返回冻结 dhr，控制器权限未改。四个实际控制器生命周期测试源码覆盖真实 START 并发/保存/冻结读取/hash 生成，但不含 hash 篡改负向断言，也不把 mock PG 测试外推为此能力。

已有漏索引不会自动回填，后续合法保存沿原事务刷新；终止冻结反查可直接从原件提取。本批没有新增迁移、真实库清理、恢复历史、改权限或签署，旧多绑证据不套新设计约束。DEC-0077-20/33/38/42、单绑规则和完整 decision-package 的 impactAnalysis/extensionStrategy 已核对，规则相对基线只有新 evidenceId 引用变化，无政策变化。

所有具体 path/blob/SHA/方法范围及失败成员收据见同名 JSON；wholeFileReviewComplete 均 false。旧 DHR high、A12、四 gap、H009/H010/H012 和全局检查限制均不由本报告关闭。正式 QA 应结合其实际运行给两问题作最终 resolved 判断。
