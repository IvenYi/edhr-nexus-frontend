import {CommonFields ,NdoFields} from '../parent'

interface Device extends   NdoFields,CommonFields {
  /**
   * 培训需求组
   *
   * @author zyl
   * @see {TrainingRequirementGroup}
   * @type {string}
   */
training_requirement_group_id_: string,


  /**
   * 物理位置
   *
   * @author zyl
   * @see {Location}
   * @type {string}
   */
location_id_: string,


  /**
   * 设备状态
   *
   * @author zyl
   * @see {DeviceStatus}
   * @type {string}
   */
status_: string,


  /**
   * 故障维修设置
   *
   * @author zyl
   * @see {FailureOverhaulSetting}
   * @type {string}
   */
failure_overhaul_setting_id_: string,


  /**
   * 资产编号
   *
   * @author zyl
   * @type {string}
   */
asset_number_: string,


  /**
   * 工厂
   *
   * @author zyl
   * @see {Factory}
   * @type {string}
   */
factory_id_: string,


  /**
   * 车间
   *
   * @author zyl
   * @see {Shopfloor}
   * @type {string}
   */
shopfloor_id_: string,


  /**
   * 设备家族
   *
   * @author zyl
   * @see {DeviceFamily}
   * @type {string}
   */
device_family_id_: string,


  /**
   * 设备类型
   *
   * @author zyl
   * @see {DeviceType}
   * @type {string}
   */
device_type_id_: string,


  /**
   * 序列号
   *
   * @author zyl
   * @type {string}
   */
serial_number_: string,


  /**
   * 文档集
   *
   * @author zyl
   * @see {DocumentSet}
   * @type {string}
   */
document_set_id_: string,


  /**
   * 使用次数
   *
   * @author zyl
   * @type {number}
   */
use_times_: number,


  /**
   * 负责人
   *
   * @author zyl
   * @type {string}
   */
f_principal_id_c0pl: string,


  /**
   * 部门
   *
   * @author zyl
   * @type {string}
   */
f_org_id_c0pl: string,


  /**
   * 占用后可使用
   *
   * @author zyl
   * @type {boolean}
   */
lock_disabled_: boolean,


  /**
   * 锁定
   *
   * @author zyl
   * @type {boolean}
   */
locked_: boolean,


}


/**
 *模型名称：设备管理
 *模型KEY:em_device
 */
interface DeviceMethods extends IModelService<Device> {
  /**
   * 计算设备使用次数
   *
   * @param1 deviceIdList 设备数组
   * @param2 containerId 批次id
   * @return void
   */
countUseTimesOfDevice(deviceIdList:string[],containerId:string):void;


  /**
   * 锁定设备
   *
   * @param1 deviceIdList 设备id数组
   * @return void
   */
lock(deviceIdList:string[]):void;


  /**
   * 解锁设备
   *
   * @param1 deviceIdList 设备id数组
   * @return void
   */
unlock(deviceIdList:string[]):void;


  /**
   * 获取设备
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @return Device[]
   */
getByWorkflowStepId(containerId:string,workflowStepId:string):Device[];


  /**
   * 获取设备
   *
   * @param1 containerId 批次id
   * @param2 workflowStepId 工步id
   * @param3 queryMap 查询条件
   * @return Device[]
   */
getPageByWorkflowStepId(containerId:string,workflowStepId:string,queryMap:Object):Device[];


}
