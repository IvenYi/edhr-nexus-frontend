import {CommonFields, ExecuteParams } from '../parent'

interface TxnRework extends CommonFields {
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
   * 返工路径
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
to_workflow_step_id_: string,


  /**
   * 返工原因
   *
   * @author zyl
   * @see {ReworkReason}
   * @type {string}
   */
f_rework_reason_r6df: string,


  /**
   * 返工原因
   *
   * @author zyl
   * @see {ReworkReason}
   * @type {string}
   */
rework_reason_id_: string,


  /**
   * 自定义返工路径
   *
   * @author zyl
   * @type {boolean}
   */
f_custom_rework_path_r6df: boolean,


}


/**
 *模型名称：返工
 *模型KEY:em_txn_rework
 */
interface TxnReworkMethods extends IModelService<TxnRework> {
  /**
   * 当前工步
   *
   * @param1 containerId 批次id
   * @return WorkflowStep[]
   */
currentWorkflowSteps(containerId:string):WorkflowStep[];


  /**
   * 获取返工节点
   *
   * @param1 workflowStepId 工步id
   * @return WorkflowStep[]
   */
getReworkSteps(workflowStepId:string):WorkflowStep[];


  /**
   * 执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
execute(txnInfo:ExecuteParams):void;


  /**
   * 是否返工中
   *
   * @param1 containerId 批次id
   * @return boolean
   */
isInRework(containerId:string):boolean;


  /**
   * 加载首个执行节点
   *
   * @param1 containerId 批次id
   * @return null
   */
loadLeadingNode(containerId:string):null;


  /**
   * 加载重新执行节点
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return null
   */
loadReExecNodes(containerId:string,workflowStepId:string):null;


  /**
   * 当前分支中做返工
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @param3 toWorkflowStepId 目标工步id
   * @return null
   */
reworkInCurrentBranch(containerId:string,workflowStepId:string,toWorkflowStepId:string):null;


  /**
   * 标记执行中的分支状态为返工
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId g工步
   * @return null
   */
updateBranchToRework(containerId:string,workflowStepId:string):null;


  /**
   * 批量执行
   *
   * @param1 txnInfo 执行参数
   * @return void
   */
batchExecute(txnInfo:ExecuteParams):void;


}
