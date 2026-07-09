import {CommonFields, ExecuteParams } from '../parent'

interface TxnMaterialRemove extends CommonFields {
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


}


/**
 *模型名称：物料移除
 *模型KEY:em_txn_material_remove
 */
interface TxnMaterialRemoveMethods extends IModelService<TxnMaterialRemove> {
  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 当前工步
   *
   * @param1 containerId 批次id
   * @return WorkflowStep[]
   */
currentWorkflowSteps(containerId:string):WorkflowStep[];


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
