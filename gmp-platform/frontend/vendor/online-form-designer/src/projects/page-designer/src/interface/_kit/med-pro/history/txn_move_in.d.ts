import {CommonFields, ExecuteParams } from '../parent'

interface TxnMoveIn extends CommonFields {
  /**
   * 治具
   *
   * @author zyl
   * @see {Fixture}
   * @type {string}
   */
fixture_ids_: string,


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
   * 设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_ids_: string,


  /**
   * 工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


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


}


/**
 *模型名称：进站
 *模型KEY:em_txn_move_in
 */
interface TxnMoveInMethods extends IModelService<TxnMoveIn> {
  /**
   * 当前工步
   *
   * @param1 containerId 批次id
   * @return WorkflowStep[]
   */
currentWorkflowSteps(containerId:string):WorkflowStep[];


  /**
   * 获取进站设备
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return Device[]
   */
getDevices(containerId:string,workflowStepId:string):Device[];


  /**
   * 获取进站治具
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return Fixture[]
   */
getFixtures(containerId:string,workflowStepId:string):Fixture[];


  /**
   * 获取系统拆分的sn规则
   *
   * @param 
   * @return void
   */
getSystemSplitSnRule():void;


  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 保存进站统计数据
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
   * 进站时验证设备锁定和占用情况
   *
   * @param1 deviceId 设备id
   * @return void
   */
validateDeviceLockDisabled(deviceId:string):void;


  /**
   * 进站时验证设备保养状态
   *
   * @param1 deviceId 设备id
   * @return void
   */
validateDeviceMaintenanceStatus(deviceId:string):void;


  /**
   * 进站时验证治具生命周期
   *
   * @param1 fixtureIds 治具id
   * @return void
   */
validateFixtureLife(fixtureIds:string):void;


  /**
   * 进站时验证治具保养状态
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
   * 验证是否重复进站
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return void
   */
validateMoveInRepeatedly(containerId:string,workflowStepId:string):void;


  /**
   * 进站时验证生产指定
   *
   * @param1 containerId 批次id
   * @param2 userId 用户id
   * @param3 deviceIds 设备id
   * @param4 workflowStepId 工步id
   * @return void
   */
validateProductionSpecification(containerId:string,userId:string,deviceIds:string,workflowStepId:string):void;


  /**
   * 自动进出站
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return void
   */
autoMoveInAndMove(containerId:string,workflowStepId:string):void;


  /**
   * 标记进站状态
   *
   * @param1 containerId 批次id
   * @return null
   */
mark(containerId:string):null;


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
