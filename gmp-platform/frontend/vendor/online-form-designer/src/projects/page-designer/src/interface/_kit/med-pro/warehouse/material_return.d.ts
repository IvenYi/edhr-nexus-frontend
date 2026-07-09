import {CommonFields } from '../parent'

interface MaterialReturn extends CommonFields {
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
   * 退料人员
   *
   * @author zyl
   * @type {string}
   */
return_operator_: string,


  /**
   * 退料时间
   *
   * @author zyl
   * @type {Date}
   */
return_time_: Date,


  /**
   * 单据状态
   *
   * @author zyl
   * @see {MaterialRequisitionReturnStatus}
   * @type {string}
   */
status_: string,


  /**
   * 退料明细
   *
   * @author zyl
   * @see {MaterialReturnEntry}
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
   * 仓库
   *
   * @author zyl
   * @see {Warehouse}
   * @type {string}
   */
warehouse_id_: string,


  /**
   * 领料单
   *
   * @author zyl
   * @see {MaterialRequisition}
   * @type {string}
   */
requisition_id_: string,


  /**
   * 退料单号
   *
   * @author zyl
   * @type {string}
   */
return_number_: string,


}


/**
 *模型名称：生产退料
 *模型KEY:em_material_return
 */
interface MaterialReturnMethods extends IModelService<MaterialReturn> {
}
