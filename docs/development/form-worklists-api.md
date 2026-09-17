# 表单管理个人查询配套

本切片仅实现生产来源的查询与原动作配套，不实现新页面、独立表单新建、转发、变更/作废或DHR。旧 `/form-instances` 全实例接口和权限不变。

## 已确认的查询口径

- FILLABLE（我的填报）：已到达且当前本人能处理的填写节点，包括尚未保存、已保存未提交、退回后再次到达的份。不包含审批节点，也不绕过源工单/对象/工序状态阻断。
- CREATED（我的创建）：本人主动新增的自定义表单首份、主动新增份。系统自动产生的首份不以首次保存人冒充创建人。
  - 返回 `creationType=CUSTOM_FORM|ADDED_COPY`，分别表示生产执行中主动挂载的自定义表单首份和主动新增的表单份。
- FILLED（我的已填）：本人曾在填写节点成功SUBMIT的份；SAVE不算，退回不抹去历史。每份一行，详情保留本人提交事件。
- REVIEW_PENDING（我的审批待办）：当前到达APPROVAL且源权限允许本人处理的份。
- REVIEW_DONE（我的审批已办）：本人在APPROVAL成功APPROVE或RETURN的份；每份一行，详情保留本人处理事件。再次到达可以同时出现在待办和已办。

页面不是互斥状态。草稿是“已保存未提交”的显示含义，不新增底层状态。CREATED/FILLED/REVIEW_DONE详情只读；继续填写/审批应重新取得相应待办详情，动作仍走原 production/execution/{id}/actions，提交时校验revision、资格及签名。

## 权限

所有入口要求来源 `production.execution`。前三个视图另要求 `form-management.filling`，后两个要求 `form-management.review`，不要求 `form-instances.view`，也不授予全局列表权限。当前用户取认证上下文，不接受用户ID参数冒充他人。两个新权限由0084注册在岗位角色的生产执行功能权限下，只初始化给ADMIN。

## GET 接口

- `/api/v1/form-worklists/{view}`：content/page/size/totalElements/totalPages/historyCoverage；空页同样返回历史覆盖标记。
- `/api/v1/form-worklists/{view}/detail?productionObjectId=...&operationId=...&formId=...&copyId=...`：严格按同一视图资格返回详情，越权或不在该视图返回404。包含未首次保存份，所以使用源四元组，不虚构实例ID和编号；首次保存后仍使用原实例身份。

视图取上面五个大写枚举。缺认证401，缺来源或视图权限403，错误参数400。列表不返回表单内容；详情增加snapshot、fieldValues、myEvents和controls。row含生产对象/工单/工序/绑定/份身份、冻结模板显示字段、recordStatus、saved、明确创建身份、节点、到达时间、本人处理动作/时间和当前源revision。

## 查询条件

各条件AND；recordStatus允许重复OR。未支持参数、空值、重复单值参数均400。

- 精确：instanceNo、templateId、templateVersionId、templateCode、productionObjectId、productionObjectType(BATCH/SN)、workOrderId、operationId、formId、copyId、nodeId、creatorId、saved(true/false)。creatorId为主动创建身份，不是首次保存人。
- 包含：instanceNoContains（与instanceNo互斥）、templateName、productionObjectNo、workOrderNo、nodeName。
- keyword仅搜索实例号、冻结模板名称/编码、生产对象号、工单号，不搜索内容。
- recordStatus仅ACTIVE/COMPLETED。
- createdFrom/To针对主动创建时间；updatedFrom/To针对生产执行整体更新时间。来源本地ISO时间，左闭右开；未知时间不匹配时间范围。
- submittedFrom/To仅FILLED，reviewedFrom/To与reviewResult(APPROVE/RETURN)仅REVIEW_DONE，arrivedFrom/To仅当前待填/待审。历史节点ID/名称、时间与结果必须匹配同一条本人事件，返回最后一条同时匹配事件；同份只计一次。
- page从0起，size默认20、范围1—200。当前固定排序为生产对象ID倒序、冻结工序/表单顺序、份序；不宣称按处理时间排序，暂不接受sort参数。

## 实现与历史边界

直接投影既有生产执行状态和历史，复用源view与节点权限，不创建第二个任务或流程日志表。在原历史事件上添加稳定actionCode、formId、copyId、nodeId、nodeKind与nodeName；主动新建时保存explicitCreatorId/explicitCreatedAt，节点到达保存nodeArrivedAt。均在原生产动作事务、审计快照内完成；失败动作不会进入历史。

历史自由文本没有稳定的份/节点身份，不能用名称或最后更新人猜测参与记录。本版历史参与查询仅消费结构化事件；旧源待办仍按当前状态/权限可查，但缺少的历史事件、主动创建身份、到达时间保留未知，不重写旧审计。`historyCoverage=STRUCTURED_EVENTS_ONLY`表示该覆盖边界。

动态组织资格在服务端使用源逻辑判定后计数和分页，不下载全量给浏览器。源按32个对象分批扫描，结果仅保留当前页；该实现优先保证与实时组织权限一致。大数据量时需要在相同资格契约下增加可失效的候选索引，当前不提供生产规模性能承诺。

## 开发顺序

本配套验收后可开发表单列表/详情、三个个人填报页签和两个审批页签。独立新建表单、转发等动作不能因查询配套完成就宣称已支持，需在对应页面切片核对来源契约。
