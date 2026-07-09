import {CommonFields } from '../parent'

interface DeviceOverhaulTask extends CommonFields {
  /**
   * 设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_id_: string,


  /**
   * 设备组
   *
   * @author zyl
   * @see {DeviceGroup}
   * @type {string}
   */
device_group_id_: string,


  /**
   * 签名需求
   *
   * @author zyl
   * @see {SignRequirement}
   * @type {string}
   */
sign_requirement_id_: string,


  /**
   * 故障维修项目
   *
   * @author zyl
   * @see {FailureOverhaulItem}
   * @type {string}
   */
failure_overhaul_item_id_: string,


  /**
   * 资产编号
   *
   * @author zyl
   * @type {string}
   */
asset_number_: string,


  /**
   * 设备故障分类
   *
   * @author zyl
   * @see {DeviceFailureGroup}
   * @type {string}
   */
device_failure_group_id_: string,


  /**
   * 事务总线
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
f_mainline_id_c0pl: string,


  /**
   * 申请人
   *
   * @author zyl
   * @type {string}
   */
f_applicant_c0pl: string,


  /**
   * 申请时间
   *
   * @author zyl
   * @type {Date}
   */
f_apply_time_c0pl: Date,


  /**
   * 通知时间
   *
   * @author zyl
   * @type {Date}
   */
noticed_time_: Date,


  /**
   * 到达时间
   *
   * @author zyl
   * @type {Date}
   */
arrived_time_: Date,


  /**
   * 完成时间
   *
   * @author zyl
   * @type {Date}
   */
finished_time_: Date,


  /**
   * 等待时长
   *
   * @author zyl
   * @type {number}
   */
waiting_time_: number,


  /**
   * 维修时长
   *
   * @author zyl
   * @type {number}
   */
overhaul_time_: number,


  /**
   * 同行人员
   *
   * @author zyl
   * @type {string}
   */
together_user_id_: string,


  /**
   * 维修状态
   *
   * @author zyl
   * @see {OverhaulStatus}
   * @type {string}
   */
overhaul_status_: string,


  /**
   * 描述
   *
   * @author zyl
   * @type {string}
   */
remark_: string,


}


/**
 *模型名称：维修任务
 *模型KEY:em_device_overhaul_task
 */
interface DeviceOverhaulTaskMethods extends IModelService<DeviceOverhaulTask> {
}
