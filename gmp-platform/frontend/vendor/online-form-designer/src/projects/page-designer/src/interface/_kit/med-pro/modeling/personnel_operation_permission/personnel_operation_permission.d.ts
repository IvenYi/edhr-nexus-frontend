import {CommonFields } from '../parent'

interface PersonnelOperationPermission extends CommonFields {
  /**
   * 人员
   *
   * @author zyl
   * @type {string}
   */
user_id_: string,


  /**
   * 工站
   *
   * @author zyl
   * @see {Operation}
   * @type {string}
   */
operation_ids_: string,


}


/**
 *模型名称：人员工站权限
 *模型KEY:em_personnel_operation_permission
 */
interface PersonnelOperationPermissionMethods extends IModelService<PersonnelOperationPermission> {
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
