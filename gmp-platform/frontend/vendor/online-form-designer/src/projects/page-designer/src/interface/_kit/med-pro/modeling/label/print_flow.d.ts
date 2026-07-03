import {CommonFields } from '../parent'

interface PrintFlow extends CommonFields {
  /**
   * 打印方式
   *
   * @author zyl
   * @see {PrintType}
   * @type {string}
   */
print_type_: string,


  /**
   * 打印数量
   *
   * @author zyl
   * @type {number}
   */
print_number_: number,


  /**
   * 事务
   *
   * @author zyl
   * @type {string}
   */
txn_key_: string,


  /**
   * 标签模板
   *
   * @author zyl
   * @see {LabelTemplate}
   * @type {string}
   */
label_template_id_: string,


  /**
   * 产品家族
   *
   * @author zyl
   * @see {ProductFamily}
   * @type {string}
   */
product_family_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


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


  /**
   * 打印状态
   *
   * @author zyl
   * @see {PrintStatus}
   * @type {string}
   */
print_status_: string,


  /**
   * 物料批次
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
material_container_id_: string,


  /**
   * 打印时间
   *
   * @author zyl
   * @type {Date}
   */
print_date_time_: Date,


  /**
   * 标签
   *
   * @author zyl
   * @type {string}
   */
label_id_: string,


}


/**
 *模型名称：打印流水
 *模型KEY:em_print_flow
 */
interface PrintFlowMethods extends IModelService<PrintFlow> {
}
