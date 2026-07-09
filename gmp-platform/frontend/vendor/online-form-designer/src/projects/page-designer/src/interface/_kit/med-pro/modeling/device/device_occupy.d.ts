import {CommonFields } from '../parent'

interface DeviceOccupy extends CommonFields {
  /**
   * 设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_id_: string,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 工艺步骤
   *
   * @author zyl
   * @see {WorkflowStep}
   * @type {string}
   */
workflow_step_id_: string,


}


/**
 *模型名称：设备占用信息
 *模型KEY:em_device_occupy
 */
interface DeviceOccupyMethods extends IModelService<DeviceOccupy> {
  /**
   * 设备占用状态继承
   *
   * @param1 fromContainerId 被继承批次id
   * @param2 toContainerId 继承批次id
   * @return void
   */
copyDeviceOccupy(fromContainerId:string,toContainerId:string):void;


  /**
   * 设备占用状态继承
   *
   * @param1 fromContainerId 被继承批次id
   * @param2 toContainerId 继承批次id
   * @return void
   */
copyDeviceOccupyBatch(fromContainerId:string,toContainerId:string[]):void;


  /**
   * 保存设备占用信息
   *
   * @param1 deviceIdList 设备id数组
   * @param2 containerId 批次id
   * @param3 workflowStepId 工步id
   * @return void
   */
occupy(deviceIdList:string[],containerId:string,workflowStepId:string):void;


  /**
   * 删除设备占用信息
   *
   * @param1 deviceIdList 设备id数组
   * @param2 containerId 批次id
   * @param3 workflowStepId 工步id
   * @return void
   */
releaseOccupy(deviceIdList:string[],containerId:string,workflowStepId:string):void;


}
