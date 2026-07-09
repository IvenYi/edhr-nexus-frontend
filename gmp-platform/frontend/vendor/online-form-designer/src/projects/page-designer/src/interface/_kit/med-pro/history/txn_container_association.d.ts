import {CommonFields, ExecuteParams } from '../parent'

interface TxnContainerAssociation extends CommonFields {
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
   * 关联明细
   *
   * @author zyl
   * @see {TxnContainerAssociationDetail}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：批次关联
 *模型KEY:em_txn_container_association
 */
interface TxnContainerAssociationMethods extends IModelService<TxnContainerAssociation> {
  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 关联时自动关闭时间窗计时
   *
   * @param1 containerId 批次id
   * @return void
   */
autoEnd(containerId:string):void;


  /**
   * 关联时自动关闭时间窗计时
   *
   * @param1 containerIds 批次id
   * @return void
   */
autoEndBatch(containerIds:string[]):void;


  /**
   * 完成生产时间记录
   *
   * @param1 containerId 批次id
   * @return void
   */
endProcessTimes(containerId:string):void;


  /**
   * 完成生产时间记录
   *
   * @param1 containerId 批次id
   * @return void
   */
endProcessTimesBatch(containerId:string[]):void;


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
