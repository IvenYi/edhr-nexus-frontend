import {CommonFields, ExecuteParams } from '../parent'

interface TxnDeviceChange extends CommonFields {
  /**
   * 备注
   *
   * @author zyl
   * @type {string}
   */
remark_: string,


  /**
   * 事务主体ID
   *
   * @author zyl
   * @type {string}
   */
txn_subject_id_: string,


  /**
   * 工艺步骤iD
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 当前设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
current_device_id_: string,


  /**
   * 变更设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
change_device_id_: string,


  /**
   * 事务总线ID
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
mainline_id_: string,


}


/**
 *模型名称：设备变更
 *模型KEY:em_txn_device_change
 */
interface TxnDeviceChangeMethods extends IModelService<TxnDeviceChange> {
  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 变更设备
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @param3 currentDeviceId 当前设备iD
   * @param4 changeDeviceId 变更设备id
   * @return void
   */
changeDevice(containerId:string,workflowStepId:string,currentDeviceId:string,changeDeviceId:string):void;


  /**
   * 设备变更时验证设备锁定和占用情况
   *
   * @param1 deviceId 设备id
   * @return void
   */
validateDeviceLockDisabled(deviceId:string):void;


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
