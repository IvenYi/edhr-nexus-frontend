import {CommonFields ,NdoFields} from '../parent'

interface ProcessTime extends   NdoFields,CommonFields {
  /**
   * 出站事务总线ID
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
move_mainline_id_: string,


  /**
   * 进站事务总线ID
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
move_in_mainline_id_: string,


  /**
   * 工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


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
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 生产开始时间
   *
   * @author zyl
   * @type {Date}
   */
production_start_time_: Date,


  /**
   * 耗时
   *
   * @author zyl
   * @type {number}
   */
duration_: number,


  /**
   * 生产结束时间
   *
   * @author zyl
   * @type {Date}
   */
production_end_time_: Date,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


}


/**
 *模型名称：工站时间
 *模型KEY:em_process_time
 */
interface ProcessTimeMethods extends IModelService<ProcessTime> {
  /**
   * 如果工步已进站结束过站记录
   *
   * @param1 containerId 批次id
   * @param2 workFlowStepId 工步id
   * @return void
   */
endIfMovedIn(containerId:string,workFlowStepId:string):void;


}
