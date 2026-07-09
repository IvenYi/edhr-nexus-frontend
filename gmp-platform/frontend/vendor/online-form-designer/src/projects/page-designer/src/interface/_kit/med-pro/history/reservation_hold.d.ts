import {CommonFields, ExecuteParams } from '../parent'

interface ReservationHold extends CommonFields {
  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 搁置工步
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 搁置原因
   *
   * @author zyl
   * @see {ContainerHoldReason}
   * @type {string}
   */
hold_reason_id_: string,


  /**
   * 批次执行搁置的事务
   *
   * @author zyl
   * @type {string}
   */
txn_hold_key_: string,


  /**
   * 搁置时间
   *
   * @author zyl
   * @type {Date}
   */
reserve_time_: Date,


  /**
   * 状态
   *
   * @author zyl
   * @see {ReservationHoldStatus}
   * @type {string}
   */
status_: string,


  /**
   * 描述
   *
   * @author zyl
   * @type {string}
   */
remark_: string,


  /**
   * 错误详情
   *
   * @author zyl
   * @type {string}
   */
error_details_: string,


  /**
   * 指定搁置时间
   *
   * @author zyl
   * @type {boolean}
   */
reserve_time_enabled: boolean,


}


/**
 *模型名称：预约搁置
 *模型KEY:em_reservation_hold
 */
interface ReservationHoldMethods extends IModelService<ReservationHold> {
  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 是否是开始节点
   *
   * @param1 workflow_step_id_ 工步id
   * @return boolean
   */
isStartStep(workflow_step_id_:string):boolean;


}
