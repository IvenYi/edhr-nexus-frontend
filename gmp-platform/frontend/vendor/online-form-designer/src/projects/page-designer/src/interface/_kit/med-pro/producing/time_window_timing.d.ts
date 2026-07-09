import {CommonFields } from '../parent'

interface TimeWindowTiming extends CommonFields {
  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 开始工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
start_spec_id_: string,


  /**
   * 实际开始工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
real_start_spec_id_: string,


  /**
   * 结束工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
end_spec_id_: string,


  /**
   * 实际结束工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
real_end_spec_id_: string,


  /**
   * 当前工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
current_spec_id_: string,


  /**
   * 当前工步
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
current_workflow_step_id_: string,


  /**
   * 起始工步
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
start_workflow_step_id_: string,


  /**
   * 结束工步
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
end_workflow_step_id_: string,


  /**
   * 开始时间窗事务
   *
   * @author zyl
   * @see {TimeWindowTxnType}
   * @type {string}
   */
start_txn_key_: string,


  /**
   * 结束时间窗事务
   *
   * @author zyl
   * @see {TimeWindowTxnType}
   * @type {string}
   */
end_txn_key_: string,


  /**
   * 过程时间
   *
   * @author zyl
   * @type {number}
   */
process_time_: number,


  /**
   * 计时开始时间
   *
   * @author zyl
   * @type {Date}
   */
start_time_: Date,


  /**
   * 计时结束时间
   *
   * @author zyl
   * @type {Date}
   */
end_time_: Date,


  /**
   * 结束场景
   *
   * @author zyl
   * @see {TimingEndScene}
   * @type {string}
   */
end_scene_: string,


  /**
   * 时间窗
   *
   * @author zyl
   * @see {TimeWindow}
   * @type {string}
   */
time_window_id_: string,


  /**
   * 时间窗实际结束事务
   *
   * @author zyl
   * @see {TimeWindowEndTxnType}
   * @type {string}
   */
real_end_txn_key_: string,


}


/**
 *模型名称：时间窗计时
 *模型KEY:em_time_window_timing
 */
interface TimeWindowTimingMethods extends IModelService<TimeWindowTiming> {
  /**
   * 结束时间窗计时
   *
   * @param1 containerId 批次id
   * @param2 workflowStepIdf 工步id
   * @param3 txnKey 事务key
   * @return void
   */
end(containerId:string,workflowStepIdf:string,txnKey:string):void;


  /**
   * 获取时间窗计时
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @param3 txnKey 事务key
   * @return void
   */
getNotEndTimings(containerId:string,workflowStepId:string,txnKey:string):void;


  /**
   * 获取签名需求信息
   *
   * @param1 timingId 时间窗id
   * @param2 secRelationId 复合签名id
   * @param3 relationId 完成电子签名标识
   * @return Object
   */
returnSignRequirementInfoIfRequired(timingId:string,secRelationId:string,relationId:string):Object;


  /**
   * 更新时间窗计时当前工艺
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return void
   */
updateCurrentSpec(containerId:string,workflowStepId:string):void;


}
