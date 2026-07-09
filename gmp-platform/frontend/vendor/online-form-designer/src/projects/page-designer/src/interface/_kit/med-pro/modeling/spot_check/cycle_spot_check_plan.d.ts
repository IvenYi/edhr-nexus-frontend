import {CommonFields ,RdoFields} from '../parent'

interface CycleSpotCheckPlan extends RdoFields,CommonFields {
  /**
   * 容忍期
   *
   * @author zyl
   * @type {number}
   */
tolerance_seconds_: number,


  /**
   * 周期点检计划周几
   *
   * @author zyl
   * @see {DayOfWeek}
   * @type {string}
   */
day_of_week_: string,


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
   * 文档集
   *
   * @author zyl
   * @see {DocumentSet}
   * @type {string}
   */
document_set_id_: string,


  /**
   * 签名需求
   *
   * @author zyl
   * @see {SignRequirement}
   * @type {string}
   */
sign_requirement_id_: string,


  /**
   * 数据采集
   *
   * @author zyl
   * @see {DataCollection}
   * @type {string}
   */
data_collection_id_: string,


  /**
   * 预警期
   *
   * @author zyl
   * @type {number}
   */
warning_seconds_: number,


  /**
   * 点检频率
   *
   * @author zyl
   * @type {number}
   */
frequency_: number,


  /**
   * BASE_ID
   *
   * @author zyl
   * @type {string}
   */
base_id_: string,


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
   * 点检周期类型
   *
   * @author zyl
   * @see {SpotCheckCycle}
   * @type {string}
   */
spot_check_cycle_: string,


  /**
   * 点检时间
   *
   * @author zyl
   * @type {Date}
   */
time_of_day_: Date,


}


/**
 *模型名称：周期点检计划
 *模型KEY:em_cycle_spot_check_plan
 */
interface CycleSpotCheckPlanMethods extends IRdoModelService<CycleSpotCheckPlan> {
}
