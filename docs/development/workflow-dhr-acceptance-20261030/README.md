# 流程操作与 DHR 联动验收

## 当前入口（2026-10-31 更新）

- 验收页面：http://localhost:3000
- 开发后端：http://localhost:8081
- 开发数据库：`edhr_dev`
- 代码：主目录 `edhr-dev`，包含朋友记录控制、DHR 联动和流程操作提交；具体合并及质量结果见 `../edhr-dev-integration-20261031/`。
- 主目录：`/Users/ivenwang/Documents/edhr-nexus`

2026-10-31 用户要求统一到主目录。已将功能及专用样例按增量方式集成，原有开发记录保留；无需再切换独立工作树或验收库。下文启动命令使用默认开发配置。历史环境恢复报告及截图中的 3010/8091 地址只描述当时验证，不是当前入口。

## 重启命令

分别在两个终端执行，保留终端运行。端口被占用时先核实已有服务，不要关闭不明进程；启动失败不要重新初始化或恢复数据库。

后端：

```sh
cd /Users/ivenwang/Documents/edhr-nexus/gmp-platform/backend
JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home mvn -q spring-boot:run -Dspring-boot.run.arguments='--server.port=8081 --spring.profiles.active=dev'
```

前端：

```sh
cd /Users/ivenwang/Documents/edhr-nexus/gmp-platform/frontend
npm run dev -- --port 3000 --strictPort
```

## 账号与流程操作

以下均为新增到开发库的合成验收账号，原有账号未修改。登录密码为 `Uat1030!Pass`，电子签名密码为 `Uat1030!Sign`。切换账号请先退出登录；同一浏览器会话的多个标签不要同时用不同账号。

| 账号 | 操作 |
| --- | --- |
| `uat_manager` | 生产 → 流程中心 → 流程干预，打开 `RC-20261030-000001`，当前任务 → 重新分配，选择“验收·审批乙”，填原因并签名。重新分配不等于审批通过。 |
| `uat_reviewer` | 记录 → 变更审批，打开 `RC-20261030-000002` → 转办，选择“验收·审批乙”，填原因并签名。本样例节点配置要求转办签名。 |
| `uat_target` | 接收重新分配／转办后的任务，核对新的处理权。 |
| `uat_applicant` | 记录 → 我的变更，`RC-20261030-000003` 可撤回；`RC-20261030-000004` 已有首节点批准，不能撤回。 |

流程日志的技术路由仍为 `/workflow/instances`，新流程干预入口为 `/workflow/interventions`。

## DHR 样例

在 DHR 列表／汇总／审批中搜索 `UAT-1030`；每组相互独立。来源表单流水号为 `FR-UAT-1030-` 加下表代码。

| 代码 | 操作及预期 |
| --- | --- |
| `DHR-REVIEW` | 当前 DHR 在审批中。申请人从记录变更提交来源表单变更／作废应被阻止；变更先实际修改字段才能提交。审批甲在 DHR 审批中退回后，才可发起来源申请。 |
| `DHR-PENDING` | 来源申请 `RC-20261030-000005` 在审。申请人在 DHR 汇总的待汇总／汇总中分组打开，保存草稿并完成核查后，汇总提交应被阻止。撤回或审批结束该来源申请后，重新核对并提交。 |
| `DHR-CHANGE` | 审批甲批准 `RC-20261030-000006`，当前表单由 `UAT-LOT-OLD / 100` 变为 `UAT-LOT-NEW / 120`；汇总提交人收到提醒。DHR 旧 V1 保持原值与原批准。申请人发起修订后，在当前草稿核对新值。 |
| `DHR-VOID` | 审批甲批准 `RC-20261030-000007`，来源作废。申请人在 DHR 发起修订后，当前草稿默认隐藏作废表单；DHR 导航标题旁竖三点 → 显示作废表单，可查看并再次隐藏。档案版本切回 V1 仍保留冻结时有效的原记录。 |

已正式汇总的 DHR 打开时显示冻结版本；要在 DHR 内核对当前来源，请先“发起修订”进入当前草稿。该操作不代表另有独立 DHR 变更申请流程。归档、独立 DHR 变更申请和打印过滤不在本次验收范围。

验收动作会消耗样例状态，不能把已操作后的状态当成初始化失败。迁移没有重置既有记录。迁移前原库及验收库备份保留在 `/Users/ivenwang/.codex/backups/edhr/integration-20261031/`；需要重置样例时先保留验收结果，不能用旧验收库整库覆盖 `edhr_dev`。
