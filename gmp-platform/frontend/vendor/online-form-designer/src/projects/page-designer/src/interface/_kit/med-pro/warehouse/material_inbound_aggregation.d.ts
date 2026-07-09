import {CommonFields } from '../parent'

interface MaterialInboundAggregation extends CommonFields {
  /**
   * 入库数量
   *
   * @author zyl
   * @type {number}
   */
inbound_qty_: number,


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
   * 仓库
   *
   * @author zyl
   * @see {Warehouse}
   * @type {string}
   */
warehouse_id_: string,


  /**
   * 首次入库时间
   *
   * @author zyl
   * @type {Date}
   */
first_inbound_time_: Date,


  /**
   * 有效日期
   *
   * @author zyl
   * @type {Date}
   */
expire_date_: Date,


}


/**
 *模型名称：物料入库信息汇总
 *模型KEY:em_material_inbound_aggregation
 */
interface MaterialInboundAggregationMethods extends IModelService<MaterialInboundAggregation> {
}
