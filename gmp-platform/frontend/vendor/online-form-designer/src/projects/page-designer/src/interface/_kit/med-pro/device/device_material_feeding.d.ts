import {CommonFields } from '../parent'

interface DeviceMaterialFeeding extends CommonFields {
  /**
   * 设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_id_: string,


  /**
   * 上料口
   *
   * @author zyl
   * @see {MaterialFeedingPort}
   * @type {string}
   */
feeding_port_id_: string,


  /**
   * 物料批次
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
material_container_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 配料房
   *
   * @author zyl
   * @see {Warehouse}
   * @type {string}
   */
batch_room_: string,


  /**
   * 加料仓
   *
   * @author zyl
   * @see {Warehouse}
   * @type {string}
   */
charging_bin_: string,


  /**
   * 上料数量
   *
   * @author zyl
   * @type {number}
   */
feeding_qty_: number,


  /**
   * 剩余数量
   *
   * @author zyl
   * @type {number}
   */
remaining_qty_: number,


}


/**
 *模型名称：设备上料管理
 *模型KEY:em_device_material_feeding
 */
interface DeviceMaterialFeedingMethods extends IModelService<DeviceMaterialFeeding> {
  /**
   * 校验设备
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @param3 deviceIds 设备数组
   * @return void
   */
isDeviceMaterialPrepared(containerId:string,workflowStepId:string,deviceIds:string[]):void;


}
