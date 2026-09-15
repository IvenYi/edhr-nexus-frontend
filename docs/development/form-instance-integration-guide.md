# 表单实例对接与开发规范

文档版本：1.0　核对日期：2026 年 9 月 15 日　知识基线：0.3.18

适用对象：表单填报、表单变更与作废、公共流程、前端及测试开发伙伴。

本文以当前源码和本地部署结果为基线，统一表单实例的识别、查询、操作与跨模块关联方式。伙伴应先读第 1 至 3 节，再按职责阅读接口、变更和验收章节。所有示例 ID 和业务数据均为说明用途，联调时必须替换为目标环境实际返回值。

**核心结论：表单实例号是供人识别和检索一份填报记录的稳定编号。执行动作仍需服务端返回的内部定位信息、当前执行修订号及权限。当前实例查询接口并未返回完整执行定位信息，因此仅持有实例号还不能直接完成填报或正式变更。**

## 1 文档效力与接入范围

本文使用三种标记，避免将设计当成可调用能力。

| 标记 | 含义 | 开发使用方式 |
| --- | --- | --- |
| 已实现 | 已在当前源码中存在，部署验证见第 12 节 | 按实际接口与限制接入 |
| 已确认待实现 | 已有业务决策，但对应运行闭环尚未完成 | 作为实现约束，不能宣称接口可用 |
| 建议待冻结 | 为完成跨模块对接提出的契约建议 | 各方确认后再实施，不能当成现有 DTO |

当前已实现的是**生产执行中已保存表单的实例号和查询索引**。查询范围固定为 `default` 租户；不能据此推导其他填报来源已接入，也不能宣称全系统多租户隔离已经完成。本文不将生产执行表单、公共工作流实例或未来修订对象混为一体。

本文件归纳既有决策和实现，不修改业务规则。业务口径优先核对最新已确认决策、结构化知识及未决问题；实际可调用字段以当前接口实现为准。二者不一致时登记差异，不按旧占位代码补造产品承诺。

## 2 一页接入结论

1. 面向用户统一显示“表单实例号”，例如 `FR-20260915-000001`。不让用户输入或编辑编号。
2. 首次真实保存时由后端分配编号；同份保存、提交、审批及退回不换号。新增另一份表单在其首次保存时获得新号。
3. 实例号不是模板编号、业务批次号、执行副本 ID、工作流实例 ID 或修订 ID。不要互相代填。
4. 当前有实例列表、详情两个只读接口。没有“传实例号直接保存”的接口，也没有已闭环的正式变更申请接口。
5. 填报必须消费生产执行接口返回的 `availability`、副本标识和 `revision`，不得只根据实例列表中的状态判断可编辑性。
6. 已完成记录的正式变更按既有决策走独立申请及新修订，不能重新调用普通 `SAVE` 绕过控制。
7. 变更接入前必须冻结来源映射、修订标识、同号规则、子表行标识和结果回写契约，详见第 8、9 节。

## 3 标识与编号规则

### 3.1 必须区分的标识

| 标识 | 实际含义 | 使用位置 |
| --- | --- | --- |
| `instanceNo` | 一份已保存表单的可读编号 | 列表、搜索、复制、人工沟通 |
| 实例查询响应 `id` | `form_instance_record.id`，本文称记录索引 ID | 实例详情路径参数 |
| `templateId` | 表单模板 ID | 限定记录列表和详情所属模板 |
| `versionId` | 实际冻结使用的模板版本 ID | 解释历史表单结构，不是记录修订号 |
| `objectId` | 生产对象 ID，批次或 SN 对应对象 | 生产执行接口路径中的 `{id}` |
| `operationId` | 冻结执行上下文内的工序标识 | 执行动作请求体 |
| `formId` | 当前工序下的表单绑定标识 | 执行动作请求体，不是模板 ID |
| `instanceId` | 一份执行副本的标识，索引表称 `copy_id` | 执行动作请求体、执行状态的 forms 键 |
| 执行响应 `revision` | 整个生产执行记录的并发版本 | 每次动作校验；不等于表单内容修订 |
| `requestId`、`workflowInstanceId` | 记录控制申请、审核流程实例各自的标识 | 申请与公共流程契约，不与上列 ID 混用 |
| `sourceRevisionId` | 记录控制契约中的来源修订标识 | 当前编号索引不提供，修订域待实现 |

**同名字段注意：**实例详情的 `/form-instance-records/{id}` 使用记录索引 ID；生产执行的 `/production/execution/{id}` 使用生产对象 ID。两个 `{id}` 不能互换。公共流程结果的 `businessId` 在记录控制场景关联申请 ID，不能填实例号。

当前数据库通过 `(tenant_id, object_id, operation_id, copy_id)` 唯一定位索引来源。`formId` 和 `instanceId` 的实际值从执行返回中取得；即使当前副本常见格式为 `form-51:copy:2`，调用方也不能自行拼接或解析它来推导模板、工序和记录身份。

### 3.2 编号生成与稳定性

**已实现。**格式为 `FR-YYYYMMDD-序列号`，例如 `FR-20260915-000001`。日期来自编号分配时的服务端日期；序列至少 6 位，超过 6 位时不截断。当前序列不会每天或每个模板重新从 1 开始。

- 首次成功持久化填报内容时分配；直接执行允许的首次 `SUBMIT` 也可以产生编号，不要求先单独调用 `SAVE`。
- `START`、`ATTACH_FORM`、`ADD_FORM_COPY` 本身不分配已保存记录编号。未保存的副本可以有 `instanceId`，但还没有 `instanceNo`。
- 同一份的后续 `SAVE`、`SUBMIT`、`APPROVE`、`RETURN` 保持原编号。新建另一份记录使用新编号。
- 编号由数据库序列和唯一约束保护。事务回滚可能消耗序列，允许跳号；不得使用最大号加一，也不能通过补号追求连续。
- 子表明细归属于主表实例，不为每个子表行分配一个新的表单实例号。
- 模板升级不改变已有记录的编号和冻结模板。模板版本变化与记录内容修订是两件事。
- 编号不得通过页面、导入或直接更新数据库的方式修改、复用。持有编号本身不构成访问授权。

**正式变更后的编号建议待冻结：**建议同一逻辑记录的新修订沿用原实例号，以独立修订 ID 区分内容版本。现有 DEC-0050 明确了普通填报动作稳定和新份新号；正式变更的新修订同号策略尚未由当前运行实现证明，双方须将其单独确认后再落地。

## 4 数据来源与历史解释

### 4.1 当前存储职责

| 存储位置 | 当前职责 | 接入限制 |
| --- | --- | --- |
| `production_execution.snapshot_json` | 生产执行冻结上下文、工序及表单模板快照 | 历史展示不得改用最新设计模板 |
| `production_execution.state_json` | 各份表单的当前值、状态、保存时间及运行信息 | 通过执行服务维护，不由其他模块直接改 JSON |
| `production_execution.revision` | 整体执行并发控制版本 | 通过重新读取执行响应取得最新值 |
| `form_instance_record` | 已保存记录的编号、来源索引、冻结表单及当前值投影 | 是查询索引，不是完整修订历史库 |
| `audit_event` | 执行动作及历史补号的审计证据 | 运行状态、列表投影和审计不能相互替代 |

首次保存时，执行服务在现有事务内同时更新执行状态、记录索引并写审计；任一步失败不应产生可见的半成品记录。后续保存更新索引中的值、状态及更新信息，保留编号与首次索引保存的冻结表单内容。

实例详情返回的是**该份记录当前保存值，加实际使用的冻结模板**，并非“任意一次历史保存的值”。当前没有按修订 ID 查询任意历史内容的接口。正式修订域完成后，必须补充修订选择、快照、签名、哈希和当前有效版本的契约。

### 4.2 历史补号

**已实现。**0082 迁移从已保存的生产执行副本建立索引，跳过未保存副本及 `fulfilledBy` 别名；不改写原执行快照与状态 JSON。

历史记录 `legacy=true`；原创建人、创建时间未知时保留空值，不以补号操作人或补号时间冒充原始信息。`updated_at` 来自原 `savedAt`，编号日期来自补号日期，不一定是原填报日期。每份补号记录新增 `FORM_INSTANCE_RECORD / BASELINE` 审计。

补号由 Liquibase changeset 执行一次。不要手工重复执行历史 INSERT 来“刷新编号”。PostgreSQL JSON 存在性判断使用 `jsonb_exists`，避免 `?` 运算符被 JDBC 预编译误认为占位符。

## 5 实例查询接口

### 5.1 公共约定

接口基路径 `/api/v1`。本地开发前端为 `http://localhost:3000`，后端为 `http://localhost:8081`；伙伴使用配置化地址，不把 localhost 写入业务逻辑。认证沿用平台 Bearer token，文档不分发账号、密码或 token。

所有成功响应外层为 `ApiResponse`：`code=200`、`message`、`data`、`timestamp`、`traceId`。`timestamp` 是响应时间，不能作为记录创建时间或版本控制值。排障保留 `traceId`，不要记录认证 token 或签署密码。

实例查询需要同时具备 `master-data.form-templates` 和 `production.execution`。记录控制的发起权限不会自动赋予这两个读取权限。后续来源选择器如需新权限模型，必须明确设计，不通过放宽现有查询权限临时绕过。

### 5.2 查询记录列表

`GET /api/v1/form-instance-records`

| 参数 | 类型与默认值 | 当前语义 |
| --- | --- | --- |
| `templateId` | Long，必填 | 限定一个模板，当前不能只传编号跨模板搜索 |
| `instanceNo` | string，默认空 | 去首尾空白后的包含匹配；完整号输入仍为包含匹配 |
| `keyword` | string，默认空 | 对当前值 JSON 文本做包含匹配，可能匹配键名，不是独立全文搜索 |
| `occurredAt` | string，默认空 | `YYYY-MM-DD`，按更新时间当天筛选，不是创建时间 |
| `operator` | string，默认空 | 创建人或更新人文本的包含匹配，不是账号 ID 等值筛选 |
| `page` | int，默认 0 | 从 0 开始，负数归 0 |
| `size` | int，默认 20 | 服务端限定在 1 至 200 |

排序为 `numbered_at DESC, id DESC`，不是最后修改时间排序。接口返回主表实例数；子表视图展开明细后，也不能把主实例分页总数解释为子表行数。

请求示例：

```http
GET /api/v1/form-instance-records?templateId=5&instanceNo=FR-20260915-000001&page=0&size=20
Authorization: Bearer <平台登录取得的 token>
```

成功响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": [{
      "id": "1",
      "instanceNo": "FR-20260915-000001",
      "templateId": "5",
      "versionId": "5",
      "status": "ACTIVE",
      "fieldValues": {"temperature": 22},
      "createdBy": "操作员",
      "createdAt": "2026-09-15 10:00:00",
      "updatedBy": "操作员",
      "updatedAt": "2026-09-15 10:00:00",
      "legacy": false
    }],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  },
  "timestamp": "2026-09-15T02:00:00Z",
  "traceId": "示例响应追踪标识"
}
```

`id/templateId/versionId` 在实例响应中为字符串，客户端按字符串保存，避免大整数精度丢失。审计人员、日期可能为空；显示为空或“—”，不要自动填当前登录人或当前时间。当前记录日期是 JDBC 返回的时间文本，可能含小数秒且不带时区，不能假设与外层 `timestamp` 一样是 UTC ISO 格式。

### 5.3 查询记录详情

`GET /api/v1/form-instance-records/{id}?templateId=5`

`{id}` 为列表返回的记录索引 ID。详情同时校验记录所属模板；不存在或不属于该模板，当前返回 HTTP 400，不能假设是 404。

详情 `data` 包含列表中的全部字段，另加 `snapshot`，其为冻结表单对象：

| 字段 | 对接用途 |
| --- | --- |
| `snapshot.id` | 该表单的执行绑定标识，不是详情路径 ID |
| `snapshot.versionId`、`name`、`version` | 实际使用的模板版本标识、名称及显示版本 |
| `snapshot.model`、`snapshot.canvas` | JSON 字符串形式的设计载荷，需要解析，不是直接嵌套对象 |
| `snapshot.fields` | 冻结字段定义，按稳定 fieldId 解释 fieldValues |
| `fieldValues` | 当前保存值，结构由冻结字段类型决定 |

优先复用 `FormInstanceDetailDrawer` 和现有预览解析器。旧快照可能缺少 `typeConfig/status/sortOrder`，当前抽屉按既有填报页兼容方式补齐显示默认值；不要因此修改存储的历史模板。详情为只读预览，不能用当前正在设计的模板覆盖历史布局。

**当前缺口：**列表和详情都没有返回 `objectId`、`operationId`、`copyId`、执行 `revision` 或正式 `sourceRevisionId`。不能从 `snapshot.id` 推断全部信息；不能把详情响应 `id` 作为生产执行路径 ID。

## 6 填报端对接流程

### 6.1 获取真实上下文

**已实现。**生产执行查询和动作需要 `production.execution` 权限；表单节点还会进行当前操作者、动作及字段权限校验。

| 接口 | 含义 |
| --- | --- |
| `GET /production/execution/scan?barcode=...` | 按真实批次号或 SN 获取执行视图 |
| `GET /production/execution/{objectId}` | 获取冻结上下文、当前状态、revision 和可用动作 |
| `POST /production/execution/{objectId}/actions` | 在当前执行上下文中执行动作 |

以上路径均相对于 `/api/v1`。实例号 `FR-...` 不是该 `scan` 接口支持的生产条码。

调用步骤：

1. 从生产对象入口取得执行视图；无可用执行记录时按 `availability` 决定是否允许 `START`，不要把只读 GET 当成已开始。
2. 从 `snapshot.operations[]` 取得 `operationId/formId` 以及冻结字段。消费 `availability[operationId].formCopies[formId].instanceIds` 和对应 `instances` 控件信息取得真实副本；兼容旧单份来源时按已有客户端逻辑处理，不自行构造副本键。
3. 从 `state.operations[operationId].forms[instanceId]` 读取该份值，从顶层读取 `revision`。
4. 根据 `canAct`、`buttons` 和字段 `permissions` 渲染动作及编辑状态。服务器校验是最终依据，按钮显隐不能代替授权。
5. 成功后用完整的新响应更新本地 revision、values、status 和 availability，再进行下一次操作。

### 6.2 保存示例

```http
POST /api/v1/production/execution/101/actions
Authorization: Bearer <平台登录取得的 token>
Content-Type: application/json
```

```json
{
  "action": "SAVE",
  "revision": 3,
  "operationId": "a",
  "formId": "form-51",
  "instanceId": "form-51:copy:2",
  "values": {"temperature": 22}
}
```

请求中没有 `instanceNo` 字段，不由客户端提交编号。当前 `values` 必须是对象，包括审批或退回等不修改字段的操作也应传 `{}`。服务端按顶层字段合并：未传字段保留旧值，传入 `null` 才可能清空，但仍需满足字段权限和校验。

子表值为“子字段 ID 到值”的对象数组，提交一个子表字段时替换该字段的整个数组；当前不是按子表行 ID 打补丁。只读子字段的校验使用数组位置对照旧行，因此不能把数组位置当成正式修订的稳定行身份。

保存成功后，从 `data.state.operations[operationId].forms[instanceId].instanceNo` 读取服务器编号，顶层 `data.revision` 为下一次操作所需版本。当前前端 `ExecutionFormState` 类型尚未声明可选 `instanceNo`；伙伴编写类型时需要补充可选字段，不能把编号缺失默认为空串或伪造编号。历史补号不会回写原执行 JSON，旧记录需通过实例索引查询取得编号，后续保存才会同步入当前状态。

### 6.3 动作与状态

| 动作 | 当前行为 | 编号及对接注意事项 |
| --- | --- | --- |
| `START` | 开始允许执行的工序，首次时建立执行快照 | 不代表填报已保存，也不一定已有编号 |
| `SAVE` | 保存当前节点允许编辑的内容，不推进节点 | 同份保持编号；保存允许未填完整，不能据此判断提交一定成功 |
| `SUBMIT` | 校验并推进；无表单流程时成功后可直接完成 | 有流程时不保证立即完成，以返回值为准 |
| `APPROVE` | 按当前允许的审批节点动作推进 | 根据按钮要求提供意见或账号密码签署；保持编号 |
| `RETURN` | 重置当前表单流程入口，保留合并后的值 | 当前表单状态回到活动态；不等于正式变更申请退回 |
| `ADD_FORM_COPY` | 新增一份空白副本 | 读取新返回的 instanceIds；不等于复制旧数据或创建修订 |
| `END_FORM` | 结束一组表单的填报，受必填与完成情况约束 | 不是逐份提交，不用于把未完成份伪装成完成 |

生产执行中的单份状态主要是 `ACTIVE`、`COMPLETED`；工序、生产对象、表单组和公共工作流有各自状态。仓库中的 `FormInstanceStatusMachine` 还存在 `OPEN/SUBMITTED/IN_REVIEW` 等通用定义，不能直接当作本接口返回枚举。UI 如需更细的阶段名称，读取当前节点与服务端可用动作，不自行从一个 status 拼出审批状态。

### 6.4 并发与重试

执行 `revision` 是整个生产对象执行记录的版本；另一个工序或另一份表单操作也可能使其变化。冲突当前返回 HTTP 400，提示执行记录已被更新，不是约定的 409。

遇到冲突应保留用户未保存输入，重新读取执行状态，由用户核对差异后再提交。不能仅替换成最新 revision 后静默重放。遇到超时先重读确认动作是否已成功，尤其不能盲目重试 `ADD_FORM_COPY`、提交、审批或签署动作。生产动作接口当前未提供独立的客户端幂等键。

## 7 错误处理与安全边界

| 情况 | 当前结果或规则 | 调用方处理 |
| --- | --- | --- |
| 未认证 | HTTP 401 | 恢复正常登录，保留尚未提交输入 |
| 缺少功能权限 | HTTP 403 | 提示无操作权限，不用其他接口绕过 |
| 节点主体无权处理、动作不可用、只读字段被改 | 业务校验通常为 HTTP 400 | 展示 message 并刷新可用动作，不只依赖 403 判断授权失败 |
| 执行 revision 过期 | HTTP 400 | 重读并人工核对，不覆盖他人修改 |
| 多份表单未指定 instanceId | HTTP 400 | 要求选定具体份 |
| 详情不存在或模板不匹配 | HTTP 400 | 不展示缓存中的其他记录 |
| 时间筛选格式错误 | HTTP 400 | 使用 YYYY-MM-DD |
| 审计或其他持久化异常 | 可能 HTTP 500，事务回滚 | 保留 traceId，重读后再决定是否重试 |

只读字段、停用字段、附件归属和电子签名均由服务端校验。签署动作按当前按钮要求提交有效信息；不能伪造 `signatureId` 或把已有签名图片当成身份校验。审批密码不应出现在业务日志、埋点、文档或持久化草稿中。

## 8 表单变更和作废的对接边界

### 8.1 已确认的业务约束

以下来自 DEC-0037、DEC-0041、DEC-0042、DEC-0043，属于**已确认待实现或待闭环**，不能当成当前编号模块已经提供的动作。

- 已完成记录不能直接编辑。正式表单变更建立独立申请和新修订；批准后新修订成为唯一当前有效修订，旧修订只读保留。
- 作废是独立申请，不修改字段值；批准后使当前有效修订及来源记录作废，保留历史证据，不物理删除。
- 审核期间来源主状态保持不变，增加活动申请标记并防止冲突申请；退回或受限撤回不落地业务结果。
- 申请人显式选择自己可用、类型匹配、已发布的审核流程版本。完成申请信息、签名及确认后启动审核。
- 原表单填报流程与变更或作废审核流程分别管理。不能调用生产执行的 `RETURN` 来代替变更申请退回，也不能用 `ADD_FORM_COPY` 代替创建新修订。
- 字段差异以稳定 fieldId、字段路径、明细行 ID 和修订 ID 定位，不按字段名称匹配。

### 8.2 当前已存在的公共流程契约

候选接口：`GET /api/v1/workflow/record-control/candidates?businessType=CHANGE`；作废使用 `OBSOLETE`。对应发起权限分别为 `record-control.corrections.create` 和 `record-control.voids.create`。

公共流程通过 Java `RecordControlWorkflowPort.start(StartCommand)` 接受 `requestId`、`businessType`、`workflowDefinitionId`、`workflowVersionId`、`applicantId`、`applicantSignatureId`、`idempotencyKey`、`auditCorrelationId`。这是服务端内部端口，当前不是可由前端直接调用的启动 REST 接口；契约有签名字段，也不等于申请侧已完成真实签名验证和原子事务。

结果契约 `WorkflowResultEvent` 定义了 `eventId`、`workflowInstanceId`、`businessId`、`result` 等字段，其中 `businessId` 对应申请 ID。结果类型定义为 `APPROVED/RETURNED/WITHDRAWN`；类型声明不等于结果投递、幂等消费、修订切换已经运行闭环。

### 8.3 目前不能直接使用的能力

当前没有已闭环的实例号到变更来源解析、正式申请实体与保存接口、初始及变更修订持久化、来源修订资格查询、申请期间锁、审批结果切换修订、作废回写和按修订浏览历史的能力。不要臆造 POST 变更 URL，也不要直接 UPDATE `form_instance_record.values_json` 或生产执行 JSON 作为临时变更实现。

`sourceRecordId`、`sourceRevisionId` 虽已出现在 `BusinessDetailProjection` 共享契约中，但来源映射和修订对象尚未闭环。**不能未经确认就把实例查询响应的 `id` 填入 sourceRecordId，也不能把执行 revision 填入 sourceRevisionId。**

## 9 需要共同冻结的接入契约

本节为**建议待冻结**，供伙伴设计和接口评审使用；不是已上线接口或已确认的新业务规则。

### 9.1 统一来源解析

建议由表单实例所属后端提供统一的来源解析能力，负责将可读编号或记录索引 ID 映射到完整执行来源，统一执行权限及归属校验。调用方不应通过扫全库、跨模块 SQL 或解析编号自行建立映射。

建议评审的内部传递字段：

| 字段 | 目的 | 冻结前限制 |
| --- | --- | --- |
| `formRecordId`、`instanceNo` | 对应当前编号索引身份和展示号 | formRecordId 是建议清晰别名，现接口实际字段仍为 id |
| `sourceType` | 标明 PRODUCTION_EXECUTION 等来源 | 枚举和其他来源接入范围待确定 |
| `objectId/operationId/formId/instanceId` | 定位真实可操作的执行副本 | 必须由服务端解析，不由浏览器推算 |
| `templateId/templateVersionId` | 绑定实际冻结模板 | 当前详情使用 versionId，是否新增清晰别名须兼容评审 |
| `sourceRevisionId` | 冻结申请基于哪个内容修订 | 当前缺失；不得用 1、执行 revision 或时间戳代填 |
| `executionRevision` | 操作时的并发校验参考 | 不承担内容修订身份，执行前仍需重新校验 |
| 可用动作与禁用原因 | 填报、变更、作废入口判断 | 不能由调用方只看列表状态决定 |

还需确认：是否支持只持有实例号的跨模板精确查询；响应是否直接提供跳转信息；变更专用读取权限如何定义；查询空值、越权和不存在如何统一处理。不能把包含搜索的第一条结果直接当作唯一来源。

### 9.2 修订和结果落地

双方应在编码前冻结以下内容：

1. 当前生产执行索引与记录控制来源记录是否同一实体，或通过稳定映射关联；明确唯一映射和历史迁移方法。
2. 首次完成记录何时形成初始修订，既有已完成记录如何建立可靠来源修订；缺证据时怎样显示和阻断。
3. 正式变更新修订是否沿用实例号。建议沿用逻辑记录编号，另建修订身份，但需要形成明确决策。
4. 子表稳定行 ID 如何生成和迁移；当前数组行无统一持久化行身份，不能用下标支持正式差异追踪。
5. 批准、退回、撤回、作废等结果如何幂等消费，以及申请、修订、投影、来源状态和审计如何保持事务一致。
6. 变更后当前值查询与历史修订查询的区别，详情默认展示哪个版本，以及业务汇总或 DHR 投影的更新责任。

不得通过修改实例号表达作废、审批中或修订版本；这些含义需要各自状态和关联对象。也不得把“当前值索引”承诺为不可变的全部历史内容。

### 9.3 现有未决业务问题

当前 `open-questions.yaml` 已登记：活动中表单的作废边界、记录控制重新分配是否强制额外电子签名。它们分别阻塞相关资格矩阵和签名阻断逻辑，不阻塞普通实例查询和既有生产执行保存。未经产品确认，不把某一种处理建议写成硬规则。

## 10 团队职责与实施顺序

| 能力所有者 | 应负责 | 不应代做 |
| --- | --- | --- |
| 表单填报与实例域 | 编号、来源解析、冻结模板、执行值和并发控制、来源资格能力 | 自建一套变更审核流程 |
| 记录控制执行域 | 变更与作废申请、修订、差异、业务锁及批准后的业务落地 | 直接写另一模块 JSON、复制公共流程引擎 |
| 公共流程域 | 已发布候选、冻结流程版本、任务推进和稳定结果契约 | 决定来源修订如何切换或直接更新填报值 |
| 前端 | 消费 DTO、展示实例号、保护未保存内容、按返回权限展示动作 | 拼内部 ID、发号、用页面判断代替服务端校验 |
| 联合测试 | 身份映射、权限、并发、迁移、修订与审计验证 | 用占位接口或假号宣称完整对接通过 |

建议按三步推进：先接通现有实例查询和生产上下文填报；再冻结并补齐统一来源解析和初始修订；最后联调申请确认、公共流程结果和修订或作废落地。各模块可以先使用明确标注的契约 Mock 开发页面，但正式联调前必须切换真实服务，不以 Mock 成功作为完成标准。

## 11 联调与验收清单

### 11.1 当前已实现能力

- 首次保存获得编号；同份重复保存、提交、审批、退回不换号。
- 两份或并发首次保存获得不同编号；新增空白份在未保存时没有实例号。
- 索引 ID、生产对象 ID 和副本 ID 不混用；多份操作必须选具体份。
- 模板后续修改不影响详情中的冻结名称、版本、字段和布局。
- 编号搜索、模板限定、空结果、分页、复制和详情只读正常；同条件点击查询能刷新。
- 缺少认证、缺少任一实例查询权限、无节点操作资格均被正确拦截。
- 并发 revision 过期时保留未保存内容，不静默覆盖；超时不盲目新增另一份。
- 审计失败时执行状态和编号索引一起回滚；接受序列跳号。
- 历史补号保留原 JSON，跳过未保存份与别名，创建人时间未知时不伪造。
- 对迁移同时做 PostgreSQL 数据夹具和 JDBC 执行验证，不能只测 psql。

### 11.2 变更能力完成前必须补齐

- 仅凭编号入口能得到唯一、授权的来源，禁止模板外、租户外或其他副本串号。
- 申请锁定明确来源记录与修订；再次打开不会自动改绑最新修订。
- 审核中来源保持既有业务主状态；冲突申请被后端阻止。
- 批准结果重复或并发到达时只落地一次；新修订成为唯一有效版本，旧修订保持只读。
- 退回、撤回不误切换有效修订；作废不清空字段或删除历史。
- 子表增删改、重排与同名字段仍可按稳定身份显示准确差异。
- 流程运行日志、不可变审计、签署身份及业务数据的事务边界经联合验证。
- 使用非管理员组合权限账号验证候选、来源读取、申请发起、审核和详情权限。

这些是联调清单，不是已经完成的运行结果。

## 12 验证基线与维护方式

截至核对日期，本地 8081 新后端已部署，0082 三个 changeset 已执行且锁已释放；接口文档和公开配置、前端 3000 代理正常，未认证实例查询返回 401。部署前后原有 94 张表仅迁移登记表变化，原业务数据一致。

实例稳定性、新份新号、冻结详情、权限和审计回滚有隔离业务回归证据；历史补号有 PostgreSQL 与 JDBC 回滚夹具证据。当前真实 `production_execution` 和 `form_instance_record` 均为 0 条，因此尚无真实用户完成一份填报后再正式变更的上线全流程验收结论。其他环境仍须单独核对 JAR、迁移和权限。

本文对应 2026 年 9 月 15 日工作区实现及该次部署，不能只按 Git HEAD 判断能力：当前功能改动尚未提交。知识资产仍保持 `specified/internal`，不能由本文自动提升为发布级合规声明。对接前应在协作仓库共享同一组实现与迁移；分享此文档不等于伙伴已拿到代码。

维护时同步修改 Markdown 和 Word：已实现接口发生变化时更新字段、示例与兼容说明；建议被确认时记录决策来源，再调整状态；正式变更闭环后更新来源映射、修订接口、实际验收和未决项。本文不包含交付日期或未经确认的人员承诺。

### 源码与决策索引

以下均为仓库相对路径，伙伴在同一仓库版本内查阅；其中接口源码优先用于核对实际字段。

- 编号业务规则：`docs/knowledge/decisions/DEC-0050-form-instance-number.yaml` 与 `docs/knowledge/rules/form-instance-number.yaml`。
- 变更与作废规则：`docs/knowledge/decisions/DEC-0037-record-correction-and-void-control.yaml`；开始确认、公共流程阶段一及术语分别见 DEC-0041、DEC-0042、DEC-0043。
- 完整分工契约：`docs/development/record-control-work-allocation-and-integration-contract.md`；未决问题：`docs/knowledge/open-questions.yaml`。
- 实例查询：`gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/FormInstanceRecordController.java`。
- 编号与索引：同目录体系 `production/service/FormInstanceRecordService.java`。
- 执行入口及动作：`production/controller/ProductionExecutionController.java`、`production/service/ProductionExecutionService.java`、`ProductionExecutionEngine.java`、`ExecutionFormCopies.java`。
- 数据库：`gmp-platform/backend/src/main/resources/db/changelog/0082-form-instance-records.sql`。
- 公共流程契约：`gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/contract/RecordControlWorkflowContracts.java`、`RecordControlWorkflowPort.java`。
- 前端调用：`gmp-platform/frontend/src/api/form-instance-records.ts`、`production-execution.ts`；展示入口为设计器 `ModelTab.tsx` 和 `FormInstanceDetailDrawer.tsx`。
- 回归：`ProductionExecutionIntegrationTest`、`scripts/verify-form-instance-migration.sql`；共享响应对象为 `common/dto/ApiResponse.java` 和 `PageResult.java`。

文档变更记录：1.0，首次整理实例号、填报接入、正式变更边界、建议契约和联合验收清单。
