import {CommonFields } from '../parent'

interface MessageNotificationsUsageRule extends CommonFields {
  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 消息类别
   *
   * @author zyl
   * @see {MessageType}
   * @type {string}
   */
message_type_: string,


  /**
   * 消息通知规则详情
   *
   * @author zyl
   * @see {MessageNotificationsUsageRuleEntry}
   * @type {string}
   */
entries_: string,


  /**
   * 状态
   *
   * @author zyl
   * @type {boolean}
   */
status_: boolean,


}


/**
 *模型名称：消息通知规则
 *模型KEY:em_message_notifications_usage_rule
 */
interface MessageNotificationsUsageRuleMethods extends IModelService<MessageNotificationsUsageRule> {
  /**
   * 停用消息规则通知
   *
   * @param1 ruleId 消息通知规则id
   * @return void
   */
disable(ruleId:string):void;


  /**
   * 启用消息规则通知
   *
   * @param1 ruleId 消息通知规则id
   * @return void
   */
enable(ruleId:string):void;


  /**
   * 获取消息通知规则
   *
   * @param1 messageTxnType 消息通知事务类型
   * @param2 deviceId 设备id
   * @param3 containerId 批次id
   * @return Object[]
   */
getMessageUsageRule(messageTxnType:string,deviceId:string,containerId:string):Object[];


  /**
   * 发送消息
   *
   * @param1 messageTxnType 消息通知事务类型
   * @param2 deviceId 设备id
   * @param3 containerId 批次id
   * @param4 dataId 业务数据id
   * @return void
   */
sendMessage(messageTxnType:string,deviceId:string,containerId:string,dataId:string):void;


}
