import {CommonFields } from '../parent'

interface EdhrUsageRule extends CommonFields {
  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 产品家族
   *
   * @author zyl
   * @see {ProductFamily}
   * @type {string}
   */
product_family_id_: string,


  /**
   * edhr模版
   *
   * @author zyl
   * @type {string}
   */
edhr_template_id_: string,


}


/**
 *模型名称：edhr应用
 *模型KEY:em_edhr_usage_rule
 */
interface EdhrUsageRuleMethods extends IModelService<EdhrUsageRule> {
}
