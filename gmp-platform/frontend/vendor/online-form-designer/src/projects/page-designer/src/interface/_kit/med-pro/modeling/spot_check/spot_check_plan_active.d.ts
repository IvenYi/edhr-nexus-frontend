import {CommonFields ,NdoFields} from '../parent'

interface SpotCheckPlanActive extends   NdoFields,CommonFields {
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
   * 点检计划
   *
   * @author zyl
   * @see {CycleSpotCheckPlan}
   * @type {string}
   */
spot_check_plan_id_: string,


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
 *模型名称：点检计划激活
 *模型KEY:em_spot_check_plan_active
 */
interface SpotCheckPlanActiveMethods extends IModelService<SpotCheckPlanActive> {
}
