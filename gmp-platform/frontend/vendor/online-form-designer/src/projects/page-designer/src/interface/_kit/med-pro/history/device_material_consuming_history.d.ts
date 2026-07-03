import {CommonFields } from '../parent'

interface DeviceMaterialConsumingHistory extends CommonFields {
  /**
   * 事务总线id
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
mainline_id_: string,


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
   * 物料批次名称
   *
   * @author zyl
   * @type {string}
   */
material_container_name_: string,


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
   * 扣料数量
   *
   * @author zyl
   * @type {number}
   */
consuming_qty_: number,


  /**
   * 上料管理
   *
   * @author zyl
   * @see {DeviceMaterialFeeding}
   * @type {string}
   */
device_material_feeding_id_: string,


  /**
   * 设备多选
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_ids_: string,


  /**
   * 生产批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


}


/**
 *模型名称：设备扣料历史
 *模型KEY:em_device_material_consuming_history
 */
interface DeviceMaterialConsumingHistoryMethods extends IModelService<DeviceMaterialConsumingHistory> {
}
