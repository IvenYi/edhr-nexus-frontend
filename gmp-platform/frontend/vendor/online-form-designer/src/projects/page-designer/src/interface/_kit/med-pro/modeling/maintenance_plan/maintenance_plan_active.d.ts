import {CommonFields ,NdoFields} from '../parent'

interface MaintenancePlanActive extends   NdoFields,CommonFields {
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
   * 备注
   *
   * @author zyl
   * @type {string}
   */
remark_: string,


  /**
   * 保养计划
   *
   * @author zyl
   * @see {MaintenancePlan}
   * @type {string}
   */
maintenance_plan_id_: string,


  /**
   * 激活时间
   *
   * @author zyl
   * @type {Date}
   */
active_time_: Date,


  /**
   * 激活状态
   *
   * @author zyl
   * @type {boolean}
   */
active_: boolean,


}


/**
 *模型名称：保养计划激活
 *模型KEY:em_maintenance_plan_active
 */
interface MaintenancePlanActiveMethods extends IModelService<MaintenancePlanActive> {
}
