import {CommonFields, ExecuteParams } from '../parent'

interface TxnContainerHold extends CommonFields {
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
   * 搁置前状态
   *
   * @author zyl
   * @see {ContainerStatus}
   * @type {string}
   */
ahead_status_: string,


  /**
   * 搁置时长
   *
   * @author zyl
   * @type {number}
   */
duration_: number,


  /**
   * 搁置原因
   *
   * @author zyl
   * @see {ContainerHoldReason}
   * @type {string}
   */
hold_reason_id_: string,


  /**
   * 当前工步
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 释放时间
   *
   * @author zyl
   * @type {Date}
   */
release_time_: Date,


}


/**
 *模型名称：批次搁置
 *模型KEY:em_txn_container_hold
 */
interface TxnContainerHoldMethods extends IModelService<TxnContainerHold> {
  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


}
