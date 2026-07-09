import {CommonFields } from '../parent'

interface MessageGradientNotifications extends CommonFields {
  /**
   * 消息通知事务
   *
   * @author zyl
   * @see {MessageTxnType}
   * @type {string}
   */
message_txn_type_: string,


  /**
   * 通知对象
   *
   * @author zyl
   * @type {string}
   */
user_ids_: string,


  /**
   * 时长
   *
   * @author zyl
   * @type {number}
   */
time_: number,


  /**
   * 时长类别
   *
   * @author zyl
   * @see {TimeUnit}
   * @type {string}
   */
unit_: string,


  /**
   * 消息通知规则详情
   *
   * @author zyl
   * @see {MessageNotificationsUsageRuleEntry}
   * @type {string}
   */
rule_entry_id_: string,


}


/**
 *模型名称：梯度通知
 *模型KEY:em_message_gradient_notifications
 */
interface MessageGradientNotificationsMethods extends IModelService<MessageGradientNotifications> {
}
