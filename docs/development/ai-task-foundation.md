# AI 任务底座 1A

本切片实现真实身份下的任务协调，不调用模型，不创建或修改表单。完整目标和下一切片见[运行契约](../architecture/ai-agent-runtime-contract.md)与[产品设计](../architecture/ai-form-agent-product-design.md)。首次产品部署默认关闭。

## 运行配置

Java进程沿用现有数据库与认证。`edhr.ai.enabled` 是部署总开关，`edhr.ai.worker-key` 通过秘密环境变量 `EDHR_AI_WORKER_KEY` 注入，至少32字符，不写Git；安装实例固定于部署 `edhr.ai.installation-id`，首版默认 `default`。不同安装不可共享此默认实例运行，当前不是多租户产品。数据库内表单能力开关初始关闭，具有当前 `system.settings` 权限的用户通过下述接口启用。关闭部署总开关或数据库开关都拒绝执行。

默认验证参数：12次请求、每次最多4096输出token、600秒轮次时限、30秒领取租约、100000微计价单位单次预留、1000000微计价单位任务上限。微计价单位只是部署统一的账本单位；尚未绑定币种或供应商，不是报价。客户默认套餐和计费以后另定。首次任务固定总额，新轮次不重置；模型调用接入前必须由适配器落实输出上限与费用换算。

`plugin-version`、`tool-protocol`、`knowledge-package`、`model-config` 为部署受控标识。当前默认 `form-foundation-1 / ai-task-v1 / unpublished / fixture-no-model` 明确未接入发布知识或模型。新轮次沿用原基线；当前配置不兼容时停止领取，不猜测迁移。

## 用户接口

所有接口采用现有 `ApiResponse` 外壳和JWT认证。服务端重新查账号状态、锁定与角色权限；JWT中的旧权限或显示名不授予访问。

| 接口 | 请求与结果 |
| --- | --- |
| `GET /api/v1/ai/capabilities` | 返回 `form-builder` 可用性、`stage=task-foundation` 和 `businessWritesAvailable=false` |
| `PUT /api/v1/ai/capabilities/form-builder` | `{ "enabled": true }`；要求当前系统设置权限 |
| `POST /api/v1/ai/tasks` | `{ "clientRequestId": "唯一标识", "instruction": "任务说明" }`；当前只接受说明，不接受附件或工具授权 |
| `GET /api/v1/ai/tasks/{taskId}` | 所有者与当前表单权限；返回当前轮次、固定配置、预算和执行状态 |
| `GET /api/v1/ai/tasks/{taskId}/events?after=0` | 所有者授权，按递增ID每次最多100条，可继续读取 |
| `POST /api/v1/ai/tasks/{taskId}/actions` | `{ "clientRequestId": "动作唯一标识", "expectedRunId": "轮次UUID", "action": "stop或continue" }`；返回 `receipt` 固定结果 |

请求键在规定范围内幂等；重复动作返回原回执，未必是最新任务状态，随后读取任务即可获取当前结果。不同参数复用同键返回409。1A没有完成成功、问答、上传、模板写入与预览接口。

## Worker 内部接口

仅在 `/api/v1/ai/internal/` 使用 `X-EDHR-AI-Worker-Key`；普通JWT不能替代Worker凭据，Worker凭据不能访问用户或原生业务接口。生产部署要求TLS或受控内部网络；该凭据不发送到浏览器或模型。

| POST路径 | 请求 |
| --- | --- |
| `claim` | 无请求体；返回一个 `RUNNING` 任务或 `{ "idle": true }` |
| `renew` / `fail` | `taskId`、`runId`、`leaseEpoch` |
| `reserve` | 上述三项加稳定 `requestId`；返回预留与 `replayed` |
| `settle` | 上述四项加非负 `actualMicros` |

`claim` 会处理扫描到的撤权、禁用、超时或不兼容轮次。领取换代后旧代际无效；同轮总时限不延长。定期领取/续期由后续Worker负责，1A没有后台守护进程。停止不等待远端模型返回，但现阶段没有远端模型调用。无法结算的未知调用保留预留；已返回的预留不是再发一次请求的许可。

业务拒绝返回HTTP 400/403/404/409及 `data.reason`，例如 `PERMISSION_DENIED`、`TASK_NOT_FOUND`、`STALE_RUN`、`LEASE_EXPIRED`、`BUDGET_EXHAUSTED`。未知对象与非所有者统一404。非法字段格式由现有校验返回400。

## 本地验证

使用独立空数据库，不能指向开发业务库。迁移测试会重建指定测试库的public schema；测试通过URL前缀严格限定范围。两个数据库必须分开。

```sh
createdb -h 127.0.0.1 edhr_ai_task_test_local
createdb -h 127.0.0.1 edhr_ai_migration_test_local
cd gmp-platform/backend
AI_TASK_DATABASE_URL=jdbc:postgresql://127.0.0.1:5432/edhr_ai_task_test_local \
AI_MIGRATION_DATABASE_URL=jdbc:postgresql://127.0.0.1:5432/edhr_ai_migration_test_local \
PGUSER="$USER" mvn -Dexec.skip=true -Dtest=AiTaskPostgresTest,AiTaskMigrationPostgresTest,SecurityConfigTest test
```

测试包含真实PostgreSQL及正式迁移、真实JWT和数据库权限、并发创建/领取/停止/预算、服务对象重建后的持久读回、实际HTTP服务器到数据库链路。服务对象重建与事务回滚不等同于操作系统SIGKILL恢复；完整Worker/DSH故障恢复留在后续切片，不用本轮证据外推。

回退策略：关闭AI开关并回退应用版本，保留新增表及运行事件，不删除任务历史。任务的历史用户ID不增加账号删除外键；普通账号按原流程删除后保留AI历史，后续访问与执行因缺少当前账号而拒绝，原系统保护账号规则不变。原有模板、生产执行与签名表在1A无变更。高可用、停止后供应商账单对账、生产选用边界、正式知识包和原生写入均不在本切片完成范围。
