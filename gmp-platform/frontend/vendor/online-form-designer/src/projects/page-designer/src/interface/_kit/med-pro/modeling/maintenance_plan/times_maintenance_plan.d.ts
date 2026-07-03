import {CommonFields ,RdoFields} from '../parent'

interface TimesMaintenancePlan extends RdoFields,CommonFields {
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
   * BASE_ID
   *
   * @author zyl
   * @type {string}
   */
base_id_: string,


}


/**
 *模型名称：次数保养计划
 *模型KEY:em_times_maintenance_plan
 */
interface TimesMaintenancePlanMethods extends IRdoModelService<TimesMaintenancePlan> {
}
