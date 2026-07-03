import {CommonFields, ExecuteParams } from '../parent'

interface TxnMoveNonStd extends CommonFields {
  /**
   * 目标工步
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
to_workflow_step_id_: string,


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
   * 工作流
   *
   * @author zyl
   * @see {Workflow}
   * @type {string}
   */
workflow_id_: string,


}


/**
 *模型名称：跳站
 *模型KEY:em_txn_move_non_std
 */
interface TxnMoveNonStdMethods extends IModelService<TxnMoveNonStd> {
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


  /**
   * 清除执行信息
   *
   * @param1 containerId 批次id
   * @return void
   */
cleanExecution(containerId:string):void;


  /**
   * 加载重新执行节点
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return null
   */
loadReExecNodes(containerId:string,workflowStepId:string):null;


  /**
   * 标记跳站状态
   *
   * @param1 containerId 批次id
   * @return null
   */
mark(containerId:string):null;


  /**
   * 验证跳站状态
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return null
   */
validate(containerId:string,workflowStepId:string):null;


}
