import {CommonFields } from '../parent'

interface OutboundUsageRuleEntry extends CommonFields {
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
   * 出库规则
   *
   * @author zyl
   * @see {OutboundRule}
   * @type {string}
   */
rule_: string,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：出库规则
 *模型KEY:em_outbound_usage_rule_entry
 */
interface OutboundUsageRuleEntryMethods extends IModelService<OutboundUsageRuleEntry> {
}
