import {CommonFields } from '../parent'

interface MaterialBill extends CommonFields {
  /**
   * 需求物料
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 需求数量
   *
   * @author zyl
   * @type {number}
   */
qty_required_: number,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


}


/**
 *模型名称：物料清单查询
 *模型KEY:em_material_bill
 */
interface MaterialBillMethods extends IModelService<MaterialBill> {
}
