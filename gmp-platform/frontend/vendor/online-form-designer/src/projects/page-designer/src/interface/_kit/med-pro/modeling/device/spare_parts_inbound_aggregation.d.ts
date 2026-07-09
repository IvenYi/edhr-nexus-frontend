import {CommonFields } from '../parent'

interface SparePartsInboundAggregation extends CommonFields {
  /**
   * 备品备件
   *
   * @author zyl
   * @see {SpareParts}
   * @type {string}
   */
spare_parts_id_: string,


  /**
   * 仓库
   *
   * @author zyl
   * @see {Warehouse}
   * @type {string}
   */
warehouse_id_: string,


  /**
   * 库区
   *
   * @author zyl
   * @see {StorageArea}
   * @type {string}
   */
storage_area_id_: string,


  /**
   * 库位
   *
   * @author zyl
   * @see {StorageLocation}
   * @type {string}
   */
storage_location_id_: string,


  /**
   * 库存数量
   *
   * @author zyl
   * @type {number}
   */
inventory_qty_: number,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：备品备件入库汇总
 *模型KEY:em_spare_parts_inbound_aggregation
 */
interface SparePartsInboundAggregationMethods extends IModelService<SparePartsInboundAggregation> {
}
