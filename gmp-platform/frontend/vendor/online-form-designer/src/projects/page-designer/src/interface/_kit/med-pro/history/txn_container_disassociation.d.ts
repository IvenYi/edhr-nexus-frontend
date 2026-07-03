import {CommonFields, ExecuteParams } from '../parent'

interface TxnContainerDisassociation extends CommonFields {
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
   * 解除关联明细
   *
   * @author zyl
   * @see {TxnContainerDisassociationDetail}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：批次解除关联
 *模型KEY:em_txn_container_disassociation
 */
interface TxnContainerDisassociationMethods extends IModelService<TxnContainerDisassociation> {
  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 拷贝生产时间记录
   *
   * @param1 containerId 被拷贝批次id
   * @param2 toContainerId 拷贝批次
   * @return void
   */
copyProcessTimes(containerId:string,toContainerId:string):void;


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
