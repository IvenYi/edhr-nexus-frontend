import {CommonFields ,NdoFields} from '../parent'

interface Container extends   NdoFields,CommonFields {
  /**
   * 批次形态
   *
   * @author zyl
   * @see {ContainerModality}
   * @type {string}
   */
container_modality_id_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 原始数量
   *
   * @author zyl
   * @type {number}
   */
original_qty_: number,


  /**
   * 原始工作流
   *
   * @author zyl
   * @see {Workflow}
   * @type {string}
   */
original_workflow_id_: string,


  /**
   * 工作流
   *
   * @author zyl
   * @see {Workflow}
   * @type {string}
   */
workflow_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 父批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
parent_container_id_: string,


  /**
   * 来源批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
split_from_id_: string,


  /**
   * 原始批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
original_container_id_: string,


  /**
   * 批次状态
   *
   * @author zyl
   * @see {ContainerStatus}
   * @type {string}
   */
status_: string,


  /**
   * 工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 度量单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
uom_id_: string,


  /**
   * 生产指定项
   *
   * @author zyl
   * @see {ProductionSpecification}
   * @type {string}
   */
production_specification_entries_: string,


  /**
   * 事务状态
   *
   * @author zyl
   * @type {string}
   */
transaction_status_: string,


  /**
   * 工站
   *
   * @author zyl
   * @see {Operation}
   * @type {string}
   */
operation_id_: string,


  /**
   * 工厂
   *
   * @author zyl
   * @see {Factory}
   * @type {string}
   */
factory_id_: string,


  /**
   * 不良分类
   *
   * @author zyl
   * @see {NotGoodGroup}
   * @type {string}
   */
f_not_good_group_id_r6df: string,


  /**
   * 不良总数量
   *
   * @author zyl
   * @type {number}
   */
not_good_total_: number,


  /**
   * 报工数量
   *
   * @author zyl
   * @type {number}
   */
report_qty_: number,


  /**
   * edhr模版
   *
   * @author zyl
   * @type {string}
   */
edhr_template_id_: string,


  /**
   * edhr实例
   *
   * @author zyl
   * @type {string}
   */
edhr_inst_id_: string,


  /**
   * 待包装数量
   *
   * @author zyl
   * @type {number}
   */
to_pack_qty_: number,


  /**
   * 拓展属性
   *
   * @author zyl
   * @see {PackageExpansion}
   * @type {string}
   */
package_expansion_id_: string,


  /**
   * 可入库数量
   *
   * @author zyl
   * @type {number}
   */
available_inbound_qty_: number,


  /**
   * 生产日期
   *
   * @author zyl
   * @type {Date}
   */
f_test1_wd09: Date,


  /**
   * 失效日期
   *
   * @author zyl
   * @type {Date}
   */
expiration_date_: Date,


  /**
   * 生产日期
   *
   * @author zyl
   * @type {Date}
   */
production_date_: Date,


  /**
   * 采样批次
   *
   * @author zyl
   * @see {SamplingContainer}
   * @type {string}
   */
sampling_container_id_: string,


  /**
   * 不良批次
   *
   * @author zyl
   * @type {boolean}
   */
not_good_: boolean,


  /**
   * 是否有子级
   *
   * @author zyl
   * @type {boolean}
   */
has_children_: boolean,


  /**
   * 允许报工
   *
   * @author zyl
   * @type {boolean}
   */
report_enabled_: boolean,


  /**
   * 包装批次
   *
   * @author zyl
   * @type {boolean}
   */
package_: boolean,


  /**
   * 是否是SN
   *
   * @author zyl
   * @type {boolean}
   */
is_sn_: boolean,


  /**
   * 返工
   *
   * @author zyl
   * @type {boolean}
   */
in_rework_: boolean,


  /**
   * 数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


}


/**
 *模型名称：批次
 *模型KEY:em_container
 */
interface ContainerMethods extends IModelService<Container> {
  /**
   * 添加子批次
   *
   * @param1 containerId 批次id
   * @param2 children 子批次数据
   * @return void
   */
addChildren(containerId:string,children:Object[]):void;


  /**
   * 增加不良总数量
   *
   * @param1 containerId 批次id
   * @param2 qty 不良数量
   * @return void
   */
addNotGoodQty(containerId:string,qty:string):void;


  /**
   * 新增工步到事务状态
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return void
   */
addToTransactionStatus(containerId:string,workflowStepId:string):void;


  /**
   * 触发批量打印
   *
   * @param 
   * @return void
   */
batchTriggerPrint():void;


  /**
   * 清除执行数据
   *
   * @param1 containerId 批次id
   * @return void
   */
clearExecutions(containerId:string):void;


  /**
   * 清除未完成返工数据
   *
   * @param1 containerId 批次id
   * @return void
   */
clearUnfinishedReworkInfo(containerId:string):void;


  /**
   * 清除工艺版本
   *
   * @param1 containerId 批次id
   * @return void
   */
clearSpecVersion(containerId:string):void;


  /**
   * 清除事务状态
   *
   * @param1 containerId 批次id
   * @return void
   */
clearTransactionStatus(containerId:string):void;


  /**
   * 拷贝执行数据
   *
   * @param1 fromContainerId 被拷贝批次
   * @param2 toContainerId 拷贝批次
   * @return void
   */
copyExecutions(fromContainerId:string,toContainerId:string):void;


  /**
   * 拷贝执行数据
   *
   * @param1 fromContainerId 被拷贝批次
   * @param2 toContainerId 拷贝批次
   * @return void
   */
copyExecutionsBatch(fromContainerId:string,toContainerId:string[]):void;


  /**
   * 拷贝工艺版本
   *
   * @param1 fromContainerId 被拷贝批次
   * @param2 toContainerId 拷贝批次
   * @return void
   */
copySpecVersion(fromContainerId:string,toContainerId:string):void;


  /**
   * 拷贝工艺版本
   *
   * @param1 fromContainerId 被拷贝批次
   * @param2 toContainerId 拷贝批次
   * @return void
   */
copySpecVersionBatch(fromContainerId:string,toContainerId:string[]):void;


  /**
   * 拷贝事务状态
   *
   * @param1 fromContainerId 被拷贝批次
   * @param2 toContainerId 拷贝批次
   * @return void
   */
copyTransactionStatus(fromContainerId:string,toContainerId:string):void;


  /**
   * 拷贝事务状态
   *
   * @param1 fromContainerId 被拷贝批次
   * @param2 toContainerId 拷贝批次
   * @return void
   */
copyTransactionStatusBatch(fromContainerId:string,toContainerId:string[]):void;


  /**
   * 拷贝未完成返工数据
   *
   * @param1 fromContainerId 被拷贝批次
   * @param2 toContainerId 拷贝批次
   * @return void
   */
copyUnfinishedReworkInfo(fromContainerId:string,toContainerId:string):void;


  /**
   * 拷贝未完成返工数据
   *
   * @param1 fromContainerId 被拷贝批次
   * @param2 toContainerId 拷贝批次
   * @return void
   */
copyUnfinishedReworkInfoBatch(fromContainerId:string,toContainerId:string):void;


  /**
   * 确立工艺版本
   *
   * @param1 containerIds 批次id数组
   * @param2 workflowId 工步id
   * @return void
   */
establishSpecVersion(containerIds:string[],workflowId:string):void;


  /**
   * 过滤出可用名称
   *
   * @param1 codes 包装条码数组
   * @return string[]
   */
filterUsableNames(codes:string[]):string[];


  /**
   * 如果生产结束则完成批次
   *
   * @param1 containerId 批次id
   * @return boolean
   */
finishIfEnded(containerId:string):boolean;


  /**
   * 获取祖先批次Id
   *
   * @param1 containerId 批次id
   * @return string
   */
getAncestorId(containerId:string):string;


  /**
   * 根据名称获取批次
   *
   * @param1 name 批次名称
   * @return MaterialContainer
   */
getByName(name:string):MaterialContainer;


  /**
   * 返回关闭的批次
   *
   * @param1 containerIds 批次id数组
   * @return Container[]
   */
getClosed(containerIds:string[]):Container[];


  /**
   * 获取后代批次Id
   *
   * @param1 containerId 批次名称
   * @param2 leaf 是否是叶子节点
   * @return string
   */
getDescendantIds(containerId:string,leaf:boolean):string;


  /**
   * 获取批次父级
   *
   * @param1 containerId 批次id
   * @return Container
   */
getParent(containerId:string):Container;


  /**
   * 获取未完成的返工信息
   *
   * @param1 containerId 批次id
   * @return ReworkInfo
   */
getUnfinishedReworkInfo(containerId:string):ReworkInfo;


  /**
   * 继承父级清场信息以及进站设备和治具
   *
   * @param1 fromContainerId 被继承批次id
   * @param2 toContainerId 继承批次id
   * @return void
   */
inherit(fromContainerId:string,toContainerId:string):void;


  /**
   * 继承父级清场信息以及进站设备和治具
   *
   * @param1 fromContainerId 被继承批次id
   * @param2 toContainerId 继承批次id
   * @return void
   */
inheritBatch(fromContainerId:string,toContainerId:string[]):void;


  /**
   * 批次是否已关闭
   *
   * @param1 containerId 批次id
   * @return boolean
   */
isClosed(containerId:string):boolean;


  /**
   * 生产是否结束
   *
   * @param1 containerId 批次id
   * @return boolean
   */
isFinished(containerId:string):boolean;


  /**
   * 批次是否已搁置
   *
   * @param1 containerId 批次id
   * @return boolean
   */
isHold(containerId:string):boolean;


  /**
   * 创建表单默认参数
   *
   * @param1 releaseTaskId 放行任务id
   * @return Object
   */
makeFormDefaultParams(releaseTaskId:string):Object;


  /**
   * 标记是否可报工
   *
   * @param1 containerId 批次id
   * @return void
   */
markReportEnabled(containerId:string):void;


  /**
   * 增加报工数
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @param3 reportQty 报工数
   * @return void
   */
plusReportQty(containerId:string,workflowStepId:string,reportQty:number):void;


  /**
   * 自动生成批次名称
   *
   * @param1 snRuleId 流水号规则id
   * @param2 containerMap 批次数据
   * @return void
   */
putName(snRuleId:string,containerMap:Container):void;


  /**
   * 自动生成批次UDI
   *
   * @param 
   * @return void
   */
putUdi():void;


  /**
   * 扣减数量
   *
   * @param1 containerId 批次id
   * @param2 qty 扣减数量
   * @return void
   */
reduceQty(containerId:string,qty:number):void;


  /**
   * 扣减数量
   *
   * @param1 containerIds 批次id
   * @param2 qtyMap 扣减数量
   * @return void
   */
reduceQtyBatch(containerIds:string[],qtyMap:object):void;


  /**
   * 移除子批次
   *
   * @param1 children 子批次数据
   * @return void
   */
removeChildren(children:Object[]):void;


  /**
   * 从事务状态删除工步
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return void
   */
removeFromTransactionStatus(containerId:string,workflowStepId:string):void;


  /**
   * 根据指定参数触发打印
   *
   * @param1 txnKey 事务key
   * @param2 containerId 批次id
   * @param3 field 指定参数
   * @return void
   */
triggerByField(txnKey:string,containerId:string,field:string):void;


  /**
   * 触发打印
   *
   * @param1 txnKey 事务key
   * @param2 containerId 批次id
   * @return void
   */
triggerPrint(txnKey:string,containerId:string):void;


  /**
   * 触发生产UDI
   *
   * @param 
   * @return void
   */
triggerProductionUdi():void;


  /**
   * 更新生产批次可入库数量
   *
   * @param1 containerId 批次id
   * @return void
   */
updateAvailableInboundQty(containerId:string):void;


  /**
   * 更新批次状态为运行
   *
   * @param1 containerId 批次id
   * @return void
   */
updateToRunning(containerId:string):void;


  /**
   * 更新当前工步
   *
   * @param1 containerId 批次id
   * @return void
   */
updateWorkflowStep(containerId:string):void;


  /**
   * 返回搁置的批次
   *
   * @param1 containerIds 批次id数组
   * @return Container[]
   */
getHold(containerIds:string[]):Container[];


  /**
   * 获取生产指定设备
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @param3 queryMap 查询条件
   * @return Device[]
   */
getPageProductionSpecificationDevices(containerId:string,workflowStepId:string,queryMap:Object):Device[];


  /**
   * 获取生产指定设备
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return Device[]
   */
getProductionSpecificationDevices(containerId:string,workflowStepId:string):Device[];


  /**
   * 获取未执行的工步
   *
   * @param1 containerId 批次id
   * @return WorkflowStep[]
   */
getUnExecuteWorkflowSteps(containerId:string):WorkflowStep[];


  /**
   * 可进出站的工步
   *
   * @param1 containerId 批次id
   * @return WorkflowStep
   */
operationalWorkflowStepsOfContainer(containerId:string):WorkflowStep;


  /**
   * 校验工步是否可执行
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工艺步骤id
   * @return void
   */
validateWorkflowStepExecutable(containerId:string,workflowStepId:string):void;


}
