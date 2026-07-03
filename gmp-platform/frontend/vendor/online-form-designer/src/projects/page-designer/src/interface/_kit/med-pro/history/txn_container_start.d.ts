import {CommonFields, ExecuteParams } from '../parent'

interface TxnContainerStart extends CommonFields {
  /**
   * 事务总线
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
   * 批次数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


}


/**
 *模型名称：批次创建
 *模型KEY:em_txn_container_start
 */
interface TxnContainerStartMethods extends IModelService<TxnContainerStart> {
  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
