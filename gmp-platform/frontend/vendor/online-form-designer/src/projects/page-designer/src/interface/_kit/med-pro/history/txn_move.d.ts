import {CommonFields, ExecuteParams } from '../parent'

interface TxnMove extends CommonFields {
  /**
   * 治具
   *
   * @author zyl
   * @see {Fixture}
   * @type {string}
   */
fixture_ids_: string,


  /**
   * 批次数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 系统拆分sn
   *
   * @author zyl
   * @see {SnSplitEntry}
   * @type {string}
   */
sn_entries_: string,


  /**
   * 事务总线ID
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
mainline_id_: string,


  /**
   * 事务主体ID
   *
   * @author zyl
   * @type {string}
   */
txn_subject_id_: string,


  /**
   * 工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
next_workflow_step_id_: string,


  /**
   * 工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


}


/**
 *模型名称：出站
 *模型KEY:em_txn_move
 */
interface TxnMoveMethods extends IModelService<TxnMove> {
  /**
   * 归咎设备
   *
   * @param1 containerId 批次id
   * @return Operation[]
   */
getBlamedDevices(containerId:string):Operation[];


  /**
   * 归咎工站
   *
   * @param1 containerId 批次id
   * @param2 process 是否过程中处置不良
   * @return Operation[]
   */
getBlamedOperations(containerId:string,process:boolean):Operation[];


  /**
   * 出站扣减物料
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @param3 deviceIds 设备数组
   * @param4 mainlineId 事务总线id
   * @return void
   */
consumeDeviceMaterial(containerId:string,workflowStepId:string,deviceIds:string[],mainlineId:string):void;


  /**
   * 当前工步
   *
   * @param1 containerId 批次id
   * @return WorkflowStep[]
   */
currentWorkflowSteps(containerId:string):WorkflowStep[];


  /**
   * 如果生产结束则完成批次
   *
   * @param1 containerId 批次id
   * @return boolean
   */
finishIfEnded(containerId:string):boolean;


  /**
   * 获取系统拆分的sn规则
   *
   * @param 
   * @return void
   */
getSystemSplitSnRule():void;


  /**
   * 生产是否结束
   *
   * @param1 containerId 批次id
   * @return boolean
   */
isFinished(containerId:string):boolean;


  /**
   * 同步报工数量
   *
   * @param1 containerId 批次id
   * @return void
   */
synchronizeReportQty(containerId:string):void;


  /**
   * 更新当前工步
   *
   * @param1 containerId 批次id
   * @return void
   */
updateWorkflowStep(containerId:string):void;


  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 保存出站统计数据
   *
   * @param1 map 进站统计数据
   * @return void
   */
saveBasicStatistics(map:Object):void;


  /**
   * 生成过站记录
   *
   * @param 
   * @return void
   */
saveProcessTime():void;


  /**
   * 验证是否都有离岗记录
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return boolean
   */
validateAllAreOffDuty(containerId:string,workflowStepId:string):boolean;


  /**
   * 验证检验是否合格
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return void
   */
validateCheckTask(containerId:string,workflowStepId:string):void;


  /**
   * 验证是否已清场
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return void
   */
validateCleaning(containerId:string,workflowStepId:string):void;


  /**
   * 出站时验证设备锁定和占用情况
   *
   * @param1 deviceId 设备id
   * @return void
   */
validateDeviceLockDisabled(deviceId:string):void;


  /**
   * 出站时验证设备保养状态
   *
   * @param1 deviceId 设备id
   * @return void
   */
validateDeviceMaintenanceStatus(deviceId:string):void;


  /**
   * 出站时验证治具生命周期
   *
   * @param1 fixtureIds 治具id
   * @return void
   */
validateFixtureLife(fixtureIds:string):void;


  /**
   * 出站时验证治具保养状态
   *
   * @param1 fixtureIds 治具id
   * @return void
   */
validateFixtureMaintenanceStatus(fixtureIds:string):void;


  /**
   * 验证是否手动拆分完成
   *
   * @param 
   * @return void
   */
validateManualSplitFinished():void;


  /**
   * 验证配方投料
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return void
   */
validateMaterialFeeding(containerId:string,workflowStepId:string):void;


  /**
   * 验证物料分发
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return void
   */
validateMaterialIssue(containerId:string,workflowStepId:string):void;


  /**
   * 验证是否重复出站
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return void
   */
validateMoveRepeatedly(containerId:string,workflowStepId:string):void;


  /**
   * 出站时验证生产指定
   *
   * @param1 containerId 批次id
   * @param2 userId 用户id
   * @param3 deviceIds 设备id
   * @param4 workflowStepId 工步id
   * @return void
   */
validateProductionSpecification(containerId:string,userId:string,deviceIds:string,workflowStepId:string):void;


  /**
   * 出站验证报工
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return void
   */
validateReport(containerId:string,workflowStepId:string):void;


  /**
   * 采样任务是否完成
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return boolean
   */
validateSamplingTaskFinished(containerId:string,workflowStepId:string):boolean;


  /**
   * 自动进出站
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return void
   */
autoMoveInAndMove(containerId:string,workflowStepId:string):void;


  /**
   * 获取下一站
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return WorkflowStep
   */
getNext(containerId:string,workflowStepId:string):WorkflowStep;


  /**
   * 是否可选择路径
   *
   * @param1 workflowStepId 工步id
   * @return boolean
   */
isPickable(workflowStepId:string):boolean;


  /**
   * 加载下一个执行分支
   *
   * @param1 containerId 批次id
   * @param2 workflowId 工作流id
   * @param3 workflowStepId 工步id
   * @return null
   */
loadNextBranch(containerId:string,workflowId:string,workflowStepId:string):null;


  /**
   * 标记出站状态
   *
   * @param1 containerId 批次id
   * @return null
   */
mark(containerId:string):null;


  /**
   * 尝试加载后续执行分支
   *
   * @param1 containerId 批次id
   * @param2 executionId 已完成的执行ID
   * @return null
   */
tryLoadSubsequentBranch(containerId:string,executionId:string):null;


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
