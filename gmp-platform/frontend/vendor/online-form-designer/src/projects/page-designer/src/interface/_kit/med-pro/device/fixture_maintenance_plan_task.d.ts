import {CommonFields } from '../parent'

interface FixtureMaintenancePlanTask extends CommonFields {
  /**
   * 治具
   *
   * @author zyl
   * @see {Fixture}
   * @type {string}
   */
fixture_id_: string,


  /**
   * 治具家族
   *
   * @author zyl
   * @see {FixtureFamily}
   * @type {string}
   */
fixture_family_id_: string,


  /**
   * 签名需求
   *
   * @author zyl
   * @see {SignRequirement}
   * @type {string}
   */
sign_requirement_id_: string,


  /**
   * 保养计划激活
   *
   * @author zyl
   * @see {FixtureMaintenancePlanActive}
   * @type {string}
   */
maintenance_plan_active_id_: string,


  /**
   * 强制保养时间
   *
   * @author zyl
   * @type {Date}
   */
force_maintenance_time_: Date,


  /**
   * 事务总线
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
f_mainline_id_c0pl: string,


  /**
   * 预警次数
   *
   * @author zyl
   * @type {number}
   */
warning_times_: number,


  /**
   * 容忍次数
   *
   * @author zyl
   * @type {number}
   */
tolerance_times_: number,


  /**
   * 需要保养的次数
   *
   * @author zyl
   * @type {number}
   */
need_maintenance_times_: number,


  /**
   * 次数保养计划
   *
   * @author zyl
   * @see {TimesMaintenancePlan}
   * @type {string}
   */
times_maintenance_plan_id_: string,


  /**
   * 使用次数
   *
   * @author zyl
   * @type {number}
   */
use_times_: number,


  /**
   * 保养状态
   *
   * @author zyl
   * @see {MaintenanceStatus}
   * @type {string}
   */
maintenance_status_: string,


  /**
   * 保养计划
   *
   * @author zyl
   * @see {MaintenancePlan}
   * @type {string}
   */
maintenance_plan_id_: string,


  /**
   * 保养时间
   *
   * @author zyl
   * @type {Date}
   */
maintenance_time_: Date,


  /**
   * 预警时间
   *
   * @author zyl
   * @type {Date}
   */
warning_time_: Date,


  /**
   * 容忍时间
   *
   * @author zyl
   * @type {Date}
   */
tolerance_time_: Date,


  /**
   * 下次预警时间
   *
   * @author zyl
   * @type {Date}
   */
next_warning_time_: Date,


  /**
   * 下次容忍时间
   *
   * @author zyl
   * @type {Date}
   */
next_tolerance_time_: Date,


  /**
   * 下个保养周期
   *
   * @author zyl
   * @type {Date}
   */
next_cycle_time_: Date,


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
   * 是否已做过保养
   *
   * @author zyl
   * @type {boolean}
   */
done_: boolean,


  /**
   * 是否强制保养
   *
   * @author zyl
   * @type {boolean}
   */
force_maintenance_: boolean,


}


/**
 *模型名称：治具保养任务
 *模型KEY:em_fixture_maintenance_plan_task
 */
interface FixtureMaintenancePlanTaskMethods extends IModelService<FixtureMaintenancePlanTask> {
  /**
   * 计算保养计划任务状态（未到期、预警期、已到期、已超期）
   *
   * @param1 task 保养计划数据
   * @return string
   */
calculateMaintenancePlanTaskStatus(task:Object):string;


  /**
   * 计算保养计划任务状态（未到期、预警期、已到期、已超期）
   *
   * @param1 task 保养计划数据
   * @return string
   */
calculateTimesMaintenancePlanTaskStatus(task:Object):string;


  /**
   * 清除未完成任务
   *
   * @param1 spotCheckPlanActiveId 维护计划激活ID
   * @return void
   */
clearUndoneTasks(spotCheckPlanActiveId:string):void;


  /**
   * 生成首次固定日期保养任务
   *
   * @param1 maintenancePlanActiveId 波阿姨护计划激活ID
   * @param2 forceGenFirst 是否强制生成首次任务
   * @return string
   */
genFirstFixedTask(maintenancePlanActiveId:string,forceGenFirst:boolean):string;


  /**
   * 生成首次或下次周期保养任务
   *
   * @param1 spotCheckPlanActiveId 维护计划激活ID
   * @param2 forceGenFirst 是否强制生成任务
   * @return string
   */
genFirstOrNextTask(spotCheckPlanActiveId:string,forceGenFirst:boolean):string;


  /**
   * 生成首次或下次次数保养任务
   *
   * @param1 maintenancePlanActiveId 波阿姨护计划激活ID
   * @return string
   */
genFirstOrNextTimesTask(maintenancePlanActiveId:string):string;


  /**
   * 扫描并更新任务状态
   *
   * @param 
   * @return string
   */
processTaskStatus():string;


  /**
   * 发送任务消息
   *
   * @param1 maintenancePlanActiveId 保养计划id
   * @param2 maintenanceStatus 任务状态
   * @return void
   */
sendTaskMessage(maintenancePlanActiveId:string,maintenanceStatus:string):void;


  /**
   * 更新治具保养任务（目前包含次数保养，固定日期保养）
   *
   * @param1 maintenancePlanActiveId 波阿姨护计划激活ID
   * @return string
   */
fixtureUpdateMaintenanceTask(maintenancePlanActiveId:string):string;


}
