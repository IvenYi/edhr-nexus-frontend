import {CommonFields ,NdoFields} from '../parent'

interface DeviceType extends   NdoFields,CommonFields {
  /**
   * 设备类型故障维修配置
   *
   * @author zyl
   * @see {DeviceTypeFailureEntry}
   * @type {string}
   */
failure_entries_: string,


}


/**
 *模型名称：设备类型
 *模型KEY:em_device_type
 */
interface DeviceTypeMethods extends IModelService<DeviceType> {
}
