# 全局表单实例查询 — 第一切片

基线：2026-09-16，既有 `form_instance_record` / 生产执行；本工作树实现不等于已发布。

## 决策与附件差异

`user-confirmed`：专门的 `form-instances.view` 加来源 `production.execution`，可查看默认租户内该来源全部已保存记录，不限本人或部门。新权限只初始化给 ADMIN，其他角色需明确分配。旧 `/form-instance-records` 的模板权限加生产权限保持原样；本接口不授予填写权限。

当前权限配置入口为“岗位角色 → 生产执行 → 表单实例查看”，作为既有来源菜单下的独立功能权限，不新增空页面。后续表单管理菜单落地时可调整展示归属，权限码保持稳定。

“来源”是表单实例创建时冻结的业务承载域，不是工序配置、作业发起或自定义附件等表单进入方式。当前唯一已接入值为 `PRODUCTION_EXECUTION`，客户展示为“生产执行”；`0086` 为已有记录回填该值，读取、筛选和授权边界都以该持久化值为准。

附件 `form-instance-integration-guide.md` v2 的第1—12章主要是目标接口，第13章才是既有实现。本文限定当前交付子集：只接入 `PRODUCTION_EXECUTION`；不实现独立填报、设备等其他来源注册、关系图、内容修订、变更/作废资格、导出或字段值条件。未知参数返回400，不能忽略后查询更大范围。

两个刻意保留的兼容边界：

- 原时间列是无时区 TIMESTAMP，保存端使用 LocalDateTime。当前输入和输出使用来源本地 ISO 日期时间，例如 `2026-09-16T09:00:00`，不接受 `Z` 或 offset，不编造历史时区。统一绝对时刻需要另行迁移与来源契约。
- 过滤条件严格 AND；不匹配的模板/版本、工单/生产对象、对象类型组合返回空集合，而非跨读主数据后400。来源ID仍必须搭配来源类型。此行为不会扩大结果。

## 接口

所有响应沿用 `ApiResponse`。缺认证401，缺任一查看权限403；ID或完整号未命中默认租户记录404；参数错误400。

| GET 路径 | 用途 |
| --- | --- |
| `/api/v1/form-instances` | 跨模板摘要分页，content/page/size/totalElements/totalPages |
| `/api/v1/form-instances/by-number/{instanceNo}` | 完整编号精确定位并返回详情，不使用模糊匹配 |
| `/api/v1/form-instances/{formInstanceId}` | 详情，额外返回 snapshot 和 fieldValues |
| `/api/v1/form-instances/{formInstanceId}/operation-context?intent=FILL` | source、原生产执行 revision、原实例 controls；不是写接口 |

`formInstanceId` 就是原表的 id，不生成另一身份。source.sourceId 是生产对象ID，须与 operationId（冻结路线节点键，不是工序主数据ID）、formId、copyId 一起定位实际份。写入继续使用原生产执行 actions，提交当时重新校验 revision 和权限；读取上下文不会预占或授权。CHANGE/OBSOLETE intent 明确400。

## 列表参数

| 参数 | 语义 |
| --- | --- |
| instanceNo / instanceNoContains | 精确 / 包含，互斥，去首尾空白，大小写不改变 |
| templateId / templateVersionId | 正整数ID等值，可同时过滤 |
| templateCode / templateName | 冻结编码等值 / 冻结名称包含 |
| sourceType / sourceId | 仅 PRODUCTION_EXECUTION；ID是生产对象，必须带类型 |
| workOrderId / productionObjectId | 正整数ID等值 |
| productionObjectType | BATCH / SN |
| workOrderNo / productionObjectNo | 冻结工单号 / 批次或SN号包含 |
| operationId | 冻结路线节点键等值，与生产对象组合使用 |
| createdById / updatedById | 已记录主体ID等值，历史未知ID不推测 |
| recordStatus | ACTIVE / COMPLETED，支持重复参数OR |
| createdFrom / createdTo | 创建本地时间左闭右开，支持单边 |
| updatedFrom / updatedTo | 更新本地时间左闭右开，独立于创建时间 |
| keyword | 仅实例号、冻结模板名/编码、工单号、生产对象号包含；不搜索表单值 |
| page / size | 0起；默认0/20，size 1—200，非法值400 |
| sort | createdAt/updatedAt/instanceNo/templateCode 加 asc/desc，例 updatedAt,desc；默认createdAt,desc；NULLS LAST，追加id DESC |

各参数AND，同参数仅 recordStatus 可重复。参数若传入则不能为空，每值最多512字符。不支持 `tenantId`、`all`、`purpose`、`eligibleOnly`、`activeRequestType`、通用关系或字段值搜索；不把 createdById/updatedById 当作“我的填报/我的已填”。LIKE 对 `%`、`_`、`!` 作字面转义，值通过绑定参数传入SQL。分页与计数在同一只读可重复读事务中完成。

## 摘要与历史数据

摘要包含 formInstanceId、instanceNo、templateId、templateVersionId、冻结 templateCode/templateName/templateVersion、recordStatus、创建/更新主体ID和原显示值、createdAt/updatedAt、legacy、source。列表不读取完整快照和字段值；详情再加载。状态直接沿用生产实例 ACTIVE/COMPLETED，不发明修订或活动申请状态。

0083 对原实例表增加可空搜索投影和索引，从实例冻结模板以及生产执行冻结上下文回填。未知元数据保留null；历史主体ID不从显示名反查猜测；后续保存保留原身份及创建字段，只更新当前更新主体ID。迁移不改原实例号、字段值、状态、生产快照和审计。生产保存的投影写入与原动作、原审计处于同一事务。

部署必须先执行0083、0086再启用新代码。回退应用可保留新增列、索引和权限，不回滚已保存的实例；生产数据未做删除式回滚。当前未向日常开发库或正式环境执行迁移。

## 后续顺序与明确不做

先完成表单管理工作入口，再实施DHR浏览/归集/汇总审批。此全局接口不以创建/更新人字段替代个人工作清单；生产来源的个人查询配套见 [表单管理个人查询配套](form-worklists-api.md)，页面另行实现。

MVP不做附录与记录本。已有生产自定义表单可新增补充填报，不能宣称具有“关联已有实例”或记录本完整功能。DHR默认必须审批、制程版本绑定明确审批流程版本是用户确认的后续方向，本切片不实现；目录骨架锁定只是暂定MVP策略，不提升为长期不可变规则。
