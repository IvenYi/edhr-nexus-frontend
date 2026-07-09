import {CommonFields } from '../parent'

interface LabelUsageRule extends CommonFields {
  /**
   * 打印数量
   *
   * @author zyl
   * @type {number}
   */
print_number_: number,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 打印方式
   *
   * @author zyl
   * @see {PrintType}
   * @type {string}
   */
print_type_: string,


  /**
   * 标签模板
   *
   * @author zyl
   * @see {LabelTemplate}
   * @type {string}
   */
label_template_id_: string,


  /**
   * 标签
   *
   * @author zyl
   * @type {string}
   */
label_id_: string,


  /**
   * 事务
   *
   * @author zyl
   * @type {string}
   */
txn_key_: string,


  /**
   * 产品家族
   *
   * @author zyl
   * @see {ProductFamily}
   * @type {string}
   */
product_family_id_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 打印服务
   *
   * @author zyl
   * @type {string}
   */
print_service_: string,


}


/**
 *模型名称：标签应用
 *模型KEY:em_label_usage_rule
 */
interface LabelUsageRuleMethods extends IModelService<LabelUsageRule> {
}
