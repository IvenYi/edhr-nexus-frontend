import {CommonFields } from '../parent'

interface SwitchRuleEntry extends CommonFields {
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
   * From检验级别
   *
   * @author zyl
   * @see {CheckLevel}
   * @type {string}
   */
from_check_level_id_: string,


  /**
   * To检验级别
   *
   * @author zyl
   * @see {CheckLevel}
   * @type {string}
   */
to_check_level_id_: string,


  /**
   * 通过/失败（枚举）
   *
   * @author zyl
   * @see {CheckResult}
   * @type {string}
   */
check_result_: string,


  /**
   * 设置最近的批次数量
   *
   * @author zyl
   * @type {number}
   */
set_recent_container_qty_: number,


  /**
   * 通过（失败）批次数量
   *
   * @author zyl
   * @type {number}
   */
pass_fail_container_qty_: number,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：切换规则配置
 *模型KEY:em_switch_rule_entry
 */
interface SwitchRuleEntryMethods extends IModelService<SwitchRuleEntry> {
}
