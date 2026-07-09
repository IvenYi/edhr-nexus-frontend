import {CommonFields } from '../parent'

interface WorkflowStep extends CommonFields {
  /**
   * 引用主模型数据 id
   *
   * @author zyl
   * @type {string}
   */
ref_master_id_: string,


  /**
   * 引用主模型key
   *
   * @author zyl
   * @type {string}
   */
ref_model_key_: string,


  /**
   * 引用主模型字段key
   *
   * @author zyl
   * @type {string}
   */
ref_field_key_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 类型
   *
   * @author zyl
   * @type {string}
   */
type_: string,


  /**
   * 节点ID
   *
   * @author zyl
   * @type {string}
   */
node_id_: string,


  /**
   * 链接JSON
   *
   * @author zyl
   * @type {string}
   */
link_: string,


  /**
   * 源节点ID
   *
   * @author zyl
   * @type {string}
   */
source_node_id_: string,


  /**
   * 目标节点ID
   *
   * @author zyl
   * @type {string}
   */
target_node_id_: string,


  /**
   * 流程节点配置信息
   *
   * @author zyl
   * @type {string}
   */
node_config_: string,


  /**
   * 条件表达式
   *
   * @author zyl
   * @type {string}
   */
condition_exp_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 前置节点
   *
   * @author zyl
   * @type {string}
   */
pre_node_ids_: string,


  /**
   * 重新执行
   *
   * @author zyl
   * @type {boolean}
   */
re_exec_: boolean,


  /**
   * 提前执行
   *
   * @author zyl
   * @type {boolean}
   */
early_exec_: boolean,


  /**
   * 可选执行
   *
   * @author zyl
   * @type {boolean}
   */
optional_exec_: boolean,


}


/**
 *模型名称：工艺步骤
 *模型KEY:em_workflow_step
 */
interface WorkflowStepMethods extends IModelService<WorkflowStep> {
  /**
   * 获取工艺
   *
   * @param1 workflowStepId 工步id
   * @param2 containerId 批次id
   * @return Spec
   */
getSpec(workflowStepId:string,containerId:string):Spec;


  /**
   * 去除前置节点未完成的工步
   *
   * @param 
   * @return void
   */
removeDependentWorkflowSteps():void;


  /**
   * 去除前置节点未完成的工步
   *
   * @param1 workflowStepList 工步列表
   * @param2 containerId 批次id
   * @return WorkflowStep[]
   */
removeEarlyWorkflowSteps(workflowStepList:WorkflowStep[],containerId:string):WorkflowStep[];


  /**
   * 获取第一个工艺步骤
   *
   * @param1 workflowVerId 工步id
   * @return WorkflowStep
   */
getLeadingWorkflowStep(workflowVerId:string):WorkflowStep;


}
