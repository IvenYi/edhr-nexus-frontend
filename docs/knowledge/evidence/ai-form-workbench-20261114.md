# AI 表单工具切片 2C 的来源与边界

知识基线为 `0.3.25 / P0`；源码与契约读取基线为 `450379670504ca3f8bd1f65a275f48633dd50379`，分支 `codex/ai-experiments`。本记录只覆盖 2C，不覆盖商用发布、完整表单生成质量或全仓本体阶段升级。

## user-confirmed

用户本轮授权原话：

> 可以，就按这个方案开始做2C，在 codex/ai-experiments 分支上补齐受控本体查询、业务关系查询、局部编辑、语义检查和预览反馈，暂时不开发页面，如果需要调用模型就调用DeepSeek吧先。

这是对受控工具工程切片的授权；不等于已确认客户正式来源职责、签署政策或新的生产执行权限。2D 的真实模型与三张安速康表单质量验证仍独立验收，不因 API 额度调整而降低配置质量标准。

## 既有规范与 secondary-reference

- [DEC-0097](../decisions/DEC-0097-ai-collaboration-runtime-boundary.yaml) 保留产品 Agent 与研发 Agent 的权限边界，直接修改原生模板、当前用户资格、任务目标和修订、回执、知识投影以及可读事件的规范。
- `rule.ai-knowledge-approved-projection` 继续要求产品知识消费具有批准的投影资格；内部 `specified/implemented` 资产被实验读取，不使其获得客户或生产运行资格。
- 当前表单字段、追溯项、用途配置、正式投影和表单实例定义复用 `ontology.yaml` 与 `glossary.yaml` 的稳定 ID。关系查询的概念边不等同真实实例关系；内容匹配不建立生产或 DHR 归属。
- `rule.form-projection.trace-field-single-binding`、`rule.form-reference-runtime` 是当前配置查询的来源；历史一次性存量清理授权不成为本任务修改其他模板的权限。
- 不良数量口径、表头共享等未决问题按 `open-questions.yaml` 的具体影响范围解释，不把已确认规则、工具错误或普通布局问题重新交给客户确认。

## inference 与验收边界

[本轮决策包](../../architecture/ai-collaboration-slice-2c-decision.yaml) 将固定源提交、白名单记录、受控查询及来源摘要作为工程方案。内部验证包须保留原成熟度和 visibility，明确只供隔离实验；本记录不批准客户或生产投影，不将构建包等同知识发布。

局部修改应保留未触及的原生配置，受当前修订、资格与真实操作回执约束。确定性语义检查只证明其覆盖的配置约束，不证明客户原件完整、业务用途正确或所有语义已验证。预览须关联当前原生版本；浏览器渲染与布局观测属于 Worker 产生的过程证据，不能由模型自述替代，也不单独授予任务成功。

## original-evidence 源码核对

- `scripts/ai-form-agent/build-2c-knowledge.mjs` 从固定基线提取18条白名单记录，保留概念对应术语、两条明确概念关系、字段单追溯约束、引用配置规则及两个相关未决问题。其余知识与证据原文不通过该包开放。`AiKnowledgePackage`核对payload摘要，提供有界查询及概念关系导航，不读运行环境的研发目录。
- `AiWorkbenchService.authorize` 在任务当前资格之外检查默认关闭的内部验证开关及包标识；`query`区分概念关系和当前配置目录，不查询生产实例图谱。`catalog.reference-dictionaries`和`catalog.material-types`是固定目录入口，分别复用`FormReferenceLookup.dictionaries/materialTypes`，不接受任意SQL/URL；字典沿原20条查询上限，返回满页需细化查询的提示，不声称提供全量分页。`inspect`按当前原生修订调用`AiFormAnalysis`，后者复用已有引用和投影校验，并明确客户正式来源职责仍需实施依据。
- 收尾增量中，`checkReferences`按有效字段配置调用共享`FormReferenceLookup.search`执行实际候选查询，并用固定字典ID重核字典存在且ACTIVE。空候选不自动判错；此检查仍不证明特定填写值有效、客户来源职责、电子签名或正式提交通过。
- `AiFormService.patch`和`AiDesignPatch.apply`对三个设计文档做有界操作；未触及配置保留，当前目标、预期修订、事务及幂等回执仍归Java原生路径。未知原生配置不因局部修改整体丢弃。
- `previewFeedback`按当前资格和修订接受执行器观测，来源标识为`worker-native-renderer`。它核对关联资格，不是Java独立完成视觉判断，不能单独证明任务成功。
- `gmp-platform/ai-worker/preview/entry.tsx`复用原生`FormDocumentPreview`和设计反序列化器，不新增用户页面；`src/preview.mjs`在无登录状态、网络阻断的浏览器中生成PNG及manifest，记录修订、渲染器和图片摘要，返回有限布局问题。外部图片及实际引用候选、上传、签署和正式提交不在该预览覆盖内。
- Worker和Java的2C配置基线为`form-worker-2c / ai-task-v3 / form-knowledge-2c-internal / fixture-no-model`；旧任务不静默迁移。`internalValidation`默认关闭，启用这一工程开关不构成知识发布或商用验收。

以上只记录已存在源码。`AiWorkbenchTest`、`AiFormPostgresTest`及`preview.test.mjs`是对应测试入口，本体角色没有运行数据库或浏览器，不将主侧报告冒充本体独立运行证据。测试与独立质量结论在本切片实际完成后分别核对；前期实验脚本和 2B 通过记录仅作索引，不能替代当前候选的验收。
