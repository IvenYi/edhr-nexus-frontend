import {CommonFields, ExecuteParams } from '../parent'

interface TxnMfgOrderChange extends CommonFields {
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
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 当前状态
   *
   * @author zyl
   * @see {MfgOrderStatus}
   * @type {string}
   */
current_status_: string,


  /**
   * 切换状态
   *
   * @author zyl
   * @see {MfgOrderStatus}
   * @type {string}
   */
change_status_: string,


  /**
   * 切换原因
   *
   * @author zyl
   * @see {MfgOrderChangeReason}
   * @type {string}
   */
f_change_reason_id_c0pl: string,


  /**
   * 当前状态变更原因
   *
   * @author zyl
   * @see {MfgOrderChangeReason}
   * @type {string}
   */
f_current_change_reason_id_c0pl: string,


}


/**
 *模型名称：工单状态切换
 *模型KEY:em_txn_mfg_order_change
 */
interface TxnMfgOrderChangeMethods extends IModelService<TxnMfgOrderChange> {
  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 工单状态切换
   *
   * @param1 valueMap 工单状态切换数据
   * @return void
   */
changeStatus(valueMap:TxnMfgOrderChange):void;


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
