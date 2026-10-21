# 本体路径待修清单

> 这是初始化整理阶段的原始盘点，行号指向当时文件。后续处理状态和逐条结果见[初始化知识引用修正](../initialization-knowledge-references-20261021/README.md)，本清单保留作为历史依据。

这里只列出上轮初始化整理导致的107处路径引用，涉及38个文件。本体内容没有乱码，也没有在本轮被修改；CSV已补UTF-8编码标记。以下建议均留待后续逐项修正。

完整旧路径与建议路径保存在同目录的 knowledge-path-followups.csv。旧脚本原目录为 gmp-platform/backend/src/main/resources/db/changelog；历史测试夹具现位于 gmp-platform/backend/src/test/resources/db/changelog；当前基线位于 main 目录的 baseline/。

分类：当前实现锚点54处、当前数据库事实来源5处、历史证据48处。

## docs/knowledge/decisions/DEC-0006-production-work-template-configuration.yaml

- 第233行：0059-work-template-audit-baseline.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0059-work-template-audit-baseline.sql。

## docs/knowledge/decisions/DEC-0042-record-control-workflow-stage1-contract.yaml

- 第69行：0080-record-control-workflow-contract.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0080-record-control-workflow-contract.sql。

## docs/knowledge/evidence/dhr-filling-review-confirmed.md

- 第185行：0092-dhr-summary-workspace.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0092-dhr-summary-workspace.sql。

## docs/knowledge/evidence/dhr-instance-management.yaml

- 第30行：0082-form-instance-records.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0082-form-instance-records.sql。
- 第35行：0086-form-instance-business-source.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0086-form-instance-business-source.sql。
- 第50行：0089-dhr-instance-management.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0089-dhr-instance-management.sql。

## docs/knowledge/evidence/dhr-summary.yaml

- 第25行：0092-dhr-summary-workspace.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0092-dhr-summary-workspace.sql。
- 第30行：0093-dhr-summary-version-review-binding.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0093-dhr-summary-version-review-binding.sql。
- 第60行：0100-dhr-summary-evidence-order.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0100-dhr-summary-evidence-order.sql。
- 第105行：0101-dhr-summary-evidence-display-name.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0101-dhr-summary-evidence-display-name.sql。
- 第135行：0102-dhr-summary-complete-evidence.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0102-dhr-summary-complete-evidence.sql。
- 第140行：0103-dhr-controlled-attachments.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0103-dhr-controlled-attachments.sql。
- 第145行：0104-dhr-current-evidence-only.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0104-dhr-current-evidence-only.sql。

## docs/knowledge/evidence/equipment-modeling.yaml

- 第25行：0001-init-schema.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0001-init-schema.sql。
- 第35行：0073-equipment-modeling.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0073-equipment-modeling.sql。
- 第50行：0074-equipment-system-fields.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0074-equipment-system-fields.sql。
- 第65行：0075-equipment-brand-purchase-date.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0075-equipment-brand-purchase-date.sql。

## docs/knowledge/evidence/form-instance-query.yaml

- 第20行：0083-form-instance-query.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0083-form-instance-query.sql。
- 第45行：0086-form-instance-business-source.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0086-form-instance-business-source.sql。

## docs/knowledge/evidence/form-process-version-references.yaml

- 第15行：0072-work-form-process-references.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0072-work-form-process-references.sql。

## docs/knowledge/evidence/form-traceability-projection-ownership-user-confirmed.md

- 第972行：0113-trace-date-preset.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0113-trace-date-preset.sql。

## docs/knowledge/evidence/form-worklists.yaml

- 第30行：0084-form-worklist-permissions.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0084-form-worklist-permissions.sql。

## docs/knowledge/evidence/identity-subject-selector.yaml

- 第80行：0071-workflow-task-candidates.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0071-workflow-task-candidates.sql。

## docs/knowledge/evidence/master-data-description.yaml

- 第10行：0095-remove-duplicate-remarks.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0095-remove-duplicate-remarks.sql。

## docs/knowledge/evidence/material-fields.yaml

- 第15行：0078-material-brand.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0078-material-brand.sql。

## docs/knowledge/evidence/material-import.yaml

- 第25行：0081-material-brand-name.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0081-material-brand-name.sql。
- 第30行：0087-restore-standard-material-types.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0087-restore-standard-material-types.sql。

## docs/knowledge/evidence/ontology-foundation-fact-types.md

- 第57行：0059-work-template-audit-baseline.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0059-work-template-audit-baseline.sql。
- 第97行：0062-production-object-and-work-order-lifecycle.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0062-production-object-and-work-order-lifecycle.sql。

## docs/knowledge/evidence/product-process.yaml

- 第100行：0044-product-process-modeling.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0044-product-process-modeling.sql。
- 第105行：0045-document-management-versions.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0045-document-management-versions.sql。
- 第110行：0049-product-process-dhr-item-binding.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0049-product-process-dhr-item-binding.sql。
- 第115行：0052-product-process-document-pages.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0052-product-process-document-pages.sql。
- 第120行：0053-product-family-process-owner.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0053-product-family-process-owner.sql。
- 第125行：0054-product-family-code-case-insensitive.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0054-product-family-code-case-insensitive.sql。

## docs/knowledge/evidence/production-execution.yaml

- 第65行：0076-production-execution.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0076-production-execution.sql。

## docs/knowledge/evidence/production.yaml

- 第45行：0061-production-work-order.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0061-production-work-order.sql。
- 第50行：0062-production-object-and-work-order-lifecycle.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0062-production-object-and-work-order-lifecycle.sql。
- 第55行：0063-production-work-order-permission.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0063-production-work-order-permission.sql。
- 第60行：0064-production-work-order-fields.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0064-production-work-order-fields.sql。
- 第120行：0061-production-work-order.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0061-production-work-order.sql。
- 第175行：0066-production-object-planned-window.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0066-production-object-planned-window.sql。
- 第270行：0067-production-batch-management-permission.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0067-production-batch-management-permission.sql。

## docs/knowledge/evidence/record-control-workflow-stage1.yaml

- 第40行：0080-record-control-workflow-contract.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0080-record-control-workflow-contract.sql。

## docs/knowledge/evidence/signature-payload-storage.yaml

- 第10行：0118-signature-payload-text.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0118-signature-payload-text.sql。

## docs/knowledge/evidence/transaction-runtime.yaml

- 第90行：0059-work-template-audit-baseline.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0059-work-template-audit-baseline.sql。

## docs/knowledge/evidence/workshop.yaml

- 第15行：0001-init-schema.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0001-init-schema.sql。
- 第40行：0070-workshop-management.sql；历史证据。建议指向：gmp-platform/backend/src/test/resources/db/changelog/0070-workshop-management.sql。

## docs/knowledge/facts/dhr-instance-management.yaml

- 第120行：0082-form-instance-records.sql；当前数据库事实来源。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。

## docs/knowledge/facts/dhr-summary.yaml

- 第88行：0092-dhr-summary-workspace.sql；当前数据库事实来源。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第104行：0092-dhr-summary-workspace.sql；当前数据库事实来源。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第136行：0101-dhr-summary-evidence-display-name.sql；当前数据库事实来源。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。

## docs/knowledge/facts/form-instance-query.yaml

- 第8行：0086-form-instance-business-source.sql；当前数据库事实来源。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。

## docs/knowledge/implementation-anchors/core-business.yaml

- 第8行：0071-workflow-task-candidates.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第23行：0044-product-process-modeling.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第38行：0061-production-work-order.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第53行：0062-production-object-and-work-order-lifecycle.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第68行：0059-work-template-audit-baseline.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第83行：0070-workshop-management.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第193行：0080-record-control-workflow-contract.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第213行：0080-record-control-workflow-contract.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第233行：0001-init-schema.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。

## docs/knowledge/implementation-anchors/dhr-instance-management.yaml

- 第8行：0089-dhr-instance-management.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第23行：0089-dhr-instance-management.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第23行：0090-remove-dhr-template-version-snapshot.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第23行：0091-remove-dhr-template-version-status.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第38行：0089-dhr-instance-management.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第53行：0082-form-instance-records.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第53行：0086-form-instance-business-source.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第53行：0089-dhr-instance-management.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第68行：0089-dhr-instance-management.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。

## docs/knowledge/implementation-anchors/dhr-summary-order.yaml

- 第8行：0100-dhr-summary-evidence-order.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。

## docs/knowledge/implementation-anchors/dhr-summary-source-group.yaml

- 第38行：0101-dhr-summary-evidence-display-name.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。

## docs/knowledge/implementation-anchors/dhr-summary.yaml

- 第8行：0092-dhr-summary-workspace.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第8行：0093-dhr-summary-version-review-binding.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第23行：0092-dhr-summary-workspace.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第23行：0093-dhr-summary-version-review-binding.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第23行：0102-dhr-summary-complete-evidence.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第23行：0103-dhr-controlled-attachments.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第23行：0104-dhr-current-evidence-only.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第38行：0102-dhr-summary-complete-evidence.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第53行：0103-dhr-controlled-attachments.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第68行：0102-dhr-summary-complete-evidence.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第68行：0118-signature-payload-text.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第83行：0092-dhr-summary-workspace.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第83行：0093-dhr-summary-version-review-binding.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第98行：0102-dhr-summary-complete-evidence.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第98行：0103-dhr-controlled-attachments.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第113行：0102-dhr-summary-complete-evidence.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第113行：0103-dhr-controlled-attachments.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。

## docs/knowledge/implementation-anchors/form-instance-query.yaml

- 第8行：0086-form-instance-business-source.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第23行：0083-form-instance-query.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。

## docs/knowledge/implementation-anchors/form-process-binding.yaml

- 第10行：0072-work-form-process-references.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第66行：0072-work-form-process-references.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。

## docs/knowledge/implementation-anchors/form-projection.yaml

- 第8行：0106-form-projection-freeze.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第23行：0107-form-projection-runtime.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第38行：0109-saved-form-trace-index.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第38行：0112-typed-trace-catalog.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。

## docs/knowledge/implementation-anchors/form-worklists.yaml

- 第8行：0084-form-worklist-permissions.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0002-current-seed.sql。
- 第23行：0084-form-worklist-permissions.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0002-current-seed.sql。
- 第38行：0084-form-worklist-permissions.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0002-current-seed.sql。
- 第53行：0084-form-worklist-permissions.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0002-current-seed.sql。

## docs/knowledge/implementation-anchors/master-data-description.yaml

- 第15行：0095-remove-duplicate-remarks.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。

## docs/knowledge/implementation-anchors/material-fields.yaml

- 第23行：0078-material-brand.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。

## docs/knowledge/implementation-anchors/production-output.yaml

- 第8行：0114-final-output-operation.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
- 第23行：0107-form-projection-runtime.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。

## docs/knowledge/implementation-anchors/production-quality.yaml

- 第8行：0107-form-projection-runtime.sql；当前实现锚点。建议指向：gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql。
