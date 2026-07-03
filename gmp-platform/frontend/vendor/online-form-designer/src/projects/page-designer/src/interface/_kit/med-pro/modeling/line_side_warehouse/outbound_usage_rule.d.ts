import {CommonFields ,NdoFields} from '../parent'

interface OutboundUsageRule extends   NdoFields,CommonFields {
  /**
   * 出库规则配置
   *
   * @author zyl
   * @see {OutboundUsageRuleEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：出库规则应用
 *模型KEY:em_outbound_usage_rule
 */
interface OutboundUsageRuleMethods extends IModelService<OutboundUsageRule> {
}
