import {CommonFields } from '../parent'

interface InventoryWarningUsageRuleEntry extends CommonFields {
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
   * 预警数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：库存预警配置
 *模型KEY:em_inventory_warning_usage_rule_entry
 */
interface InventoryWarningUsageRuleEntryMethods extends IModelService<InventoryWarningUsageRuleEntry> {
}
