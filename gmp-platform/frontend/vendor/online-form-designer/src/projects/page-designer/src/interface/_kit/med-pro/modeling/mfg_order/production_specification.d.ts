import {CommonFields } from '../parent'

interface ProductionSpecification extends CommonFields {
  /**
   * 人员
   *
   * @author zyl
   * @type {string}
   */
user_ids_: string,


  /**
   * 工站
   *
   * @author zyl
   * @see {Operation}
   * @type {string}
   */
operation_id_: string,


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
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
devices_ids_: string,


}


/**
 *模型名称：生产指定
 *模型KEY:em_production_specification
 */
interface ProductionSpecificationMethods extends IModelService<ProductionSpecification> {
  /**
   * 去除没有权限的工步
   *
   * @param1 userId 用户id
   * @param2 workflowStepList 工步列表
   * @param3 containerId 批次id
   * @return WorkflowStep[]
   */
removeUnPermittedWorkflowSteps(userId:string,workflowStepList:WorkflowStep[],containerId:string):WorkflowStep[];


}
