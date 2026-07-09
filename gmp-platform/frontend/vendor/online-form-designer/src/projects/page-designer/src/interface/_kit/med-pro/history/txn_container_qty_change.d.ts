import {CommonFields, ExecuteParams } from '../parent'

interface TxnContainerQtyChange extends CommonFields {
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
   * 归咎工站
   *
   * @author zyl
   * @see {Operation}
   * @type {string}
   */
blamed_operation_id_: string,


  /**
   * 归咎设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
blamed_device_id_: string,


  /**
   * 调整后数量
   *
   * @author zyl
   * @type {number}
   */
change_qty_: number,


  /**
   * 调整前数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 批次数量调整原因
   *
   * @author zyl
   * @see {ChangeQtyReason}
   * @type {string}
   */
f_change_qty_reason_id_c0pl: string,


  /**
   * 数量为0自动关闭
   *
   * @author zyl
   * @type {boolean}
   */
close_when_empty_: boolean,


}


/**
 *模型名称：批次数量调整
 *模型KEY:em_txn_container_qty_change
 */
interface TxnContainerQtyChangeMethods extends IModelService<TxnContainerQtyChange> {
  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 更新数量
   *
   * @param1 containerId 批次id
   * @param2 changeQty 更新数量
   * @return void
   */
updateQty(containerId:string,changeQty:number):void;


  /**
   * 批次数量调整归咎设备
   *
   * @param1 containerId 批次id
   * @return Operation[]
   */
getBlamedDevices(containerId:string):Operation[];


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
