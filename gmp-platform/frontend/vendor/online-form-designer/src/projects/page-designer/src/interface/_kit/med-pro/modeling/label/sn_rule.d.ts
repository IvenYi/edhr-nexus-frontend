import {CommonFields ,RdoFields} from '../parent'

interface SnRule extends RdoFields,CommonFields {
  /**
   * BASE_ID
   *
   * @author zyl
   * @type {string}
   */
base_id_: string,


  /**
   * 规则配置
   *
   * @author zyl
   * @type {string}
   */
config_: string,


}


/**
 *模型名称：流水码规则
 *模型KEY:em_sn_rule
 */
interface SnRuleMethods extends IRdoModelService<SnRule> {
}
