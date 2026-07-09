import {CommonFields } from '../parent'

interface SamplingPlanEntry extends CommonFields {
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
   * 采样方式
   *
   * @author zyl
   * @see {SamplingMethod}
   * @type {string}
   */
sampling_method_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_id_: string,


  /**
   * 检验级别
   *
   * @author zyl
   * @see {CheckLevel}
   * @type {string}
   */
check_level_id_: string,


  /**
   * 切换规则
   *
   * @author zyl
   * @see {SwitchRule}
   * @type {string}
   */
switch_rule_id_: string,


  /**
   * 采样率
   *
   * @author zyl
   * @type {number}
   */
sampling_rate_: number,


  /**
   * 切换规则最大持续时间
   *
   * @author zyl
   * @type {number}
   */
switch_rule_max_duration_: number,


  /**
   * 采样率最大持续时间
   *
   * @author zyl
   * @type {number}
   */
sampling_rate_max_duration_: number,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


  /**
   * AQL级别
   *
   * @author zyl
   * @see {AqlLevel}
   * @type {string}
   */
aql_level_id_: string,


  /**
   * 失败时检验所有批次数量
   *
   * @author zyl
   * @type {boolean}
   */
failure_check_all_enabled_: boolean,


  /**
   * 基于批次原数量进行采样
   *
   * @author zyl
   * @type {boolean}
   */
sampling_by_original_qty_enabled_: boolean,


  /**
   * 完成时自动出站
   *
   * @author zyl
   * @type {boolean}
   */
auto_move_enabled_: boolean,


}


/**
 *模型名称：采样计划配置
 *模型KEY:em_sampling_plan_entry
 */
interface SamplingPlanEntryMethods extends IModelService<SamplingPlanEntry> {
}
