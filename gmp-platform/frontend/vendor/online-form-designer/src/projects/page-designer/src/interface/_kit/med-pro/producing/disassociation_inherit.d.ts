import {CommonFields } from '../parent'

interface DisassociationInherit extends CommonFields {
  /**
   * 工步
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 治具(多选)
   *
   * @author zyl
   * @see {Fixture}
   * @type {string}
   */
fixture_ids_: string,


  /**
   * 设备(多选)
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_ids_: string,


  /**
   * 清场
   *
   * @author zyl
   * @see {TxnCleaning}
   * @type {string}
   */
cleaning_ids_: string,


}


/**
 *模型名称：批次事务继承
 *模型KEY:em_disassociation_inherit
 */
interface DisassociationInheritMethods extends IModelService<DisassociationInherit> {
  /**
   * 获取继承父级进站的设备
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return Device[]
   */
getDevices(containerId:string,workflowStepId:string):Device[];


  /**
   * 获取继承父级进站的治具
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return Fixture[]
   */
getFixtures(containerId:string,workflowStepId:string):Fixture[];


  /**
   * 删除解绑后事务继承信息
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return void
   */
removeDisassociationInherit(containerId:string,workflowStepId:string):void;


}
