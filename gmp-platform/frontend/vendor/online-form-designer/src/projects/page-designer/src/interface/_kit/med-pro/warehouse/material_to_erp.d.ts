import {CommonFields } from '../parent'

interface MaterialToErp extends CommonFields {
  /**
   * 退料单号
   *
   * @author zyl
   * @type {string}
   */
return_number_: string,


  /**
   * 发料单号
   *
   * @author zyl
   * @type {string}
   */
issuance_number_: string,


  /**
   * 生产批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 状态
   *
   * @author zyl
   * @see {MaterialRequisitionReturnStatus}
   * @type {string}
   */
status_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


  /**
   * 仓库
   *
   * @author zyl
   * @see {Warehouse}
   * @type {string}
   */
warehouse_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 退料明细
   *
   * @author zyl
   * @see {MaterialToErpEntry}
   * @type {string}
   */
entries_: string,


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
   * 物料批次
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
material_container_id_: string,


}


/**
 *模型名称：物料退料
 *模型KEY:em_material_to_erp
 */
interface MaterialToErpMethods extends IModelService<MaterialToErp> {
}
