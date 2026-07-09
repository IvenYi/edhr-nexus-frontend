import {CommonFields } from '../parent'

interface DeviceTypeFailureEntry extends CommonFields {
  /**
   * 设备故障分类
   *
   * @author zyl
   * @see {DeviceFailureGroup}
   * @type {string}
   */
device_failure_group_id_: string,


  /**
   * 故障维修项目
   *
   * @author zyl
   * @see {FailureOverhaulItem}
   * @type {string}
   */
failure_overhaul_item_id_: string,


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


}


/**
 *模型名称：设备类型配置项
 *模型KEY:em_device_type_failure_entry
 */
interface DeviceTypeFailureEntryMethods extends IModelService<DeviceTypeFailureEntry> {
}
