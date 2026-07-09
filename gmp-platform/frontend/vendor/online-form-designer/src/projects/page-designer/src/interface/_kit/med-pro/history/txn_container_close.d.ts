import {CommonFields, ExecuteParams } from '../parent'

interface TxnContainerClose extends CommonFields {
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
   * 关闭前状态
   *
   * @author zyl
   * @see {ContainerStatus}
   * @type {string}
   */
ahead_status_: string,


  /**
   * 批次关闭原因
   *
   * @author zyl
   * @see {ContainerCloseReason}
   * @type {string}
   */
f_close_reason_id_c0pl: string,


  /**
   * 耗时
   *
   * @author zyl
   * @type {number}
   */
duration_: number,


  /**
   * 打开时间
   *
   * @author zyl
   * @type {Date}
   */
open_time_: Date,


  /**
   * 工步
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


}


/**
 *模型名称：批次关闭
 *模型KEY:em_txn_container_close
 */
interface TxnContainerCloseMethods extends IModelService<TxnContainerClose> {
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


  /**
   * 执行
   *
   * @param1 valueMaps map集合
   * @return void
   */
executeBatch(valueMaps:object[]):void;


}
