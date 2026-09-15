# P0 影响分析示例：表单流程版本引用治理

## 分析对象

- 变更主题：表单流程版本引用治理（绑定、当前发布版本、受控升级、使用投影和删除阻断）。
- 知识基线：`knowledgeModelVersion: 0.3.16`。
- 分析级别：`L2`。
- 分析状态：`reviewed`。该文件是可复核的人工影响分析样例，不是自动生成的完整代码依赖图。

## 直接影响

1. 事实目录：
   - `fact.form-process-binding.form-template-version-id`
   - `fact.form-process-binding.form-process-template-version-id`
   - `fact.form-process-version-reference.referenced-version-is-current`
   - `fact.form-process-version-usage.reference-count`
2. 业务规则：
   - `rule.form-process.binding-requires-form-and-flow`
   - `rule.form-process.published-version-reference-fixed`
   - `rule.production-work.form-process-reference-controlled-upgrade`
   - `rule.form-process.delete-referenced-forbidden`
3. 业务概念：`concept.form-process-version-reference`、`concept.form-process-version-usage-projection`。

## 传递影响与实现锚点

| 追踪路径 | 已核对实现证据 |
| --- | --- |
| 事实 → 绑定保存/发布 | `anchor.form-process-binding-controller` → `WorkTemplateController.java`、`WorkTemplateEditor.tsx`、`WorkTemplateControllerTest.java` |
| 事实 → 引用持久化 | `anchor.form-process-binding-reference-service` → `FormProcessReferenceService.java`、`WorkFormProcessReference.java`、`0072-work-form-process-references.sql`、`FormProcessReferenceServiceTest.java` |
| 事实 → 使用情况投影 | `anchor.form-process-binding-usage-projection` → `FormProcessController.java`、`GET /api/form-processes/{id}/usage`、`FormProcessList.tsx`、`FormProcessControllerTest.java` |
| 事实 → 受控升级 | `anchor.form-process-binding-controlled-upgrade` → `WorkTemplateController.java`、`GET /api/work-templates/{id}/flow/form-process-reference-status`、相关前端和测试 |
| 事实 → 删除阻断 | `anchor.form-process-binding-delete-guard` → `DELETE /api/form-processes/{id}`、`FormProcessList.tsx`、删除引用测试 |

## 兼容、快照与审计影响

- 当前已核对的是配置引用、当前发布版本治理和删除引用阻断；生产对象创建时的运行时命中规则、流程版本和配置快照仍需在生产执行切片中再次核对，不能由本目录提前宣称已实现。
- 已发布引用不能被静默改写；受控升级必须保留原引用和升级结果，后续运行时实例必须保存命中的版本与配置快照。
- 本次 P0 不添加数据库迁移，不引入 OWL/RDF/SHACL，也不把所有数据库字段登记为事实。

## 潜在影响与证据缺口

- **潜在**：生产执行、审计回放、历史版本解释可能读取这些引用。它们尚未全部接入当前实现锚点，进入对应开发切片时必须补充运行时/快照/审计证据。
- **不受影响**：表单渲染器字段权限、组织主体解析和条件节点 AST 不因本事实目录首切片自动改变。
- **缺口**：目前校验器能够验证目录结构、引用解析和操作符，但不自动从 Java 调用图或数据库 schema 生成影响范围；分析结论仍需由源码、迁移和测试证据复核。

## 复核方法

1. 执行 `cd gmp-platform/backend && mvn -Dtest=BusinessKnowledgeModelTest test`。
2. 从事实 ID 或 alias 查找启用 `factCatalogProfile` 的规则。
3. 按规则 `targetId` 和实现锚点 `targetId` 追踪代码、API、数据库、UI 与测试引用。
4. 对生产快照、审计和运行时执行范围回到源码和对应测试重新核对。
