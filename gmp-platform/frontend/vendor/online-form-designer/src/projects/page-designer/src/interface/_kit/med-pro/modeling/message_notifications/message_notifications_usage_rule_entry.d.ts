import {CommonFields } from '../parent'

interface MessageNotificationsUsageRuleEntry extends CommonFields {
  /**
   * 梯度通知关联id
   *
   * @author zyl
   * @type {string}
   */
gradient_id_: string,


  /**
   * 消息通知事务
   *
   * @author zyl
   * @see {MessageTxnType}
   * @type {string}
   */
message_txn_type_: string,


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
   * 通知对象
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
   * 梯度通知
   *
   * @author zyl
   * @type {boolean}
   */
gradient_: boolean,


}


/**
 *模型名称：消息通知详情
 *模型KEY:em_message_notifications_usage_rule_entry
 */
interface MessageNotificationsUsageRuleEntryMethods extends IModelService<MessageNotificationsUsageRuleEntry> {
}
