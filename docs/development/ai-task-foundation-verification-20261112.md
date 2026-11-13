# AI 协作与任务底座 1A 验证

基线 `codex/ai-experiments@9c18e27793a2bfa693957e0319ceea2d25b0fcf2` 加本切片工作树；对照 `edhr-dev@3ae01d53dda205de277f4aa09b92fbbb9a337468`，契约增量已读取，未跨分支合并。知识 `0.3.25 / schema 1.2.0`，执行级别L2。

## 交付范围

新增AI协作领域及实现关系；独立产品运行契约；研发契约的AI验证边界；Java持久任务执行底座。实现默认关闭，无模板写入、页面、模型或供应商调用。原产品设计切片1拆分1A和1B，本报告只覆盖1A。原生写入、编辑占用、业务回执与修订兼容仍在1B。

## 主侧运行证据

2026-11-12/13 在独立PostgreSQL数据库执行。初轮任务库 `edhr_ai_task_test_20261112`，修正未发布迁移后的全新任务库为 `edhr_ai_task_test_20261113`；迁移专项使用 `edhr_ai_migration_test_20261112`，每次按测试契约重建。未操作开发业务库。

```sh
# 在 gmp-platform/backend 目录，测试库URL和PGUSER通过环境变量传入
mvn -q -Dexec.skip=true -Dtest=AiTaskPostgresTest,AiTaskMigrationPostgresTest,SecurityConfigTest test
```

修复后的主侧结果：任务集成23项、迁移1项、既有安全配置6项，共30项；0失败、0错误、0跳过。证据为对应 `target/surefire-reports/TEST-*.xml`；本地归档在 `output/ai-product-slice-1a/`，不将本机输出目录视为发布资产。

覆盖真实身份数据、即时权限、所有者隔离、创建幂等及并发、领取唯一性与换代、时限、停用/继续、旧轮次、持久预算、预留和结算幂等、停止竞态、事务回滚、实际HTTP服务器→JWT过滤器→Java事务→PostgreSQL链路。迁移覆盖旧正式主清单升级、重复执行、原身份与审计保持以及旧应用审计列集兼容。既有安全6项回归通过。

事务回滚不等于SIGKILL验证，服务对象重新构造不等于Worker进程重启。未执行浏览器、生产数据库、模型质量或供应商对账测试；本切片未修改这些路径。

## 本体与独立质量

本体实例 `ai_product_ontology_1a` 返回 `ontologyResult.result: updated`；正式知识校验89项通过（0失败、0错误、0跳过）。概念规则仍specified/internal，真实实现锚点为implemented/internal；未登记虚假的verified执行契约，未提升全仓P0阶段。

初轮独立质量实例 `ai_product_quality_1a` 返回failed，重跑当时28项和知识89项均通过，但实际复现两项medium：前100个有效运行轮次遮挡后续排队任务；非法UUID返回500。主侧已将可领取条件移到SQL分页之前，并在AI专用异常处理返回参数错误400；补充101任务领取及UUID/查询参数回归，当轮29项通过。原failed结果保留在本地 `quality-result.yaml`，最终由新的独立质量实例复验，不用主侧测试替代。

第二实例 `ai_product_final_quality_1a` 独立确认原两项修复，29项和知识89项均通过，但新增medium：AI任务用户外键阻断原有普通账号删除。主侧已删除这一未发布迁移中的额外删除约束，保留历史owner ID与任务事件，当前账号不存在时仍拒绝读取和执行；新增按原UserController删除顺序的真实数据库回归，在全新任务库上30项通过。原复验failed保留为 `final-quality-result.yaml`，最终通过结果需由再次新建的独立实例给出。

最终全新实例 `ai_product_release_quality_1a` 返回 `qualityResult.result: passed`（2026-11-13），独立重跑后端30项和知识89项，均0失败、0错误、0跳过，三项历史发现已关闭。结构化原件为本地 `release-quality-result.yaml`，审查对象为基线HEAD加30个暂存文件；其记录的暂存差异SHA256为 `c7e5fb958ef788d405e9faca1f63292dcafcaa4e2acab549ae092fda2aa2e457`。本段为结果归档，代码、测试、迁移与知识在该复验后未改动。通过仅覆盖本轮1A，不覆盖未来合并候选或商用部署。

## 残余边界

- 单安装、单Worker范围；所有能力事务按安装能力行短时串行，尚无生产吞吐或高可用结论。
- 默认知识标识unpublished、模型fixture-no-model；正式能力知识包及DSH产品适配尚未接入。
- 停止后的未知调用保留预留，最终供应商账单核对需后续实现；当前无实际费用。
- 生产选用未完成模板的边界、附件策略、原生写入审计和编辑冲突必须在相应切片验收后开放，不能将本轮通过称为AI表单商用上线。
- 回退采用关闭AI并回退应用，保留新增任务表与运行记录；不触碰历史生产快照。

证据分级：本轮源码、数据库及测试为original-evidence；用户批准的产品方向为user-confirmed；既有DSH实验报告只作为secondary-reference；分期、部署参数与技术结构为工程选择，非客户套餐或新生产政策。
