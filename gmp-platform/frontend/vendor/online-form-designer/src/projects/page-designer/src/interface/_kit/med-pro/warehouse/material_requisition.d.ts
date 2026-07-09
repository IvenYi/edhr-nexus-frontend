import {CommonFields } from '../parent'

interface MaterialRequisition extends CommonFields {
  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 车间
   *
   * @author zyl
   * @see {Shopfloor}
   * @type {string}
   */
shopfloor_id_: string,


  /**
   * 领料状态
   *
   * @author zyl
   * @see {MaterialRequisitionReturnStatus}
   * @type {string}
   */
status_: string,


  /**
   * 领料人员
   *
   * @author zyl
   * @type {string}
   */
requisition_operator_: string,


  /**
   * 领料时间
   *
   * @author zyl
   * @type {Date}
   */
requisition_time_: Date,


  /**
   * 领料单号
   *
   * @author zyl
   * @type {string}
   */
requisition_number_: string,


  /**
   * 领料明细
   *
   * @author zyl
   * @see {MaterialRequisitionEntry}
   * @type {string}
   */
entries_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 供应商
   *
   * @author zyl
   * @see {Supplier}
   * @type {string}
   */
supplier_id_: string,


  /**
   * 仓库
   *
   * @author zyl
   * @see {Warehouse}
   * @type {string}
   */
warehouse_id_: string,


}


/**
 *模型名称：生产领料管理
 *模型KEY:em_material_requisition
 */
interface MaterialRequisitionMethods extends IModelService<MaterialRequisition> {
}
