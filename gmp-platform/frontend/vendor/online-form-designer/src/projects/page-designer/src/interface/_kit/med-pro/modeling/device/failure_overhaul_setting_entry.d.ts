import {CommonFields } from '../parent'

interface FailureOverhaulSettingEntry extends CommonFields {
  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * 通知角色
   *
   * @author zyl
   * @type {string}
   */
user_id_: string,


  /**
   * 消息模版
   *
   * @author zyl
   * @type {string}
   */
message_template_: string,


  /**
   * 时长
   *
   * @author zyl
   * @type {number}
   */
time_: number,


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
   * 时长类别
   *
   * @author zyl
   * @see {TimeUnit}
   * @type {string}
   */
unit_: string,


}


/**
 *模型名称：故障维修设置配置项
 *模型KEY:em_failure_overhaul_setting_entry
 */
interface FailureOverhaulSettingEntryMethods extends IModelService<FailureOverhaulSettingEntry> {
}
