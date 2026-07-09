import {CommonFields, ExecuteParams } from '../parent'

interface TxnMaterialIssue extends CommonFields {
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
   * 事务ID
   *
   * @author zyl
   * @type {number}
   */
txn_id_: number,


}


/**
 *模型名称：物料分发
 *模型KEY:em_txn_material_issue
 */
interface TxnMaterialIssueMethods extends IModelService<TxnMaterialIssue> {
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
   * 物料分发时验证工单指定批次
   *
   * @param1 containerId 批次id
   * @param2 orderBomId 工单Bomid
   * @return void
   */
validateContainerInOrderOfIssue(containerId:string,orderBomId:string):void;


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
