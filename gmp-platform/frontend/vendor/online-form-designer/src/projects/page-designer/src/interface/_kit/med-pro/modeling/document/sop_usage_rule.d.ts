import {CommonFields ,NdoFields} from '../parent'

interface SopUsageRule extends   NdoFields,CommonFields {
  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 文档
   *
   * @author zyl
   * @see {Document}
   * @type {string}
   */
document_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_id_: string,


  /**
   * 产品家族
   *
   * @author zyl
   * @see {ProductFamily}
   * @type {string}
   */
product_family_id_: string,


  /**
   * 页码
   *
   * @author zyl
   * @type {number}
   */
page_number_: number,


}


/**
 *模型名称：SOP配置
 *模型KEY:em_sop_usage_rule
 */
interface SopUsageRuleMethods extends IModelService<SopUsageRule> {
}
