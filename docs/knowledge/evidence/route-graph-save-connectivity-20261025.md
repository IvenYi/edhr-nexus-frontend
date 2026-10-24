# 路线快捷添加与图保存连通边界

知识基线 `0.3.25`，契约和原始源码基线 `edhr-dev@96ea56338ef1438938a546382368eb1d7d400938`。主智能体本轮 fetch 后目标提交未变；角色读取契约无未提交差异。沿用 `DEC-PACKAGE-20261024-FLOW-CANVAS-UNIFICATION`，新增政策为 `DEC-0083`，不改写旧决策或提高原知识阶段与成熟度。

## 用户确认

`user-confirmed`：2026-10-25用户指出“怎么没有那个快速添加的箭头功能？这个快速添加的应该是各个工序，快速添加的面板可能需要布局设计一下。另外这里为啥可以不连开始按钮和结束按钮？没有这样的校验吗？”。主智能体就阻断时点询问后，用户明确选择“保存时强制校验（推荐）”。该确认允许编辑中临时断开，在路线图保存时强制校验正常生产路径完整；新增保存阻断是本轮确认，不从此前功能统一授权推导。

此前用户要求保持MVP、保留现有业务规则、版本和执行机制，明确不统一存储、版本与执行引擎，该边界继续适用。快捷箭头是添加既有工序节点的编辑入口，不构成新的工序、返工、并行或执行语义。

## 原始实现证据

`original-evidence`，核对基线源码：

- `ProcessModelingController.saveRouteGraph` 原先先删除既有关系和节点，再由 `toRouteNode` / `toRouteRelation` 校验非空节点键、非空端点文本和关系类型；允许空集合，未校验端点是否存在、节点键重复、START/END数量与连通。
- `createRouteVersion` 只创建版本元数据；创建与保存图为不同调用，不能把图完整性前移成元数据创建的先决条件。
- `ProductProcessOwnerService.validateReferences` 原先只要求路线版本存在且在生效时间窗内，`saveOperationBindings` 只允许绑定该路线OPERATION。此次不把引用资格改成新的连通校验入口。
- `ProductionExecutionEngine.startIssues` / `validateRoute` / `collectPredecessors` 检查循环及前置完工，返工单独阻断并在前置收集中跳过；这些检查不证明START覆盖全部生产工序或能够到END。`ExecutionSnapshotBuilder` 复制路线节点和关系并列出OPERATION/REWORK，不因UI完善而重写旧冻结。
- `routeGraph.ts` 按同源多个正常生产目标识别并行并保留返工节点及关系；通用作业流程的单出口与草稿发布分层不适用于本路线保存规则。

`secondary-reference`：DEC-0001-04/05、`rule.product-process.bind-route-and-dhr-versions` 和 `rule.product-process.operation-from-bound-route` 为版本引用及工序归属索引，没有路线完整性政策。DEC-0009及架构中作业模板草稿边界属于WORK配置，不能作为路线保存豁免来源。相关定义继续保留。

## 工程落实及未扩展范围

`inference` / 主智能体确定的工程实现边界：

- 正常生产骨架排除REWORK节点及所有相关边。START须可达END，START须可达每个OPERATION，每个OPERATION须可达END。返工不能作为正常生产路径缺口的替代通路。
- 为使路径判断确定，入口要求节点键唯一、恰一个START和END、所有关系端点存在，且START无入边、END无出边。这是当前请求结构校验，不增加普通节点单出口或保存时生产环路禁止规则；只要上述可达性满足，不能额外凭通用流程校验拒绝并行或生产环路。
- 不增加至少一个生产工序的要求。START直接连END的空骨架可保存，仅有两个未连边界的图不能保存。版本元数据仍可在配图前创建；此处无图元数据不等于一个已通过保存的空图。
- 前端在元数据变更请求前检查图并显示错误节点，避免图不合格时先更新版本信息；服务端在删除或写入图前校验，直接接口调用同样不能绕过。既有权限、审计事务和错误返回机制继续归原入口。
- 不新增返工连通或返工运行契约，不新增图发布生命周期，不迁移或自动连接旧图，不回写历史生产快照，不改变产品引用资格或生产执行循环与前置校验。

## 当前记录与验收责任

新增决策、规则与派生校验事实暂为 `specified/internal`；此记录证明政策与建模边界，不能证明前端、后端或真实数据库已验收。主智能体负责正反例、保存零写及快照边界测试，质量角色独立核对实际工作树候选。知识正式校验由本体角色实际运行后写入 `ontologyResult`，运行与质量证据由同一功能切片的交付记录分别承接；不复用前一轮仅视觉统一的结果证明本轮新增阻断通过。

同切片收尾时已核对 `RouteGraphValidator.validate`、`ProcessModelingController.saveRouteGraph` 和前端 `getRouteConnectivityErrors` 源码：后端校验发生在删除和写入之前，REWORK按端点类型排除，START/END方向检查包含全部边，不额外按关系类型排除或增加DAG保存门禁。前端同步路径错误并在保存入口消费；实际交互结果由主侧浏览器验收负责。

本体角色实际运行 `mvn --batch-mode --no-transfer-progress --file tools/knowledge-model/pom.xml clean test`，新增校验器文件落盘后89项全部通过，日志位于 `/tmp/edhr-route-ontology-validation-20261025.log`，正式报告位于 `tools/knowledge-model/target/surefire-reports`。首次运行因本切片待创建的校验器路径尚不存在而失败，待文件落盘重跑后通过，未绕过证据路径检查。

`original-evidence`：另读取主智能体本轮后端实跑原件 `gmp-platform/backend/target/surefire-reports/com.zencas.edhr.masterdata.service.RouteGraphValidatorTest.txt`（5项零失败）和 `com.zencas.edhr.masterdata.controller.ProcessModelingControllerTest.txt`（53项零失败）。本体角色核对对应测试源码及这些报告，没有自行执行后端测试，也未执行数据库或浏览器测试；53项是整个控制器类的检查数，不是53个新增连通场景。测试路径以独立evidence条目登记，主侧后续代码或测试变化须重新评估，不将该时点记录当成所有未来候选或独立质量的通过结论。
