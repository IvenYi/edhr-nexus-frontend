import {CommonFields, ExecuteParams } from '../parent'

interface TxnMaterialFeeding extends CommonFields {
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
   * 工艺步骤iD
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


}


/**
 *模型名称：配方投料
 *模型KEY:em_txn_material_feeding
 */
interface TxnMaterialFeedingMethods extends IModelService<TxnMaterialFeeding> {
  /**
   * 当前工步
   *
   * @param1 containerId 批次id
   * @return WorkflowStep[]
   */
currentWorkflowSteps(containerId:string):WorkflowStep[];


  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 配方投料时验证工单指定批次
   *
   * @param1 containerId 批次id
   * @param2 orderRecipeId 工单配方详情id
   * @return void
   */
validateContainerInOrder(containerId:string,orderRecipeId:string):void;


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
