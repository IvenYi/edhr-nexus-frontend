# 字段追溯单项关联：调研与交付

## 调研结论与证据范围

2026-10-19用户授权：先调研一字段多追溯项的需求；没有必要场景则改为一个字段最多一项，同一项可由不同表单、不同字段复用。用户随后明确替代存量处理要求：“之前已经配好一个字段对于多个追溯项的话，直接把对应的配置数据删除吧，我们不需要做兼容，并且记得本体知识需要明确好”。因此不保留旧模板多绑配置；对冲突字段清除全部追溯来源映射，不猜测保留哪项。字段本身、合法单绑、业务用途及已填写/冻结证据不在该配置删除授权内。

- `original-evidence`：冠骋原始前端 `paas-main-front/src/projects/online-form/src/views/designer/constants/index.ts:176` 列出八种专用追溯字段类型；`hooks/reverse-modeling/useReverseModeling.ts:170` 以单值 `type` 创建字段。后端 `gct-edhr-bed/gct-edhr-bed/src/main/java/com/gct/apaas/edhr/notebook/FormTraceManager.java:223` 按 `field.getType()` 采集到对应集合，子表递归同理。前端 `hooks/useSpreadSheet.ts:2180` 的组合单元格是多个独立字段，不是一份值对应多项。仅证明已查路径，不宣称竞品存在全局单绑校验，未运行竞品页面。
- `original-evidence`：直接读取安速康原始XLSX。末道清洁的工单号(A4)、生产批号(E4)、产品料号(A5)、酒精批号(D10)、日期(D14)、NCR编号(D15)分别记录；报废处理单的物料号(A6)、批号(A7)、NCR号(F5)也独立。原件位于 `/Users/ivenwang/Documents/iven space/安速康表单/安速康生产/`。原表仅写“批号”不证明它同时代表内部批号和供应商批号。
- `secondary-reference`：旧确认证据 `form-traceability-projection-ownership-user-confirmed.md:550` 将多绑说明列为工程推断，不能倒写成用户已确认的业务规则。
- `inference`：同义名称应复用同一追溯项；两个角色偶然同值仍应保留各自字段；一格混装两个编号不能靠多绑正确拆分。一个业务日期同时用于追溯日期和报工生产日期，是追溯与统计各一用途，不受本限制影响。外部系统强制共用身份的别名映射有理论可能，但未找到当前客户实例，不为假设保留任意多绑。

因此，本次证据范围内未发现当前MVP必须保留一字段多项的场景，按用户条件授权收紧；不宣称所有行业均无此需求。

## 决策包

```yaml
decisionPackage:
  id: DEC-PACKAGE-20261019-trace-field-single-binding
  scope: template-trace-field-cardinality
  knowledgeBaselineVersion: 0.3.25
  contractBaseline:
    sourceCommit: 336466d95c3866581e5d7d641544756ba7807946
    targetBranch: edhr-dev
    targetCommit: 336466d95c3866581e5d7d641544756ba7807946
    contractReadCommit: 336466d95c3866581e5d7d641544756ba7807946
    uncommittedContractPaths: []
  summary: 一个真实字段或子表列最多关联一个追溯项；删除存量冲突字段的全部追溯映射，不改历史证据。
  confirmed:
    concepts: []
    relationships: []
    rules:
      - id: rule.form-projection.trace-field-single-binding
        name: 字段追溯单项关联
        status: specified
        trigger: template-design.save
        condition: { all: [{ fact: fact.form-projection.trace-field-binding-count, operator: greater-than-or-equal, value: 2 }] }
        result: { type: reject-configuration, cleanupExistingConflicts: remove-all-conflicting-assignments }
        sourceReferences: [本轮用户条件授权及本文件原始调研]
    executionContracts: []
  inferred:
    - id: inference.trace-cardinality-design-boundary
      statement: 校验以表区域和字段身份计数，含停用配置及重复同项；一次性清除冲突字段全部关联，保存/新执行冻结时拒绝新冲突。
      rationale: 防止跨绑定绕过或因画布重复放置改变语义，同时不阻断已有冻结证据读取。
      relatedIds: [rule.form-projection.trace-field-single-binding]
  unresolved: []
  replacementScopes:
    - decisionStatementId: DEC-0077-42
      supersededStatementIds: []
      scope: 替换此前允许同字段多个兼容追溯项的工程选择及同轮先前保留人工修正的存量处理；历史证据原话保留并注明时点。
      retainedScope: 同项跨字段/表单复用、追溯与业务用途独立、真实归属和已形成快照保持。
      sourceReferences: [本轮用户确认]
  impactAnalysis:
    level: L2
    directImpacts:
      - area: template-designer
        change: 主字段、子表列和全表修正入口只允许未关联字段新增；新导入或提交冲突明确报错。
        evidenceReferences: [FieldProjectionConfig.tsx, SubTableProjectionConfig.tsx, ProjectionSourceEditor.tsx]
      - area: template-save
        change: 前后端按真实字段拒绝多绑，保留原文并定位字段。
        evidenceReferences: [projectionConfiguration.ts, FormProjectionInterpreter.validateConfiguration, FormLookupCatalogService.prepareDesign]
    transitiveImpacts:
      - area: new-execution-snapshot
        change: 沿既有validateConfiguration阻止新的冲突配置冻结，不重写既有执行。
        evidenceReferences: [ExecutionSnapshotBuilder.java]
    potentialImpacts: []
    unaffectedAreas:
      - 追溯项跨字段复用、报工/报废/不良统计及数值累计不改变。
    compatibilityAndMigration:
      - 0116一次性清除所有存量模板版本冲突字段的全部formTrace映射，空binding删除；单绑和统计保留，受影响版本lock_version递增。
      - 保持已应用0116原文和checksum；0117按运行时实际表区域补扫空白tableId主表冲突，非空白ID保持原值，其余清理边界不变。
      - 迁移前备份和记录冲突数量；SQL在隔离临时表中测试并检验幂等，不增加运行时兼容分支。
    snapshotImpacts:
      - 已形成的实例、使用时配置和DHR快照不改写；运行preview/validate不添加设计单绑限制。
    auditImpacts:
      - 一次性配置清理由Liquibase变更集与运行清单记录，updated_by明确system迁移标识；不伪造用户操作或删除历史审计。
    permissionImpacts:
      - 不改目录、模板和生产来源的既有权限。
    testImpacts:
      - scope: trace-cardinality
        scenarios: [主表跨绑定冲突, 同绑定冲突, 子表列冲突, 同项跨字段复用, 不同区域同ID, 停用配置计数, 统计共用不受影响, 已形成证据读取, 修正后保存, 清理幂等及零残留]
        evidenceReferences: [test-projection-source-editor.mjs, test-designer-save-browser.mjs, FormProjectionInterpreterTest.java]
    evidenceGaps:
      - 未运行冠骋页面；未进行所有客户业务场景普查，不将有限调研扩大为普遍不存在。
  extensionStrategy:
    selectedPaths: [configuration, product-core]
    rationale: 显式字段含义是统一模板配置约束，不引入客户条件分支。
    ownershipBoundaries:
      - owner: template-modeling
        responsibility: 草稿编辑、保存校验与配置冻结。
      - owner: production-evidence
        responsibility: 保留原始填写、冻结解释与查询证据，不按新配置改写。
  affectedFiles:
    - { path: gmp-platform/frontend/src/pages/master-data/template-designer-react, changeType: update, reason: 配置入口及保存反馈 }
    - { path: gmp-platform/backend/src/main/java/com/zencas/edhr/template/service/FormProjectionInterpreter.java, changeType: update, reason: 严格设计校验 }
    - { path: gmp-platform/backend/src/main/resources/db/changelog/0116-trace-field-single-binding.sql, changeType: create, reason: 删除存量多绑配置 }
    - { path: gmp-platform/backend/src/main/resources/db/changelog/0117-trace-field-blank-region-cleanup.sql, changeType: create, reason: 按运行时主表身份补清空白区域标识边界 }
    - { path: docs/knowledge, changeType: update, reason: 同步本轮单绑规则和证据 }
  acceptanceScenarios:
    - id: scenario.trace-existing-conflict-cleanup
      given: 一字段原有两项关联
      when: 执行一次性配置迁移
      then: 该字段所有追溯映射删除，其他合法配置保留；重新提交多绑被拒绝。
      evidenceRequirements: [迁移隔离测试, 清理前后清单, 前后端及浏览器检查]
    - id: scenario.trace-reuse-and-history
      given: 同项被不同字段复用或已有多绑冻结证据
      when: 保存合法新配置或读取历史记录
      then: 合法复用不受限，历史值及原映射不变；统计用途不误伤。
      evidenceRequirements: [前后端回归, 冻结解释测试]
```

## 前轮开发环境验证（ca98工作树，历史范围）

以下为首次开发工作树及3000/8081开发环境的实际验证，不代替下方基于远端最新提交提取的提交候选验收；本地`output/`备份、日志和截图是运行产物，不随此提交分发。共享分支附带去除原始模板内容的[清理结果摘要](trace-field-single-binding-20261019-evidence/cleanup-summary.json)。

- 前端类型/引用/配置聚焦检查43项通过；后端解释器、统一引用兼容及原因相邻检查30项通过。TypeScript/Vite构建通过，设计器静态校验通过。
- 真实Shell/Canvas/MUI的受控API浏览器检查23场景通过，新增主字段1440/390两尺寸及整子表单绑场景。验证多绑无法提交、不会静默选一项、修正可保存、同项在另一字段继续有效；撤销按设计器既有行为清除选择，重新选择后可见冲突。受控回调不冒充真实后端写入。
- `0116`隔离临时表迁移检查通过：主表/子表、不同区域同ID、原始/包装JSON、同项重复、停用项、其他合法来源/统计保留、锁版本和重复运行幂等；测试事务回滚。
- 2026-10-19在3000/8081/5432的`edhr_form_projection`应用`0116`：实际1个模板版本(985004)、1个字段、2条冲突关联被删除，清理后全库冲突字段0。预先保存`output/trace-single-binding-20261019/cleanup-before.json`；`cleanup-after-and-api.json`核对只删除对应来源且其他模板内容保持，填写、投影、追溯索引和DHR六表计数与全行摘要不变。
- 实际8081后端PUT设计接口对再次提交同字段多绑返回400和字段名称；前后读取的完整模板响应一致，拒绝保存无落库。后端以最新独立运行包重启，端口和数据库不变，PID95245。未重新执行制造业务或改动已有填写数据。
- 前轮本体结果`updated`，知识0.3.25/schema1.2.0保持；最新删除授权同步后知识89项通过。前轮独立质量实例最终`passed`，12项必需检查通过，无发现、无阻塞；质量结果原件为开发机`output/trace-single-binding-20261019/quality-result.yaml`。实际3000安速康副本验证已有单项隐藏添加、移除后可重选、重选后再次隐藏，明确放弃修改后完整模板版本摘要不变；实际API400及数据库清理结果由前轮质量实例独立复核。
- 全仓premium静态审计仍有既有问题，不作为本切片全仓通过；本次UI沿已有MUI字段/侧栏/校验弹窗规范，无视觉系统重设。

前轮日志：`/tmp/edhr-trace-single-{all-fe,be,build,all-browser}.log`。前轮工作树含其他在途功能，其通过不代表本次隔离提交候选或全系统通过。

## edhr-dev提交候选与验证

基于`origin/edhr-dev@336466d95c3866581e5d7d641544756ba7807946`建立干净工作树，只提取单绑、0116清理及DEC-0077-42对应知识。没有携带原因目录、统一引用入口、字典或数量联动等其他在途改动。目标新增的W3绑定审查提交保持，不改写已有历史；项目与角色契约增量比较无差异。

目标基线尚无设计层`validateConfiguration`，因此只为本次增加追溯基数严格校验，并将既有设计保存与新执行快照调用接入；未带入其他用途校验。历史解释仍使用原`validate`。侧栏标题统一为“追溯与业务”，与本次提示入口一致。

首轮提交`2c5ca14efdfe79c62841fa421b9946708cd8da1e`执行前端来源配置25项、后端解释器及模板/追溯权限28项、正式知识89项、PostgreSQL服务/历史投影/快照38项。TypeScript/Vite构建、设计器静态检查、迁移隔离临时表及幂等检查通过。浏览器18场景见[提交候选浏览器结果](trace-field-single-binding-20261019-evidence/browser-result.json)，不把前轮43/30/23计数沿用于本候选。

独立质量发现并阻断一个边界缺陷，记录于[首轮质量报告](trace-field-single-binding-20261019-evidence/quality-result-first.yaml)：运行时将省略、空串和Java `String.isBlank`空白标识均解释为主表，基数检查和0116却按原字符串分组。修复统一前后端计数身份，并新增0117补扫；0116字节不变。非空白ID不trim、不合并不同子表，历史解释逻辑保持。修复后主侧重新执行前端26项、后端29项、PostgreSQL38项、构建和0116+0117迁移测试，均通过；迁移覆盖9种空白标识及重复运行幂等。PostgreSQL测试使用独立UUID schema，迁移测试使用临时表事务回滚，不写公共业务数据。

实际开发库本轮只读补查（含空白区域规范）结果为冲突字段0、冲突映射0，没有再次删除配置；0117尚未在该库应用，将随下一次后端部署运行。本轮未重跑完整制造业务，真实清理仍引用上方开发环境1字段/2关联的原始结果。最终修复提交由全新质量实例独立验收，不沿用首轮failed或前轮工作树passed结果。

第二轮独立验收`dd46244c`已确认001修复，包括Java25种空白、前端和SQL全部BMP字符一致、非空白子表ID保留与幂等；同时发现002：合法单绑空白区域在侧栏和保存检查中被误认失效子表，见[第二轮报告](trace-field-single-binding-20261019-evidence/quality-result-second.yaml)。前端以共享`projectionTableId`统一来源查找、配置问题、字段侧栏和校验反馈的实际区域身份；不改写合法原存储值。新增27项前端检查中的合法空白保存/展示回归，浏览器在1440/390分别验证可保存、移除与再保存，并让冲突用例覆盖空白主表别名及正确区域说明。后端、迁移和本体政策未再变更；最终验收继续使用全新质量实例。
