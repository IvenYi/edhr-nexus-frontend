import {CommonFields ,NdoFields} from '../parent'

interface InventoryWarningUsageRule extends   NdoFields,CommonFields {
  /**
   * 库存预警配置
   *
   * @author zyl
   * @see {InventoryWarningUsageRuleEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：库存预警设置
 *模型KEY:em_inventory_warning_usage_rule
 */
interface InventoryWarningUsageRuleMethods extends IModelService<InventoryWarningUsageRule> {
}
