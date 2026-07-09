import {CommonFields ,RdoFields} from '../parent'

interface PackageRule extends RdoFields,CommonFields {
  /**
   * 包装规则配置
   *
   * @author zyl
   * @see {PackageRuleEntry}
   * @type {string}
   */
entries_: string,


  /**
   * BASE_ID
   *
   * @author zyl
   * @type {string}
   */
base_id_: string,


}


/**
 *模型名称：包装规则
 *模型KEY:em_package_rule
 */
interface PackageRuleMethods extends IRdoModelService<PackageRule> {
}
