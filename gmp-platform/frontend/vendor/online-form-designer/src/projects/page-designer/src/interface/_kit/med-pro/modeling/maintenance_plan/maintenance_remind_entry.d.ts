import {CommonFields } from '../parent'

interface MaintenanceRemindEntry extends CommonFields {
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
   * 通知角色
   *
   * @author zyl
   * @type {string}
   */
user_ids_: string,


  /**
   * 消息模版
   *
   * @author zyl
   * @type {string}
   */
message_template_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 周期保养计划
   *
   * @author zyl
   * @see {DataCollection}
   * @type {string}
   */
cycle_maintenance_plan_id_: string,


  /**
   * 保养状态
   *
   * @author zyl
   * @see {MaintenanceStatus}
   * @type {string}
   */
maintenance_status_: string,


}


/**
 *模型名称：保养提醒配置
 *模型KEY:em_maintenance_remind_entry
 */
interface MaintenanceRemindEntryMethods extends IModelService<MaintenanceRemindEntry> {
}
