import {CommonFields } from '../parent'

interface DeviceStatusChange extends CommonFields {
  /**
   * 设备组
   *
   * @author zyl
   * @see {DeviceGroup}
   * @type {string}
   */
device_group_id_: string,


  /**
   * 设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_id_: string,


  /**
   * 当前状态
   *
   * @author zyl
   * @see {DeviceStatus}
   * @type {string}
   */
current_status_: string,


  /**
   * 切换状态
   *
   * @author zyl
   * @see {DeviceStatus}
   * @type {string}
   */
change_status_: string,


  /**
   * 切换原因
   *
   * @author zyl
   * @see {ChangeDeviceStatusReason}
   * @type {string}
   */
f_change_reason_id_6ze6: string,


  /**
   * 当前状态变更原因
   *
   * @author zyl
   * @see {ChangeDeviceStatusReason}
   * @type {string}
   */
f_current_change_reason_id_6ze6: string,


}


/**
 *模型名称：设备状态切换
 *模型KEY:em_device_status_change
 */
interface DeviceStatusChangeMethods extends IModelService<DeviceStatusChange> {
  /**
   * 设备状态切换
   *
   * @param1 valueMap 工单状态切换数据
   * @return void
   */
changeStatus(valueMap:TxnMfgOrderChange):void;


}
