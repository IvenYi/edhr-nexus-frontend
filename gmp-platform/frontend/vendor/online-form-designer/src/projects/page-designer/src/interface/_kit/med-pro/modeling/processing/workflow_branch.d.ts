import {CommonFields } from '../parent'

interface WorkflowBranch extends CommonFields {
  /**
   * 工作流
   *
   * @author zyl
   * @type {string}
   */
workflow_id_: string,


  /**
   * 父级分支
   *
   * @author zyl
   * @type {string}
   */
parent_id_: string,


  /**
   * 目标分支
   *
   * @author zyl
   * @type {string}
   */
link_to_: string,


  /**
   * 头部
   *
   * @author zyl
   * @type {string}
   */
head_: string,


  /**
   * 尾部工艺步骤
   *
   * @author zyl
   * @type {string}
   */
tail_: string,


  /**
   * 类型
   *
   * @author zyl
   * @type {string}
   */
type_: string,


  /**
   * 兄弟主分支
   *
   * @author zyl
   * @type {string}
   */
main_sibling_branch_id_: string,


  /**
   * 提前执行
   *
   * @author zyl
   * @type {boolean}
   */
early_exec_: boolean,


  /**
   * 叶子节点
   *
   * @author zyl
   * @type {boolean}
   */
leaf_: boolean,


}


/**
 *模型名称：工作流树分支
 *模型KEY:em_workflow_branch
 */
interface WorkflowBranchMethods extends IModelService<WorkflowBranch> {
}
