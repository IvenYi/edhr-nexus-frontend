import {CommonFields ,RdoFields} from '../parent'

interface CycleMaintenancePlan extends RdoFields,CommonFields {
  /**
   * 保养原因
   *
   * @author zyl
   * @see {MaintenanceReason}
   * @type {string}
   */
maintenance_reason_id_: string,


  /**
   * 数据采集
   *
   * @author zyl
   * @see {DataCollection}
   * @type {string}
   */
data_collection_id_: string,


  /**
   * 保养提醒配置
   *
   * @author zyl
   * @see {MaintenanceRemindEntry}
   * @type {string}
   */
remind_entries_: string,


  /**
   * 容忍期
   *
   * @author zyl
   * @type {number}
   */
tolerance_seconds_: number,


  /**
   * 预警期
   *
   * @author zyl
   * @type {number}
   */
warning_seconds_: number,


  /**
   * 使用次数
   *
   * @author zyl
   * @type {number}
   */
use_times_: number,


  /**
   * 容忍次数
   *
   * @author zyl
   * @type {number}
   */
tolerance_times_: number,


  /**
   * 预警次数
   *
   * @author zyl
   * @type {number}
   */
warning_times_: number,


  /**
   * 计划类型
   *
   * @author zyl
   * @see {PlanType}
   * @type {string}
   */
plan_type_: string,


  /**
   * 签名需求
   *
   * @author zyl
   * @see {SignRequirement}
   * @type {string}
   */
sign_requirement_id_: string,


  /**
   * 保养频率
   *
   * @author zyl
   * @type {number}
   */
frequency_: number,


  /**
   * 总次数
   *
   * @author zyl
   * @type {number}
   */
total_times_: number,


  /**
   * 每月几号
   *
   * @author zyl
   * @type {number}
   */
day_of_month_: number,


  /**
   * 每年几月
   *
   * @author zyl
   * @type {number}
   */
month_of_year: number,


  /**
   * 周期保养计划周几
   *
   * @author zyl
   * @see {DayOfWeek}
   * @type {string}
   */
day_of_week_: string,


  /**
   * BASE_ID
   *
   * @author zyl
   * @type {string}
   */
base_id_: string,


  /**
   * 保养周期类型
   *
   * @author zyl
   * @see {MaintenanceCycle}
   * @type {string}
   */
maintenance_cycle_: string,


  /**
   * 计划开始时间
   *
   * @author zyl
   * @type {Date}
   */
plan_start_date_: Date,


  /**
   * 计划完成时间
   *
   * @author zyl
   * @type {Date}
   */
plan_end_date_: Date,


  /**
   * 保养时间
   *
   * @author zyl
   * @type {Date}
   */
time_of_day_: Date,


  /**
   * 文档集
   *
   * @author zyl
   * @see {DocumentSet}
   * @type {string}
   */
document_set_id_: string,


}


/**
 *模型名称：周期保养计划
 *模型KEY:em_cycle_maintenance_plan
 */
interface CycleMaintenancePlanMethods extends IRdoModelService<CycleMaintenancePlan> {
}
