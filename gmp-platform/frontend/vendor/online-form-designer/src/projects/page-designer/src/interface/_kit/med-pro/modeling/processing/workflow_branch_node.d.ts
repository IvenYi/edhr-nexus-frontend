import {CommonFields } from '../parent'

interface WorkflowBranchNode extends CommonFields {
  /**
   * 分支
   *
   * @author zyl
   * @type {string}
   */
branch_id_: string,


  /**
   * 工艺步骤
   *
   * @author zyl
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 前置节点
   *
   * @author zyl
   * @type {string}
   */
previous_id_: string,


  /**
   * 后置节点
   *
   * @author zyl
   * @type {string}
   */
next_id_: string,


  /**
   * 提前执行
   *
   * @author zyl
   * @type {boolean}
   */
early_exec_: boolean,


  /**
   * 重新执行
   *
   * @author zyl
   * @type {boolean}
   */
re_exec_: boolean,


  /**
   * 可选执行
   *
   * @author zyl
   * @type {boolean}
   */
optional_exec_: boolean,


}


/**
 *模型名称：工作流树分支节点
 *模型KEY:em_workflow_branch_node
 */
interface WorkflowBranchNodeMethods extends IModelService<WorkflowBranchNode> {
}
