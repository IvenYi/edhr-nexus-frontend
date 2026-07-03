import {CommonFields } from '../parent'

interface WorkflowBranchExecution extends CommonFields {
  /**
   * 工作流
   *
   * @author zyl
   * @type {string}
   */
workflow_id_: string,


  /**
   * 批次
   *
   * @author zyl
   * @type {string}
   */
container_id_: string,


  /**
   * 分支ID
   *
   * @author zyl
   * @type {string}
   */
branch_id_: string,


  /**
   * 兄弟主分支
   *
   * @author zyl
   * @type {string}
   */
main_sibling_branch_id_: string,


  /**
   * 状态
   *
   * @author zyl
   * @type {number}
   */
done_: number,


  /**
   * 类型
   *
   * @author zyl
   * @type {string}
   */
type_: string,


}


/**
 *模型名称：工作流分支执行记录
 *模型KEY:em_workflow_branch_execution
 */
interface WorkflowBranchExecutionMethods extends IModelService<WorkflowBranchExecution> {
  /**
   * 首次加载
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return void
   */
initialLoad(containerId:string,workflowStepId:string):void;


}
