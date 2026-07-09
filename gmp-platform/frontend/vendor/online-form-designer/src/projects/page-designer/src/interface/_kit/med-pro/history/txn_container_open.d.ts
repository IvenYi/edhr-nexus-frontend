import {CommonFields, ExecuteParams } from '../parent'

interface TxnContainerOpen extends CommonFields {
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
   * 批次打开原因
   *
   * @author zyl
   * @see {ContainerOpenReason}
   * @type {string}
   */
f_open_reason_id_c0pl: string,


}


/**
 *模型名称：批次打开
 *模型KEY:em_txn_container_open
 */
interface TxnContainerOpenMethods extends IModelService<TxnContainerOpen> {
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
