import {CommonFields } from '../parent'

interface MaterialCheckUsageRule extends CommonFields {
  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 在线表单模版
   *
   * @author zyl
   * @type {string}
   */
online_form_tmpl_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 业务流
   *
   * @author zyl
   * @type {string}
   */
process_key_: string,


  /**
   * 类型
   *
   * @author zyl
   * @see {Zejelflu8n7m}
   * @type {string}
   */
f_type_8n7m: string,


}


/**
 *模型名称：来料检配置
 *模型KEY:em_material_check_usage_rule
 */
interface MaterialCheckUsageRuleMethods extends IModelService<MaterialCheckUsageRule> {
}
