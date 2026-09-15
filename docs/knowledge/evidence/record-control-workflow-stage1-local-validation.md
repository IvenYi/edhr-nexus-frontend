# 记录控制公共流程阶段一本地原始验证

knowledgeModelVersion: `0.3.18`

## 验证环境与数据保护

- 验证日期：2026-09-15。
- 数据库：本地 PostgreSQL `edhr_dev`。
- 重建前备份：`/tmp/edhr_dev-before-stage1-20260915-1352.dump`。
- 应用启动：`mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8082`。
- 启动结果：Liquibase 88/88 changesets 成功，应用启动成功。

## 数据库核对

实际查询使用本地受控凭据；证据不记录明文密码。等价脱敏命令：

```bash
PGPASSWORD=*** psql -h 127.0.0.1 -U edhr -d edhr_dev -Atc "select id from databasechangelog where id like '0076-%' order by id; select column_name from information_schema.columns where table_name='workflow_instance' and column_name in ('idempotency_key','audit_correlation_id','workflow_snapshot_hash') order by column_name; select code from permission where code like 'record-control%' order by code; select count(*) from role_permission rp join role r on r.id=rp.role_id join permission p on p.id=rp.permission_id where r.code='ADMIN' and p.code like 'record-control%'; select indexname from pg_indexes where schemaname='public' and tablename='workflow_instance' and indexname='uk_wf_instance_idempotency_key';"
```

结果：

- `databasechangelog` 包含 `0076-record-control-permission-contract` 和 `0076-record-control-workflow-instance-contract`。
- `workflow_instance` 包含 `audit_correlation_id`、`idempotency_key`、`workflow_snapshot_hash`。
- 存在唯一索引 `uk_wf_instance_idempotency_key`。
- 存在 6 个 `record-control%` 权限码，ADMIN 与这 6 项权限的关联计数为 6。

## API 冒烟核对

- 认证后调用 `GET /api/v1/workflow/record-control/candidates?businessType=CHANGE`。
- 返回 HTTP 200 和空候选列表，证明端点、认证和空数据投影可用。

## 证据边界

- 本证据只覆盖本地重建、Liquibase 实际应用、数据库结构与 ADMIN 权限数据、认证候选空列表。
- 尚未覆盖两个并发事务争用相同幂等键的数据库行为。
- 尚未覆盖非管理员组合账号的 CHANGE/OBSOLETE 允许与拒绝矩阵。
- 尚未覆盖存在已发布候选时的真实数据库 API 投影。
