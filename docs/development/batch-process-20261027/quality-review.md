# 首轮独立质量记录

角色：`/root/batch_process_quality`，知识子检查 `/root/batch_process_quality/knowledge_review`。二者均未修改业务代码、测试或知识，不参与修复。基线 `d5adf22066ea4d6bb1c7e7ede09961fc97bea675`，知识 `0.3.25`，L2。读过项目、codeplzreadme、质量及交接契约；当前契约路径无未提交内容。

## 结论与时点

首轮结果 **failed**：两项 medium 的当前知识一致性问题已交主侧。本记录保存发现时状态；主侧已开始修正，对修改后的资产须由全新质量实例终验，不能把本轮运行检查通过直接变为整体门禁通过。

1. **QF-BATCH-001**：发现时 DEC-0001-03 为 active specified，原文为“历史初始产品制程建模基线确认生产执行须显式选择具体制程版本，当时工单拆分链路未实现，仅进入内部知识投影。后续 DEC-0012 已确认并提供首次拆分选择、锁定与后续对象继承；不能用本历史交付边界否认该局部实现，也不据此宣称通用规则运行层完成。”其中后续当前说明仍指向旧锁版，且遗漏本轮ID处置。源码和DEC-0012当前已支持对象独立版本。
2. **QF-BATCH-002**：发现时 rule.production.process-snapshot-audit-detail 的 condition 只有 audit.entityType == PRODUCTION_OBJECT，result.processIdentityRequired == true。实际普通完成审计仍正确使用差量 `{status: COMPLETED}`，例如独立新库审计 `390211901486321664`，对象 `390211901188526080`。需要收窄知识规则到相应事件/展示语境，不应为满足过宽文档重复存全快照。

## 实际独立运行

- PostgreSQL组合：132项，130执行通过，2项为开发辅助浏览器服务opt-in。日志 `/tmp/batch-process-independent-quality-tests.log`。不是沿用主侧结果。
- 独立创建空库 `edhr_batch_process_quality_20261027`，用真实完整基线和新集成类执行12项全部通过，Liquibase与Hibernate validate成功；旧工单制程列与FK均0，databasechangelog两项。日志 `/tmp/batch-process-quality-fresh-baseline.log`。
- 最终小数批量计算修改后，独立 `npm run build` 成功，含tsc，日志 `/tmp/batch-process-independent-frontend-build.log`。
- 知识子检查独立执行89项全部通过，日志 `/tmp/batch-process-knowledge-independent.log`。schema通过不能发现上述自然语言交叉说明和范围错误。
- 实际服务源：专用3002/8082；未停止或修改用户的3000/8081。独立Playwright会话 `batch-quality`，不是复用主侧操作结果。
- 独立创建 `QA-INDEPENDENT-1793033775453`，计划0.07，按每批0.01生成7批；待提交已选V1后改下拉到V2，保存仍全V1；SN选项禁用。编辑0.02超量禁保存，0.005保存成功。SQL复核计划0.0700、对象7个、已分配0.0650、版本均V1。
- 独立审计查看 `BATCH-20261027004031431055-2288`：冻结工序为“更新后的装配”，数据库当前工序为“再次变化”；{}详情只呈现冻结值。审计ID `390207977127727104`。截图已目视检查，可读可滚动。

截图：`output/playwright/batch-process-independent-edit-1440.png`、`batch-process-independent-edit-1024.png`、`batch-process-independent-audit-1024.png`。页面普通React Router future flag警告存在；新独立审计/编辑流程无控制台运行错误。

## 候选识别

相关已跟踪实现diff SHA256：`990237161db4e31852b34f0b81f3547283d32d6e1feda6a9d0e6e1829603e1d3`。

生成范围为 `git diff -- gmp-platform/backend/src/main/java/com/zencas/edhr/production gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql gmp-platform/frontend/src/pages/production/WorkOrderPage.tsx gmp-platform/frontend/src/pages/production/BatchManagementPage.tsx gmp-platform/frontend/src/api/work-orders.ts gmp-platform/frontend/src/utils/productionAudit.ts | shasum -a 256`。

未跟踪新文件校验：BatchProcessIntegrationTest.java `5e4ed61ff5dbf66c850d470a8eaa825ee9e7e3ba927f7bf0715ddb25dbc26d0f`；ProductionObjectEditDialog.tsx `ed2bb4a3837215d7c86df669d4d9b2799a03ce7b1247ff32cd4b636264804088`。知识资产在本轮发现后由主侧安排修正，不以这些代码校验代替修正后知识验收。

本轮保留无关流程画布与前序作业变更，未扩展全系统测试、旧库兼容、发布或其它冻结详情入口。新质量实例应先核对实际候选增量再决定需要重跑的范围。
