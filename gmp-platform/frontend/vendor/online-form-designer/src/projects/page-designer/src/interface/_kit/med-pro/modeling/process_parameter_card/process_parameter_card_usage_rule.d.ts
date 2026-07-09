import {CommonFields } from '../parent'

interface ProcessParameterCardUsageRule extends CommonFields {
  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 工艺参数卡
   *
   * @author zyl
   * @see {ProcessParameterCard}
   * @type {string}
   */
process_parameter_card_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 设备组
   *
   * @author zyl
   * @see {DeviceGroup}
   * @type {string}
   */
device_group_id_: string,


  /**
   * 事务
   *
   * @author zyl
   * @type {string}
   */
txn_key_: string,


  /**
   * 应用状态
   *
   * @author zyl
   * @see {UsageStatus}
   * @type {string}
   */
status_: string,


}


/**
 *模型名称：工艺参数卡应用配置
 *模型KEY:em_process_parameter_card_usage_rule
 */
interface ProcessParameterCardUsageRuleMethods extends IModelService<ProcessParameterCardUsageRule> {
}
