import {CommonFields ,NdoFields} from '../parent'

interface DeviceGroup extends   NdoFields,CommonFields {
  /**
   * 设备组配置项
   *
   * @author zyl
   * @see {DeviceGroupEntry}
   * @type {string}
   */
device_group_entry: string,


}


/**
 *模型名称：设备组
 *模型KEY:em_device_group
 */
interface DeviceGroupMethods extends IModelService<DeviceGroup> {
}
