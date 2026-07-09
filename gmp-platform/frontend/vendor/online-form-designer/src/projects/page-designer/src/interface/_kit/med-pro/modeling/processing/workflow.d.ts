import {CommonFields } from '../parent'

interface Workflow extends CommonFields {
  /**
   * BASE_ID
   *
   * @author zyl
   * @type {string}
   */
base_id_: string,


  /**
   * 工作流节点
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_nodes_: string,


  /**
   * 执行未过站工序
   *
   * @author zyl
   * @type {boolean}
   */
execute_not_executed_step_enabled_: boolean,


}


/**
 *模型名称：工作流
 *模型KEY:em_workflow
 */
interface WorkflowMethods extends IModelService<Workflow> {
  /**
   * 检查修改的节点是否已进站
   *
   * @param1 workflowStepId 工步id
   * @return null
   */
updateSpecCheck(workflowStepId:string):null;


  /**
   * 校验修改的工步节点
   *
   * @param1 workflowStepId 工步id
   * @return null
   */
validateWorkflowStep(workflowStepId:string):null;


}
