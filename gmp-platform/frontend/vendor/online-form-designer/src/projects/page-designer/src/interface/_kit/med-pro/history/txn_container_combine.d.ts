import {CommonFields, ExecuteParams } from '../parent'

interface TxnContainerCombine extends CommonFields {
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
   * 合并明细
   *
   * @author zyl
   * @see {TxnContainerCombineDetail}
   * @type {string}
   */
entries_: string,


  /**
   * 批次合并原因
   *
   * @author zyl
   * @see {ContainerCombineReason}
   * @type {string}
   */
f_combine_reason_id_r6df: string,


}


/**
 *模型名称：批次合并
 *模型KEY:em_txn_container_combine
 */
interface TxnContainerCombineMethods extends IModelService<TxnContainerCombine> {
  /**
   * 增加数量
   *
   * @param1 containerId 批次id
   * @param2 children 子批次数据
   * @return void
   */
addQty(containerId:string,children:Object[]):void;


  /**
   * 创建批次
   *
   * @param1 containerId 批次id
   * @param2 children 子批次数据
   * @return void
   */
createContainer(containerId:string,children:Object[]):void;


  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 批次合并时自动关闭时间窗计时
   *
   * @param1 containerId 批次id
   * @return void
   */
autoEnd(containerId:string):void;


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
