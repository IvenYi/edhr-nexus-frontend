# 主实现验收记录

时间：2026-10-27（Asia/Shanghai）。执行级别 L2。本记录是主侧实际检查，不能替代独立质量结果。

## 基线与环境

- HEAD / origin/edhr-dev：`d5adf22066ea4d6bb1c7e7ede09961fc97bea675`。开始时已同步，收尾终端 fetch 两次遇到网络错误；随后通过已连接 GitHub 的 compare_commits 再核实 `d5adf220...` 对 `edhr-dev`，返回 **identical / ahead_by=0 / behind_by=0 / total_commits=0**。远端未领先，无需覆盖工作树；未提交、推送、部署或核验分支保护。
- 知识基线 `0.3.25`；契约无工作树变化。保留前序作业实时匹配改动和无关流程画布工作。
- 独立 PostgreSQL 库 `edhr_batch_process_20261027`：完整新 baseline + seed，经 Liquibase 与 Hibernate validate；工单旧制程列及 `fk_delete_guard_013` 均不存在。
- 独立 PostgreSQL 库 `edhr_batch_execution_20261027`：执行集成专用夹具库，用于真实 MVCC/并发测试。两个数据库没有替换用户原开发库。
- UI 验证服务：`127.0.0.1:3002` → `localhost:8082`，任务独立实例。既有 3000/8081 服务未替换。测试夹具为产成品物料，人工创建的 UI-BATCH 工单仅在专用库。

## 后端实际检查

| 检查 | 结果 | 范围 |
|---|---|---|
| ProductionServiceTest | 22 通过 | 对象选版、数量、状态、适用性、结束与完成 |
| WorkOrderControllerTest | 3 通过 | 工单请求与响应回归 |
| ProductionObjectControllerTest | 4 通过 | 拆分控制器、审计及响应 |
| ProductionExecutionIntegrationTest（PostgreSQL） | 91 项：89 通过，2 开发辅助入口未启用 | 首开工一致快照、原执行与动态作业、并发、表单/DHR及审计失败回滚 |
| BatchProcessIntegrationTest（完整新基线 PostgreSQL） | 12 通过，无跳过 | 新模型真实 API/解析器/锁/持久化、权限、数量精度、删除保护、审计 |

本轮最终相关测试共 132 项，130 项执行通过，2 项为显式 opt-in 的开发浏览器服务入口（`form.records.browser`、`execution.browser`）。浏览器交互通过任务独立的完整应用服务执行，未把这两个 skip 计作已执行。

PostgreSQL 命令（backend 目录）：

```sh
mvn -q -Dexec.skip=true \
  -Dbatch.test.url=jdbc:postgresql://localhost:5432/edhr_batch_process_20261027 \
  -Dexecution.test.url=jdbc:postgresql://localhost:5432/edhr_batch_execution_20261027 \
  -Dexecution.test.driver=org.postgresql.Driver \
  -Dexecution.test.dialect=org.hibernate.dialect.PostgreSQLDialect \
  -Dexecution.test.user=ivenwang \
  -Dtest=ProductionServiceTest,WorkOrderControllerTest,ProductionObjectControllerTest,ProductionExecutionIntegrationTest,BatchProcessIntegrationTest test
```

上述组合运行时 BatchProcessIntegrationTest 为 11 项；随后新增干净基线删除保护场景、补齐产成品夹具，用同一真实库单独重跑该类 **12 项全通过**。其他代码未再改变。原始报告在 backend/target/surefire-reports，组合日志 `/tmp/batch-process-postgres-final.log`，最后该类日志 `/tmp/batch-process-clean-baseline-final.log`。

新集成场景包括：同单 V1/V2、SN 不可混用；0.5 编辑与精度上限；取消释放但产品身份不解锁；计划未分配不得自动完成；批次早结束不联动工单；手动结束有活动子对象时阻止且原因必填；同 V1 两批实际内容不同且历史不变；失效和形态变化不造执行快照；产品优先出现后已有簇引用可继续、转簇阻断新开工；并发数量不超分配；START/编辑竞态不混合引用与数量；批次权限可编辑但不能改工单；审计异常回滚；已引用制程删除 409、未引用制程可删。

早期 H2 执行组合检查已执行通过。旧 DeletionProtectionIntegrationTest 的默认命令因未设置专用旧迁移库参数全部 23 项跳过，**不计为通过**；其旧迁移脚手架不在本次复活，当前删除边由新干净基线测试实际验证。测试中 `audit unavailable` 与 PostgreSQL serialization 日志来自故障/竞态断言，不代表最终测试失败。

## 前端与真实页面

- `npx tsc -b --pretty false` 通过；`npm run build` 通过。最后增加审计引用/冻结说明后再次 TypeScript 检查通过。
- 使用 Playwright CLI 操作完整页面：创建计划 0.5 工单，按批次数 2 生成 0.25/0.25；移除一项并选 V2 后手动加入，两个版本整批提交成功；待提交清单已有 BATCH 时 SN 选项禁用。
- 未开工编辑：0.6 超量时保存禁用；改成 0.2 保存成功，计划仍 0.5，剩余变为 0.05。导入 CSV 的 0.05 批次并持久化成功。
- 小数批量边界：按每批 0.01 拆计划 0.07，按4位小数整数单位计算，实际保存7批；避免浮点除法上取整产生第8个0数量候选。修复后 TypeScript 与实际提交再次通过，截图 `output/playwright/batch-process-decimal-bulk.png`。
- 制程选择中的当前配置预览通过所属对象 workspace 加载，页面显示具体 V1、路线和 DHR 模板信息。
- 审计详情：搜索同 V1 的实际测试批次，展开首次开工审计；制程来源/名称/ID/冻结时间可见；点击 `{}` 展示历史 JSON，含“更新后的装配”且非重新读取主数据。1440/1024 宽度检查可读，详情可滚动。
- 工单提前结束入口：空原因按钮禁用；有未结束子对象时后端阻止且弹窗保留原因。成功路径由真实 API 集成测试验收。
- 浏览器控制台中预期400为业务阻断；旧 WorkOrderDetailDrawer 的状态 Chip 嵌套在 Typography 中产生 DOM nesting 警告，React Router v7 提示也为既有警告，本次未调整无关组件结构。

页面截图：

- `output/playwright/batch-process-split-1440.png`：待提交 V1/V2 与 0.25 数量。
- `output/playwright/batch-process-saved-1440.png`：持久化对象。
- `output/playwright/batch-process-split-1024.png`：窄屏重排与剩余 0.05。
- `output/playwright/batch-process-audit-snapshot-settled.png`：动画结束后的真实冻结详情（1024宽）。最初 `audit-snapshot-1440/1024.png` 截图在打开过渡动画中，仅作过程记录，不作为最终视觉证据。
- `output/playwright/batch-process-manual-end-blocked.png`：活动子对象阻止结束。

## 知识及独立门禁

本体角色返回 `ontologyResult: updated`。首轮审查后补正陈旧交叉说明与差量审计规则范围，最终为29个资产、147个ID同步处置；89项知识检查重跑通过。随后仅修正交接报告6条概念scope复制错位，并逐项核对147条处置说明，业务知识资产和代码未变化，未重复声明运行测试。详细定义及原始证据见 `ontology-result.yaml`。主侧另执行 `git diff --check` 通过。知识成熟度未自动提升。

首轮 `quality-result.yaml` 保留两项medium发现；第二轮全新实例的 `quality-result-final.yaml` 确认两项已解决，并再次实际执行12项业务集成和89项知识检查，但指出上述报告scope错位。修正后最后一个全新实例仅核对报告元数据、来源和候选未变化，结果由 `quality-result-completion.yaml` 单列，不把旧failed覆盖成passed。暂缓范围只有用户要求先盘点的其他冻结详情入口；没有引入旧库兼容、批次/SN互转、自动升版或历史作业补做。
