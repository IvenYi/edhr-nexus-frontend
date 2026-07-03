import {CommonFields } from '../parent'

interface MaterialOutboundAggregation extends CommonFields {
  /**
   * 出库数量
   *
   * @author zyl
   * @type {number}
   */
outbound_qty_: number,


  /**
   * 物料批次
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
container_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 度量单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
uom_id_: string,


  /**
   * 领料单详情
   *
   * @author zyl
   * @see {MaterialRequisitionEntry}
   * @type {string}
   */
requisition_entry_id_: string,


  /**
   * 领料单
   *
   * @author zyl
   * @see {MaterialRequisition}
   * @type {string}
   */
requisition_id_: string,


  /**
   * 需求数量
   *
   * @author zyl
   * @type {number}
   */
qty_require_: number,


}


/**
 *模型名称：物料出库汇总
 *模型KEY:em_material_outbound_aggregation
 */
interface MaterialOutboundAggregationMethods extends IModelService<MaterialOutboundAggregation> {
}
