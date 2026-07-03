import {CommonFields, ExecuteParams } from '../parent'

interface TxnContainerRelease extends CommonFields {
  /**
   * 事务总线
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
mainline_id_: string,


  /**
   * 事务主体
   *
   * @author zyl
   * @type {string}
   */
txn_subject_id_: string,


  /**
   * 搁置时长
   *
   * @author zyl
   * @type {number}
   */
duration_: number,


  /**
   * 释放原因
   *
   * @author zyl
   * @see {ContainerReleaseReason}
   * @type {string}
   */
f_release_reason_id_r6df: string,


}


/**
 *模型名称：批次释放
 *模型KEY:em_txn_container_release
 */
interface TxnContainerReleaseMethods extends IModelService<TxnContainerRelease> {
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
