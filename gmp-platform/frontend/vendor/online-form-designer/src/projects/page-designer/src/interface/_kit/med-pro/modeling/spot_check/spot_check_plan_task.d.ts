import {CommonFields } from '../parent'

interface SpotCheckPlanTask extends CommonFields {
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
   * 点检计划激活
   *
   * @author zyl
   * @see {SpotCheckPlanActive}
   * @type {string}
   */
spot_check_plan_active_id_: string,


  /**
   * 点检时间
   *
   * @author zyl
   * @type {Date}
   */
spot_check_time_: Date,


  /**
   * 下次点检时间
   *
   * @author zyl
   * @type {Date}
   */
next_spot_check_time_: Date,


  /**
   * 点检计划
   *
   * @author zyl
   * @see {CycleSpotCheckPlan}
   * @type {string}
   */
spot_check_plan_id_: string,


  /**
   * 数据采集
   *
   * @author zyl
   * @see {DataCollection}
   * @type {string}
   */
data_collection_id_: string,


  /**
   * 数据采集历史项
   *
   * @author zyl
   * @see {DataCollectionItemHistory}
   * @type {string}
   */
data_collection_entries_: string,


  /**
   * 下次预警时间
   *
   * @author zyl
   * @type {Date}
   */
next_warning_time_: Date,


  /**
   * 预警时间
   *
   * @author zyl
   * @type {Date}
   */
warning_time_: Date,


  /**
   * 下次容忍时间
   *
   * @author zyl
   * @type {Date}
   */
next_tolerance_time_: Date,


  /**
   * 强制点检时间
   *
   * @author zyl
   * @type {Date}
   */
force_spot_check_time_: Date,


  /**
   * 容忍时间
   *
   * @author zyl
   * @type {Date}
   */
tolerance_time_: Date,


  /**
   * 事务总线
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
f_mainline_id_c0pl: string,


  /**
   * 点检状态
   *
   * @author zyl
   * @see {SpotCheckStatus}
   * @type {string}
   */
spot_check_status_: string,


  /**
   * 是否强制点检
   *
   * @author zyl
   * @type {boolean}
   */
force_spot_check_: boolean,


  /**
   * 激活状态
   *
   * @author zyl
   * @type {boolean}
   */
active_status_: boolean,


  /**
   * 是否已做过点检
   *
   * @author zyl
   * @type {boolean}
   */
done_: boolean,


}


/**
 *模型名称：点检任务
 *模型KEY:em_spot_check_plan_task
 */
interface SpotCheckPlanTaskMethods extends IModelService<SpotCheckPlanTask> {
  /**
   * 计算点检计划任务状态（未到期、预警期、已到期、已超期）
   *
   * @param1 task 点检计划任务数据
   * @return string
   */
calculateSpotCheckPlanTaskStatus(task:Object):string;


  /**
   * 清除未完成任务
   *
   * @param1 spotCheckPlanActiveId 维护计划激活ID
   * @return void
   */
clearUndoneTasks(spotCheckPlanActiveId:string):void;


  /**
   * 生成首次或下次点检任务
   *
   * @param1 spotCheckPlanActiveId 维护计划激活ID
   * @param2 forceGenFirst 是否强制生成任务
   * @return string
   */
genFirstOrNextTask(spotCheckPlanActiveId:string,forceGenFirst:boolean):string;


  /**
   * 扫描并更新任务状态
   *
   * @param 
   * @return string
   */
processTaskStatus():string;


}
